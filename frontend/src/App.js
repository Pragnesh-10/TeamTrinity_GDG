import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Home from './components/Home';
import Upload from './components/Upload';
import Detect from './components/Detect';
import Decode from './components/Decode';
import Images from './components/Images';
import Analytics from './components/Analytics';
import Spotter from './components/Spotter';
import './App.css';

const NavItem = ({ to, children, exact }) => (
  <NavLink
    to={to}
    end={exact}
    className={({ isActive }) =>
      `px-4 py-2 rounded-lg transition-all text-sm font-semibold ${
        isActive
          ? 'bg-[#2d3449] text-white'
          : 'text-[#c7c4d7] hover:bg-[#2d3449] hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans selection:bg-indigo-500/30">

        <header className="bg-[#171f33]/80 backdrop-blur-md text-white sticky top-0 z-50 border-b border-[#464554]/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Logo */}
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 shrink-0">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              SportShield <span className="text-indigo-400 font-medium">| MVP AI</span>
            </Link>

            {/* Nav */}
            <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold">
              <NavItem to="/upload">Register Asset</NavItem>
              <NavItem to="/images">Vault</NavItem>
              <NavItem to="/detect">Scanner</NavItem>
              <NavItem to="/decode">
                <span className="flex items-center gap-1.5">
                  🧬 Decode
                  <span className="text-[8px] bg-violet-700 text-white px-1.5 py-0.5 rounded font-black uppercase">New</span>
                </span>
              </NavItem>
              <NavItem to="/spotter">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Live Spotter
                </span>
              </NavItem>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `ml-2 px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-700 text-white'
                      : 'bg-gradient-to-r from-[#c0c1ff] to-[#8083ff] text-[#1000a9] hover:shadow-indigo-500/30 hover:shadow-lg'
                  }`
                }
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
                Live Tracker
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/upload"    element={<Upload />} />
            <Route path="/detect"    element={<Detect />} />
            <Route path="/decode"    element={<Decode />} />
            <Route path="/images"    element={<Images />} />
            <Route path="/spotter"   element={<Spotter />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;