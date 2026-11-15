import time

from common.log import log
from common.upsert import build_upsert

G = "pokemon"

# 1) Ultima versao de cada carta dentro da carga
STG = """
CREATE TEMPORARY TABLE stg_card AS
SELECT b.id, b.local_id, b.name, b.category, b.rarity, b.illustrator, b.hp, b.stage, b.evolve_from,
       b.description, b.effect, b.retreat, b.regulation_mark, b.image, b.set_id, b.set_name, b.set_code,
       b.release_date, b.serie_id, b.types, b.attacks, b.abilities, b.weaknesses, b.variants, b.legal,
       b.pricing
FROM bronze.tcgdex_cards b
JOIN (SELECT id, MAX(_row_id) AS _row_id
      FROM bronze.tcgdex_cards
      WHERE _load_id = %s
      GROUP BY id) m ON m._row_id = b._row_id
"""

# 2) Modelo unificado entre jogos. Especifico do Pokemon vai em attributes (JSON).
#    - collector_number sem zeros a esquerda ("025" -> "25"), igual ao que o scanner le da carta.
#    - set_code e o codigo impresso na carta (ex.: SVI), em minusculas como no Magic.
#    - imagens: o TCGdex devolve a URL base; qualidade e extensao vao no fim.
STG_OUT = """
CREATE TEMPORARY TABLE stg_out AS
SELECT s.id, s.name, 'en' AS lang,
       NULLIF(s.release_date, '') AS released_at,
       NULLIF(NULLIF(s.rarity, ''), 'None') AS rarity,
       LOWER(NULLIF(s.set_code, '')) AS set_code,
       s.set_name,
       IF(s.local_id REGEXP '^[0-9]+$', CAST(CAST(s.local_id AS UNSIGNED) AS CHAR), s.local_id) AS collector_number,
       CONCAT_WS(' - ', s.category, NULLIF(s.stage, '')) AS card_type,
       COALESCE(NULLIF(s.effect, ''), NULLIF(s.description, '')) AS card_text,
       CONCAT(s.image, '/low.png')  AS image_small,
       CONCAT(s.image, '/high.png') AS image_normal,
       CONCAT(s.image, '/high.png') AS image_large,
       CAST(NULL AS JSON) AS faces,
       JSON_OBJECT('local_id', s.local_id,
                   'set_id', s.set_id,
                   'serie_id', s.serie_id,
                   'category', s.category,
                   'hp', s.hp,
                   'types', s.types,
                   'stage', s.stage,
                   'evolve_from', s.evolve_from,
                   'retreat', s.retreat,
                   'regulation_mark', s.regulation_mark,
                   'illustrator', s.illustrator,
                   'attacks', s.attacks,
                   'abilities', s.abilities,
                   'weaknesses', s.weaknesses,
                   'variants', s.variants,
                   'legal', s.legal) AS attributes
FROM stg_card s
"""

CARD_COLS = ["name", "lang", "released_at", "rarity", "set_code", "set_name", "collector_number",
             "card_type", "card_text", "image_small", "image_normal", "image_large", "faces", "attributes"]

UPSERT_CARD = build_upsert(
    "silver.card",
    ["game", "external_id"] + CARD_COLS + ["row_hash", "_load_id"],
    """SELECT %s, id, name, lang, CAST(released_at AS DATE), rarity, set_code, set_name, collector_number,
       card_type, card_text, image_small, image_normal, image_large, faces, attributes,
       SHA2(CONCAT_WS('|', name, lang, released_at, rarity, set_code, set_name, collector_number,
                      card_type, card_text, image_small, image_normal, image_large,
                      CAST(faces AS CHAR), CAST(attributes AS CHAR)), 256),
       %s
FROM stg_out""",
    CARD_COLS + ["_load_id"],
    hash_col="row_hash",
)

# Tipo de preco -> caminho no JSON `pricing` do TCGdex (TCGplayer em USD, Cardmarket em EUR)
PRICE_PATHS = [
    ("usd", '$.tcgplayer.normal.marketPrice'),
    ("usd_holo", '$.tcgplayer.holofoil.marketPrice'),
    ("usd_reverse", '$.tcgplayer."reverse-holofoil".marketPrice'),
    ("eur", '$.cardmarket.trend'),
    ("eur_holo", '$.cardmarket."trend-holo"'),
]
PRICE_TYPES = " UNION ALL ".join(f"SELECT '{t}' AS price_type, '{p}' AS path" for t, p in PRICE_PATHS)

# Historico de preco: nunca atualiza (update no-op = DO NOTHING)
INSERT_PRICE = """
INSERT INTO silver.card_price (game, external_id, price_date, price_type, price, _load_id)
SELECT %s, s.id, %s, t.price_type, CAST(JSON_EXTRACT(s.pricing, t.path) AS DECIMAL(10,2)), %s
FROM stg_card s CROSS JOIN (""" + PRICE_TYPES + """) t
WHERE s.pricing IS NOT NULL
  AND JSON_TYPE(JSON_EXTRACT(s.pricing, t.path)) IN ('INTEGER', 'DOUBLE', 'DECIMAL')
ON DUPLICATE KEY UPDATE price = price
"""


def transform_silver(conn, load_id: str, price_date: str) -> None:
    """Bronze (uma _load_id) -> silver. NAO faz commit: quem chama commita junto com o sync_log."""
    with conn.cursor() as cur:
        cur.execute("USE silver")  # tabela temporaria precisa de um banco padrao
        cur.execute("DROP TEMPORARY TABLE IF EXISTS stg_card")
        cur.execute("DROP TEMPORARY TABLE IF EXISTS stg_out")

        t0 = time.time()
        cur.execute(STG, (load_id,))
        log.info("silver: staging com %s cartas deduplicadas (%.0fs)", f"{cur.rowcount:,}", time.time() - t0)

        t0 = time.time()
        cur.execute(STG_OUT)
        log.info("silver: tratamento aplicado (%.0fs)", time.time() - t0)

        for name, sql, params in [
            ("card", UPSERT_CARD, (G, load_id)),
            ("card_price", INSERT_PRICE, (G, price_date, load_id)),
        ]:
            t0 = time.time()
            cur.execute(sql, params)
            log.info("silver: %-12s %s linhas afetadas (%.1fs)", name, f"{cur.rowcount:,}", time.time() - t0)

        cur.execute("DROP TEMPORARY TABLE IF EXISTS stg_card")
        cur.execute("DROP TEMPORARY TABLE IF EXISTS stg_out")
