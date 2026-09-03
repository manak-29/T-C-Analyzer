import React from 'react';
import { ScanText, GitCompare, Radar, Shield } from 'lucide-react';

export type NavTab = 'SCAN' | 'COMPARE' | 'TRACK' | 'VAULT';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'SCAN' as NavTab, label: 'SCAN', icon: ScanText },
    { id: 'COMPARE' as NavTab, label: 'COMPARE', icon: GitCompare },
    { id: 'TRACK' as NavTab, label: 'TRACK', icon: Radar },
    { id: 'VAULT' as NavTab, label: 'VAULT', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#050505] border-t border-white/5">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all py-1 px-3 ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <div className="relative flex items-center justify-center">
                <Icon className={`w-[22px] h-[22px] transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
                {isActive && <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_6px_#6366f1]" />}
              </div>
              <span className={`font-mono text-[10px] tracking-wider transition-colors ${isActive ? 'font-semibold text-indigo-400' : 'font-normal'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
