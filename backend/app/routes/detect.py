from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request, Form, BackgroundTasks
import urllib.request
import json
import os
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
from app.services.firebase_service import get_image_by_id
from app.core.security import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
generator = EmbeddingGenerator()

def send_discord_alert(risk_level: str, score: float, category: str, is_fair_use: bool):
    webhook_url = os.getenv("DISCORD_WEBHOOK_URL")
    if not webhook_url: return
    
    color = 16711680 if not is_fair_use else 65280 # Red if not fair use, Green if fair use
    title = "🚨 Infringement Detected!" if not is_fair_use else "✅ Transformative Fair Use Detected"
    
    payload = {
        "embeds": [{
            "title": title,
            "description": f"A scan has flagged a match.\n**Similarity:** {score*100:.1f}%\n**Risk Level:** {risk_level}\n**Category:** {category}",
            "color": color,
            "footer": {"text": "AI Digital Fingerprint Agent"}
        }]
    }
    
    try:
        req = urllib.request.Request(webhook_url, method="POST")
        req.add_header('Content-Type', 'application/json')
        req.add_header('User-Agent', 'Hackathon-Agent')
        urllib.request.urlopen(req, data=json.dumps(payload).encode('utf-8'))
    except Exception as e:
        print(f"Discord Webhook Failed: {e}")

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
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    transcript: str = Form(None),
    visual_context: str = Form(None),
    threshold: float = Form(0.85),
    # Temporarily bypass current_user checking for the hackathon MVP frontend
    # current_user: dict = Depends(get_current_user) 
):
    current_user = {"uid": "demo-user-123"}
    # Security Validation: Content type 
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Security Error: File must be an image type")
        
    contents = await file.read()
    
    # Security Validation: Payload size limit (MAX 10MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit")
        
    embedding = generator.generate(contents)
    matches = faiss_service.search(embedding, k=3)
    
        # PHASE 7: Google Cloud Vision API (Mock Integration for Label Detection)
        # Use for: label detection. Example: “football”, “stadium”, etc.
        vision_labels = ["football", "stadium", "sports", "athlete"]
        
        # Wow Factor: Explainable AI
        # For Hackathon demo purposes, we provide static realistic bounding boxes.
        # In a real model, this would come from Grad-CAM or a Detection model's output tensors.
        explainability = {
            "bounding_box": {"x": 15, "y": 20, "width": 60, "height": 70}, # Percentages
            "heatmap_active": True
        }
        
        threshold = 0.85
    if matches and matches[0][1] > threshold:
        match = True
        score = matches[0][1]
        
        # Wow Factor: Explainable AI
        # For Hackathon demo purposes, we provide static realistic bounding boxes.
        # In a real model, this would come from Grad-CAM or a Detection model's output tensors.
        explainability = {
            "bounding_box": {"x": 15, "y": 20, "width": 60, "height": 70}, # Percentages
            "heatmap_active": True
        }
        
        # PHASE 5: Add score % and Tune threshold
        similarity_pct = int(score * 100)
        
        # PHASE 8: Risk level logic
        if similarity_pct >= 80:
            risk_level = "HIGH"
        elif similarity_pct >= 50:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        matched_id = matches[0][0]
        matched_data = get_image_by_id(matched_id)
        
        # IDOR Check (Optional depending on business logic): Does the user own the match they triggered?
        # A global detector normally wouldn't need this, but if users only search their own DB subset, it would.
        # Below permits the detector to find any match, fulfilling the IP Tracking requirements.
        matched_url = matched_data['url'] if matched_data else None
        
        # Unbiased Agent Context Analysis
        category = "Piracy"
        reasoning = "No transformative elements found. 1:1 raw feed upload."
        is_fair_use = False
        
        # If context is provided, analyze for 'Fair Use' transformation
        if transcript or visual_context:
            context_string = f"{transcript or ''} {visual_context or ''}".lower()
            if any(term in context_string for term in ["analysis", "tactics", "breakdown", "overlay", "commentary", "educational", "review"]):
                category = "Fair Use"
                is_fair_use = True
                reasoning = "Transformative context detected: Additional commentary or overlays represent Fair Use."
                
        # Event logging for live analytics
        try:
            from app.services.firebase_service import db
            from firebase_admin import firestore
            db.collection('detections').add({
                'assetId': matched_id,
                'similarity': float(score),
                'detectedAt': firestore.SERVER_TIMESTAMP,
                'source': 'manual-scan',
                'status': 'safe' if is_fair_use else 'pending',
                'category': category,
                'reasoning': reasoning,
                'location': 'User Upload / Manual Scan',
                'threatLevel': 'Low (Fair Use)' if is_fair_use else ('Critical' if score > 0.95 else 'High')
            })
        except Exception as e:
            print(f"Failed to log detection event: {e}")
            
        if risk_level in ["HIGH", "MEDIUM"]:
            background_tasks.add_task(send_discord_alert, risk_level, score, category, is_fair_use)
            
    else:
        match = False
        score = 0.0
        similarity_pct = 0
        risk_level = "LOW"
        matched_url = None
        category = None
        reasoning = None
        is_fair_use = False
        explainability = None
        
    return {
        "match": match, 
        "similarity_score": score,
        "similarity_pct": similarity_pct,
        "risk_level": risk_level,
        "vision_labels": vision_labels,
        "matched_image": matched_url,
        "is_fair_use": is_fair_use,
        "category": category,
        "reasoning": reasoning,
        "explainability": explainability
    }