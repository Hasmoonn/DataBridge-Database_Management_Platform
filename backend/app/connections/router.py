from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.connections import service
from app.connections.schemas import (
    ConnectionCreateRequest,
    ConnectionUpdateRequest,
    ConnectionOut,
)

router = APIRouter(prefix="/api/v1/connections", tags=["Connections"])


@router.get("/")
def list_connections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connections = service.get_user_connections(db, current_user.id)
    return {
        "success": True,
        "count": len(connections),
        "data": [ConnectionOut.model_validate(c) for c in connections],
    }


@router.post("/", status_code=201)
def create_connection(
    data: ConnectionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = service.create_connection(db, data, current_user.id)
    return {
        "success": True,
        "message": "Connection created successfully.",
        "data": ConnectionOut.model_validate(conn),
    }


@router.get("/{conn_id}/")
def get_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = service.get_connection_by_id(db, conn_id, current_user.id)
    return {"success": True, "data": ConnectionOut.model_validate(conn)}


@router.put("/{conn_id}/")
def update_connection(
    conn_id: int,
    data: ConnectionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = service.update_connection(db, conn_id, current_user.id, data)
    return {
        "success": True,
        "message": "Connection updated successfully.",
        "data": ConnectionOut.model_validate(conn),
    }


@router.patch("/{conn_id}/")
def partial_update_connection(
    conn_id: int,
    data: ConnectionUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conn = service.update_connection(db, conn_id, current_user.id, data)
    return {
        "success": True,
        "message": "Connection updated successfully.",
        "data": ConnectionOut.model_validate(conn),
    }


@router.delete("/{conn_id}/")
def delete_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = service.delete_connection(db, conn_id, current_user.id)
    return {"success": True, "message": f'Connection "{name}" deleted.'}


@router.post("/{conn_id}/test/")
def test_connection(
    conn_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = service.test_connection(db, conn_id, current_user.id)
    return {
        "success": result["success"],
        "message": result["message"],
        "details": result.get("details", {}),
    }