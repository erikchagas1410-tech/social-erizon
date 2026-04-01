"use server";

import { revalidatePath } from "next/cache";

import { publishPostToChannel } from "@/lib/social-publish";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { PublicationChannel } from "@/types/content";

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
