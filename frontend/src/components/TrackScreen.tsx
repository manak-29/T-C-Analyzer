import React, { useState } from 'react';
import { Radar, BellRing, Plus, ShieldCheck, AlertCircle, CheckCircle, RefreshCw, Globe, ChevronRight } from 'lucide-react';
import { MONITORED_SERVICES_DATA } from '../data/sampleData';
import { MonitoredService } from '../types';

export const TrackScreen: React.FC = () => {
  const [monitoredList, setMonitoredList] = useState<MonitoredService[]>(MONITORED_SERVICES_DATA);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshDrift = () => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1200); };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newUrl) return;
    const newService: MonitoredService = {
      id: `mon-${Date.now()}`, name: newName, category: 'Cloud SaaS',
      activeSince: 'Just now', lastChecked: 'Just now', status: 'monitoring',
      currentVersion: 'v2025.Active', riskLevel: 'MODERATE',
    };
    setMonitoredList([newService, ...monitoredList]); setNewName(''); setNewUrl(''); setShowAddModal(false);
  };

  return (
    <div className="flex-1 w-full pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col relative subtle-grid animate-in fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radar className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <h1 className="font-display font-medium text-[20px] text-white tracking-tight">Policy Monitoring</h1>
          </div>
          <p className="text-[12px] text-slate-400">Autonomous scrapers detecting silent terms & conditions modifications.</p>
        </div>
        <button type="button" onClick={handleRefreshDrift}
          className="w-8 h-8 rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#121212] p-3 rounded-xl border border-white/5 text-center">
          <span className="font-mono text-[16px] font-bold text-white">{monitoredList.length}</span>
          <p className="font-mono text-[9px] text-slate-500">MONITORED</p>
        </div>
        <div className="bg-[#121212] p-3 rounded-xl border border-rose-500/20 text-center">
          <span className="font-mono text-[16px] font-bold text-rose-400">1 ACTIVE</span>
          <p className="font-mono text-[9px] text-slate-500">DRIFT DETECTED</p>
        </div>
        <div className="bg-[#121212] p-3 rounded-xl border border-emerald-500/20 text-center">
          <span className="font-mono text-[16px] font-bold text-emerald-400">100%</span>
          <p className="font-mono text-[9px] text-slate-500">RADAR UPTIME</p>
        </div>
      </div>

      <div className="mb-4">
        <button type="button" onClick={() => setShowAddModal(true)}
          className="w-full py-2.5 rounded-xl bg-[#121212] border border-dashed border-white/10 hover:border-indigo-500/50 text-indigo-400 text-[12px] font-mono flex items-center justify-center gap-1.5 transition-colors active:scale-98">
          <Plus className="w-4 h-4" /><span>Add URL to Continuous Drift Radar</span>
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-display font-medium text-[14px] text-white">Live Tracking Feeds</h2>
          <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />SYNCHRONIZED
          </span>
        </div>
        {monitoredList.map((svc) => (
          <div key={svc.id} className={`bg-[#121212] p-3.5 rounded-2xl border transition-all ${svc.status === 'drift-detected' ? 'border-rose-500/30' : 'border-white/5'}`}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-medium text-[13px] text-white">{svc.name}</h3>
                  {svc.status === 'drift-detected' && <span className="px-1.5 py-0.5 rounded font-mono text-[9px] bg-rose-500/15 border border-rose-500/30 text-rose-400">ALERT</span>}
                </div>
                <span className="font-mono text-[10px] text-slate-500">{svc.category} &bull; Checked {svc.lastChecked}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-medium border ${svc.riskLevel === 'HIGH RISK' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : svc.riskLevel === 'MODERATE' ? 'bg-amber-400/10 border-amber-400/20 text-amber-400' : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400'}`}>{svc.riskLevel}</span>
            </div>
            {svc.recentAlert && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[11px]">
                <div className="flex items-center justify-between text-rose-400 font-mono text-[10px] mb-1">
                  <span className="flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {svc.recentAlert.title}</span>
                  <span className="text-slate-500">{svc.recentAlert.date}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{svc.recentAlert.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#121212] rounded-2xl p-5 border border-white/10 shadow-2xl">
            <h3 className="font-display font-medium text-white text-[15px] mb-1">Add Agreement Radar</h3>
            <p className="text-[12px] text-slate-400 mb-4 leading-relaxed">Enter the vendor terms page URL. Our scraper takes cryptographic DOM snapshots daily.</p>
            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Service / Vendor Name</label>
                <input type="text" required placeholder="e.g. Supabase, Midjourney" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#050505] rounded-lg px-3 py-2 text-white text-[12px] focus:outline-none border border-white/10 focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Terms URL</label>
                <input type="url" required placeholder="https://vendor.com/terms" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-[#050505] rounded-lg px-3 py-2 text-white text-[12px] focus:outline-none border border-white/10 focus:border-indigo-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[12px] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors shadow-sm">Start Radar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
