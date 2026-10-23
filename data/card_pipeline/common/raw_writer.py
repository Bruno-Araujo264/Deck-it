import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from .config import RAW_DIR


def raw_dir(game: str, load_type: str, load_id: str) -> Path:
    dt = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    d = RAW_DIR / f"game={game}" / f"load_type={load_type}" / f"dt={dt}" / load_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def write_manifest(d: Path, **info) -> None:
    files = [
        {"name": p.name, "bytes": p.stat().st_size, "sha256": sha256_file(p)}
        for p in sorted(d.iterdir())
        if p.is_file() and p.name != "_manifest.json"
    ]
    manifest = {"written_at": datetime.now(timezone.utc).isoformat(), "files": files, **info}
    (d / "_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
