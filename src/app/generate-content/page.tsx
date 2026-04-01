import { BrandRulesPanel } from "@/components/content/BrandRulesPanel";
import { JsonPreview } from "@/components/content/JsonPreview";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { navGroups } from "@/lib/command-center-data";
import { sampleErizonPost } from "@/lib/erizon-brand";

export const dynamic = "force-dynamic";

export default function GenerateContentPage() {
  return (
    <main className="command-center-shell">
      <div className="command-center-grid command-center-grid--single">
        <Sidebar groups={navGroups} />

        <section className="main-shell">
          <TopHeader
            title="Gerar Conteudo"
            subtitle="Criacao estruturada no padrao premium, preciso e reconhecivel da Erizon"
          />

          <BrandRulesPanel />
          <JsonPreview title="Modelo base de saida Erizon" value={sampleErizonPost} />
        </section>
      </div>
    </main>
  );
}
