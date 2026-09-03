import React, { useState } from 'react';
import { Bell, ShieldCheck, Zap, Sparkles, X, Check } from 'lucide-react';

interface HeaderProps {
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ unreadCount = 2 }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 pt-safe bg-[#050505] border-b border-white/5">
        <div className="h-16 px-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center p-0.5 shrink-0 bg-gradient-to-tr from-indigo-600 to-violet-500 border border-white/10 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-medium text-[15px] tracking-tight text-white">
                  T&C Analyzer
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 leading-none">
                  v4.2
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 leading-tight mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                NEURAL ENGINE ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setShowNotificationDrawer(true)}
              className="relative w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </button>

            <button
              type="button"
              aria-label="User Profile"
              onClick={() => setShowProfileModal(true)}
              className="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-slate-500 active:scale-95 transition-all overflow-hidden flex items-center justify-center"
            >
              <span className="text-[11px] text-slate-300 font-medium">LC</span>
            </button>
          </div>
        </div>
      </header>

      {showNotificationDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-medium text-white text-[15px]">Legal Drift Alerts</h3>
              </div>
              <button type="button" onClick={() => setShowNotificationDrawer(false)}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5">
                <div className="flex items-center justify-between text-[11px] text-rose-400 font-mono mb-1">
                  <span className="font-semibold">CRITICAL DRIFT</span>
                  <span className="text-slate-500">14m ago</span>
                </div>
                <h4 className="text-[13px] font-medium text-white mb-0.5">OpenAI Terms Modified</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Clause 4.2 expanded AI training permission to include fine-tuning datasets on unpaid developer accounts.</p>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5">
                <div className="flex items-center justify-between text-[11px] text-indigo-400 font-mono mb-1">
                  <span className="font-semibold">POLICY UPDATE</span>
                  <span className="text-slate-500">Yesterday</span>
                </div>
                <h4 className="text-[13px] font-medium text-white mb-0.5">Slack MSA v2024.3</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">New subprocessor additions declared with standard 30-day objection window.</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowNotificationDrawer(false)}
              className="mt-4 w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[12px] font-medium transition-colors">
              Dismiss All
            </button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 shadow-2xl relative">
            <button type="button" onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="relative w-12 h-12 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                <span className="text-sm text-slate-300 font-medium">LC</span>
              </div>
              <div>
                <h3 className="font-display font-medium text-white text-[15px]">Legal Counsel Node</h3>
                <p className="text-[12px] text-indigo-400 font-mono">Enterprise Pro Tier</p>
              </div>
            </div>
            <div className="space-y-2.5 p-3.5 rounded-xl bg-[#121212] border border-white/5 text-[12px] mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero-Log Confidentiality</span>
                <span className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1"><Check className="w-3 h-3" /> ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-400" /> Neural Model Engine</span>
                <span className="text-slate-200 font-mono text-[11px]">v4.2 Flash Legal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Live Drift Monitored</span>
                <span className="text-slate-200 font-mono text-[11px]">7 Subscriptions</span>
              </div>
            </div>
            <button type="button" onClick={() => setShowProfileModal(false)}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors shadow-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
