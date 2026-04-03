import { NextRequest, NextResponse } from "next/server";

import { deserializeContentPayload } from "@/lib/content-persistence";
import { publishPostToChannel } from "@/lib/social-publish";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { PublicationChannel } from "@/types/content";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase nao configurado." }, { status: 500 });
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { data: duePosts, error } = await supabase
    .from("posts")
    .select("id, title, caption, status, scheduled_for")
    .eq("status", "scheduled")
    .lte("scheduled_for", now)
    .limit(10);

  if (error) {
    console.error("[cron/publish-scheduled] Erro ao buscar posts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ published: 0, message: "Nenhum post para publicar." });
  }

  const results: { id: string; status: "ok" | "error"; detail: string }[] = [];

  for (const post of duePosts) {
    const content = deserializeContentPayload(post.caption);

    if (!content) {
      results.push({ id: post.id, status: "error", detail: "Conteudo nao encontrado." });
      await supabase.from("post_activities").insert({
        post_id: post.id,
        type: "error",
        message: "Cron: conteudo estruturado ausente, publicacao ignorada."
      });
      continue;
    }

    const channels: PublicationChannel[] = (content.canais_publicacao ?? []).length > 0
      ? (content.canais_publicacao as PublicationChannel[])
      : ["instagram"];

    let publishedOnce = false;

    for (const channel of channels) {
      try {
        const result = await publishPostToChannel(post.id, channel);

        await supabase.from("post_activities").insert({
          post_id: post.id,
          type: "publish",
          message: `Published on ${result.channel}: ${result.externalId}`
        });

        publishedOnce = true;
        results.push({ id: post.id, status: "ok", detail: `${channel}: ${result.externalId}` });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        console.error(`[cron/publish-scheduled] Erro ao publicar post ${post.id} em ${channel}:`, msg);

        await supabase.from("post_activities").insert({
          post_id: post.id,
          type: "error",
          message: `Cron erro em ${channel}: ${msg}`
        });

        results.push({ id: post.id, status: "error", detail: `${channel}: ${msg}` });
      }
    }

    if (publishedOnce) {
      await supabase
        .from("posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);
    }
  }

  const publishedCount = results.filter((r) => r.status === "ok").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  console.log(`[cron/publish-scheduled] Publicados: ${publishedCount}, Erros: ${errorCount}`);

  return NextResponse.json({ published: publishedCount, errors: errorCount, results });
}
