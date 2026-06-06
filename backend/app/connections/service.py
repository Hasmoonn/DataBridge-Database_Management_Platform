import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.connections.models import DatabaseConnection
from app.connections.utils import encrypt_password, decrypt_password
from app.connections.schemas import ConnectionCreateRequest, ConnectionUpdateRequest

logger = logging.getLogger(__name__)


def get_user_connections(db: Session, user_id: int):
    return (
        db.query(DatabaseConnection)
        .filter(DatabaseConnection.user_id == user_id)
        .order_by(DatabaseConnection.created_at.desc())
        .all()
    )


def get_connection_by_id(db: Session, conn_id: int, user_id: int):
    conn = (
        db.query(DatabaseConnection)
        .filter(DatabaseConnection.id == conn_id, DatabaseConnection.user_id == user_id)
        .first()
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")
    return conn


def create_connection(db: Session, data: ConnectionCreateRequest, user_id: int):
    if not (1 <= data.port <= 65535):
        raise HTTPException(status_code=400, detail="Port must be between 1 and 65535.")

    if data.db_type not in ("postgresql", "mysql"):
        raise HTTPException(status_code=400, detail="Unsupported database type.")

    existing = (
        db.query(DatabaseConnection)
        .filter(DatabaseConnection.user_id == user_id, DatabaseConnection.name == data.name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Connection name already exists.")

    conn = DatabaseConnection(
        user_id=user_id,
        name=data.name,
        description=data.description,
        db_type=data.db_type,
        host=data.host,
        port=data.port,
        database_name=data.database_name,
        username=data.username,
        encrypted_password=encrypt_password(data.password),
        use_ssl=data.use_ssl,
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)
    logger.info(f"Connection created: {conn.name}")
    return conn


def update_connection(db: Session, conn_id: int, user_id: int, data: ConnectionUpdateRequest):
    conn = get_connection_by_id(db, conn_id, user_id)

    update_data = data.model_dump(exclude_none=True)
    password = update_data.pop("password", None)

    for field, value in update_data.items():
        setattr(conn, field, value)

    if password:
        conn.encrypted_password = encrypt_password(password)

    db.commit()
    db.refresh(conn)
    logger.info(f"Connection updated: {conn.name}")
    return conn


def delete_connection(db: Session, conn_id: int, user_id: int):
    conn = get_connection_by_id(db, conn_id, user_id)
    name = conn.name
    db.delete(conn)
    db.commit()
    logger.info(f"Connection deleted: {name}")
    return name


def get_connection_params(conn: DatabaseConnection) -> dict:
    return {
        "host": conn.host,
        "port": conn.port,
        "database": conn.database_name,
        "user": conn.username,
        "password": decrypt_password(conn.encrypted_password),
        "use_ssl": conn.use_ssl,
        "db_type": conn.db_type,
    }


def test_connection(db: Session, conn_id: int, user_id: int) -> dict:
    conn = get_connection_by_id(db, conn_id, user_id)
    params = get_connection_params(conn)

    try:
        if conn.db_type == "postgresql":
            result = _test_postgresql(params)
        elif conn.db_type == "mysql":
            result = _test_mysql(params)
        else:
            result = {"success": False, "message": f"Unsupported DB type: {conn.db_type}"}

        conn.status = "active" if result["success"] else "error"
        conn.last_tested_at = datetime.now(timezone.utc)
        conn.last_error = "" if result["success"] else result.get("message", "")
        db.commit()
        return result

    except Exception as e:
        conn.status = "error"
        conn.last_tested_at = datetime.now(timezone.utc)
        conn.last_error = str(e)
        db.commit()
        return {"success": False, "message": str(e)}


def _test_postgresql(params: dict) -> dict:
    try:
        import psycopg2
        conn_kwargs = {
            "host": params["host"],
            "port": params["port"],
            "dbname": params["database"],
            "user": params["user"],
            "password": params["password"],
            "connect_timeout": 10,
        }
        if params.get("use_ssl"):
            conn_kwargs["sslmode"] = "require"

        conn = psycopg2.connect(**conn_kwargs)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return {"success": True, "message": "Connection successful.", "details": {"version": version}}
    except Exception as e:
        return {"success": False, "message": str(e)}


def _test_mysql(params: dict) -> dict:
    try:
        import mysql.connector
        conn = mysql.connector.connect(
            host=params["host"],
            port=params["port"],
            database=params["database"],
            user=params["user"],
            password=params["password"],
            connection_timeout=10,
            ssl_disabled=not params.get("use_ssl", False),
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()

        return {"success": True, "message": "Connection successful.", "details": {"version": version}}
    except Exception as e:
        return {"success": False, "message": str(e)}