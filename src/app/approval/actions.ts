"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function bulkApprovePosts(formData: FormData) {
  const postIds = getPostIds(formData);

  if (!postIds.length || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();

  const updateResult = await supabase
    .from("posts")
    .update({
      status: "approved",
      updated_at: new Date().toISOString()
    })
    .in("id", postIds);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert(
    postIds.map((postId) => ({
      post_id: postId,
      type: "approval",
      message: "Post aprovado em lote para seguir no fluxo operacional."
    }))
  );

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/approval");
  revalidatePath("/command-center");
}

export async function bulkSchedulePosts(formData: FormData) {
  const postIds = getPostIds(formData);
  const scheduledFor = String(formData.get("scheduledFor") ?? "");

  if (!postIds.length || !scheduledFor || !hasSupabaseEnv()) {
    return;
  }

  const supabase = getSupabaseClient();

  const updateResult = await supabase
    .from("posts")
    .update({
      status: "scheduled",
      scheduled_for: new Date(scheduledFor).toISOString(),
      updated_at: new Date().toISOString()
    })
    .in("id", postIds);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  const activityResult = await supabase.from("post_activities").insert(
    postIds.map((postId) => ({
      post_id: postId,
      type: "schedule",
      message: `Post agendado em lote para ${new Date(scheduledFor).toISOString()}.`
    }))
  );

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  revalidatePath("/approval");
  revalidatePath("/command-center");
}

function getPostIds(formData: FormData) {
  return formData
    .getAll("postIds")
    .map((value) => String(value))
    .filter(Boolean);
}
