import { CreativeEngine } from "@/lib/creative-engine";
import { ErizonContentOutput } from "@/types/content";

export function applyViralLayer(
  content: ErizonContentOutput,
  engine: CreativeEngine
): CreativeEngine {
  const text = content.gancho.toLowerCase();

  const triggers = {
    negative: text.includes("erro") || text.includes("perdendo"),
    curiosity: text.includes("ninguem") || text.includes("segredo"),
    authority: text.includes("mil") || text.includes("dados")
  };

  const viralBoost =
    (triggers.negative ? 2 : 0) +
    (triggers.curiosity ? 2 : 0) +
    (triggers.authority ? 1 : 0);

  return {
    ...engine,
    viralBoost,
    exaggeration: viralBoost >= 3,
    patternBreak: viralBoost >= 2
  };
}

export function enhanceForViral(
  engine: CreativeEngine,
  content: ErizonContentOutput
): CreativeEngine {
  const text = content.gancho.toLowerCase();
  const elements = [...engine.elements];

  if (text.includes("%") && !elements.includes("bigNumber")) {
    elements.push("bigNumber");
  }

  if ((text.includes("erro") || text.includes("alerta")) && !elements.includes("warningStripe")) {
    elements.push("warningStripe");
  }

  if (engine.mode === "tech" && !elements.includes("glitchBar")) {
    elements.push("glitchBar");
  }

  return {
    ...engine,
    elements
  };
}

export function transformHook(content: ErizonContentOutput) {
  let hook = content.gancho;

  if (hook.length > 40) {
    hook = hook.split("?")[0];
  }

  const words = hook.split(" ").filter(Boolean);
  const middle = Math.ceil(words.length / 2);

  return [
    words.slice(0, middle).join(" "),
    words.slice(middle).join(" ")
  ].filter(Boolean);
}
