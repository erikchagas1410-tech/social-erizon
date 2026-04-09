"use server";

import { revalidatePath } from "next/cache";

import { persistGeneratedContent } from "@/lib/content-workflow";
import { generateSuperAgentOutput } from "@/lib/super-agent";
import { saveSuperAgentRun } from "@/lib/super-agent-store";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { PublicationChannel } from "@/types/content";
import { SuperAgentOutput } from "@/types/super-agent";

export type SuperAgentActionState = {
  error: string | null;
  success: string | null;
  result: SuperAgentOutput | null;
  savedPostIds: string[];
  scheduledPostIds: string[];
  campaignPostIds: string[];
};

export const initialSuperAgentState: SuperAgentActionState = {
  error: null,
  success: null,
  result: null,
  savedPostIds: [],
  scheduledPostIds: [],
  campaignPostIds: []
};

export async function runSuperAgentAction(
  _previousState: SuperAgentActionState,
  formData: FormData
): Promise<SuperAgentActionState> {
  const topic = String(formData.get("topic") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  const shouldSave = String(formData.get("saveVariants") ?? "") === "on";
  const shouldSchedule = String(formData.get("scheduleVariants") ?? "") === "on";
  const shouldExecuteCampaign =
    String(formData.get("executeCampaign") ?? "") === "on";
  const channels = formData
    .getAll("channels")
    .map((item) => String(item))
    .filter((item): item is PublicationChannel => item === "instagram" || item === "linkedin");

  if (!topic) {
    return {
      error: "Informe um tema ou tensao central para o super agente.",
      success: null,
      result: null,
      savedPostIds: [],
      scheduledPostIds: [],
      campaignPostIds: []
    };
  }

  try {
    const result = await generateSuperAgentOutput({
      topic,
      objective,
      channels
    });
    await saveSuperAgentRun({
      topic,
      objective,
      payload: result
    });

    const savedPostIds: string[] = [];
    const scheduledPostIds: string[] = [];
    const campaignPostIds: string[] = [];

    if ((shouldSave || shouldExecuteCampaign) && result.viralVariants.length > 0) {
      if (!hasSupabaseEnv()) {
        throw new Error("Supabase nao configurado para salvar variantes do super agente.");
      }

      const supabase = getSupabaseClient();

      for (const [index, variant] of result.viralVariants.entries()) {
        const campaignStep = result.campaign?.steps[index] ?? null;
        const persisted = await persistGeneratedContent({
          ...variant.content,
          titulo_interno: campaignStep
            ? `${variant.content.titulo_interno} | ETAPA ${campaignStep.order}`
            : variant.content.titulo_interno,
          canais_publicacao:
            variant.content.canais_publicacao ?? variant.recommendedChannels
        });
        savedPostIds.push(persisted.postId);

        if (campaignStep) {
          campaignPostIds.push(persisted.postId);
        }

        if (shouldExecuteCampaign && campaignStep) {
          const scheduledFor = buildCampaignDateTime(
            campaignStep.recommendedDayOffset,
            variant.recommendedTime
          );
          const updateResult = await supabase
            .from("posts")
            .update({
              status: "scheduled",
              scheduled_for: scheduledFor,
              updated_at: new Date().toISOString()
            })
            .eq("id", persisted.postId);

          if (updateResult.error) {
            throw new Error(updateResult.error.message);
          }

          const activityResult = await supabase.from("post_activities").insert([
            {
              post_id: persisted.postId,
              type: "schedule",
              message: `Post agendado pelo super agente para campanha ${campaignStep.order} em ${campaignStep.recommendedDayOffset} dias, as ${variant.recommendedTime}.`
            },
            {
              post_id: persisted.postId,
              type: "generation",
              message: `Post vinculado a campanha do super agente: etapa ${campaignStep.order} - ${campaignStep.title}.`
            }
          ]);

          if (activityResult.error) {
            throw new Error(activityResult.error.message);
          }

          scheduledPostIds.push(persisted.postId);
          continue;
        }

        if (shouldSchedule) {
          const slot = result.weeklySchedule[index];

          if (slot) {
            const scheduledFor = buildScheduledDateTime(slot.day, slot.time);
            const updateResult = await supabase
              .from("posts")
              .update({
                status: "scheduled",
                scheduled_for: scheduledFor,
                updated_at: new Date().toISOString()
              })
              .eq("id", persisted.postId);

            if (updateResult.error) {
              throw new Error(updateResult.error.message);
            }

            const activityResult = await supabase.from("post_activities").insert({
              post_id: persisted.postId,
              type: "schedule",
              message: `Post agendado pelo super agente para ${slot.day} as ${slot.time}.`
            });

            if (activityResult.error) {
              throw new Error(activityResult.error.message);
            }

            scheduledPostIds.push(persisted.postId);
          }
        }
      }

      revalidatePath("/command-center");
      revalidatePath("/approval");
      revalidatePath("/generate-content");
      revalidatePath("/calendar");
    }

    return {
      error: null,
      success: shouldExecuteCampaign
        ? `Super agente executado, campanha criada com ${campaignPostIds.length} posts e ${scheduledPostIds.length} agendamentos encadeados.`
        : shouldSave
          ? shouldSchedule
            ? `Super agente executado, ${savedPostIds.length} variantes salvas e ${scheduledPostIds.length} ja agendadas.`
            : `Super agente executado e ${savedPostIds.length} variantes enviadas para aprovacao.`
          : "Super agente executado com sucesso.",
      result,
      savedPostIds,
      scheduledPostIds,
      campaignPostIds
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Falha inesperada ao executar o super agente.",
      success: null,
      result: null,
      savedPostIds: [],
      scheduledPostIds: [],
      campaignPostIds: []
    };
  }
}

const DAY_INDEX: Record<string, number> = {
  Domingo: 0,
  Segunda: 1,
  Terca: 2,
  Quarta: 3,
  Quinta: 4,
  Sexta: 5,
  Sabado: 6
};

function buildScheduledDateTime(day: string, time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number.parseInt(value, 10));
  const targetDay = DAY_INDEX[day] ?? 1;
  const now = new Date();
  const scheduled = new Date(now);
  const currentDay = scheduled.getDay();
  let offset = targetDay - currentDay;

  if (offset < 0) {
    offset += 7;
  }

  scheduled.setDate(scheduled.getDate() + offset);
  scheduled.setHours(hours || 12, minutes || 0, 0, 0);

  if (scheduled.getTime() <= now.getTime()) {
    scheduled.setDate(scheduled.getDate() + 7);
  }

  return scheduled.toISOString();
}

function buildCampaignDateTime(dayOffset: number, time: string) {
  const [hours, minutes] = time.split(":").map((value) => Number.parseInt(value, 10));
  const scheduled = new Date();
  scheduled.setDate(scheduled.getDate() + dayOffset);
  scheduled.setHours(hours || 12, minutes || 0, 0, 0);

  if (scheduled.getTime() <= Date.now()) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled.toISOString();
}
