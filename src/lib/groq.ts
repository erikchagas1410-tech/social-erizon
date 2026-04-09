import { erizonBrand } from "@/lib/erizon-brand";
import { deserializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  ContentFormat,
  ContentPillar,
  ErizonContentOutput,
  PublicationChannel
} from "@/types/content";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

type GenerateContentParams = {
  topic: string;
  objective?: string;
  pillar?: ContentPillar | "";
  format?: ContentFormat | "";
  channels?: PublicationChannel[];
};

type CreativeHistory = {
  lastLayout: string | null;
  lastApproach: string | null;
  recentLayouts: string[];
  recentApproaches: string[];
  recentVisualElements: string[];
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

export async function generateErizonContent(
  params: GenerateContentParams
): Promise<ErizonContentOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY nao configurada.");
  }

  const creativeHistory = await getCreativeHistory();

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
      temperature: 0.7,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: buildSystemPrompt()
        },
        {
          role: "user",
          content: buildUserPrompt(params, creativeHistory)
        }
      ]
    }),
    cache: "no-store"
  });

  const payload = (await response.json()) as GroqResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Falha ao chamar a API da Groq.");
  }

  const rawContent = payload.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("A Groq nao retornou conteudo.");
  }

  return validateErizonContent(JSON.parse(rawContent));
}

function buildSystemPrompt() {
  return [
    "Voce e o ERIZON SOCIAL AI, responsavel por criar conteudo para a Erizon.",
    "A Erizon e uma inteligencia operacional que fala sobre decisao e dinheiro, nao sobre marketing generico.",
    `Tom de voz: ${erizonBrand.tone}.`,
    `Direcao visual: ${erizonBrand.style}.`,
    `Narrativa central: ${erizonBrand.narrativeCore.join(", ")}.`,
    `Regras absolutas: ${erizonBrand.rules.join(" ")}`,
    "Toda resposta deve ser um JSON valido sem markdown, sem explicacao externa e sem campos adicionais.",
    "Nunca gere conteudo generico, linguagem de iniciante, hype vazio ou estetica comum.",
    "Cada campo precisa ser forte, util e parecer parte de uma marca que domina o jogo."
  ].join(" ");
}

function buildUserPrompt(
  params: GenerateContentParams,
  creativeHistory: CreativeHistory
) {
  const channels = params.channels?.length
    ? params.channels.join(", ")
    : "instagram, linkedin";

  return [
    "Crie uma peca de conteudo para Instagram da Erizon em JSON valido.",
    `Tema principal: ${params.topic}.`,
    params.objective ? `Objetivo do conteudo: ${params.objective}.` : "",
    params.pillar ? `Pilar obrigatorio: ${params.pillar}.` : "",
    params.format ? `Formato obrigatorio: ${params.format}.` : "",
    `Canais previstos: ${channels}.`,
    `Guia de formatos Instagram: feed retrato ${erizonBrand.platformGuidelines.instagram.recommendedFeedPortrait}, quadrado ${erizonBrand.platformGuidelines.instagram.square}, paisagem ${erizonBrand.platformGuidelines.instagram.landscape}, stories/reels ${erizonBrand.platformGuidelines.instagram.storiesAndReels}.`,
    `Guia de formatos LinkedIn: quadrado ${erizonBrand.platformGuidelines.linkedin.postSquare}, retrato ${erizonBrand.platformGuidelines.linkedin.postPortrait}, paisagem/link ${erizonBrand.platformGuidelines.linkedin.linkLandscape}.`,
    "Use exatamente estes campos:",
    "titulo_interno, objetivo, pilar, formato, ideia_central, angulo, gancho, estrutura_criativo, texto_criativo, legenda, cta, prompt_imagem, alt_text, hashtags, sugestao_horario, justificativa, hipotese_performance.",
    "hashtags deve ser array de strings sem #, entre 6 e 12 itens, misturando marca, categoria, dor, beneficio e intencao.",
    "sugestao_horario deve ser HH:MM.",
    "texto_criativo, legenda e prompt_imagem precisam estar prontos para uso.",
    "legenda deve vir pronta para postagem, com quebra de linhas, desenvolvimento forte, CTA final e hashtags estrategicas no final.",
    "Para Instagram, a legenda pode ser mais emocional e com 6 a 10 hashtags. Para LinkedIn, mais densa, mais intelectual e com 3 a 5 hashtags.",
    "prompt_imagem deve instruir um layout premium da Erizon com fundo escuro, grid tecnico, glow neon roxo/magenta/ciano, tipografia principal pesada estilo Montserrat, apoio em sans limpa e microcopy em mono.",
    "Torne o agente de imagem mais inteligente e anti-repeticao.",
    "A cada nova imagem, escolha aleatoriamente 1 layout entre estas opcoes, sem repetir o ultimo usado: 1) texto central grande + fundo minimalista, 2) texto alinhado a esquerda + elemento grafico a direita, 3) texto pequeno + destaque visual forte, 4) layout dividido em 2 blocos 50/50, 5) estilo print de sistema com UI fake/dashboard/app, 6) poster impactante com tipografia gigante, 7) texto rotacionado ou diagonal, 8) composicao caotica com elementos sobrepostos, 9) foco em numero grande, 10) anuncio premium clean com espacamento forte.",
    "Nunca repetir o mesmo layout 2 vezes seguidas. Sempre variar posicao, tamanho e hierarquia dos elementos.",
    "Use elementos visuais variados, escolhendo combinacoes diferentes: grids, linhas finas, barras de progresso, graficos fake, caixas UI, cards, dashboards, sombras fortes, blur, formas geometricas, glitch, efeitos de luz, textura noise ou grain, recortes assimetricos.",
    "Evite repetir o mesmo tipo de elemento em imagens consecutivas.",
    "Cada imagem deve assumir exatamente 1 abordagem principal e nunca repetir a abordagem anterior: alerta, curiosidade, autoridade, confronto, story, prova, bastidor, erro comum, dica pratica, quebra de crenca.",
    "Crie imagens que parem o scroll. Evite qualquer aparencia generica, segura ou de banco de templates.",
    "Priorize impacto visual, contraste, surpresa, hierarquia clara, elementos inesperados e composicao fora do padrao.",
    "Se a imagem parecer comum, refaca internamente com uma abordagem mais ousada antes de responder.",
    "A imagem precisa parecer uma peca de marca premium, nao um post comum.",
    "estrutura_criativo deve descrever claramente a composicao visual, hierarquia, callouts, stats, o formato ideal do canvas, o layout escolhido, a abordagem escolhida e os principais elementos visuais usados.",
    creativeHistory.lastLayout
      ? `O ultimo layout usado foi: ${creativeHistory.lastLayout}. Nao repita esse layout.`
      : "",
    creativeHistory.lastApproach
      ? `A ultima abordagem usada foi: ${creativeHistory.lastApproach}. Nao repita essa abordagem.`
      : "",
    creativeHistory.recentLayouts.length
      ? `Analise os ultimos 5 layouts usados e crie algo visualmente diferente de todos eles: ${creativeHistory.recentLayouts.join(" | ")}.`
      : "",
    creativeHistory.recentApproaches.length
      ? `Historico recente de abordagens: ${creativeHistory.recentApproaches.join(" | ")}. Gere uma abordagem nitidamente diferente da ultima e, se possivel, distante das demais.`
      : "",
    creativeHistory.recentVisualElements.length
      ? `Elementos visuais recentemente usados: ${creativeHistory.recentVisualElements.join(", ")}. Evite repetir a mesma combinacao dominante agora.`
      : "",
    "A ideia central deve falar de dinheiro, decisao, risco, escala, lucro ou perda evitada.",
    "Se nao houver pilar ou formato obrigatorio, escolha a melhor opcao para performance e consistencia de marca.",
    "No campo prompt_imagem, escreva instrucoes acionaveis, especificas e visuais, como se estivesse dirigindo um diretor de arte senior.",
    "No campo estrutura_criativo, deixe explicito em uma frase curta o layout selecionado, a abordagem selecionada e por que essa combinacao difere do historico recente."
  ]
    .filter(Boolean)
    .join(" ");
}

async function getCreativeHistory(): Promise<CreativeHistory> {
  if (!hasSupabaseEnv()) {
    return {
      lastLayout: null,
      lastApproach: null,
      recentLayouts: [],
      recentApproaches: [],
      recentVisualElements: []
    };
  }

  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from("posts")
      .select("caption, created_at")
      .not("caption", "is", null)
      .order("created_at", { ascending: false })
      .limit(5);

    if (result.error) {
      throw result.error;
    }

    const entries = (result.data ?? [])
      .map((row) => deserializeContentPayload(row.caption))
      .filter((item): item is ErizonContentOutput => Boolean(item));

    const recentLayouts = entries
      .map((item) => extractCreativeField(item.estrutura_criativo, item.prompt_imagem, LAYOUT_KEYWORDS))
      .filter((item): item is string => Boolean(item));
    const recentApproaches = entries
      .map((item) => extractCreativeField(item.estrutura_criativo, item.prompt_imagem, APPROACH_KEYWORDS))
      .filter((item): item is string => Boolean(item));
    const recentVisualElements = Array.from(
      new Set(
        entries.flatMap((item) =>
          extractVisualElements(`${item.estrutura_criativo} ${item.prompt_imagem}`)
        )
      )
    ).slice(0, 12);

    return {
      lastLayout: recentLayouts[0] ?? null,
      lastApproach: recentApproaches[0] ?? null,
      recentLayouts: recentLayouts.slice(0, 5),
      recentApproaches: recentApproaches.slice(0, 5),
      recentVisualElements
    };
  } catch {
    return {
      lastLayout: null,
      lastApproach: null,
      recentLayouts: [],
      recentApproaches: [],
      recentVisualElements: []
    };
  }
}

const LAYOUT_KEYWORDS = [
  "texto central grande + fundo minimalista",
  "texto alinhado a esquerda + elemento grafico a direita",
  "texto pequeno + destaque visual forte",
  "layout dividido em 2 blocos",
  "print de sistema",
  "poster impactante",
  "texto rotacionado",
  "texto diagonal",
  "composicao caotica",
  "foco em numero grande",
  "anuncio premium"
] as const;

const APPROACH_KEYWORDS = [
  "alerta",
  "curiosidade",
  "autoridade",
  "confronto",
  "story",
  "prova",
  "bastidor",
  "erro comum",
  "dica pratica",
  "quebra de crenca"
] as const;

const VISUAL_ELEMENT_KEYWORDS = [
  "grid",
  "grids",
  "linhas finas",
  "barra de progresso",
  "barras de progresso",
  "grafico fake",
  "graficos fake",
  "caixas ui",
  "cards",
  "dashboard",
  "dashboards",
  "sombras fortes",
  "blur",
  "formas geometricas",
  "quadrado",
  "linha",
  "glitch",
  "efeitos de luz",
  "noise",
  "grain",
  "recortes assimetricos"
] as const;

function extractCreativeField(
  structure: string,
  prompt: string,
  candidates: readonly string[]
) {
  const base = `${structure} ${prompt}`.toLowerCase();

  for (const candidate of candidates) {
    if (base.includes(candidate)) {
      return candidate;
    }
  }

  const explicitMatch = structure.match(
    /(layout|abordagem)\s*[:=-]\s*([^.;|\n]+)/i
  );

  return explicitMatch?.[2]?.trim() ?? null;
}

function extractVisualElements(text: string) {
  const base = text.toLowerCase();

  return VISUAL_ELEMENT_KEYWORDS.filter((candidate) => base.includes(candidate));
}

function validateErizonContent(value: unknown): ErizonContentOutput {
  if (!value || typeof value !== "object") {
    throw new Error("A IA retornou um payload invalido.");
  }

  const record = value as Record<string, unknown>;
  const requiredStringFields: Array<keyof Omit<ErizonContentOutput, "hashtags">> = [
    "titulo_interno",
    "objetivo",
    "pilar",
    "formato",
    "ideia_central",
    "angulo",
    "gancho",
    "estrutura_criativo",
    "texto_criativo",
    "legenda",
    "cta",
    "prompt_imagem",
    "alt_text",
    "sugestao_horario",
    "justificativa",
    "hipotese_performance"
  ];

  for (const field of requiredStringFields) {
    if (typeof record[field] !== "string" || !String(record[field]).trim()) {
      throw new Error(`Campo obrigatorio ausente ou invalido: ${field}.`);
    }
  }

  if (!Array.isArray(record.hashtags) || record.hashtags.some((item) => typeof item !== "string")) {
    throw new Error("Campo hashtags invalido.");
  }

  return {
    titulo_interno: String(record.titulo_interno),
    objetivo: String(record.objetivo),
    pilar: validatePillar(record.pilar),
    formato: validateFormat(record.formato),
    ideia_central: String(record.ideia_central),
    angulo: String(record.angulo),
    gancho: String(record.gancho),
    estrutura_criativo: String(record.estrutura_criativo),
    texto_criativo: String(record.texto_criativo),
    legenda: String(record.legenda),
    cta: String(record.cta),
    prompt_imagem: String(record.prompt_imagem),
    alt_text: String(record.alt_text),
    hashtags: record.hashtags.map((item) => String(item)),
    sugestao_horario: String(record.sugestao_horario),
    justificativa: String(record.justificativa),
    hipotese_performance: String(record.hipotese_performance)
  };
}

function validatePillar(value: unknown): ContentPillar {
  const pillars: ContentPillar[] = [
    "autoridade",
    "educacao",
    "desejo",
    "conexao",
    "prova",
    "conversao_indireta"
  ];

  if (typeof value !== "string" || !pillars.includes(value as ContentPillar)) {
    throw new Error("Pilar retornado pela IA e invalido.");
  }

  return value as ContentPillar;
}

function validateFormat(value: unknown): ContentFormat {
  const formats: ContentFormat[] = [
    "carrossel",
    "post_estatico",
    "frase_impacto",
    "comparacao",
    "analise",
    "checklist",
    "mini_aula",
    "provocacao",
    "insight_estrategico",
    "post_de_decisao"
  ];

  if (typeof value !== "string" || !formats.includes(value as ContentFormat)) {
    throw new Error("Formato retornado pela IA e invalido.");
  }

  return value as ContentFormat;
}
