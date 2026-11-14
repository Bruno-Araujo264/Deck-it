import gzip
import hashlib
import json

from common.bronze_loader import reload_batches

TABLE = "bronze.tcgdex_cards"


def _flat(card: dict) -> dict:
    """Colunas escalares da bronze. Os nomes seguem a API; os aninhados vao em JSON."""
    s = card.get("set") or {}
    return {
        "id": card.get("id"),
        "local_id": card.get("localId"),
        "name": card.get("name"),
        "category": card.get("category"),
        "rarity": card.get("rarity"),
        "illustrator": card.get("illustrator"),
        "hp": card.get("hp"),
        "stage": card.get("stage"),
        "evolve_from": card.get("evolveFrom"),
        "description": card.get("description"),
        "effect": card.get("effect"),
        "retreat": card.get("retreat"),
        "regulation_mark": card.get("regulationMark"),
        "image": card.get("image"),
        "updated": card.get("updated"),
        "set_id": s.get("id"),
        "set_name": s.get("name"),
        "set_code": (s.get("abbreviation") or {}).get("official") or s.get("tcgOnline"),
        "release_date": s.get("releaseDate"),
        "serie_id": (s.get("serie") or {}).get("id"),
    }


SCALARS = list(_flat({}).keys())
JSONS = ["types", "attacks", "abilities", "weaknesses", "variants", "legal", "pricing"]
COLUMNS = ["_load_id", "_source_file", "_row_hash"] + SCALARS + JSONS + ["payload"]


def _dump(v):
    return None if v is None else json.dumps(v, ensure_ascii=False)


def _existing(conn) -> set:
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, _row_hash FROM {TABLE}")
        return {(r["id"], r["_row_hash"]) for r in cur.fetchall()}


def _cards(path):
    with gzip.open(path, "rt", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                yield json.loads(line)


def _rows(path, load_id, skip: set):
    for card in _cards(path):
        payload = json.dumps(card, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        h = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        if (card["id"], h) in skip:
            continue  # incremental: carta identica a uma versao ja existente na bronze
        flat = _flat(card)
        yield (
            [load_id, path, h]
            + [flat[c] for c in SCALARS]
            + [_dump(card.get(c)) for c in JSONS]
            + [payload]
        )


def load_bronze(conn, load_id: str, load_type: str, raw_path: str) -> int:
    skip = _existing(conn) if load_type == "incremental" else set()
    return reload_batches(conn, TABLE, COLUMNS, _rows(raw_path, load_id, skip), load_id)
