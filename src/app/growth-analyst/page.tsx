import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { GrowthAnalystWorkspace } from "@/components/workspaces/GrowthAnalystWorkspace";
import { navGroups } from "@/lib/command-center-data";

export default function GrowthAnalystPage() {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Analista de Growth"
            subtitle="Diagnostico estrategico e plano de escala baseado no contexto do seu negocio"
          />
          <GrowthAnalystWorkspace />
        </section>
      </div>
    </main>
  );
}
