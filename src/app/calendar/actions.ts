"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function reschedulePost(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");
  const scheduledFor = String(formData.get("scheduledFor") ?? "");

  if (!postId || !scheduledFor || !hasSupabaseEnv()) {
    return;
  }

  const scheduledIso = new Date(scheduledFor).toISOString();
  const supabase = getSupabaseClient();

  const updateResult = await supabase
    .from("posts")
    .update({
      status: "scheduled",
      scheduled_for: scheduledIso,
      updated_at: new Date().toISOString()
    })
    .eq("id", postId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert({
    post_id: postId,
    type: "schedule",
    message: `Post reagendado para ${scheduledIso}.`
  });

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/calendar");
  revalidatePath("/command-center");
}

export async function cancelSchedule(formData: FormData) {
  const postId = String(formData.get("postId") ?? "");

  if (!postId || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();
  const updateResult = await supabase
    .from("posts")
    .update({
      status: "approved",
      scheduled_for: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", postId);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert({
    post_id: postId,
    type: "schedule",
    message: "Agendamento removido e post devolvido para aprovacao."
  });

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/calendar");
  revalidatePath("/approval");
  revalidatePath("/command-center");
}
