"use client";

import { useState } from "react";
import type { GrowthSession } from "@/types/growth-analyst";
import { GrowthHistoryPanel } from "@/components/growth/GrowthHistoryPanel";
import { GrowthAnalystWorkspace } from "@/components/workspaces/GrowthAnalystWorkspace";

export function GrowthAnalystApp() {
  const [selectedSession, setSelectedSession] = useState<GrowthSession | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  function handleNew() {
    setSelectedSession(null);
  }

  function handleSelect(session: GrowthSession) {
    setSelectedSession(session);
  }

  function handleGenerated() {
    // bump version so history panel re-fetches
    setHistoryVersion(v => v + 1);
  }

  return (
    <div className="command-center-grid command-center-grid--single">
      <GrowthHistoryPanel
        version={historyVersion}
        selectedId={selectedSession?.id ?? null}
        onSelect={handleSelect}
        onNew={handleNew}
      />

      <section className="main-shell">
        <header className="top-header">
          <div>
            <p className="section-kicker">
              {selectedSession ? "Histórico" : "Analista de Growth"}
            </p>
            <h2>
              {selectedSession
                ? selectedSession.company_name
                : "Novo diagnóstico"}
            </h2>
            <p className="top-header__subtitle">
              {selectedSession
                ? `${selectedSession.niche} — ${selectedSession.stage} — Score ${selectedSession.growth_score}`
                : "Diagnostico estrategico e plano de escala baseado no contexto do seu negocio"}
            </p>
          </div>
        </header>

        <GrowthAnalystWorkspace
          key={selectedSession?.id ?? "new"}
          initialData={selectedSession?.onboarding_data}
          initialReport={selectedSession?.report}
          readOnly={!!selectedSession}
          onGenerated={handleGenerated}
        />
      </section>
    </div>
  );
}
