import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { navGroups } from "@/lib/command-center-data";

type PlaceholderWorkspaceProps = {
  title: string;
  subtitle: string;
  badge: string;
  copy: string;
};

export function PlaceholderWorkspace({
  title,
  subtitle,
  badge,
  copy
}: PlaceholderWorkspaceProps) {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader title={title} subtitle={subtitle} />
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">{badge}</p>
                <h3>Camada em construcao</h3>
                <p className="panel-header__copy">{copy}</p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
