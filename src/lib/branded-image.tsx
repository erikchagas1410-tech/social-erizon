import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { ErizonContentOutput } from "@/types/content";

type CanvasSpec = {
  width: number;
  height: number;
  kind: "square" | "portrait" | "story" | "landscape";
};

let logoCache: string | null = null;

export async function generateErizonAsset(content: ErizonContentOutput) {
  const canvas = selectCanvasSpec(content);
  const accent = pickAccent(content.pilar);
  const accentAlt = pickAccentAlt(content.pilar);
  const logoDataUrl = loadLogoDataUrl();
  const hookLines = wrapText(content.gancho, lineLimit(canvas, "hook"), 4);
  const supportLines = wrapText(content.ideia_central, lineLimit(canvas, "support"), 3);
  const ctaLine = truncate(content.cta, canvas.kind === "landscape" ? 84 : 100);
  const eyebrow = buildEyebrow(content, canvas);
  const badge = buildBadge(content);
  const titleSize = getTitleSize(canvas, hookLines.length);
  const supportSize = getSupportSize(canvas);
  const centerText = shouldCenter(canvas, content);
  const textX = centerText ? canvas.width / 2 : getLeftX(canvas);
  const textAnchor = centerText ? "middle" : "start";
  const heroTop = getHeroTop(canvas);
  const supportTop = heroTop + hookLines.length * (titleSize * 1.04) + 46;
  const ctaTop = canvas.height - getBottomInset(canvas);
  const logoX = 56;
  const logoY = 54;
  const badgeWidth = Math.max(180, badge.length * 10 + 36);
  const badgeX = canvas.width - badgeWidth - 54;

  const hookText = buildTspans(
    hookLines,
    textX,
    heroTop,
    titleSize,
    textAnchor,
    true
  );
  const supportText = buildTspans(
    supportLines,
    textX,
    supportTop,
    supportSize,
    textAnchor,
    false
  );

  const svg = `
    <svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#08020f"/>
          <stop offset="45%" stop-color="#0a0718"/>
          <stop offset="100%" stop-color="#07111f"/>
        </linearGradient>
        <linearGradient id="gridAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${withAlpha(accent, 0.12)}"/>
          <stop offset="100%" stop-color="${withAlpha(accentAlt, 0.08)}"/>
        </linearGradient>
        <linearGradient id="titleAccent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}"/>
          <stop offset="55%" stop-color="${accentAlt}"/>
          <stop offset="100%" stop-color="#00F2FF"/>
        </linearGradient>
        <pattern id="grid" width="${canvas.kind === "landscape" ? 44 : 56}" height="${canvas.kind === "landscape" ? 44 : 56}" patternUnits="userSpaceOnUse">
          <path d="M ${canvas.kind === "landscape" ? 44 : 56} 0 L 0 0 0 ${canvas.kind === "landscape" ? 44 : 56}" fill="none" stroke="url(#gridAccent)" stroke-width="1"/>
        </pattern>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="28" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="titleGlow">
          <feGaussianBlur stdDeviation="9" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#bg)"/>
      <rect width="100%" height="100%" fill="url(#grid)" opacity="0.95"/>

      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.22}" fill="${withAlpha(accent, 0.24)}" filter="url(#softGlow)"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.31}" fill="none" stroke="${withAlpha(accent, 0.22)}" stroke-width="1.4"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height / 2}" r="${Math.min(canvas.width, canvas.height) * 0.40}" fill="none" stroke="${withAlpha(accent, 0.10)}" stroke-width="1.1"/>

      <circle cx="${canvas.width / 2}" cy="${canvas.kind === "story" ? 180 : 0}" r="${canvas.kind === "story" ? 260 : 220}" fill="${withAlpha(accent, 0.18)}" filter="url(#softGlow)"/>
      <circle cx="${canvas.width / 2}" cy="${canvas.height}" r="${canvas.kind === "story" ? 300 : 240}" fill="${withAlpha(accentAlt, 0.18)}" filter="url(#softGlow)"/>

      <path d="M 30 70 L 30 30 L 70 30" fill="none" stroke="${withAlpha(accent, 0.58)}" stroke-width="2"/>
      <path d="M ${canvas.width - 70} 30 L ${canvas.width - 30} 30 L ${canvas.width - 30} 70" fill="none" stroke="${withAlpha(accent, 0.58)}" stroke-width="2"/>
      <path d="M 30 ${canvas.height - 70} L 30 ${canvas.height - 30} L 70 ${canvas.height - 30}" fill="none" stroke="${withAlpha(accent, 0.58)}" stroke-width="2"/>
      <path d="M ${canvas.width - 70} ${canvas.height - 30} L ${canvas.width - 30} ${canvas.height - 30} L ${canvas.width - 30} ${canvas.height - 70}" fill="none" stroke="${withAlpha(accent, 0.58)}" stroke-width="2"/>

      <line x1="18%" y1="18%" x2="18.8%" y2="13%" stroke="${withAlpha(accentAlt, 0.84)}" stroke-width="2"/>
      <line x1="81%" y1="27%" x2="80.2%" y2="22%" stroke="${withAlpha(accent, 0.78)}" stroke-width="2"/>
      <line x1="22%" y1="78%" x2="22.8%" y2="73%" stroke="${withAlpha(accent, 0.78)}" stroke-width="2"/>
      <line x1="82%" y1="72%" x2="81.2%" y2="67%" stroke="${withAlpha(accentAlt, 0.84)}" stroke-width="2"/>

      ${logoDataUrl ? `<image href="${logoDataUrl}" x="${logoX}" y="${logoY}" width="42" height="42" />` : ""}
      <text x="${logoDataUrl ? logoX + 60 : logoX}" y="${logoY + 20}" fill="#FFFFFF" font-size="24" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="5">ERIZON</text>
      <text x="${logoDataUrl ? logoX + 60 : logoX}" y="${logoY + 39}" fill="rgba(255,255,255,0.55)" font-size="10" font-family="Courier New, monospace" letter-spacing="2">PERFORMANCE INTELLIGENCE</text>

      <rect x="${badgeX}" y="${logoY}" width="${badgeWidth}" height="38" rx="19" fill="${withAlpha(accent, 0.12)}" stroke="${withAlpha(accent, 0.34)}"/>
      <text x="${badgeX + badgeWidth / 2}" y="${logoY + 24}" text-anchor="middle" fill="${accent}" font-size="11" font-family="Courier New, monospace" letter-spacing="2">${escapeXml(badge)}</text>

      <text x="${textX}" y="${heroTop - 34}" text-anchor="${textAnchor}" fill="${accentAlt}" font-size="${canvas.kind === "story" ? 13 : 12}" font-family="Courier New, monospace" letter-spacing="3">${escapeXml(eyebrow)}</text>

      <text x="${textX}" y="${heroTop}" text-anchor="${textAnchor}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${titleSize}" letter-spacing="-2" fill="#FFFFFF" filter="url(#titleGlow)">
        ${hookText}
      </text>

      <line x1="${centerText ? canvas.width / 2 - 44 : textX}" y1="${supportTop - 22}" x2="${centerText ? canvas.width / 2 + 44 : textX + 88}" y2="${supportTop - 22}" stroke="${accent}" stroke-width="2.2"/>

      <text x="${textX}" y="${supportTop}" text-anchor="${textAnchor}" font-family="Arial, Helvetica, sans-serif" font-size="${supportSize}" fill="rgba(255,255,255,0.78)">
        ${supportText}
      </text>

      ${buildStatsSvg(content, canvas, accent, accentAlt, centerText, textX, supportTop + supportLines.length * (supportSize * 1.45) + 38)}

      <text x="${centerText ? canvas.width / 2 : textX}" y="${ctaTop - 42}" text-anchor="${textAnchor}" fill="rgba(255,255,255,0.50)" font-size="12" font-family="Courier New, monospace" letter-spacing="3">DECISAO • CLAREZA • LUCRO</text>
      <text x="${centerText ? canvas.width / 2 : textX}" y="${ctaTop - 12}" text-anchor="${textAnchor}" fill="#FFFFFF" font-size="${canvas.kind === "landscape" ? 18 : 20}" font-family="Arial, Helvetica, sans-serif">${escapeXml(ctaLine)}</text>
      <text x="${centerText ? canvas.width / 2 : textX}" y="${ctaTop + 20}" text-anchor="${textAnchor}" fill="${accent}" font-size="15" font-family="Courier New, monospace" letter-spacing="3">ERIZON.AI</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function buildStatsSvg(
  content: ErizonContentOutput,
  canvas: CanvasSpec,
  accent: string,
  accentAlt: string,
  centered: boolean,
  baseX: number,
  topY: number
) {
  const stats = [
    { value: pillarLabel(content.pilar).slice(0, 8), label: "PILAR" },
    { value: formatLabel(content.formato).slice(0, 12).toUpperCase(), label: "FORMATO" },
    { value: (content.sugestao_horario || "18:00").toUpperCase(), label: "HORARIO" }
  ];
  const gap = canvas.kind === "landscape" ? 160 : 180;
  const startX = centered ? canvas.width / 2 - gap : baseX;

  return stats
    .map((stat, index) => {
      const x = centered ? startX + index * gap : baseX + index * gap;
      const anchor = centered ? "middle" : "start";
      const valueColor = index === 1 ? accentAlt : "#FFFFFF";
      const separator =
        index < stats.length - 1
          ? `<line x1="${centered ? x + gap / 2 - 12 : x + 126}" y1="${topY - 6}" x2="${centered ? x + gap / 2 - 12 : x + 126}" y2="${topY + 40}" stroke="${withAlpha(accent, 0.34)}" stroke-width="1"/>`
          : "";

      return `
        <text x="${x}" y="${topY}" text-anchor="${anchor}" fill="${valueColor}" font-size="${canvas.kind === "landscape" ? 22 : 26}" font-family="Courier New, monospace">${escapeXml(stat.value)}</text>
        <text x="${x}" y="${topY + 18}" text-anchor="${anchor}" fill="rgba(255,255,255,0.42)" font-size="10" font-family="Courier New, monospace" letter-spacing="2">${stat.label}</text>
        ${separator}
      `;
    })
    .join("");
}

function buildTspans(
  lines: string[],
  x: number,
  startY: number,
  fontSize: number,
  textAnchor: string,
  accentLastLine: boolean
) {
  return lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : Math.round(fontSize * 1.04);
      const fill =
        accentLastLine && index === lines.length - 1
          ? ` fill="url(#titleAccent)"`
          : ` fill="#FFFFFF"`;

      return `<tspan x="${x}" dy="${dy}" text-anchor="${textAnchor}"${fill}>${escapeXml(line)}</tspan>`;
    })
    .join("");
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

function shouldCenter(canvas: CanvasSpec, content: ErizonContentOutput) {
  if (canvas.kind === "landscape" || canvas.kind === "story") {
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
    return "CAROUSEL";
  }

  if (content.canais_publicacao?.includes("linkedin") && !content.canais_publicacao.includes("instagram")) {
    return "LINKEDIN";
  }

  return pillarLabel(content.pilar);
}

function buildEyebrow(content: ErizonContentOutput, canvas: CanvasSpec) {
  const channelLabel = content.canais_publicacao?.includes("instagram")
    ? content.canais_publicacao.includes("linkedin")
      ? "INSTAGRAM + LINKEDIN"
      : "INSTAGRAM"
    : content.canais_publicacao?.includes("linkedin")
      ? "LINKEDIN"
      : canvas.kind === "story"
        ? "INSTAGRAM STORIES"
        : "SOCIAL POST";

  return `${channelLabel} // ${formatLabel(content.formato).toUpperCase()}`;
}

function getLeftX(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "landscape":
      return 60;
    case "story":
      return 78;
    case "portrait":
      return 76;
    default:
      return 88;
  }
}

function getHeroTop(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 280;
    case "portrait":
      return 230;
    case "square":
      return 210;
    default:
      return 220;
  }
}

function getBottomInset(canvas: CanvasSpec) {
  switch (canvas.kind) {
    case "story":
      return 110;
    case "portrait":
      return 86;
    case "square":
      return 80;
    default:
      return 78;
  }
}

function getTitleSize(canvas: CanvasSpec, lineCount: number) {
  if (canvas.kind === "story") {
    return lineCount > 3 ? 88 : 104;
  }

  if (canvas.kind === "portrait") {
    return lineCount > 3 ? 78 : 94;
  }

  if (canvas.kind === "landscape") {
    return lineCount > 3 ? 64 : 76;
  }

  return lineCount > 3 ? 70 : 84;
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
      return 28;
    case "landscape":
      return 30;
    default:
      return 26;
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

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
