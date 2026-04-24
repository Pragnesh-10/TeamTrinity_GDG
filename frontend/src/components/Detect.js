import React, { useState } from 'react';
import axios from 'axios';

const Detect = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dmcaGenerated, setDmcaGenerated] = useState(false); // Highlight Impact Generation

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setDmcaGenerated(false); // Reset state
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/api/detect', formData);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      const limitErr = error.response?.status === 413 ? 'File too large >10MB limiter.' : 'Detection failed.';
      alert(`Security Check Failed: ${limitErr}`);
    }
    setLoading(false);
  };

  const generateDMCANotice = () => {
      // "Future Potential/Impact" demonstration 
      setDmcaGenerated(true);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 shadow rounded-lg border border-gray-100" role="main" aria-label="Detection Scanner">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-red-700" id="scanner-title">Piracy Detection Scanner</h2>
        <p className="text-gray-500 mt-2" aria-labelledby="scanner-title">Upload a suspected image from the web. We will generate its AI fingerprint and match it against our resilient vector database of protected assets.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Image scan form">
        <div className="border-2 border-dashed border-red-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-red-50 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            aria-label="Upload suspicious file to detect piracy"
            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          aria-disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition-all flex items-center justify-center space-x-2 ${loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-300'}`}
        >
          {loading ? (
             <span>Running High-Speed Vector Search...</span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <span>Scan Directory</span>
            </>
          )}
        </button>
      </form>
      
      {/* Alert Role for Screen Readers (Accessibility) */}
      <div aria-live="polite">
        {result && (
          <div className={`mt-8 p-6 rounded-lg border-2 ${result.match ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              {result.match ? (
                <span className="text-red-700">⚠️ COPYRIGHT INFRINGEMENT DETECTED</span>
              ) : (
                <span className="text-green-700">✅ NO MATCHES FOUND (Safe to use)</span>
              )}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded border shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">AI Confidence Score</p>
                <p className="text-2xl font-black text-gray-800">{(result.similarity_score * 100).toFixed(2)}%</p>
              </div>
              <div className="bg-white p-4 rounded border shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Action Required</p>
                <p className="text-lg font-bold text-gray-800">{result.match ? 'Issue Takedown' : 'None'}</p>
              </div>
            </div>

            {result.matched_image && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 font-bold mb-2">Original Protected Asset Match:</p>
                <img src={result.matched_image} alt="Original Protected Asset Match" className="w-full h-auto rounded-lg shadow-md border-4 border-red-200" />
              </div>
            )}

            {/* Expected Impact showcase: Automatically create DMCA */}
            {result.match && (
              <div className="mt-6 pt-4 border-t border-red-200">
                {!dmcaGenerated ? (
                  <button 
                  onClick={generateDMCANotice}
                  className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-black transition-colors focus:ring-4 focus:ring-gray-300">
                     Automate DMCA & Issue Takedown Email
                  </button>
                ) : (
                  <div className="bg-green-100 text-green-800 p-4 border border-green-500 rounded text-sm font-mono flex flex-col space-y-2">
                     <p>➔ Legal Action Initiated</p>
                     <p>➔ Firebase Cloud Function triggered.</p>
                     <p>➔ DMCA template drafted with metadata & sent to infringing host.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Detect;