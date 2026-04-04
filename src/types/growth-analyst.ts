export interface GrowthOnboarding {
  niche: string;
  stage: string;
  monthlyRevenue: string;
  mainChannel: string;
  teamSize: string;
  biggestChallenge: string;
  mainGoal: string;
  leadSource: string;
  uniqueValue: string;
  whatFailed: string;
}

export interface OnboardingData {
  companyName: string;
  niche: string;
  stage: string;
  revenueChannels: string[];
  avgTicket: string;
  idealClient: string;
  closingTime: string;
  positioning: string[];
  differentiator: string;
  mainProblem: string;
  trafficGoal: string[];
  hasInstagram: string;
  hasGoogle: string;
  hasSite: string;
  hasCrm: string;
  leadResponder: string;
  responseTime: string;
  hasQualification: string;
  investmentRange: string;
  clientsPerMonth: string;
  clientValue: string;
  notes: string;
}

export interface GrowthSession {
  id: string;
  company_name: string;
  niche: string;
  stage: string;
  growth_score: number;
  onboarding_data: OnboardingData;
  report: GrowthReport;
  created_at: string;
}

export interface GrowthReport {
  diagnosis: { title: string; body: string };
  opportunities: Array<{ title: string; body: string; priority: "alta" | "media" | "baixa" }>;
  roadmap: {
    days30: Array<{ action: string; why: string }>;
    days60: Array<{ action: string; why: string }>;
    days90: Array<{ action: string; why: string }>;
  };
  contentStrategy: Array<{ channel: string; pillar: string; format: string; frequency: string }>;
  kpis: Array<{ metric: string; current: string; target: string; timeframe: string }>;
  nextMoves: Array<{ move: string; impact: string; effort: "baixo" | "medio" | "alto" }>;
  growthScore: number;
  bottleneck: string;
}
