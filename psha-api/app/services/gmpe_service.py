import abc
import importlib
import pkgutil
import traceback
import re
from functools import lru_cache
from math import erf, sqrt, log
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from openquake.hazardlib.gsim.base import GroundShakingIntensityModel as GSIM
from openquake.hazardlib.imt import from_string
from openquake.hazardlib.site import Site, SiteCollection
from openquake.hazardlib.source.rupture import PointRupture
from openquake.hazardlib.geo.point import Point
from openquake.hazardlib.const import StdDev


# --------- utils ----------
def _safe_str(x: Any) -> str:
    """ubah konstanta/enum atau abstractproperty jadi string yang aman."""
    try:
        if isinstance(x, (abc.abstractproperty, property)):
            return "Unknown"
        s = str(x)
        if s.startswith("TRT."):
            return s.split(".", 1)[1]
        return s
    except Exception:
        return "Unknown"


def _safe_get_list(cls: type, attr: str) -> List[str]:
    """
    REQUIRES_* pada beberapa versi OQ adalah abstractproperty.
    Kembalikan list() kalau bisa, kalau tidak -> [].
    """
    try:
        val = getattr(cls, attr, [])
        if isinstance(val, (list, tuple, set)):
            return list(val)
        # kalau callable / abstractproperty -> fallback
        return []
    except Exception:
        return []


# --------- discovery ----------
def gmpe_metadata(mechanism: Optional[str] = None) -> List[Dict[str, Any]]:
    result: List[Dict[str, Any]] = []
    package = importlib.import_module("openquake.hazardlib.gsim")

    for _, modname, ispkg in pkgutil.iter_modules(package.__path__):
        if ispkg:
            continue
        try:
            module = importlib.import_module(f"openquake.hazardlib.gsim.{modname}")
            for name, obj in module.__dict__.items():
                if (
                    isinstance(obj, type)
                    and issubclass(obj, GSIM)
                    and obj is not GSIM
                    and name != "GMPE"
                ):
                    # cari tectonic region
                    trt = getattr(obj, "DEFINED_FOR_TECTONIC_REGION_TYPE", None)
                    tectonic_val = _safe_str(trt) if trt else "Unknown"

                    if mechanism and mechanism.lower() not in tectonic_val.lower():
                        continue

                    # cari tahun
                    year_match = re.search(r"(19|20)\d{2}", name) or re.search(r"(19|20)\d{2}", obj.__doc__ or "")
                    year = int(year_match.group()) if year_match else None

                    result.append(
                        {
                            "id": name,
                            "name": name,
                            "description": (obj.__doc__ or "").strip().split("\n")[0],
                            "tectonic_region": tectonic_val,
                            "year": year,
                            "req_site_params": _safe_get_list(obj, "REQUIRES_SITES_PARAMETERS"),
                            "req_rupture_params": _safe_get_list(obj, "REQUIRES_RUPTURE_PARAMETERS"),
                            "req_distances": _safe_get_list(obj, "REQUIRES_DISTANCES"),
                        }
                    )


        except Exception:
            traceback.print_exc()
            continue

    result.sort(key=lambda x: (x["tectonic_region"], x["id"]))
    return result



# --------- resolver & parameter introspection ----------
@lru_cache(maxsize=256)
def resolve_gmpe(code: str) -> type:
    """
    Temukan class GMPE dari OpenQuake berdasarkan nama class (exact),
    dengan cara scanning modul GSIM sekali lalu cache.
    """
    package = importlib.import_module("openquake.hazardlib.gsim")
    for _, modname, ispkg in pkgutil.iter_modules(package.__path__):
        if ispkg:
            continue
        module = importlib.import_module(f"openquake.hazardlib.gsim.{modname}")
        if hasattr(module, code):
            obj = getattr(module, code)
            if isinstance(obj, type) and issubclass(obj, GSIM) and obj is not GSIM:
                return obj
    raise ImportError(f"GMPE '{code}' tidak ditemukan di OpenQuake.")


def required_params(gmpe_class: type) -> Dict[str, List[str]]:
    return {
        "sites": _safe_get_list(gmpe_class, "REQUIRES_SITES_PARAMETERS"),
        "rupture": _safe_get_list(gmpe_class, "REQUIRES_RUPTURE_PARAMETERS"),
        "distances": _safe_get_list(gmpe_class, "REQUIRES_DISTANCES"),
    }


# --------- evaluator ----------
def _build_distances(required: List[str], rrup: float) -> Dict[str, np.ndarray]:
    """
    Buat dict distances sesuai kebutuhan GMPE.
    Saat ini hanya mendukung 'rrup'. Kalau GMPE minta distance lain -> error eksplisit.
    """
    d: Dict[str, np.ndarray] = {}
    if "rrup" in required:
        d["rrup"] = np.array([rrup], dtype=float)

    # cek apakah ada distance lain yang diminta
    unsupported = [k for k in required if k not in d]
    if unsupported:
        raise ValueError(
            f"GMPE ini membutuhkan distances {unsupported} yang belum didukung evaluator sederhana. "
            f"Gunakan GMPE yang hanya butuh 'rrup' atau implementasi perhitungan jarak lengkap."
        )
    return d


def evaluate_gmpe(
    code: str,
    imt: str,
    mag: float,
    rrup: float,
    vs30: float,
    z1pt0: Optional[float] = None,
    z2pt5: Optional[float] = None,
    hypo_depth: float = 10.0,
) -> Tuple[float, List[float]]:
    """
    Menghitung mean ln(IMT) dan stddevs untuk 1 GMPE dan 1 kondisi (1 site, 1 distance).
    Return: (mean_ln, stddevs)
    """
    cls = resolve_gmpe(code)
    imt_obj = from_string(imt)

    site = Site(
        location=Point(0.0, 0.0),
        vs30=vs30,
        vs30measured=False,
        z1pt0=z1pt0,
        z2pt5=z2pt5,
    )
    sites = SiteCollection([site])

    rupture = PointRupture(
        mag=mag,
        hypocenter=Point(0.0, 0.0, hypo_depth),
        tectonic_region_type=getattr(cls, "DEFINED_FOR_TECTONIC_REGION_TYPE", None),
    )


    req = required_params(cls)
    distances = _build_distances(req["distances"], rrup)

    gmpe = cls()
    mean, stddevs = gmpe.get_mean_and_stddevs(
        sites, rupture, distances, imt_obj, [StdDev.TOTAL]
    )
    return float(mean[0]), [float(s) for s in stddevs]


# --------- logic tree combiner ----------
def combine_gmpe_logic_tree(
    items: List[Dict[str, Any]],
    imt: str,
    mag: float,
    rrup: float,
    vs30: float,
    z1pt0: Optional[float] = None,
    z2pt5: Optional[float] = None,
) -> Tuple[float, float]:
    """
    Kombinasikan beberapa GMPE dengan bobot (logic tree) pada kondisi yang sama.
    items: [{code: 'ChiouYoungs2008', weight: 0.5}, ...]
    return: (mu_w, sigma_w) dalam space ln (natural log).
    """
    if not items:
        raise ValueError("Logic tree kosong.")

    mus = []
    sigmas = []
    weights = []

    for it in items:
        code = it["code"]
        w = float(it.get("weight", 1.0))
        mu, stds = evaluate_gmpe(code, imt, mag, rrup, vs30, z1pt0, z2pt5)
        sigma = float(stds[0]) if stds else 0.6
        mus.append(mu)
        sigmas.append(sigma)
        weights.append(w)

    w = np.array(weights, dtype=float)
    w = w / w.sum()

    mu_w = float(np.sum(w * np.array(mus)))
    # var total disederhanakan: rata-rata tertimbang dari varians (abaikan antar-model var)
    sigma_w = float(np.sum(w * (np.array(sigmas) ** 2)) ** 0.5)
    return mu_w, sigma_w


# --------- hazard curve ----------
def _lognormal_cdf(x: np.ndarray, mu: float, sigma: float) -> np.ndarray:
    """
    CDF lognormal memakai mu/sigma di space ln.
    """
    x = np.asarray(x, dtype=float)
    # hindari log(0)
    x = np.maximum(x, np.finfo(float).tiny)
    z = (np.log(x) - mu) / (sigma * sqrt(2.0))
    return 0.5 * (1.0 + erf(z))


def hazard_curve(
    logic: List[Dict[str, Any]],
    imt: str,
    mag: float,
    rrup: List[float],
    vs30: float,
    imls: List[float],
    z1pt0: Optional[float] = None,
    z2pt5: Optional[float] = None,
    annual_rate: float = 0.01,
) -> Dict[str, Any]:
    """
    Hitung hazard curve sederhana:
    - Ambil mu,sigma (ln) untuk tiap jarak dalam rrup, lalu rata-rata mu (baseline sederhana).
    - Asumsi proses Poisson: PoE_annual = 1 - exp(-rate * PoE_iml)
    Catatan: ini **sederhana** untuk demo/UI; bukan pengganti engine OQ.
    """
    if not imls:
        raise ValueError("Daftar IML kosong.")

    if not rrup:
        raise ValueError("Daftar jarak rrup kosong.")

    # Dapatkan mu,sigma per rrup lalu rata-ratakan (sederhana)
    mus = []
    sigmas = []
    for r in rrup:
        mu_r, sigma_r = combine_gmpe_logic_tree(
            logic, imt, mag, float(r), vs30, z1pt0, z2pt5
        )
        mus.append(mu_r)
        sigmas.append(sigma_r)

    mu_eff = float(np.mean(mus))
    sigma_eff = float(np.mean(sigmas))

    imls_arr = np.array(imls, dtype=float)
    poe_iml = 1.0 - _lognormal_cdf(imls_arr, mu_eff, sigma_eff)
    poe_annual = 1.0 - np.exp(-annual_rate * poe_iml)

    return {
        "imls": imls_arr.tolist(),
        "poe": poe_annual.tolist(),
        "meta": {"mu_ln": mu_eff, "sigma_ln": sigma_eff, "annual_rate": annual_rate},
    }
