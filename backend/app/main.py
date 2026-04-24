from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, detect, images

app = FastAPI(title="AI Digital Fingerprint API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(detect.router, prefix="/api", tags=["detect"])
app.include_router(images.router, prefix="/api", tags=["images"])