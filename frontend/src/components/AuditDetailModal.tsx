import React, { useState } from 'react';
import {
  X, ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft, Share2,
  FileDown, Sparkles, Send, ChevronDown, ChevronUp, ExternalLink, Check,
} from 'lucide-react';
import { ContractAudit, LegalClause, RiskLevel } from '../types';

interface AuditDetailModalProps {
  audit: ContractAudit | null;
  onClose: () => void;
  onAskCopilot: (query: string) => void;
  selectedClauseId?: string | null;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  audit, onClose, onAskCopilot, selectedClauseId,
}) => {
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [expandedClauses, setExpandedClauses] = useState<Record<string, boolean>>(() => {
    if (selectedClauseId) return { [selectedClauseId]: true };
    return {};
  });
  const [copiedLink, setCopiedLink] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  if (!audit) return null;

  const toggleClause = (id: string) => setExpandedClauses((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredClauses = audit.clauses.filter((c) => {
    if (filterRisk === 'ALL') return true;
    return c.riskLevel === filterRisk;
  });

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH RISK': return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', dot: 'bg-rose-400', badge: 'border-rose-500/30 text-rose-400 bg-rose-500/10' };
      case 'MODERATE': return { text: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', dot: 'bg-amber-400', badge: 'border-amber-400/20 text-amber-400 bg-amber-400/10' };
      case 'SAFE': return { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', dot: 'bg-emerald-400', badge: 'border-emerald-400/20 text-emerald-400 bg-emerald-400/10' };
    }
  };

  const handleShare = () => { navigator.clipboard?.writeText(window.location.href); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1500); };
  const handleAuditQuestion = (e: React.FormEvent) => { e.preventDefault(); if (!customQuestion.trim()) return; onAskCopilot(customQuestion); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-md min-h-screen bg-[#050505] text-slate-200 flex flex-col relative pb-20">
        <div className="sticky top-0 z-30 pt-safe px-4 py-3 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[13px] font-mono">
            <ArrowLeft className="w-4 h-4" /><span>Back</span>
          </button>
          <span className="font-display font-medium text-[14px] text-white truncate max-w-[180px]">{audit.company} Audit</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleShare} className="w-8 h-8 rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-[#121212] border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 relative overflow-hidden shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-wider">{audit.version} &bull; {audit.dateAudited}</span>
                <h1 className="font-display font-medium text-[18px] text-white tracking-tight leading-snug mt-0.5">{audit.title}</h1>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-mono text-[10px] font-medium shrink-0 border ${getRiskColor(audit.riskLevel).badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${getRiskColor(audit.riskLevel).dot}`} />
                <span>{audit.riskLevel}</span>
              </div>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed mb-4">{audit.summary}</p>
            <div className="p-3.5 rounded-xl bg-[#050505] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">COMPOSITE RISK INDEX</span>
                <span className="text-white font-bold">{audit.riskScore}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                <div style={{ width: `${Math.min(audit.riskScore, 100)}%` }} className={`h-full ${audit.riskScore > 70 ? 'bg-rose-500' : audit.riskScore > 40 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-rose-500/20 text-center">
                  <span className="font-mono text-[14px] font-bold text-rose-400">{audit.stats.criticalCount}</span>
                  <p className="text-[9px] font-mono text-slate-500">CRITICAL</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-amber-400/20 text-center">
                  <span className="font-mono text-[14px] font-bold text-amber-400">{audit.stats.moderateCount}</span>
                  <p className="text-[9px] font-mono text-slate-500">CAUTION</p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-emerald-500/20 text-center">
                  <span className="font-mono text-[14px] font-bold text-emerald-400">{audit.stats.safeCount}</span>
                  <p className="text-[9px] font-mono text-slate-500">SAFE TERMS</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleAuditQuestion} className="bg-[#121212] rounded-xl p-1.5 flex items-center gap-2 border border-white/5">
            <Sparkles className="w-4 h-4 text-indigo-400 ml-2 shrink-0" />
            <input type="text" value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder={`Ask Copilot about ${audit.company}...`}
              className="w-full bg-transparent text-[12px] text-white placeholder:text-slate-500 focus:outline-none font-body" />
            <button type="submit" className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center active:scale-95 transition-colors shrink-0">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="flex items-center justify-between">
            <h2 className="font-display font-medium text-[14px] text-white">Clause Breakdown</h2>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[10px]">
              {(['ALL', 'HIGH RISK', 'MODERATE', 'SAFE'] as const).map((r) => (
                <button key={r} type="button" onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${filterRisk === r ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:text-white'}`}>
                  {r === 'HIGH RISK' ? 'CRITICAL' : r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredClauses.map((clause) => {
              const isExpanded = !!expandedClauses[clause.id];
              const colors = getRiskColor(clause.riskLevel);
              return (
                <div key={clause.id} className={`bg-[#121212] rounded-2xl border transition-all overflow-hidden ${clause.id === selectedClauseId ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-white/5'}`}>
                  <div onClick={() => toggleClause(clause.id)} className="p-3.5 cursor-pointer hover:bg-white/[0.02] flex items-start justify-between gap-2.5 select-none">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-indigo-400 font-medium">{clause.section}</span>
                        <span className="text-white/20">&bull;</span>
                        <span className="font-mono text-[10px] text-slate-500">{clause.category}</span>
                      </div>
                      <h3 className="font-display font-medium text-[13px] text-white">{clause.title}</h3>
                      <p className="text-[12px] text-slate-400 leading-relaxed">{clause.plainEnglishVerdict}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-medium border ${colors.badge}`}>{clause.riskLevel}</span>
                      <button type="button" className="text-slate-500 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2.5 animate-in fade-in">
                      <div className="p-3 rounded-xl bg-[#050505] border border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                          <span>VERBATIM CONTRACT EXCERPT</span><span className="text-indigo-400">ORIGINAL TEXT</span>
                        </div>
                        <p className="font-mono text-[11px] text-slate-300 leading-relaxed italic">&quot;{clause.verbatimExcerpt}&quot;</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px]">
                        <span className="font-mono text-[10px] text-indigo-400 font-medium uppercase block mb-0.5">Risk Assessment</span>
                        <p className="text-slate-400 leading-relaxed">{clause.whyItMatters}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px]">
                        <span className="font-mono text-[10px] text-emerald-400 font-medium uppercase block mb-0.5">Recommended Action</span>
                        <p className="text-slate-300 leading-relaxed">{clause.actionableTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
