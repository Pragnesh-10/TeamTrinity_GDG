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
    // Populate Initial Feed
    setFeed(DUMMY_FEED.slice(0, 2));
    setCurrentIndex(1); // Next to add
  }, []);

  useEffect(() => {
    // Simulated Crawler Loop
    const timer = setInterval(() => {
      // 1. Add new items to feed
      if (currentIndex < DUMMY_FEED.length - 1 && Math.random() > 0.4) {
        setFeed(prev => [DUMMY_FEED[currentIndex + 1], ...prev]);
        setCurrentIndex(c => c + 1);
      }

      // 2. Scan pending items
      setFeed(prevFeed => {
        let flaggedInThisPass = 0;
        let scannedInThisPass = 0;

        const updatedFeed = prevFeed.map(post => {
          if (post.status === 'pending' && Math.random() > 0.3) {
            // "Scan" it
            scannedInThisPass++;
            let newStatus = 'safe';
            let label = 'Original Content / Unmatched';
            
            if (post.isPiracy) {
              newStatus = 'danger';
              label = 'High Similarity - Copyright Infringement';
              flaggedInThisPass++;
            } else if (post.isTransformative) {
              newStatus = 'warning';
              label = 'Medium Similarity - Transformative (Fair Use)';
            }
            return { ...post, status: newStatus, label };
          }
          return post;
        });

        if (scannedInThisPass > 0) {
           setScannedCount(s => s + scannedInThisPass);
        }
        if (flaggedInThisPass > 0) {
           setFlags(f => f + flaggedInThisPass);
        }

        return updatedFeed;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="max-w-6xl mx-auto font-sans animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
             <span className="relative flex h-5 w-5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-5 w-5 bg-indigo-600"></span>
             </span>
             Autonomous Spotter Agent
          </h2>
          <p className="text-slate-500 mt-3 text-lg leading-relaxed">Live crawler analyzing social feeds and NFT marketplaces in real-time, matching images against the FAISS vector database.</p>
        </div>
        <div className="mt-6 md:mt-0 flex gap-4">
           <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-center min-w-[120px]">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanned</p>
             <p className="text-2xl font-black text-slate-800">{scannedCount}</p>
           </div>
           <div className="bg-rose-50 px-6 py-3 rounded-2xl shadow-sm border border-rose-200 text-center min-w-[120px]">
             <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">Flagged</p>
             <p className="text-2xl font-black text-rose-700">{flags}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Live Feed Simulator */}
         <div className="lg:col-span-2 space-y-6">
           <h3 className="font-bold text-slate-600 uppercase tracking-widest text-sm flex items-center gap-2 mb-4">
             <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
             Crawling Live Network...
           </h3>

           {feed.map((post) => (
              <div key={post.id} className={`bg-white rounded-2xl border-2 transition-all duration-700 overflow-hidden shadow-sm relative group
                ${post.status === 'pending' ? 'border-dashed border-indigo-200 bg-indigo-50/10' : 
                  post.status === 'safe' ? 'border-slate-200' : 
                  post.status === 'warning' ? 'border-emerald-300' : 'border-rose-400 shadow-rose-200'}`}>
                 
                 {/* Scanning Overlay Effect */}
                 {post.status === 'pending' && (
                    <div className="absolute inset-0 z-10 w-full h-full pointer-events-none bg-indigo-500/5 mix-blend-overlay">
                       <div className="w-full h-1 bg-indigo-400 shadow-[0_0_15px_#818cf8] animate-[scan_1.5s_linear_infinite]"></div>
                    </div>
                 )}

                 <div className="flex p-5 gap-4">
                   <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm overflow-hidden text-xs">
                     {post.user.substring(0, 2)}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <p className="font-bold text-slate-800 text-sm">{post.user}</p>
                         <p className="text-xs text-slate-400 font-medium">{post.time}</p>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{post.text}</p>
                      
                      <div className="relative rounded-xl overflow-hidden bg-slate-100 max-h-48 border border-slate-200">
                         <img src={post.image} alt="Feed content" className="w-full h-full object-cover" />
                      </div>
                      
                      {/* Analysis Result Banner */}
                      {post.status !== 'pending' && (
                         <div className={`mt-4 px-4 py-3 rounded-lg flex items-start gap-3 border text-sm font-medium
                           ${post.status === 'safe' ? 'bg-slate-50 border-slate-200 text-slate-500' :
                             post.status === 'warning' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                             'bg-rose-50 border-rose-200 text-rose-700'}`}>
                            {post.status === 'safe' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                            {post.status === 'warning' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                            {post.status === 'danger' && <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                            <span className="flex-1">{post.label}</span>
                            
                            {post.status === 'danger' && (
                               <button className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded shadow-sm font-bold transition-colors">Take Down</button>
                            )}
                         </div>
                      )}
                   </div>
                 </div>
              </div>
           ))}
         </div>

         {/* Technical Console */}
         <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full max-h-[800px] border border-slate-700 sticky top-24">
            <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
               <h3 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                 <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 Agent Console
               </h3>
               <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
               </span>
            </div>
            <div className="p-4 flex-1 text-xs font-mono text-emerald-400/80 space-y-2 overflow-y-auto w-full custom-scrollbar">
               <p>$ initialzing autonomous crawler...</p>
               <p className="text-slate-400">$ connecting to FAISS vector network...</p>
               <p className="text-slate-400">$ establishing heuristics thresholds...</p>
               <p className="text-indigo-300">{'>> READY. Scanning stream 0x9f4a...'}</p>
               
               {feed.map(f => (
                  <div key={`log-${f.id}`} className="mt-2 pt-2 border-t border-slate-800/50">
                     <p className="text-slate-500">[{new Date().toLocaleTimeString()}] INGEST: payload_{f.id}.jpg</p>
                     {f.status !== 'pending' && (
                        <>
                           <p className="text-cyan-600/80 ml-2">↳ GEN: embeddings extracted (1280-dim)</p>
                           <p className="text-purple-400/80 ml-2">↳ QUERY: faiss.search(query, k=3)</p>
                           {f.status === 'safe' ? (
                              <p className="text-slate-500 ml-2">↳ REQ: 0 matches found. CLEAR.</p>
                           ) : f.status === 'warning' ? (
                              <p className="text-amber-400 ml-2">↳ REC: 92% confidence. Semantic bypass detected [Fair Use].</p>
                           ) : (
                              <p className="text-rose-400 font-bold ml-2">↳ ALERT: 98% confidence. Flagging object {f.id} for auto-takedown.</p>
                           )}
                        </>
                     )}
                  </div>
               ))}
               <div className="animate-pulse mt-4">_</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Spotter;