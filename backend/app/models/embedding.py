import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import torch
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np

EMBEDDING_DIM = 1280  # MobileNet V2 penultimate feature dimension

class EmbeddingGenerator:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        from torchvision.models import MobileNet_V2_Weights
        self.model = models.mobilenet_v2(weights=MobileNet_V2_Weights.IMAGENET1K_V1)
        # Remove the classifier head — keep only the feature extractor
        self.model.classifier = torch.nn.Identity()
        self.model = self.model.to(self.device)
        self.model.eval()
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def generate(self, image_bytes: bytes) -> np.ndarray:
        """
        Returns a L2-normalized (1280,) float32 embedding.
        Always safe to feed directly into FAISSService.add() / FAISSService.search().
        """
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            # MobileNet V2 features() → (1, 1280, 7, 7) before classifier
            features = self.model.features(tensor)
            # Global average pool → (1, 1280, 1, 1) → flatten → (1280,)
            pooled = torch.nn.functional.adaptive_avg_pool2d(features, (1, 1))
            embedding = pooled.squeeze().cpu().numpy().astype(np.float32)

        # Guarantee shape is exactly (1280,) — FAISS will reject anything else
        embedding = embedding.flatten()
        assert embedding.shape == (EMBEDDING_DIM,), (
            f"Embedding shape mismatch: expected ({EMBEDDING_DIM},), got {embedding.shape}"
        )

        # L2-normalize so cosine similarity == inner product (FAISS IndexFlatIP)
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        return embedding