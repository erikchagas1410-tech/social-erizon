import { ApprovalQueuePanel } from "@/components/content/ApprovalQueuePanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { getApprovalQueue } from "@/lib/approval";
import { navGroups } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function ApprovalPage() {
  const approvalQueue = await getApprovalQueue();

  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Aprovacao"
            subtitle="Fila real de conteudo aguardando decisao antes do agendamento"
          />
          <ApprovalQueuePanel items={approvalQueue} />
        </section>
      </div>
    </main>
  );
}
