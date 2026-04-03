import fs from "node:fs";
import path from "node:path";

import sharp from "sharp";
import satori from "satori";

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

let fontCache: ArrayBuffer | null = null;

const FONT_SUPABASE_PATH = "data/inter-extrabold.woff";
const FONT_GOOGLE_CSS_URL =
  "https://fonts.googleapis.com/css?family=Inter:800&subset=latin";

const CARD_TEMPLATES: CardTemplate[] = [
  { bg: "linear-gradient(155deg,#0B0112 0%,#1C0035 100%)", accent: "#BC13FE", text: "#FFFFFF", tagBg: "rgba(188,19,254,0.18)", tagColor: "#BC13FE", tagBorder: "1px solid rgba(188,19,254,0.5)" },
  { bg: "linear-gradient(155deg,#001A22 0%,#003D55 100%)", accent: "#00F2FF", text: "#FFFFFF", tagBg: "rgba(0,242,255,0.14)", tagColor: "#00F2FF", tagBorder: "1px solid rgba(0,242,255,0.4)" },
  { bg: "linear-gradient(155deg,#120010 0%,#280028 100%)", accent: "#FF00E5", text: "#FFFFFF", tagBg: "rgba(255,0,229,0.14)", tagColor: "#FF00E5", tagBorder: "1px solid rgba(255,0,229,0.4)" },
  { bg: "linear-gradient(155deg,#001208 0%,#00280F 100%)", accent: "#00FF88", text: "#FFFFFF", tagBg: "rgba(0,255,136,0.12)", tagColor: "#00FF88", tagBorder: "1px solid rgba(0,255,136,0.35)" },
  { bg: "linear-gradient(155deg,#140800 0%,#2D1500 100%)", accent: "#FFB800", text: "#FFFFFF", tagBg: "rgba(255,184,0,0.14)", tagColor: "#FFB800", tagBorder: "1px solid rgba(255,184,0,0.4)" },
  { bg: "linear-gradient(155deg,#140008 0%,#280018 100%)", accent: "#FF3366", text: "#FFFFFF", tagBg: "rgba(255,51,102,0.14)", tagColor: "#FF3366", tagBorder: "1px solid rgba(255,51,102,0.4)" },
  { bg: "linear-gradient(155deg,#080D1E 0%,#101A3A 100%)", accent: "#7B9FFF", text: "#FFFFFF", tagBg: "rgba(123,159,255,0.14)", tagColor: "#7B9FFF", tagBorder: "1px solid rgba(123,159,255,0.4)" },
  { bg: "#000000", accent: "#FFFFFF", text: "#FFFFFF", tagBg: "rgba(255,255,255,0.08)", tagColor: "rgba(255,255,255,0.9)", tagBorder: "1px solid rgba(255,255,255,0.25)" }
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
    const svg = await satori(buildCardTree(content, canvas, template, templateIndex) as any, {
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
  template: CardTemplate,
  templateIndex: number
) {
  const title = wrapWords(content.gancho, getHookMaxChars(canvas, content), getHookMaxLines(canvas, content));
  const sub = extractSubLines(content.ideia_central, getSubMaxChars(canvas), 2);
  const footer = truncate(content.cta, canvas.kind === "landscape" ? 72 : 92);
  const pillarLabel = PILLAR_LABELS[content.pilar] || content.pilar.toUpperCase();
  const padding = getPadding(canvas);
  const layout = pickLayout(content, templateIndex);
  const titleSize = getTitleSize(canvas, title.length, layout);
  const bodySize = canvas.kind === "story" ? 28 : canvas.kind === "landscape" ? 22 : 26;

  const children =
    layout === "stats"
      ? buildStatsLayout(content, title, pillarLabel, template, canvas)
      : layout === "checklist"
        ? buildChecklistLayout(content, title, pillarLabel, template, canvas)
        : layout === "left"
          ? buildLeftLayout(title, sub, pillarLabel, footer, template, canvas, titleSize, bodySize)
          : layout === "center"
            ? buildCenterLayout(title, sub, pillarLabel, footer, template, canvas, titleSize, bodySize)
            : buildHeroLayout(title, sub, pillarLabel, footer, template, canvas, titleSize, bodySize);

  return {
    type: "div",
    props: {
      style: {
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        display: "flex",
        flexDirection: "column",
        background: template.bg,
        padding: `${padding}px`,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden"
      },
      children: [
        // Grid futurista
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: "0",
              display: "flex",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
              backgroundSize: `${canvas.kind === "story" ? 72 : 56}px ${canvas.kind === "story" ? 72 : 56}px`,
              opacity: 0.85
            }
          }
        },
        // Glow externo superior direito
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: canvas.kind === "story" ? "-180px" : "-120px",
              right: canvas.kind === "landscape" ? "-130px" : "-90px",
              width: canvas.kind === "story" ? "520px" : "380px",
              height: canvas.kind === "story" ? "520px" : "380px",
              borderRadius: "999px",
              background: withAlpha(template.accent, 0.10),
              display: "flex"
            }
          }
        },
        // Circulo neon principal superior direito
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: canvas.kind === "story" ? "-110px" : "-65px",
              right: canvas.kind === "landscape" ? "-70px" : "-35px",
              width: canvas.kind === "story" ? "320px" : "260px",
              height: canvas.kind === "story" ? "320px" : "260px",
              borderRadius: "999px",
              background: withAlpha(template.accent, 0.40),
              display: "flex"
            }
          }
        },
        // Anel externo (borda neon)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: canvas.kind === "story" ? "-130px" : "-80px",
              right: canvas.kind === "landscape" ? "-85px" : "-50px",
              width: canvas.kind === "story" ? "360px" : "300px",
              height: canvas.kind === "story" ? "360px" : "300px",
              borderRadius: "999px",
              border: `2px solid ${withAlpha(template.accent, 0.30)}`,
              display: "flex"
            }
          }
        },
        // Circulo inferior esquerdo
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              left: canvas.kind === "landscape" ? "60%" : "-80px",
              bottom: canvas.kind === "story" ? "-130px" : "-100px",
              width: canvas.kind === "story" ? "380px" : "290px",
              height: canvas.kind === "story" ? "380px" : "290px",
              borderRadius: "999px",
              background: withAlpha(template.accent, 0.16),
              display: "flex"
            }
          }
        },
        // Linha horizontal scan-line futurista
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: canvas.kind === "story" ? "38%" : "36%",
              left: "0",
              right: "0",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${withAlpha(template.accent, 0.25)}, transparent)`,
              display: "flex"
            }
          }
        },
        // Bracket canto superior esquerdo
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: `${padding - 10}px`,
              left: `${padding - 10}px`,
              width: "32px",
              height: "32px",
              borderTop: `2px solid ${withAlpha(template.accent, 0.55)}`,
              borderLeft: `2px solid ${withAlpha(template.accent, 0.55)}`,
              display: "flex"
            }
          }
        },
        // Bracket canto inferior direito
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: `${padding - 10}px`,
              right: `${padding - 10}px`,
              width: "32px",
              height: "32px",
              borderBottom: `2px solid ${withAlpha(template.accent, 0.55)}`,
              borderRight: `2px solid ${withAlpha(template.accent, 0.55)}`,
              display: "flex"
            }
          }
        },
        ...children
      ]
    }
  };
}

function buildHeroLayout(title: string[], sub: string[], pillarLabel: string, footer: string, template: CardTemplate, canvas: CanvasSpec, titleSize: number, bodySize: number) {
  return [
    edgeBars(template, canvas),
    { type: "div", props: { style: { display: "flex", alignItems: "center", marginBottom: canvas.kind === "story" ? 54 : 40 }, children: [badge(pillarLabel, template, canvas)] } },
    {
      type: "div",
      props: {
        style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" },
        children: [
          ...title.map((line) => textLine(line, template.text, titleSize)),
          ...(sub.length ? [accentRule(template.accent, canvas), ...sub.map((line) => textLine(line, "rgba(255,255,255,0.64)", bodySize))] : [])
        ]
      }
    },
    footerRow(template, footer, canvas)
  ];
}

function buildLeftLayout(title: string[], sub: string[], pillarLabel: string, footer: string, template: CardTemplate, canvas: CanvasSpec, titleSize: number, bodySize: number) {
  return [
    { type: "div", props: { style: { position: "absolute", left: "0", top: "0", bottom: "0", width: canvas.kind === "story" ? "16px" : "12px", background: template.accent, display: "flex" } } },
    {
      type: "div",
      props: {
        style: { display: "flex", alignItems: "center", gap: "14px", marginBottom: canvas.kind === "story" ? 46 : 36 },
        children: [
          { type: "div", props: { style: { width: "3px", height: "26px", background: template.accent, display: "flex" } } },
          { type: "div", props: { style: { color: template.tagColor, fontSize: `${canvas.kind === "story" ? 20 : 17}px`, fontWeight: "700", letterSpacing: "4px" }, children: pillarLabel } }
        ]
      }
    },
    {
      type: "div",
      props: {
        style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px" },
        children: [
          ...title.map((line, index) => textLine(line, index === 0 ? template.text : "rgba(255,255,255,0.88)", index === 0 ? titleSize + 2 : titleSize - 8)),
          ...(sub.length ? [accentRule(template.accent, canvas), ...sub.map((line) => textLine(line, "rgba(255,255,255,0.62)", bodySize - 2))] : [])
        ]
      }
    },
    { type: "div", props: { style: { height: "2px", background: `linear-gradient(90deg,${template.accent},transparent)`, marginBottom: "22px", display: "flex" } } },
    footerRow(template, footer, canvas)
  ];
}

function buildCenterLayout(title: string[], sub: string[], pillarLabel: string, footer: string, template: CardTemplate, canvas: CanvasSpec, titleSize: number, bodySize: number) {
  const centeredTitle = title.length > 2 ? titleSize - 8 : titleSize;
  return [
    cornerBox(template.accent, 40, 40, 40, 3, 0.12),
    cornerBox(template.accent, 80, 50, 90, 4, 0.24, true),
    cornerBox(template.accent, 60, 50, 70, 4, 0.18, false, true),
    {
      type: "div",
      props: {
        style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px" },
        children: [
          pillBadge(pillarLabel, template, canvas),
          ...title.map((line) => centeredTextLine(line, template.text, centeredTitle)),
          ...(sub.length ? [accentRule(template.accent, canvas), ...sub.map((line) => centeredTextLine(line, "rgba(255,255,255,0.62)", bodySize - 2))] : [])
        ]
      }
    },
    centeredFooter(template, footer, canvas)
  ];
}

function buildStatsLayout(content: ErizonContentOutput, title: string[], pillarLabel: string, template: CardTemplate, canvas: CanvasSpec) {
  const stats = [
    { value: pillarLabel.slice(0, 8), label: "PILAR" },
    { value: formatLabel(content.formato).slice(0, 10).toUpperCase(), label: "FORMATO" },
    { value: (content.sugestao_horario || "18:00").slice(0, 5), label: "HORARIO" }
  ];

  return [
    edgeBars(template, canvas),
    { type: "div", props: { style: { display: "flex", alignItems: "center", marginBottom: "32px" }, children: [badge(pillarLabel, template, canvas)] } },
    { type: "div", props: { style: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }, children: title.map((line) => textLine(line, template.text, canvas.kind === "landscape" ? 50 : 62)) } },
    { type: "div", props: { style: { height: "2px", background: `linear-gradient(90deg,${template.accent},transparent)`, marginBottom: "28px", display: "flex" } } },
    {
      type: "div",
      props: {
        style: { display: "flex", flex: 1, gap: "18px", alignItems: "stretch" },
        children: stats.map((stat) => ({
          type: "div",
          props: {
            style: {
              flex: 1,
              background: template.tagBg,
              border: template.tagBorder,
              borderRadius: "12px",
              padding: "18px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            },
            children: [
              centeredTextLine(stat.value, template.accent, canvas.kind === "landscape" ? 44 : 58),
              centeredTextLine(stat.label, "rgba(255,255,255,0.55)", 18)
            ]
          }
        }))
      }
    },
    footerRow(template, truncate(content.cta, 60), canvas)
  ];
}

function buildChecklistLayout(content: ErizonContentOutput, title: string[], pillarLabel: string, template: CardTemplate, canvas: CanvasSpec) {
  const items = extractChecklistItems(content.ideia_central);

  return [
    { type: "div", props: { style: { position: "absolute", left: "0", top: "0", bottom: "0", width: canvas.kind === "story" ? "16px" : "10px", background: `linear-gradient(180deg,${template.accent},transparent,${template.accent})`, display: "flex" } } },
    {
      type: "div",
      props: {
        style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" },
        children: [
          { type: "div", props: { style: { width: "3px", height: "22px", background: template.accent, display: "flex" } } },
          { type: "div", props: { style: { color: template.tagColor, fontSize: "16px", fontWeight: "700", letterSpacing: "4px" }, children: pillarLabel } }
        ]
      }
    },
    { type: "div", props: { style: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }, children: title.map((line) => textLine(line, template.text, canvas.kind === "landscape" ? 48 : 60)) } },
    accentRule(template.accent, canvas),
    {
      type: "div",
      props: {
        style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "18px" },
        children: items.map((item) => ({
          type: "div",
          props: {
            style: { display: "flex", alignItems: "flex-start", gap: "14px" },
            children: [
              { type: "div", props: { style: { width: "8px", height: "8px", background: template.accent, borderRadius: "2px", marginTop: "10px", flexShrink: 0, display: "flex" } } },
              { type: "div", props: { style: { color: "rgba(255,255,255,0.82)", fontSize: `${canvas.kind === "landscape" ? 22 : 26}px`, fontWeight: "800", lineHeight: "1.3" }, children: item } }
            ]
          }
        }))
      }
    },
    footerRow(template, truncate(content.cta, 66), canvas)
  ];
}

function edgeBars(template: CardTemplate, canvas: CanvasSpec) {
  const h = canvas.kind === "story" ? "14px" : "10px";
  return {
    type: "div",
    props: {
      children: [
        { type: "div", props: { style: { position: "absolute", top: "0", left: "0", right: "0", height: h, background: `linear-gradient(90deg,transparent 0%,${template.accent} 40%,${template.accent} 60%,transparent 100%)`, display: "flex" } } },
        { type: "div", props: { style: { position: "absolute", top: "0", left: "0", right: "0", height: "2px", background: `linear-gradient(90deg,transparent,${withAlpha(template.accent, 0.5)},transparent)`, display: "flex" } } },
        { type: "div", props: { style: { position: "absolute", bottom: "0", left: "0", right: "0", height: h, background: `linear-gradient(90deg,${template.accent} 0%,transparent 40%,transparent 60%,${template.accent} 100%)`, display: "flex" } } },
        { type: "div", props: { style: { position: "absolute", bottom: "0", left: "0", right: "0", height: "2px", background: `linear-gradient(90deg,${withAlpha(template.accent, 0.5)},transparent,${withAlpha(template.accent, 0.5)})`, display: "flex" } } }
      ]
    }
  };
}

function badge(label: string, template: CardTemplate, canvas: CanvasSpec) {
  const fs = canvas.kind === "story" ? 22 : 18;
  const pad = canvas.kind === "story" ? "9px 24px" : "7px 20px";
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column" },
      children: [
        {
          type: "div",
          props: {
            style: { background: template.tagBg, border: `1px solid ${withAlpha(template.accent, 0.65)}`, borderRadius: "6px", padding: pad, color: template.tagColor, fontSize: `${fs}px`, fontWeight: "700", letterSpacing: "3.5px", display: "flex" },
            children: label
          }
        }
      ]
    }
  };
}

function pillBadge(label: string, template: CardTemplate, canvas: CanvasSpec) {
  const fs = canvas.kind === "story" ? 20 : 18;
  const pad = canvas.kind === "story" ? "11px 28px" : "9px 26px";
  return {
    type: "div",
    props: {
      style: { background: template.tagBg, border: `1px solid ${withAlpha(template.accent, 0.65)}`, borderRadius: "999px", padding: pad, color: template.tagColor, fontSize: `${fs}px`, fontWeight: "700", letterSpacing: "4px", display: "flex" },
      children: label
    }
  };
}

function accentRule(accent: string, canvas: CanvasSpec) {
  const w = canvas.kind === "story" ? 100 : 72;
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: "4px", marginTop: "20px", marginBottom: "18px" },
      children: [
        { type: "div", props: { style: { height: "3px", width: `${w}px`, background: accent, display: "flex" } } },
        { type: "div", props: { style: { height: "1px", width: `${Math.round(w * 0.55)}px`, background: withAlpha(accent, 0.45), display: "flex" } } }
      ]
    }
  };
}

function textLine(line: string, color: string, fontSize: number) {
  return { type: "div", props: { style: { color, fontSize: `${fontSize}px`, fontWeight: "800", lineHeight: "1.22", letterSpacing: "-0.5px" }, children: line } };
}

function centeredTextLine(line: string, color: string, fontSize: number) {
  return { type: "div", props: { style: { color, fontSize: `${fontSize}px`, fontWeight: "800", lineHeight: "1.22", letterSpacing: "-0.5px", textAlign: "center", justifyContent: "center", display: "flex" }, children: line } };
}

function footerRow(template: CardTemplate, footer: string, canvas: CanvasSpec) {
  return { type: "div", props: { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: canvas.kind === "story" ? "34px" : "24px" }, children: [{ type: "div", props: { style: { color: "rgba(255,255,255,0.3)", fontSize: `${canvas.kind === "story" ? 20 : 18}px`, letterSpacing: "5px" }, children: "erizon.ai" } }, { type: "div", props: { style: { color: template.accent, fontSize: `${canvas.kind === "story" ? 22 : 20}px`, fontWeight: "700", letterSpacing: "3px" }, children: footer } }] } };
}

function centeredFooter(template: CardTemplate, footer: string, canvas: CanvasSpec) {
  return { type: "div", props: { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }, children: [{ type: "div", props: { style: { height: "2px", width: "48px", background: template.accent, display: "flex" } } }, { type: "div", props: { style: { color: "rgba(255,255,255,0.4)", fontSize: `${canvas.kind === "story" ? 22 : 20}px`, letterSpacing: "5px" }, children: footer } }, { type: "div", props: { style: { height: "2px", width: "48px", background: template.accent, display: "flex" } } }] } };
}

function cornerBox(accent: string, size: number, top?: number, offset?: number, borderWidth = 4, opacity = 0.2, right = false, bottom = false) {
  return { type: "div", props: { style: { position: "absolute", width: `${size}px`, height: `${size}px`, border: `${borderWidth}px solid ${accent}`, borderRadius: "8px", opacity, display: "flex", ...(right ? { right: `${offset ?? 50}px` } : { left: `${offset ?? 50}px` }), ...(bottom ? { bottom: `${top ?? 50}px` } : { top: `${top ?? 50}px` }) } } };
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

function pickLayout(content: ErizonContentOutput, templateIndex: number) {
  if (["analise", "insight_estrategico"].includes(content.formato)) return "stats";
  if (["checklist", "comparacao", "mini_aula"].includes(content.formato)) return "checklist";
  return ["hero", "left", "center"][templateIndex % 3] as "hero" | "left" | "center";
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
  if (content.formato === "analise" || content.formato === "insight_estrategico") return canvas.kind === "landscape" ? 22 : 26;
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

function extractChecklistItems(text: string) {
  const clean = stripHtml(text);
  const sentencePieces = clean.split(/[.!?]\s+/).map((piece) => piece.trim()).filter(Boolean);
  const items = sentencePieces.slice(0, 3).map((item) => truncate(item, 72));
  if (items.length >= 2) return items;
  const words = clean.split(/\s+/).filter(Boolean);
  return [truncate(words.slice(0, 8).join(" "), 72), truncate(words.slice(8, 18).join(" "), 72), truncate(words.slice(18, 30).join(" "), 72)].filter((item) => item.length > 6);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function formatLabel(format: ErizonContentOutput["formato"]) {
  return format.replaceAll("_", " ");
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
