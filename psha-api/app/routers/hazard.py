from fastapi import APIRouter, HTTPException
from app.schemas.gmpe import HazardCurveRequest, HazardCurveResponse
from app.services.hazard_service import run_hazard_curve

router = APIRouter(prefix="/hazard", tags=["Hazard"])


@router.post("/curve", response_model=HazardCurveResponse)
def hazard_curve_api(req: HazardCurveRequest):
    """
    Hitung hazard curve berdasarkan kombinasi GMPE + logic tree
    """
    try:
        return run_hazard_curve(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
