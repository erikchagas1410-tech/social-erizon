import { buildCampaignPlan } from "@/lib/campaign-engine";
import { buildCarouselPackage } from "@/lib/carousel-generator";
import { generateErizonContent } from "@/lib/groq";
import { buildWeeklySchedule } from "@/lib/scheduler-engine";
import { analyzeTrendSignals } from "@/lib/trend-analyzer";
import {
  ContentFormat,
  ContentPillar,
  ErizonContentOutput,
  PublicationChannel
} from "@/types/content";
import {
  PublishingReadiness,
  SuperAgentOutput,
  TrendSignal,
  ViralVariant
} from "@/types/super-agent";

type SuperAgentParams = {
  topic?: string;
  objective?: string;
  channels?: PublicationChannel[];
  trendLimit?: number;
};

const VARIANT_STRATEGIES = [
  {
    id: "contrarian",
    strategy: "confronto com crença popular",
    hookPrefix: "Quase todo mundo esta lendo isso errado"
  },
  {
    id: "authority",
    strategy: "autoridade com leitura de dados",
    hookPrefix: "Os dados contam uma historia bem menos confortavel"
  },
  {
    id: "urgency",
    strategy: "urgencia e custo invisivel",
    hookPrefix: "Cada dia sem diagnostico custa mais do que parece"
  }
] as const;

export async function generateSuperAgentOutput(
  params: SuperAgentParams
): Promise<SuperAgentOutput> {
  const trends = await analyzeTrendSignals(params.topic, params.trendLimit ?? 6);
  const selectedTrend = trends[0] ?? null;
  const viralVariants = selectedTrend
    ? await generateViralVariants(selectedTrend, params)
    : [];
  const carousel = selectedTrend
    ? buildCarouselPackage(selectedTrend, viralVariants[0]?.content ?? null)
    : null;
  const campaign =
    selectedTrend && viralVariants.length
      ? buildCampaignPlan({
          trend: selectedTrend,
          variants: viralVariants
        })
      : null;

  return {
    generatedAt: new Date().toISOString(),
    trends,
    selectedTrend,
    carousel,
    viralVariants,
    campaign,
    weeklySchedule: buildWeeklySchedule({
      trend: selectedTrend,
      variants: viralVariants
    }),
    publishingReadiness: getPublishingReadiness()
  };
}

async function generateViralVariants(
  trend: TrendSignal,
  params: SuperAgentParams
): Promise<ViralVariant[]> {
  const variants = await Promise.all(
    VARIANT_STRATEGIES.map(async (variant, index) => {
      const content = await createVariantContent(trend, variant, params, index);

      return {
        id: variant.id,
        angle: content.angulo,
        hook: content.gancho,
        strategy: variant.strategy,
        viralScore: Math.max(55, Math.min(99, trend.viralScore - 4 + index * 3)),
        recommendedChannels: params.channels?.length ? params.channels : trend.suggestedChannels,
        recommendedTime: pickVariantTime(index),
        content
      } satisfies ViralVariant;
    })
  );

  return variants.sort((a, b) => b.viralScore - a.viralScore);
}

async function createVariantContent(
  trend: TrendSignal,
  variant: (typeof VARIANT_STRATEGIES)[number],
  params: SuperAgentParams,
  index: number
): Promise<ErizonContentOutput> {
  try {
    return await generateErizonContent({
      topic: trend.topic,
      objective:
        params.objective ??
        `Criar uma peca com alto potencial de share e save sobre ${trend.topic.toLowerCase()}.`,
      pillar: trend.recommendedPillar,
      format: index === 0 ? "carrossel" : trend.recommendedFormat,
      channels: params.channels ?? trend.suggestedChannels,
      creativeBrief: [
        `Variante: ${variant.strategy}.`,
        `Gancho esperado: ${variant.hookPrefix}.`,
        `Trend score de referencia: ${trend.viralScore}.`,
        `A peca precisa explorar ${trend.angle.toLowerCase()}.`
      ].join(" ")
    });
  } catch {
    return buildFallbackVariant(trend, variant, params.channels ?? trend.suggestedChannels, index);
  }
}

function buildFallbackVariant(
  trend: TrendSignal,
  variant: (typeof VARIANT_STRATEGIES)[number],
  channels: PublicationChannel[],
  index: number
): ErizonContentOutput {
  const hook = `${variant.hookPrefix}: ${trend.topic.toLowerCase()}.`;
  const format: ContentFormat = index === 0 ? "carrossel" : trend.recommendedFormat;
  const pillar: ContentPillar = trend.recommendedPillar;
  const hashtags = [
    "erizon",
    "decisao",
    "operacao",
    "lucro",
    pillar,
    ...trend.keywords.slice(0, 4)
  ];

  return {
    titulo_interno: `ERIZON | ${variant.id} | ${trend.topic}`,
    objetivo: `Gerar share, save e conversa sobre ${trend.topic.toLowerCase()}.`,
    pilar: pillar,
    formato: format,
    ideia_central: trend.angle,
    angulo: variant.strategy,
    gancho: hook,
    estrutura_criativo: `Layout ${format === "carrossel" ? "carrossel narrativo" : "feed viral"}; abordagem ${variant.strategy}; variacao claramente diferente das outras duas.`,
    texto_criativo: `${hook}\n\n${trend.angle}`,
    legenda: `${hook}\n\n${trend.rationale}\n\nSalve para revisar na proxima decisao dificil.\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`,
    cta: "Salve e compartilhe com quem decide verba, operacao ou crescimento.",
    prompt_imagem: `Criar arte Erizon premium sobre ${trend.topic}, com ${variant.strategy}, fundo escuro, grid tecnico, glow neon, tipografia pesada e composicao que pare o scroll.`,
    alt_text: `Arte Erizon sobre ${trend.topic} com foco em ${variant.strategy}.`,
    hashtags,
    sugestao_horario: pickVariantTime(index),
    justificativa: `Variante orientada a ${variant.strategy} para aproveitar o sinal de trend com score ${trend.viralScore}.`,
    hipotese_performance: "Tensao alta + gancho direto + visual premium devem elevar stop rate, save e compartilhamento.",
    canais_publicacao: channels
  };
}

function pickVariantTime(index: number) {
  return ["08:12", "12:18", "18:24"][index] ?? "12:00";
}

function getPublishingReadiness(): PublishingReadiness {
  return {
    instagram: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_ACCOUNT_ID),
    linkedin: Boolean(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_URN),
    facebook: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
    tiktok: Boolean(process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_ADVERTISER_ID)
  };
}
