import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function nextScheduleTime(): string {
  const now = new Date();
  const hour = now.getHours();
  const next = new Date(now);

  // Schedule at next optimal slot: 9h, 12h, 18h, 20h
  const slots = [9, 12, 18, 20];
  const nextSlot = slots.find((h) => h > hour);

  if (nextSlot) {
    next.setHours(nextSlot, 0, 0, 0);
  } else {
    // Tomorrow at 9h
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
  }

  return next.toISOString();
}

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const scheduledAt = nextScheduleTime();
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("posts")
    .update({
      status: "scheduled",
      scheduled_for: scheduledAt,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("post_activities").insert({
    post_id: id,
    type: "approval",
    message: "Post aprovado e agendado pela central operacional."
  });

  return NextResponse.json({ post: { scheduledAt } });
}
