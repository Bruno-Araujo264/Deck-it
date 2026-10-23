def build_upsert(table, insert_cols, select_sql, update_cols, hash_col=None):
    """
    Monta INSERT ... SELECT ... ON DUPLICATE KEY UPDATE.

    Com hash_col: so altera a linha se o hash mudou (MySQL nao tem WHERE no upsert,
    entao cada coluna vira IF(hash_igual, valor_atual, valor_novo)). O hash e atribuido por
    ultimo porque o MySQL avalia as atribuicoes da esquerda para a direita.
    Sem hash_col: atualiza as colunas direto.

    As colunas que leem o valor atual sao qualificadas com o nome da tabela de destino,
    senao ficam ambiguas com as colunas da tabela de origem (stg_card).
    """
    cols = ", ".join(insert_cols)
    t = table
    if hash_col:
        same = f"{t}.{hash_col} = VALUES({hash_col})"
        parts = [f"{c} = IF({same}, {t}.{c}, VALUES({c}))" for c in update_cols]
        parts.append(f"_updated_at = IF({same}, {t}._updated_at, CURRENT_TIMESTAMP)")
        parts.append(f"{hash_col} = VALUES({hash_col})")
    else:
        parts = [f"{c} = VALUES({c})" for c in update_cols]
        parts.append("_updated_at = CURRENT_TIMESTAMP")
    return f"INSERT INTO {table} ({cols})\n{select_sql}\nON DUPLICATE KEY UPDATE\n  " + ",\n  ".join(parts)