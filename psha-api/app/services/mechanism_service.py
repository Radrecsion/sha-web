from typing import List

# daftar mekanisme & mapping ke tectonic region type (OQ standard)
MECHANISMS = [
    {"id": "Active Shallow Crust", "label": "Active Shallow Crust (Strike-Slip/Normal/Reverse)"},
    {"id": "Stable Continental Crust", "label": "Stable Continental Crust"},
    {"id": "Subduction Interface", "label": "Subduction Interface"},
    {"id": "Subduction IntraSlab", "label": "Subduction IntraSlab (Benioff)"},
    {"id": "Background Source", "label": "Background Source"},
]

def list_mechanisms() -> List[dict]:
    return MECHANISMS
