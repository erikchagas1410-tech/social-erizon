import { NextRequest, NextResponse } from "next/server";

import { generateSuperAgentOutput } from "@/lib/super-agent";
import { PublicationChannel } from "@/types/content";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      topic?: string;
      objective?: string;
      channels?: string[];
      trendLimit?: number;
    };

    const channels = (body.channels ?? []).filter(
      (item): item is PublicationChannel => item === "instagram" || item === "linkedin"
    );

    const payload = await generateSuperAgentOutput({
      topic: body.topic,
      objective: body.objective,
      channels,
      trendLimit: body.trendLimit
    });

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha ao executar o super agente."
      },
      { status: 500 }
    );
  }
}

