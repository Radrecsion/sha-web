from fastapi import APIRouter, HTTPException
from app.schemas.analysis import HazardRequest, HazardResult, HazardResultPoint

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/", response_model=HazardResult)
def run_analysis(req: HazardRequest):
    """
    Jalankan analisis probabilistic seismic hazard (PSHA).
    """
    if not req.datasource_ids:
        raise HTTPException(status_code=400, detail="Minimal 1 datasource harus dipilih")

    return run_psha_analysis(req)  # ✅ delegasi ke service