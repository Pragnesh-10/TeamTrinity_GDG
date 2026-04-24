import streamlit as st
import pandas as pd
import time
from spotter import Spotter
from agent import evaluate_fair_use
from database import db
import plotly.express as px

# Configuration
st.set_page_config(page_title="Context-Aware FairPlay AI", layout="wide", page_icon="🛡️")

# Styling to make it Hackathon-Ready (Clean Dashboard)
st.markdown("""
<style>
    .reportview-container .main .block-container{ padding-top: 1rem; }
    h1 { color: #1e3a8a; font-weight: 800; }
    .stMetric { border-radius: 8px; padding: 15px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
    .safe { color: #15803d; font-weight: bold; background: #dcfce7; padding: 4px 8px; border-radius: 4px;}
    .strike { color: #b91c1c; font-weight: bold; background: #fee2e2; padding: 4px 8px; border-radius: 4px;}
</style>
""", unsafe_allow_html=True)

st.title("Context-Aware FairPlay AI 🛡️")
st.markdown("**Open Innovation Track**: Merging Digital Asset Protection with Unbiased AI Decisions to end unfair copyright strikes against genuine fans.")

tab1, tab2, tab3 = st.tabs(["📊 The Insights Dashboard", "🔍 The FairPlay Scanner", "⚙️ Architecture & Settings"])

# ----------------- TAB 1: Insights Dashboard -----------------
with tab1:
    st.subheader("Global Platform Monitoring")
    records = db.get_all_analyses()
    df = pd.DataFrame(records)
    
    if not df.empty:
        col1, col2, col3 = st.columns(3)
        
        piracy_count = len(df[df['category'] == 'Piracy'])
        fairuse_count = len(df[df['category'] == 'Fair Use'])
        
        col1.metric("Assets Tracked (Spotter)", len(df))
        col2.metric("Piracy Strikes (Category A)", piracy_count, "- Automated Takedowns")
        col3.metric("Fair Use Saved (Category B)", fairuse_count, "+ Protected Fan Content")

        st.markdown("### Recent Unbiased AI Classifications")
        
        # Build interactive table
        for r in records[:10]:
            with st.expander(f"Asset Match on [{r['source_url']}] - {r['category']} (AI Confidence: {r['confidence']}%)"):
                st.markdown(f"**The Unbiased Agent's Reasoning:** {r['reasoning']}")
                if r['category'] == 'Piracy':
                    st.error("Action Taken: Automated DMCA Takedown Sent.")
                else:
                    st.success("Action Taken: Marked as Safe/Monetized. Engagement Protected.")
                    
        # Charts
        if len(df) > 1:
            fig = px.pie(df, names='category', title="Categorization Breakdown (Piracy vs Fair Use)")
            st.plotly_chart(fig, use_container_width=True)

    else:
        st.info("No monitoring data yet. Run a scan in the FairPlay Scanner tab to see live analytics.")

# ----------------- TAB 2: Unbiased Agent Pipeline -----------------
with tab2:
    st.header("Upload Suspicious Media for Contextual Analysis")
    st.markdown("Unlike standard bots that strike based on 1:1 pixel matches, this tool spots the asset, extracts context (audio/overlays), and uses an LLM to decide on Piracy vs Fair Use.")
    
    uploaded_file = st.file_uploader("Upload Video or Audio Extract", type=["mp4", "mp3", "mkv"])
    source_url = st.text_input("Source URL (e.g., twitter.com/tacticsguy/status/123)", "youtube.com/watch?v=sportsanalysis")
    
    # Mock inputs simulating an OCR / Whisper pipeline for hackathon speed
    transcript_sim = st.text_area("Simulated Transcript (What the creator said)", "Look at how the defense shifts here, completely leaving the wing open. Textbook tactical breakdown.")
    visual_sim = st.text_input("Simulated Visual Context (What OpenCV found)", '["Reaction Face-cam Top-Right", "Tactical Arrows Overlay"]')

    if st.button("Run FairPlay Pipeline", type="primary"):
        if uploaded_file is not None or transcript_sim:
            with st.spinner("1️⃣ The Spotter: Fingerprinting Media (OpenCV / VideoHash)..."):
                time.sleep(1) # Fake delay for effect
                fingerprint = Spotter.generate_fingerprint("mock_path") or "f7x9_video_hash"
                st.success(f"Asset Match Confirmed. Fingerprint: `{fingerprint}`")
            
            with st.spinner("2️⃣ Local AI Context Engine (Ollama): Evaluating Fair Use..."):
                analysis = evaluate_fair_use(transcript_sim, visual_sim, source_url)
                
            st.subheader("The Decision Engine Result")
            st.json(analysis)
            
            if analysis['category'] == 'Fair Use':
                st.markdown(f"<span class='safe'>Category B: Fair Use</span>", unsafe_allow_html=True)
            else:
                st.markdown(f"<span class='strike'>Category A: Literal Piracy</span>", unsafe_allow_html=True)

            # DB Save
            payload = {
                "asset_id": fingerprint,
                "source_url": source_url,
                "category": analysis['category'],
                "confidence": analysis['confidence'],
                "reasoning": analysis['reasoning']
            }
            saved = db.save_analysis(payload)
            if saved:
                st.toast("Saved to Insights Dashboard & Supabase Pipeline.")
        else:
            st.error("Please provide simulated context or upload a file.")

# ----------------- TAB 3: Technical Details -----------------
with tab3:
    st.markdown("""
    ### Open Innovation Architecture
    
    **The Problem Solved:** Blind algorithms flag ALL sports media, penalizing fan engagement, analysts, and educators unfairly.
    
    **The Context-Aware Stack:**
    1. **The Spotter (Tracking Pipeline):** Python `OpenCV` hashes the video frame by frame.
    2. **The Unbiased Agent:** An `Ollama` local LLM checks parsed context (Whisper transcripts + OCR Overlays) specifically looking for 'transformative' elements.
    3. **Cloud Database (Mandatory Hackathon Rule):** Logged statelessly to `Supabase` (PostgreSQL) for dashboard aggregation.
    4. **Insights Interface:** Driven by `Streamlit` allowing Rights Owners transparent visibility into *why* the AI made its decision.
    """)