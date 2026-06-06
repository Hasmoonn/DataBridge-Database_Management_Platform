import logging
from app.connections.models import DatabaseConnection
from app.connections.service import get_connection_params

logger = logging.getLogger(__name__)


def _pg_conn(params: dict):
    import psycopg2
    kwargs = {
        "host": params["host"],
        "port": params["port"],
        "dbname": params["database"],
        "user": params["user"],
        "password": params["password"],
        "connect_timeout": 15,
    }
    if params.get("use_ssl"):
        kwargs["sslmode"] = "require"
    return psycopg2.connect(**kwargs)


def _mysql_conn(params: dict):
    import mysql.connector
    return mysql.connector.connect(
        host=params["host"],
        port=params["port"],
        database=params["database"],
        user=params["user"],
        password=params["password"],
        connection_timeout=15,
        ssl_disabled=not params.get("use_ssl", False),
    )


def get_schemas(conn: DatabaseConnection) -> list:
    params = get_connection_params(conn)
    try:
        if conn.db_type == "postgresql":
            return _pg_get_schemas(params)
        elif conn.db_type == "mysql":
            return _mysql_get_schemas(params)
    except Exception as e:
        logger.error(f"Error getting schemas: {e}")
        raise


def _pg_get_schemas(params: dict) -> list:
    query = """
        SELECT schema_name FROM information_schema.schemata
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schema_name;
    """
    db = _pg_conn(params)
    cursor = db.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return [{"schema_name": row[0]} for row in rows]


def _mysql_get_schemas(params: dict) -> list:
    db = _mysql_conn(params)
    cursor = db.cursor()
    cursor.execute("SHOW DATABASES;")
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    excluded = {"information_schema", "performance_schema", "mysql", "sys"}
    return [{"schema_name": row[0]} for row in rows if row[0] not in excluded]


def get_tables(conn: DatabaseConnection, schema: str) -> list:
    params = get_connection_params(conn)
    try:
        if conn.db_type == "postgresql":
            return _pg_get_tables(params, schema)
        elif conn.db_type == "mysql":
            return _mysql_get_tables(params, schema)
    except Exception as e:
        logger.error(f"Error getting tables: {e}")
        raise


def _pg_get_tables(params: dict, schema: str) -> list:
    query = """
        SELECT
            table_name, table_type,
            (SELECT reltuples::bigint FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE c.relname = t.table_name AND n.nspname = t.table_schema) AS estimated_rows
        FROM information_schema.tables t
        WHERE table_schema = %s
        ORDER BY table_type, table_name;
    """
    db = _pg_conn(params)
    cursor = db.cursor()
    cursor.execute(query, (schema,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return [{"table_name": r[0], "table_type": r[1], "estimated_rows": r[2] or 0} for r in rows]


def _mysql_get_tables(params: dict, schema: str) -> list:
    db = _mysql_conn(params)
    cursor = db.cursor()
    cursor.execute("""
        SELECT TABLE_NAME, TABLE_TYPE, TABLE_ROWS
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = %s ORDER BY TABLE_TYPE, TABLE_NAME;
    """, (schema,))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return [{"table_name": r[0], "table_type": r[1], "estimated_rows": r[2] or 0} for r in rows]


def get_columns(conn: DatabaseConnection, schema: str, table: str) -> list:
    params = get_connection_params(conn)
    try:
        if conn.db_type == "postgresql":
            return _pg_get_columns(params, schema, table)
        elif conn.db_type == "mysql":
            return _mysql_get_columns(params, schema, table)
    except Exception as e:
        logger.error(f"Error getting columns: {e}")
        raise


def _pg_get_columns(params: dict, schema: str, table: str) -> list:
    query = """
        SELECT column_name, data_type, is_nullable,
               column_default, character_maximum_length,
               numeric_precision, numeric_scale
        FROM information_schema.columns
        WHERE table_schema = %s AND table_name = %s
        ORDER BY ordinal_position;
    """
    db = _pg_conn(params)
    cursor = db.cursor()
    cursor.execute(query, (schema, table))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return [
        {
            "column_name": r[0], "data_type": r[1],
            "is_nullable": r[2] == "YES", "default_value": r[3],
            "max_length": r[4], "numeric_precision": r[5], "numeric_scale": r[6],
        }
        for r in rows
    ]


def _mysql_get_columns(params: dict, schema: str, table: str) -> list:
    db = _mysql_conn(params)
    cursor = db.cursor()
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE,
               COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH,
               NUMERIC_PRECISION, NUMERIC_SCALE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
        ORDER BY ORDINAL_POSITION;
    """, (schema, table))
    rows = cursor.fetchall()
    cursor.close()
    db.close()
    return [
        {
            "column_name": r[0], "data_type": r[1],
            "is_nullable": r[2] == "YES", "default_value": r[3],
            "max_length": r[4], "numeric_precision": r[5], "numeric_scale": r[6],
        }
        for r in rows
    ]


def preview_data(
    conn: DatabaseConnection,
    schema: str,
    table: str,
    limit: int = 100,
    offset: int = 0,
    filters: dict = None,
    columns: list = None,
) -> dict:
    params = get_connection_params(conn)
    limit = min(limit, 500)

    try:
        if conn.db_type == "postgresql":
            return _pg_preview(params, schema, table, limit, offset, filters, columns)
        elif conn.db_type == "mysql":
            return _mysql_preview(params, schema, table, limit, offset, filters, columns)
    except Exception as e:
        logger.error(f"Preview error: {e}")
        raise


def _safe_col(col: str) -> bool:
    return col.replace("_", "").replace(" ", "").isalnum()


def _build_where(filters: dict, db_type: str) -> tuple:
    if not filters:
        return "", []
    parts, params = [], []
    quote = '"' if db_type == "postgresql" else "`"
    for col, val in filters.items():
        if _safe_col(col):
            parts.append(f"{quote}{col}{quote} = %s")
            params.append(val)
    if parts:
        return f"WHERE {' AND '.join(parts)}", params
    return "", []


def _pg_preview(params, schema, table, limit, offset, filters, columns) -> dict:
    where, where_params = _build_where(filters or {}, "postgresql")

    if columns:
        col_select = ", ".join(f'"{c}"' for c in columns if _safe_col(c)) or "*"
    else:
        col_select = "*"

    count_q = f'SELECT COUNT(*) FROM "{schema}"."{table}" {where}'
    data_q = f'SELECT {col_select} FROM "{schema}"."{table}" {where} LIMIT %s OFFSET %s'

    db = _pg_conn(params)
    cursor = db.cursor()
    cursor.execute(count_q, where_params)
    total = cursor.fetchone()[0]
    cursor.execute(data_q, where_params + [limit, offset])
    rows = cursor.fetchall()
    col_names = [d[0] for d in cursor.description]
    cursor.close()
    db.close()

    return {
        "columns": col_names,
        "rows": [list(r) for r in rows],
        "total_count": total,
        "limit": limit,
        "offset": offset,
    }


def _mysql_preview(params, schema, table, limit, offset, filters, columns) -> dict:
    where, where_params = _build_where(filters or {}, "mysql")

    if columns:
        col_select = ", ".join(f"`{c}`" for c in columns if _safe_col(c)) or "*"
    else:
        col_select = "*"

    count_q = f"SELECT COUNT(*) FROM `{schema}`.`{table}` {where}"
    data_q = f"SELECT {col_select} FROM `{schema}`.`{table}` {where} LIMIT %s OFFSET %s"

    db = _mysql_conn(params)
    cursor = db.cursor()
    cursor.execute(count_q, where_params)
    total = cursor.fetchone()[0]
    cursor.execute(data_q, where_params + [limit, offset])
    rows = cursor.fetchall()
    col_names = [d[0] for d in cursor.description]
    cursor.close()
    db.close()

    return {
        "columns": col_names,
        "rows": [list(r) for r in rows],
        "total_count": total,
        "limit": limit,
        "offset": offset,
    }