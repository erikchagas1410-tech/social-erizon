import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { DesignStudioWorkspace } from "@/components/workspaces/DesignStudioWorkspace";
import { navGroups } from "@/lib/command-center-data";

export default function DesignStudioPage() {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Estudio de Design"
            subtitle="Direcao visual premium para criativos reconheciveis como Erizon"
          />
          <DesignStudioWorkspace />
        </section>
      </div>
    </main>
  );
}
