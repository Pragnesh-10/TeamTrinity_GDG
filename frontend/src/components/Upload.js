import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate preview immediately upon selection
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
    setResult(null); // Clear previous results
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData);
      setResult(response.data);
      // Optional: setFile(null) to clear, but keeping it lets user see what they uploaded
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 shadow-2xl rounded-2xl border border-slate-100 transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
      
      <div className="mb-10 text-center relative z-10">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Register Asset</h2>
        <p className="text-slate-500 mt-3 text-lg">Generate an AI-powered vector fingerprint to cryptographically protect media from unauthorized redistribution.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Modern Drag and Drop UI Illusion */}
        <div className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 group ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50'}`}>
          
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Drop image here or click to browse"
          />

          {!preview ? (
            <div className="text-center pointer-events-none">
              <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              </div>
              <p className="text-slate-700 font-semibold text-lg">Click to upload or drag and drop</p>
              <p className="text-slate-400 text-sm mt-1">SVG, PNG, JPG or WEBP (max. 10MB)</p>
            </div>
          ) : (
            <div className="w-full flex justify-center pointer-events-none relative rounded-lg overflow-hidden shadow-md">
               <img src={preview} alt="Upload preview" className="max-h-64 object-contain rounded-lg border border-slate-200" />
               <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold bg-slate-900/60 px-4 py-2 rounded-lg backdrop-blur-sm">Click to Change File</p>
               </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !file}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center space-x-2 
            ${loading || !file 
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-1'
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Encoding Neural Features...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <span>Seal & Register Fingerprint</span>
            </>
          )}
        </button>
      </form>
      
      {result && (
        <div className="mt-10 p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl animate-fade-in-up">
          <div className="flex items-center space-x-3 text-emerald-700 mb-6 border-b border-emerald-200/50 pb-4">
            <div className="bg-emerald-100 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-extrabold text-xl">Asset Successfully Embedded</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <img src={result.url} className="w-full h-auto object-cover rounded-lg shadow-sm border border-slate-200" alt="Vault asset" />
            </div>
            <div className="md:col-span-3 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Global Vault ID (Vector)</p>
                <div className="text-sm bg-white p-3 rounded-lg border border-slate-200 text-slate-700 font-mono break-all shadow-inner">
                  {result.id}
                </div>
              </div>
              
              {result.labels && result.labels.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Google Vision Classification</p>
                  <div className="flex flex-wrap gap-2">
                    {result.labels.map((lbl, idx) => (
                      <span key={idx} className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
