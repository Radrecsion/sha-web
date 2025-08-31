from typing import List, Dict
import numpy as np

class LogicTreeGMPE:
    def __init__(self, gmpes: List[Dict]):
        """
        gmpes: list of {"code": "BooreAtkinson2008", "weight": 0.6, "func": gmpe_function}
        """
        self.gmpes = gmpes
        total_weight = sum([g["weight"] for g in gmpes])
        if abs(total_weight - 1.0) > 1e-6:
            raise ValueError("Total weight of GMPEs must sum to 1.0")

    def get_mean_hazard(self, imls: np.ndarray, **kwargs):
        """
        Combine GMPE predictions weighted by logic tree
        """
        combined = np.zeros_like(imls, dtype=float)
        for g in self.gmpes:
            y = g["func"](imls, **kwargs)
            combined += g["weight"] * y
        return combined
