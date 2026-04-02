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

export async function generateErizonAsset(content: ErizonContentOutput) {
  const canvas = selectCanvasSpec(content);
  const accent = pickAccent(content.pilar);
  const accentAlt = pickAccentAlt(content.pilar);
  const logoDataUrl = loadLogoDataUrl();

  try {
    const font = await loadFont();
    const svg = await satori(buildArtwork(content, canvas, accent, accentAlt, logoDataUrl), {
      width: canvas.width,
      height: canvas.height,
      fonts: [
        {
          name: "ErizonSans",
          data: font,
          weight: 700,
          style: "normal"
        }
      ]
    });

    return sharp(Buffer.from(svg)).png().toBuffer();
  } catch {
    const svg = buildFallbackSvg(content, canvas, accent, accentAlt, logoDataUrl);
    return sharp(Buffer.from(svg)).png().toBuffer();
  }
}

function buildArtwork(
  content: ErizonContentOutput,
  canvas: CanvasSpec,
  accent: string,
  accentAlt: string,
  logoDataUrl: string | null
) {
  const hookLines = wrapText(content.gancho, getHookLineLimit(canvas), getHookMaxLines(canvas));
  const supportLines = wrapText(content.ideia_central, getSupportLineLimit(canvas), 3);
  const cta = truncate(content.cta, canvas.kind === "landscape" ? 84 : 96);
  const badge = buildBadge(content);
  const eyebrow = buildEyebrow(content, canvas);

  return (
    <div
      style={{
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(160deg, #05040b 0%, #0a0718 50%, #06111c 100%)",
        color: "#f6f7fb",
        fontFamily: "ErizonSans"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: `${canvas.kind === "story" ? 72 : 54}px ${canvas.kind === "story" ? 72 : 54}px`,
          opacity: 0.55
        }}
      />

      <div
        style={{
          position: "absolute",
          top: canvas.kind === "story" ? "-160px" : "-100px",
          right: canvas.kind === "landscape" ? "-80px" : "-120px",
          width: canvas.kind === "story" ? "520px" : "420px",
          height: canvas.kind === "story" ? "520px" : "420px",
          display: "flex",
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accent, 0.5)} 0%, ${withAlpha(
            accent,
            0.16
          )} 38%, transparent 72%)`
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: canvas.kind === "story" ? "-140px" : "-120px",
          left: canvas.kind === "landscape" ? "58%" : "-120px",
          width: canvas.kind === "story" ? "560px" : "420px",
          height: canvas.kind === "story" ? "560px" : "420px",
          display: "flex",
          borderRadius: "999px",
          background: `radial-gradient(circle, ${withAlpha(accentAlt, 0.35)} 0%, ${withAlpha(
            accentAlt,
            0.1
          )} 42%, transparent 72%)`
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: getInset(canvas, 26),
          display: "flex",
          borderRadius: "34px",
          border: `1px solid ${withAlpha(accent, 0.28)}`
        }}
      />

      <div
        style={{
          position: "absolute",
          top: `${getOuterPadding(canvas) - 18}px`,
          left: `${getOuterPadding(canvas)}px`,
          right: `${getOuterPadding(canvas)}px`,
          height: "3px",
          display: "flex",
          background: `linear-gradient(90deg, transparent 0%, ${accent} 18%, ${accentAlt} 72%, transparent 100%)`
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: `${getOuterPadding(canvas)}px`
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
          >
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                width={canvas.kind === "story" ? 60 : 48}
                height={canvas.kind === "story" ? 60 : 48}
                style={{ borderRadius: "14px" }}
              />
            ) : null}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "#ffffff",
                  fontSize: `${canvas.kind === "story" ? 28 : 22}px`,
                  letterSpacing: "0.22em",
                  fontWeight: 700
                }}
              >
                ERIZON
              </div>
              <div
                style={{
                  display: "flex",
                  color: withAlpha("#ffffff", 0.62),
                  fontSize: `${canvas.kind === "story" ? 14 : 11}px`,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase"
                }}
              >
                Agency OS // Performance Intelligence
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              padding: canvas.kind === "story" ? "12px 22px" : "10px 18px",
              borderRadius: "999px",
              border: `1px solid ${withAlpha(accent, 0.42)}`,
              background: withAlpha(accent, 0.12),
              color: accent,
              fontSize: `${canvas.kind === "story" ? 16 : 13}px`,
              letterSpacing: "0.16em",
              textTransform: "uppercase"
            }}
          >
            {badge}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: canvas.kind === "story" ? "24px" : "20px",
            paddingTop: canvas.kind === "story" ? "36px" : "28px",
            paddingBottom: canvas.kind === "story" ? "32px" : "22px"
          }}
        >
          <div
            style={{
              display: "flex",
              color: accentAlt,
              fontSize: `${canvas.kind === "story" ? 18 : 13}px`,
              letterSpacing: "0.18em",
              textTransform: "uppercase"
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: canvas.kind === "story" ? "8px" : "6px",
              maxWidth: `${getHeadlineWidth(canvas)}px`
            }}
          >
            {hookLines.map((line, index) => (
              <div
                key={`${line}-${index}`}
                style={{
                  display: "flex",
                  color: index === hookLines.length - 1 ? accentAlt : "#ffffff",
                  fontSize: `${getHeadlineSize(canvas, hookLines.length)}px`,
                  lineHeight: 0.95,
                  letterSpacing: "-0.055em",
                  fontWeight: 700
                }}
              >
                {line}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              width: `${canvas.kind === "story" ? 132 : 96}px`,
              height: "4px",
              background: `linear-gradient(90deg, ${accent} 0%, ${accentAlt} 100%)`,
              borderRadius: "999px"
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: canvas.kind === "story" ? "10px" : "8px",
              maxWidth: `${getSupportWidth(canvas)}px`
            }}
          >
            {supportLines.map((line, index) => (
              <div
                key={`${line}-${index}`}
                style={{
                  display: "flex",
                  color: withAlpha("#ffffff", 0.82),
                  fontSize: `${getSupportSize(canvas)}px`,
                  lineHeight: 1.22,
                  fontWeight: 700
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: canvas.kind === "landscape" ? "row" : "column",
            justifyContent: "space-between",
            alignItems: canvas.kind === "landscape" ? "flex-end" : "flex-start",
            gap: "18px"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: `${canvas.kind === "landscape" ? 620 : getSupportWidth(canvas)}px`
            }}
          >
            <div
              style={{
                display: "flex",
                color: withAlpha("#ffffff", 0.5),
                fontSize: `${canvas.kind === "story" ? 16 : 12}px`,
                letterSpacing: "0.18em",
                textTransform: "uppercase"
              }}
            >
              Clareza • Ação • Resultado
            </div>
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: `${canvas.kind === "story" ? 28 : canvas.kind === "landscape" ? 22 : 20}px`,
                lineHeight: 1.15,
                fontWeight: 700
              }}
            >
              {cta}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              color: accent,
              fontSize: `${canvas.kind === "story" ? 22 : 18}px`,
              letterSpacing: "0.18em",
              textTransform: "uppercase"
            }}
          >
            ERIZON.AI
          </div>
        </div>
      </div>
    </div>
  );
}

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) {
    return fontCache;
  }

  const font = loadLocalFont();
  if (!font) {
    throw new Error("Nenhuma fonte local encontrada para o renderer.");
  }

  fontCache = font;
  return fontCache;
}

function loadLocalFont(): ArrayBuffer | null {
  const candidates = [
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.woff"),
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.ttf"),
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/ARIALBD.TTF",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
  ];

  for (const candidatePath of candidates) {
    if (fs.existsSync(candidatePath)) {
      return Uint8Array.from(fs.readFileSync(candidatePath)).buffer;
    }
  }

  return null;
}

function buildFallbackSvg(
  content: ErizonContentOutput,
  canvas: CanvasSpec,
  accent: string,
  accentAlt: string,
  logoDataUrl: string | null
) {
  const hookLines = wrapText(content.gancho, getHookLineLimit(canvas), getHookMaxLines(canvas));
  const supportLines = wrapText(content.ideia_central, getSupportLineLimit(canvas), 3);
  const cta = truncate(content.cta, canvas.kind === "landscape" ? 84 : 96);
  const outer = getOuterPadding(canvas);
  const titleY = canvas.kind === "story" ? 300 : canvas.kind === "portrait" ? 250 : canvas.kind === "landscape" ? 210 : 220;
  const titleSize = getHeadlineSize(canvas, hookLines.length);
  const supportSize = getSupportSize(canvas);
  const titleBlock = hookLines
    .map((line, index) => {
      const y = titleY + index * Math.round(titleSize * 0.98);
      const fill = index === hookLines.length - 1 ? accentAlt : "#FFFFFF";
      return `<text x="${outer}" y="${y}" fill="${fill}" font-size="${titleSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800">${escapeXml(line)}</text>`;
    })
    .join("");
  const supportStartY = titleY + hookLines.length * Math.round(titleSize * 0.98) + 70;
  const supportBlock = supportLines
    .map((line, index) => {
      const y = supportStartY + index * Math.round(supportSize * 1.35);
      return `<text x="${outer}" y="${y}" fill="rgba(255,255,255,0.82)" font-size="${supportSize}" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(line)}</text>`;
    })
    .join("");

  return `
    <svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#05040b"/>
          <stop offset="50%" stop-color="#0a0718"/>
          <stop offset="100%" stop-color="#06111c"/>
        </linearGradient>
        <pattern id="grid" width="${canvas.kind === "story" ? 72 : 54}" height="${canvas.kind === "story" ? 72 : 54}" patternUnits="userSpaceOnUse">
          <path d="M ${canvas.kind === "story" ? 72 : 54} 0 L 0 0 0 ${canvas.kind === "story" ? 72 : 54}" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <circle cx="${canvas.width - outer * 0.7}" cy="${outer * 1.1}" r="${canvas.kind === "story" ? 270 : 210}" fill="${withAlpha(accent, 0.28)}"/>
      <circle cx="${outer * 0.6}" cy="${canvas.height - outer * 0.2}" r="${canvas.kind === "story" ? 300 : 220}" fill="${withAlpha(accentAlt, 0.18)}"/>
      <rect x="${outer - 16}" y="${outer - 16}" width="${canvas.width - (outer - 16) * 2}" height="${canvas.height - (outer - 16) * 2}" rx="28" fill="none" stroke="${withAlpha(accent, 0.3)}"/>
      <rect x="${outer}" y="${outer - 18}" width="${canvas.width - outer * 2}" height="3" fill="${accent}"/>
      ${logoDataUrl ? `<image href="${logoDataUrl}" x="${outer}" y="${outer}" width="48" height="48" />` : ""}
      <text x="${outer + (logoDataUrl ? 64 : 0)}" y="${outer + 22}" fill="#FFFFFF" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="4">ERIZON</text>
      <text x="${outer + (logoDataUrl ? 64 : 0)}" y="${outer + 42}" fill="rgba(255,255,255,0.58)" font-size="11" font-family="Arial, Helvetica, sans-serif">AGENCY OS // PERFORMANCE INTELLIGENCE</text>
      <text x="${outer}" y="${titleY - 42}" fill="${accentAlt}" font-size="${canvas.kind === "story" ? 18 : 13}" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(
        buildEyebrow(content, canvas)
      )}</text>
      ${titleBlock}
      <rect x="${outer}" y="${supportStartY - 32}" width="${canvas.kind === "story" ? 132 : 96}" height="4" rx="2" fill="${accent}"/>
      ${supportBlock}
      <text x="${outer}" y="${canvas.height - outer - 42}" fill="rgba(255,255,255,0.5)" font-size="${canvas.kind === "story" ? 16 : 12}" font-family="Arial, Helvetica, sans-serif" font-weight="700">CLAREZA • ACAO • RESULTADO</text>
      <text x="${outer}" y="${canvas.height - outer - 12}" fill="#FFFFFF" font-size="${canvas.kind === "story" ? 28 : canvas.kind === "landscape" ? 22 : 20}" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(
        cta
      )}</text>
      <text x="${outer}" y="${canvas.height - outer + 18}" fill="${accent}" font-size="${canvas.kind === "story" ? 22 : 18}" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="3">ERIZON.AI</text>
    </svg>
  `;
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

function getOuterPadding(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 88;
    case "portrait":
      return 76;
    case "landscape":
      return 58;
    default:
      return 68;
  }
}

function getInset(canvas: CanvasSpec, delta: number) {
  const outer = getOuterPadding(canvas);
  return `${outer - delta}px`;
}

function getHeadlineWidth(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 840;
    case "portrait":
      return 860;
    case "landscape":
      return 730;
    default:
      return 820;
  }
}

function getSupportWidth(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 760;
    case "portrait":
      return 780;
    case "landscape":
      return 620;
    default:
      return 760;
  }
}

function getHeadlineSize(canvas: CanvasSpec, lineCount: number) {
  if (canvas.kind === "story") {
    return lineCount > 4 ? 90 : 108;
  }

  if (canvas.kind === "portrait") {
    return lineCount > 4 ? 78 : 94;
  }

  if (canvas.kind === "landscape") {
    return lineCount > 3 ? 58 : 72;
  }

  return lineCount > 4 ? 72 : 86;
}

function getSupportSize(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 28;
    case "portrait":
      return 24;
    case "landscape":
      return 20;
    default:
      return 22;
  }
}

function getHookLineLimit(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 14;
    case "portrait":
      return 16;
    case "landscape":
      return 20;
    default:
      return 16;
  }
}

function getHookMaxLines(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 5;
    case "landscape":
      return 3;
    default:
      return 4;
  }
}

function getSupportLineLimit(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 26;
    case "portrait":
      return 28;
    case "landscape":
      return 34;
    default:
      return 28;
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

  if (!lines.length) {
    return [text];
  }

  return lines.slice(0, maxLines);
}

function formatLabel(format: ErizonContentOutput["formato"]) {
  return format.replaceAll("_", " ");
}

function pillarLabel(pillar: ErizonContentOutput["pilar"]) {
  return pillar.replaceAll("_", " ").toUpperCase();
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function pickAccent(pillar: ErizonContentOutput["pilar"]) {
  switch (pillar) {
    case "educacao":
      return "#00E7FF";
    case "desejo":
      return "#FF2BD6";
    case "conexao":
      return "#39C6FF";
    case "prova":
      return "#7C5CFF";
    default:
      return "#B517FF";
  }
}

function pickAccentAlt(pillar: ErizonContentOutput["pilar"]) {
  switch (pillar) {
    case "educacao":
      return "#B517FF";
    case "desejo":
      return "#FF7A00";
    case "conexao":
      return "#B517FF";
    case "prova":
      return "#00E7FF";
    default:
      return "#00E7FF";
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

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
