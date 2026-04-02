import fs from "node:fs";
import path from "node:path";

import React from "react";
import sharp from "sharp";
import satori from "satori";

import { ErizonContentOutput } from "@/types/content";

type CanvasSpec = {
  width: number;
  height: number;
  kind: "square" | "portrait" | "story" | "landscape";
};

let fontCache: ArrayBuffer | null = null;
let logoCache: string | null = null;

const FONT_SUPABASE_PATH = "data/inter-extrabold.woff";
const FONT_GOOGLE_CSS_URL =
  "https://fonts.googleapis.com/css?family=Inter:800&subset=latin";

export async function generateErizonAsset(content: ErizonContentOutput) {
  const logoDataUrl = loadLogoDataUrl();
  const canvas = selectCanvasSpec(content);
  const accent = pickAccent(content.pilar);
  const accentAlt = pickAccentAlt(content.pilar);

  try {
    const font = await loadFont();
    const hookLines = wrapText(content.gancho, lineLimit(canvas, "hook"), 4);
    const supportLines = wrapText(content.ideia_central, lineLimit(canvas, "support"), 3);
    const cta = truncate(content.cta, canvas.kind === "landscape" ? 84 : 110);
    const isCentered = shouldUseCenteredLayout(content, canvas);
    const titleSize = getTitleSize(canvas, hookLines.length);
    const contentJustify = getContentJustify(canvas);
    const contentPaddingTop = getContentPaddingTop(canvas);

    const svg = await satori(
      <div
        style={{
          width: `${canvas.width}px`,
          height: `${canvas.height}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #08020f 0%, #0a0718 45%, #07111f 100%)",
          color: "#FFFFFF",
          padding: getPadding(canvas),
          fontFamily: "Inter"
        }}
      >
        <BackgroundLayers canvas={canvas} accent={accent} accentAlt={accentAlt} />
        <CornerAccents canvas={canvas} accent={accent} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            position: "relative",
            zIndex: 2
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                width={canvas.kind === "landscape" ? 34 : 40}
                height={canvas.kind === "landscape" ? 34 : 40}
                style={{ borderRadius: "10px" }}
              />
            ) : (
              <div
                style={{
                  width: canvas.kind === "landscape" ? "34px" : "40px",
                  height: canvas.kind === "landscape" ? "34px" : "40px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${accent}, ${accentAlt})`,
                  boxShadow: `0 0 20px ${withAlpha(accent, 0.45)}`
                }}
              />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <div
                style={{
                  fontSize: canvas.kind === "landscape" ? "18px" : "20px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase"
                }}
              >
                Erizon
              </div>
              <div
                style={{
                  fontSize: canvas.kind === "landscape" ? "10px" : "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)"
                }}
              >
                Performance Intelligence
              </div>
            </div>
          </div>
          <div
            style={{
              padding: canvas.kind === "landscape" ? "8px 12px" : "8px 16px",
              borderRadius: "999px",
              border: `1px solid ${withAlpha(accent, 0.34)}`,
              background: `linear-gradient(135deg, ${withAlpha(accent, 0.15)}, ${withAlpha(
                accentAlt,
                0.12
              )})`,
              color: accent,
              fontSize: canvas.kind === "landscape" ? "10px" : "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase"
            }}
          >
            {buildBadge(content)}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: isCentered ? "center" : "flex-start",
            justifyContent: contentJustify,
            textAlign: isCentered ? "center" : "left",
            width: isCentered ? "100%" : canvas.kind === "landscape" ? "56%" : "100%",
            maxWidth: isCentered ? "100%" : canvas.kind === "landscape" ? "620px" : "840px",
            flex: 1,
            paddingTop: contentPaddingTop
          }}
        >
          <div
            style={{
              fontSize: canvas.kind === "story" ? "13px" : "12px",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: accentAlt,
              textShadow: `0 0 18px ${withAlpha(accentAlt, 0.7)}`,
              marginBottom: "26px"
            }}
          >
            {buildEyebrow(content, canvas)}
          </div>
          {hookLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                fontSize: `${titleSize}px`,
                lineHeight: 1.03,
                letterSpacing: "-0.05em",
                color: index === hookLines.length - 1 ? "transparent" : "#FFFFFF",
                background:
                  index === hookLines.length - 1
                    ? `linear-gradient(135deg, ${accent} 0%, ${accentAlt} 60%, #00F2FF 100%)`
                    : undefined,
                WebkitBackgroundClip: index === hookLines.length - 1 ? "text" : undefined,
                textShadow:
                  index === hookLines.length - 1
                    ? `0 0 38px ${withAlpha(accent, 0.35)}`
                    : `0 0 28px ${withAlpha(accent, 0.18)}`
              }}
            >
              {line}
            </div>
          ))}
          <div
            style={{
              width: "88px",
              height: "2px",
              marginTop: "28px",
              marginBottom: "24px",
              alignSelf: isCentered ? "center" : "flex-start",
              background: `linear-gradient(90deg, transparent, ${accent}, ${accentAlt}, transparent)`,
              boxShadow: `0 0 16px ${withAlpha(accent, 0.6)}`
            }}
          />
          {supportLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              style={{
                fontSize: `${getSupportSize(canvas)}px`,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.7)",
                maxWidth: canvas.kind === "landscape" ? "540px" : "760px"
              }}
            >
              {line}
            </div>
          ))}
          <div
            style={{
              display: "flex",
              gap: canvas.kind === "landscape" ? "18px" : "24px",
              alignItems: "center",
              justifyContent: isCentered ? "center" : "flex-start",
              flexWrap: "wrap",
              marginTop: "34px"
            }}
          >
            {buildStats(content).map((item, index, list) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: canvas.kind === "landscape" ? "18px" : "24px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <div
                    style={{
                      fontSize: canvas.kind === "landscape" ? "22px" : "28px",
                      color: index === 1 ? accentAlt : "#FFFFFF",
                      textShadow: `0 0 24px ${withAlpha(
                        index === 1 ? accentAlt : accent,
                        0.42
                      )}`
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.42)"
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                {index === list.length - 1 ? null : (
                  <div
                    style={{
                      width: "1px",
                      height: canvas.kind === "landscape" ? "38px" : "46px",
                      background: `linear-gradient(to bottom, transparent, ${withAlpha(
                        accent,
                        0.42
                      )}, transparent)`
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: isCentered ? "center" : "flex-start",
            textAlign: isCentered ? "center" : "left",
            gap: "10px"
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.48)"
            }}
          >
            Decisao • Clareza • Lucro
          </div>
          <div
            style={{
              fontSize: canvas.kind === "landscape" ? "18px" : "22px",
              lineHeight: 1.35,
              color: "#FFFFFF",
              maxWidth: canvas.kind === "landscape" ? "720px" : "820px"
            }}
          >
            {cta}
          </div>
          <div
            style={{
              fontSize: canvas.kind === "landscape" ? "14px" : "16px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              textShadow: `0 0 18px ${withAlpha(accent, 0.55)}`
            }}
          >
            erizon.ai
          </div>
        </div>
      </div>,
      {
        width: canvas.width,
        height: canvas.height,
        fonts: [
          {
            name: "Inter",
            data: font,
            weight: 800,
            style: "normal"
          }
        ]
      }
    );

    return sharp(Buffer.from(svg)).png().toBuffer();
  } catch {
    return generateFallbackAsset(content, canvas, accent, accentAlt, logoDataUrl);
  }
}

function BackgroundLayers({
  canvas,
  accent,
  accentAlt
}: {
  canvas: CanvasSpec;
  accent: string;
  accentAlt: string;
}) {
  const ringBase = canvas.kind === "landscape" ? 420 : canvas.kind === "story" ? 520 : 460;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "0",
          backgroundImage: `linear-gradient(${withAlpha(accent, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${withAlpha(accent, 0.07)} 1px, transparent 1px)`,
          backgroundSize: canvas.kind === "landscape" ? "44px 44px" : "56px 56px"
        }}
      />
      <div
        style={{
          position: "absolute",
          top: canvas.kind === "landscape" ? "-110px" : "-140px",
          left: "50%",
          transform: "translateX(-50%)",
          width: canvas.kind === "story" ? "620px" : "520px",
          height: canvas.kind === "story" ? "480px" : "420px",
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accent, 0.42)} 0%, transparent 72%)`,
          filter: "blur(34px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: canvas.kind === "landscape" ? "-110px" : "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: canvas.kind === "story" ? "760px" : "620px",
          height: canvas.kind === "story" ? "360px" : "280px",
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accentAlt, 0.3)} 0%, transparent 74%)`,
          filter: "blur(38px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          width: canvas.kind === "landscape" ? "520px" : canvas.kind === "story" ? "860px" : "620px",
          height: canvas.kind === "landscape" ? "520px" : canvas.kind === "story" ? "860px" : "620px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "999px",
          background: `radial-gradient(circle at 40% 35%, ${withAlpha(accent, 0.3)} 0%, ${withAlpha(
            accentAlt,
            0.16
          )} 35%, rgba(0,242,255,0.08) 58%, transparent 74%)`
        }}
      />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: `${ringBase + index * 180}px`,
            height: `${ringBase + index * 180}px`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "999px",
            border: `1px solid ${withAlpha(accent, 0.28 - index * 0.09)}`
          }}
        />
      ))}
      {[
        ["18%", "18%", accentAlt, 34],
        ["80%", "26%", accent, -24],
        ["22%", "78%", accent, -36],
        ["82%", "70%", accentAlt, 28]
      ].map(([left, top, color, rotate], index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: String(left),
            top: String(top),
            width: "2px",
            height: "58px",
            borderRadius: "2px",
            background: `linear-gradient(to bottom, ${withAlpha(String(color), 0.95)}, transparent)`,
            transform: `rotate(${rotate}deg)`
          }}
        />
      ))}
    </>
  );
}

function CornerAccents({
  canvas,
  accent
}: {
  canvas: CanvasSpec;
  accent: string;
}) {
  const inset = canvas.kind === "landscape" ? 24 : 34;
  const size = canvas.kind === "landscape" ? 32 : 40;

  return (
    <>
      {[
        { top: inset, left: inset, borderTop: true, borderLeft: true },
        { top: inset, right: inset, borderTop: true, borderRight: true },
        { bottom: inset, left: inset, borderBottom: true, borderLeft: true },
        { bottom: inset, right: inset, borderBottom: true, borderRight: true }
      ].map((corner, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: `${size}px`,
            height: `${size}px`,
            ...corner,
            borderTop: corner.borderTop ? `2px solid ${withAlpha(accent, 0.58)}` : undefined,
            borderRight: corner.borderRight ? `2px solid ${withAlpha(accent, 0.58)}` : undefined,
            borderBottom: corner.borderBottom ? `2px solid ${withAlpha(accent, 0.58)}` : undefined,
            borderLeft: corner.borderLeft ? `2px solid ${withAlpha(accent, 0.58)}` : undefined
          }}
        />
      ))}
    </>
  );
}

function selectCanvasSpec(content: ErizonContentOutput): CanvasSpec {
  const channels = content.canais_publicacao ?? [];
  const onlyInstagram = channels.length > 0 && channels.every((channel) => channel === "instagram");
  const onlyLinkedIn = channels.length > 0 && channels.every((channel) => channel === "linkedin");

  if (looksLikeStory(content)) {
    return { width: 1080, height: 1920, kind: "story" };
  }

  if (content.formato === "carrossel" || content.formato === "comparacao" || content.formato === "checklist") {
    return { width: 1080, height: 1080, kind: "square" };
  }

  if (onlyLinkedIn) {
    if (content.formato === "analise" || content.formato === "insight_estrategico") {
      return { width: 1200, height: 627, kind: "landscape" };
    }

    return { width: 1200, height: 1500, kind: "portrait" };
  }

  if (onlyInstagram) {
    return { width: 1080, height: 1350, kind: "portrait" };
  }

  return { width: 1080, height: 1080, kind: "square" };
}

function shouldUseCenteredLayout(content: ErizonContentOutput, canvas: CanvasSpec) {
  if (canvas.kind === "story") {
    return false;
  }

  if (canvas.kind === "landscape") {
    return false;
  }

  return !["comparacao", "analise", "checklist", "mini_aula", "insight_estrategico"].includes(
    content.formato
  );
}

function looksLikeStory(content: ErizonContentOutput) {
  const base = `${content.formato} ${content.estrutura_criativo} ${content.prompt_imagem}`.toLowerCase();
  return base.includes("story") || base.includes("stories") || base.includes("9:16");
}

function buildBadge(content: ErizonContentOutput) {
  if (content.formato === "carrossel") {
    return "Carousel";
  }

  if (content.canais_publicacao?.includes("linkedin") && !content.canais_publicacao.includes("instagram")) {
    return "LinkedIn";
  }

  return pillarLabel(content.pilar);
}

function buildEyebrow(content: ErizonContentOutput, canvas: CanvasSpec) {
  const channelLabel = content.canais_publicacao?.includes("instagram")
    ? content.canais_publicacao.includes("linkedin")
      ? "Instagram + LinkedIn"
      : "Instagram"
    : content.canais_publicacao?.includes("linkedin")
      ? "LinkedIn"
      : canvas.kind === "story"
        ? "Instagram Stories"
        : "Social Post";

  return `${channelLabel} // ${formatLabel(content.formato)}`;
}

function buildStats(content: ErizonContentOutput) {
  return [
    { value: pillarLabel(content.pilar).slice(0, 8), label: "Pilar" },
    { value: formatLabel(content.formato).slice(0, 12), label: "Formato" },
    { value: content.sugestao_horario || "18:00", label: "Horario" }
  ];
}

function formatLabel(format: ErizonContentOutput["formato"]) {
  return format.replaceAll("_", " ");
}

function pillarLabel(pillar: ErizonContentOutput["pilar"]) {
  return pillar.replaceAll("_", " ").toUpperCase();
}

function getPadding(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "landscape":
      return "34px 42px 30px";
    case "story":
      return "92px 60px 72px";
    case "portrait":
      return "76px 68px 64px";
    default:
      return "72px 72px 64px";
  }
}

function getTitleSize(canvas: CanvasSpec, lineCount: number) {
  if (canvas.kind === "story") {
    return lineCount > 3 ? 92 : 108;
  }

  if (canvas.kind === "portrait") {
    return lineCount > 3 ? 86 : 102;
  }

  if (canvas.kind === "landscape") {
    return lineCount > 3 ? 72 : 84;
  }

  return lineCount > 3 ? 80 : 94;
}

function getContentJustify(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "landscape":
      return "center";
    case "story":
      return "flex-start";
    case "portrait":
      return "flex-start";
    default:
      return "flex-start";
  }
}

function getContentPaddingTop(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return "52px";
    case "portrait":
      return "26px";
    case "square":
      return "16px";
    default:
      return "0px";
  }
}

function getSupportSize(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 28;
    case "portrait":
      return 26;
    case "landscape":
      return 20;
    default:
      return 24;
  }
}

function lineLimit(canvas: CanvasSpec, type: "hook" | "support") {
  if (type === "hook") {
    switch (canvas.kind) {
      case "story":
        return 12;
      case "portrait":
        return 14;
      case "landscape":
        return 16;
      default:
        return 15;
    }
  }

  switch (canvas.kind) {
    case "story":
      return 22;
    case "portrait":
      return 30;
    case "landscape":
      return 28;
    default:
      return 28;
  }
}

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  const localFont = loadLocalFont();

  if (localFont) {
    fontCache = localFont;
    return fontCache;
  }

  const cachedSupabaseFont = await loadFontFromSupabase();

  if (cachedSupabaseFont) {
    fontCache = cachedSupabaseFont;
    return fontCache;
  }

  const cssResponse = await fetch(FONT_GOOGLE_CSS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"
    },
    cache: "force-cache"
  });

  if (!cssResponse.ok) {
    throw new Error(`Falha ao carregar CSS da fonte: HTTP ${cssResponse.status}`);
  }

  const css = await cssResponse.text();
  const match =
    css.match(/src:\s*url\(([^)]+\.woff[^2)][^)]*)\)/) ??
    css.match(/src:\s*url\(([^)]+)\)/);
  const fontUrl = match?.[1];

  if (!fontUrl) {
    throw new Error("Nao foi possivel extrair a URL da fonte para o renderer.");
  }

  const fontResponse = await fetch(fontUrl, { cache: "force-cache" });

  if (!fontResponse.ok) {
    throw new Error(`Falha ao baixar a fonte do renderer: HTTP ${fontResponse.status}`);
  }

  fontCache = await fontResponse.arrayBuffer();
  void cacheFontInSupabase(fontCache);
  return fontCache;
}

function loadLocalFont(): ArrayBuffer | null {
  const candidatePaths = [
    path.resolve(process.cwd(), "public/fonts/montserrat-black.woff"),
    path.resolve(process.cwd(), "public/fonts/montserrat-black.ttf"),
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.woff"),
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.ttf")
  ];

  for (const candidatePath of candidatePaths) {
    if (fs.existsSync(candidatePath)) {
      const buffer = fs.readFileSync(candidatePath);
      return Uint8Array.from(buffer).buffer;
    }
  }

  return null;
}

async function loadFontFromSupabase(): Promise<ArrayBuffer | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erizon-media";

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${FONT_SUPABASE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`
        },
        cache: "force-cache"
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function cacheFontInSupabase(font: ArrayBuffer) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erizon-media";

  if (!supabaseUrl || !supabaseKey) {
    return;
  }

  try {
    await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${FONT_SUPABASE_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "font/woff",
        "x-upsert": "true"
      },
      body: Buffer.from(font),
      cache: "no-store"
    });
  } catch {
    // Ignora erro de cache para nao travar a geracao do asset.
  }
}

function loadLogoDataUrl() {
  if (logoCache) {
    return logoCache;
  }

  const logoPath = path.resolve(process.cwd(), "public/logo-erizon.png");

  if (!fs.existsSync(logoPath)) {
    return null;
  }

  logoCache = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  return logoCache;
}

function wrapText(text: string, maxChars: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current.trim()) {
        lines.push(current.trim());
      }
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current.trim()) {
    lines.push(current.trim());
  }

  return lines.slice(0, maxLines);
}

async function generateFallbackAsset(
  content: ErizonContentOutput,
  canvas: CanvasSpec,
  accent: string,
  accentAlt: string,
  logoDataUrl: string | null
) {
  const hook = escapeXml(content.gancho);
  const sub = escapeXml(truncate(content.ideia_central, 150));
  const cta = escapeXml(truncate(content.cta, 90));
  const badge = escapeXml(buildBadge(content));
  const eyebrow = escapeXml(buildEyebrow(content, canvas));
  const heroTop = getFallbackHeroTop(canvas);
  const logoMarkup = logoDataUrl
    ? `<image href="${logoDataUrl}" x="56" y="56" width="44" height="44" />`
    : "";
  const svg = `
    <svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#08020f"/>
          <stop offset="50%" stop-color="#0a0718"/>
          <stop offset="100%" stop-color="#07111f"/>
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="55%" stop-color="${accentAlt}"/>
          <stop offset="100%" stop-color="#00F2FF"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="26" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.24}" fill="${accent}" opacity="0.22" filter="url(#glow)"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.32}" fill="none" stroke="${accent}" stroke-opacity="0.22"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.42}" fill="none" stroke="${accent}" stroke-opacity="0.10"/>
      <rect x="28" y="28" width="${canvas.width - 56}" height="${canvas.height - 56}" rx="0" fill="none" stroke="${accent}" stroke-opacity="0.16"/>
      ${logoMarkup}
      <text x="${logoDataUrl ? 116 : 56}" y="84" fill="#FFFFFF" font-size="26" font-family="Arial, sans-serif" font-weight="700" letter-spacing="5">ERIZON</text>
      <text x="${logoDataUrl ? 116 : 56}" y="106" fill="rgba(255,255,255,0.55)" font-size="11" font-family="Arial, sans-serif" letter-spacing="2">PERFORMANCE INTELLIGENCE</text>
      <rect x="${canvas.width - 240}" y="54" width="184" height="40" rx="20" fill="${accent}" fill-opacity="0.10" stroke="${accent}" stroke-opacity="0.32"/>
      <text x="${canvas.width - 148}" y="79" text-anchor="middle" fill="${accent}" font-size="12" font-family="Arial, sans-serif" letter-spacing="2">${badge}</text>
      <text x="${canvas.kind === "landscape" ? 60 : canvas.width / 2}" y="${heroTop - 34}" ${canvas.kind === "landscape" ? "" : 'text-anchor="middle"'} fill="${accentAlt}" font-size="14" font-family="Courier New, monospace" letter-spacing="3">${eyebrow}</text>
      <foreignObject x="${canvas.kind === "landscape" ? 56 : 90}" y="${heroTop}" width="${canvas.kind === "landscape" ? 620 : canvas.width - 180}" height="${canvas.kind === "story" ? 820 : 520}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;gap:18px;align-items:${canvas.kind === "landscape" || canvas.kind === "story" ? "flex-start" : "center"};text-align:${canvas.kind === "landscape" || canvas.kind === "story" ? "left" : "center"};color:white;font-family:Arial,sans-serif;">
          <div style="font-size:${canvas.kind === "story" ? 94 : canvas.kind === "portrait" ? 82 : canvas.kind === "landscape" ? 72 : 84}px;line-height:1.02;font-weight:900;letter-spacing:-2px;">
            <span style="color:white;">${hook.replace(/\n/g, "<br/>")}</span>
          </div>
          <div style="width:88px;height:2px;background:linear-gradient(90deg,transparent,${accent},${accentAlt},transparent);"></div>
          <div style="font-size:${canvas.kind === "story" ? 28 : canvas.kind === "portrait" ? 26 : 22}px;line-height:1.45;color:rgba(255,255,255,0.78);">${sub}</div>
        </div>
      </foreignObject>
      <text x="${canvas.kind === "landscape" || canvas.kind === "story" ? 60 : canvas.width / 2}" y="${canvas.height - 108}" ${canvas.kind === "landscape" || canvas.kind === "story" ? "" : 'text-anchor="middle"'} fill="rgba(255,255,255,0.50)" font-size="12" font-family="Courier New, monospace" letter-spacing="3">DECISAO • CLAREZA • LUCRO</text>
      <foreignObject x="${canvas.kind === "landscape" || canvas.kind === "story" ? 56 : 90}" y="${canvas.height - 92}" width="${canvas.width - (canvas.kind === "landscape" || canvas.kind === "story" ? 112 : 180)}" height="56">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:${canvas.kind === "landscape" ? 18 : 20}px;line-height:1.3;color:white;font-family:Arial,sans-serif;text-align:${canvas.kind === "landscape" || canvas.kind === "story" ? "left" : "center"};">${cta}</div>
      </foreignObject>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function getFallbackHeroTop(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 250;
    case "portrait":
      return 150;
    case "square":
      return 130;
    default:
      return 220;
  }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function pickAccent(pillar: ErizonContentOutput["pilar"]) {
  switch (pillar) {
    case "educacao":
      return "#00F2FF";
    case "desejo":
      return "#FF00E5";
    case "conexao":
      return "#38BDF8";
    case "prova":
      return "#7C3AED";
    default:
      return "#BC13FE";
  }
}

function pickAccentAlt(pillar: ErizonContentOutput["pilar"]) {
  switch (pillar) {
    case "educacao":
      return "#BC13FE";
    case "desejo":
      return "#FF4488";
    case "conexao":
      return "#BC13FE";
    case "prova":
      return "#00F2FF";
    default:
      return "#00F2FF";
  }
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
