import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("post_activities").insert({
    type: "error",
    message: `Post ${id} rejeitado e removido da fila operacional.`
  });

  return NextResponse.json({ ok: true });
}
