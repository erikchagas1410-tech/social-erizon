import { ApprovalQueuePanel } from "@/components/content/ApprovalQueuePanel";
import { GenerateContentForm } from "@/components/content/GenerateContentForm";
import { BrandRulesPanel } from "@/components/content/BrandRulesPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { getApprovalQueue } from "@/lib/approval";
import { navGroups } from "@/lib/command-center-data";

export const dynamic = "force-dynamic";

export default async function GenerateContentPage() {
  const approvalQueue = await getApprovalQueue();

  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />

        <section className="main-shell">
          <TopHeader
            title="Gerar Conteudo"
            subtitle="Criacao estruturada no padrao premium, preciso e reconhecivel da Erizon"
          />

          <GenerateContentForm />
          <BrandRulesPanel />
          <ApprovalQueuePanel items={approvalQueue} />
        </section>
      </div>
    </main>
  );
}
