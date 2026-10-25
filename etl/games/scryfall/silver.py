import time

from common.log import log
from common.upsert import build_upsert

G = "mtg"

# 1) Ultima versao de cada carta dentro da carga (colunas curtas primeiro, depois as largas)
STG = """
CREATE TEMPORARY TABLE stg_card AS
SELECT b.id, b.oracle_id, b.name, b.lang, b.released_at, b.layout, b.mana_cost, b.cmc,
       b.type_line, b.oracle_text, b.colors, b.color_identity, b.keywords, b.card_faces,
       b.image_uris, b.prices, b.`set` AS set_code, b.set_name, b.collector_number, b.rarity
FROM bronze.scryfall_cards b
JOIN (SELECT id, MAX(_row_id) AS _row_id
      FROM bronze.scryfall_cards
      WHERE _load_id = %s
      GROUP BY id) m ON m._row_id = b._row_id
"""

# 2) Tratamento: modelo unificado entre jogos. Especifico do Magic vai em attributes (JSON).
#    Cartas de duas faces nao tem type_line/oracle_text/imagem no topo: usa os dados das faces.
STG_OUT = """
CREATE TEMPORARY TABLE stg_out AS
SELECT s.id, s.name, s.lang,
       NULLIF(s.released_at, '') AS released_at,
       s.rarity, s.set_code, s.set_name, s.collector_number,
        COALESCE(NULLIF(s.type_line, ''),
                NULLIF(CONCAT_WS(' // ',
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[0].type_line')), ''),
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[1].type_line')), '')), '')) AS card_type,
       COALESCE(NULLIF(s.oracle_text, ''),
                NULLIF(CONCAT_WS(' // ',
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[0].oracle_text')), ''),
                    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[1].oracle_text')), '')), '')) AS card_text,
       COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.image_uris, '$.small')),
                JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[0].image_uris.small'))) AS image_small,
       COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.image_uris, '$.normal')),
                JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[0].image_uris.normal'))) AS image_normal,
       COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.image_uris, '$.large')),
                JSON_UNQUOTE(JSON_EXTRACT(s.card_faces, '$[0].image_uris.large'))) AS image_large,
       s.card_faces AS faces,
       JSON_OBJECT('oracle_id', s.oracle_id,
                   'layout', s.layout,
                   'mana_cost', NULLIF(s.mana_cost, ''),
                   'cmc', s.cmc,
                   'colors', s.colors,
                   'color_identity', s.color_identity,
                   'keywords', s.keywords) AS attributes
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

PRICE_TYPES = ("SELECT 'usd' AS price_type UNION ALL SELECT 'usd_foil' UNION ALL SELECT 'usd_etched' "
               "UNION ALL SELECT 'eur' UNION ALL SELECT 'eur_foil' UNION ALL SELECT 'tix'")

# Historico de preco: nunca atualiza (update no-op = DO NOTHING)
INSERT_PRICE = """
INSERT INTO silver.card_price (game, external_id, price_date, price_type, price, _load_id)
SELECT %s, s.id, %s, t.price_type,
       CAST(JSON_UNQUOTE(JSON_EXTRACT(s.prices, CONCAT('$.', t.price_type))) AS DECIMAL(10,2)), %s
FROM stg_card s CROSS JOIN (""" + PRICE_TYPES + """) t
WHERE s.prices IS NOT NULL
  AND JSON_TYPE(JSON_EXTRACT(s.prices, CONCAT('$.', t.price_type))) = 'STRING'
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