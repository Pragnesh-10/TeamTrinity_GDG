from fastapi import APIRouter, Depends, Request
from app.services.firebase_service import get_user_images
from app.core.security import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.get("/images")
@limiter.limit("100/minute") # Standard Rate limit (Abuse Prevention)
async def list_images(
    request: Request,
    current_user: dict = Depends(get_current_user) # Authentication validation
):
    # IDOR Fix: Get only images where metadata matches current user
    # Do NOT return the global get_all_images()
    return get_user_images(current_user['uid'])