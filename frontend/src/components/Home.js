import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ value, label, icon, color }) => (
  <div className={`bg-[#171f33] border ${color} rounded-2xl p-6 flex items-center gap-5 hover:scale-105 transition-transform duration-300`}>
    <div className={`text-4xl`}>{icon}</div>
    <div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-xs font-bold text-[#908fa0] uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  </div>
);

const FeatureCard = ({ to, icon, title, desc, badge, color }) => (
  <Link to={to} className={`group block bg-[#171f33] border border-[#2d3449] hover:border-${color}-500/50 rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:shadow-${color}-900/20 hover:-translate-y-1`}>
    <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-extrabold text-white">{title}</h3>
      {badge && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-${color}-900/50 text-${color}-300 border border-${color}-700/50 uppercase tracking-wide`}>{badge}</span>}
    </div>
    <p className="text-sm text-[#c7c4d7] leading-relaxed">{desc}</p>
    <div className={`mt-5 flex items-center gap-1 text-xs font-bold text-${color}-400 group-hover:gap-3 transition-all`}>
      <span>Open</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
    </div>
  </Link>
);

const Home = () => {
  const [stats, setStats] = useState({ assets: '—', detections: '—', piracy: '—', fairUse: '—' });
  const [recentDetections, setRecentDetections] = useState([]);

  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    // Load health stats
    axios.get(`${API_URL}/health`).then(r => {
      setStats(s => ({ ...s, assets: r.data.index_size ?? '—' }));
    }).catch(() => {});

    // Load recent detections for the mini-feed
    axios.get(`${API_URL}/api/detections`).then(r => {
      const data = r.data || [];
      const piracy = data.filter(d => d.status !== 'safe').length;
      const fairUse = data.filter(d => d.status === 'safe').length;
      setStats(s => ({ ...s, detections: data.length, piracy, fairUse }));
      setRecentDetections(data.slice(0, 4));
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-sans space-y-14">

      {/* ── Hero ── */}
      <div className="relative text-center pt-10 pb-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            GDG Hackathon 2026 · Live MVP
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
            Sport<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Shield</span>
            <span className="block text-3xl md:text-4xl font-bold text-[#c7c4d7] mt-3">AI-Powered Sports IP Protection</span>
          </h1>

          <p className="text-[#c7c4d7] text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            We fingerprint sports media using <strong className="text-white">FAISS vector embeddings</strong>, detect unauthorized redistribution with <strong className="text-white">perceptual hashing</strong>, and classify Fair Use vs Piracy with <strong className="text-white">zero-cost AI</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/upload" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 py-4 rounded-xl shadow-2xl shadow-indigo-900/50 hover:-translate-y-1 transition-all flex items-center gap-2 text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Register Your First Asset
            </Link>
            <Link to="/detect" className="bg-[#171f33] border border-[#2d3449] hover:border-rose-500/50 text-white font-bold px-8 py-4 rounded-xl hover:-translate-y-1 transition-all flex items-center gap-2 text-base">
              <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Scan Suspicious Content
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard value={stats.assets} label="Assets Fingerprinted" icon="🗄️" color="border-indigo-500/30" />
        <StatCard value={stats.detections} label="Total Detections" icon="📡" color="border-rose-500/30" />
        <StatCard value={stats.piracy} label="Piracy Strikes" icon="⚠️" color="border-orange-500/30" />
        <StatCard value={stats.fairUse} label="Fair Use Cleared" icon="✅" color="border-emerald-500/30" />
      </div>

      {/* ── Feature Grid ── */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white">Platform Features</h2>
          <p className="text-[#908fa0] text-sm mt-1">Everything you need to protect, detect and enforce sports IP at scale.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard to="/upload" icon="🔐" title="Asset Registration" desc="Generate SHA-256, perceptual hash, and a 1280-dim FAISS vector fingerprint. Embeds invisible LSB watermark into every pixel." badge="Core" color="indigo" />
          <FeatureCard to="/detect" icon="🔍" title="FairPlay Scanner" desc="Upload a suspected piracy clip. AI maps the vector and determines if it's illegal theft or transformative Fair Use commentary." badge="AI Engine" color="rose" />
          <FeatureCard to="/decode" icon="🧬" title="Watermark Decoder" desc="Extract the hidden SportShield watermark from any image to instantly reveal its registered owner and asset ID." badge="New" color="violet" />
          <FeatureCard to="/spotter" icon="🤖" title="Autonomous Spotter" desc="Simulated live crawler scanning social feeds and NFT marketplaces, matching every frame against the FAISS index in real-time." badge="Live" color="emerald" />
          <FeatureCard to="/images" icon="🏛️" title="Media Vault" desc="Browse all registered assets with their cryptographic hashes, AI labels, and LSB watermark IDs in a secure dark-mode gallery." color="blue" />
          <FeatureCard to="/analytics" icon="📊" title="Propagation Analytics" desc="Real-time charts showing piracy vs fair-use breakdown, vector similarity distribution, and detection timeline across the platform." badge="Live" color="purple" />
        </div>
      </div>

      {/* ── Tech Stack ── */}
      <div className="bg-gradient-to-r from-[#0f1729] to-[#171f33] rounded-3xl border border-[#2d3449] p-8">
        <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          Tech Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'PyTorch + MobileNet V2', desc: '1280-dim feature extraction', icon: '🧠' },
            { label: 'FAISS', desc: 'Approximate nearest-neighbour search', icon: '⚡' },
            { label: 'CLIP (HuggingFace)', desc: 'Zero-cost image classification', icon: '🔮' },
            { label: 'Firebase', desc: 'Firestore + Storage persistence', icon: '🔥' },
            { label: 'FastAPI', desc: 'High-performance Python API', icon: '🚀' },
            { label: 'stepic', desc: 'Invisible LSB steganography', icon: '🕵️' },
            { label: 'React + Recharts', desc: 'Real-time dashboard UI', icon: '📊' },
            { label: 'SHA-256 + pHash', desc: 'Dual-layer hash fingerprinting', icon: '🔑' },
          ].map(t => (
            <div key={t.label} className="bg-[#0b1326] border border-[#2d3449] rounded-xl p-4">
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-sm font-bold text-white">{t.label}</p>
              <p className="text-[11px] text-[#908fa0] mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      {recentDetections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-extrabold text-white">Recent Detections</h2>
            <Link to="/analytics" className="text-indigo-400 text-sm font-bold hover:text-indigo-300 flex items-center gap-1">
              View All <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
          <div className="space-y-3">
            {recentDetections.map(d => (
              <div key={d.id} className="bg-[#171f33] border border-[#2d3449] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${d.status === 'safe' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div>
                    <p className="text-sm font-bold text-white">{d.location || 'Manual Scan'}</p>
                    <p className="text-[11px] text-[#908fa0] font-mono">Asset: {d.assetId?.substring(0, 16)}…</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${d.status === 'safe' ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-rose-900/50 text-rose-300 border border-rose-700'}`}>
                    {d.category || 'Unknown'}
                  </span>
                  <span className="text-sm font-black text-white">{d.similarity ? (d.similarity * 100).toFixed(0) : '—'}<span className="text-[#908fa0] font-normal">%</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
