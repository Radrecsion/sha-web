import numpy as np

def dummy_gmpe(imls: np.ndarray, mag: float, dist: float, vs30: float, imt: str, **kwargs):
    """
    Dummy GMPE: prob_exceed = exp(-a * imls), hanya contoh
    """
    a = 0.3 + 0.05 * (mag - 5) + 0.01 * dist
    return np.exp(-a * imls)

def compute_hazard_curve(logic_tree, imls: np.ndarray, mag: float, dist: float, vs30: float, imt: str):
    return logic_tree.get_mean_hazard(imls, mag=mag, dist=dist, vs30=vs30, imt=imt)
