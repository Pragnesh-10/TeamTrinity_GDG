from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from app.services.firebase_service import upload_image, save_metadata
from app.models.embedding import EmbeddingGenerator
from app.services.faiss_service import faiss_service
from app.core.security import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid
import hashlib
import imagehash
from PIL import Image
import io
import stepic

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)
generator = EmbeddingGenerator()

# ─── Free Zero-Cost Image Classification using Hugging Face CLIP ───────────────
# CLIP (Contrastive Language-Image Pretraining) by OpenAI, running 100% locally.
# No API key, no billing, no quota. Runs on CPU in ~100ms per image.
_clip_pipeline = None

def _get_clip_pipeline():
    """Lazy-load CLIP pipeline once on first use."""
    global _clip_pipeline
    if _clip_pipeline is None:
        try:
            from transformers import pipeline
            _clip_pipeline = pipeline(
                "zero-shot-image-classification",
                model="openai/clip-vit-base-patch32",
                device=-1  # CPU (no CUDA needed)
            )
            print("✅ CLIP zero-shot classifier loaded successfully (free, local, no billing).")
        except Exception as e:
            print(f"⚠️  CLIP load failed: {e} — will use fallback labels.")
            _clip_pipeline = None
    return _clip_pipeline

# Sports & media context labels CLIP will classify against
CLIP_CANDIDATE_LABELS = [
    "football", "basketball", "soccer", "tennis", "cricket", "rugby",
    "stadium", "sports arena", "athlete", "referee", "sports broadcast",
    "graphic design", "meme", "news screenshot", "nature", "portrait",
]

def get_image_labels(image_bytes: bytes) -> list:
    """
    Returns top-5 sports-context labels for the image using CLIP.
    Falls back to generic tags if CLIP is unavailable.
    Completely free — runs locally on CPU.
    """
    pipe = _get_clip_pipeline()
    if pipe is None:
        return ["sports", "media", "broadcast", "athlete", "stadium"]

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        # CLIP zero-shot classification against our sports taxonomy
        results = pipe(img, candidate_labels=CLIP_CANDIDATE_LABELS)
        # Return top 5 labels with score > 2% confidence
        top_labels = [r["label"] for r in results if r["score"] > 0.02][:5]
        return top_labels if top_labels else ["sports", "media"]
    except Exception as e:
        print(f"CLIP classification error: {e}")
        return ["sports", "media", "broadcast", "athlete", "stadium"]


@router.post("/upload")
@limiter.limit("20/minute")  # Strict Rate Limiting (Abuse Prevention)
async def upload(
    request: Request,
    file: UploadFile = File(...),
    # current_user: dict = Depends(get_current_user)  # Bypassed for hackathon MVP
):
    current_user = {"uid": "demo-user-123"}

    # Security: Content-type validation
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Security Error: File must be an image type (png, jpeg, jpg, webp)."
        )

    contents = await file.read()

    # Security: Payload size limit (10 MB)
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Security Error: File exceeds the 10MB limit.")

    asset_id = str(uuid.uuid4())

    try:
        filename = f"{current_user['uid']}/{asset_id}.png"  # PNG for lossless LSB watermark

        # 1. SHA-256 cryptographic hash (exact match)
        sha256_hash = hashlib.sha256(contents).hexdigest()

        # 2. Perceptual hash (resilient match — survives crop/resize/filter)
        img_pil = Image.open(io.BytesIO(contents)).convert('RGB')
        phash = str(imagehash.phash(img_pil))

        # 3. LSB Invisible Watermarking (embeds asset_id in pixel LSBs)
        watermark_msg = f"SportShield_Verified_{asset_id}".encode('utf-8')
        watermarked_pil = stepic.encode(img_pil, watermark_msg)
        watermarked_io = io.BytesIO()
        watermarked_pil.save(watermarked_io, format='PNG')
        watermarked_bytes = watermarked_io.getvalue()

        # 4. Upload watermarked image to Firebase Storage
        url = upload_image(watermarked_bytes, filename, content_type="image/png")

        # 5. Generate 1280-dim FAISS vector embedding
        embedding = generator.generate(contents)

        # 6. Free local image classification (CLIP — zero cost, no API)
        labels = get_image_labels(contents)

        # 7. Add embedding to FAISS vector index (auto-persists to Firebase)
        faiss_service.add(embedding, asset_id)

        # 8. Store metadata in Firestore
        from app.services.firebase_service import db
        from firebase_admin import firestore
        db.collection('images').document(asset_id).set({
            'url': url,
            'labels': labels,
            'owner_id': current_user['uid'],
            'sha256': sha256_hash,
            'phash': phash,
            'watermark_id': f"SportShield_Verified_{asset_id}",
            'timestamp': firestore.SERVER_TIMESTAMP
        })

        return {
            "id": asset_id,
            "url": url,
            "labels": labels,
            "metadata": {
                "sha256": sha256_hash,
                "phash": phash,
                "watermark_id": f"SportShield_Verified_{asset_id}"
            }
        }

    except Exception as e:
        print(f"Upload processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")