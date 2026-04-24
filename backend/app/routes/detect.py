from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
from app.services.firebase_service import get_image_by_id
from app.core.security import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
generator = EmbeddingGenerator()

@router.get("/detections")
@limiter.limit("60/minute")
async def get_detections(request: Request):
    try:
        from app.services.firebase_service import db
        docs = db.collection('detections').order_by('detectedAt', direction='DESCENDING').limit(20).stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            # Serialize the timestamp for JSON response
            if 'detectedAt' in data and data['detectedAt']:
                data['detectedAt'] = data['detectedAt'].isoformat()
            results.append({"id": doc.id, **data})
        return results
    except Exception as e:
        print(f"Error fetching detections: {e}")
        return []

@router.post("/detect")
@limiter.limit("50/minute") # Medium Rate Limiting (Abuse Prevention)
async def detect(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user) # Authentication enforced
):
    # Security Validation: Content type 
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Security Error: File must be an image type")
        
    contents = await file.read()
    
    # Security Validation: Payload size limit (MAX 10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit")
        
    embedding = generator.generate(contents)
    matches = faiss_service.search(embedding, k=3)
    
    threshold = 0.85
    if matches and matches[0][1] > threshold:
        match = True
        score = matches[0][1]
        matched_id = matches[0][0]
        matched_data = get_image_by_id(matched_id)
        
        # IDOR Check (Optional depending on business logic): Does the user own the match they triggered?
        # A global detector normally wouldn't need this, but if users only search their own DB subset, it would.
        # Below permits the detector to find any match, fulfilling the IP Tracking requirements.
        matched_url = matched_data['url'] if matched_data else None
        
        # Event logging for live analytics
        try:
            from app.services.firebase_service import db
            from firebase_admin import firestore
            db.collection('detections').add({
                'assetId': matched_id,
                'similarity': float(score),
                'detectedAt': firestore.SERVER_TIMESTAMP,
                'source': 'manual-scan',
                'status': 'pending',
                'location': 'User Upload / Manual Scan',
                'threatLevel': 'Critical' if score > 0.95 else 'High' if score > 0.90 else 'Medium'
            })
        except Exception as e:
            print(f"Failed to log detection event: {e}")
            
    else:
        match = False
        score = 0.0
        matched_url = None
    return {"match": match, "similarity_score": score, "matched_image": matched_url}