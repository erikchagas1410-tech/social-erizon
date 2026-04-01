export type DashboardStats = {
  pendingApproval: number;
  scheduled: number;
  published: number;
  approvalRate: number;
};

export type PostFormat = "feed" | "carousel" | "story" | "reel";
export type PostStatus = "pending" | "approved" | "scheduled" | "published";
export type ActivityType =
  | "approval"
  | "generation"
  | "schedule"
  | "publish"
  | "error";

export type ScheduledPost = {
  id: string;
  title: string;
  format: PostFormat;
  scheduledFor: string;
  status: PostStatus;
};

export type ActivityItem = {
  id: string;
  type: ActivityType;
  message: string;
  createdAt: string;
};

export type DashboardPayload = {
  stats: DashboardStats;
  scheduledPosts: ScheduledPost[];
  activities: ActivityItem[];
  source: "mock" | "supabase";
};

export type NavGroup = {
  label: string;
  items: Array<{
    label: string;
    href: string;
  }>;
};
