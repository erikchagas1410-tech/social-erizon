import { ApprovalQueuePanel } from "@/components/content/ApprovalQueuePanel";
import { PendingApprovalManager } from "@/components/content/PendingApprovalManager";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { getApprovalQueue } from "@/lib/approval";
import { navGroups } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function ApprovalPage() {
  const [pendingQueue, approvedQueue] = await Promise.all([
    getApprovalQueue("pending"),
    getApprovalQueue("approved")
  ]);

  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />
        <section className="main-shell">
          <TopHeader
            title="Aprovacao"
            subtitle="Fila real de conteudo aguardando decisao antes do agendamento"
          />
          <PendingApprovalManager
            title="Pendentes de aprovacao"
            description="Selecione as pecas que estao validadas para seguir no fluxo."
            items={pendingQueue}
            mode="approve"
          />
          <PendingApprovalManager
            title="Prontos para agendar"
            description="Selecione os aprovados e defina a data real de publicacao."
            items={approvedQueue}
            mode="schedule"
          />
          <ApprovalQueuePanel items={pendingQueue} />
        </section>
      </div>
    </main>
  );
}
