export type TrendSource =
  | "instagram"
  | "x"
  | "google"
  | "internal"
  | "manual";

export type TrendSignal = {
  id: string;
  topic: string;
  source: TrendSource;
  signal: string;
  viralScore: number;
  urgency: "low" | "medium" | "high";
  recommendedFormat: import("@/types/content").ContentFormat;
  recommendedPillar: import("@/types/content").ContentPillar;
  hook: string;
  angle: string;
  rationale: string;
  keywords: string[];
  suggestedChannels: import("@/types/content").PublicationChannel[];
};

export type CarouselSlideRole =
  | "cover"
  | "problem"
  | "stakes"
  | "insight"
  | "proof"
  | "solution"
  | "cta";

export type CarouselSlide = {
  index: number;
  role: CarouselSlideRole;
  headline: string;
  supportingText: string;
  accentColor: string;
  emoji: string;
  visualDirection: string;
};

export type CarouselPackage = {
  topic: string;
  title: string;
  objective: string;
  caption: string;
  hashtags: string[];
  cta: string;
  slides: CarouselSlide[];
};

export type ViralVariant = {
  id: string;
  angle: string;
  hook: string;
  strategy: string;
  viralScore: number;
  recommendedChannels: import("@/types/content").PublicationChannel[];
  recommendedTime: string;
  content: import("@/types/content").ErizonContentOutput;
};

export type WeeklyScheduleSlot = {
  day: string;
  time: string;
  format: import("@/types/content").ContentFormat;
  pillar: import("@/types/content").ContentPillar;
  objective: string;
  channels: import("@/types/content").PublicationChannel[];
  reason: string;
};

export type PublishingReadiness = {
  instagram: boolean;
  linkedin: boolean;
  facebook: boolean;
  tiktok: boolean;
};

export type CampaignStep = {
  order: number;
  title: string;
  objective: string;
  format: import("@/types/content").ContentFormat;
  pillar: import("@/types/content").ContentPillar;
  hook: string;
  angle: string;
  recommendedDayOffset: number;
};

export type CampaignPlan = {
  name: string;
  thesis: string;
  audienceIntent: string;
  steps: CampaignStep[];
};

export type SuperAgentOutput = {
  generatedAt: string;
  trends: TrendSignal[];
  selectedTrend: TrendSignal | null;
  carousel: CarouselPackage | null;
  viralVariants: ViralVariant[];
  campaign: CampaignPlan | null;
  weeklySchedule: WeeklyScheduleSlot[];
  publishingReadiness: PublishingReadiness;
};

export type SuperAgentRunSummary = {
  id: string;
  topic: string;
  objective: string | null;
  createdAt: string;
  selectedTrendTopic: string | null;
  selectedTrendScore: number | null;
  variantCount: number;
};

