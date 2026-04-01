import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  ActivityItem,
  DashboardPayload,
  DashboardStats,
  PublicationChannel,
  PostStatus,
  ScheduledPost
} from "@/types/dashboard";

type PostRow = {
  id: string;
  title: string;
  format: ScheduledPost["format"];
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
};

type ActivityRow = {
  post_id?: string | null;
  id: string;
  type: ActivityItem["type"];
  message: string;
  created_at: string;
};

type MetricsRow = {
  pending_approval: number;
  scheduled: number;
  published: number;
  approval_rate: number;
};

export async function getDashboardPayload(): Promise<DashboardPayload> {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase environment variables are missing. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = getSupabaseClient();

  const [metricsResult, postsResult, activityResult] = await Promise.all([
    supabase.from("dashboard_metrics").select("*").single(),
    supabase
      .from("posts")
      .select("id, title, format, status, scheduled_for, published_at")
      .not("scheduled_for", "is", null)
      .order("scheduled_for", { ascending: true })
      .limit(6),
    supabase
      .from("post_activities")
      .select("id, type, message, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  if (metricsResult.error || postsResult.error || activityResult.error) {
    throw new Error(
      [
        metricsResult.error?.message,
        postsResult.error?.message,
        activityResult.error?.message
      ]
        .filter(Boolean)
        .join(" | ")
    );
  }

  const scheduledRows = postsResult.data ?? [];
  const publishChannelsByPost = await getPublishedChannelsByPost(
    scheduledRows.map((row) => row.id)
  );

  return {
    stats: mapMetrics(metricsResult.data),
    scheduledPosts: scheduledRows.map((row) =>
      mapPost(row, publishChannelsByPost[row.id] ?? [])
    ),
    activities: (activityResult.data ?? []).map(mapActivity),
    source: "supabase"
  };
}

function mapMetrics(row: MetricsRow | null): DashboardStats {
  return {
    pendingApproval: row?.pending_approval ?? 0,
    scheduled: row?.scheduled ?? 0,
    published: row?.published ?? 0,
    approvalRate: Number(row?.approval_rate ?? 0)
  };
}

function mapPost(
  row: PostRow,
  publishedChannels: PublicationChannel[]
): ScheduledPost {
  return {
    id: row.id,
    title: row.title,
    format: row.format,
    status: row.status,
    scheduledFor: row.scheduled_for ?? row.published_at ?? new Date().toISOString(),
    publishedChannels
  };
}

function mapActivity(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    createdAt: row.created_at
  };
}

async function getPublishedChannelsByPost(postIds: string[]) {
  if (!postIds.length) {
    return {} as Record<string, PublicationChannel[]>;
  }

  const supabase = getSupabaseClient();
  const result = await supabase
    .from("post_activities")
    .select("post_id, message")
    .eq("type", "publish")
    .in("post_id", postIds);

  if (result.error) {
    throw new Error(result.error.message);
  }

  const map: Record<string, PublicationChannel[]> = {};

  for (const row of result.data as Array<{ post_id: string; message: string }>) {
    const channel = parsePublishedChannel(row.message);

    if (!channel) {
      continue;
    }

    if (!map[row.post_id]) {
      map[row.post_id] = [];
    }

    if (!map[row.post_id].includes(channel)) {
      map[row.post_id].push(channel);
    }
  }

  return map;
}

function parsePublishedChannel(message: string): PublicationChannel | null {
  if (message.startsWith("Published on linkedin:")) {
    return "linkedin";
  }

  if (message.startsWith("Published on instagram:")) {
    return "instagram";
  }

  return null;
}
