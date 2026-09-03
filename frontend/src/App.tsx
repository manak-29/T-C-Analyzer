import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ScanScreen } from './components/ScanScreen';
import { CompareScreen } from './components/CompareScreen';
import { TrackScreen } from './components/TrackScreen';
import { VaultScreen } from './components/VaultScreen';
import { AuditDetailModal } from './components/AuditDetailModal';
import { CameraScanModal } from './components/CameraScanModal';
import { INITIAL_AUDITS, COPILOT_PRESETS } from './data/sampleData';
import { ContractAudit, CopilotQAResult } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('SCAN');
  const [audits, setAudits] = useState<ContractAudit[]>(INITIAL_AUDITS);
  const [selectedAudit, setSelectedAudit] = useState<ContractAudit | null>(null);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [isCameraScanOpen, setIsCameraScanOpen] = useState(false);
  const [copilotResult, setCopilotResult] = useState<CopilotQAResult>(
    COPILOT_PRESETS['Can they train AI models on my data?']
  );

  const handleOpenAudit = (audit: ContractAudit, clauseId?: string) => {
    setSelectedAudit(audit);
    setSelectedClauseId(clauseId || null);
  };

  const handleAnalyzeUrlOrText = (input: string) => {
    // Placeholder - actual API call happens in ScanScreen
  };

  const handleAskCopilot = (question: string) => {
    if (COPILOT_PRESETS[question]) {
      setCopilotResult(COPILOT_PRESETS[question]);
      return;
    }
    const qLower = question.toLowerCase();
    if (qLower.includes('ai') || qLower.includes('train') || qLower.includes('model')) {
      setCopilotResult({
        question, answerHtml: '<strong class="text-rose-400 font-medium">Yes, foundation training permitted.</strong> Clause 4.2 grants wide latitude to ingest prompts and submitted text into foundation models unless an enterprise privacy waiver is countersigned.',
        plainSummary: 'Yes, foundation training permitted by default unless an enterprise opt-out is negotiated.', confidence: 97, sectionRef: 'SEC 4.2', sourceDoc: 'Audited Agreement v2025', riskHighlight: 'HIGH RISK',
      });
    } else if (qLower.includes('refund') || qLower.includes('cancel') || qLower.includes('penalty')) {
      setCopilotResult({
        question, answerHtml: '<strong class="text-amber-400 font-medium">Prepaid fees are non-refundable.</strong> Clause 7.3 locks in all upfront payments without pro-rata refunds upon mid-cycle termination.',
        plainSummary: 'Prepaid fees are non-refundable upon mid-cycle termination.', confidence: 96, sectionRef: 'SEC 7.3', sourceDoc: 'Audited Agreement v2025', riskHighlight: 'MODERATE',
      });
    } else if (qLower.includes('arbitrat') || qLower.includes('sue') || qLower.includes('court')) {
      setCopilotResult({
        question, answerHtml: '<strong class="text-rose-400 font-medium">Mandatory binding arbitration enforced.</strong> Clause 8.1 strips jury trial rights and class action participation.',
        plainSummary: 'Mandatory binding arbitration enforced with strict class action waiver.', confidence: 99, sectionRef: 'SEC 8.1', sourceDoc: 'Audited Agreement v2025', riskHighlight: 'HIGH RISK',
      });
    } else {
      setCopilotResult({
        question, answerHtml: '<strong class="text-indigo-400 font-medium">Neural Analysis:</strong> Based on the contract provisions, obligations are strictly bilateral with standard confidentiality protections.',
        plainSummary: 'Provisions follow standard commercial confidentiality guidelines with bilateral protections.', confidence: 94, sectionRef: 'SEC 14.1', sourceDoc: 'Audited Agreement v2025', riskHighlight: 'MODERATE',
      });
    }
  };

  const handleDeleteAudit = (id: string) => {
    setAudits((prev) => prev.filter((a) => a.id !== id));
    if (selectedAudit?.id === id) setSelectedAudit(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-300 flex flex-col font-body selection:bg-indigo-600/30 selection:text-indigo-200">
      <Header />
      {currentTab === 'SCAN' && (
        <ScanScreen
          onAnalyzeUrlOrText={handleAnalyzeUrlOrText}
          onOpenAudit={handleOpenAudit}
          onOpenCompare={() => setCurrentTab('COMPARE')}
          onOpenTrack={() => setCurrentTab('TRACK')}
          onOpenVault={() => setCurrentTab('VAULT')}
          onOpenCameraScan={() => setIsCameraScanOpen(true)}
          recentAudits={audits.slice(0, 3)}
          copilotResult={copilotResult}
          onAskCopilot={handleAskCopilot}
        />
      )}
      {currentTab === 'COMPARE' && <CompareScreen />}
      {currentTab === 'TRACK' && <TrackScreen />}
      {currentTab === 'VAULT' && <VaultScreen audits={audits} onSelectAudit={handleOpenAudit} onDeleteAudit={handleDeleteAudit} />}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      {selectedAudit && (
        <AuditDetailModal audit={selectedAudit} selectedClauseId={selectedClauseId}
          onClose={() => { setSelectedAudit(null); setSelectedClauseId(null); }}
          onAskCopilot={(q) => { handleAskCopilot(q); setCurrentTab('SCAN'); }}
        />
      )}
      <CameraScanModal isOpen={isCameraScanOpen} onClose={() => setIsCameraScanOpen(false)}
        onScanComplete={(newAudit) => { setAudits([newAudit, ...audits]); setSelectedAudit(newAudit); }}
      />
    </div>
  );
}
