from .auth import router as auth_router
from .analysis import router as analysis_router
from .datasource import router as datasource_router
from .gmpe import router as gmpe_router
from .hazard import router as hazard_router
from .mechanism import router as mechanism_router
from .meta import router as meta_router
from .projects import router as projects_router

__all__ = [
    "auth_router",
    "analysis_router",
    "datasource_router",
    "gmpe_router",
    "hazard_router",
    "mechanism_router",
    "meta_router",
    "projects_router",
]
