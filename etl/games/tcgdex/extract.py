"""
Extracao do Pokemon TCG via TCGdex (https://tcgdex.dev) - API aberta, gratuita e sem chave.

A Pokemon TCG API (pokemontcg.io) foi descontinuada e sai do ar em 01/03/2027,
por isso usamos o TCGdex. O catalogo e em ingles: em pt-br o TCGdex so cobre o
Pokemon TCG Pocket (jogo de celular), nao as cartas fisicas.

Nao existe arquivo bulk: buscamos a lista de colecoes, os detalhes de cada colecao
e depois os detalhes de cada carta (em paralelo).

Variaveis opcionais no .env:
  TCGDEX_WORKERS=8          requisicoes simultaneas
  TCGDEX_SERIES=sv,me,swsh  so baixa essas series (bom para testar rapido). Vazio = todas.
"""
import gzip
import json
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from common.http import get_json
from common.log import log
from common.raw_writer import raw_dir, write_manifest

API = "https://api.tcgdex.net/v2/en"
GAME = "pokemon"
WORKERS = int(os.getenv("TCGDEX_WORKERS", "8"))
SERIES = {s.strip() for s in os.getenv("TCGDEX_SERIES", "").split(",") if s.strip()}
MAX_FAILED_RATIO = 0.02  # tolera poucas cartas com erro na API; acima disso aborta a carga

SET_FIELDS = ("id", "name", "releaseDate", "serie", "abbreviation", "tcgOnline", "cardCount")


def get_remote_version():
    """O TCGdex nao publica versao do catalogo. Usamos a data (UTC): no maximo uma carga por dia,
    o que tambem mantem o historico de precos diario."""
    version = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return version, {"version": version}


def _card(card_id: str):
    try:
        return get_json(f"{API}/cards/{card_id}", pause=0.05)
    except Exception as e:  # uma carta quebrada na API nao derruba a carga inteira
        log.warning("tcgdex: falha ao baixar carta %s: %s", card_id, e)
        return None


def extract(load_id: str, load_type: str, meta: dict) -> str:
    """Salva cada carta (JSON completo + dados da colecao) em JSON Lines .gz. Retorna o caminho."""
    sets = get_json(f"{API}/sets")
    log.info("tcgdex: %s colecoes encontradas", len(sets))

    with ThreadPoolExecutor(WORKERS) as ex:
        details = list(ex.map(lambda s: get_json(f"{API}/sets/{s['id']}", pause=0.05), sets))

    if SERIES:
        details = [d for d in details if (d.get("serie") or {}).get("id") in SERIES]
        log.info("tcgdex: filtrando series %s -> %s colecoes", sorted(SERIES), len(details))

    card_ids, set_of = [], {}
    for d in details:
        info = {k: d.get(k) for k in SET_FIELDS}
        for c in d.get("cards") or []:
            card_ids.append(c["id"])
            set_of[c["id"]] = info
    log.info("tcgdex: baixando %s cartas com %s requisicoes simultaneas", f"{len(card_ids):,}", WORKERS)

    out_dir = raw_dir(GAME, load_type, load_id)
    dest = out_dir / "cards.jsonl.gz"
    tmp = out_dir / "cards.jsonl.gz.part"
    ok = failed = 0
    with gzip.open(tmp, "wt", encoding="utf-8") as out, ThreadPoolExecutor(WORKERS) as ex:
        for card_id, card in zip(card_ids, ex.map(_card, card_ids)):
            if not card:
                failed += 1
                continue
            card["set"] = {**(card.get("set") or {}), **set_of[card_id]}
            out.write(json.dumps(card, ensure_ascii=False) + "\n")
            ok += 1
            if ok % 2000 == 0:
                log.info("tcgdex: %s/%s cartas baixadas", f"{ok:,}", f"{len(card_ids):,}")

    if card_ids and failed / len(card_ids) > MAX_FAILED_RATIO:
        raise RuntimeError(f"tcgdex: {failed} de {len(card_ids)} cartas falharam, carga abortada")
    os.replace(tmp, dest)
    log.info("tcgdex: %s cartas salvas (%s falharam)", f"{ok:,}", failed)

    write_manifest(
        out_dir,
        load_id=load_id,
        game=GAME,
        load_type=load_type,
        source_url=API,
        source_version=meta["version"],
        series_filter=sorted(SERIES) or None,
        cards_ok=ok,
        cards_failed=failed,
    )
    return str(dest)
