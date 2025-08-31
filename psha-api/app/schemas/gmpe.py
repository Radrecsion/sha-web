from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GMPEInfo(BaseModel):
    id: str
    name: str
    description: str
    tectonic_region: str
    req_site_params: List[str] = []
    req_rupture_params: List[str] = []
    req_distances: List[str] = []


class GMPEWeight(BaseModel):
    code: str
    weight: float = Field(..., ge=0.0)


class EvaluateRequest(BaseModel):
    code: str
    imt: str  # e.g. "PGA", "SA(0.2)"
    mag: float
    rrup: float
    vs30: float
    z1pt0: Optional[float] = None
    z2pt5: Optional[float] = None


class EvaluateResponse(BaseModel):
    mean: float
    stddevs: List[float]


class HazardCurveRequest(BaseModel):
    logic: List[GMPEWeight]
    imt: str
    mag: float
    rrup: List[float]
    vs30: float
    imls: List[float]
    z1pt0: Optional[float] = None
    z2pt5: Optional[float] = None
    annual_rate: float = 0.01


class HazardCurveResponse(BaseModel):
    imls: List[float]
    poe: List[float]
    meta: Dict[str, Any]
