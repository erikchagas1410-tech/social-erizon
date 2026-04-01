import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { ApprovalQueueItem, toApprovalQueueItem } from "@/lib/content-persistence";

type ApprovalRow = {
  id: string;
  title: string;
  caption: string | null;
  format: string;
  status: string;
  created_at: string;
};

export async function getApprovalQueue(
  status: "pending" | "approved" = "pending"
): Promise<ApprovalQueueItem[]> {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase environment variables are missing. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = getSupabaseClient();

  const result = await supabase
    .from("posts")
    .select("id, title, caption, format, status, created_at")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(12);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data as ApprovalRow[]).map(toApprovalQueueItem);
}
