from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from .datasource import DataSourceOut
from .siteparameter import SiteParameterOut
from .result import ResultOut


# ----------- Base Schema -----------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


# ----------- Create (POST) -----------
class ProjectCreate(ProjectBase):
    user_id: int
    datasources: List[int] = []        # simpan ID datasources
    site_parameters: Optional[List[int]] = []  # simpan ID site params


# ----------- Output (GET) -----------
class ProjectOut(ProjectBase):
    id: int
    user_id: int
    datasources: List[DataSourceOut] = []
    site_parameters: List[SiteParameterOut] = []
    results: List[ResultOut] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
