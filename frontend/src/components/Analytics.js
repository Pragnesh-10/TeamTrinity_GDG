import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';

/* ─────────────── Design Tokens ─────────────── */
const PIE_COLORS   = ['#f43f5e', '#10b981', '#f59e0b', '#6366f1'];
const BAR_GRADIENT = ['#6366f1', '#8b5cf6'];

/* ─────────────── Sub-components ─────────────── */
const StatCard = ({ title, value, icon, accent, pulse }) => (
  <div className={`relative overflow-hidden rounded-3xl p-8 border border-[#2d3449] shadow-sm hover:shadow-lg transition-shadow bg-[#171f33] ${accent}`}>
    <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ background: 'currentColor' }} />
    <div className="flex items-center gap-3 mb-2 relative z-10">
      {pulse && (
        <span className="relative flex h-3 w-3 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
        </span>
      )}
      <div className="text-xl">{icon}</div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
    </div>
    <p className="text-4xl font-black text-white relative z-10">{value}</p>
  </div>
);

const SectionHeader = ({ title, subtitle, badge }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
        {title}
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 uppercase tracking-wide">
            {badge}
          </span>
        )}
      </h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 800 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ─────────────── Main Component ─────────────── */
const Analytics = () => {
  const [anomalies, setAnomalies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  /* ── derived chart data ── */
  const pieData = (() => {
    const counts = {};
    anomalies.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const barData = (() => {
    const buckets = { '50-69': 0, '70-84': 0, '85-94': 0, '95-100': 0 };
    anomalies.forEach(a => {
      const s = parseFloat(a.similarity);
      if (s < 70) buckets['50-69']++;
      else if (s < 85) buckets['70-84']++;
      else if (s < 95) buckets['85-94']++;
      else buckets['95-100']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  })();

  const timelineData = (() => {
    // Group by hour for area chart
    const hours = {};
    anomalies.forEach(a => {
      const d = new Date(a.rawTimestamp || Date.now());
      const key = `${d.getHours()}:00`;
      hours[key] = (hours[key] || 0) + 1;
    });
    return Object.entries(hours).slice(-12).map(([time, detections]) => ({ time, detections }));
  })();

  const piracyCount  = anomalies.filter(a => !a.isFairUse).length;
  const fairUseCount = anomalies.filter(a => a.isFairUse).length;
  const avgSimilarity = anomalies.length
    ? (anomalies.reduce((s, a) => s + parseFloat(a.similarity), 0) / anomalies.length).toFixed(1)
    : 0;

  const fetchDetections = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/detections`);
      const apiData = response.data.map(d => ({
        id:            d.id,
        assetId:       d.assetId,
        location:      d.location || 'Unknown Network Node',
        timestamp:     d.detectedAt ? new Date(d.detectedAt).toLocaleString() : 'Just now',
        rawTimestamp:  d.detectedAt,
        similarity:    (d.similarity * 100).toFixed(2),
        threatLevel:   d.threatLevel || 'Medium',
        category:      d.category || 'Piracy',
        reasoning:     d.reasoning || '',
        isFairUse:     d.status === 'safe',
      }));
      setAnomalies(apiData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load live tracking data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetections();
    const interval = setInterval(fetchDetections, 15000);
    return () => clearInterval(interval);
  }, [fetchDetections]);

  return (
    <div className="max-w-7xl mx-auto font-sans space-y-10">

      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-[#2d3449]">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">
              Real-Time Propagation Analytics
            </h2>
            <p className="text-[#c7c4d7] mt-2 text-base leading-relaxed max-w-2xl">
              Live tracking of unauthorized distributions and fair-use classifications detected by
              automated FAISS vector scrapers, visualized directly from the platform database.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Auto-refresh · 15s
            </span>
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 font-medium">
                Last sync: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assets Vaulted" value="1,204"   icon="🗄️" accent="border-[#464554]" />
        <StatCard title="Active Anomalies"      value={anomalies.length} icon="📡" accent="border-rose-500/50" pulse />
        <StatCard title="Piracy Strikes"        value={piracyCount}  icon="⚠️" accent="border-orange-500/50" />
        <StatCard title="Fair Use Saved"         value={fairUseCount} icon="✅" accent="border-emerald-500/50" />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pie Chart — Piracy vs Fair Use (mirrors Streamlit plotly pie) */}
        <div className="bg-[#171f33] rounded-3xl border border-[#2d3449] shadow-sm p-8">
          <SectionHeader
            title="Categorization Breakdown"
            subtitle="Piracy vs Fair Use — powered by Supabase analytics pipeline"
            badge="Live"
          />
          {loading ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm font-medium">
              Loading chart data…
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm font-medium">
              No classification data yet. Run a scan to populate.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={CustomPieLabel}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #2d3449', backgroundColor: '#222a3d', color: '#dae2fd', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', fontSize: 13 }}
                  formatter={(val, name) => [`${val} cases`, name]}
                  itemStyle={{ color: '#dae2fd' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Platform attribution */}
          <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
            Chart data synced from <span className="text-indigo-500 font-bold">Supabase PostgreSQL</span> pipeline
          </p>
        </div>

        {/* Bar Chart — Vector Similarity Distribution */}
        <div className="bg-[#171f33] rounded-3xl border border-[#2d3449] shadow-sm p-8">
          <SectionHeader
            title="Vector Similarity Distribution"
            subtitle="FAISS cosine match confidence buckets across all detections"
            badge="FAISS AI"
          />
          {loading ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm font-medium">
              Loading chart data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BAR_GRADIENT[0]} stopOpacity={1} />
                    <stop offset="100%" stopColor={BAR_GRADIENT[1]} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fontWeight: 600, fill: '#c7c4d7' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#c7c4d7' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #2d3449', backgroundColor: '#222a3d', color: '#dae2fd', fontSize: 13 }}
                  formatter={(val) => [`${val} detections`, 'Count']}
                  itemStyle={{ color: '#dae2fd' }}
                />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-[10px] text-slate-400 font-medium mt-2 text-center">
            Avg vector confidence this session: <span className="text-indigo-500 font-bold">{avgSimilarity}%</span>
          </p>
        </div>
      </div>

      {/* Area Chart — Detection Timeline */}
      {timelineData.length > 1 && (
        <div className="bg-[#171f33] rounded-3xl border border-[#2d3449] shadow-sm p-8">
          <SectionHeader
            title="Detection Activity Timeline"
            subtitle="Hourly propagation events captured by the vector scraper network"
            badge="Real-time"
          />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#c7c4d7' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#c7c4d7' }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #2d3449', backgroundColor: '#222a3d', color: '#dae2fd', fontSize: 13 }}
                formatter={(val) => [`${val}`, 'Detections']}
                itemStyle={{ color: '#dae2fd' }}
              />
              <Area type="monotone" dataKey="detections" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Live Propagation Feed ── */}
      <div className="bg-[#171f33] shadow-xl shadow-slate-900/40 rounded-3xl border border-[#2d3449] overflow-hidden">
        <div className="bg-[#131b2e] border-b border-[#2d3449] px-8 py-5 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Live Propagation Feed
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {anomalies.length} events loaded
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 font-medium flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting to Vector Network…
          </div>
        ) : anomalies.length === 0 ? (
          <div className="p-14 text-center">
            <div className="text-5xl mb-4">📡</div>
            <p className="text-slate-500 font-medium">No anomalies detected in the current index.</p>
            <p className="text-xs text-slate-400 mt-1">Run a scan in the Manual Scanner tab to populate this feed.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2d3449]">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#222a3d] transition-colors bg-[#171f33] group"
              >
                <div className="flex items-start md:items-center space-x-6 mb-4 md:mb-0">
                  <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-105 shadow-sm ${anom.isFairUse ? 'bg-emerald-100 text-emerald-600' : (anom.threatLevel === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600')}`}>
                    {anom.isFairUse ? (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-lg flex items-center gap-3 flex-wrap">
                      {anom.location}
                      <span className={`text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider font-black shadow-sm ${anom.isFairUse ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-rose-900 text-rose-300 border border-rose-700'}`}>
                        {anom.category}
                      </span>
                    </p>
                    <p className="text-sm text-slate-400 font-medium mt-1">
                      Asset Vault Ref:&nbsp;
                      <span className="font-mono text-xs bg-[#2d3449] px-1.5 py-0.5 rounded text-[#dae2fd] border border-[#464554]">{anom.assetId}</span>
                      <span className="mx-2">•</span>
                      Detected: <span className="text-[#c7c4d7]">{anom.timestamp}</span>
                    </p>
                    {anom.reasoning && (
                      <p className="text-sm text-[#c7c4d7] mt-2 bg-[#131b2e] p-2 rounded border border-[#2d3449] truncate md:max-w-2xl">
                        "{anom.reasoning}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right ml-[4.5rem] md:ml-0 md:pl-6 border-l-0 md:border-l border-[#2d3449] md:shrink-0">
                  <p className="font-black text-white text-2xl">
                    {anom.similarity}<span className="text-lg text-slate-400">%</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-1">Vector Match</p>
                  <button className={`text-sm font-bold transition-all px-4 py-2 rounded-lg border flex items-center gap-2 group/btn ${anom.isFairUse ? 'text-emerald-300 bg-emerald-900/40 border-emerald-800 hover:bg-emerald-900/60' : 'text-rose-300 bg-rose-900/40 border-rose-800 hover:bg-rose-900/60 hover:text-white'}`}>
                    <span>Review Case</span>
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAISS Scalability Callout ── */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 border border-indigo-900/50 shadow-2xl shadow-indigo-900/20">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30 shrink-0">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div>
            <h4 className="text-white font-extrabold text-base mb-1 flex items-center gap-2">
              Enterprise Scalability: FAISS + Firebase Storage
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wide font-bold">Architecture</span>
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              The FAISS vector index doesn't just persist locally. On every <code className="text-indigo-300 bg-indigo-900/50 px-1 rounded text-xs">save_index()</code> call,{' '}
              <code className="text-indigo-300 bg-indigo-900/50 px-1 rounded text-xs">backup_faiss_index()</code> automatically syncs the <code className="text-indigo-300 bg-indigo-900/50 px-1 rounded text-xs">.pkl</code> file to{' '}
              <strong className="text-white">Firebase Storage</strong>. On cold start, <code className="text-indigo-300 bg-indigo-900/50 px-1 rounded text-xs">restore_faiss_index()</code>{' '}
              pulls it back — enabling <strong className="text-indigo-300">horizontal scalability across serverless nodes</strong> without losing AI state.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['faiss_service.py · Line 34', 'firebase_service.py · backup_faiss_index()', 'Serverless-safe · Stateful AI'].map(tag => (
                <span key={tag} className="text-[11px] font-mono font-semibold bg-indigo-900/50 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-700/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
