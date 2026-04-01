export type ContentPillar =
  | "autoridade"
  | "educacao"
  | "desejo"
  | "conexao"
  | "prova"
  | "conversao_indireta";

export type ContentFormat =
  | "carrossel"
  | "post_estatico"
  | "frase_impacto"
  | "comparacao"
  | "analise"
  | "checklist"
  | "mini_aula"
  | "provocacao"
  | "insight_estrategico"
  | "post_de_decisao";

export type PublicationChannel = "linkedin" | "instagram";

export type ErizonContentOutput = {
  titulo_interno: string;
  objetivo: string;
  pilar: ContentPillar;
  formato: ContentFormat;
  ideia_central: string;
  angulo: string;
  gancho: string;
  estrutura_criativo: string;
  texto_criativo: string;
  legenda: string;
  cta: string;
  prompt_imagem: string;
  alt_text: string;
  hashtags: string[];
  sugestao_horario: string;
  justificativa: string;
  hipotese_performance: string;
  asset_url_publicacao?: string | null;
  canais_publicacao?: PublicationChannel[];
};
