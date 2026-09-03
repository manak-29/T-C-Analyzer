export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH RISK';

export interface LegalClause {
  id: string;
  section: string;
  title: string;
  verbatimExcerpt: string;
  plainEnglishVerdict: string;
  riskLevel: RiskLevel;
  whyItMatters: string;
  actionableTip: string;
  category: 'AI Training' | 'Telemetry & Privacy' | 'Arbitration & Legal' | 'Liability' | 'Termination & Billing' | 'Intellectual Property';
}

export interface ContractAudit {
  id: string;
  title: string;
  company: string;
  timeAgo: string;
  focusArea: string;
  riskLevel: RiskLevel;
  riskScore: number;
  url: string;
  version: string;
  dateAudited: string;
  summary: string;
  clauses: LegalClause[];
  stats: {
    safeCount: number;
    moderateCount: number;
    criticalCount: number;
  };
}

export interface CopilotQAResult {
  question: string;
  answerHtml: string;
  plainSummary: string;
  confidence: number;
  sectionRef: string;
  sourceDoc: string;
  riskHighlight?: string;
  clauseExcerpt?: string;
}

export interface MonitoredService {
  id: string;
  name: string;
  category: string;
  activeSince: string;
  lastChecked: string;
  status: 'monitoring' | 'drift-detected' | 'stable';
  currentVersion: string;
  riskLevel: RiskLevel;
  recentAlert?: {
    date: string;
    title: string;
    description: string;
    impact: RiskLevel;
  };
}

export interface ComparisonVector {
  feature: string;
  contractA: {
    text: string;
    verdict: string;
    risk: RiskLevel;
  };
  contractB: {
    text: string;
    verdict: string;
    risk: RiskLevel;
  };
}
