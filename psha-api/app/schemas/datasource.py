from pydantic import BaseModel
from typing import List, Optional


# Koordinat (dengan depth)
class CoordPoint(BaseModel):
    lat: float
    lon: float
    depth: float


# GMPE dasar (relasi dengan datasource)
class DataSourceGMPEBase(BaseModel):
    gmpe_name: str   # pakai nama GMPE, bukan id
    weight: float

# Schema dasar DataSource
class DataSourceBase(BaseModel):
    name: str
    mechanism: str
    min_mag: Optional[float] = None
    max_mag: Optional[float] = None
    coords_up: List[CoordPoint] = []     # ← kasih default list kosong
    coords_down: List[CoordPoint] = []   # ← kasih default list kosong
    gr_beta: Optional[float] = None      # ✅ cukup optional float
    gr_rate: Optional[float] = None
    gr_weight: Optional[float] = None  
    dip_angle: Optional[float] = None  # Dip angle
    strike_angle: Optional[float] = None  # Strike angle     


# Untuk request POST/PUT
class DataSourceCreate(DataSourceBase):
    gmpe_weights: List[DataSourceGMPEBase] = []


# Output GMPE (punya ID)
class DataSourceGMPEOut(DataSourceGMPEBase):
    id: int

    class Config:
        from_attributes = True  # ganti orm_mode di Pydantic v2


# Untuk response GET/POST
class DataSourceOut(DataSourceBase):
    id: int
    gmpe_weights: List[DataSourceGMPEOut]

    class Config:
        from_attributes = True
