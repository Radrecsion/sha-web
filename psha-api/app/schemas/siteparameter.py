from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ----------- Base Schema -----------
class SiteParameterBase(BaseModel):
    vs30: Optional[float] = None         # kecepatan gelombang geser (m/s)
    z1p0: Optional[float] = None         # kedalaman ke Vs = 1.0 km/s (m)
    z2p5: Optional[float] = None         # kedalaman ke Vs = 2.5 km/s (m)
    latitude: Optional[float] = None     # lokasi site
    longitude: Optional[float] = None


# ----------- Create (POST) -----------
class SiteParameterCreate(SiteParameterBase):
    project_id: int   # setiap site param harus terkait project


# ----------- Update (PUT/PATCH) -----------
class SiteParameterUpdate(BaseModel):
    vs30: Optional[float] = None
    z1p0: Optional[float] = None
    z2p5: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# ----------- Output (GET) -----------
class SiteParameterOut(SiteParameterBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        from_attributes = True
