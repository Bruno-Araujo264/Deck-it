import gzip
import time
import os
import requests

from .log import log
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from .config import USER_AGENT


def _build_session() -> requests.Session:
    s = requests.Session()
    retry = Retry(
        total=5,
        backoff_factor=1.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
        respect_retry_after_header=True,
    )
    s.mount("https://", HTTPAdapter(max_retries=retry))
    s.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json;q=0.9,*/*;q=0.8"})
    return s


SESSION = _build_session()


def get_json(url: str, params: dict | None = None, pause: float = 0.1):
    time.sleep(pause)  # respeita rate limit
    r = SESSION.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def download_gz(url: str, dest, chunk: int = 1 << 20) -> None:
    """Baixa o arquivo como a API entrega. Se ja vier em gzip, guarda como esta; senao, comprime."""
    tmp = str(dest) + ".part"
    t0, done, next_log = time.time(), 0, 50 << 20
    with SESSION.get(url, stream=True, timeout=(10, 120)) as r:
        r.raise_for_status()
        total = int(r.headers.get("Content-Length", 0))
        log.info("download iniciado (%s)", f"{total / 1e6:.0f} MB" if total else "tamanho desconhecido")
        with open(tmp, "wb") as out:
            for part in r.iter_content(chunk):
                out.write(part)
                done += len(part)
                if done >= next_log:
                    log.info("download: %.0f MB (%.0fs)", done / 1e6, time.time() - t0)
                    next_log += 50 << 20
    with open(tmp, "rb") as f:
        is_gzip = f.read(2) == b"\x1f\x8b"
    if is_gzip:
        os.replace(tmp, dest)
    else:
        with open(tmp, "rb") as src, gzip.open(dest, "wb", compresslevel=6) as out:
            for block in iter(lambda: src.read(chunk), b""):
                out.write(block)
        os.remove(tmp)
    log.info("download concluido: %.0f MB em %.0fs", done / 1e6, time.time() - t0)