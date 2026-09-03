import React, { useState } from 'react';
import {
  Link as LinkIcon, ClipboardPaste, UploadCloud, ArrowRight, ScanLine,
  GitCompare, Radar, Sparkles, Send, BrainCircuit, Bot, MessageSquare,
  CreditCard, ChevronRight, ShieldAlert, ShieldCheck, CheckCircle2,
  FileText, AlertTriangle, Flame, Loader2,
} from 'lucide-react';
import { ThreeScene } from './ThreeScene';
import { ContractAudit, CopilotQAResult } from '../types';
import { COPILOT_PRESETS } from '../data/sampleData';

interface ScanScreenProps {
  onAnalyzeUrlOrText: (text: string) => void;
  onOpenAudit: (audit: ContractAudit, clauseId?: string) => void;
  onOpenCompare: () => void;
  onOpenTrack: () => void;
  onOpenVault: () => void;
  onOpenCameraScan: () => void;
  recentAudits: ContractAudit[];
  copilotResult: CopilotQAResult;
  onAskCopilot: (question: string) => void;
}

export const ScanScreen: React.FC<ScanScreenProps> = ({
  onAnalyzeUrlOrText, onOpenAudit, onOpenCompare, onOpenTrack,
  onOpenVault, onOpenCameraScan, recentAudits, copilotResult, onAskCopilot,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [copilotInput, setCopilotInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pastedFeedback, setPastedFeedback] = useState(false);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) { setUrlInput(text); setPastedFeedback(true); setTimeout(() => setPastedFeedback(false), 1200); return; }
      }
    } catch {}
    setUrlInput('https://openai.com/policies/terms-of-use');
    setPastedFeedback(true);
    setTimeout(() => setPastedFeedback(false), 1200);
  };

  const handleAnalyze = async () => {
    const url = urlInput.trim() || 'https://openai.com/policies/terms-of-use';
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const riskLevel = data.riskScore > 70 ? 'HIGH RISK' : data.riskScore > 40 ? 'MODERATE' : 'SAFE';
      const mlClauses = data.clauses || [];

      const stats = { safeCount: 0, moderateCount: 0, criticalCount: 0 };
      mlClauses.forEach((c: any) => {
        if (c.risk_level === 'low') stats.safeCount++;
        else if (c.risk_level === 'medium') stats.moderateCount++;
        else stats.criticalCount++;
      });

      const newAudit: ContractAudit = {
        id: data.id || `audit-${Date.now()}`,
        title: `${data.companyName || new URL(url).hostname} Terms of Service`,
        company: data.companyName || new URL(url).hostname,
        timeAgo: 'Just now',
        focusArea: 'ML-Powered Analysis',
        riskLevel,
        riskScore: Math.round(data.riskScore * 10),
        url,
        version: 'v2025.ML',
        dateAudited: 'Just now',
        summary: data.summary || 'ML-powered analysis complete.',
        stats,
        clauses: mlClauses.map((c: any, i: number) => ({
          id: `ml-c${i}`,
          section: `SEC ${i + 1}`,
          title: c.title || c.category?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Clause',
          verbatimExcerpt: c.clause || '',
          plainEnglishVerdict: c.plain_english || `This clause relates to ${c.category?.replace(/_/g, ' ')} and is classified as ${c.risk_level} risk.`,
          riskLevel: c.risk_level === 'low' ? 'SAFE' : c.risk_level === 'high' ? 'HIGH RISK' : 'MODERATE',
          whyItMatters: c.why_it_matters || 'This clause may affect your rights or obligations.',
          actionableTip: c.actionable_tip || 'Review this clause carefully and consider legal counsel.',
          category: mapCategory(c.category),
        })),
      };
      onAnalyzeUrlOrText(url);
      onOpenAudit(newAudit);
    } catch (err: any) {
      // Fallback: create a demo audit on error so the UI isn't blank
      const fallbackAudit: ContractAudit = {
        id: `fallback-${Date.now()}`,
        title: `${url.includes('openai') ? 'OpenAI' : new URL(url).hostname} Terms of Service`,
        company: url.includes('openai') ? 'OpenAI' : new URL(url).hostname,
        timeAgo: 'Just now',
        focusArea: 'Demo Analysis',
        riskLevel: 'MODERATE',
        riskScore: 55,
        url,
        version: 'v2025.Demo',
        dateAudited: 'Just now',
        summary: `Could not fetch or analyze the URL. Showing demo data. Error: ${err.message}`,
        stats: { safeCount: 2, moderateCount: 1, criticalCount: 1 },
        clauses: [
          { id: 'demo-c1', section: 'SEC 1', title: 'Data Collection Rights', verbatimExcerpt: 'We may collect personal information including name, email, and usage data for analytics and service improvement purposes.', plainEnglishVerdict: 'The company collects your personal data and usage patterns for analytics and to improve their services.', riskLevel: 'MODERATE', whyItMatters: 'Your personal data is being collected and may be shared with analytics partners.', actionableTip: 'Review privacy settings and opt out of data sharing where possible.', category: 'Telemetry & Privacy' },
          { id: 'demo-c2', section: 'SEC 2', title: 'Limitation of Liability', verbatimExcerpt: 'In no event shall our total liability exceed the amount paid by you in the twelve months preceding the claim.', plainEnglishVerdict: 'The company limits its financial responsibility to what you paid them in the last year.', riskLevel: 'HIGH RISK', whyItMatters: 'You cannot recover damages beyond 12 months of fees paid, regardless of severity.', actionableTip: 'Negotiate higher liability caps or request insurance coverage.', category: 'Liability' },
          { id: 'demo-c3', section: 'SEC 3', title: 'User Content License', verbatimExcerpt: 'By submitting content, you grant us a worldwide, non-exclusive license to use, modify, and distribute your content.', plainEnglishVerdict: 'Any content you submit can be used, modified, and shared by the company worldwide.', riskLevel: 'MODERATE', whyItMatters: 'Your content may be reused or modified beyond the original purpose you intended.', actionableTip: 'Ensure the license scope is limited to providing the service.', category: 'Intellectual Property' },
          { id: 'demo-c4', section: 'SEC 4', title: 'Standard Terms', verbatimExcerpt: 'This agreement is governed by the laws of the applicable jurisdiction and constitutes the entire agreement between parties.', plainEnglishVerdict: 'This is a standard governing law clause that defines which jurisdiction applies to disputes.', riskLevel: 'SAFE', whyItMatters: 'Standard legal boilerplate that establishes the legal framework for the agreement.', actionableTip: 'No immediate action needed.', category: 'General Terms' },
        ],
      };
      onAnalyzeUrlOrText(url);
      onOpenAudit(fallbackAudit);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const mapCategory = (cat: string): any => {
    const map: Record<string, string> = {
      data_sharing: 'Telemetry & Privacy',
      arbitration: 'Arbitration & Legal',
      termination: 'Termination & Billing',
      liability: 'Liability',
      ip_license: 'Intellectual Property',
      payments: 'Termination & Billing',
    };
    return map[cat] || 'AI Training';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUrlInput(`File: ${file.name}`);
      onAnalyzeUrlOrText(`Uploaded Document: ${file.name}`);
    }
  };

  const handleCopilotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    onAskCopilot(copilotInput);
    setCopilotInput('');
  };

  const handleQuickQuestionClick = (q: string) => {
    setCopilotInput(q);
    onAskCopilot(q);
  };

  return (
    <main className="flex-1 w-full pt-20 pb-28 px-4 max-w-md mx-auto flex flex-col relative subtle-grid">
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-80 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <section className="relative w-full pt-1 pb-2 flex flex-col items-center justify-center">
        <ThreeScene />
      </section>

      <section className="mt-3 mb-5">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1.5">Autonomous Integrity Engine</p>
        <h1 className="font-display text-[26px] font-light text-white tracking-tight leading-[1.2] mb-1.5">Analyze any contract in seconds.</h1>
        <p className="text-[13px] text-slate-400 font-normal mb-4 leading-relaxed">Extract hidden liabilities, AI data retention rights, and binding terms with zero jargon.</p>

        <div className="bg-[#121212] border border-white/5 rounded-2xl p-2.5 neon-border-glow transition-all duration-300 shadow-xl">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <LinkIcon className="text-indigo-400 w-4 h-4 shrink-0" />
            <input type="text" id="main-url-input" value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnalyze(); }}
              placeholder="Paste URL (e.g. apple.com/legal) or terms..."
              className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none font-body"
              disabled={isAnalyzing}
            />
            <button type="button" id="quick-paste-btn" onClick={handlePaste}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-[11px] font-mono transition-colors ${pastedFeedback ? 'text-emerald-400' : 'text-slate-300'}`}>
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>{pastedFeedback ? 'Pasted' : 'Paste'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5 px-1">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer text-slate-400 hover:text-white transition-colors text-[12px]">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Doc / PDF</span>
              <input type="file" id="quick-file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <button type="button" id="quick-analyze-trigger" disabled={isAnalyzing} onClick={handleAnalyze}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors disabled:opacity-60 shadow-sm active:scale-95">
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5 mb-6">
        <button type="button" onClick={onOpenCameraScan}
          className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col items-center text-center hover:border-white/15 active:scale-98 transition-all group">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mb-2 group-hover:bg-indigo-600/15 transition-colors">
            <ScanLine className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-display font-medium text-[12px] text-white">Camera Scan</span>
          <span className="font-mono text-[9px] text-slate-500 uppercase mt-0.5">Instant OCR</span>
        </button>
        <button type="button" onClick={onOpenCompare}
          className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col items-center text-center hover:border-white/15 active:scale-98 transition-all group">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mb-2 group-hover:bg-indigo-600/15 transition-colors">
            <GitCompare className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-display font-medium text-[12px] text-white">Compare</span>
          <span className="font-mono text-[9px] text-slate-500 uppercase mt-0.5">Diff View</span>
        </button>
        <button type="button" onClick={onOpenTrack}
          className="bg-[#121212] border border-white/5 p-3 rounded-2xl flex flex-col items-center text-center hover:border-white/15 active:scale-98 transition-all group">
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center mb-2 group-hover:bg-emerald-500/15 transition-colors">
            <Radar className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-display font-medium text-[12px] text-white">Monitoring</span>
          <span className="font-mono text-[9px] text-slate-500 uppercase mt-0.5">Live Alerts</span>
        </button>
      </section>

      <section className="mb-7">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="font-display font-medium text-[15px] text-white tracking-tight">Contract Q&A Copilot</h2>
          </div>
          <span className="font-mono text-[10px] text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">AGENTIC AI</span>
        </div>

        <form onSubmit={handleCopilotSubmit} className="bg-[#121212] rounded-xl p-1.5 mb-3 neon-border-glow transition-all flex items-center gap-2 border border-white/5">
          <BrainCircuit className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
          <input type="text" id="copilot-input" value={copilotInput} onChange={(e) => setCopilotInput(e.target.value)}
            placeholder="Ask any clause question..."
            className="w-full bg-transparent text-[12px] text-white placeholder:text-slate-500 focus:outline-none font-body" />
          <button type="submit" className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center active:scale-95 transition-colors shrink-0">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="grid grid-cols-2 gap-2 mb-3.5">
          <button type="button" onClick={() => handleQuickQuestionClick('Can they train AI models on my data?')}
            className="bg-[#121212] p-3 rounded-xl text-left hover:border-white/15 active:scale-98 transition-all border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-indigo-400 mb-1.5">
              <Bot className="w-3.5 h-3.5" />
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all rotate-[-45deg]" />
            </div>
            <span className="text-[11px] text-slate-200 font-medium leading-snug">Can they train AI models on my data?</span>
          </button>
          <button type="button" onClick={() => handleQuickQuestionClick('What are termination & refund penalties?')}
            className="bg-[#121212] p-3 rounded-xl text-left hover:border-white/15 active:scale-98 transition-all border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-amber-400 mb-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all rotate-[-45deg]" />
            </div>
            <span className="text-[11px] text-slate-200 font-medium leading-snug">What are termination & refund penalties?</span>
          </button>
          <button type="button" onClick={() => handleQuickQuestionClick('Is there mandatory binding arbitration?')}
            className="bg-[#121212] p-3 rounded-xl text-left hover:border-white/15 active:scale-98 transition-all border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-rose-400 mb-1.5">
              <FileText className="w-3.5 h-3.5" />
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all rotate-[-45deg]" />
            </div>
            <span className="text-[11px] text-slate-200 font-medium leading-snug">Is there mandatory binding arbitration?</span>
          </button>
          <button type="button" onClick={() => handleQuickQuestionClick('Do they sell telemetry to third parties?')}
            className="bg-[#121212] p-3 rounded-xl text-left hover:border-white/15 active:scale-98 transition-all border border-white/5 flex flex-col justify-between group">
            <div className="flex items-center justify-between text-emerald-400 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all rotate-[-45deg]" />
            </div>
            <span className="text-[11px] text-slate-200 font-medium leading-snug">Do they sell telemetry to third parties?</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#161616] to-[#0F0F0F] rounded-2xl p-4 border border-white/5 relative overflow-hidden shadow-lg">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                <span className="font-mono text-[10px] uppercase text-indigo-400 tracking-wider font-semibold">Active Inquest Result</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>{copilotResult.confidence}% Confidence &bull; {copilotResult.sectionRef}</span>
              </div>
            </div>
            <p className="text-[12px] text-white font-medium mb-1.5">Q: &quot;{copilotResult.question}&quot;</p>
            <div className="text-[12px] text-slate-300 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: copilotResult.answerHtml }} />
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
              <span className="font-mono text-[10px] text-slate-500">SOURCE: {copilotResult.sourceDoc}</span>
              <button type="button" onClick={() => { const t = recentAudits.find((a) => a.id === 'openai-tos') || recentAudits[0]; onOpenAudit(t, 'oai-c42'); }}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px] font-mono transition-colors">
                <span>Read Clause</span><ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-medium text-[15px] text-white tracking-tight">Recent Audits</h2>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400">{recentAudits.length} TODAY</span>
          </div>
          <button type="button" onClick={onOpenVault} className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px] flex items-center gap-0.5 transition-colors">
            <span>Vault</span><ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAudits.map((audit) => {
          let riskPill = <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 font-mono text-[10px] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span>SAFE</span></div>;
          if (audit.riskLevel === 'HIGH RISK') riskPill = <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-mono text-[10px] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /><span>HIGH RISK</span></div>;
          else if (audit.riskLevel === 'MODERATE') riskPill = <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 font-mono text-[10px] shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span>MODERATE</span></div>;

          let icon = <Bot className="w-4 h-4 text-indigo-400" />;
          let iconBg = 'bg-white/5 border-white/5';
          if (audit.company.includes('Slack')) { icon = <MessageSquare className="w-4 h-4 text-indigo-400" />; }
          else if (audit.company.includes('Stripe')) { icon = <CreditCard className="w-4 h-4 text-emerald-400" />; }

          return (
            <article key={audit.id} onClick={() => onOpenAudit(audit)}
              className="bg-[#121212] p-3.5 rounded-2xl border border-white/5 hover:border-white/15 transition-all cursor-pointer group active:scale-98">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${iconBg} border flex items-center justify-center shrink-0`}>{icon}</div>
                  <div className="min-w-0">
                    <h3 className="font-display font-medium text-[13px] text-white truncate group-hover:text-indigo-400 transition-colors">{audit.title}</h3>
                    <p className="font-mono text-[10px] text-slate-500">{audit.timeAgo} &bull; {audit.focusArea}</p>
                  </div>
                </div>
                {riskPill}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
};
