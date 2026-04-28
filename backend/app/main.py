from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import upload, detect, images, decode
from app.core.security import generate_api_key
import os

# Vulnerability 1: Rate Limiting configuration
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(title="AI Digital Fingerprint API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

def _normalize_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def _build_allowed_origins() -> list[str]:
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    configured = os.getenv("ALLOWED_ORIGINS")
    defaults = [frontend_url, "https://team-trinity-gdg.vercel.app"]
    raw_origins = configured.split(",") if configured else defaults
    return [origin for origin in (_normalize_origin(o) for o in raw_origins) if origin]


ALLOWED_ORIGINS = _build_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(detect.router, prefix="/api", tags=["detect"])
app.include_router(images.router, prefix="/api", tags=["images"])
app.include_router(decode.router, prefix="/api", tags=["decode"])

os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.post("/api/keys/generate")
# For a real app, protect this with get_current_user!
def create_api_key():
    """Generates a new API Key for developers to use the detection engine."""
    new_key = generate_api_key()
    return {"status": "success", "api_key": new_key, "message": "Save this key! It will not be shown again."}

@app.get("/health")
def health():
    try:
        from app.services.faiss_service import faiss_service
        return {
            "status": "ok",
            "index_size": len(faiss_service.ids),
            "dimension": faiss_service.dimension
        }
    except Exception as e:
        return {"status": "starting", "error": str(e)}