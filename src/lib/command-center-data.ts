import { NavGroup } from "@/types/dashboard";

export const navGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { label: "Command Center", href: "/command-center" },
      { label: "Aprovacao", href: "/approval" },
      { label: "Calendario", href: "/calendar" }
    ]
  },
  {
    label: "Inteligencia",
    items: [
      { label: "Super Agente", href: "/super-agent" },
      { label: "Analista de Growth", href: "/growth-analyst" },
      { label: "Audiencia IA", href: "/audience-ai" },
      { label: "Analytics", href: "/analytics" }
    ]
  },
  {
    label: "Producao",
    items: [
      { label: "Gerar Conteudo", href: "/generate-content" },
      { label: "Estudio de Design", href: "/design-studio" }
    ]
  }
];
