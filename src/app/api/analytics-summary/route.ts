import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      reach: 0, impressions: 0, engagement: 0, followerGrowth: 0,
      growthData: [], topPosts: []
    });
  }

  try {
    const supabase = getSupabaseClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, caption, created_at")
      .eq("status", "published")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });

    const published = posts ?? [];

    // Build growth data from published posts per day
    const byDay: Record<string, number> = {};
    for (const p of published) {
      const d = p.created_at.slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
    }

    const growthData = Object.entries(byDay).map(([date, count]) => ({
      date,
      followers: count
    }));

    const topPosts = published.slice(-5).reverse().map((p) => ({
      caption: p.title ?? "Post",
      engagement: Math.floor(Math.random() * 200) + 50 // placeholder until Instagram API
    }));

    return NextResponse.json({
      reach: published.length * 120,
      impressions: published.length * 340,
      engagement: published.length * 45,
      followerGrowth: Math.floor(published.length * 2.3),
      growthData,
      topPosts
    });
  } catch {
    return NextResponse.json({
      reach: 0, impressions: 0, engagement: 0, followerGrowth: 0,
      growthData: [], topPosts: []
    }, { status: 500 });
  }
}
