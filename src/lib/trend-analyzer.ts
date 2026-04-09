import { deserializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { ContentFormat, ContentPillar, PublicationChannel } from "@/types/content";
import { TrendSignal } from "@/types/super-agent";

type ExternalTrendPayload = Array<{
  topic?: string;
  source?: string;
  signal?: string;
  score?: number;
  keywords?: string[];
}>;

const DEFAULT_SIGNALS = [
  "CAC subindo enquanto a operacao chama isso de crescimento",
  "ROAS bonito escondendo margem destruida",
  "Times comprando mais trafego sem diagnostico de decisao",
  "Dashboard cheio e leitura pobre de risco real",
  "IA operacional como vantagem para lideres de marketing",
  "Campanhas com mais lead e menos caixa no fim do mes",
  "Escalar sem criterio e virar refem de vaidade",
  "Gestao que reage tarde aos sinais de queda"
];

export async function analyzeTrendSignals(topic?: string, limit = 6): Promise<TrendSignal[]> {
  const [externalSignals, internalSignals] = await Promise.all([
    fetchExternalTrendSignals(),
    fetchInternalTrendSignals(topic)
  ]);

  const merged = [...externalSignals, ...internalSignals];
  const deduped = dedupeSignals(merged);

  return deduped
    .sort((a, b) => b.viralScore - a.viralScore)
    .slice(0, limit);
}

async function fetchExternalTrendSignals(): Promise<TrendSignal[]> {
  const endpoints = [
    process.env.INSTAGRAM_TRENDS_ENDPOINT,
    process.env.X_TRENDS_ENDPOINT,
    process.env.GOOGLE_TRENDS_ENDPOINT
  ].filter(Boolean) as string[];

  if (!endpoints.length) {
    return [];
  }

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) {
          return [] as TrendSignal[];
        }

        const payload = (await response.json()) as ExternalTrendPayload;

        return payload
          .filter((item) => item.topic)
          .map((item, index) =>
            buildTrendSignal({
              topic: item.topic ?? "Trend externa",
              source: normalizeSource(item.source),
              signal: item.signal ?? item.topic ?? "Tendencia externa",
              keywords: item.keywords ?? [],
              boost: Math.round(item.score ?? 0),
              seed: `${endpoint}-${index}`
            })
          );
      } catch {
        return [] as TrendSignal[];
      }
    })
  );

  return results.flat();
}

async function fetchInternalTrendSignals(topic?: string): Promise<TrendSignal[]> {
  const baseTopics = [topic, ...DEFAULT_SIGNALS].filter(Boolean) as string[];
  const recentPostTopics = await getRecentPostTopics();
  const seeds = [...baseTopics, ...recentPostTopics];

  return seeds.map((entry, index) =>
    buildTrendSignal({
      topic: entry,
      source: "internal",
      signal: entry,
      keywords: extractKeywords(entry),
      boost: scoreText(entry),
      seed: `internal-${index}`
    })
  );
}

async function getRecentPostTopics() {
  if (!hasSupabaseEnv()) {
    return [] as string[];
  }

  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from("posts")
      .select("caption, created_at")
      .not("caption", "is", null)
      .order("created_at", { ascending: false })
      .limit(8);

    if (result.error) {
      throw result.error;
    }

    return (result.data ?? [])
      .map((row) => deserializeContentPayload(row.caption))
      .filter(Boolean)
      .map((content) => `${content?.gancho} ${content?.angulo}`.trim())
      .filter(Boolean);
  } catch {
    return [] as string[];
  }
}

function buildTrendSignal({
  topic,
  source,
  signal,
  keywords,
  boost,
  seed
}: {
  topic: string;
  source: TrendSignal["source"];
  signal: string;
  keywords: string[];
  boost: number;
  seed: string;
}): TrendSignal {
  const viralScore = Math.max(48, Math.min(98, 54 + boost));
  const recommendedFormat = pickFormat(topic, viralScore);
  const recommendedPillar = pickPillar(topic);
  const suggestedChannels: PublicationChannel[] =
    recommendedFormat === "analise" || recommendedFormat === "insight_estrategico"
      ? ["linkedin", "instagram"]
      : ["instagram", "linkedin"];

  return {
    id: seed,
    topic,
    source,
    signal,
    viralScore,
    urgency: viralScore >= 80 ? "high" : viralScore >= 65 ? "medium" : "low",
    recommendedFormat,
    recommendedPillar,
    hook: buildHook(topic),
    angle: buildAngle(topic),
    rationale: buildRationale(topic, viralScore, source),
    keywords: keywords.slice(0, 8),
    suggestedChannels
  };
}

function dedupeSignals(signals: TrendSignal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = signal.topic.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function normalizeSource(value?: string): TrendSignal["source"] {
  if (value === "instagram" || value === "x" || value === "google" || value === "manual") {
    return value;
  }

  return "manual";
}

function extractKeywords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\sáàâãéèêíïóôõöúç]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);
}

function scoreText(text: string) {
  const base = text.toLowerCase();

  return (
    (/(erro|queda|perda|destrui|vazando|alerta)/.test(base) ? 18 : 0) +
    (/(dados|analise|margem|roas|cac|lucro)/.test(base) ? 14 : 0) +
    (/(ia|dashboard|operacao|decisao)/.test(base) ? 10 : 0) +
    (/(trafego|campanha|escala)/.test(base) ? 8 : 0)
  );
}

function pickFormat(topic: string, viralScore: number): ContentFormat {
  const base = topic.toLowerCase();

  if (/(dados|analise|roas|cac|margem|lucro)/.test(base)) {
    return viralScore >= 80 ? "carrossel" : "analise";
  }

  if (/(erro|checklist|sinais|passos)/.test(base)) {
    return "checklist";
  }

  if (/(compar|versus|vs)/.test(base)) {
    return "comparacao";
  }

  return viralScore >= 75 ? "carrossel" : "post_de_decisao";
}

function pickPillar(topic: string): ContentPillar {
  const base = topic.toLowerCase();

  if (/(dados|analise|lucro|margem)/.test(base)) {
    return "autoridade";
  }

  if (/(erro|sinais|como|passos|checklist)/.test(base)) {
    return "educacao";
  }

  if (/(vazando|perda|queda)/.test(base)) {
    return "prova";
  }

  return "desejo";
}

function buildHook(topic: string) {
  return `O mercado ainda chama isso de normal. A Erizon chama de ${topic.toLowerCase()}.`;
}

function buildAngle(topic: string) {
  return `Transformar ${topic.toLowerCase()} em leitura operacional, tensao de mercado e decisao acionavel.`;
}

function buildRationale(topic: string, viralScore: number, source: TrendSignal["source"]) {
  return `Sinal ${source} com score ${viralScore}: ${topic.toLowerCase()} combina tensao, curiosidade e impacto direto em caixa.`;
}

