from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
from app.services.firebase_service import get_image_by_id

router = APIRouter()

generator = EmbeddingGenerator()

@router.post("/detect")
async def detect(file: UploadFile = File(...)):
    # Security Validation: Content type 
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Security Error: File must be an image type")
        
    contents = await file.read()
    
    # Security Validation: Payload size limit (MAX 10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit")
        
    embedding = generator.generate(contents)
    # Cosine Similarity Search via Local FAISS with top K matches
    matches = faiss_service.search(embedding, k=3)
    
    # Dynamic Thresholding for 'Originality' based on empirical tests.
    threshold = 0.85
    if matches and matches[0][1] > threshold:
        match = True
        score = matches[0][1]
        matched_id = matches[0][0]
        matched_data = get_image_by_id(matched_id)
        matched_url = matched_data['url'] if matched_data else None
    else:
        match = False
        score = 0.0
        matched_url = None
    return {"match": match, "similarity_score": score, "matched_image": matched_url}