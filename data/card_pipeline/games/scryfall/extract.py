from common.http import download_gz, get_json
from common.raw_writer import raw_dir, write_manifest

BULK_URL = "https://api.scryfall.com/bulk-data"
BULK_TYPE = "default_cards"  # uma impressao por carta
GAME = "mtg"


def get_remote_version():
    """Retorna (versao, meta). A versao e o updated_at do bulk: se nao mudou, nao ha o que baixar."""
    data = get_json(BULK_URL)["data"]
    item = next(i for i in data if i["type"] == BULK_TYPE)
    return item["updated_at"], item


def _download_uri(meta: dict) -> str:
    # a API atual usa jsonl_download_uri; download_uri e o formato antigo
    uri = meta.get("jsonl_download_uri") or meta.get("download_uri")
    if not uri and meta.get("uri"):
        detail = get_json(meta["uri"])
        uri = detail.get("jsonl_download_uri") or detail.get("download_uri")
    if not uri:
        raise RuntimeError(f"Scryfall nao devolveu URL de download. Campos recebidos: {sorted(meta)}")
    return uri


def extract(load_id: str, load_type: str, meta: dict) -> str:
    """Salva a resposta da API como veio (.gz) + manifest. Retorna o caminho do arquivo raw."""
    url = _download_uri(meta)
    d = raw_dir(GAME, load_type, load_id)
    dest = d / "default-cards.jsonl.gz"
    download_gz(url, dest)
    write_manifest(
        d,
        load_id=load_id,
        game=GAME,
        load_type=load_type,
        source_url=url,
        source_version=meta["updated_at"],
        bulk_type=BULK_TYPE,
        reported_size=meta.get("size") or meta.get("compressed_size"),
    )
    return str(dest)