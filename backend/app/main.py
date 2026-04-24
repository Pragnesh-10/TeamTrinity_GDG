from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import upload, detect, images
import os

# Vulnerability 1: Rate Limiting configuration
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(title="AI Digital Fingerprint API", version="1.0.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Vulnerability 3: Strict CORS Implementation
# Origins should be defined via env variable in production, fallback to strict dev origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    f"{FRONTEND_URL},https://your-app.web.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Restoring generic methods to prevent CORS preflight blocks during hackathon
    allow_headers=["*"], # Restoring headers
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(detect.router, prefix="/api", tags=["detect"])
app.include_router(images.router, prefix="/api", tags=["images"])

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