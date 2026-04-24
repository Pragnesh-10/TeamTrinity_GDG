import faiss
import numpy as np
import pickle
import os

class FAISSService:
    def __init__(self, dimension=1280, index_path='faiss_index.pkl'):
        self.dimension = dimension
        self.index_path = os.path.join(os.path.dirname(__file__), '..', '..', index_path)
        self.index = faiss.IndexFlatIP(dimension)
        self.ids = []
        self.load_index()

    def add(self, embedding, id):
        embedding = embedding / np.linalg.norm(embedding)
        self.index.add(np.array([embedding], dtype=np.float32))
        self.ids.append(id)
        self.save_index()

    def search(self, embedding, k=3):
        embedding = embedding / np.linalg.norm(embedding)
        D, I = self.index.search(np.array([embedding], dtype=np.float32), k)
        results = []
        for j, i in enumerate(I[0]):
            if i != -1 and i < len(self.ids):
                results.append((self.ids[i], float(D[0][j])))
        return results

    def save_index(self):
        with open(self.index_path, 'wb') as f:
            pickle.dump((self.index, self.ids), f)
        # Scalability Check: Sync to Firebase Storage to persist across serverless instances
        try:
            from app.services.firebase_service import backup_faiss_index
            backup_faiss_index(self.index_path)
        except Exception as e:
            print(f"Failed to backup to Firebase: {e}")

    def load_index(self):
        # Scalability Check: Try downloading from Firebase first if local doesn't exist
        if not os.path.exists(self.index_path):
            try:
                from app.services.firebase_service import restore_faiss_index
                restore_faiss_index(self.index_path)
            except Exception as e:
                print(f"Failed to restore from Firebase: {e}")
                
        if os.path.exists(self.index_path):
            with open(self.index_path, 'rb') as f:
                self.index, self.ids = pickle.load(f)

faiss_service = FAISSService()