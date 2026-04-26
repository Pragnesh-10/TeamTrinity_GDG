import faiss
import numpy as np
import pickle
import os

EMBEDDING_DIM = 1280  # Must match EmbeddingGenerator.EMBEDDING_DIM

class FAISSService:
    def __init__(self, dimension=EMBEDDING_DIM, index_path='faiss_index.pkl'):
        self.dimension = dimension
        self.index_path = os.path.join(os.path.dirname(__file__), '..', '..', index_path)
        # IndexFlatIP = Inner Product (equivalent to cosine similarity for L2-normalized vectors)
        self.index = faiss.IndexFlatIP(dimension)
        self.ids = []
        self.load_index()

    def add(self, embedding: np.ndarray, id: str):
        """Add a pre-normalized (1280,) embedding with its asset ID."""
        embedding = embedding.astype(np.float32).flatten()
        if embedding.shape[0] != self.dimension:
            raise ValueError(f"FAISSService.add: expected dim={self.dimension}, got {embedding.shape[0]}")
        # Re-normalize defensively (embedding.py does this too, but belt-and-suspenders)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        self.index.add(np.array([embedding], dtype=np.float32))
        self.ids.append(id)
        self.save_index()

    def search(self, embedding: np.ndarray, k=3):
        """Return top-k (asset_id, similarity_score) pairs. Returns [] if index empty."""
        if self.index.ntotal == 0:
            return []
        embedding = embedding.astype(np.float32).flatten()
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        actual_k = min(k, self.index.ntotal)
        D, I = self.index.search(np.array([embedding], dtype=np.float32), actual_k)
        results = []
        for j, i in enumerate(I[0]):
            if i != -1 and i < len(self.ids):
                results.append((self.ids[i], float(D[0][j])))
        return results

    def save_index(self):
        with open(self.index_path, 'wb') as f:
            pickle.dump((self.index, self.ids), f)
        # Scalability: Sync to Firebase Storage to persist across serverless restarts
        try:
            from app.services.firebase_service import backup_faiss_index
            backup_faiss_index(self.index_path)
        except Exception as e:
            print(f"Warning: Failed to backup FAISS index to Firebase: {e}")

    def load_index(self):
        # Try Firebase first if local index doesn't exist (cold-start recovery)
        if not os.path.exists(self.index_path):
            try:
                from app.services.firebase_service import restore_faiss_index
                restored = restore_faiss_index(self.index_path)
                if restored:
                    print("FAISS index restored from Firebase Storage.")
            except Exception as e:
                print(f"Warning: Could not restore FAISS index from Firebase: {e}")

        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, 'rb') as f:
                    self.index, self.ids = pickle.load(f)
                print(f"FAISS index loaded: {self.index.ntotal} vectors, dim={self.dimension}")
            except Exception as e:
                print(f"Warning: Corrupted FAISS index, reinitializing: {e}")
                self.index = faiss.IndexFlatIP(self.dimension)
                self.ids = []

faiss_service = FAISSService()