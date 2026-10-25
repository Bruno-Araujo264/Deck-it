import time

from .log import log


def reload_batches(conn, table, columns, rows, load_id, batch_size=500, log_every=10_000) -> int:
    """Carga idempotente na bronze: apaga o que ja existe desse load_id e insere de novo, em uma transacao."""
    cols = ", ".join(f"`{c}`" for c in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    sql = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
    total, buf, t0, next_log = 0, [], time.time(), log_every
    try:
        with conn.cursor() as cur:
            cur.execute(f"DELETE FROM {table} WHERE _load_id=%s", (load_id,))
            for row in rows:
                buf.append(row)
                if len(buf) >= batch_size:
                    cur.executemany(sql, buf)
                    total += len(buf)
                    buf = []
                    if total >= next_log:
                        log.info("bronze: %s linhas inseridas (%.0fs)", f"{total:,}", time.time() - t0)
                        next_log += log_every
            if buf:
                cur.executemany(sql, buf)
                total += len(buf)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    log.info("bronze: %s linhas inseridas no total (%.0fs)", f"{total:,}", time.time() - t0)
    return total