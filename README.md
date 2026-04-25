# SPORTSHIELD AI

**"We fingerprint sports media"**
**"We detect modified reuse"**
**"We simulate internet tracking"**
**"System flags misuse instantly"**

## 🚨 The Problem
Sports networks lose millions due to illegal streams, unauthorized uploads, and unsanctioned clips shared across social media and web platforms. Current detection tools require massive computational resources, rely on easily bypassable watermarks, or fail to appropriately differentiate blatant piracy from transformative Fair Use content (e.g. commentary, tactical breakdowns).

## 💡 The Solution
SportShield AI uses advanced Image Hash and Vector Fingerprinting (via PyTorch & FAISS) to embed digital fingerprints directly into the media's encoded features, not superficial pixels. Combined with a "FairPlay" Unbiased Context Analyzer, the model separates true piracy from transformative "Fair Use" to avoid unjustified mass DMCA takedowns. We also leverage Google Cloud Vision AI to classify and verify sports-related context natively.

## ⚙️ How it works
1. **Asset Fingerprinting**: Upload a source asset. The model generates a semantic vector embedding representing structural and visual features using an ImageNet architecture.
2. **Global Monitoring / Manual Scanning**: Provide a suspicious frame or video chunk. 
3. **Similarity Scoring**: FAISS search dynamically maps and compares embeddings, calculating a Similarity Confidence Score%.
4. **Context Analysis**: The system analyzes transcript simulation and visual overlays to determine Threat Level & Fair Use viability.
5. **Enforcement Action**: Instantly labels incidents as `HIGH`, `MEDIUM` or `LOW` risk and provides the option to automate DMCA workflows.

## 🚀 Demo Steps
1. **Take 3-5 images**, modify them (crop, resize, blur, add text), and save in `data/` to simulate "leaked content".
2. Start the React Frontend:
   ```bash
   cd frontend
   npm start
   ```
3. Start the FastAPI Backend:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
4. Open `http://localhost:3000` in your browser.
5. **Upload an original image** into the dashboard to register a new fingerprint ID.
6. **Upload a slightly modified version** (e.g., cropped, blurred, text-overlay). 
7. Confirm that SportShield AI flags the match, displays similarity & risk level, and outputs Google Vision AI content classification labels.

## 🛠 Tech Stack
- **Frontend**: React.js, TailwindCSS
- **Backend API**: Python, FastAPI
- **AI / ML**: PyTorch, Torchvision (MobileNet V2 for feature extraction), FAISS (Approximate Nearest Neighbors)
- **3rd Party Integration**: Google Cloud Vision API
- **Deployment**: Render / Google Cloud Run (Configurable)

## 📸 Screenshots
*(Add screenshots of your MVP here showing risk levels, detections, and UI interface)*
