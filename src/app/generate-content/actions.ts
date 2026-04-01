"use server";

import { revalidatePath } from "next/cache";

import { uploadAssetForPublishing } from "@/lib/asset-upload";
import { generateErizonContent } from "@/lib/groq";
import { serializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  ContentFormat,
  ContentPillar,
  ErizonContentOutput,
  PublicationChannel
} from "@/types/content";

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
  const assetUrl = String(formData.get("assetUrl") ?? "").trim();
  const assetFile = formData.get("assetFile");
  const channels = formData
    .getAll("channels")
    .map((item) => String(item))
    .filter((item): item is PublicationChannel => {
      return item === "linkedin" || item === "instagram";
    });

  if (!topic) {
    return {
      error: "Informe um tema ou tensao central para gerar o conteudo.",
      success: null,
      result: null,
      savedPostId: null
    };
  }

  try {
    let resolvedAssetUrl = assetUrl;

    if (assetFile instanceof File && assetFile.size > 0) {
      resolvedAssetUrl = await uploadAssetForPublishing(assetFile);
    }

    if (channels.includes("instagram") && !resolvedAssetUrl) {
      return {
        error:
          "Para publicar no Instagram, envie um arquivo de imagem ou informe uma URL publica do asset.",
        success: null,
        result: null,
        savedPostId: null
      };
    }

    const content = await generateErizonContent({
      topic,
      objective,
      pillar,
      format
    });
    const enrichedContent: ErizonContentOutput = {
      ...content,
      asset_url_publicacao: resolvedAssetUrl || null,
      canais_publicacao: channels
    };

    const supabase = getSupabaseClient();
    const serializedContent = serializeContentPayload(enrichedContent);

    const insertPostResult = await supabase
      .from("posts")
      .insert({
        title: enrichedContent.gancho,
        caption: serializedContent,
        format: mapContentFormatToPostFormat(enrichedContent.formato),
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
        message: `Conteudo gerado pela IA para aprovacao: ${enrichedContent.gancho}`
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
      result: enrichedContent,
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
