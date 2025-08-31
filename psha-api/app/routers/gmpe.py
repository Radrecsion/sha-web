from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.gmpe import (
    GMPEInfo,
    EvaluateRequest,
    EvaluateResponse,
    HazardCurveRequest,
    HazardCurveResponse,
)
from app.services.gmpe_service import (
    gmpe_metadata,
    evaluate_gmpe,
    hazard_curve,
    resolve_gmpe,
    required_params,
)

router = APIRouter(prefix="/gmpe", tags=["GMPE"])


@router.get("", response_model=List[GMPEInfo])
def list_gmpes_root(
    mechanism: Optional[str] = Query(
        None, description="Filter substring: 'ACTIVE', 'SUBDUCTION', 'STABLE', dst."
    )
):
    return gmpe_metadata(mechanism)


@router.get("/required-params")
def get_required_params(code: str):
    cls = resolve_gmpe(code)
    return required_params(cls)


@router.post("/evaluate", response_model=EvaluateResponse)
def eval_gmpe(req: EvaluateRequest):
    try:
        mean, stds = evaluate_gmpe(
            req.code, req.imt, req.mag, req.rrup, req.vs30, req.z1pt0, req.z2pt5
        )
        return {"mean": mean, "stddevs": stds}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/hazard-curve", response_model=HazardCurveResponse)
def hazard_curve_api(req: HazardCurveRequest):
    try:
        out = hazard_curve(
            logic=[it.dict() for it in req.logic],
            imt=req.imt,
            mag=req.mag,
            rrup=req.rrup,
            vs30=req.vs30,
            z1pt0=req.z1pt0,
            z2pt5=req.z2pt5,
            imls=req.imls,
            annual_rate=req.annual_rate,
        )
        return out
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
