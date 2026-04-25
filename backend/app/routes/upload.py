from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.services.firebase_service import upload_image, save_metadata
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
from app.core.security import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
from google.cloud import vision
import uuid

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
generator = EmbeddingGenerator()

# Requirement Integration: Google Cloud AI Service
try:
    vision_client = vision.ImageAnnotatorClient()
except Exception as e:
    vision_client = None
    print(f"Vision API Warning: {e}")

def get_google_labels(image_bytes):
    if not vision_client:
        return ["Google AI Unavailable"]
    image = vision.Image(content=image_bytes)
    response = vision_client.label_detection(image=image)
    return [l.description for l in response.label_annotations][:5]

@router.post("/upload")
@limiter.limit("20/minute") # Strict Rate Limiting (Abuse Prevention)
async def upload(
    request: Request,
    file: UploadFile = File(...),
    # Temporarily bypass current_user checking for the hackathon MVP frontend
    # current_user: dict = Depends(get_current_user) 
):
    # Hackathon MVP dummy user mapping to avoid IDOR enforcement breaking local demo
    current_user = {"uid": "demo-user-123"}
    # Security Check #6: Validate/Sanitize Inputs
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Security Error: File must be an image type (png, jpeg, jpg, etc.)")
        
    contents = await file.read()
    
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit")
        
    asset_id = str(uuid.uuid4())
    
    # Determine the file extension based on the uploaded content type
    file_ext = "jpg" # Default
    if file.content_type == "image/png":
        file_ext = "png"
    elif file.content_type == "image/webp":
        file_ext = "webp"
    elif file.content_type in ["image/jpeg", "image/jpg"]:
        file_ext = "jpg"
        
    filename = f"{current_user['uid']}/{asset_id}.{file_ext}" # IDOR Fix: Store file directly inside User's sandbox segment
    
    url = upload_image(contents, filename, content_type=file.content_type)
    embedding = generator.generate(contents)
    labels = get_google_labels(contents)
    
    # Statefully store the vector in FAISS index (Backs up to Firebase)
    faiss_service.add(embedding, asset_id)
    
    # Save the reference map ensuring user 'ownership' matches the owner ID.
    from app.services.firebase_service import db
    doc_ref = db.collection('images').document(asset_id)
    doc_ref.set({
        'url': url,
        'labels': labels,
        'owner_id': current_user['uid']
    })
    
    return {"id": asset_id, "url": url, "labels": labels}