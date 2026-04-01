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

export async function getDashboardPayload(): Promise<DashboardPayload> {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase environment variables are missing. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const supabase = getSupabaseClient();

  const [
    pendingResult,
    scheduledResult,
    publishedResult,
    approvalBaseResult,
    postsResult,
    activityResult
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .in("status", ["approved", "scheduled", "published"]),
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

  const queryErrors = [
    pendingResult.error,
    scheduledResult.error,
    publishedResult.error,
    approvalBaseResult.error,
    postsResult.error,
    activityResult.error
  ].filter((error): error is NonNullable<typeof error> => Boolean(error));

  if (queryErrors.length) {
    throw new Error(queryErrors.map((error) => error.message).join(" | "));
  }

  const scheduledRows = postsResult.data ?? [];
  const publishChannelsByPost = await getPublishedChannelsByPost(
    scheduledRows.map((row) => row.id)
  );

  return {
    stats: mapMetrics({
      pendingApproval: pendingResult.count ?? 0,
      scheduled: scheduledResult.count ?? 0,
      published: publishedResult.count ?? 0,
      approvalBase: approvalBaseResult.count ?? 0
    }),
    scheduledPosts: scheduledRows.map((row) =>
      mapPost(row, publishChannelsByPost[row.id] ?? [])
    ),
    activities: (activityResult.data ?? []).map(mapActivity),
    source: "supabase"
  };
}

function mapMetrics({
  pendingApproval,
  scheduled,
  published,
  approvalBase
}: {
  pendingApproval: number;
  scheduled: number;
  published: number;
  approvalBase: number;
}): DashboardStats {
  const approvalRate =
    approvalBase === 0
      ? 0
      : Number((((scheduled + published) / approvalBase) * 100).toFixed(2));

  return {
    pendingApproval,
    scheduled,
    published,
    approvalRate
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
