from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes import upload, detect, images, decode
from app.core.security import generate_api_key, get_current_user
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
    f"{FRONTEND_URL},https://team-trinity-gdg.vercel.app/"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Relaxed for Hackathon MVP
    allow_credentials=True,
    allow_methods=["*"],
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