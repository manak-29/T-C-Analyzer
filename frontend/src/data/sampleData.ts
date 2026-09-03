import { ContractAudit, CopilotQAResult, MonitoredService, ComparisonVector } from '../types';

export const INITIAL_AUDITS: ContractAudit[] = [
  {
    id: 'openai-tos',
    title: 'OpenAI Terms of Service',
    company: 'OpenAI',
    timeAgo: '2h ago',
    focusArea: 'Telemetry & IP',
    riskLevel: 'HIGH RISK',
    riskScore: 88,
    url: 'https://openai.com/policies/terms-of-use',
    version: 'v2025.1',
    dateAudited: 'Today, 20:02',
    summary: 'Contains aggressive foundation model training licenses on free and plus tiers unless specific enterprise opt-out is negotiated. Mandates individual binding arbitration and limits total company liability to $100 or the amounts paid in the last 12 months.',
    stats: { safeCount: 8, moderateCount: 4, criticalCount: 5 },
    clauses: [
      {
        id: 'oai-c42', section: 'SEC 4.2', title: 'Use of Content for Model Training',
        verbatimExcerpt: 'You grant OpenAI a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and create derivative works of your Content for the purpose of improving, evaluating, and training machine learning and artificial intelligence models, subject to statutory privacy rights.',
        plainEnglishVerdict: 'Yes, by default. Clause 4.2 grants a worldwide perpetual license to ingest customer inputs for foundation model iteration unless an enterprise DPA opt-out waiver is executed.',
        riskLevel: 'HIGH RISK', whyItMatters: 'Confidential prompt data, company trade secrets, or unpatented source code submitted via default tiers may be absorbed into public model weights.',
        actionableTip: 'Enable "Data Controls > Improve the model for everyone: OFF" in settings or deploy through API endpoints where zero-data-retention headers apply.',
        category: 'AI Training',
      },
      {
        id: 'oai-c81', section: 'SEC 8.1', title: 'Mandatory Binding Arbitration & Class Action Waiver',
        verbatimExcerpt: 'You and OpenAI agree that any dispute, claim, or controversy arising out of or relating to these Terms shall be settled by binding arbitration administered by ADR Services, and not in a court of general jurisdiction. You agree to waive any right to participate in a class action.',
        plainEnglishVerdict: 'You forfeit your constitutional right to sue in court or join class actions; all claims must be handled in private, confidential arbitration.',
        riskLevel: 'HIGH RISK', whyItMatters: 'Arbitration significantly restricts legal discovery, appeals, and collective bargaining power against systemic billing or privacy infringements.',
        actionableTip: 'Review the 30-day post-registration opt-out notice mechanism by mailing a written arbitration opt-out letter to their legal counsel.',
        category: 'Arbitration & Legal',
      },
      {
        id: 'oai-c94', section: 'SEC 9.4', title: 'Limitation of Liability & Indemnity',
        verbatimExcerpt: 'In no event will OpenAI\'s aggregate liability arising out of or related to these Terms exceed the greater of one hundred dollars ($100) or the total amounts paid by you in the twelve (12) months preceding the claim.',
        plainEnglishVerdict: 'OpenAI caps maximum damage payout at $100 or your last 12 months of subscription fees, regardless of the severity of any data breach or service disruption.',
        riskLevel: 'HIGH RISK', whyItMatters: 'If catastrophic AI hallucination or security vulnerability leaks proprietary customer data, you cannot recover business interruption damages.',
        actionableTip: 'Require custom indemnification guarantees through an enterprise SLA contract with mutual liability caps.',
        category: 'Liability',
      },
      {
        id: 'oai-c31', section: 'SEC 3.1', title: 'Unilateral Modifications & Notice',
        verbatimExcerpt: 'OpenAI may modify these Terms from time to time by posting revised versions on the website. Continued use of Services constitutes affirmative consent to revised terms.',
        plainEnglishVerdict: 'Terms can change silently at any time; your continued login or API usage automatically binds you to new obligations.',
        riskLevel: 'MODERATE', whyItMatters: 'Pricing structures, data retention periods, or copyright warranties could be curtailed without direct email warning.',
        actionableTip: 'Enable live automated monitoring in this app\'s Track tab to receive push notifications when policy hashes change.',
        category: 'Termination & Billing',
      },
      {
        id: 'oai-c52', section: 'SEC 5.2', title: 'Input & Output Intellectual Property Assignment',
        verbatimExcerpt: 'As between the parties and to the extent permitted by applicable law, you own your Input, and OpenAI assigns to you all its right, title, and interest in and to Output.',
        plainEnglishVerdict: 'You own what you put in, and OpenAI legally assigns output copyright to you, subject to third-party IP rights.',
        riskLevel: 'SAFE', whyItMatters: 'Provides legal authorization to commercialize generated text, code, and imagery in your own client deliverables.',
        actionableTip: 'Retain logs proving originality of prompt inputs to defend against potential copyright claims.',
        category: 'Intellectual Property',
      },
    ],
  },
  {
    id: 'slack-msa',
    title: 'Slack MSA & Data Addendum',
    company: 'Slack Technologies / Salesforce',
    timeAgo: 'Yesterday',
    focusArea: 'Subprocessor clause',
    riskLevel: 'MODERATE',
    riskScore: 54,
    url: 'https://slack.com/terms-of-service',
    version: 'v2024.3',
    dateAudited: 'Yesterday, 14:15',
    summary: 'Standard enterprise collaboration agreement with solid corporate customer data ownership, but contains 30-day unilateral subprocessor notification provisions and passive opt-in telemetry.',
    stats: { safeCount: 14, moderateCount: 6, criticalCount: 1 },
    clauses: [
      {
        id: 'slack-c6', section: 'SEC 6.3', title: 'Subprocessor Additions & 30-Day Notice',
        verbatimExcerpt: 'Customer acknowledges that Slack engages third-party Subprocessors. Slack will provide notice via its online RSS feed or email at least thirty (30) days prior to authorising any new Subprocessor.',
        plainEnglishVerdict: 'Slack can route your company messaging data to new third-party cloud vendors unless you lodge an objection within 30 days.',
        riskLevel: 'MODERATE', whyItMatters: 'New data subprocessors may operate in legal jurisdictions outside the EU/EEA or with lower SOC2 compliance thresholds.',
        actionableTip: 'Subscribe your data compliance officer to Slack\'s Subprocessor Security Notification list.',
        category: 'Telemetry & Privacy',
      },
      {
        id: 'slack-c11', section: 'SEC 11.1', title: 'Customer Data Ownership & Protection',
        verbatimExcerpt: 'Customer retains all right, title, and interest in Customer Data. Slack will not use Customer Data to train large language models across multiple tenants without express consent.',
        plainEnglishVerdict: 'You own all message history, channel files, and metadata. Multi-tenant AI training on your messages is prohibited.',
        riskLevel: 'SAFE', whyItMatters: 'Guarantees that proprietary company discussions remain isolated in your encrypted organization partition.',
        actionableTip: 'Ensure Enterprise Grid retention policies match your company\'s internal document destruction guidelines.',
        category: 'AI Training',
      },
    ],
  },
  {
    id: 'stripe-merchant',
    title: 'Stripe Merchant Agreement',
    company: 'Stripe, Inc.',
    timeAgo: '3d ago',
    focusArea: 'Indemnification',
    riskLevel: 'SAFE',
    riskScore: 28,
    url: 'https://stripe.com/legal/ssa',
    version: 'v2024.11',
    dateAudited: '3 days ago',
    summary: 'Well-balanced financial services agreement compliant with global payment network rules. Clear chargeback liability allocations and robust data security definitions.',
    stats: { safeCount: 19, moderateCount: 3, criticalCount: 0 },
    clauses: [
      {
        id: 'stripe-c4', section: 'SEC 4.1', title: 'Mutual Indemnification & Fraud Allocation',
        verbatimExcerpt: 'Stripe indemnifies Merchant against third-party claims asserting Stripe payment infrastructure infringes patent or copyright. Merchant remains responsible for customer chargebacks, refunds, and fines levied by Card Networks.',
        plainEnglishVerdict: 'Fair mutual indemnification. Stripe defends you if their software infringes IP; you handle chargeback disputes from your buyers.',
        riskLevel: 'SAFE', whyItMatters: 'Standard financial risk boundary that shields developers from core infrastructure IP suits.',
        actionableTip: 'Implement Stripe Radar with 3D Secure rules to automate chargeback dispute defenses.',
        category: 'Liability',
      },
    ],
  },
];

export const COPILOT_PRESETS: Record<string, CopilotQAResult> = {
  'Can they train AI models on my data?': {
    question: 'Can they train AI models on my data?',
    answerHtml: '<strong class="text-rose-400 font-medium">Yes, by default.</strong> Clause 4.2 grants a worldwide perpetual license to ingest customer inputs for foundation model iteration unless an enterprise DPA opt-out waiver is executed.',
    plainSummary: 'Yes, by default. Clause 4.2 grants a worldwide perpetual license to ingest customer inputs for foundation model iteration unless an enterprise DPA opt-out waiver is executed.',
    confidence: 98, sectionRef: 'SEC 4.2', sourceDoc: 'OpenAI Commercial Terms v2025', riskHighlight: 'HIGH RISK',
    clauseExcerpt: 'You grant OpenAI a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and create derivative works of your Content for the purpose of improving, evaluating, and training machine learning and artificial intelligence models.',
  },
  'What are termination & refund penalties?': {
    question: 'What are termination & refund penalties?',
    answerHtml: '<strong class="text-amber-400 font-medium">Non-refundable upfront fees.</strong> Clause 7.3 states that prepaid annual and monthly subscription fees are strictly non-refundable upon cancellation, with immediate forfeiture of unused inference quota tokens.',
    plainSummary: 'Non-refundable upfront fees. Clause 7.3 states that prepaid annual and monthly subscription fees are strictly non-refundable upon cancellation.',
    confidence: 95, sectionRef: 'SEC 7.3', sourceDoc: 'OpenAI Commercial Terms v2025', riskHighlight: 'MODERATE',
    clauseExcerpt: 'All subscription payments are non-refundable and non-creditable for partial subscription periods.',
  },
  'Is there mandatory binding arbitration?': {
    question: 'Is there mandatory binding arbitration?',
    answerHtml: '<strong class="text-rose-400 font-medium">Yes, with full class action waiver.</strong> Clause 8.1 compels private arbitration under ADR Services rules and waives any jury trial rights unless an opt-out letter is mailed within 30 days of registration.',
    plainSummary: 'Yes, with full class action waiver. Clause 8.1 compels private arbitration and waives jury trial rights.',
    confidence: 99, sectionRef: 'SEC 8.1', sourceDoc: 'OpenAI Commercial Terms v2025', riskHighlight: 'HIGH RISK',
    clauseExcerpt: 'You and OpenAI agree that any dispute shall be settled by binding individual arbitration and not in a court of general jurisdiction.',
  },
  'Do they sell telemetry to third parties?': {
    question: 'Do they sell telemetry to third parties?',
    answerHtml: '<strong class="text-emerald-400 font-medium">No direct monetary sale,</strong> but Section 9.2 permits broad diagnostic data sharing with analytics partners, identity providers, and cloud hosting infrastructure sub-processors.',
    plainSummary: 'No direct monetary sale, but Section 9.2 permits broad diagnostic data sharing with analytics partners.',
    confidence: 94, sectionRef: 'SEC 9.2', sourceDoc: 'OpenAI Commercial Terms v2025', riskHighlight: 'SAFE',
    clauseExcerpt: 'We do not sell your personal information for monetary consideration. We share telemetry with trusted technical infrastructure providers.',
  },
};

export const MONITORED_SERVICES_DATA: MonitoredService[] = [
  {
    id: 'mon-openai', name: 'OpenAI Developer Terms', category: 'AI Infrastructure',
    activeSince: 'Jan 2024', lastChecked: '4 mins ago', status: 'drift-detected',
    currentVersion: 'v2025.1.4', riskLevel: 'HIGH RISK',
    recentAlert: { date: 'Today 19:40', title: 'Clause 4.2 Model Retraining Scope Expanded', description: 'Modified language from "evaluate models" to "train and fine-tune foundation models" across unpaid API tiers.', impact: 'HIGH RISK' },
  },
  {
    id: 'mon-apple', name: 'Apple Developer Program License', category: 'Ecosystem & OS',
    activeSince: 'Aug 2023', lastChecked: '12 mins ago', status: 'stable',
    currentVersion: 'v2024-WWDC', riskLevel: 'MODERATE',
    recentAlert: { date: 'Aug 28, 2024', title: 'EU Core Technology Fee Clause Enacted', description: 'Introduced terms governing alternative app marketplace distribution and statutory developer fee obligations.', impact: 'MODERATE' },
  },
  {
    id: 'mon-figma', name: 'Figma Terms of Service & AI Opt-out', category: 'Design & Collaboration',
    activeSince: 'Nov 2023', lastChecked: '1h ago', status: 'stable',
    currentVersion: 'v2024.8', riskLevel: 'SAFE',
    recentAlert: { date: 'Jul 15, 2024', title: 'Generative AI Training Switch Defaulted to Off', description: 'Updated settings so team canvas contents are not ingested for Adobe/Figma feature models without explicit opt-in.', impact: 'SAFE' },
  },
];

export const COMPARISON_VECTORS_DATA: ComparisonVector[] = [
  {
    feature: 'AI Training On User Inputs',
    contractA: { text: 'Allowed by default on free/plus tiers unless enterprise DPA waiver executed.', verdict: 'High Risk: User data used for iteration', risk: 'HIGH RISK' },
    contractB: { text: 'Strictly prohibited across both commercial API and individual tier accounts.', verdict: 'Safe: Zero model training guarantee', risk: 'SAFE' },
  },
  {
    feature: 'Dispute Resolution & Court Access',
    contractA: { text: 'Mandatory individual binding arbitration with full class action waiver.', verdict: 'High Risk: Forfeits right to court trial', risk: 'HIGH RISK' },
    contractB: { text: 'Jurisdiction in Delaware Chancery Court with mutual jury trial waiver.', verdict: 'Moderate: Formal court litigation preserved', risk: 'MODERATE' },
  },
  {
    feature: 'Total Liability Cap',
    contractA: { text: 'Strictly capped at $100 or fees paid in last 12 months.', verdict: 'High Risk: Minimal company financial exposure', risk: 'HIGH RISK' },
    contractB: { text: 'Capped at 3x aggregate fees paid or $500,000 whichever is greater.', verdict: 'Safe: Substantial recovery cushion', risk: 'SAFE' },
  },
  {
    feature: 'IP Ownership of Generated Outputs',
    contractA: { text: 'Assigns all rights in outputs to user to extent permitted by law.', verdict: 'Safe: Full commercialization rights', risk: 'SAFE' },
    contractB: { text: 'Assigns all rights in outputs to user with explicit warranty of title.', verdict: 'Safe: Warranted output ownership', risk: 'SAFE' },
  },
  {
    feature: 'Unilateral Policy Modifications',
    contractA: { text: 'Changes effective upon web publication; continued use is assent.', verdict: 'Moderate: Requires constant monitoring', risk: 'MODERATE' },
    contractB: { text: 'Requires 30 days direct email notice for material adverse modifications.', verdict: 'Safe: Adequate notice guaranteed', risk: 'SAFE' },
  },
];
