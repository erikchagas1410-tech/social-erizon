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
