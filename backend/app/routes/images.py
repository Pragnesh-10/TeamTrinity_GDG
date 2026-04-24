from fastapi import APIRouter
from app.services.firebase_service import get_all_images

router = APIRouter()

@router.get("/images")
def get_images():
    return get_all_images()