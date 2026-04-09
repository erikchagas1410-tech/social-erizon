import { ErizonContentOutput } from "@/types/content";

export type Mode = "brutalist" | "editorial" | "tech";
export type Layout =
  | "poster"
  | "number"
  | "asymmetric"
  | "editorial-stack"
  | "split-clean"
  | "viral-dashboard"
  | "dashboard"
  | "hero";
export type Composition =
  | "center"
  | "left"
  | "right"
  | "diagonal"
  | "chaotic";
export type ElementName =
  | "block"
  | "diagonalLine"
  | "grid"
  | "glow"
  | "noise"
  | "lines"
  | "minimal"
  | "bigNumber"
  | "warningStripe"
  | "glitchBar";

export type CreativeEngine = {
  mode: Mode;
  layout: Layout;
  composition: Composition;
  elements: ElementName[];
  typography: {
    size: number;
    weight: number;
  };
  viralBoost: number;
  exaggeration: boolean;
  patternBreak: boolean;
};

type CreativeScore = {
  brutalist: number;
  editorial: number;
  tech: number;
};

export function buildCreativeEngine(
  content: ErizonContentOutput
): CreativeEngine {
  const score = scoreCreative(content);
  const mode = pickMode(score);

  return {
    mode,
    layout: pickLayout(mode, content),
    composition: pickComposition(mode, content),
    elements: pickElements(mode),
    typography: getTypography(mode),
    viralBoost: 0,
    exaggeration: false,
    patternBreak: false
  };
}

function scoreCreative(content: ErizonContentOutput): CreativeScore {
  const text = `${content.gancho} ${content.angulo}`.toLowerCase();

  return {
    brutalist:
      (text.includes("erro") ? 3 : 0) +
      (text.includes("perdendo") ? 2 : 0) +
      (text.includes("alerta") ? 2 : 0),
    editorial:
      (text.includes("dados") ? 3 : 0) +
      (text.includes("analise") ? 2 : 0),
    tech: 1
  };
}

function pickMode(score: CreativeScore): Mode {
  return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0] as Mode;
}

function pickLayout(mode: Mode, content: ErizonContentOutput): Layout {
  const seed = `${content.gancho}|${content.angulo}|${mode}`;
  const text = `${content.gancho} ${content.angulo} ${content.ideia_central}`.toLowerCase();

  if (mode === "brutalist") {
    return pickSeeded(seed, ["poster", "number", "asymmetric"]);
  }

  if (mode === "editorial") {
    if (content.pilar === "autoridade" && (text.includes("dados") || text.includes("analise"))) {
      return "viral-dashboard";
    }
    return pickSeeded(seed, ["editorial-stack", "split-clean"]);
  }

  return pickSeeded(seed, ["dashboard", "hero"]);
}

function pickComposition(mode: Mode, content: ErizonContentOutput): Composition {
  const seed = `${content.angulo}|${content.prompt_imagem}|${mode}`;

  if (mode === "brutalist") {
    return pickSeeded(seed, ["chaotic", "diagonal"]);
  }

  if (mode === "editorial") {
    return pickSeeded(seed, ["left", "right"]);
  }

  return pickSeeded(seed, ["center", "left"]);
}

function pickElements(mode: Mode): ElementName[] {
  if (mode === "brutalist") return ["block", "diagonalLine"];
  if (mode === "editorial") return ["lines", "minimal"];
  return ["grid", "glow", "noise"];
}

function getTypography(mode: Mode) {
  if (mode === "brutalist") return { size: 110, weight: 900 };
  if (mode === "editorial") return { size: 64, weight: 600 };
  return { size: 72, weight: 800 };
}

function pickSeeded<T extends string>(seed: string, options: readonly T[]): T {
  const hash = seed
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

  return options[hash % options.length];
}
