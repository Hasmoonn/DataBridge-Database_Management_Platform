from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class ActivityLogOut(BaseModel):
    id: int
    username: Optional[str] = None
    action: str
    description: str
    extra_data: Dict[str, Any] = {} 
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class ConnectionStatusOut(BaseModel):
    id: int
    name: str
    db_type: str
    host: str
    status: str
    last_tested_at: Optional[datetime]
    last_error: str

    class Config:
        from_attributes = True


class TransferSummaryOut(BaseModel):
    id: int
    name: str
    status: str
    total_rows: int
    transferred_rows: int
    progress_percentage: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True