from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class HazardRequest(BaseModel):
    """
    Request untuk melakukan analisis hazard (PSHA).
    Biasanya user memilih sumber gempa & GMPE lalu menentukan parameter analisis.
    """
    datasource_ids: List[int]  # ID sumber gempa yang dipilih
    return_periods: List[int]  # misal [475, 2475] tahun
    site_lat: float
    site_lon: float
    vs30: Optional[float] = 760.0  # kondisi tanah default


class HazardResultPoint(BaseModel):
    """
    Titik hasil hazard curve (misalnya PGA/SA terhadap annual exceedance probability).
    """
    iml: float   # intensity measure level (misal PGA = 0.1g)
    prob: float  # exceedance probability


class HazardResult(BaseModel):
    """
    Response utama dari analisis hazard.
    """
    site_lat: float
    site_lon: float
    return_period: int
    results: List[HazardResultPoint]

    class Config:
        from_attributes = True
