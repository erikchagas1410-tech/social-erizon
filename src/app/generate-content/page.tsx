import { ApprovalQueuePanel } from "@/components/content/ApprovalQueuePanel";
import { GenerateContentForm } from "@/components/content/GenerateContentForm";
import { BrandRulesPanel } from "@/components/content/BrandRulesPanel";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { getApprovalQueue } from "@/lib/approval";
import { navGroups } from "@/lib/command-center-data";
import { ApprovalQueueItem } from "@/lib/content-persistence";

export const dynamic = "force-dynamic";

export default async function GenerateContentPage() {
  let approvalQueue: ApprovalQueueItem[] = [];
  let approvalQueueError: string | null = null;

  try {
    approvalQueue = await getApprovalQueue();
  } catch (error) {
    approvalQueueError =
      error instanceof Error
        ? error.message
        : "Falha desconhecida ao carregar a fila real de aprovacao.";
  }

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
          {approvalQueueError ? (
            <section className="panel-shell">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">Fila real</p>
                  <h3>Aguardando aprovacao</h3>
                  <p className="panel-header__copy">
                    A tela de criacao segue operando, mas a leitura da fila real falhou neste momento.
                  </p>
                </div>
              </div>
              <p className="form-feedback form-feedback--error">{approvalQueueError}</p>
            </section>
          ) : null}
          <ApprovalQueuePanel items={approvalQueue} />
        </section>
      </div>
    </main>
  );
}
