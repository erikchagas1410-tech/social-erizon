import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CommandCenterActions } from "@/components/dashboard/CommandCenterActions";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ScheduledPanel } from "@/components/dashboard/ScheduledPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { navGroups } from "@/lib/command-center-data";
import { getDashboardPayload } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  try {
    const dashboard = await getDashboardPayload();

    return (
      <main className="command-center-shell">
        <div className="command-center-grid">
          <Sidebar groups={navGroups} />

          <section className="main-shell">
            <TopHeader
              title="Command Center"
              subtitle="Visao em tempo real da operacao de conteudo"
              actions={<CommandCenterActions />}
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

            <ScheduledPanel posts={dashboard.scheduledPosts} />

            <div className="data-source-banner">
              <span className="data-source-pill data-source-pill--supabase">
                Dados ao vivo via Supabase
              </span>
              <p>
                A central esta refletindo apenas o estado real da operacao.
              </p>
            </div>
          </section>

          <ActivityFeed items={dashboard.activities} />
        </div>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha desconhecida no Command Center.";

    return (
      <main className="command-center-shell">
        <div className="error-shell">
          <span className="section-kicker">Dados reais obrigatorios</span>
          <h1>O Command Center nao conseguiu ler a operacao real.</h1>
          <p>
            A central continua sem fallback. O problema agora esta sendo mostrado
            de forma diagnostica para acelerar a correcao do ambiente real.
          </p>
          <p className="error-shell__detail">{message}</p>
        </div>
      </main>
    );
  }
}
