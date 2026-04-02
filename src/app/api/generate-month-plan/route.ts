import { NextResponse } from "next/server";

import { generateErizonContent } from "@/lib/groq";
import { persistGeneratedContent } from "@/lib/content-workflow";
import { ContentFormat, ContentPillar } from "@/types/content";

const MONTHLY_BRIEFS: Array<{ topic: string; pillar: ContentPillar; format: ContentFormat }> = [
  { topic: "Campanhas que parecem saudáveis mas estão destruindo margem em silêncio.", pillar: "autoridade", format: "carrossel" },
  { topic: "A diferença entre ROAS de vaidade e lucro real no tráfego pago.", pillar: "educacao", format: "comparacao" },
  { topic: "Erros que fazem gestores escalar verba antes de validar a decisão certa.", pillar: "prova", format: "checklist" },
  { topic: "O que um gestor só percebe tarde demais quando a campanha já queimou caixa.", pillar: "conexao", format: "post_de_decisao" },
  { topic: "Por que mais tráfego não resolve leitura errada do negócio.", pillar: "autoridade", format: "provocacao" },
  { topic: "Sinais que indicam que a operação está reagindo tarde aos riscos de performance.", pillar: "desejo", format: "analise" },
  { topic: "A rotina de quem toma decisão com clareza versus quem opera no escuro.", pillar: "desejo", format: "comparacao" },
  { topic: "Por que a Erizon foi criada: mostrar onde o dinheiro está vazando antes do prejuízo.", pillar: "conversao_indireta", format: "carrossel" }
];

export async function POST() {
  let generated = 0;

  for (const brief of MONTHLY_BRIEFS) {
    try {
      const content = await generateErizonContent({
        topic: brief.topic,
        pillar: brief.pillar,
        format: brief.format,
        channels: ["instagram"]
      });
      await persistGeneratedContent({ ...content, canais_publicacao: ["instagram"] });
      generated++;
    } catch {
      // continue generating remaining posts
    }
  }

  return NextResponse.json({ generated });
}
