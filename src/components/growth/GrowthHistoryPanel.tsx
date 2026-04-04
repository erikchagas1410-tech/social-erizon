"use client";

import { useEffect, useState } from "react";
import type { GrowthSession } from "@/types/growth-analyst";

interface Props {
  version: number;
  selectedId: string | null;
  onSelect: (session: GrowthSession) => void;
  onNew: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function ScoreDot({ score }: { score: number }) {
  const color =
    score >= 70 ? "var(--green)" : score >= 40 ? "var(--cyan)" : "var(--violet)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.78rem",
        color,
        fontWeight: 700
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0
        }}
      />
      {score}
    </span>
  );
}

export function GrowthHistoryPanel({ version, selectedId, onSelect, onNew }: Props) {
  const [sessions, setSessions] = useState<GrowthSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/growth-analyst")
      .then(r => r.json())
      .then((data: GrowthSession[]) => setSessions(Array.isArray(data) ? data : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [version]);

  return (
    <aside className="sidebar-shell growth-history-panel">
      <div className="growth-history-panel__header">
        <span className="sidebar-group__label">Histórico de clientes</span>
        <button type="button" className="growth-history-new-btn" onClick={onNew}>
          + Novo
        </button>
      </div>

      <div className="growth-history-list">
        {loading ? (
          <p className="growth-history-empty">Carregando...</p>
        ) : sessions.length === 0 ? (
          <p className="growth-history-empty">
            Nenhum diagnóstico ainda. Gere o primeiro plano para começar o histórico.
          </p>
        ) : (
          sessions.map(s => (
            <button
              key={s.id}
              type="button"
              className={`growth-history-item${selectedId === s.id ? " is-active" : ""}`}
              onClick={() => onSelect(s)}
            >
              <div className="growth-history-item__top">
                <strong className="growth-history-item__name">{s.company_name}</strong>
                <ScoreDot score={s.growth_score} />
              </div>
              <span className="growth-history-item__niche">{s.niche}</span>
              <span className="growth-history-item__date">{formatDate(s.created_at)}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
