import {
  ActivityItem,
  DashboardStats,
  NavGroup,
  ScheduledPost
} from "@/types/dashboard";

export const dashboardStats: DashboardStats = {
  pendingApproval: 12,
  scheduled: 28,
  published: 184,
  approvalRate: 91
};

export const scheduledPosts: ScheduledPost[] = [
  {
    id: "post-001",
    title: "O erro invisivel que drena margem em campanhas escaladas",
    format: "carousel",
    scheduledFor: "2026-04-01T10:00:00-03:00",
    status: "pending"
  },
  {
    id: "post-002",
    title: "Quanto custa decidir sem previsao financeira no trafego",
    format: "feed",
    scheduledFor: "2026-04-02T14:30:00-03:00",
    status: "approved"
  },
  {
    id: "post-003",
    title: "Checklist operacional para nao escalar campanha errada",
    format: "story",
    scheduledFor: "2026-04-03T09:00:00-03:00",
    status: "scheduled"
  },
  {
    id: "post-004",
    title: "A conta que separa vaidade de lucro no Meta Ads",
    format: "reel",
    scheduledFor: "2026-04-04T19:00:00-03:00",
    status: "scheduled"
  }
];

export const activities: ActivityItem[] = [
  {
    id: "activity-001",
    type: "approval",
    message: "Novo post aguardando aprovacao do time de estrategia.",
    createdAt: "2026-04-01T08:12:00-03:00"
  },
  {
    id: "activity-002",
    type: "generation",
    message: "Imagem premium gerada para o criativo sobre risco de escala.",
    createdAt: "2026-04-01T08:05:00-03:00"
  },
  {
    id: "activity-003",
    type: "generation",
    message: "Legenda final criada com CTA para salvar e compartilhar.",
    createdAt: "2026-04-01T07:58:00-03:00"
  },
  {
    id: "activity-004",
    type: "schedule",
    message: "Post agendado para quinta-feira as 14:30.",
    createdAt: "2026-04-01T07:41:00-03:00"
  },
  {
    id: "activity-005",
    type: "publish",
    message: "Publicacao concluida com sincronizacao nas plataformas conectadas.",
    createdAt: "2026-04-01T07:08:00-03:00"
  },
  {
    id: "activity-006",
    type: "error",
    message: "Falha de integracao detectada no retorno de uma conta social.",
    createdAt: "2026-04-01T06:52:00-03:00"
  }
];

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
