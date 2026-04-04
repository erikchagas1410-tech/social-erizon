import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

export async function POST(req: NextRequest) {
  const body = (await req.json()) as GrowthOnboarding;

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada." }, { status: 500 });
  }

  const systemPrompt = `Você é um analista de growth sênior com 15 anos de experiência escalando empresas digitais no Brasil. Sua especialidade é identificar o exato ponto de alavancagem que vai destravar o crescimento de uma empresa com base no seu estágio, nicho e contexto.

Você pensa como um gestor de crescimento que já passou por centenas de negócios e sabe exatamente onde está o gargalo e qual movimento vai gerar o maior impacto com o menor esforço.

Seu tom é direto, preciso, sem floreios. Você entrega clareza operacional — não teoria genérica. Cada recomendação tem uma razão específica baseada nos dados fornecidos.

Retorne SOMENTE JSON válido seguindo exatamente o schema fornecido.`;

  const userPrompt = `Analise este negócio e retorne um relatório de growth detalhado:

DADOS DO NEGÓCIO:
- Nicho/setor: ${body.niche}
- Estágio atual: ${body.stage}
- Faturamento mensal: ${body.monthlyRevenue}
- Canal principal: ${body.mainChannel}
- Tamanho do time: ${body.teamSize}
- Maior desafio: ${body.biggestChallenge}
- Objetivo principal: ${body.mainGoal}
- Origem dos leads: ${body.leadSource}
- Proposta de valor única: ${body.uniqueValue}
- O que já tentou e não funcionou: ${body.whatFailed}

Retorne um JSON com esta estrutura exata:
{
  "diagnosis": {
    "title": "string — título do diagnóstico (ex: 'Negócio em plateau de autoridade')",
    "body": "string — parágrafo de 3-4 frases diagnósticando o estágio atual com precisão cirúrgica"
  },
  "opportunities": [
    {
      "title": "string — nome da oportunidade",
      "body": "string — descrição de 2-3 frases com contexto e razão",
      "priority": "alta | media | baixa"
    }
  ],
  "roadmap": {
    "days30": [
      { "action": "string — ação específica", "why": "string — razão em 1 frase" }
    ],
    "days60": [
      { "action": "string", "why": "string" }
    ],
    "days90": [
      { "action": "string", "why": "string" }
    ]
  },
  "contentStrategy": [
    {
      "channel": "string — nome do canal",
      "pillar": "string — pilar de conteúdo",
      "format": "string — formato recomendado",
      "frequency": "string — frequência ideal"
    }
  ],
  "kpis": [
    {
      "metric": "string — nome da métrica",
      "current": "string — estimativa do estado atual",
      "target": "string — meta a atingir",
      "timeframe": "string — prazo"
    }
  ],
  "nextMoves": [
    {
      "move": "string — próximo movimento concreto",
      "impact": "string — impacto esperado em 1 frase",
      "effort": "baixo | medio | alto"
    }
  ],
  "growthScore": number entre 0 e 100 indicando o potencial de crescimento com os recursos atuais,
  "bottleneck": "string — o único maior gargalo que está limitando o crescimento agora em 1 frase direta"
}

Gere 4 oportunidades, 3 ações por fase do roadmap, 2-3 canais na estratégia de conteúdo, 5 KPIs e 3 próximos movimentos. Seja específico ao contexto do negócio descrito, não genérico.`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.65,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }),
      cache: "no-store"
    });

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data.error) throw new Error(data.error.message);

    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const report = JSON.parse(raw) as GrowthReport;

    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
