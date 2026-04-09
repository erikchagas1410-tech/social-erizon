import { ContentFormat, ContentPillar } from "@/types/content";
import { CampaignPlan, TrendSignal, ViralVariant } from "@/types/super-agent";

export function buildCampaignPlan(params: {
  trend: TrendSignal;
  variants: ViralVariant[];
}): CampaignPlan {
  const lead = params.variants[0];
  const proof = params.variants[1] ?? params.variants[0];
  const conversion = params.variants[2] ?? params.variants[0];

  return {
    name: `Campanha | ${params.trend.topic}`,
    thesis: `Reposicionar ${params.trend.topic.toLowerCase()} como uma dor operacional que exige decisao, nao intuicao.`,
    audienceIntent: "Levar o publico de consciencia de problema ate desejo por clareza operacional.",
    steps: [
      buildStep(1, {
        title: "Abrir a ferida",
        objective: "Parar o scroll e nomear a tensao com contraste alto.",
        format: "post_de_decisao",
        pillar: "conexao",
        hook: lead.hook,
        angle: "Expor a dor e mostrar que ela ja esta custando caro.",
        recommendedDayOffset: 0
      }),
      buildStep(2, {
        title: "Mostrar a prova",
        objective: "Trazer dado, diagnostico e leitura superior do problema.",
        format: proof.content.formato,
        pillar: "autoridade",
        hook: proof.hook,
        angle: proof.angle,
        recommendedDayOffset: 2
      }),
      buildStep(3, {
        title: "Virar desejo em movimento",
        objective: "Fechar com reposicionamento, criterio e conversao indireta.",
        format: normalizeFormat(conversion.content.formato),
        pillar: "conversao_indireta",
        hook: conversion.hook,
        angle: "Mostrar o novo padrao de decisao e o custo de continuar atrasado.",
        recommendedDayOffset: 4
      })
    ]
  };
}

function buildStep(order: number, step: Omit<CampaignPlan["steps"][number], "order">) {
  return {
    order,
    ...step
  };
}

function normalizeFormat(format: ContentFormat): ContentFormat {
  if (format === "carrossel" || format === "analise" || format === "comparacao") {
    return format;
  }

  return "post_de_decisao";
}
