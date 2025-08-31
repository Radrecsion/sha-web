import numpy as np
from typing import List
from app.services.gmpe_service import evaluate_gmpe, combine_gmpe_logic_tree
from app.models.hazard_model import HazardCurveRequest, HazardCurveResponse, HazardCurvePoint


def run_hazard_curve(req: HazardCurveRequest) -> HazardCurveResponse:
    """
    Jalankan hazard curve PSHA sederhana dengan kombinasi GMPE logic tree.
    """
    # Gunakan IM levels (Intensity Measure Levels), contoh PGA 0.01g s/d 1g
    imls = np.linspace(0.01, 1.0, 20)

    # Hitung hazard curve
    probs = []
    for iml in imls:
        mean_val = combine_gmpe_logic_tree(
            items=[{"code": g.code, "weight": g.weight} for g in req.logic],
            imt=req.imt,
            mag=req.mag,
            rrup=req.dist,
            vs30=req.vs30,
            z1pt0=req.z1pt0,
            z2pt5=req.z2pt5,
        )
        # Probabilitas exceedance sederhana (expon)
        prob_exceed = np.exp(-iml / np.exp(mean_val))
        probs.append(prob_exceed)

    curve = [
        HazardCurvePoint(intensity=float(x), prob_exceed=float(p))
        for x, p in zip(imls, probs)
    ]

    return HazardCurveResponse(
        imt=req.imt,
        site={"lat": req.site_lat, "lon": req.site_lon, "vs30": req.vs30},
        curve=curve,
    )
