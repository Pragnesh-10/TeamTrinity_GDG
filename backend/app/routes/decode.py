from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from PIL import Image
import io
import stepic

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

WATERMARK_PREFIX = "SportShield_Verified_"

@router.post("/decode")
@limiter.limit("30/minute")
async def decode_watermark(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Extracts the hidden LSB (Least Significant Bit) watermark from an image.
    If the watermark matches the SportShield format, looks up the asset in Firebase.
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 10MB limit.")

    try:
        img_pil = Image.open(io.BytesIO(contents)).convert('RGB')
    except Exception:
        raise HTTPException(status_code=400, detail="Could not open image file.")

    # ── Extract LSB watermark using stepic ────────────────────────────────────
    try:
        raw_bytes = stepic.decode(img_pil)
        # stepic may return bytes or str depending on version
        if isinstance(raw_bytes, bytes):
            watermark_text = raw_bytes.decode('utf-8', errors='ignore').split('\x00')[0]
        else:
            watermark_text = str(raw_bytes).split('\x00')[0]

        # Strip non-printable characters
        watermark_text = ''.join(c for c in watermark_text if c.isprintable())
    except Exception as e:
        return {
            "watermark_found": False,
            "watermark_text": None,
            "asset_id": None,
            "asset_data": None,
            "message": f"Could not extract watermark: {str(e)}"
        }

    # ── Check if it's a SportShield watermark ─────────────────────────────────
    if not watermark_text or WATERMARK_PREFIX not in watermark_text:
        return {
            "watermark_found": False,
            "watermark_text": watermark_text or None,
            "asset_id": None,
            "asset_data": None,
            "message": "No SportShield watermark found. This image was not registered through SportShield."
        }

    # Extract the asset_id from the watermark string
    # Format: "SportShield_Verified_{uuid4}"
    asset_id = watermark_text.replace(WATERMARK_PREFIX, "").strip()

    # ── Lookup asset in Firebase ───────────────────────────────────────────────
    asset_data = None
    try:
        from app.services.firebase_service import get_image_by_id
        asset_data = get_image_by_id(asset_id)
    except Exception as e:
        print(f"Firebase lookup failed: {e}")

    return {
        "watermark_found": True,
        "watermark_text": watermark_text,
        "asset_id": asset_id,
        "asset_data": asset_data,
        "message": "SportShield watermark successfully decoded." if asset_data else "Watermark found but asset not in registry."
    }
