from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any


class TransferJobCreateRequest(BaseModel):
    name: str
    description: str = ""
    source_connection_id: int
    source_schema: str
    source_table: str
    destination_connection_id: int
    destination_schema: str
    destination_table: str
    column_mapping: Dict[str, str] = {}
    source_filters: Dict[str, str] = {}
    batch_size: int = 1000
    truncate_destination: bool = False


class TransferJobOut(BaseModel):
    id: int
    name: str
    description: str
    source_connection_id: int
    source_connection_name: Optional[str] = None
    source_schema: str
    source_table: str
    destination_connection_id: int
    destination_connection_name: Optional[str] = None
    destination_schema: str
    destination_table: str
    column_mapping: Dict[str, Any]
    source_filters: Dict[str, Any]
    batch_size: int
    truncate_destination: bool
    status: str
    total_rows: int
    transferred_rows: int
    failed_rows: int
    progress_percentage: float
    error_message: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_names(cls, job):
        data = cls.model_validate(job)
        data.source_connection_name = (
            job.source_connection.name if job.source_connection else None
        )
        data.destination_connection_name = (
            job.destination_connection.name if job.destination_connection else None
        )
        return data


class TransferLogOut(BaseModel):
    id: int
    level: str
    message: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True