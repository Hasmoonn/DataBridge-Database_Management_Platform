import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.transfers import service
from app.transfers.schemas import (
    TransferJobCreateRequest,
    TransferJobOut,
    TransferLogOut,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/transfers", tags=["Transfers"])


@router.get("/")
def list_transfers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jobs = service.get_user_transfers(db, current_user.id)
    return {
        "success": True,
        "count": len(jobs),
        "data": [TransferJobOut.from_orm_with_names(j) for j in jobs],
    }


@router.post("/", status_code=201)
def create_transfer(
    data: TransferJobCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = service.create_transfer(db, data, current_user.id)
    return {
        "success": True,
        "message": "Transfer job created. Use /execute/ to start it.",
        "data": TransferJobOut.from_orm_with_names(job),
    }


@router.get("/{job_id}/")
def get_transfer(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = service.get_transfer_by_id(db, job_id, current_user.id)
    return {"success": True, "data": TransferJobOut.from_orm_with_names(job)}


@router.delete("/{job_id}/")
def delete_transfer(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    name = service.delete_transfer(db, job_id, current_user.id)
    return {"success": True, "message": f'Transfer job "{name}" deleted.'}


@router.post("/{job_id}/execute/")
def execute_transfer(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = service.execute_transfer(db, job_id, current_user.id)
    return {
        "success": True,
        "message": "Transfer executed.",
        "data": TransferJobOut.from_orm_with_names(job),
    }


@router.get("/{job_id}/logs/")
def get_transfer_logs(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs, job = service.get_transfer_logs(db, job_id, current_user.id)
    return {
        "success": True,
        "job_id": job.id,
        "job_name": job.name,
        "status": job.status,
        "data": [TransferLogOut.model_validate(log) for log in logs],
    }