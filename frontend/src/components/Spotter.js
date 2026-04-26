import React, { useState, useEffect } from 'react';

const DUMMY_FEED = [
  { id: 101, user: '@nft_whale', time: '1m ago', text: 'Check out my new exclusive drop!', image: 'https://images.unsplash.com/photo-1549496434-60c7c346acaf?w=500&h=300&fit=crop', status: 'pending' },
  { id: 102, user: '@sports_fan99', time: '3m ago', text: 'Incredible tactical defensive shift here. Notice the left wing.', image: 'https://images.unsplash.com/photo-1551280857-2b9ebfae311a?w=500&h=300&fit=crop', isTransformative: true, status: 'pending' },
  { id: 103, user: '@art_thief200', time: '5m ago', text: 'Selling this masterpiece for 5 ETH.', image: 'https://images.unsplash.com/photo-1545987796-200677ee1011?w=500&h=300&fit=crop', isPiracy: true, status: 'pending' },
  { id: 104, user: '@casual_poster', time: '10m ago', text: 'Beautiful sunset today from my balcony.', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&h=300&fit=crop', status: 'pending' },
  { id: 105, user: '@meme_king', time: '15m ago', text: 'When the game is too intense 😭', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=300&fit=crop', isPiracy: true, status: 'pending' },
];

const Spotter = () => {
  const [feed, setFeed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [flags, setFlags] = useState(0);

  useEffect(() => {
    setFeed(DUMMY_FEED.slice(0, 2));
    setCurrentIndex(1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < DUMMY_FEED.length - 1 && Math.random() > 0.4) {
        setFeed(prev => [DUMMY_FEED[currentIndex + 1], ...prev]);
        setCurrentIndex(c => c + 1);
      }

      setFeed(prevFeed => {
        let flaggedInThisPass = 0;
        let scannedInThisPass = 0;

        const updatedFeed = prevFeed.map(post => {
          if (post.status === 'pending' && Math.random() > 0.3) {
            scannedInThisPass++;
            let newStatus = 'safe';
            let label = 'Original Content / Unmatched';

            if (post.isPiracy) {
              newStatus = 'danger';
              label = 'High Similarity — Copyright Infringement Detected';
              flaggedInThisPass++;
            } else if (post.isTransformative) {
              newStatus = 'warning';
              label = 'Medium Similarity — Transformative Fair Use Detected';
            }
            return { ...post, status: newStatus, label };
          }
          return post;
        });

        if (scannedInThisPass > 0) setScannedCount(s => s + scannedInThisPass);
        if (flaggedInThisPass > 0) setFlags(f => f + flaggedInThisPass);

        return updatedFeed;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="max-w-6xl mx-auto font-sans">

      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-[#2d3449] mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600"></span>
              </span>
              Autonomous Spotter Agent
            </h2>
            <p className="text-[#c7c4d7] mt-2 text-base leading-relaxed max-w-2xl">
              Live crawler analyzing social feeds and NFT marketplaces in real-time, matching images against the FAISS vector database.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="flex gap-4 shrink-0">
            <div className="bg-[#171f33] border border-[#2d3449] px-6 py-3 rounded-2xl text-center min-w-[110px]">
              <p className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest">Scanned</p>
              <p className="text-2xl font-black text-white">{scannedCount}</p>
            </div>
            <div className="bg-rose-900/30 border border-rose-500/30 px-6 py-3 rounded-2xl text-center min-w-[110px]">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Flagged</p>
              <p className="text-2xl font-black text-rose-300">{flags}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Live Feed ── */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="font-bold text-[#908fa0] uppercase tracking-widest text-xs flex items-center gap-2 mb-4">
            <svg className="animate-spin h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Crawling Live Network...
          </h3>

          {feed.map((post) => (
            <div
              key={post.id}
              className={`bg-[#171f33] rounded-2xl border-2 transition-all duration-700 overflow-hidden relative group
                ${post.status === 'pending'
                  ? 'border-dashed border-indigo-500/30 bg-indigo-500/5'
                  : post.status === 'safe'
                  ? 'border-[#2d3449]'
                  : post.status === 'warning'
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-900/20'
                  : 'border-rose-500/70 shadow-xl shadow-rose-900/30'
                }`}
            >
              {/* Scanning beam overlay */}
              {post.status === 'pending' && (
                <div className="absolute inset-0 z-10 w-full h-full pointer-events-none overflow-hidden">
                  <div className="w-full h-0.5 bg-indigo-400/60 blur-sm animate-pulse" style={{ boxShadow: '0 0 12px #818cf8' }}></div>
                </div>
              )}

              <div className="flex p-5 gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 bg-[#2d3449] rounded-full shrink-0 flex items-center justify-center text-[#c7c4d7] font-black border-2 border-[#464554] text-xs">
                  {post.user.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-white text-sm">{post.user}</p>
                    <p className="text-[11px] text-[#908fa0] font-medium">{post.time}</p>
                  </div>
                  <p className="text-[#c7c4d7] text-sm mb-3">{post.text}</p>

                  {/* Image thumbnail */}
                  <div className="relative rounded-xl overflow-hidden bg-[#060e20] max-h-44 border border-[#2d3449]">
                    <img src={post.image} alt="Feed content" className="w-full h-full object-cover" />
                    {post.status === 'pending' && (
                      <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-indigo-300 text-xs font-bold bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-500/30 animate-pulse">
                          Scanning...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Analysis result */}
                  {post.status !== 'pending' && (
                    <div className={`mt-4 px-4 py-3 rounded-xl flex items-start gap-3 border text-sm font-medium
                      ${post.status === 'safe'
                        ? 'bg-[#131b2e] border-[#2d3449] text-[#c7c4d7]'
                        : post.status === 'warning'
                        ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-900/30 border-rose-500/40 text-rose-300'}`}
                    >
                      {post.status === 'safe' && (
                        <svg className="w-5 h-5 shrink-0 text-[#908fa0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {post.status === 'warning' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {post.status === 'danger' && (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                      <span className="flex-1">{post.label}</span>

                      {post.status === 'danger' && (
                        <button className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0">
                          Take Down
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Agent Console ── */}
        <div className="bg-[#060e20] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[800px] border border-[#2d3449] sticky top-24">
          <div className="bg-[#131b2e] px-4 py-3 flex items-center justify-between border-b border-[#2d3449]">
            <h3 className="text-xs font-mono font-bold text-[#c7c4d7] flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agent Console
            </h3>
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div className="p-4 flex-1 text-xs font-mono text-emerald-400/80 space-y-2 overflow-y-auto">
            <p>$ initializing autonomous crawler...</p>
            <p className="text-[#908fa0]">$ connecting to FAISS vector network...</p>
            <p className="text-[#908fa0]">$ establishing heuristics thresholds...</p>
            <p className="text-indigo-300">{'>> READY. Scanning stream 0x9f4a...'}</p>

            {feed.map(f => (
              <div key={`log-${f.id}`} className="mt-2 pt-2 border-t border-[#2d3449]">
                <p className="text-[#908fa0]">[{new Date().toLocaleTimeString()}] INGEST: payload_{f.id}.jpg</p>
                {f.status !== 'pending' && (
                  <>
                    <p className="text-cyan-500/70 ml-2">↳ GEN: embeddings extracted (1280-dim)</p>
                    <p className="text-purple-400/70 ml-2">↳ QUERY: faiss.search(query, k=3)</p>
                    {f.status === 'safe' && <p className="text-[#908fa0] ml-2">↳ RESULT: 0 matches found. CLEAR.</p>}
                    {f.status === 'warning' && <p className="text-amber-400 ml-2">↳ MATCH: 92% confidence. Fair Use bypass [transformative].</p>}
                    {f.status === 'danger' && <p className="text-rose-400 font-bold ml-2">↳ ALERT: 98% confidence. Flagging payload_{f.id} for auto-takedown.</p>}
                  </>
                )}
              </div>
            ))}
            <div className="animate-pulse mt-4 text-emerald-400">_</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Spotter;