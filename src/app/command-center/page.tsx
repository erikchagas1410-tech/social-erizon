import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ScheduledPanel } from "@/components/dashboard/ScheduledPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { navGroups } from "@/lib/command-center-data";
import { getDashboardPayload } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const dashboard = await getDashboardPayload();

  return (
    <main className="command-center-shell">
      <div className="command-center-grid">
        <Sidebar groups={navGroups} />

        <section className="main-shell">
          <TopHeader
            title="Command Center"
            subtitle="Visao em tempo real da operacao de conteudo"
          />

          <section className="metrics-grid" aria-label="Resumo operacional">
            <MetricCard
              label="Aguardando aprovacao"
              value={String(dashboard.stats.pendingApproval)}
              tone="violet"
              hint="Posts prontos para validacao estrategica."
            />
            <MetricCard
              label="Agendados"
              value={String(dashboard.stats.scheduled)}
              tone="blue"
              hint="Conteudos encaminhados para publicacao."
            />
            <MetricCard
              label="Publicados"
              value={String(dashboard.stats.published)}
              tone="cyan"
              hint="Entregas ja executadas no ciclo atual."
            />
            <MetricCard
              label="Taxa de aprovacao"
              value={`${dashboard.stats.approvalRate}%`}
              tone="green"
              hint="Efetividade do pipeline de decisao."
            />
          </section>

          <ScheduledPanel
            posts={dashboard.scheduledPosts}
            source={dashboard.source}
          />

          <div className="data-source-banner">
            <span className={`data-source-pill data-source-pill--${dashboard.source}`}>
              {dashboard.source === "supabase"
                ? "Dados ao vivo via Supabase"
                : "Modo demonstracao com mock tipado"}
            </span>
            <p>
              {dashboard.source === "supabase"
                ? "A central esta refletindo o estado real da operacao."
                : "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para ligar a operacao real."}
            </p>
          </div>
        </section>

        <ActivityFeed items={dashboard.activities} />
      </div>
    </main>
  );
}
