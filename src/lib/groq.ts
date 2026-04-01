import { erizonBrand } from "@/lib/erizon-brand";
import { ContentFormat, ContentPillar, ErizonContentOutput } from "@/types/content";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

type GenerateContentParams = {
  topic: string;
  objective?: string;
  pillar?: ContentPillar | "";
  format?: ContentFormat | "";
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
          content: buildUserPrompt(params)
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

function buildUserPrompt(params: GenerateContentParams) {
  return [
    "Crie uma peca de conteudo para Instagram da Erizon em JSON valido.",
    `Tema principal: ${params.topic}.`,
    params.objective ? `Objetivo do conteudo: ${params.objective}.` : "",
    params.pillar ? `Pilar obrigatorio: ${params.pillar}.` : "",
    params.format ? `Formato obrigatorio: ${params.format}.` : "",
    "Use exatamente estes campos:",
    "titulo_interno, objetivo, pilar, formato, ideia_central, angulo, gancho, estrutura_criativo, texto_criativo, legenda, cta, prompt_imagem, alt_text, hashtags, sugestao_horario, justificativa, hipotese_performance.",
    "hashtags deve ser array de strings sem #.",
    "sugestao_horario deve ser HH:MM.",
    "texto_criativo, legenda e prompt_imagem precisam estar prontos para uso.",
    "A ideia central deve falar de dinheiro, decisao, risco, escala, lucro ou perda evitada.",
    "Se nao houver pilar ou formato obrigatorio, escolha a melhor opcao para performance e consistencia de marca."
  ]
    .filter(Boolean)
    .join(" ");
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
