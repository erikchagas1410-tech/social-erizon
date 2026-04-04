import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { GrowthSession, OnboardingData, GrowthReport } from "@/types/growth-analyst";

/*
  Required Supabase table:

  create table growth_sessions (
    id uuid default gen_random_uuid() primary key,
    company_name text not null,
    niche text not null,
    stage text,
    growth_score int,
    onboarding_data jsonb not null,
    report jsonb not null,
    created_at timestamptz default now()
  );
*/

export async function saveGrowthSession(
  data: OnboardingData,
  report: GrowthReport
): Promise<void> {
  if (!hasSupabaseEnv()) return;
  try {
    const db = getSupabaseClient();
    await db.from("growth_sessions").insert({
      company_name: data.companyName,
      niche: data.niche,
      stage: data.stage,
      growth_score: report.growthScore,
      onboarding_data: data,
      report
    });
  } catch {
    // silent — history is non-blocking
  }
}

export async function listGrowthSessions(): Promise<GrowthSession[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const db = getSupabaseClient();
    const { data, error } = await db
      .from("growth_sessions")
      .select("id, company_name, niche, stage, growth_score, onboarding_data, report, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return [];
    return (data ?? []) as GrowthSession[];
  } catch {
    return [];
  }
}
