import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://localhost:8000/api/upload', formData);
      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 shadow rounded-lg border border-gray-100">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-blue-900">Register Sports Asset</h2>
        <p className="text-gray-500 mt-2">Generate an AI-powered fingerprint to legally protect this media asset across the web.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition-all ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5'}`}
        >
          {loading ? 'Generating Fingerprint & Registering...' : 'Protect Asset Now'}
        </button>
      </form>
      
      {result && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-700 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <p className="font-bold">Asset Successfully Registered!</p>
          </div>
          <div className="text-sm bg-white p-3 rounded border text-gray-600 font-mono mb-4 overflow-x-auto">
            Blockchain / Vault ID: {result.id}
          </div>
          <img src={result.url} className="w-full h-auto rounded-lg shadow-sm" alt="Uploaded asset" />
        </div>
      )}
    </div>
  );
};

export default Upload;