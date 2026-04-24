import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Upload from './components/Upload';
import Detect from './components/Detect';
import Images from './components/Images';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 text-gray-800 font-sans">
        <header className="bg-blue-900 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">FairPlay AI <span className="text-blue-300">| Sports Context Engine</span></h1>
            <nav className="space-x-6 text-sm font-medium flex">
              <Link to="/upload" className="hover:text-blue-300 transition-colors">Register Asset</Link>
              <Link to="/images" className="hover:text-blue-300 transition-colors">Protected Assets</Link>
              <Link to="/detect" className="hover:text-blue-300 transition-colors">Scanner (Manual)</Link>
              <Link to="/analytics" className="bg-blue-700 px-3 py-1 rounded hover:bg-blue-600 transition-colors flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                <span>Live Tracker</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/upload" element={<Upload />} />
            <Route path="/detect" element={<Detect />} />
            <Route path="/images" element={<Images />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;