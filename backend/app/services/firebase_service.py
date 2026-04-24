import firebase_admin
from firebase_admin import credentials, storage, firestore
import os

# Assume serviceAccountKey.json in backend folder
cred_path = os.path.join(os.path.dirname(__file__), '..', '..', 'serviceAccountKey.json')
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
else:
    # For deployment, use env
    cred = credentials.ApplicationDefault()

firebase_admin.initialize_app(cred, {
    'storageBucket': os.getenv('FIREBASE_BUCKET', 'your-project.appspot.com')
})

db = firestore.client()
bucket = storage.bucket()

def upload_image(file_bytes, filename):
    blob = bucket.blob(filename)
    blob.upload_from_string(file_bytes, content_type='image/jpeg')
    blob.make_public()
    return blob.public_url

def save_metadata(id, url, embedding, user_id=None):
    doc_ref = db.collection('images').document(id)
    doc_ref.set({
        'url': url,
        'owner_id': user_id # Access Control Reference (IDOR Fix)
    })

def get_image_by_id(id):
    doc = db.collection('images').document(id).get()
    return doc.to_dict() if doc.exists else None

def get_user_images(user_id):
    """
    IDOR Fix: Replaces get_all_images(). Only queries firestore refs owned by the verified JWT session user
    """
    docs = db.collection('images').where('owner_id', '==', user_id).stream()
    return [{'id': doc.id, **doc.to_dict()} for doc in docs]

def backup_faiss_index(index_path):
    """Scalability & Statefulness: Backups local vector index to Firebase"""
    blob = bucket.blob('system/faiss_index.pkl')
    blob.upload_from_filename(index_path)

def restore_faiss_index(index_path):
    """Scalability & Statefulness: Restores vector index on container start"""
    blob = bucket.blob('system/faiss_index.pkl')
    if blob.exists():
        blob.download_to_filename(index_path)
        return True
    return False