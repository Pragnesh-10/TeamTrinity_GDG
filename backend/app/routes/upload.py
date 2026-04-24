from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.firebase_service import upload_image, save_metadata
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
import uuid

router = APIRouter()

generator = EmbeddingGenerator()

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Security Validation: Content type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Security Error: File must be an image type")
        
    contents = await file.read()
    
    # Security Validation: Payload size limit (MAX 10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit")
        
    id = str(uuid.uuid4())
    filename = f"{id}.jpg"
    url = upload_image(contents, filename)
    embedding = generator.generate(contents)
    
    # Statefully store the vector in FAISS index (Backs up to Firebase)
    faiss_service.add(embedding, id)
    save_metadata(id, url, embedding)
    return {"id": id, "url": url}