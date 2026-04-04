import { GrowthAnalystWorkspace } from "@/components/workspaces/GrowthAnalystWorkspace";

export default function GrowthAnalystPage() {
  return (
    <main className="landing-shell landing-shell--wide">
      <div className="growth-analyst-page">
        <header className="growth-analyst-page__header">
          <p className="section-kicker">ERIZON SOCIAL AI</p>
          <h1 className="growth-analyst-page__title">Analista de Growth</h1>
          <p className="growth-analyst-page__subtitle">
            Diagnostico estrategico e plano de escala baseado no contexto do seu negocio
          </p>
        </header>
        <GrowthAnalystWorkspace />
      </div>
    </main>
  );
}
