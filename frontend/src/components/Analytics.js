import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/detections');
        const apiData = response.data.map(d => ({
          id: d.id,
          assetId: d.assetId,
          location: d.location || 'Unknown Network Node',
          timestamp: d.detectedAt ? new Date(d.detectedAt).toLocaleString() : 'Just now',
          similarity: (d.similarity * 100).toFixed(2),
          threatLevel: d.threatLevel || 'Medium',
          category: d.category || 'Piracy',
          reasoning: d.reasoning || '',
          isFairUse: d.status === 'safe'
        }));
        setAnomalies(apiData);
      } catch (error) {
        console.error("Failed to load live tracking data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Polling mechanism since Firebase is handled strictly server-side for security
    fetchDetections();
    const interval = setInterval(fetchDetections, 15000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="mb-10 pb-6 border-b border-slate-200">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Real-Time Propagation Analytics</h2>
        <p className="text-slate-500 mt-3 text-lg leading-relaxed">Live tracking of unauthorized distributions and visibility gap anomalies detected by automated FAISS vector scrapers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             </div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Assets Vaulted</h3>
          </div>
           <p className="text-4xl font-black text-slate-900">1,204</p>
        </div>

        <div className="bg-rose-50 p-8 rounded-3xl shadow-sm border border-rose-200 hover:shadow-lg transition-shadow relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-200 rounded-full blur-2xl opacity-50"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
             <div className="bg-white p-2 rounded-xl text-rose-500 shadow-sm border border-rose-100">
               <span className="relative flex h-3 w-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
               </span>
             </div>
             <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest">Active Anomalies</h3>
          </div>
          <p className="text-4xl font-black text-rose-700 relative z-10">{anomalies.length}</p>
        </div>

        <div className="bg-emerald-50 p-8 rounded-3xl shadow-sm border border-emerald-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-white p-2 rounded-xl text-emerald-500 shadow-sm border border-emerald-100">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
             <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Automated Takedowns (24h)</h3>
          </div>
          <p className="text-4xl font-black text-emerald-800">14</p>
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/40 rounded-3xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-50/80 border-b border-slate-100 px-8 py-5">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
             <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             Live Propagation Feed
          </h3>
        </div>
        
        {loading ? (
          <div className="p-10 text-center text-slate-400 font-medium flex items-center justify-center gap-3">
             <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
             Connecting to Vector Network...
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium">
             No anomalies detected in the current index.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {anomalies.map((anom) => (
              <div key={anom.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors bg-white group">
                <div className="flex items-start md:items-center space-x-6 mb-4 md:mb-0">
                  <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-105 shadow-sm ${anom.isFairUse ? 'bg-emerald-100 text-emerald-600' : (anom.threatLevel === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600')}`}>
                    {anom.isFairUse ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-lg flex items-center gap-3">
                      {anom.location} 
                      <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-black shadow-sm ${anom.isFairUse ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>{anom.category}</span>
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Asset Vault Ref: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{anom.assetId}</span> <span className="mx-2">•</span> Detected: <span className="text-slate-600">{anom.timestamp}</span></p>
                    {anom.reasoning && <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100 truncate md:max-w-2xl">"{anom.reasoning}"</p>}
                  </div>
                </div>
                <div className="text-left md:text-right ml-[4.5rem] md:ml-0 md:pl-6 border-l-0 md:border-l border-slate-100 md:shrink-0">
                  <p className="font-black text-slate-800 text-2xl">{anom.similarity}<span className="text-lg text-slate-400">%</span></p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Vector Match</p>
                  <button className={`text-sm font-bold transition-all px-4 py-2 rounded-lg border flex items-center gap-2 group/btn ${anom.isFairUse ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100' : 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100 hover:text-rose-900'}`}>
                     <span>Review Case</span>
                     <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
