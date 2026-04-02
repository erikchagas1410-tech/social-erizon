"use server";

import { revalidatePath } from "next/cache";

import { uploadAssetForPublishing } from "@/lib/asset-upload";
import { persistGeneratedContent } from "@/lib/content-workflow";
import { generateErizonContent } from "@/lib/groq";
import { hasSupabaseEnv } from "@/lib/supabase";
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

    const content = await generateErizonContent({
      topic,
      objective,
      pillar,
      format,
      channels
    });
    const enrichedContent: ErizonContentOutput = {
      ...content,
      asset_url_publicacao: resolvedAssetUrl || null,
      canais_publicacao: channels
    };
    const persisted = await persistGeneratedContent(enrichedContent);

    revalidatePath("/command-center");
    revalidatePath("/approval");
    revalidatePath("/generate-content");

    return {
      error: null,
      success: "Conteudo gerado e enviado para a fila de aprovacao.",
      result: persisted.content,
      savedPostId: persisted.postId
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
