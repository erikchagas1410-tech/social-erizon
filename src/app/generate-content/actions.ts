"use server";

import { revalidatePath } from "next/cache";

import { generateErizonContent } from "@/lib/groq";
import { serializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { ContentFormat, ContentPillar, ErizonContentOutput } from "@/types/content";

export type GenerateContentActionState = {
  error: string | null;
  success: string | null;
  result: ErizonContentOutput | null;
  savedPostId: string | null;
};

export const initialGenerateContentState: GenerateContentActionState = {
  error: null,
  success: null,
  result: null,
  savedPostId: null
};

export async function generateContentAction(
  _previousState: GenerateContentActionState,
  formData: FormData
): Promise<GenerateContentActionState> {
  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase nao configurado para salvar a peca gerada.",
      success: null,
      result: null,
      savedPostId: null
    };
  }

  const topic = String(formData.get("topic") ?? "").trim();
  const objective = String(formData.get("objective") ?? "").trim();
  const pillar = String(formData.get("pillar") ?? "").trim() as ContentPillar | "";
  const format = String(formData.get("format") ?? "").trim() as ContentFormat | "";

  if (!topic) {
    return {
      error: "Informe um tema ou tensao central para gerar o conteudo.",
      success: null,
      result: null,
      savedPostId: null
    };
  }

  try {
    const content = await generateErizonContent({
      topic,
      objective,
      pillar,
      format
    });

    const supabase = getSupabaseClient();
    const serializedContent = serializeContentPayload(content);

    const insertPostResult = await supabase
      .from("posts")
      .insert({
        title: content.gancho,
        caption: serializedContent,
        format: mapContentFormatToPostFormat(content.formato),
        status: "pending",
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (insertPostResult.error || !insertPostResult.data) {
      throw new Error(insertPostResult.error?.message ?? "Falha ao salvar post no Supabase.");
    }

    const postId = insertPostResult.data.id;

    const activityResult = await supabase.from("post_activities").insert([
      {
        post_id: postId,
        type: "generation",
        message: `Conteudo gerado pela IA para aprovacao: ${content.gancho}`
      },
      {
        post_id: postId,
        type: "approval",
        message: "Post enviado automaticamente para a fila de aprovacao."
      }
    ]);

    if (activityResult.error) {
      throw new Error(activityResult.error.message);
    }

    revalidatePath("/command-center");
    revalidatePath("/approval");
    revalidatePath("/generate-content");

    return {
      error: null,
      success: "Conteudo gerado e enviado para a fila de aprovacao.",
      result: content,
      savedPostId: postId
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Falha inesperada na geracao do conteudo.",
      success: null,
      result: null,
      savedPostId: null
    };
  }
}

function mapContentFormatToPostFormat(format: ContentFormat) {
  switch (format) {
    case "carrossel":
    case "comparacao":
    case "checklist":
    case "mini_aula":
      return "carousel";
    case "post_estatico":
    case "frase_impacto":
    case "analise":
    case "provocacao":
    case "insight_estrategico":
    case "post_de_decisao":
      return "feed";
    default:
      return "feed";
  }
}
