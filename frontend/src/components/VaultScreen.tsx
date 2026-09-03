import React, { useState } from 'react';
import { Shield, Search, Filter, Trash2, ArrowUpRight, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ContractAudit, RiskLevel } from '../types';

interface VaultScreenProps {
  audits: ContractAudit[];
  onSelectAudit: (audit: ContractAudit) => void;
  onDeleteAudit: (id: string) => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({ audits, onSelectAudit, onDeleteAudit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  const filtered = audits.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.company.toLowerCase().includes(searchTerm.toLowerCase()) || a.focusArea.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filterRisk === 'ALL') return true;
    return a.riskLevel === filterRisk;
  });

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH RISK': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'MODERATE': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'SAFE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  return (
    <div className="flex-1 w-full pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col relative subtle-grid animate-in fade-in">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h1 className="font-display font-medium text-[20px] text-white tracking-tight">Contract Vault</h1>
          </div>
          <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">ENCRYPTED ARCHIVE</span>
        </div>
        <p className="text-[12px] text-slate-400">Repository of legal audits, liability scores, and plain English verdicts.</p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#121212] p-3 rounded-xl border border-white/5 text-center">
          <span className="font-mono text-[16px] font-bold text-white">{audits.length}</span>
          <p className="font-mono text-[9px] text-slate-500">RECORDS</p>
        </div>
        <div className="bg-[#121212] p-3 rounded-xl border border-rose-500/20 text-center">
          <span className="font-mono text-[16px] font-bold text-rose-400">{audits.filter((a) => a.riskLevel === 'HIGH RISK').length}</span>
          <p className="font-mono text-[9px] text-slate-500">HIGH RISK</p>
        </div>
        <div className="bg-[#121212] p-3 rounded-xl border border-emerald-500/20 text-center">
          <span className="font-mono text-[16px] font-bold text-emerald-400">{audits.filter((a) => a.riskLevel === 'SAFE').length}</span>
          <p className="font-mono text-[9px] text-slate-500">SAFE CLAUSES</p>
        </div>
      </div>

      <div className="bg-[#121212] rounded-xl p-2 mb-3 neon-border-glow transition-all flex items-center gap-2 border border-white/5">
        <Search className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contracts, clauses, or companies..."
          className="w-full bg-transparent text-[12px] text-slate-200 placeholder:text-slate-500 focus:outline-none font-body" />
      </div>

      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {(['ALL', 'HIGH RISK', 'MODERATE', 'SAFE'] as const).map((lvl) => (
          <button key={lvl} type="button" onClick={() => setFilterRisk(lvl)}
            className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-colors shrink-0 border ${filterRisk === lvl ? 'bg-white/10 border-white/20 text-white font-medium' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'}`}>
            {lvl === 'HIGH RISK' ? 'CRITICAL' : lvl}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-[#121212] p-6 rounded-2xl border border-white/5 text-center">
            <p className="text-slate-500 text-[12px]">No agreements found matching filter.</p>
          </div>
        ) : (
          filtered.map((audit) => (
            <article key={audit.id} onClick={() => onSelectAudit(audit)}
              className="bg-[#121212] p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all cursor-pointer group active:scale-98">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h3 className="font-display font-medium text-[13px] text-white group-hover:text-indigo-400 transition-colors">{audit.title}</h3>
                  <p className="font-mono text-[10px] text-slate-500">{audit.timeAgo} &bull; {audit.focusArea}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-medium border ${getRiskColor(audit.riskLevel)}`}>{audit.riskLevel}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteAudit(audit.id); }}
                    className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{audit.summary}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
