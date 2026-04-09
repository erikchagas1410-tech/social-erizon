import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";
import satori from "satori";

import {
  buildCreativeEngine,
  type Composition,
  type CreativeEngine
} from "@/lib/creative-engine";
import { ELEMENTS } from "@/lib/creative-elements";
import {
  applyViralLayer,
  enhanceForViral,
  transformHook
} from "@/lib/viral-engine";
import { ErizonContentOutput } from "@/types/content";

type CanvasSpec = {
  width: number;
  height: number;
  kind: "square" | "portrait" | "story" | "landscape";
};

type CardTemplate = {
  bg: string;
  accent: string;
  text: string;
  tagBg: string;
  tagColor: string;
  tagBorder: string;
};

type SafeZone = {
  padding: number;
  width: number;
  height: number;
};

let fontCache: ArrayBuffer | null = null;

const FONT_SUPABASE_PATH = "data/inter-extrabold.woff";
const FONT_GOOGLE_CSS_URL =
  "https://fonts.googleapis.com/css?family=Inter:800&subset=latin";

const CARD_TEMPLATES: CardTemplate[] = [
  { bg: "linear-gradient(155deg,#0B0112 0%,#1C0035 100%)", accent: "#BC13FE", text: "#FFFFFF", tagBg: "rgba(188,19,254,0.18)", tagColor: "#BC13FE", tagBorder: "1px solid rgba(188,19,254,0.5)" },
  { bg: "linear-gradient(155deg,#001A22 0%,#003D55 100%)", accent: "#00F2FF", text: "#FFFFFF", tagBg: "rgba(0,242,255,0.14)", tagColor: "#00F2FF", tagBorder: "1px solid rgba(0,242,255,0.4)" },
  { bg: "linear-gradient(155deg,#120010 0%,#280028 100%)", accent: "#FF00E5", text: "#FFFFFF", tagBg: "rgba(255,0,229,0.14)", tagColor: "#FF00E5", tagBorder: "1px solid rgba(255,0,229,0.4)" }
];

const PILLAR_LABELS: Record<string, string> = {
  autoridade: "AUTORIDADE",
  educacao: "EDUCACAO",
  desejo: "DESEJO",
  conexao: "CONEXAO",
  prova: "PROVA",
  conversao_indireta: "CONVERSAO"
};

export async function generateErizonAsset(content: ErizonContentOutput) {
  const canvas = selectCanvasSpec(content);
  const templateIndex = chooseTemplateIndex(content);
  const template = CARD_TEMPLATES[templateIndex];

  try {
    const font = await loadFont();
    const svg = await satori(buildCardTree(content, canvas, template) as any, {
      width: canvas.width,
      height: canvas.height,
      fonts: [{ name: "Inter", data: font, weight: 800, style: "normal" }]
    });

    return sharp(Buffer.from(svg)).png().toBuffer();
  } catch (err) {
    console.error("[branded-image] Falha no Satori, usando fallback SVG:", err);
    const svg = buildFallbackSvg(content, canvas, template);
    return sharp(Buffer.from(svg)).png().toBuffer();
  }
}

export function buildCreativeMeta(content: ErizonContentOutput) {
  let engine = buildCreativeEngine(content);
  engine = applyViralLayer(content, engine);
  engine = enhanceForViral(engine, content);
  const primaryNumber = extractPrimaryNumber(content);

  return {
    mode: engine.mode,
    layout: engine.layout,
    composition: engine.composition,
    elements: engine.elements,
    viralBoost: engine.viralBoost,
    exaggeration: engine.exaggeration,
    patternBreak: engine.patternBreak,
    primaryNumber
  };
}

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;

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

  fontCache = await fetchFontFromGoogle();
  void cacheFontInSupabase(fontCache);
  return fontCache;
}

function loadLocalFont(): ArrayBuffer | null {
  const candidates = [
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.woff"),
    path.resolve(process.cwd(), "public/fonts/inter-extrabold.ttf")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return Uint8Array.from(fs.readFileSync(candidate)).buffer;
  }

  return null;
}

async function loadFontFromSupabase(): Promise<ArrayBuffer | null> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erizon-media";

  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${FONT_SUPABASE_PATH}`, {
      headers: { Authorization: `Bearer ${supabaseKey}` },
      cache: "force-cache"
    });
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function fetchFontFromGoogle(): Promise<ArrayBuffer> {
  const cssResponse = await fetch(FONT_GOOGLE_CSS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)"
    },
    cache: "force-cache"
  });
  if (!cssResponse.ok) throw new Error(`Falha ao carregar CSS da fonte: HTTP ${cssResponse.status}`);

  const css = await cssResponse.text();
  const match =
    css.match(/src:\s*url\(([^)]+\.woff[^2)][^)]*)\)/) ??
    css.match(/src:\s*url\(([^)]+)\)/);
  const fontUrl = match?.[1];
  if (!fontUrl) throw new Error("Nao foi possivel extrair a URL da fonte Inter.");

  const fontResponse = await fetch(fontUrl, { cache: "force-cache" });
  if (!fontResponse.ok) throw new Error(`Falha ao baixar a fonte: HTTP ${fontResponse.status}`);
  return await fontResponse.arrayBuffer();
}

async function cacheFontInSupabase(font: ArrayBuffer) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erizon-media";

  if (!supabaseUrl || !supabaseKey) return;

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
  } catch {}
}

function buildCardTree(
  content: ErizonContentOutput,
  canvas: CanvasSpec,
  template: CardTemplate
) {
  const safe = getSafeZone(canvas);
  let engine = buildCreativeEngine(content);
  engine = applyViralLayer(content, engine);
  engine = enhanceForViral(engine, content);
  const title = wrapWords(content.gancho, 24, 4);
  const sub = extractSubLines(content.ideia_central, 32, 2);
  const footer = truncate(content.cta, 80);
  const pillarLabel = PILLAR_LABELS[content.pilar] || content.pilar.toUpperCase();
  const primaryNumber = extractPrimaryNumber(content);
  const visualElements = limitElements(
    engine.elements.map((element) =>
      ELEMENTS[element]({ accent: template.accent, primaryNumber })
    )
  );
  const layoutChildren =
    renderLayout(content, engine, template, canvas, safe, title, sub, footer, pillarLabel) ||
    safeLayout(content, template, safe);

  return {
    type: "div",
    props: {
      style: {
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        position: "relative",
        fontFamily: "Inter",
        overflow: "hidden",
        background: template.bg
        // border: "1px solid red"
      },
      children: [
        renderBackground(engine.mode, template),
        ...visualElements,
        ...layoutChildren
      ]
    }
  };
}

function renderBackground(mode: CreativeEngine["mode"], template: CardTemplate) {
  if (mode === "editorial") {
    return {
      type: "div",
      props: {
        style: {
          position: "absolute",
          inset: "0",
          background: "#0A0A0A",
          zIndex: 0
        }
      }
    };
  }

  if (mode === "brutalist") {
    return {
      type: "div",
      props: {
        style: {
          position: "absolute",
          inset: "0",
          background: "#000000",
          zIndex: 0
        }
      }
    };
  }

  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        inset: "0",
        background: template.bg,
        zIndex: 0
      }
    }
  };
}

function renderLayout(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  title: string[],
  sub: string[],
  footer: string,
  pillarLabel: string
) {
  if (engine.viralBoost >= 2) {
    return layoutViral(content, engine, template, canvas, safe, footer, pillarLabel);
  }

  if (engine.layout === "viral-dashboard") {
    return layoutViralDashboard(content, engine, template, canvas, safe, title, sub, footer, pillarLabel);
  }

  if (engine.layout === "editorial-stack" || engine.layout === "split-clean") {
    return layoutEditorial(content, engine, template, canvas, safe, title, sub, footer, pillarLabel);
  }

  if (engine.layout === "number") {
    return layoutNumber(content, engine, template, canvas, safe, title, sub, footer, pillarLabel);
  }

  return layoutPoster(content, engine, template, canvas, safe, title, sub, footer, pillarLabel);
}

function layoutViral(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  footer: string,
  pillarLabel: string
) {
  const lines = transformHook(content);

  return [
    pillarTag(pillarLabel, template, safe),
    textContainer(
      lines.map((line) => ({
        type: "div",
        props: {
          style: {
            fontSize: `${clampFont(engine.typography.size + 20)}px`,
            fontWeight: 900,
            color: "#FFFFFF",
            marginBottom: "10px",
            lineHeight: engine.exaggeration ? "0.94" : "1.02",
            letterSpacing: engine.exaggeration ? "-2px" : "-1px"
          },
          children: line
        }
      })),
      safe,
      {
        transform: engine.patternBreak
          ? "translate(-50%, -50%) rotate(-2deg)"
          : "translate(-50%, -50%)"
      }
    ),
    footerRow(template, safe, footer)
  ];
}

function layoutViralDashboard(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  title: string[],
  sub: string[],
  footer: string,
  pillarLabel: string
) {
  const numberToken = extractPrimaryNumber(content);

  return [
    pillarTag(pillarLabel, template, safe),
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding,
          right: safe.padding,
          fontSize: `${canvas.kind === "story" ? 160 : 132}px`,
          fontWeight: "900",
          color: `${template.accent}33`,
          lineHeight: "0.9",
          letterSpacing: "-6px",
          zIndex: 0
        },
        children: numberToken
      }
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.16,
          left: safe.padding,
          width: `${safe.width * 0.52}px`,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          transform: engine.patternBreak ? "rotate(-1.5deg)" : "none",
          zIndex: 10
        },
        children: title.map((line) => ({
          type: "div",
          props: {
            style: {
              fontSize: `${clampFont(Math.max(48, resolveTitleSize(engine, canvas) - 10))}px`,
              color: "#FFFFFF",
              fontWeight: "900",
              lineHeight: "1.04",
              letterSpacing: "-1px"
            },
            children: line
          }
        }))
      }
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.18,
          right: safe.padding,
          width: `${safe.width * 0.28}px`,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 10
        },
        children: [
          buildStatCard("DADO", numberToken, template),
          buildStatCard("PILAR", pillarLabel.slice(0, 10), template),
          buildStatCard("SINAL", engine.viralBoost >= 3 ? "ALTO" : "MEDIO", template)
        ]
      }
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.72,
          left: safe.padding,
          width: `${safe.width * 0.48}px`,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          opacity: 0.82,
          zIndex: 10
        },
        children: sub.map((line) => ({
          type: "div",
          props: {
            style: {
              fontSize: `${canvas.kind === "story" ? 24 : 20}px`,
              color: "#D4D4D4",
              fontWeight: "600",
              lineHeight: "1.35"
            },
            children: line
          }
        }))
      }
    },
    footerRow(template, safe, footer)
  ];
}

function layoutPoster(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  title: string[],
  sub: string[],
  footer: string,
  pillarLabel: string
) {
  return [
    pillarTag(pillarLabel, template, safe),
    textContainer(
      title.map((line) => ({
        type: "div",
        props: {
          style: {
            fontSize: `${clampFont(resolveTitleSize(engine, canvas))}px`,
            fontWeight: `${engine.typography.weight}`,
            color: "#FFFFFF",
            lineHeight: engine.mode === "brutalist" ? "0.96" : "1.08",
            letterSpacing: engine.mode === "editorial" ? "1px" : "-1px"
          },
          children: engine.layout === "poster" ? line.toUpperCase() : line
        }
      })),
      safe,
      composeStyle(
        {
          top: "42%",
          left: engine.composition === "left" ? "46%" : "50%",
          width: `${safe.width * (engine.layout === "asymmetric" ? 0.72 : 0.8)}px`
        },
        engine.composition
      )
    ),
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.72,
          left: engine.layout === "asymmetric" ? `${safe.padding + safe.width * 0.48}px` : `${safe.padding}px`,
          width: `${safe.width * (engine.layout === "asymmetric" ? 0.38 : 0.44)}px`,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          opacity: 0.78,
          zIndex: 10
        },
        children: sub.map((line) => ({
          type: "div",
          props: {
            style: {
              fontSize: `${canvas.kind === "story" ? 26 : 22}px`,
              color: "#D1D1D1",
              fontWeight: "600",
              lineHeight: "1.32"
            },
            children: line
          }
        }))
      }
    },
    footerRow(template, safe, footer)
  ];
}

function layoutEditorial(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  title: string[],
  sub: string[],
  footer: string,
  pillarLabel: string
) {
  return [
    pillarTag(pillarLabel, template, safe),
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.18,
          left: safe.padding,
          width: `${safe.width * (engine.layout === "split-clean" ? 0.46 : 0.6)}px`,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          zIndex: 10
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: "20px",
                letterSpacing: "4px",
                color: template.accent,
                fontWeight: "700"
              },
              children: content.pilar.toUpperCase()
            }
          },
          ...title.map((line) => ({
            type: "div",
            props: {
              style: {
                fontSize: `${clampFont(resolveTitleSize(engine, canvas))}px`,
                color: "#FFFFFF",
                fontWeight: `${engine.typography.weight}`,
                lineHeight: "1.15"
              },
              children: line
            }
          }))
        ]
      }
    },
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.24,
          right: safe.padding,
          width: `${safe.width * (engine.layout === "split-clean" ? 0.28 : 0.22)}px`,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          opacity: 0.78,
          zIndex: 10
        },
        children: sub.map((line) => ({
          type: "div",
          props: {
            style: {
              fontSize: `${canvas.kind === "story" ? 24 : 20}px`,
              color: "#D5D5D5",
              fontWeight: "600",
              lineHeight: "1.35"
            },
            children: line
          }
        }))
      }
    },
    footerRow(template, safe, footer)
  ];
}

function layoutNumber(
  content: ErizonContentOutput,
  engine: CreativeEngine,
  template: CardTemplate,
  canvas: CanvasSpec,
  safe: SafeZone,
  title: string[],
  sub: string[],
  footer: string,
  pillarLabel: string
) {
  const numberToken = extractPrimaryNumber(content);

  return [
    pillarTag(pillarLabel, template, safe),
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding,
          right: safe.padding,
          fontSize: `${canvas.kind === "story" ? 220 : 180}px`,
          fontWeight: "900",
          color: `${template.accent}F2`,
          lineHeight: "0.9",
          letterSpacing: "-8px",
          zIndex: 0
        },
        children: numberToken
      }
    },
    textContainer(
      title.map((line) => ({
        type: "div",
        props: {
          style: {
            fontSize: `${clampFont(Math.max(46, resolveTitleSize(engine, canvas) - 18))}px`,
            color: "#FFFFFF",
            fontWeight: "900",
            lineHeight: "1.04",
            letterSpacing: "-1px"
          },
          children: line
        }
      })),
      safe,
      composeStyle(
        {
          top: "46%",
          left: "46%",
          width: `${safe.width * 0.72}px`
        },
        engine.composition
      )
    ),
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: safe.padding + safe.height * 0.76,
          left: safe.padding,
          width: `${safe.width * 0.42}px`,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 10
        },
        children: sub.map((line) => ({
          type: "div",
          props: {
            style: {
              fontSize: `${canvas.kind === "story" ? 24 : 20}px`,
              color: "rgba(255,255,255,0.78)",
              fontWeight: "600"
            },
            children: line
          }
        }))
      }
    },
    footerRow(template, safe, footer)
  ];
}

function pillarTag(label: string, template: CardTemplate, safe: SafeZone) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: `${safe.padding}px`,
        left: `${safe.padding}px`,
        color: template.accent,
        fontSize: safe.padding > 100 ? "16px" : "14px",
        letterSpacing: "4px",
        fontWeight: "700",
        zIndex: 10
      },
      children: label
    }
  };
}

function footerRow(template: CardTemplate, safe: SafeZone, footer: string) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        left: `${safe.padding}px`,
        right: `${safe.padding}px`,
        bottom: `${safe.padding}px`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              fontSize: safe.padding > 100 ? "16px" : "14px",
              opacity: 0.34,
              letterSpacing: "4px",
              color: "#FFFFFF"
            },
            children: "erizon.ai"
          }
        },
        {
          type: "div",
          props: {
            style: {
              fontSize: safe.padding > 100 ? "20px" : "18px",
              color: template.accent,
              fontWeight: "700"
            },
            children: footer
          }
        }
      ]
    }
  };
}

function buildStatCard(label: string, value: string, template: CardTemplate) {
  return {
    type: "div",
    props: {
      style: {
        background: withAlpha(template.accent, 0.1),
        border: `1px solid ${withAlpha(template.accent, 0.28)}`,
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        zIndex: 10
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              color: "rgba(255,255,255,0.5)",
              fontSize: "11px",
              letterSpacing: "3px"
            },
            children: label
          }
        },
        {
          type: "div",
          props: {
            style: {
              color: template.accent,
              fontSize: "26px",
              fontWeight: "800",
              lineHeight: "1"
            },
            children: value
          }
        }
      ]
    }
  };
}

function composeStyle(style: Record<string, unknown>, composition: Composition) {
  if (composition === "diagonal") {
    return { ...style, transform: "translate(-50%, -50%) rotate(-3deg)" };
  }

  if (composition === "chaotic") {
    return {
      ...style,
      transform: "translate(calc(-50% + 18px), calc(-50% - 12px))"
    };
  }

  if (composition === "right") {
    return { ...style, left: "54%" };
  }

  return style;
}

function resolveTitleSize(engine: CreativeEngine, canvas: CanvasSpec) {
  const base = canvas.kind === "story" ? engine.typography.size : Math.max(56, engine.typography.size - 8);
  if (engine.layout === "number") return Math.max(46, base - 14);
  return base;
}

function getSafeZone(canvas: CanvasSpec): SafeZone {
  const padding = canvas.kind === "story" ? 120 : 80;
  return {
    padding,
    width: canvas.width - padding * 2,
    height: canvas.height - padding * 2
  };
}

function textContainer(
  children: Array<Record<string, unknown>>,
  safe: SafeZone,
  styleOverrides: Record<string, unknown> = {}
) {
  return {
    type: "div",
    props: {
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: `${safe.width * 0.8}px`,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 10,
        ...styleOverrides
      },
      children
    }
  };
}

function clampFont(size: number) {
  return Math.max(42, Math.min(size, 120));
}

function limitElements(elements: Array<Record<string, unknown>>) {
  return elements.slice(0, 3);
}

function safeLayout(
  content: ErizonContentOutput,
  template: CardTemplate,
  safe: SafeZone
) {
  return [
    {
      type: "div",
      props: {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${safe.width * 0.82}px`,
          textAlign: "center",
          color: "#FFFFFF",
          fontSize: "64px",
          fontWeight: 800,
          zIndex: 10
        },
        children: content.gancho
      }
    },
    footerRow(template, safe, truncate(content.cta, 80))
  ];
}

function buildFallbackSvg(content: ErizonContentOutput, canvas: CanvasSpec, template: CardTemplate) {
  const title = wrapWords(content.gancho, getHookMaxChars(canvas, content), getHookMaxLines(canvas, content));
  const sub = extractSubLines(content.ideia_central, getSubMaxChars(canvas), 2);
  const padding = getPadding(canvas);
  const titleSize = getTitleSize(canvas, title.length, "hero");
  const footer = truncate(content.cta, canvas.kind === "landscape" ? 72 : 92);
  const titleSvg = title.map((line, index) => `<text x="${padding}" y="${padding + 120 + index * Math.round(titleSize * 1.02)}" fill="${template.text}" font-size="${titleSize}" font-family="Arial, Helvetica, sans-serif" font-weight="800">${escapeXml(line)}</text>`).join("");
  const subStart = padding + 120 + title.length * Math.round(titleSize * 1.02) + 48;
  const subSvg = sub.map((line, index) => `<text x="${padding}" y="${subStart + index * 34}" fill="rgba(255,255,255,0.64)" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(line)}</text>`).join("");

  return `
    <svg width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${template.bg.startsWith("#") ? template.bg : "#0B0112"}"/>
      <circle cx="${canvas.width - 80}" cy="80" r="${canvas.kind === "story" ? 170 : 110}" fill="${withAlpha(template.accent, 0.28)}"/>
      <rect x="0" y="0" width="${canvas.width}" height="8" fill="${template.accent}"/>
      <rect x="0" y="${canvas.height - 8}" width="${canvas.width}" height="8" fill="${template.accent}"/>
      <text x="${padding}" y="${padding}" fill="${template.tagColor}" font-size="18" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(PILLAR_LABELS[content.pilar] || content.pilar.toUpperCase())}</text>
      ${titleSvg}
      ${subSvg}
      <text x="${padding}" y="${canvas.height - padding}" fill="${template.accent}" font-size="20" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeXml(footer)}</text>
    </svg>
  `;
}

function chooseTemplateIndex(content: ErizonContentOutput) {
  const seed = `${content.gancho}|${content.pilar}|${content.formato}`;
  return seed.split("").reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % CARD_TEMPLATES.length, 0);
}

function extractPrimaryNumber(content: ErizonContentOutput) {
  const source = `${content.gancho} ${content.angulo} ${content.ideia_central} ${content.prompt_imagem}`;
  const match = source.match(/(\d+[.,]?\d*\s?%|\d+[.,]?\d*\s?x|\d+[.,]?\d*)/i);
  return match?.[1]?.replace(/\s+/g, "") ?? "3X";
}

function selectCanvasSpec(content: ErizonContentOutput): CanvasSpec {
  const channels = content.canais_publicacao ?? [];
  const onlyInstagram = channels.length > 0 && channels.every((channel) => channel === "instagram");
  const onlyLinkedIn = channels.length > 0 && channels.every((channel) => channel === "linkedin");

  if (looksLikeStory(content)) return { width: 1080, height: 1920, kind: "story" };
  if (content.formato === "carrossel" || content.formato === "comparacao" || content.formato === "checklist") return { width: 1080, height: 1080, kind: "square" };
  if (onlyLinkedIn && (content.formato === "analise" || content.formato === "insight_estrategico")) return { width: 1200, height: 627, kind: "landscape" };
  if (onlyLinkedIn) return { width: 1200, height: 1500, kind: "portrait" };
  if (onlyInstagram) return { width: 1080, height: 1350, kind: "portrait" };
  return { width: 1080, height: 1080, kind: "square" };
}

function looksLikeStory(content: ErizonContentOutput) {
  const base = `${content.formato} ${content.estrutura_criativo} ${content.prompt_imagem}`.toLowerCase();
  return base.includes("story") || base.includes("stories") || base.includes("9:16");
}

function getPadding(canvas: CanvasSpec) {
  if (canvas.kind === "story") return 80;
  if (canvas.kind === "portrait") return 74;
  if (canvas.kind === "landscape") return 56;
  return 68;
}

function getHookMaxChars(canvas: CanvasSpec, content: ErizonContentOutput) {
  if (content.formato === "analise" || content.formato === "insight_estrategico") {
    return canvas.kind === "landscape" ? 22 : 26;
  }
  if (canvas.kind === "story") return 22;
  if (canvas.kind === "portrait") return 26;
  if (canvas.kind === "landscape") return 28;
  return 28;
}

function getHookMaxLines(canvas: CanvasSpec, content: ErizonContentOutput) {
  if (content.formato === "analise" || content.formato === "insight_estrategico") return 3;
  if (canvas.kind === "story") return 5;
  if (canvas.kind === "landscape") return 3;
  return 4;
}

function getSubMaxChars(canvas: CanvasSpec) {
  if (canvas.kind === "story") return 30;
  if (canvas.kind === "landscape") return 36;
  return 34;
}

function getTitleSize(canvas: CanvasSpec, lineCount: number, layout: string) {
  if (layout === "stats" || layout === "checklist") return canvas.kind === "landscape" ? 48 : 60;
  if (canvas.kind === "story") return lineCount > 3 ? 60 : 74;
  if (canvas.kind === "portrait") return lineCount > 3 ? 62 : 80;
  if (canvas.kind === "landscape") return lineCount > 2 ? 48 : 60;
  return lineCount > 3 ? 60 : 76;
}

function wrapWords(text: string, maxChars: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (`${current} ${word}`.trim().length > maxChars) {
      if (current.trim()) lines.push(current.trim());
      current = word;
    } else current = `${current} ${word}`.trim();
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, maxLines);
}

function extractSubLines(text: string, maxChars: number, maxLines: number) {
  const clean = stripHtml(text);
  const firstSentence = clean.match(/^[^.!?]+[.!?]/)?.[0] || clean.slice(0, maxChars * maxLines);
  return wrapWords(firstSentence.trim(), maxChars, maxLines);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
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

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
