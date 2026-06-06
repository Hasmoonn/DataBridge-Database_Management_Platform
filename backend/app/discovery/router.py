import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.connections.models import DatabaseConnection
from app.discovery import service
from app.discovery.schemas import PreviewRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/discovery", tags=["Discovery"])


def _get_connection(conn_id: int, user: User, db: Session) -> DatabaseConnection:
    conn = (
        db.query(DatabaseConnection)
        .filter(DatabaseConnection.id == conn_id, DatabaseConnection.user_id == user.id)
        .first()
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found.")
    return conn


@router.get("/{connection_id}/schemas/")
def list_schemas(
    connection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = _get_connection(connection_id, current_user, db)
    try:
        schemas = service.get_schemas(conn)
        return {"success": True, "data": schemas}
    except Exception as e:
        logger.error(f"Schema list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{connection_id}/schemas/{schema_name}/tables/")
def list_tables(
    connection_id: int,
    schema_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = _get_connection(connection_id, current_user, db)
    try:
        tables = service.get_tables(conn, schema_name)
        return {"success": True, "data": tables}
    except Exception as e:
        logger.error(f"Table list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{connection_id}/schemas/{schema_name}/tables/{table_name}/columns/")
def list_columns(
    connection_id: int,
    schema_name: str,
    table_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = _get_connection(connection_id, current_user, db)
    try:
        columns = service.get_columns(conn, schema_name, table_name)
        return {"success": True, "data": columns}
    except Exception as e:
        logger.error(f"Column list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{connection_id}/schemas/{schema_name}/tables/{table_name}/preview/")
def preview_data(
    connection_id: int,
    schema_name: str,
    table_name: str,
    body: PreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = _get_connection(connection_id, current_user, db)
    try:
        result = service.preview_data(
            conn=conn,
            schema=schema_name,
            table=table_name,
            limit=body.limit,
            offset=body.offset,
            filters=body.filters,
            columns=body.columns,
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Preview error: {e}")
        raise HTTPException(status_code=500, detail=str(e))