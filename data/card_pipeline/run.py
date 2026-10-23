"""
Uso:
  python run.py --init-db                 # cria bancos e tabelas
  python run.py --game mtg                # full na primeira vez, incremental depois
  python run.py --game all --mode full    # forca nova carga full
"""
import argparse
import time
from datetime import datetime, timezone
from pathlib import Path

from common import sync_log
from common.db import connect, run_sql_dir
from common.log import log, setup
from games import scryfall

GAMES = {"mtg": scryfall}  # ygo e pokemon entram aqui quando existirem


def process(conn, mod, row):
    """Continua uma carga de onde parou: extracted -> bronze_loaded -> done."""
    load_id = row["load_id"]
    if row["status"] == "extracted":
        log.info("[%s] etapa 2/3: bronze", load_id)
        n = mod.load_bronze(conn, load_id, row["load_type"], row["raw_path"])
        sync_log.update(conn, load_id, status="bronze_loaded", records_bronze=n)
        row["status"] = "bronze_loaded"
    if row["status"] == "bronze_loaded":
        log.info("[%s] etapa 3/3: silver", load_id)
        try:
            mod.transform_silver(conn, load_id, row["source_version"][:10])
            sync_log.update(conn, load_id, commit=False, status="done", error_message=None)
            conn.commit()  # silver + sync_log na mesma transacao
        except Exception:
            conn.rollback()
            raise
        log.info("[%s] carga concluida", load_id)


def run_game(game, mod, force_full=False):
    t_start = time.time()
    conn = connect()
    try:
        for row in sync_log.pending(conn, game):  # 1) retoma cargas interrompidas
            log.warning("[%s] retomando carga interrompida (status=%s)", row["load_id"], row["status"])
            try:
                process(conn, mod, row)
            except Exception as e:
                sync_log.update(conn, row["load_id"], error_message=str(e)[:2000])
                raise

        log.info("[%s] consultando versao na fonte", game)
        version, meta = mod.get_remote_version()  # 2) ha versao nova na fonte?
        last = sync_log.last_done(conn, game)
        if last and last["source_version"] == version and not force_full:
            log.info("[%s] sem mudancas (versao %s), nada a fazer", game, version)
            return

        load_type = "full" if force_full or not sync_log.has_full(conn, game) else "incremental"
        load_id = f"{game}-{datetime.now(timezone.utc):%Y%m%dT%H%M%S}"
        sync_log.start(conn, game, load_id, load_type, version)
        log.info("[%s] nova carga %s, versao %s", load_id, load_type.upper(), version)
        log.info("[%s] etapa 1/3: extracao (raw)", load_id)
        try:
            raw_path = mod.extract(load_id, load_type, meta)
        except Exception as e:
            sync_log.update(conn, load_id, status="failed", error_message=str(e)[:2000])
            raise
        sync_log.update(conn, load_id, status="extracted", raw_path=raw_path)
        log.info("[%s] raw salvo em %s", load_id, raw_path)
        row = {"load_id": load_id, "load_type": load_type, "raw_path": raw_path,
               "source_version": version, "status": "extracted"}
        try:
            process(conn, mod, row)
        except Exception as e:
            sync_log.update(conn, load_id, error_message=str(e)[:2000])  # status fica, retoma na proxima
            raise
    finally:
        conn.close()
        log.info("[%s] tempo total: %.0fs", game, time.time() - t_start)


def main():
    setup()
    ap = argparse.ArgumentParser()
    ap.add_argument("--game", choices=[*GAMES, "all"])
    ap.add_argument("--mode", choices=["auto", "full"], default="auto")
    ap.add_argument("--init-db", action="store_true")
    args = ap.parse_args()

    if args.init_db:
        conn = connect()
        run_sql_dir(conn, Path(__file__).parent / "sql")
        conn.close()
        return
    if not args.game:
        ap.error("informe --game ou --init-db")

    failed = []
    for game in (GAMES if args.game == "all" else [args.game]):
        try:
            run_game(game, GAMES[game], force_full=args.mode == "full")
        except Exception:
            log.exception("[%s] FALHOU", game)  # a falha de um jogo nao para os outros
            failed.append(game)
    if failed:
        raise SystemExit(f"falhou: {', '.join(failed)}")


if __name__ == "__main__":
    main()