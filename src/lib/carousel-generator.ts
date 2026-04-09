import { ErizonContentOutput } from "@/types/content";
import { CarouselPackage, CarouselSlide, TrendSignal } from "@/types/super-agent";

const SLIDE_COLORS = ["#BC13FE", "#00F2FF", "#FF00E5", "#7CFF6B", "#FFD84D", "#FFFFFF", "#BC13FE"];
const SLIDE_EMOJIS = ["?", "??", "??", "??", "??", "???", "??"];
const SLIDE_ROLES: CarouselSlide["role"][] = [
  "cover",
  "problem",
  "stakes",
  "insight",
  "proof",
  "solution",
  "cta"
];

export function buildCarouselPackage(
  trend: TrendSignal,
  seedContent?: ErizonContentOutput | null
): CarouselPackage {
  const title = seedContent?.gancho ?? trend.hook;
  const objective = seedContent?.objetivo ?? `Transformar ${trend.topic.toLowerCase()} em narrativa de autoridade e compartilhamento.`;
  const hashtags = normalizeHashtags(seedContent?.hashtags ?? buildDefaultHashtags(trend));
  const cta = seedContent?.cta ?? "Salve este carrossel e use na proxima decisao critica.";
  const caption = seedContent?.legenda ?? buildCaption(trend, title, cta, hashtags);

  return {
    topic: trend.topic,
    title,
    objective,
    caption,
    hashtags,
    cta,
    slides: buildSlides(trend, seedContent)
  };
}

function buildSlides(trend: TrendSignal, seedContent?: ErizonContentOutput | null) {
  const centralIdea = seedContent?.ideia_central ?? trend.angle;
  const proofLine = seedContent?.hipotese_performance ?? "Quando o post expõe perda invisivel, a tendencia e aumentar stop, share e save.";

  const slideBodies = [
    seedContent?.gancho ?? trend.hook,
    `O problema nao e falta de esforco. E operar sem leitura de ${trend.topic.toLowerCase()}.`,
    `Quando isso passa despercebido, a operacao perde margem, timing e confianca na decisao.`,
    centralIdea,
    `Sinal de prova: ${proofLine}`,
    `A resposta certa nao e mais volume. E mais diagnostico, criterio e leitura operacional.`,
    seedContent?.cta ?? "Salve, compartilhe com o time e reposicione a discussao na proxima reuniao."
  ];

  return slideBodies.map((body, index) => ({
    index: index + 1,
    role: SLIDE_ROLES[index],
    headline: buildSlideHeadline(index, trend, body),
    supportingText: body,
    accentColor: SLIDE_COLORS[index],
    emoji: SLIDE_EMOJIS[index],
    visualDirection: buildVisualDirection(index, trend)
  }));
}

function buildSlideHeadline(index: number, trend: TrendSignal, body: string) {
  if (index === 0) return truncate(trend.hook, 72);
  if (index === 1) return "O problema que quase ninguem nomeia";
  if (index === 2) return "O custo invisivel";
  if (index === 3) return "A leitura que muda o jogo";
  if (index === 4) return "Prova e sinal de mercado";
  if (index === 5) return "O movimento inteligente";
  return truncate(body, 60);
}

function buildVisualDirection(index: number, trend: TrendSignal) {
  const directions = [
    "tipografia gigante com numero ou palavra dominante e glow de contraste",
    "bloco de alerta com faixa diagonal e microcopy em mono",
    "grafico de queda ou perda com area escura e acento neon",
    "layout editorial com insight central e linhas tecnicas",
    "card de prova com dado em destaque e bordas UI",
    "composicao split entre diagnostico e resposta",
    "cta premium com espacamento forte e chamada para salvar"
  ];

  return `${directions[index]}; tema-base: ${trend.topic.toLowerCase()}`;
}

function buildCaption(
  trend: TrendSignal,
  title: string,
  cta: string,
  hashtags: string[]
) {
  return [
    title,
    "",
    `Tema: ${trend.topic}.`,
    trend.angle,
    "",
    "Esse carrossel foi pensado para gerar stop, save e compartilhamento, nao so like.",
    cta,
    "",
    hashtags.map((tag) => `#${tag}`).join(" ")
  ].join("\n");
}

function buildDefaultHashtags(trend: TrendSignal) {
  return [
    "erizon",
    "decisao",
    "operacao",
    "lucro",
    "marketinginteligente",
    trend.recommendedPillar,
    ...trend.keywords.slice(0, 4)
  ];
}

function normalizeHashtags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.replace(/^#+/, "").replace(/\s+/g, "").trim())
        .filter(Boolean)
    )
  ).slice(0, 10);
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

