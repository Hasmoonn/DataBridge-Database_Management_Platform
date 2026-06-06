from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.connections.models import DatabaseConnection
from app.transfers.models import TransferJob
from app.monitoring.models import ActivityLog


def get_dashboard_data(db: Session, user_id: int) -> dict:
    # Connection stats
    connections = db.query(DatabaseConnection).filter(
        DatabaseConnection.user_id == user_id
    )
    connection_stats = {
        "total": connections.count(),
        "active": connections.filter(DatabaseConnection.status == "active").count(),
        "error": connections.filter(DatabaseConnection.status == "error").count(),
        "untested": connections.filter(DatabaseConnection.status == "untested").count(),
    }

    # Transfer stats
    transfers = db.query(TransferJob).filter(TransferJob.user_id == user_id)
    transfer_stats = {
        "total": transfers.count(),
        "completed": transfers.filter(TransferJob.status == "completed").count(),
        "running": transfers.filter(TransferJob.status == "running").count(),
        "failed": transfers.filter(TransferJob.status == "failed").count(),
        "pending": transfers.filter(TransferJob.status == "pending").count(),
    }

    # Recent transfers (last 5)
    recent_transfers = (
        transfers.order_by(TransferJob.created_at.desc()).limit(5).all()
    )

    # Recent activity (last 10)
    recent_activity = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(10)
        .all()
    )

    # Last 7 days row transfer activity
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=6)

    completed_jobs = (
        transfers.filter(TransferJob.status == "completed").all()
    )

    daily_rows: dict = {}
    for job in completed_jobs:
        ref_dt = job.completed_at or job.started_at or job.created_at
        if ref_dt:
            day = ref_dt.date() if hasattr(ref_dt, "date") else ref_dt
            if week_start <= day <= today:
                daily_rows[day] = daily_rows.get(day, 0) + (job.transferred_rows or 0)

    transfer_activity_7d = [
        {
            "date": (week_start + timedelta(days=i)).isoformat(),
            "rows": daily_rows.get(week_start + timedelta(days=i), 0),
        }
        for i in range(7)
    ]

    return {
        "connection_stats": connection_stats,
        "transfer_stats": transfer_stats,
        "recent_transfers": recent_transfers,
        "recent_activity": recent_activity,
        "transfer_activity_7d": transfer_activity_7d,
        "total_rows_transferred_today": daily_rows.get(today, 0),
    }


def get_connection_statuses(db: Session, user_id: int):
    return (
        db.query(DatabaseConnection)
        .filter(DatabaseConnection.user_id == user_id)
        .all()
    )


def get_transfer_history(db: Session, user_id: int):
    return (
        db.query(TransferJob)
        .filter(TransferJob.user_id == user_id)
        .order_by(TransferJob.created_at.desc())
        .limit(50)
        .all()
    )


def get_activity_logs(db: Session, user_id: int):
    return (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == user_id)
        .order_by(ActivityLog.created_at.desc())
        .limit(100)
        .all()
    )