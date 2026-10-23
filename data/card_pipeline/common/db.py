import re
from pathlib import Path

import pymysql
import pymysql.cursors

from .config import DB


def connect():
    return pymysql.connect(cursorclass=pymysql.cursors.DictCursor, **DB)


def run_sql_dir(conn, sql_dir: Path):
    """Executa os .sql em ordem (usado no --init-db)."""
    for path in sorted(sql_dir.glob("*.sql")):
        text = re.sub(r"--[^\n]*", "", path.read_text(encoding="utf-8"))
        with conn.cursor() as cur:
            for stmt in (s.strip() for s in text.split(";")):
                if stmt:
                    cur.execute(stmt)
        conn.commit()
        print(f"[init-db] {path.name} ok")
