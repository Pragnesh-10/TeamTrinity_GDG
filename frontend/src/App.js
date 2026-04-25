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
      <div className="App min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-200">
        <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              SportShield <span className="text-indigo-400 font-medium">| MVP AI</span>
            </h1>
            <nav className="mt-4 md:mt-0 flex items-center space-x-1 md:space-x-4 text-sm font-semibold">
              <Link to="/upload" className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-slate-300 hover:text-white">Register Asset</Link>
              <Link to="/images" className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-slate-300 hover:text-white">Vault</Link>
              <Link to="/detect" className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-all text-slate-300 hover:text-white">Manual Scanner</Link>
              <Link to="/analytics" className="ml-4 bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span>Live Tracker</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 animate-fade-in-up">
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