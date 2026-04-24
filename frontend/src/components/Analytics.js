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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-extrabold text-blue-900">Real-Time Propagation Analytics</h2>
        <p className="text-gray-500 mt-2">Live tracking of unauthorized distributions and visibility gap anomalies detected by our automated web scrapers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-500 uppercase">Total Assets Tracked</h3>
          <p className="text-3xl font-black text-blue-900 mt-2">1,204</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-red-500 uppercase">Active Anomalies Detected</h3>
          <p className="text-3xl font-black text-red-700 mt-2">{anomalies.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-green-500 uppercase">Automated Takedowns (24h)</h3>
          <p className="text-3xl font-black text-green-700 mt-2">14</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <h3 className="font-bold text-gray-700">Live Propagation Feed</h3>
        </div>
        <div className="bg-white px-6 py-3 border-b flex justify-between items-center text-gray-800">
             <span className="font-bold">Location</span>
             <span className="font-bold">Match Data</span>
        </div>
        <div className="divide-y divide-gray-100">
          {anomalies.map((anom) => (
            <div key={anom.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors bg-white">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className={`p-3 rounded-full ${anom.isFairUse ? 'bg-green-100 text-green-600' : (anom.threatLevel === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600')}`}>
                  {anom.isFairUse ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{anom.location} <span className={`text-xs ml-2 px-2 py-0.5 rounded uppercase ${anom.isFairUse ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{anom.category}</span></p>
                  <p className="text-sm text-gray-500">Asset Ref: <span className="font-mono text-xs">{anom.assetId}</span> • Detected {anom.timestamp}</p>
                  {anom.reasoning && <p className="text-xs text-gray-400 mt-1 italic mt-1 max-w-lg truncate">"{anom.reasoning}"</p>}
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="font-black text-gray-800">{anom.similarity}% Vector Match</p>
                <button className={`mt-1 text-sm font-bold transition-colors ${anom.isFairUse ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}>Review Case ➔</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;