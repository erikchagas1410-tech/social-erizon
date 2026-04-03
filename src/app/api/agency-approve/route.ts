import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

// Horários fixos de publicação (hora local BRT)
const SLOTS = [9, 12, 18, 20];

// Brasília = UTC-3
const BRT_OFFSET_MS = -3 * 60 * 60 * 1000;

function utcToBrt(date: Date): Date {
  return new Date(date.getTime() + BRT_OFFSET_MS);
}

function brtToUtc(date: Date): Date {
  return new Date(date.getTime() - BRT_OFFSET_MS);
}

function slotKey(brtDate: Date, hour: number): string {
  const y = brtDate.getFullYear();
  const m = String(brtDate.getMonth() + 1).padStart(2, "0");
  const d = String(brtDate.getDate()).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  return `${y}-${m}-${d}-${h}`;
}

async function nextAvailableSlot(occupiedKeys: Set<string>): Promise<string> {
  const nowBrt = utcToBrt(new Date());

  for (let day = 0; day < 60; day++) {
    const candidate = new Date(nowBrt);
    candidate.setDate(candidate.getDate() + day);

    for (const hour of SLOTS) {
      candidate.setHours(hour, 0, 0, 0);

      // Pula horários que já passaram hoje
      if (candidate <= nowBrt) continue;

      const key = slotKey(candidate, hour);

      if (!occupiedKeys.has(key)) {
        // Converte o horário BRT escolhido de volta para UTC antes de salvar
        return brtToUtc(candidate).toISOString();
      }
    }
  }

  // Fallback improvável (60 dias cheios)
  return brtToUtc(nowBrt).toISOString();
}

export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const supabase = getSupabaseClient();

  // Busca todos os slots já ocupados por posts agendados
  const { data: scheduled } = await supabase
    .from("posts")
    .select("scheduled_for")
    .eq("status", "scheduled")
    .not("scheduled_for", "is", null);

  const occupiedKeys = new Set<string>();

  for (const post of scheduled ?? []) {
    const brt = utcToBrt(new Date(post.scheduled_for));
    occupiedKeys.add(slotKey(brt, brt.getHours()));
  }

  const scheduledAt = await nextAvailableSlot(occupiedKeys);

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

  // Formata horário BRT para exibir na activity
  const brtDisplay = utcToBrt(new Date(scheduledAt));
  const displayStr = brtDisplay.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  await supabase.from("post_activities").insert({
    post_id: id,
    type: "approval",
    message: `Post aprovado e agendado para ${displayStr} (horário de Brasília).`
  });

  return NextResponse.json({ post: { scheduledAt } });
}
