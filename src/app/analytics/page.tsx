import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { AnalyticsWorkspace } from "@/components/workspaces/AnalyticsWorkspace";
import { navGroups } from "@/lib/command-center-data";

export default function AnalyticsPage() {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Analytics"
            subtitle="Metrica como camada de leitura e nao como vaidade"
          />
          <AnalyticsWorkspace />
        </section>
      </div>
    </main>
  );
}
