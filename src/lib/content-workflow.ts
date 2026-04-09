import { uploadGeneratedAsset } from "@/lib/asset-upload";
import { serializeContentPayload } from "@/lib/content-persistence";
import { buildCreativeMeta, generateErizonAsset } from "@/lib/branded-image";
import { getSupabaseClient } from "@/lib/supabase";
import { ContentFormat, ErizonContentOutput } from "@/types/content";

export async function persistGeneratedContent(content: ErizonContentOutput) {
  const supabase = getSupabaseClient();
  let enrichedContent = {
    ...content,
    creative_meta: content.creative_meta ?? buildCreativeMeta(content)
  };

  if (!enrichedContent.asset_url_publicacao) {
    try {
      const generatedAsset = await generateErizonAsset(enrichedContent);
      const uploadedAssetUrl = await uploadGeneratedAsset(
        generatedAsset,
        `${enrichedContent.titulo_interno || "erizon-post"}.png`
      );

      enrichedContent = {
        ...enrichedContent,
        asset_url_publicacao: uploadedAssetUrl
      };
    } catch (error) {
      console.error("Falha ao gerar/upload do asset da peca:", error);
    }
  }

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
    throw new Error(
      insertPostResult.error?.message ?? "Falha ao salvar post no Supabase."
    );
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

  return {
    postId,
    content: enrichedContent
  };
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
