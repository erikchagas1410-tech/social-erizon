"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

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
