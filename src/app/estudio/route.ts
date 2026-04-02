import { getStudioHtml } from "@/lib/studio-html";

export function GET() {
  return new Response(getStudioHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
