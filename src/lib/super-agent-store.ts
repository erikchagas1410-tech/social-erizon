import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { SuperAgentOutput, SuperAgentRunSummary } from "@/types/super-agent";

type SuperAgentRunRow = {
  id: string;
  topic: string;
  objective: string | null;
  payload: SuperAgentOutput;
  created_at: string;
};

export async function saveSuperAgentRun(params: {
  topic: string;
  objective?: string;
  payload: SuperAgentOutput;
}) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from("super_agent_runs")
      .insert({
        topic: params.topic,
        objective: params.objective ?? null,
        payload: params.payload,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (result.error) {
      throw result.error;
    }

    return result.data?.id ?? null;
  } catch {
    return null;
  }
}

export async function listRecentSuperAgentRuns(limit = 8): Promise<SuperAgentRunSummary[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from("super_agent_runs")
      .select("id, topic, objective, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (result.error) {
      throw result.error;
    }

    return ((result.data ?? []) as SuperAgentRunRow[]).map((row) => ({
      id: row.id,
      topic: row.topic,
      objective: row.objective,
      createdAt: row.created_at,
      selectedTrendTopic: row.payload.selectedTrend?.topic ?? null,
      selectedTrendScore: row.payload.selectedTrend?.viralScore ?? null,
      variantCount: row.payload.viralVariants.length
    }));
  } catch {
    return [];
  }
}
