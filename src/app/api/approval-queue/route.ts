import { NextResponse } from "next/server";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { deserializeContentPayload } from "@/lib/content-persistence";

type PostRow = {
  id: string;
  title: string;
  caption: string | null;
  format: string;
  status: string;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
};

function mapStatus(dbStatus: string): string {
  if (dbStatus === "pending" || dbStatus === "approved") return "pending_approval";
  return dbStatus; // scheduled, published, rejected
}

function mapFormat(dbFormat: string): string {
  if (dbFormat === "carousel") return "instagram-carousel";
  if (dbFormat === "story") return "instagram-story";
  if (dbFormat === "linkedin") return "linkedin";
  return "instagram-feed";
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ items: [] });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, caption, format, status, scheduled_for, published_at, created_at")
      .order("created_at", { ascending: false })
      .limit(60);

    if (error) {
      return NextResponse.json({ items: [] }, { status: 500 });
    }

    const items = (data as PostRow[]).map((row) => {
      const content = deserializeContentPayload(row.caption);
      return {
        id: row.id,
        status: mapStatus(row.status),
        caption: content?.legenda ?? row.caption ?? "",
        images: content?.asset_url_publicacao ? [content.asset_url_publicacao] : [],
        scheduledAt: row.scheduled_for ?? null,
        createdAt: row.created_at,
        postType: mapFormat(row.format),
        editorialTab: content?.pilar ?? ""
      };
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
