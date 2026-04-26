from PIL import Image
import io
import hashlib
import imagehash
import stepic

# Create valid random image
img_pil = Image.new('RGB', (100, 100), color = 'red')

contents = io.BytesIO()
img_pil.save(contents, format='JPEG')
contents = contents.getvalue()

sha256_hash = hashlib.sha256(contents).hexdigest()
img_pil2 = Image.open(io.BytesIO(contents)).convert('RGB')
phash = str(imagehash.phash(img_pil2))
watermark_msg = b"SportShield_Verified_12345"

print("Executing stepic.encode...")
try:
    watermarked_pil = stepic.encode(img_pil2, watermark_msg)
    print("Success")
except Exception as e:
    print("Error:", e)
