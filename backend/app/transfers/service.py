import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.transfers.models import TransferJob, TransferLog
from app.connections.models import DatabaseConnection
from app.connections.service import get_connection_params
from app.transfers.schemas import TransferJobCreateRequest

logger = logging.getLogger(__name__)


def _add_log(db: Session, job: TransferJob, message: str, level: str = "info"):
    log = TransferLog(transfer_job_id=job.id, level=level, message=message)
    db.add(log)
    db.commit()


def get_user_transfers(db: Session, user_id: int):
    return (
        db.query(TransferJob)
        .filter(TransferJob.user_id == user_id)
        .order_by(TransferJob.created_at.desc())
        .all()
    )


def get_transfer_by_id(db: Session, job_id: int, user_id: int) -> TransferJob:
    job = (
        db.query(TransferJob)
        .filter(TransferJob.id == job_id, TransferJob.user_id == user_id)
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Transfer job not found.")
    return job


def create_transfer(db: Session, data: TransferJobCreateRequest, user_id: int) -> TransferJob:
    # Validate connections belong to user
    src = db.query(DatabaseConnection).filter(
        DatabaseConnection.id == data.source_connection_id,
        DatabaseConnection.user_id == user_id,
    ).first()
    if not src:
        raise HTTPException(status_code=400, detail="Source connection not found.")

    dst = db.query(DatabaseConnection).filter(
        DatabaseConnection.id == data.destination_connection_id,
        DatabaseConnection.user_id == user_id,
    ).first()
    if not dst:
        raise HTTPException(status_code=400, detail="Destination connection not found.")

    if (
        data.source_connection_id == data.destination_connection_id
        and data.source_schema == data.destination_schema
        and data.source_table == data.destination_table
    ):
        raise HTTPException(
            status_code=400,
            detail="Source and destination table cannot be the same.",
        )

    job = TransferJob(
        user_id=user_id,
        name=data.name,
        description=data.description,
        source_connection_id=data.source_connection_id,
        source_schema=data.source_schema,
        source_table=data.source_table,
        destination_connection_id=data.destination_connection_id,
        destination_schema=data.destination_schema,
        destination_table=data.destination_table,
        column_mapping=data.column_mapping,
        source_filters=data.source_filters,
        batch_size=data.batch_size,
        truncate_destination=data.truncate_destination,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    logger.info(f"Transfer job created: {job.name}")
    return job


def delete_transfer(db: Session, job_id: int, user_id: int):
    job = get_transfer_by_id(db, job_id, user_id)
    if job.status == "running":
        raise HTTPException(status_code=400, detail="Cannot delete a running transfer job.")
    name = job.name
    db.delete(job)
    db.commit()
    return name


def get_transfer_logs(db: Session, job_id: int, user_id: int):
    job = get_transfer_by_id(db, job_id, user_id)
    return (
        db.query(TransferLog)
        .filter(TransferLog.transfer_job_id == job.id)
        .order_by(TransferLog.created_at)
        .all()
    ), job


def execute_transfer(db: Session, job_id: int, user_id: int) -> TransferJob:
    job = get_transfer_by_id(db, job_id, user_id)

    if job.status == "running":
        raise HTTPException(status_code=400, detail="Transfer is already running.")

    job.status = "running"
    job.started_at = datetime.now(timezone.utc)
    db.commit()
    _add_log(db, job, f"Transfer started: {job.name}")

    try:
        src_params = get_connection_params(job.source_connection)
        dst_params = get_connection_params(job.destination_connection)

        # Count source rows
        total = _get_source_count(
            src_params, job.source_connection.db_type,
            job.source_schema, job.source_table, job.source_filters or {}
        )
        job.total_rows = total
        db.commit()
        _add_log(db, job, f"Source row count: {total}")

        # Truncate destination if needed
        if job.truncate_destination:
            _truncate_table(
                dst_params, job.destination_connection.db_type,
                job.destination_schema, job.destination_table
            )
            _add_log(db, job, "Destination table truncated.")

        # Batch transfer
        transferred = 0
        offset = 0
        batch_size = job.batch_size

        while offset < total:
            rows, col_names = _fetch_batch(
                src_params, job.source_connection.db_type,
                job.source_schema, job.source_table,
                job.source_filters or {}, job.column_mapping or {},
                batch_size, offset
            )
            if not rows:
                break

            _insert_batch(
                dst_params, job.destination_connection.db_type,
                job.destination_schema, job.destination_table,
                col_names, rows
            )

            transferred += len(rows)
            offset += batch_size
            job.transferred_rows = transferred
            db.commit()
            _add_log(db, job, f"Transferred {transferred}/{total} rows.")

        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        _add_log(db, job, f"Transfer completed. Total: {transferred} rows.")

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Transfer {job.id} failed: {error_msg}")
        job.status = "failed"
        job.error_message = error_msg
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        _add_log(db, job, f"Transfer failed: {error_msg}", level="error")

    db.refresh(job)
    return job


def _get_source_count(params, db_type, schema, table, filters) -> int:
    where, where_params = _build_where(filters, db_type)
    if db_type == "postgresql":
        import psycopg2
        db = psycopg2.connect(
            host=params["host"], port=params["port"],
            dbname=params["database"], user=params["user"],
            password=params["password"]
        )
        query = f'SELECT COUNT(*) FROM "{schema}"."{table}" {where}'
        cursor = db.cursor()
        cursor.execute(query, where_params)
        count = cursor.fetchone()[0]
        cursor.close()
        db.close()
        return count

    elif db_type == "mysql":
        import mysql.connector
        db = mysql.connector.connect(
            host=params["host"], port=params["port"],
            database=params["database"], user=params["user"],
            password=params["password"]
        )
        query = f"SELECT COUNT(*) FROM `{schema}`.`{table}` {where}"
        cursor = db.cursor()
        cursor.execute(query, where_params)
        count = cursor.fetchone()[0]
        cursor.close()
        db.close()
        return count

    return 0


def _build_where(filters: dict, db_type: str) -> tuple:
    if not filters:
        return "", []
    parts, params = [], []
    q = '"' if db_type == "postgresql" else "`"
    for col, val in filters.items():
        if col.replace("_", "").replace(" ", "").isalnum():
            parts.append(f"{q}{col}{q} = %s")
            params.append(val)
    if parts:
        return f"WHERE {' AND '.join(parts)}", params
    return "", []


def _fetch_batch(params, db_type, schema, table, filters, column_mapping, limit, offset):
    where, where_params = _build_where(filters, db_type)
    src_cols = list(column_mapping.keys()) if column_mapping else None
    dst_cols = list(column_mapping.values()) if column_mapping else None

    if db_type == "postgresql":
        import psycopg2
        col_select = (", ".join(f'"{c}"' for c in src_cols) if src_cols else "*")
        query = f'SELECT {col_select} FROM "{schema}"."{table}" {where} LIMIT %s OFFSET %s'
        db = psycopg2.connect(
            host=params["host"], port=params["port"],
            dbname=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.execute(query, where_params + [limit, offset])
        rows = cursor.fetchall()
        col_names = dst_cols if dst_cols else [d[0] for d in cursor.description]
        cursor.close()
        db.close()
        return [list(r) for r in rows], col_names

    elif db_type == "mysql":
        import mysql.connector
        col_select = (", ".join(f"`{c}`" for c in src_cols) if src_cols else "*")
        query = f"SELECT {col_select} FROM `{schema}`.`{table}` {where} LIMIT %s OFFSET %s"
        db = mysql.connector.connect(
            host=params["host"], port=params["port"],
            database=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.execute(query, where_params + [limit, offset])
        rows = cursor.fetchall()
        col_names = dst_cols if dst_cols else [d[0] for d in cursor.description]
        cursor.close()
        db.close()
        return [list(r) for r in rows], col_names

    return [], []


def _truncate_table(params, db_type, schema, table):
    if db_type == "postgresql":
        import psycopg2
        db = psycopg2.connect(
            host=params["host"], port=params["port"],
            dbname=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.execute(f'TRUNCATE TABLE "{schema}"."{table}";')
        db.commit()
        cursor.close()
        db.close()

    elif db_type == "mysql":
        import mysql.connector
        db = mysql.connector.connect(
            host=params["host"], port=params["port"],
            database=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.execute(f"TRUNCATE TABLE `{schema}`.`{table}`;")
        db.commit()
        cursor.close()
        db.close()


def _insert_batch(params, db_type, schema, table, col_names, rows):
    if not rows:
        return

    if db_type == "postgresql":
        import psycopg2
        cols = ", ".join(f'"{c}"' for c in col_names)
        placeholders = ", ".join(["%s"] * len(col_names))
        query = f'INSERT INTO "{schema}"."{table}" ({cols}) VALUES ({placeholders})'
        db = psycopg2.connect(
            host=params["host"], port=params["port"],
            dbname=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.executemany(query, rows)
        db.commit()
        cursor.close()
        db.close()

    elif db_type == "mysql":
        import mysql.connector
        cols = ", ".join(f"`{c}`" for c in col_names)
        placeholders = ", ".join(["%s"] * len(col_names))
        query = f"INSERT INTO `{schema}`.`{table}` ({cols}) VALUES ({placeholders})"
        db = mysql.connector.connect(
            host=params["host"], port=params["port"],
            database=params["database"], user=params["user"],
            password=params["password"]
        )
        cursor = db.cursor()
        cursor.executemany(query, rows)
        db.commit()
        cursor.close()
        db.close()