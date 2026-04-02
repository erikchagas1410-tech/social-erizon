import { NextRequest, NextResponse } from "next/server";

import { generateErizonContent } from "@/lib/groq";
import { persistGeneratedContent } from "@/lib/content-workflow";
import { ContentFormat, ContentPillar } from "@/types/content";

const TAB_MAP: Record<string, { topic: string; pillar: ContentPillar; format: ContentFormat }> = {
  diagnostics: {
    topic: "O erro silencioso que destrói campanhas antes de aparecer nos relatórios.",
    pillar: "autoridade",
    format: "post_estatico"
  },
  erizon: {
    topic: "Como a Erizon detecta onde o dinheiro está vazando antes do prejuízo aparecer.",
    pillar: "conversao_indireta",
    format: "carrossel"
  },
  authority: {
    topic: "A tese que gestores de tráfego experientes nunca falam em público.",
    pillar: "autoridade",
    format: "provocacao"
  },
  "anti-myth": {
    topic: "Por que mais verba não resolve leitura errada do negócio.",
    pillar: "educacao",
    format: "comparacao"
  },
  "social-proof": {
    topic: "O que mudou depois de ter visibilidade real sobre cada real investido.",
    pillar: "prova",
    format: "carrossel"
  },
  "tweet-style": {
    topic: "Verdade inconveniente sobre ROAS que ninguém quer admitir.",
    pillar: "conexao",
    format: "frase_impacto"
  },
  "deep-dive": {
    topic: "Anatomia de uma campanha que parece saudável mas está destruindo margem.",
    pillar: "educacao",
    format: "mini_aula"
  },
  specialists: {
    topic: "O que diferencia um gestor que opera no escuro de um que toma decisões com clareza.",
    pillar: "desejo",
    format: "analise"
  }
};

export async function POST(req: NextRequest) {
  const { postType, editorialTab } = await req.json();

  const brief = TAB_MAP[editorialTab] ?? TAB_MAP["diagnostics"];

  try {
    const content = await generateErizonContent({
      topic: brief.topic,
      pillar: brief.pillar,
      format: brief.format,
      channels: ["instagram"]
    });

    await persistGeneratedContent({
      ...content,
      canais_publicacao: ["instagram"]
    });

    return NextResponse.json({ ok: true, postType });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao gerar conteúdo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
