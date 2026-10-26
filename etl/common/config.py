import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

RAW_DIR = Path(os.getenv("RAW_DIR", "./data/raw"))
USER_AGENT = os.getenv("USER_AGENT", "CardCollectionPipeline/0.1 (contato: voce@exemplo.com)")

DB = dict(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    port=int(os.getenv("DB_PORT", "3306")),
    user=os.getenv("DB_USER", "pipeline"),
    password=os.getenv("DB_PASSWORD", ""),
    charset="utf8mb4",
    autocommit=False,
)
