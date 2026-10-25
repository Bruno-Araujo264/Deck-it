"""Controle das cargas (ops.sync_log): decide full vs incremental e permite retomar."""

PENDING = ("extracted", "bronze_loaded")


def start(conn, game, load_id, load_type, source_version):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO ops.sync_log (load_id, game, load_type, source_version) VALUES (%s,%s,%s,%s)",
            (load_id, game, load_type, source_version),
        )
    conn.commit()


def update(conn, load_id, commit=True, **fields):
    sets = ", ".join(f"{k}=%s" for k in fields)
    with conn.cursor() as cur:
        cur.execute(f"UPDATE ops.sync_log SET {sets} WHERE load_id=%s", (*fields.values(), load_id))
    if commit:
        conn.commit()


def pending(conn, game):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM ops.sync_log WHERE game=%s AND status IN ('extracted','bronze_loaded') ORDER BY started_at",
            (game,),
        )
        return cur.fetchall()


def last_done(conn, game):
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM ops.sync_log WHERE game=%s AND status='done' ORDER BY started_at DESC LIMIT 1",
            (game,),
        )
        return cur.fetchone()


def has_full(conn, game) -> bool:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM ops.sync_log WHERE game=%s AND load_type='full' AND status='done' LIMIT 1", (game,)
        )
        return cur.fetchone() is not None
