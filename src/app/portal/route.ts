import { getPortalHtml } from "@/lib/portal-html";

export function GET() {
  return new Response(getPortalHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
