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
        console.error(error);
      }
      setLoading(false);
    };
    fetchImages();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-blue-900">Protected Media Vault</h2>
          <p className="text-gray-500 mt-2">All assets legally registered and vector-indexed for rapid piracy detection.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full">
          Total Assets: {images.length}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No protected assets found. Register your first asset to secure it.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map(img => (
            <div key={img.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                <img src={img.url} className="w-full h-48 object-cover" alt="Stored" />
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 font-mono text-ellipsis overflow-hidden">ID: {img.id}</p>
                <div className="mt-2 flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-xs text-green-700 font-bold uppercase tracking-wider">Active Monitoring</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Images;