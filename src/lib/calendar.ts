import { deserializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { PostFormat, PostStatus } from "@/types/dashboard";

export type CalendarPost = {
  id: string;
  title: string;
  format: PostFormat;
  status: PostStatus;
  scheduledFor: string;
  publishedAt: string | null;
  captionPreview: string;
  ideaCentral: string | null;
};

type CalendarRow = {
  id: string;
  title: string;
  caption: string | null;
  format: PostFormat;
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
};

export async function getCalendarPosts(
  monthStartIso: string,
  monthEndIso: string
): Promise<CalendarPost[]> {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase environment variables are missing. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = getSupabaseClient();
  const result = await supabase
    .from("posts")
    .select("id, title, caption, format, status, scheduled_for, published_at")
    .not("scheduled_for", "is", null)
    .gte("scheduled_for", monthStartIso)
    .lte("scheduled_for", monthEndIso)
    .order("scheduled_for", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data as CalendarRow[]).map((row) => {
    const content = deserializeContentPayload(row.caption);

    return {
      id: row.id,
      title: row.title,
      format: row.format,
      status: row.status,
      scheduledFor: row.scheduled_for ?? new Date().toISOString(),
      publishedAt: row.published_at,
      captionPreview: content?.legenda ?? row.caption ?? "Sem legenda salva.",
      ideaCentral: content?.ideia_central ?? null
    };
  });
}

export function getMonthBounds(year: number, monthIndex: number) {
  const monthStart = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

  return {
    monthStart,
    monthEnd
  };
}
