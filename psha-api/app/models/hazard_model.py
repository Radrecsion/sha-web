from pydantic import BaseModel
from typing import List, Optional

class GMPEWeight(BaseModel):
    code: str
    weight: float

class HazardCurveRequest(BaseModel):
    logic: List[GMPEWeight]
    imt: str
    vs30: float
    site_lat: float
    site_lon: float
    mag: float
    dist: float

class HazardCurvePoint(BaseModel):
    intensity: float
    prob_exceed: float

class HazardCurveResponse(BaseModel):
    imt: str
    site: dict
    curve: List[HazardCurvePoint]
