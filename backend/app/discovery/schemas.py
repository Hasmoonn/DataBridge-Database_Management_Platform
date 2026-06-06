from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class PreviewRequest(BaseModel):
    limit: int = 100
    offset: int = 0
    columns: List[str] = []
    filters: Dict[str, str] = {}


class PreviewResponse(BaseModel):
    columns: List[str]
    rows: List[Any]
    total_count: int
    limit: int
    offset: int