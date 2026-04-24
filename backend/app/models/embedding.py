import torch
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np

class EmbeddingGenerator:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = models.mobilenet_v2(pretrained=True)
        self.model.classifier = torch.nn.Sequential()  # remove classification head
        self.model = self.model.to(self.device)
        self.model.eval()
        self.transform = transforms.Compose([
            transforms.Resize(224),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def generate(self, image_bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = self.transform(image).unsqueeze(0).to(self.device)
        
        # Performance/Scalability enhancement: Mixed precision for faster inference
        with torch.no_grad():
            with torch.cuda.amp.autocast(enabled=(self.device.type == 'cuda')):
                features = self.model(image)
                # Global average pooling yields a semantic 1280-dimension vector
                embedding = torch.nn.functional.adaptive_avg_pool2d(features, (1, 1)).squeeze()
        return embedding.cpu().numpy()