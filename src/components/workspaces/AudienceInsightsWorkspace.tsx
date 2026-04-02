"use client";

import { useEffect, useState } from "react";

type AudienceInsight = {
  title: string;
  body: string;
};

type AudienceResponse = {
  insights?: AudienceInsight[];
  bestTimeToday?: string;
  error?: string;
};

const niches = [
  { value: "trafego_pago", label: "Trafego Pago" },
  { value: "marketing", label: "Marketing" },
  { value: "empreendedorismo", label: "Empreendedorismo" }
] as const;

const platforms = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" }
] as const;

export function AudienceInsightsWorkspace() {
  const [niche, setNiche] = useState<(typeof niches)[number]["value"]>("trafego_pago");
  const [platform, setPlatform] =
    useState<(typeof platforms)[number]["value"]>("instagram");
  const [insights, setInsights] = useState<AudienceInsight[]>([]);
  const [bestTimeToday, setBestTimeToday] = useState<string>("...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadBestTime();
  }, [niche, platform]);

  async function loadBestTime() {
    try {
      const response = await fetch("/api/audience-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          niche,
          platform,
          quickMode: true
        })
      });
      const payload = (await response.json()) as AudienceResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao ler melhor horario.");
      }

      setBestTimeToday(payload.bestTimeToday ?? "18h - 20h");
    } catch {
      setBestTimeToday("18h - 20h");
    }
  }

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/audience-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          niche,
          platform
        })
      });
      const payload = (await response.json()) as AudienceResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao gerar insights.");
      }

      setInsights(payload.insights ?? []);
      setBestTimeToday(payload.bestTimeToday ?? bestTimeToday);
    } catch (analysisError) {
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Falha desconhecida ao analisar audiencia."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="panel-shell">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Radar de sinais</p>
            <h3>Analise de audiencia</h3>
            <p className="panel-header__copy">
              Rode a leitura por nicho e plataforma para descobrir janelas e padroes.
            </p>
          </div>
        </div>

        <div className="field-grid audience-controls">
          <label className="field-shell">
            <span>Nicho</span>
            <select
              value={niche}
              onChange={(event) =>
                setNiche(event.target.value as (typeof niches)[number]["value"])
              }
            >
              {niches.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-shell">
            <span>Plataforma</span>
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value as (typeof platforms)[number]["value"])
              }
            >
              {platforms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="workspace-actions">
          <button
            type="button"
            className="primary-button"
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? "Analisando..." : "Rodar analise IA"}
          </button>
          <button type="button" className="ghost-button" onClick={() => void loadBestTime()}>
            Atualizar melhor horario
          </button>
        </div>

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
      </section>

      <section className="audience-grid">
        <div className="panel-shell">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Janela de publicacao</p>
              <h3>Melhor horario de hoje</h3>
            </div>
          </div>

          <div className="best-time-card">
            <strong>{bestTimeToday}</strong>
            <p>
              Ajustado a partir do nicho selecionado e pronto para orientar a agenda.
            </p>
          </div>
        </div>

        <div className="panel-shell">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Insights</p>
              <h3>Sinais que a IA encontrou</h3>
            </div>
          </div>

          <div className="insight-list">
            {insights.length ? (
              insights.map((insight, index) => (
                <article key={`${insight.title}-${index}`} className="insight-card">
                  <h4>{insight.title}</h4>
                  <p>{insight.body}</p>
                </article>
              ))
            ) : (
              <p className="panel-header__copy">
                Rode a analise para carregar os insights detalhados da audiencia.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
