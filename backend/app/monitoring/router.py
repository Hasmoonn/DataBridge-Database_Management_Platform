from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.auth.models import User
from app.monitoring import service
from app.monitoring.schemas import (
    ActivityLogOut,
    ConnectionStatusOut,
    TransferSummaryOut,
)

router = APIRouter(prefix="/api/v1/monitoring", tags=["Monitoring"])


def _format_activity_log(a) -> dict:
    return {
        "id": a.id,
        "username": a.user.username if a.user else None,
        "action": a.action,
        "description": a.description,
        "extra_data": a.extra_data,
        "created_at": a.created_at,
    }


@router.get("/dashboard/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = service.get_dashboard_data(db, current_user.id)

    return {
        "success": True,
        "data": {
            "connection_stats": data["connection_stats"],
            "transfer_stats": data["transfer_stats"],
            "recent_transfers": [
                TransferSummaryOut.model_validate(t) for t in data["recent_transfers"]
            ],
            "recent_activity": [
                _format_activity_log(a) for a in data["recent_activity"]
            ],
            "transfer_activity_7d": data["transfer_activity_7d"],
            "total_rows_transferred_today": data["total_rows_transferred_today"],
        },
    }


@router.get("/connections/status/")
def connection_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    connections = service.get_connection_statuses(db, current_user.id)
    return {
        "success": True,
        "data": [ConnectionStatusOut.model_validate(c) for c in connections],
    }


@router.get("/transfers/history/")
def transfer_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transfers = service.get_transfer_history(db, current_user.id)
    return {
        "success": True,
        "count": len(transfers),
        "data": [TransferSummaryOut.model_validate(t) for t in transfers],
    }


@router.get("/activity/")
def activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = service.get_activity_logs(db, current_user.id)
    return {
        "success": True,
        "count": len(logs),
        "data": [_format_activity_log(a) for a in logs],
    }