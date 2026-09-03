import React, { useState } from 'react';
import { GitCompare, ShieldCheck, Sparkles, Plus, Check } from 'lucide-react';
import { COMPARISON_VECTORS_DATA } from '../data/sampleData';
import { RiskLevel } from '../types';

export const CompareScreen: React.FC = () => {
  const [contractAName, setContractAName] = useState('OpenAI Terms (v2025)');
  const [contractBName, setContractBName] = useState('Anthropic Terms (v2024)');
  const [selectedVector, setSelectedVector] = useState<number | null>(null);

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH RISK': return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'MODERATE': return 'bg-amber-400/10 border-amber-400/20 text-amber-400';
      case 'SAFE': return 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400';
    }
  };

  return (
    <div className="flex-1 w-full pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col relative subtle-grid animate-in fade-in">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <h1 className="font-display font-medium text-[20px] text-white tracking-tight">Contract Diff Engine</h1>
          </div>
          <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">SIDE-BY-SIDE MATRIX</span>
        </div>
        <p className="text-[12px] text-slate-400">Compare binding liabilities, AI ingestion rights, and liability caps between platforms.</p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#121212] p-3.5 rounded-2xl border border-white/5 relative">
          <span className="font-mono text-[9px] text-rose-400 uppercase block mb-1">CONTRACT A</span>
          <select value={contractAName} onChange={(e) => setContractAName(e.target.value)}
            className="w-full bg-transparent text-[12px] font-semibold text-white focus:outline-none cursor-pointer">
            <option value="OpenAI Terms (v2025)" className="bg-[#121212]">OpenAI Terms (v2025)</option>
            <option value="Slack MSA v2024" className="bg-[#121212]">Slack MSA v2024</option>
            <option value="Figma TOS 2024" className="bg-[#121212]">Figma TOS 2024</option>
          </select>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /><span>Score: 88/100 (High Risk)</span>
          </div>
        </div>
        <div className="bg-[#121212] p-3.5 rounded-2xl border border-white/5 relative">
          <span className="font-mono text-[9px] text-emerald-400 uppercase block mb-1">CONTRACT B</span>
          <select value={contractBName} onChange={(e) => setContractBName(e.target.value)}
            className="w-full bg-transparent text-[12px] font-semibold text-white focus:outline-none cursor-pointer">
            <option value="Anthropic Terms (v2024)" className="bg-[#121212]">Anthropic Terms (v2024)</option>
            <option value="Stripe Agreement" className="bg-[#121212]">Stripe Agreement</option>
            <option value="GitHub Copilot" className="bg-[#121212]">GitHub Copilot</option>
          </select>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span>Score: 32/100 (Safe)</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-display font-medium text-[13px] text-white">Legal Synthesis Verdict</span>
        </div>
        <p className="text-[12px] text-slate-300 leading-relaxed">
          <strong className="text-emerald-400 font-medium">{contractBName}</strong> offers significantly superior protection for enterprise IP, with zero model training rights and a 5,000x higher liability cap ceiling compared to {contractAName}.
        </p>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-display font-medium text-[14px] text-white">Vector Comparison Matrix</h2>
          <span className="font-mono text-[10px] text-slate-500">5 CRITICAL CHECKS</span>
        </div>
        {COMPARISON_VECTORS_DATA.map((item, idx) => {
          const isOpen = selectedVector === idx;
          return (
            <div key={idx} className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden transition-all">
              <button type="button" onClick={() => setSelectedVector(isOpen ? null : idx)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors">
                <div>
                  <span className="font-mono text-[10px] text-indigo-400 uppercase block mb-0.5">VECTOR 0{idx + 1}</span>
                  <h3 className="font-display font-medium text-[13px] text-white">{item.feature}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] border ${getRiskBadge(item.contractA.risk)}`}>A: {item.contractA.risk === 'HIGH RISK' ? 'CRITICAL' : item.contractA.risk}</span>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[9px] border ${getRiskBadge(item.contractB.risk)}`}>B: {item.contractB.risk}</span>
                </div>
              </button>
              <div className="p-3 pt-0 grid grid-cols-2 gap-2 border-t border-white/5">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">{contractAName}</span>
                  <p className="text-[11px] text-white font-medium">{item.contractA.verdict}</p>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">&quot;{item.contractA.text}&quot;</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <span className="font-mono text-[9px] text-slate-500 uppercase block">{contractBName}</span>
                  <p className="text-[11px] text-white font-medium">{item.contractB.verdict}</p>
                  <p className="text-[10px] text-slate-400 font-mono leading-relaxed">&quot;{item.contractB.text}&quot;</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
