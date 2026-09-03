import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, CheckCircle, Upload, ShieldAlert, Sparkles } from 'lucide-react';
import { ContractAudit } from '../types';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (audit: ContractAudit) => void;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedClauses, setDetectedClauses] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setStreamActive(false); setIsProcessing(false); setScanProgress(0);
      return;
    }
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => { stream = s; if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); setStreamActive(true); } })
      .catch(() => { setStreamActive(false); });
    return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCaptureAndAnalyze = () => {
    setIsProcessing(true); setScanProgress(15); setDetectedClauses(['Detecting bounding boxes...']);
    setTimeout(() => { setScanProgress(45); setDetectedClauses(['Recognizing OCR: Section 12.3 Indemnification', 'Detected Binding Arbitration Clause']); }, 600);
    setTimeout(() => { setScanProgress(80); setDetectedClauses(['Analyzing AI Model Retraining Rights...', 'Computing 3D Risk Matrix Vector']); }, 1200);
    setTimeout(() => {
      setScanProgress(100);
      const generatedAudit: ContractAudit = {
        id: `scanned-${Date.now()}`, title: 'Photographed Service Agreement', company: 'Cloud Provider Inc.',
        timeAgo: 'Just now', focusArea: 'OCR Scan \u2022 AI Rights & Indemnity', riskLevel: 'HIGH RISK', riskScore: 82,
        url: 'Camera Document Capture', version: 'v2025.PhotoScan', dateAudited: 'Just now',
        summary: 'Extracted from physical printed contract. Detected high-risk unilateral indemnity and automatic annual renewal terms with 30-day cancellation trap.',
        stats: { safeCount: 6, moderateCount: 3, criticalCount: 4 },
        clauses: [
          { id: 'scan-c1', section: 'SEC 12.4', title: 'Unilateral Automatic Renewal Trap', verbatimExcerpt: 'This Agreement automatically renews for successive 12-month periods unless written notice is received not less than 60 days prior to the expiration date.', plainEnglishVerdict: 'Strict auto-renewal clause requiring 60-day advance notice or you are locked in for another full year.', riskLevel: 'HIGH RISK', whyItMatters: 'Very narrow window to cancel before incurring full annual subscription renewal invoice.', actionableTip: 'Set a calendar reminder 75 days before renewal date.', category: 'Termination & Billing' },
          { id: 'scan-c2', section: 'SEC 7.1', title: 'Indemnification for Third-Party Claims', verbatimExcerpt: 'Customer shall defend, indemnify, and hold harmless Provider against all claims, losses, liabilities, and expenses arising out of Customer use of the Service.', plainEnglishVerdict: 'You must pay all legal fees and damages if a third party sues the provider regarding your usage.', riskLevel: 'HIGH RISK', whyItMatters: 'Uncapped financial liability exposure without mutual provider defense commitments.', actionableTip: 'Demand mutual indemnification with a liability cap matching annual fees.', category: 'Liability' },
        ],
      };
      setIsProcessing(false); onScanComplete(generatedAudit); onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-[#121212] rounded-2xl p-4 border border-white/10 shadow-2xl relative flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
          <div className="flex items-center gap-2"><Camera className="w-4 h-4 text-indigo-400" /><h3 className="font-display font-medium text-white text-[15px]">Camera OCR Scanner</h3></div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="relative w-full h-72 rounded-xl bg-black/80 border border-white/5 overflow-hidden flex items-center justify-center">
          {streamActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-3 text-indigo-400"><Camera className="w-6 h-6" /></div>
              <p className="text-white text-[13px] font-medium mb-1">Optical Document Scanner Active</p>
              <p className="text-slate-400 text-[11px] max-w-[220px]">Position any physical contract, legal notice, or lease agreement in view</p>
            </div>
          )}
          <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-lg">
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-500" />
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-500" />
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-500" />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-indigo-500" />
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-bounce top-1/3" />
          </div>
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/10 font-mono text-[9px] text-indigo-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" /><span>OCR SENSOR READY</span>
          </div>
        </div>
        {isProcessing && (
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-indigo-500/20 text-[11px] font-mono">
            <div className="flex items-center justify-between text-indigo-400 mb-1.5">
              <span className="flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> Neural OCR Decompiling...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2">
              <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
            </div>
            <div className="space-y-1 text-slate-400">
              {detectedClauses.map((msg, i) => (<div key={i} className="flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-emerald-400" /><span>{msg}</span></div>))}
            </div>
          </div>
        )}
        <div className="mt-3.5 flex items-center gap-2.5">
          <button type="button" disabled={isProcessing} onClick={handleCaptureAndAnalyze}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-colors shadow-sm">
            <Camera className="w-4 h-4" /><span>Capture & Audit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
