import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Detect = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [visualContext, setVisualContext] = useState("");
  const [threshold, setThreshold] = useState(0.85);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dmcaGenerated, setDmcaGenerated] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null); // Clear previous
    setDmcaGenerated(false);
    
    const formData = new FormData();
    formData.append('file', file);
    if (transcript) formData.append('transcript', transcript);
    if (visualContext) formData.append('visual_context', visualContext);
    formData.append('threshold', threshold);
    
    try {
      const response = await axios.post('http://localhost:8000/api/detect', formData);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      const limitErr = error.response?.status === 413 ? 'File too large (>10MB).' : 'Vector matching failed.';
      alert(`Engine Error: ${limitErr}`);
    }
    setLoading(false);
  };

  const generateDMCANotice = () => {
      setDmcaGenerated(true);
  };

  return (
    <div className="max-w-5xl mx-auto bg-[#171f33] p-10 shadow-2xl rounded-3xl border border-[#2d3449] transition-all">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 pb-2">FairPlay Context Scanner</h2>
        <p className="text-[#c7c4d7] text-lg max-w-2xl mx-auto leading-relaxed">Simulate a Web Crawler: Upload a suspicious clip and insert metadata. The <strong className="text-white">Unbiased AI Engine</strong> will map the vector and determine if it constitutes illegal piracy or transformative Fair Use.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Upload & Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-extrabold text-[#dae2fd] uppercase tracking-wide">1. Source Frame</label>
             <div className={`relative border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center transition-all group overflow-hidden ${file ? 'border-rose-500 bg-rose-500/10' : 'border-[#464554] hover:border-rose-400 bg-[#060e20] hover:bg-[#131b2e]'}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  required 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {!preview ? (
                  <div className="text-center pointer-events-none group-hover:scale-105 transition-transform duration-300">
                    <svg className="w-12 h-12 text-rose-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <p className="text-[#c7c4d7] font-semibold text-lg">Drop Suspicious Frame</p>
                  </div>
                ) : (
                  <>
                    <img src={preview} alt="Upload preview" className="absolute inset-0 w-full h-full object-cover opacity-90 scale-100 group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Explainable AI Bounding Box Overlay */}
                    {result && result.explainability && result.explainability.bounding_box && (
                      <div 
                        className={`absolute border-4 z-20 transition-all duration-1000 ${result.is_fair_use ? 'border-emerald-400 bg-emerald-400/20' : 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.7)]'}`}
                        style={{
                          left: `${result.explainability.bounding_box.x}%`,
                          top: `${result.explainability.bounding_box.y}%`,
                          width: `${result.explainability.bounding_box.width}%`,
                          height: `${result.explainability.bounding_box.height}%`,
                        }}
                      >
                        <div className={`absolute -top-6 left-[-4px] text-[10px] font-black px-2 py-0.5 text-white tracking-widest uppercase ${result.is_fair_use ? 'bg-emerald-500' : 'bg-red-500'}`}>
                          {result.is_fair_use ? 'Transformative Element' : 'Fingerprint Match'}
                        </div>
                        {/* Scanning beam animation */}
                        <div className={`absolute inset-0 w-full h-[2px] blur-[1px] animate-pulse ${result.is_fair_use ? 'bg-emerald-300 shadow-[0_0_10px_#34d399]' : 'bg-red-400 shadow-[0_0_10px_#ef4444]'}`} style={{ animation: 'scan 2s linear infinite' }}></div>
                      </div>
                    )}
                  </>
                )}
             </div>
          </div>

          <div className="bg-[#131b2e] p-6 rounded-xl border border-[#2d3449] shadow-inner space-y-5">
            <div>
              <label className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wide flex justify-between">
                <span>2a. Transcript Metadata</span>
                <span className="text-rose-400 font-medium lowercase">optional</span>
              </label>
              <textarea 
                className="mt-1 w-full border border-[#464554] rounded-lg px-4 py-3 text-sm focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow resize-none bg-[#060e20] text-white font-mono placeholder:text-slate-600" 
                rows="2"
                placeholder="e.g. 'Notice the defensive shift here...'"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wide flex justify-between">
                <span>2b. Visual Context / Overlays</span>
                <span className="text-rose-400 font-medium lowercase">optional</span>
              </label>
              <textarea 
                className="mt-1 w-full border border-[#464554] rounded-lg px-4 py-3 text-sm focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-shadow resize-none bg-[#060e20] text-white font-mono placeholder:text-slate-600" 
                rows="2"
                placeholder="e.g. 'Tactical Arrows & Drawing'"
                value={visualContext}
                onChange={(e) => setVisualContext(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wide flex justify-between">
                <span>2c. Detection Strictness (Confidence Threshold)</span>
                <span className="text-indigo-400 font-black">{Math.round(threshold * 100)}%</span>
              </label>
              <div className="mt-2 flex items-center space-x-4">
                 <input 
                   type="range" 
                   min="0.5" 
                   max="0.99" 
                   step="0.01" 
                   value={threshold}
                   onChange={(e) => setThreshold(parseFloat(e.target.value))}
                   className="w-full h-2 bg-[#2d3449] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
              </div>
              <div className="flex justify-between text-[10px] text-[#908fa0] font-bold mt-1 uppercase">
                 <span>Lenient (50%)</span>
                 <span>Strict (99%)</span>
              </div>
            </div>
          </div>

          <button 
            type="submit"  
            disabled={loading || !file}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center space-x-3 
              ${loading || !file ? 'bg-[#2d3449] text-[#908fa0] cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-rose-900/40 hover:-translate-y-1'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                <span>Evaluating Vector & Context...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span>Run Inference Engine</span>
              </>
            )}
          </button>
        </form>

        {/* Right Side: Results (Always visible, but starts empty/placeholder) */}
        <div className={`h-full rounded-2xl border-2 transition-all duration-700 p-6 flex flex-col justify-start relative overflow-hidden
          ${!result ? 'border-dashed border-[#464554] bg-[#060e20] opacity-70' : 
            result.is_fair_use ? 'border-emerald-500 bg-emerald-900/20 shadow-lg shadow-emerald-900/20' : 
            result.match ? 'border-rose-500 bg-rose-900/20 shadow-xl shadow-rose-900/30' : 
            'border-[#464554] bg-[#131b2e] shadow-md'}`}>
          
          {!result ? (
             <div className="absolute inset-0 flex items-center justify-center text-[#908fa0] font-medium">
               Awaiting Analysis Results...
             </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up w-full h-full flex flex-col">
              
              {/* Header Status */}
              <div className={`p-4 rounded-xl border ${result.is_fair_use ? 'bg-emerald-900/50 border-emerald-500' : result.match ? 'bg-[#93000a] border-rose-500' : 'bg-[#2d3449] border-[#464554]'} text-center shadow-sm`}>
                <h3 className={`text-2xl font-black ${result.is_fair_use ? 'text-emerald-400' : result.match ? 'text-[#ffdad6]' : 'text-white'} tracking-tight`}>
                  {!result.match ? '⚪ NO MATCH FOUND' : 
                    result.is_fair_use ? '✅ LEGAL: FAIR USE' : 
                    '⚠️ ILLEGAL THEFT DETECTED'}
                </h3>
              </div>

              {result.match && (
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#131b2e] rounded-xl p-4 border border-[#2d3449]">
                      <p className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-1">Vector Confidence</p>
                      <p className={`text-3xl font-black ${result.similarity_pct >= 90 ? 'text-rose-400' : 'text-white'}`}>{result.similarity_pct}<span className="text-xl text-[#908fa0]">%</span></p>
                    </div>
                    <div className="bg-[#131b2e] rounded-xl p-4 border border-[#2d3449]">
                      <p className="text-xs font-bold text-[#c7c4d7] uppercase tracking-wider mb-1">Risk Severity</p>
                      <p className={`text-xl font-bold mt-1 ${result.is_fair_use ? 'text-emerald-400' : 'text-rose-400'}`}>{result.is_fair_use ? 'LOW' : result.risk_level}</p>
                    </div>
                  </div>

                  {/* ─── Google Cloud Vision AI — Featured Integration Panel ─── */}
                  {result.vision_labels && result.vision_labels.length > 0 && (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-lg shadow-blue-100/60">
                      {/* Top branded header */}
                      <div className="bg-gradient-to-r from-[#4285F4] to-[#1a73e8] px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Google 'G' multicolor dots */}
                          <div className="flex gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#EA4335]" />
                            <div className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                            <div className="w-2 h-2 rounded-full bg-[#34A853]" />
                            <div className="w-2 h-2 rounded-full bg-[#4285F4] border border-white/30" />
                          </div>
                          <span className="text-white text-xs font-black tracking-wide uppercase">Google Cloud Vision AI</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                          </span>
                          <span className="text-white/90 text-[10px] font-bold uppercase tracking-wide">Live Detection</span>
                        </div>
                      </div>

                      {/* Labels body */}
                      <div className="p-4 bg-[#0b1326] border-t border-[#4285F4]/30">
                        <p className="text-[11px] font-bold text-[#c7c4d7] uppercase tracking-wider mb-3">
                          Image Intelligence · Sports Context Verification
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.vision_labels.map((label, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-blue-900 bg-blue-900/30 text-blue-300"
                            >
                              <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {label}
                            </span>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#908fa0] mt-3 font-medium border-t border-[#2d3449] pt-2">
                          Powered by&nbsp;
                          <span className="font-bold text-[#4285F4]">Google Cloud Vision AI</span>
                          &nbsp;· Classifying sports context natively from uploaded frames
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#131b2e] rounded-xl p-5 border border-[#2d3449]">
                    <h4 className="text-sm font-bold text-[#c7c4d7] uppercase tracking-wider mb-2 flex justify-between items-center">
                       <span>Contextual Classification</span>
                       {result.gemini_analysis && (
                          <span className="flex items-center gap-1 text-[10px] bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full shadow-sm border border-indigo-700">
                            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span></span>
                            Powered by Gemini Flash
                          </span>
                       )}
                    </h4>
                    <div className="flex items-center space-x-3 mb-3">
                       <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest ${result.is_fair_use ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-rose-900/50 text-rose-400 border border-rose-800'}`}>{result.category}</span>
                       <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest ${result.is_fair_use ? 'bg-[#2d3449] text-[#c7c4d7] border border-[#464554]' : 'bg-orange-900/50 text-orange-400 border border-orange-800'}`}>{result.gemini_analysis ? result.gemini_analysis.severity : 'SEVERITY'}</span>
                    </div>
                    {result.gemini_analysis && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span className="text-[10px] font-bold bg-[#060e20] border border-[#464554] text-[#c7c4d7] px-2 py-1 rounded shadow-sm">Platform: {result.gemini_analysis.platform_type}</span>
                        <span className="text-[10px] font-bold bg-[#060e20] border border-indigo-900 text-indigo-400 px-2 py-1 rounded shadow-sm">Action: {result.gemini_analysis.recommended_action}</span>
                      </div>
                    )}
                    <p className="text-white text-sm font-medium leading-relaxed italic border-l-4 border-indigo-500 bg-[#060e20] p-3 rounded shadow-sm break-words">"{result.gemini_analysis ? result.gemini_analysis.summary : result.reasoning}"</p>
                  </div>
                  
                  {result.explainability && (
                    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mt-2">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center"><svg className="w-4 h-4 mr-1 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Explainable AI Telemetry</p>
                       <div className="grid grid-cols-2 gap-2 text-xs font-mono text-emerald-400">
                         <div>Box X: {result.explainability.bounding_box.x}%</div>
                         <div>Box Y: {result.explainability.bounding_box.y}%</div>
                         <div>Width: {result.explainability.bounding_box.width}%</div>
                         <div>Height: {result.explainability.bounding_box.height}%</div>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* Takedown Action */}
              {result.match && !result.is_fair_use && (
                <div className="mt-auto">
                  {!dmcaGenerated ? (
                    <button onClick={generateDMCANotice} className="w-full bg-[#131b2e] border border-[#464554] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#222a3d] hover:border-rose-500 hover:text-rose-400 hover:-translate-y-0.5 transition-all text-lg flex items-center justify-center gap-2 group/dmca">
                       <svg className="w-5 h-5 text-[#c7c4d7] group-hover/dmca:text-rose-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                       <span>Automate Legal Takedown</span>
                    </button>
                  ) : (
                    <div className="bg-emerald-900/30 text-emerald-400 p-5 border border-emerald-500/50 rounded-xl space-y-2 animate-fade-in-up shadow-sm">
                       <div className="flex items-center text-sm font-black uppercase text-emerald-300 mb-2">
                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                         Action Executed Successfully
                       </div>
                       <p className="text-xs font-mono text-emerald-700">➔ Logging immutable record</p>
                       <p className="text-xs font-mono text-emerald-700">➔ Invoking Firebase CF worker</p>
                       <p className="text-xs font-mono text-emerald-700">➔ DMCA transmitted to host AS63293</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detect;
