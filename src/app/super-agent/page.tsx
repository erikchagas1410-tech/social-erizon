import { SuperAgentWorkspace } from "@/components/content/SuperAgentWorkspace";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { navGroups } from "@/lib/command-center-data";
import { listRecentSuperAgentRuns } from "@/lib/super-agent-store";

export const dynamic = "force-dynamic";

export default async function SuperAgentPage() {
  const recentRuns = await listRecentSuperAgentRuns();

  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />

        <section className="main-shell">
          <TopHeader
            title="Super Agente Viral"
            subtitle="Radar de tendencias, variantes virais, carrossel narrativo e agenda semanal em uma operacao"
          />

          <SuperAgentWorkspace />

          <section className="panel-shell panel-shell--soft">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Historico</p>
                <h3>Ultimas execucoes do super agente</h3>
                <p className="panel-header__copy">
                  Memoria operacional para entender o que o agente sugeriu recentemente.
                </p>
              </div>
            </div>

            {recentRuns.length ? (
              <div style={{ display: "grid", gap: 12 }}>
                {recentRuns.map((run) => (
                  <div
                    key={run.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: 14
                    }}
                  >
                    <strong>{run.topic}</strong>
                    <p>{run.objective ?? "Sem objetivo informado."}</p>
                    <p>
                      Trend lider: {run.selectedTrendTopic ?? "-"} | Score: {run.selectedTrendScore ?? 0} | Variantes: {run.variantCount}
                    </p>
                    <p>{new Date(run.createdAt).toLocaleString("pt-BR")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma execucao persistida ainda.</p>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
