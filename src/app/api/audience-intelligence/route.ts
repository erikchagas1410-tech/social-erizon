import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const BEST_TIMES: Record<string, string> = {
  trafego_pago: "18h — 20h",
  marketing: "19h — 21h",
  empreendedorismo: "07h — 09h"
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { niche = "trafego_pago", platform = "instagram", quickMode } = body;

  if (quickMode) {
    return NextResponse.json({
      bestTimeToday: BEST_TIMES[niche] ?? "18h — 20h"
    });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      insights: [
        { title: "Configure GROQ_API_KEY", body: "Adicione a variável de ambiente para ativar insights em tempo real." }
      ],
      bestTimeToday: BEST_TIMES[niche] ?? "18h — 20h"
    });
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Você é um especialista em marketing digital para o nicho de ${niche} no ${platform}. Retorne SOMENTE JSON válido com a chave "insights" contendo um array de 6 objetos com "title" e "body" (strings curtas em português), e "bestTimeToday" (string como "18h — 20h").`
          },
          {
            role: "user",
            content: `Gere 6 insights estratégicos de audiência para gestores de tráfego pago no Instagram. Foque em comportamento, melhores horários, formatos que engajam e padrões de consumo de conteúdo desse nicho.`
          }
        ]
      }),
      cache: "no-store"
    });

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

    if (data.error) {
      throw new Error(data.error.message);
    }

    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { insights?: unknown[]; bestTimeToday?: string };

    return NextResponse.json({
      insights: parsed.insights ?? [],
      bestTimeToday: parsed.bestTimeToday ?? BEST_TIMES[niche] ?? "18h — 20h"
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message, insights: [] }, { status: 500 });
  }
}
