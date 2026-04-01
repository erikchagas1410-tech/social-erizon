import { ErizonContentOutput } from "@/types/content";

export const erizonBrand = {
  name: "Erizon",
  tone: "direto, inteligente, premium",
  colors: ["#0B0B0F", "#6C2BFF", "#00E5FF", "#1A1A2E"],
  style: "minimalista, tecnologico, alto contraste",
  rules: [
    "A marca fala de decisao e dinheiro, nao de marketing generico.",
    "Toda criacao precisa transmitir controle, clareza, precisao e inteligencia.",
    "Sem hype vazio, sem frases genéricas, sem poluicao visual.",
    "Texto forte como elemento principal e uma ideia central por vez.",
    "Fundo escuro, glow sutil em roxo, azul eletrico e ciano."
  ],
  narrativeCore: [
    "dinheiro sendo perdido",
    "dinheiro sendo ganho",
    "decisoes erradas",
    "decisoes inteligentes",
    "escala",
    "risco",
    "oportunidade",
    "clareza operacional"
  ],
  creativeChecks: [
    "Isso parece conteudo de marca premium?",
    "Isso transmite inteligencia?",
    "Isso fala de decisao ou dinheiro?",
    "Isso esta visualmente limpo e forte?",
    "Isso tem cara de Erizon?",
    "Isso e diferente do comum?"
  ]
} as const;

export const sampleErizonPost: ErizonContentOutput = {
  titulo_interno: "decisao_errada_escala_prejuizo_oculto",
  objetivo:
    "Mostrar que escalar sem leitura financeira transforma uma campanha aparentemente boa em perda acumulada.",
  pilar: "autoridade",
  formato: "carrossel",
  ideia_central:
    "O problema de muitas campanhas nao e falta de verba. E leitura errada sobre onde o lucro esta vazando.",
  angulo:
    "Verdade desconfortavel para gestores que aumentam investimento sem enxergar deterioracao de margem.",
  gancho: "Essa campanha parece boa. Mas pode estar te fazendo perder dinheiro.",
  estrutura_criativo:
    "Slide 1 gancho forte. Slide 2 mostra o erro de leitura. Slide 3 explica o impacto no lucro. Slide 4 mostra a decisao correta. Slide 5 fecha com visao de controle e escala.",
  texto_criativo:
    "Nao e porque o volume subiu que a operacao melhorou. Quando CAC, margem e previsao saem do radar, a campanha continua rodando enquanto o lucro desaparece. Escalar sem leitura nao acelera crescimento. Acelera erro.",
  legenda:
    "Tem campanha que entrega numero bonito e resultado ruim. O problema nao esta no trafego. Esta na decisao. Quem enxerga margem, risco e previsao cedo protege caixa e escala melhor.",
  cta: "Salve este post para revisar antes de aumentar verba novamente.",
  prompt_imagem:
    "Instagram carousel cover for Erizon, deep black graphite background, subtle grid, neon purple and electric blue glow, minimal futuristic layout, central bold typography reading 'Essa campanha parece boa. Mas pode estar te fazendo perder dinheiro.', high contrast, premium SaaS intelligence aesthetic, strong negative space, precise composition, no stock imagery, no clutter.",
  alt_text:
    "Capa de carrossel da Erizon com fundo escuro e frase central sobre campanha aparentemente boa que gera perda de dinheiro.",
  hashtags: [
    "erizon",
    "gestaodetrafego",
    "margem",
    "decisao",
    "performance",
    "inteligenciaoperacional"
  ],
  sugestao_horario: "10:30",
  justificativa:
    "O post reforca a promessa central da marca: revelar o que parece saudavel mas esta destruindo resultado financeiro.",
  hipotese_performance:
    "Tende a gerar salvamentos e compartilhamentos por tocar em um erro comum com linguagem premium, direta e orientada a dinheiro."
};
