import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { AudienceInsightsWorkspace } from "@/components/workspaces/AudienceInsightsWorkspace";
import { navGroups } from "@/lib/command-center-data";

export default function AudienceAiPage() {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Audiencia IA"
            subtitle="Leitura de audiencia, tensoes e padroes de resposta"
          />
          <AudienceInsightsWorkspace />
        </section>
      </div>
    </main>
  );
}
