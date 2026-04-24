# Context-Aware FairPlay AI 🛡️

**Open Innovation Track Submission:** Merging "Digital Asset Protection" with "Unbiased AI Decisions" to stop piracy without unjustly punishing fair-use fan engagement.

## 🌟 The Problem
Standard automated takedown bots (like YouTube's ContentID) are notoriously biased and blind to context. They flag everything that contains proprietary sports footage. This unjustly penalizes genuine fan engagement—like independent tactical analyses, educational breakdowns, and commentary—leading to unfair copyright strikes, while real piracy often slips through.

## 🚀 The Solution: Context-Aware FairPlay AI
An aggressive spotting pipeline mixed with an **Intelligent, Unbiased AI Decision Layer**. Instead of instantly striking a video, our system analyzes the context (transcripts, visual overlays, audio commentary) to distinguish between raw piracy and transformative 'Fair Use' content.

### The Workflow:
1. **The Spotter (Asset Tracking):** A Python OpenCV/VideoHash backend continuously monitors platforms for proprietary sports footage using video fingerprinting.
2. **The Unbiased Agent (Contextual Analysis):** When a match is found, an open-source local AI (Ollama/Llama3) analyzes the video's transcript, audio commentary, and visual overlays to evaluate the context.
3. **The Decision Engine:** 
   - **Category A (Piracy):** 1:1 re-upload with no added value (Flags for immediate DMCA takedown).
   - **Category B (Fair Use):** A creator adding voiceover analysis, statistical overlays, or commentary (Flags as Safe / Engagement Protected).
4. **The Insights Dashboard:** A data-rich interface where organizations view analytics on how their media is spreading and review the AI's transparent reasoning.

---

## 🛠️ Recommended Tech Stack
*   **Video Tracking & Processing (The Spotter):** OpenCV combined with VideoHash (Python).
*   **AI Context Engine (The Unbiased Agent):** Ollama running local LLMs (Powerful, unbiased decision-making without cloud API costs).
*   **Analytics Dashboard (The Insights Interface):** Streamlit for rapid, data-heavy UI.
*   **Cloud Database (Mandatory Hackathon Rule):** Supabase (PostgreSQL) for scalable backend data.

---

## 💻 Quick Start Guide for Development / Hackathon

The MVP is built in Python and runs a simulated pipeline perfect for Hackathon pitches.

1. Navigate to the fairplay folder:
   ```bash
   cd fairplay
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional but Recommended) Start your local Ollama server if you have it installed:
   ```bash
   ollama run llama3
   ```
   *(Note: The app contains a strict fallback if Ollama isn't running so your live demo won't crash!)*

4. Run the Streamlit Dashboard:
   ```bash
   streamlit run app.py
   ```

5. (Database Rule) Ensure your Supabase keys are in a `.env` file for remote functionality, otherwise it gracefully falls back to a local SQLite Database (`fairplay.db`) so your demo runs flawlessly on-stage.

```env
SUPABASE_URL=test
SUPABASE_KEY=test
```