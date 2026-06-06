from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConnectionCreateRequest(BaseModel):
    name: str
    description: str = ""
    db_type: str = "postgresql"
    host: str
    port: int
    database_name: str
    username: str
    password: str
    use_ssl: bool = False

    def validate_port(self):
        if not (1 <= self.port <= 65535):
            raise ValueError("Port must be between 1 and 65535.")


class ConnectionUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    db_type: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    use_ssl: Optional[bool] = None


class ConnectionOut(BaseModel):
    id: int
    name: str
    description: str
    db_type: str
    host: str
    port: int
    database_name: str
    username: str
    use_ssl: bool
    status: str
    last_tested_at: Optional[datetime]
    last_error: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True