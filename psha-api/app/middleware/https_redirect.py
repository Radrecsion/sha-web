from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse

class ProxyHTTPSRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Cek header dari proxy/reverse-proxy
        proto = request.headers.get("x-forwarded-proto", "http")

        if proto == "http":
            url = request.url.replace(scheme="https")
            return RedirectResponse(url, status_code=307)

        response = await call_next(request)
        return response
