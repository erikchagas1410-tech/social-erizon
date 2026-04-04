"use client";

import { useState } from "react";
import type { GrowthOnboarding, GrowthReport } from "@/types/growth-analyst";

const stages = [
  { value: "pre_revenue", label: "Pre-revenue (validando)" },
  { value: "early", label: "Early stage (0–10k/mes)" },
  { value: "growth", label: "Crescimento (10k–100k/mes)" },
  { value: "scale", label: "Escala (100k–500k/mes)" },
  { value: "expansion", label: "Expansao (+500k/mes)" }
];

const channels = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "E-mail marketing" },
  { value: "paid_traffic", label: "Trafego pago" },
  { value: "referral", label: "Indicacao / networking" },
  { value: "outbound", label: "Outbound / cold" }
];

const EMPTY: GrowthOnboarding = {
  niche: "",
  stage: "early",
  monthlyRevenue: "",
  mainChannel: "instagram",
  teamSize: "",
  biggestChallenge: "",
  mainGoal: "",
  leadSource: "",
  uniqueValue: "",
  whatFailed: ""
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "var(--green)" : score >= 45 ? "var(--violet)" : "var(--danger)";

  return (
    <div className="growth-score-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fill="var(--text)" fontSize="28" fontWeight="700" fontFamily="var(--title-font)">{score}</text>
        <text x="70" y="84" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--body-font)">GROWTH SCORE</text>
      </svg>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: "alta" | "media" | "baixa" }) {
  const map = { alta: { label: "Alta", color: "var(--danger)" }, media: { label: "Media", color: "var(--violet)" }, baixa: { label: "Baixa", color: "var(--muted)" } };
  const { label, color } = map[priority];
  return <span className="priority-badge" style={{ color, borderColor: color }}>{label}</span>;
}

function EffortBadge({ effort }: { effort: "baixo" | "medio" | "alto" }) {
  const map = { baixo: { label: "Esforco baixo", color: "var(--green)" }, medio: { label: "Esforco medio", color: "var(--violet)" }, alto: { label: "Esforco alto", color: "var(--danger)" } };
  const { label, color } = map[effort];
  return <span className="priority-badge" style={{ color, borderColor: color }}>{label}</span>;
}

export function GrowthAnalystWorkspace() {
  const [form, setForm] = useState<GrowthOnboarding>(EMPTY);
  const [report, setReport] = useState<GrowthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<"days30" | "days60" | "days90">("days30");

  function update(field: keyof GrowthOnboarding, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function runAnalysis() {
    const required: Array<keyof GrowthOnboarding> = ["niche", "biggestChallenge", "mainGoal", "uniqueValue"];
    const missing = required.filter((k) => !form[k].trim());
    if (missing.length) {
      setError("Preencha pelo menos: nicho, desafio, objetivo e proposta de valor.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/growth-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = (await res.json()) as GrowthReport & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Erro na analise");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha desconhecida.");
    } finally {
      setLoading(false);
    }
  }

  const phaseLabels = { days30: "30 dias", days60: "60 dias", days90: "90 dias" };

  return (
    <>
      {/* Onboarding Form */}
      <section className="panel-shell growth-onboarding">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Diagnostico estrategico</p>
            <h3>Contexto do negocio</h3>
            <p className="panel-header__copy">
              Preencha o contexto da empresa para o analista de growth gerar um plano de escala personalizado.
            </p>
          </div>
        </div>

        <div className="growth-form-grid">
          <label className="field-shell field-shell--full">
            <span>Nicho / setor da empresa <em>*</em></span>
            <textarea
              rows={2}
              placeholder="Ex: agencia de trafego pago para e-commerces de moda"
              value={form.niche}
              onChange={(e) => update("niche", e.target.value)}
            />
          </label>

          <label className="field-shell">
            <span>Estagio atual</span>
            <select value={form.stage} onChange={(e) => update("stage", e.target.value)}>
              {stages.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>

          <label className="field-shell">
            <span>Faturamento mensal aproximado</span>
            <input
              type="text"
              placeholder="Ex: R$ 45.000/mes"
              value={form.monthlyRevenue}
              onChange={(e) => update("monthlyRevenue", e.target.value)}
            />
          </label>

          <label className="field-shell">
            <span>Canal principal hoje</span>
            <select value={form.mainChannel} onChange={(e) => update("mainChannel", e.target.value)}>
              {channels.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>

          <label className="field-shell">
            <span>Tamanho do time</span>
            <input
              type="text"
              placeholder="Ex: 4 pessoas (1 comercial, 2 operacional, 1 gestor)"
              value={form.teamSize}
              onChange={(e) => update("teamSize", e.target.value)}
            />
          </label>

          <label className="field-shell field-shell--full">
            <span>Maior desafio atual <em>*</em></span>
            <textarea
              rows={2}
              placeholder="Ex: captamos leads mas a taxa de conversao esta em 8% e nao conseguimos aumentar o ticket"
              value={form.biggestChallenge}
              onChange={(e) => update("biggestChallenge", e.target.value)}
            />
          </label>

          <label className="field-shell field-shell--full">
            <span>Objetivo principal <em>*</em></span>
            <textarea
              rows={2}
              placeholder="Ex: chegar a R$ 200k/mes em 6 meses sem contratar mais de 2 pessoas"
              value={form.mainGoal}
              onChange={(e) => update("mainGoal", e.target.value)}
            />
          </label>

          <label className="field-shell">
            <span>De onde vem os leads hoje</span>
            <input
              type="text"
              placeholder="Ex: indicacao, Instagram organico, Google Ads"
              value={form.leadSource}
              onChange={(e) => update("leadSource", e.target.value)}
            />
          </label>

          <label className="field-shell field-shell--full">
            <span>Proposta de valor unica <em>*</em></span>
            <textarea
              rows={2}
              placeholder="Ex: somos a unica agencia que garante ROAS minimo de 4x no primeiro mes ou devolvemos o valor"
              value={form.uniqueValue}
              onChange={(e) => update("uniqueValue", e.target.value)}
            />
          </label>

          <label className="field-shell field-shell--full">
            <span>O que ja foi tentado e nao funcionou</span>
            <textarea
              rows={2}
              placeholder="Ex: tentamos ads no Meta, contratamos SDR, fizemos parceria com influenciadores"
              value={form.whatFailed}
              onChange={(e) => update("whatFailed", e.target.value)}
            />
          </label>
        </div>

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

        <div className="workspace-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => void runAnalysis()}
            disabled={loading}
          >
            {loading ? "Analisando negocio..." : "Gerar plano de escala"}
          </button>
          {report ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => { setReport(null); setForm(EMPTY); }}
            >
              Nova analise
            </button>
          ) : null}
        </div>
      </section>

      {/* Loading state */}
      {loading ? (
        <section className="panel-shell growth-loading">
          <div className="growth-loading__inner">
            <div className="growth-loading__pulse" />
            <p className="section-kicker">Processando</p>
            <h3>Analista de growth trabalhando...</h3>
            <p className="panel-header__copy">Lendo contexto, identificando gargalos e mapeando alavancas de crescimento.</p>
          </div>
        </section>
      ) : null}

      {/* Report */}
      {report && !loading ? (
        <>
          {/* Score + Bottleneck */}
          <section className="growth-hero-row">
            <div className="panel-shell growth-score-panel">
              <p className="section-kicker">Potencial de crescimento</p>
              <ScoreRing score={report.growthScore} />
              <p className="panel-header__copy" style={{ textAlign: "center", marginTop: 12 }}>
                Score baseado nos recursos e posicionamento atuais
              </p>
            </div>

            <div className="panel-shell growth-bottleneck-panel">
              <p className="section-kicker">Gargalo principal</p>
              <h3 style={{ marginTop: 8 }}>O que esta travando agora</h3>
              <blockquote className="growth-bottleneck-quote">
                {report.bottleneck}
              </blockquote>

              <div className="growth-diagnosis-block">
                <h4>{report.diagnosis.title}</h4>
                <p>{report.diagnosis.body}</p>
              </div>
            </div>
          </section>

          {/* Opportunities */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Mapa de oportunidades</p>
                <h3>Alavancas identificadas</h3>
              </div>
            </div>
            <div className="growth-opportunities-grid">
              {report.opportunities.map((opp, i) => (
                <article key={i} className="growth-opportunity-card">
                  <div className="growth-opportunity-card__header">
                    <h4>{opp.title}</h4>
                    <PriorityBadge priority={opp.priority} />
                  </div>
                  <p>{opp.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Roadmap */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Plano de execucao</p>
                <h3>Roadmap 30 / 60 / 90 dias</h3>
              </div>
            </div>
            <div className="growth-phase-tabs">
              {(["days30", "days60", "days90"] as const).map((phase) => (
                <button
                  key={phase}
                  type="button"
                  className={`growth-phase-tab${activePhase === phase ? " is-active" : ""}`}
                  onClick={() => setActivePhase(phase)}
                >
                  {phaseLabels[phase]}
                </button>
              ))}
            </div>
            <div className="growth-roadmap-list">
              {report.roadmap[activePhase].map((item, i) => (
                <div key={i} className="growth-roadmap-item">
                  <span className="growth-roadmap-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.action}</strong>
                    <p>{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next Moves + Content Strategy */}
          <div className="growth-bottom-grid">
            <section className="panel-shell">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">Proximos passos</p>
                  <h3>3 movimentos prioritarios</h3>
                </div>
              </div>
              <div className="growth-moves-list">
                {report.nextMoves.map((move, i) => (
                  <article key={i} className="growth-move-card">
                    <div className="growth-move-card__header">
                      <span className="growth-move-card__index">{i + 1}</span>
                      <EffortBadge effort={move.effort} />
                    </div>
                    <strong>{move.move}</strong>
                    <p>{move.impact}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-shell">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">Conteudo estrategico</p>
                  <h3>Estrategia por canal</h3>
                </div>
              </div>
              <div className="growth-channels-list">
                {report.contentStrategy.map((cs, i) => (
                  <article key={i} className="growth-channel-card">
                    <h4>{cs.channel}</h4>
                    <div className="growth-channel-card__meta">
                      <span><em>Pilar:</em> {cs.pillar}</span>
                      <span><em>Formato:</em> {cs.format}</span>
                      <span><em>Frequencia:</em> {cs.frequency}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* KPIs */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Metricas de controle</p>
                <h3>KPIs para acompanhar</h3>
              </div>
            </div>
            <div className="growth-kpi-grid">
              {report.kpis.map((kpi, i) => (
                <div key={i} className="growth-kpi-card">
                  <p className="growth-kpi-card__metric">{kpi.metric}</p>
                  <div className="growth-kpi-card__values">
                    <span className="growth-kpi-card__current">{kpi.current}</span>
                    <span className="growth-kpi-card__arrow">→</span>
                    <span className="growth-kpi-card__target">{kpi.target}</span>
                  </div>
                  <p className="growth-kpi-card__timeframe">{kpi.timeframe}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
