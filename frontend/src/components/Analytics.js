import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    // Simulating real-time web crawler hits and propagation anomalies
    const mockData = [
      { id: 1, assetId: '98f2-4b1a', location: 'reddit.com/r/sports', timestamp: '2 mins ago', similarity: 98.5, threatLevel: 'High' },
      { id: 2, assetId: '33a1-9c88', location: 'unknown-blog.ru', timestamp: '15 mins ago', similarity: 92.1, threatLevel: 'Critical' },
      { id: 3, assetId: '11x9-p002', location: 'twitter.com/user99', timestamp: '1 hour ago', similarity: 88.0, threatLevel: 'Medium' }
    ];
    setAnomalies(mockData);
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
        <div className="bg-white px-6 py-3 border-b flex justify-between items-center text-gray-800">
             <span className="font-bold">Location</span>
             <span className="font-bold">Match Data</span>
        </div>
        <div className="divide-y divide-gray-100">
          {anomalies.map((anom) => (
            <div key={anom.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors bg-white">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${anom.threatLevel === 'Critical' ? 'bg-red-100 text-red-600' : anom.threatLevel === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{anom.location}</p>
                  <p className="text-sm text-gray-500">Asset Ref: <span className="font-mono text-xs">{anom.assetId}</span> • Detected {anom.timestamp}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-800">{anom.similarity}% Match</p>
                <button className="mt-1 text-sm font-bold text-red-600 hover:text-red-800 transition-colors">Review Case ➔</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;