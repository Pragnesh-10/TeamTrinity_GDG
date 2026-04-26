import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Decode = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/decode`, formData);
      setResult(response.data);
    } catch (error) {
      const detail = error.response?.data?.detail || 'Decode failed. Image may not contain a SportShield watermark.';
      setResult({ error: detail });
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) setFile(dropped);
  };

  return (
    <div className="max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-violet-900/40 border border-violet-500/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-widest">
          🧬 Steganographic Intelligence
        </div>
        <h2 className="text-5xl font-black text-white tracking-tight mb-4">
          Watermark <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Decoder</span>
        </h2>
        <p className="text-[#c7c4d7] text-lg max-w-2xl mx-auto leading-relaxed">
          Upload any image to extract its hidden <strong className="text-white">SportShield LSB watermark</strong>. If registered, the system will reveal the original asset ID and ownership record.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Upload */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={`relative border-2 border-dashed rounded-2xl h-72 flex flex-col items-center justify-center transition-all duration-200 overflow-hidden group
              ${dragOver ? 'border-violet-400 bg-violet-500/10 scale-[1.01]' :
                file ? 'border-violet-500 bg-violet-500/10' :
                'border-[#464554] hover:border-violet-400 bg-[#060e20] hover:bg-[#131b2e]'}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {!preview ? (
              <div className="text-center pointer-events-none group-hover:scale-105 transition-transform">
                <div className="text-5xl mb-4">🧬</div>
                <p className="text-[#c7c4d7] font-semibold text-lg">Drop image to decode watermark</p>
                <p className="text-[#908fa0] text-sm mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-70" />
                {/* Scanning animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-[#0b1326]/80 border border-violet-500/40 rounded-xl px-4 py-2 backdrop-blur-sm text-violet-300 text-sm font-bold">
                    🔬 {file.name}
                  </div>
                </div>
                {/* Scan line */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-0.5 bg-violet-400/60 blur-sm animate-bounce" style={{ marginTop: '50%' }} />
                </div>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 space-y-3">
            <p className="text-xs font-black text-[#908fa0] uppercase tracking-widest">How It Works</p>
            {[
              { step: '1', text: 'Reads the least-significant bits (LSBs) of each pixel' },
              { step: '2', text: 'Reconstructs the hidden UTF-8 watermark message' },
              { step: '3', text: 'Matches the asset ID against Firebase registry' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-900/50 border border-violet-700 text-violet-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                <p className="text-sm text-[#c7c4d7]">{s.text}</p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-3
              ${loading || !file
                ? 'bg-[#2d3449] text-[#908fa0] cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-900/40 hover:-translate-y-1'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Extracting Watermark...</span>
              </>
            ) : (
              <>
                <span>🧬</span>
                <span>Decode Hidden Watermark</span>
              </>
            )}
          </button>
        </form>

        {/* Right: Result */}
        <div className={`rounded-2xl border-2 p-7 transition-all duration-500 flex flex-col justify-center
          ${!result ? 'border-dashed border-[#464554] bg-[#060e20] opacity-60' :
            result.error ? 'border-[#464554] bg-[#131b2e]' :
            result.watermark_found ? 'border-violet-500 bg-violet-900/20 shadow-xl shadow-violet-900/30' :
            'border-[#464554] bg-[#131b2e]'}`}
        >
          {!result ? (
            <div className="text-center text-[#908fa0]">
              <div className="text-5xl mb-3 opacity-30">🧬</div>
              <p className="font-medium">Awaiting decode result...</p>
            </div>
          ) : result.error ? (
            <div className="text-center space-y-3">
              <div className="text-4xl">⚠️</div>
              <p className="text-rose-400 font-bold">Decode Failed</p>
              <p className="text-sm text-[#c7c4d7] bg-[#060e20] p-3 rounded-lg border border-[#2d3449]">{result.error}</p>
              <p className="text-xs text-[#908fa0]">This image may not have been registered through SportShield, or the watermark was destroyed by compression.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              {/* Status header */}
              <div className={`text-center p-4 rounded-xl border ${result.watermark_found ? 'bg-violet-900/40 border-violet-500' : 'bg-[#131b2e] border-[#464554]'}`}>
                <div className="text-4xl mb-2">{result.watermark_found ? '🔓' : '🔒'}</div>
                <h3 className={`text-xl font-black ${result.watermark_found ? 'text-violet-300' : 'text-[#908fa0]'}`}>
                  {result.watermark_found ? 'Watermark Extracted!' : 'No SportShield Watermark Found'}
                </h3>
              </div>

              {result.watermark_found && (
                <>
                  {/* Raw watermark */}
                  <div className="bg-[#060e20] border border-violet-500/30 rounded-xl p-5">
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Hidden Message Decoded</p>
                    <p className="text-sm text-emerald-300 font-mono break-all leading-relaxed">{result.watermark_text}</p>
                  </div>

                  {/* Asset ID */}
                  {result.asset_id && (
                    <div className="bg-[#131b2e] border border-[#2d3449] rounded-xl p-5 space-y-3">
                      <p className="text-[10px] font-black text-[#908fa0] uppercase tracking-widest">Registered Asset ID</p>
                      <p className="text-xs text-white font-mono bg-[#060e20] px-3 py-2 rounded-lg border border-[#2d3449] break-all">{result.asset_id}</p>

                      {result.asset_data ? (
                        <>
                          <p className="text-[10px] font-black text-[#908fa0] uppercase tracking-widest pt-2">Ownership Record</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-[#908fa0]">Owner ID</span>
                              <span className="text-white font-mono">{result.asset_data.owner_id}</span>
                            </div>
                            {result.asset_data.phash && (
                              <div className="flex justify-between text-xs">
                                <span className="text-[#908fa0]">pHash</span>
                                <span className="text-white font-mono">{result.asset_data.phash}</span>
                              </div>
                            )}
                            {result.asset_data.labels && result.asset_data.labels.length > 0 && (
                              <div className="pt-1">
                                <p className="text-[10px] text-[#908fa0] mb-1.5">AI Labels</p>
                                <div className="flex flex-wrap gap-1">
                                  {result.asset_data.labels.map((l, i) => (
                                    <span key={i} className="text-[9px] px-2 py-0.5 bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 rounded font-bold uppercase">{l}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <p className="text-xs text-emerald-300 font-bold">Ownership Verified via Firebase Registry</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-[#908fa0] italic">Asset ID found in watermark but not in the registry. May have been registered on a different deployment.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Decode;
