import fs from "node:fs";
import path from "node:path";

import React from "react";
import sharp from "sharp";
import satori from "satori";

import { ErizonContentOutput } from "@/types/content";

let fontCache: ArrayBuffer | null = null;
let logoCache: string | null = null;

const FONT_GOOGLE_CSS_URL =
  "https://fonts.googleapis.com/css?family=Inter:800&subset=latin";

export async function generateErizonAsset(content: ErizonContentOutput) {
  const font = await loadFont();
  const logoDataUrl = loadLogoDataUrl();

  const accent = pickAccent(content.pilar);
  const hookLines = wrapText(content.gancho, 22, 4);
  const subLines = wrapText(content.ideia_central, 34, 3);

  const svg = await satori(
    (
      <div
        style={{
          width: "1080px",
          height: "1080px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top right, rgba(108,43,255,0.22), transparent 28%), linear-gradient(160deg, #07080f 0%, #0b1021 55%, #05070d 100%)",
          color: "#edf2ff",
          padding: "72px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Inter"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            opacity: 0.42
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            background: `radial-gradient(circle, ${withAlpha(accent, 0.35)} 0%, transparent 68%)`
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "72px",
            right: "72px",
            top: "72px",
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center"
            }}
          >
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                width={42}
                height={42}
                style={{ borderRadius: "10px" }}
              />
            ) : null}

            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  letterSpacing: "0.36em",
                  color: accent,
                  fontWeight: 800
                }}
              >
                ERIZON
              </div>
              <div
                style={{
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  color: "rgba(237,242,255,0.55)"
                }}
              >
                SOCIAL AI
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: `1px solid ${withAlpha(accent, 0.4)}`,
              background: withAlpha(accent, 0.12),
              color: accent,
              fontSize: "14px",
              letterSpacing: "0.22em",
              fontWeight: 800
            }}
          >
            {pillarLabel(content.pilar)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            position: "relative",
            zIndex: 1,
            paddingTop: "40px",
            flex: 1,
            justifyContent: "center"
          }}
        >
          {hookLines.map((line) => (
            <div
              key={line}
              style={{
                fontSize: hookLines.length > 2 ? "82px" : "98px",
                lineHeight: 0.98,
                letterSpacing: "-0.06em",
                fontWeight: 800,
                maxWidth: "880px"
              }}
            >
              {line}
            </div>
          ))}

          <div
            style={{
              width: "88px",
              height: "3px",
              background: accent,
              marginTop: "20px",
              marginBottom: "14px"
            }}
          />

          {subLines.map((line) => (
            <div
              key={line}
              style={{
                fontSize: "28px",
                lineHeight: 1.3,
                color: "rgba(237,242,255,0.72)",
                fontWeight: 700,
                maxWidth: "860px"
              }}
            >
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            position: "relative",
            zIndex: 1
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "720px"
            }}
          >
            <div
              style={{
                fontSize: "16px",
                letterSpacing: "0.24em",
                color: "rgba(237,242,255,0.45)"
              }}
            >
              DECISAO • CLAREZA • LUCRO
            </div>
            <div
              style={{
                fontSize: "22px",
                lineHeight: 1.3,
                color: "rgba(237,242,255,0.88)",
                fontWeight: 700
              }}
            >
              {truncate(content.cta, 96)}
            </div>
          </div>

          <div
            style={{
              fontSize: "18px",
              letterSpacing: "0.24em",
              color: accent,
              fontWeight: 800
            }}
          >
            ERIZON.AI
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
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
}

async function loadFont() {
  if (fontCache) {
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
  return fontCache;
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
  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
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

function pickAccent(pillar: ErizonContentOutput["pilar"]) {
  switch (pillar) {
    case "autoridade":
      return "#6C2BFF";
    case "educacao":
      return "#00E5FF";
    case "desejo":
      return "#7C3AED";
    case "conexao":
      return "#38BDF8";
    case "prova":
      return "#22D3EE";
    case "conversao_indireta":
      return "#8B5CF6";
    default:
      return "#6C2BFF";
  }
}

function pillarLabel(pillar: ErizonContentOutput["pilar"]) {
  return pillar.replaceAll("_", " ").toUpperCase();
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
