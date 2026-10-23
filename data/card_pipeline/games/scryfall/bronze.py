import gzip
import hashlib
import json

import ijson

from common.bronze_loader import reload_batches

TABLE = "bronze.scryfall_cards"
SCALARS = ["id", "oracle_id", "name", "lang", "released_at", "layout", "mana_cost", "cmc",
           "type_line", "oracle_text", "set", "set_name", "collector_number", "rarity"]
JSONS = ["colors", "color_identity", "keywords", "card_faces", "image_uris", "legalities", "prices"]
COLUMNS = ["_load_id", "_source_file", "_row_hash"] + SCALARS + JSONS + ["payload"]


def _dump(v):
    return None if v is None else json.dumps(v, ensure_ascii=False)


def _existing(conn) -> set:
    with conn.cursor() as cur:
        cur.execute(f"SELECT id, _row_hash FROM {TABLE}")
        return {(r["id"], r["_row_hash"]) for r in cur.fetchall()}


def _cards(path):
    """Le o arquivo raw, seja JSON array ou JSON Lines, comprimido ou nao."""
    with open(path, "rb") as f:
        is_gzip = f.read(2) == b"\x1f\x8b"
    with (gzip.open(path, "rb") if is_gzip else open(path, "rb")) as f:
        first = f.read(64).lstrip()[:1]
        f.seek(0)
        if first == b"[":
            yield from ijson.items(f, "item", use_float=True)
        else:
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
        yield (
            [load_id, path, h]
            + [card.get(c) for c in SCALARS]
            + [_dump(card.get(c)) for c in JSONS]
            + [payload]
        )


def load_bronze(conn, load_id: str, load_type: str, raw_path: str) -> int:
    skip = _existing(conn) if load_type == "incremental" else set()
    return reload_batches(conn, TABLE, COLUMNS, _rows(raw_path, load_id, skip), load_id)