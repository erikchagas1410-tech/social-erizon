"use server";

import { revalidatePath } from "next/cache";

import { persistGeneratedContent } from "@/lib/content-workflow";
import { generateErizonContent } from "@/lib/groq";
import { publishPostToChannel } from "@/lib/social-publish";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { ContentFormat, ContentPillar, PublicationChannel } from "@/types/content";

export async function approvePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");

  if (!postId || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();

  const updateResult = await supabase
    .from("posts")
    .update({
      status: "approved",
      updated_at: new Date().toISOString()
    })
    .eq("id", postId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert({
    post_id: postId,
    type: "approval",
    message: "Post aprovado pela central operacional."
  });

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/command-center");
}

export async function schedulePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const scheduledFor = String(formData.get("scheduledFor") ?? "");

  if (!postId || !scheduledFor || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();

  const updateResult = await supabase
    .from("posts")
    .update({
      status: "scheduled",
      scheduled_for: scheduledFor,
      updated_at: new Date().toISOString()
    })
    .eq("id", postId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert({
    post_id: postId,
    type: "schedule",
    message: "Post enviado para agendamento pela central."
  });

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/command-center");
}

export async function publishPost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const channel = String(formData.get("channel") ?? "") as PublicationChannel;

  if (!postId || !channel || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();

  try {
    const result = await publishPostToChannel(postId, channel);

    const updateResult = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", postId);

    if (updateResult.error) {
      throw new Error(updateResult.error.message);
    }

    const activityResult = await supabase.from("post_activities").insert({
      post_id: postId,
      type: "publish",
      message: `Published on ${result.channel}: ${result.externalId}`
    });

    if (activityResult.error) {
      throw new Error(activityResult.error.message);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha inesperada na publicacao.";

    await supabase.from("post_activities").insert({
      post_id: postId,
      type: "error",
      message: `Erro ao publicar: ${message}`
    });

    throw error;
  }

  revalidatePath("/command-center");
  revalidatePath("/approval");
}

export async function generateMonthPlan() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase nao configurado para receber o plano mensal."
    );
  }

  const briefs = getMonthlyBriefs();

  for (const brief of briefs) {
    const content = await generateErizonContent({
      topic: brief.topic,
      objective: brief.objective,
      pillar: brief.pillar,
      format: brief.format
    });

    await persistGeneratedContent({
      ...content,
      canais_publicacao: ["linkedin", "instagram"]
    });
  }

  revalidatePath("/command-center");
  revalidatePath("/approval");
  revalidatePath("/generate-content");
}

function getMonthlyBriefs(): Array<{
  topic: string;
  objective: string;
  pillar: ContentPillar;
  format: ContentFormat;
}> {
  return [
    {
      topic: "Campanhas que parecem saudaveis mas estao destruindo margem em silencio.",
      objective: "Abrir o mes com uma tese forte de autoridade sobre leitura financeira.",
      pillar: "autoridade",
      format: "carrossel"
    },
    {
      topic: "A diferenca entre ROAS de vaidade e lucro real no trafego pago.",
      objective: "Educar com clareza e gerar salvamento.",
      pillar: "educacao",
      format: "comparacao"
    },
    {
      topic: "Erros que fazem gestores escalar verba antes de validar a decisao certa.",
      objective: "Gerar consciencia e reforcar a necessidade da Erizon.",
      pillar: "prova",
      format: "checklist"
    },
    {
      topic: "O que um gestor so percebe tarde demais quando a campanha ja queimou caixa.",
      objective: "Criar identificacao imediata e compartilhamento.",
      pillar: "conexao",
      format: "post_de_decisao"
    },
    {
      topic: "Por que mais trafego nao resolve leitura errada do negocio.",
      objective: "Desconstruir uma crença comum do mercado.",
      pillar: "autoridade",
      format: "provocacao"
    },
    {
      topic: "Sinais que indicam que a operacao esta reagindo tarde aos riscos de performance.",
      objective: "Posicionar a Erizon como copiloto de decisao.",
      pillar: "desejo",
      format: "analise"
    },
    {
      topic: "A rotina de quem toma decisao com clareza versus a rotina de quem opera no escuro.",
      objective: "Gerar desejo pela categoria que a Erizon representa.",
      pillar: "desejo",
      format: "comparacao"
    },
    {
      topic: "Foi por isso que a Erizon foi criada: mostrar onde o dinheiro esta vazando antes do prejuizo aparecer.",
      objective: "Fechar o mes com narrativa de produto e conversao indireta.",
      pillar: "conversao_indireta",
      format: "carrossel"
    }
  ];
}
