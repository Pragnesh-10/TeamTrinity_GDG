import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Images = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await axios.get(`${API_URL}/api/images`);
        setImages(response.data);
      } catch (error) {
        console.error('Failed to load vault:', error);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-sans">
      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-[#2d3449] mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <svg className="w-9 h-9 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              Protected Media Vault
            </h2>
            <p className="text-[#c7c4d7] mt-2 text-base max-w-2xl leading-relaxed">
              All assets legally registered with AI-generated vector fingerprints, pHash, SHA-256 hashes, and invisible LSB watermarks for rapid infringement detection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#171f33] border border-[#2d3449] px-5 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest">Total Assets</p>
              <p className="text-2xl font-black text-white">{images.length}</p>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-500/30 px-5 py-3 rounded-2xl text-center">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Status</p>
              <p className="text-sm font-black text-emerald-300">Active</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[#908fa0] font-medium text-sm">Loading secure vault...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-[#171f33] border border-[#2d3449] rounded-full p-8 mb-6">
            <svg className="w-12 h-12 text-[#464554]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#c7c4d7] font-semibold text-lg mb-2">Vault is Empty</p>
          <p className="text-[#908fa0] text-sm">Register your first asset to generate a secure vector fingerprint.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {images.map(img => (
            <div
              key={img.id}
              className="group bg-[#171f33] rounded-2xl border border-[#2d3449] overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-900/20 transition-all duration-300 relative"
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden h-48 bg-[#060e20]">
                <img
                  src={img.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt="Protected asset"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#0b1326]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-[#171f33]/90 border border-[#2d3449] rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-xs font-bold text-white">LSB Watermarked</span>
                  </div>
                </div>
                {/* Active badge */}
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Protected
                  </span>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 space-y-3">
                {/* Asset ID */}
                <div>
                  <p className="text-[9px] font-black text-[#908fa0] uppercase tracking-widest mb-1">Asset ID</p>
                  <p className="text-[10px] text-[#c7c4d7] font-mono truncate bg-[#060e20] px-2 py-1 rounded border border-[#2d3449]">
                    {img.id}
                  </p>
                </div>

                {/* Hash info */}
                {img.sha256 && (
                  <div>
                    <p className="text-[9px] font-black text-[#908fa0] uppercase tracking-widest mb-1">SHA-256</p>
                    <p className="text-[10px] text-[#c7c4d7] font-mono truncate bg-[#060e20] px-2 py-1 rounded border border-[#2d3449]">
                      {img.sha256.substring(0, 32)}…
                    </p>
                  </div>
                )}

                {/* Labels (from CLIP) */}
                {img.labels && img.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {img.labels.slice(0, 3).map((lbl, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 rounded font-bold uppercase tracking-wide"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Images;