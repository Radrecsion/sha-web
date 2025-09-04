from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime


# ----------- Hazard Curve Point -----------
class HazardCurvePoint(BaseModel):
    sa: float   # spectral acceleration (g)
    prob: float # exceedance probability


# ----------- Uniform Hazard Spectrum (UHS) -----------
class UHSPoint(BaseModel):
    period: float  # T (s)
    sa: float      # spectral acceleration (g)


# ----------- Base Schema -----------
class ResultBase(BaseModel):
    result_type: str   # e.g. "hazard_curve", "uhs", "deaggregation"
    description: Optional[str] = None


# ----------- Create (POST) -----------
class ResultCreate(ResultBase):
    project_id: int
    hazard_curve: Optional[List[HazardCurvePoint]] = None
    uhs: Optional[List[UHSPoint]] = None
    deaggregation: Optional[Dict[str, float]] = None  # fleksibel (dict)


# ----------- Output (GET) -----------
class ResultOut(ResultBase):
    id: int
    project_id: int
    hazard_curve: Optional[List[HazardCurvePoint]] = None
    uhs: Optional[List[UHSPoint]] = None
    deaggregation: Optional[Dict[str, float]] = None
    created_at: datetime

    class Config:
        from_attributes = True
