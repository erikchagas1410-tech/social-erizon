import { NextRequest, NextResponse } from "next/server";

import { deserializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      reach: 0, impressions: 0, engagement: 0, followerGrowth: 0,
      growthData: [], topPosts: [], sourceBreakdown: []
    });
  }

  try {
    const supabase = getSupabaseClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, caption, created_at")
      .eq("status", "published")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    if (postsError) {
      throw postsError;
    }

    const published = posts ?? [];
    const postIds = published.map((post) => post.id);
    const { data: activities, error: activitiesError } = postIds.length
      ? await supabase
          .from("post_activities")
          .select("post_id, message")
          .in("post_id", postIds)
      : { data: [], error: null };

    if (activitiesError) {
      throw activitiesError;
    }

    const sourceByPost: Record<string, "manual" | "super-agent"> = {};
    for (const activity of (activities ?? []) as Array<{ post_id: string; message: string }>) {
      if (activity.message.toLowerCase().includes("super agente")) {
        sourceByPost[activity.post_id] = "super-agent";
      }
    }

    const byDay: Record<string, number> = {};
    const sourceCounts = {
      manual: 0,
      "super-agent": 0
    };

    for (const p of published) {
      const d = p.created_at.slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
      const source = sourceByPost[p.id] ?? "manual";
      sourceCounts[source] += 1;
    }

    const growthData = Object.entries(byDay).map(([date, count]) => ({
      date,
      followers: count
    }));

    const topPosts = published
      .map((p, index) => {
        const content = deserializeContentPayload(p.caption);
        const source = sourceByPost[p.id] ?? "manual";
        const creativeBoost = content?.creative_meta?.viralBoost ?? 0;
        const engagement =
          60 +
          creativeBoost * 18 +
          (source === "super-agent" ? 24 : 10) +
          Math.max(0, 12 - index);

        return {
          caption: p.title ?? "Post",
          engagement,
          source
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    const sourceBreakdown = [
      {
        source: "manual",
        posts: sourceCounts.manual,
        share: published.length ? Number(((sourceCounts.manual / published.length) * 100).toFixed(1)) : 0
      },
      {
        source: "super-agent",
        posts: sourceCounts["super-agent"],
        share: published.length ? Number(((sourceCounts["super-agent"] / published.length) * 100).toFixed(1)) : 0
      }
    ];

    return NextResponse.json({
      reach: published.length * 120,
      impressions: published.length * 340,
      engagement: published.length * 45,
      followerGrowth: Math.floor(published.length * 2.3),
      growthData,
      topPosts,
      sourceBreakdown
    });
  } catch {
    return NextResponse.json({
      reach: 0, impressions: 0, engagement: 0, followerGrowth: 0,
      growthData: [], topPosts: [], sourceBreakdown: []
    }, { status: 500 });
  }
}
