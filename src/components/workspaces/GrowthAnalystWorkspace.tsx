"use client";

import { useState } from "react";
import type { GrowthReport } from "@/types/growth-analyst";

/* ─── Types ──────────────────────────────────────────────────────── */

interface OnboardingData {
  companyName: string;
  niche: string;
  segA: string;
  segB: string;
  mainFocus: string;
  prioritySegment: string;
  revenueChannels: string[];
  aTicket: string;
  aIdealClient: string;
  aBestProject: string;
  aClosingTime: string;
  bTicket: string;
  bIdealClient: string;
  bUnwantedClient: string;
  bClosingTime: string;
  positioning: string;
  differentiator: string;
  mainProblem: string;
  trafficGoal: string[];
  hasInstagram: string;
  hasGoogle: string;
  hasSite: string;
  hasCrm: string;
  leadResponder: string;
  responseTime: string;
  hasQualification: string;
  investmentRange: string;
  clientsPerMonth: string;
  clientValue: string;
  alignmentNote: string;
}

const EMPTY: OnboardingData = {
  companyName: "", niche: "", segA: "Segmento A", segB: "Segmento B",
  mainFocus: "", prioritySegment: "", revenueChannels: [],
  aTicket: "", aIdealClient: "", aBestProject: "", aClosingTime: "",
  bTicket: "", bIdealClient: "", bUnwantedClient: "", bClosingTime: "",
  positioning: "", differentiator: "",
  mainProblem: "", trafficGoal: [],
  hasInstagram: "", hasGoogle: "", hasSite: "", hasCrm: "",
  leadResponder: "", responseTime: "", hasQualification: "",
  investmentRange: "", clientsPerMonth: "", clientValue: "", alignmentNote: ""
};

/* ─── Sub-components ─────────────────────────────────────────────── */

function Radio({ value, current, onChange, children }: {
  value: string; current: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      className={`option-pill${active ? " is-active" : ""}`}
      onClick={() => onChange(active ? "" : value)}
    >
      <span className="option-pill__dot" />
      {children}
    </button>
  );
}

function Check({ value, current, onChange, children }: {
  value: string; current: string[]; onChange: (v: string[]) => void; children: React.ReactNode;
}) {
  const active = current.includes(value);
  return (
    <button
      type="button"
      className={`option-pill${active ? " is-active is-active--check" : ""}`}
      onClick={() => onChange(active ? current.filter(x => x !== value) : [...current, value])}
    >
      <span className="option-pill__dot" />
      {children}
    </button>
  );
}

function YesNo({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="yes-no-row">
      <button type="button" className={`yes-no-btn${value === "sim" ? " is-active" : ""}`} onClick={() => onChange("sim")}>Sim</button>
      <button type="button" className={`yes-no-btn${value === "nao" ? " is-active" : ""}`} onClick={() => onChange("nao")}>Não</button>
    </div>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="panel-header" style={{ marginBottom: 20 }}>
      <div>
        <p className="section-kicker">Seção {num}</p>
        <h3 style={{ margin: "8px 0 0" }}>{title}</h3>
        {subtitle ? <p className="panel-header__copy">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function ScoreCard({ label, value, tone, hint }: { label: string; value: string; tone: "violet" | "blue" | "cyan" | "green"; hint: string }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__hint">{hint}</p>
    </article>
  );
}

/* ─── Main Workspace ─────────────────────────────────────────────── */

export function GrowthAnalystWorkspace() {
  const [data, setData] = useState<OnboardingData>(EMPTY);
  const [report, setReport] = useState<GrowthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<"days30" | "days60" | "days90">("days30");

  const set = (field: keyof OnboardingData) => (value: string) =>
    setData(prev => ({ ...prev, [field]: value }));

  const setArr = (field: keyof OnboardingData) => (value: string[]) =>
    setData(prev => ({ ...prev, [field]: value }));

  const A = data.segA || "Segmento A";
  const B = data.segB || "Segmento B";

  async function runAnalysis() {
    if (!data.companyName || !data.niche) {
      setError("Preencha o nome da empresa e o nicho para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    setReport(null);

    const payload = {
      niche: `${data.niche} — empresa: ${data.companyName}`,
      stage: data.investmentRange || "early",
      monthlyRevenue: `${A}: ticket ${data.aTicket || "n/d"} | ${B}: ticket ${data.bTicket || "n/d"}`,
      mainChannel: data.revenueChannels.join(", ") || data.hasInstagram === "sim" ? "Instagram" : "Indicação",
      teamSize: `Leads respondidos por: ${data.leadResponder || "n/d"}, tempo de resposta: ${data.responseTime || "n/d"}`,
      biggestChallenge: data.mainProblem || "Não informado",
      mainGoal: [data.trafficGoal.join(", "), `Meta: ${data.clientsPerMonth} clientes/mês`].filter(Boolean).join(" | "),
      leadSource: data.revenueChannels.join(", ") || "Indicação",
      uniqueValue: `Posicionamento: ${data.positioning || "n/d"}. Diferencial: ${data.differentiator || "n/d"}`,
      whatFailed: data.alignmentNote || "Não informado",
      extra: JSON.stringify({
        foco: data.mainFocus, prioridade: data.prioritySegment,
        [A]: { ticket: data.aTicket, clienteIdeal: data.aIdealClient, melhorProjeto: data.aBestProject, fechamento: data.aClosingTime },
        [B]: { ticket: data.bTicket, clienteIdeal: data.bIdealClient, clienteIndesejado: data.bUnwantedClient, fechamento: data.bClosingTime },
        estrutura: { instagram: data.hasInstagram, google: data.hasGoogle, site: data.hasSite, crm: data.hasCrm },
        comercial: { qualificacao: data.hasQualification, resposta: data.responseTime },
        investimento: data.investmentRange,
        valorCliente: data.clientValue
      })
    };

    try {
      const res = await fetch("/api/growth-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = (await res.json()) as GrowthReport & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro na analise");
      setReport(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha desconhecida.");
    } finally {
      setLoading(false);
    }
  }

  const phaseLabel = { days30: "30 dias", days60: "60 dias", days90: "90 dias" };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Setup ── */}
      <section className="panel-shell">
        <SectionHeader num="0" title="Identificação" subtitle="Nome da empresa e nicho — isso personaliza toda a análise." />
        <div className="onboarding-setup-grid">
          <label className="field-shell">
            <span>Nome da empresa</span>
            <input type="text" placeholder="Ex: Iconico Arquitetura" value={data.companyName} onChange={e => set("companyName")(e.target.value)} />
          </label>
          <label className="field-shell">
            <span>Nicho / setor</span>
            <input type="text" placeholder="Ex: Escritório de arquitetura alto padrão" value={data.niche} onChange={e => set("niche")(e.target.value)} />
          </label>
          <label className="field-shell">
            <span>Label do Segmento A</span>
            <input type="text" placeholder="Ex: Comercial" value={data.segA} onChange={e => set("segA")(e.target.value)} />
          </label>
          <label className="field-shell">
            <span>Label do Segmento B</span>
            <input type="text" placeholder="Ex: Residencial" value={data.segB} onChange={e => set("segB")(e.target.value)} />
          </label>
        </div>
      </section>

      {/* ── Seção 1: Visão do negócio ── */}
      <section className="panel-shell">
        <SectionHeader num="1" title="Visão do negócio" subtitle="Onde o negócio está focado e de onde vem o dinheiro hoje." />

        <div className="onboarding-field">
          <p className="onboarding-question">Qual o foco principal hoje?</p>
          <div className="option-row">
            <Radio value="a" current={data.mainFocus} onChange={set("mainFocus")}>{A}</Radio>
            <Radio value="b" current={data.mainFocus} onChange={set("mainFocus")}>{B}</Radio>
            <Radio value="ambos" current={data.mainFocus} onChange={set("mainFocus")}>Ambos</Radio>
          </div>
        </div>

        <div className="onboarding-field">
          <p className="onboarding-question">Qual braço é prioridade hoje?</p>
          <div className="option-row">
            <Radio value="a" current={data.prioritySegment} onChange={set("prioritySegment")}>{A}</Radio>
            <Radio value="b" current={data.prioritySegment} onChange={set("prioritySegment")}>{B}</Radio>
          </div>
        </div>

        <div className="onboarding-field">
          <p className="onboarding-question">Como faturam hoje? <em>(pode marcar mais de um)</em></p>
          <div className="option-row">
            {["Indicação", "Instagram", "Google", "LinkedIn", "Outbound", "Eventos", "Outros"].map(v => (
              <Check key={v} value={v} current={data.revenueChannels} onChange={setArr("revenueChannels")}>{v}</Check>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 2: Produto / Serviço ── */}
      <section className="panel-shell">
        <SectionHeader num="2" title="Produto / Serviço" subtitle="Números e perfil de cliente por segmento." />
        <div className="segment-grid">
          <div className="segment-block segment-block--a">
            <p className="segment-block__label">{A}</p>
            <div className="field-stack">
              <label className="field-shell">
                <span>Ticket médio</span>
                <input type="text" placeholder="Ex: R$ 180.000" value={data.aTicket} onChange={e => set("aTicket")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tipo de cliente ideal</span>
                <input type="text" placeholder="Ex: Empresas médias em expansão" value={data.aIdealClient} onChange={e => set("aIdealClient")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tipo de projeto mais lucrativo</span>
                <input type="text" placeholder="Ex: Retrofit de escritórios" value={data.aBestProject} onChange={e => set("aBestProject")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tempo médio de fechamento</span>
                <input type="text" placeholder="Ex: 3 semanas" value={data.aClosingTime} onChange={e => set("aClosingTime")(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="segment-block segment-block--b">
            <p className="segment-block__label">{B}</p>
            <div className="field-stack">
              <label className="field-shell">
                <span>Ticket médio</span>
                <input type="text" placeholder="Ex: R$ 320.000" value={data.bTicket} onChange={e => set("bTicket")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tipo de cliente ideal</span>
                <input type="text" placeholder="Ex: Família alto padrão, 1ª construção" value={data.bIdealClient} onChange={e => set("bIdealClient")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tipo de cliente que NÃO querem</span>
                <input type="text" placeholder="Ex: Projetos abaixo de R$ 200k" value={data.bUnwantedClient} onChange={e => set("bUnwantedClient")(e.target.value)} />
              </label>
              <label className="field-shell">
                <span>Tempo médio de fechamento</span>
                <input type="text" placeholder="Ex: 45 dias" value={data.bClosingTime} onChange={e => set("bClosingTime")(e.target.value)} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ── Seção 3: Posicionamento ── */}
      <section className="panel-shell">
        <SectionHeader num="3" title="Posicionamento" subtitle="Como querem ser percebidos e o que os diferencia no mercado." />

        <div className="onboarding-field">
          <p className="onboarding-question">Como querem ser percebidos?</p>
          <div className="option-row">
            {["Premium", "Acessível", "Alto padrão", "Conceitual", "Técnico", "Inovador"].map(v => (
              <Radio key={v} value={v} current={data.positioning} onChange={set("positioning")}>{v}</Radio>
            ))}
          </div>
        </div>

        <div className="onboarding-field">
          <p className="onboarding-question">O que diferencia vocês hoje?</p>
          <textarea
            className="onboarding-textarea"
            rows={3}
            placeholder="Deixa eles falarem livremente — anote aqui..."
            value={data.differentiator}
            onChange={e => set("differentiator")(e.target.value)}
          />
        </div>
      </section>

      {/* ── Seção 4: Problema atual ── */}
      <section className="panel-shell">
        <SectionHeader num="4" title="Problema atual" subtitle="O maior gargalo que impede o crescimento hoje." />
        <div className="onboarding-field">
          <p className="onboarding-question">Hoje o maior problema é:</p>
          <div className="option-row option-row--wrap">
            {["Falta de leads", "Leads desqualificados", "Baixa conversão", "Falta de previsibilidade", "Ticket baixo", "Equipe pequena", "Dependência de indicação"].map(v => (
              <Radio key={v} value={v} current={data.mainProblem} onChange={set("mainProblem")}>{v}</Radio>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 5: Objetivo com tráfego ── */}
      <section className="panel-shell">
        <SectionHeader num="5" title="Objetivo com tráfego" subtitle="O que querem conseguir com marketing digital." />
        <div className="onboarding-field">
          <p className="onboarding-question">O que querem hoje? <em>(pode marcar mais de um)</em></p>
          <div className="option-row option-row--wrap">
            {["Mais clientes", "Mais qualidade nos leads", "Posicionamento de marca", "Escala", "Reduzir dependência de indicação", "Entrar em novo segmento"].map(v => (
              <Check key={v} value={v} current={data.trafficGoal} onChange={setArr("trafficGoal")}>{v}</Check>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 6: Estrutura atual ── */}
      <section className="panel-shell">
        <SectionHeader num="6" title="Estrutura atual" subtitle="O que já existe rodando hoje." />
        <div className="infra-grid">
          {([
            ["Instagram ativo?", "hasInstagram"],
            ["Google ativo?", "hasGoogle"],
            ["Site?", "hasSite"],
            ["CRM?", "hasCrm"]
          ] as const).map(([label, field]) => (
            <div key={field} className="infra-item">
              <p className="onboarding-question">{label}</p>
              <YesNo value={data[field]} onChange={set(field)} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Seção 7: Processo comercial ── */}
      <section className="panel-shell">
        <SectionHeader num="7" title="Processo comercial" subtitle="Como os leads são tratados depois que chegam." />

        <div className="onboarding-field">
          <p className="onboarding-question">Quem responde os leads?</p>
          <div className="option-row">
            <Radio value="dono" current={data.leadResponder} onChange={set("leadResponder")}>Dono</Radio>
            <Radio value="equipe" current={data.leadResponder} onChange={set("leadResponder")}>Equipe</Radio>
            <Radio value="misto" current={data.leadResponder} onChange={set("leadResponder")}>Misto</Radio>
          </div>
        </div>

        <div className="onboarding-field">
          <p className="onboarding-question">Tempo de resposta ao lead:</p>
          <div className="option-row">
            <Radio value="imediato" current={data.responseTime} onChange={set("responseTime")}>Imediato</Radio>
            <Radio value="horas" current={data.responseTime} onChange={set("responseTime")}>Horas</Radio>
            <Radio value="dias" current={data.responseTime} onChange={set("responseTime")}>Dias</Radio>
          </div>
        </div>

        <div className="onboarding-field">
          <p className="onboarding-question">Existe qualificação antes da reunião?</p>
          <YesNo value={data.hasQualification} onChange={set("hasQualification")} />
        </div>
      </section>

      {/* ── Seção 8: Investimento ── */}
      <section className="panel-shell">
        <SectionHeader num="8" title="Investimento" subtitle="Budget disponível para marketing." />
        <div className="onboarding-field">
          <p className="onboarding-question">Quanto pretendem investir inicialmente?</p>
          <div className="option-row option-row--wrap">
            {["Até R$ 1.000", "R$ 1k – R$ 3k", "R$ 3k – R$ 10k", "Acima de R$ 10k"].map(v => (
              <Radio key={v} value={v} current={data.investmentRange} onChange={set("investmentRange")}>{v}</Radio>
            ))}
          </div>
        </div>
      </section>

      {/* ── Seção 9 + 10: Meta + Valor ── */}
      <section className="panel-shell">
        <SectionHeader num="9–10" title="Meta real e valor do cliente" subtitle="Os números que constroem o ROI na cabeça deles." />
        <div className="segment-grid">
          <div className="onboarding-field">
            <p className="onboarding-question">Quantos clientes por mês já seria suficiente?</p>
            <input
              className="onboarding-input"
              type="text"
              placeholder="Ex: 3 clientes novos por mês"
              value={data.clientsPerMonth}
              onChange={e => set("clientsPerMonth")(e.target.value)}
            />
          </div>
          <div className="onboarding-field">
            <p className="onboarding-question">Um cliente fechado representa quanto em média?</p>
            <input
              className="onboarding-input"
              type="text"
              placeholder="Ex: R$ 180.000 em receita"
              value={data.clientValue}
              onChange={e => set("clientValue")(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Seção 11: Alinhamento final ── */}
      <section className="panel-shell">
        <SectionHeader num="11" title="Alinhamento final" subtitle='Você fala: "Se a gente trouxer X clientes por mês, já resolve o cenário de vocês?"' />
        <div className="onboarding-field">
          <p className="onboarding-question">Observações finais / contexto da reunião:</p>
          <textarea
            className="onboarding-textarea"
            rows={3}
            placeholder="Anote objeções, sinais, contexto adicional que vai ajudar a IA a personalizar o plano..."
            value={data.alignmentNote}
            onChange={e => set("alignmentNote")(e.target.value)}
          />
        </div>

        {/* ROI preview */}
        {data.clientsPerMonth && data.clientValue ? (
          <div className="roi-preview">
            <span className="section-kicker">Preview de ROI</span>
            <p>
              Se a gente trouxer <strong>{data.clientsPerMonth}</strong> e cada cliente vale <strong>{data.clientValue}</strong> — mostre esse número antes de fechar.
            </p>
          </div>
        ) : null}
      </section>

      {/* ── CTA ── */}
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

      <div className="workspace-actions" style={{ marginTop: 8, marginBottom: 8 }}>
        <button type="button" className="primary-button" onClick={() => void runAnalysis()} disabled={loading}>
          {loading ? "Analisando negócio..." : "Gerar plano de crescimento"}
        </button>
        {report ? (
          <button type="button" className="ghost-button" onClick={() => { setReport(null); setData(EMPTY); setError(null); }}>
            Novo onboarding
          </button>
        ) : null}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <section className="panel-shell" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div className="growth-loading__pulse" style={{ margin: "0 auto 20px" }} />
          <p className="section-kicker">Processando</p>
          <h3 style={{ margin: "8px 0 0" }}>Analista de growth trabalhando...</h3>
          <p className="panel-header__copy">Lendo contexto, identificando gargalos e mapeando alavancas de crescimento.</p>
        </section>
      ) : null}

      {/* ── Report ── */}
      {report && !loading ? (
        <>
          {/* Score cards */}
          <div className="metrics-grid" style={{ marginTop: 8 }}>
            <ScoreCard label="Growth Score" value={`${report.growthScore}`} tone="violet" hint="Potencial de crescimento com os recursos atuais." />
            <ScoreCard label="Meta / mês" value={data.clientsPerMonth || "—"} tone="cyan" hint="Volume que já muda o cenário da operação." />
            <ScoreCard label="Valor por cliente" value={data.clientValue || "—"} tone="green" hint="Receita média por fechamento." />
            <ScoreCard label="Investimento" value={data.investmentRange || "—"} tone="blue" hint="Budget disponível para ativar o crescimento." />
          </div>

          {/* Bottleneck + Diagnosis */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Diagnóstico</p>
                <h3 style={{ margin: "8px 0 0" }}>{report.diagnosis.title}</h3>
              </div>
            </div>
            <blockquote className="growth-bottleneck-quote" style={{ marginTop: 16 }}>
              {report.bottleneck}
            </blockquote>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: "12px 0 0" }}>{report.diagnosis.body}</p>
          </section>

          {/* Opportunities */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Oportunidades</p>
                <h3 style={{ margin: "8px 0 0" }}>Alavancas identificadas</h3>
              </div>
            </div>
            <div className="growth-opportunities-grid" style={{ marginTop: 0 }}>
              {report.opportunities.map((opp, i) => (
                <article key={i} className="scheduled-card" style={{ display: "block", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <h4 style={{ margin: 0 }}>{opp.title}</h4>
                    <span className={`status-pill status-pill--${opp.priority === "alta" ? "pending" : opp.priority === "media" ? "approved" : "scheduled"}`}>
                      {opp.priority}
                    </span>
                  </div>
                  <p style={{ marginTop: 10, color: "var(--muted)", lineHeight: 1.6 }}>{opp.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Roadmap */}
          <section className="panel-shell">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Plano de execução</p>
                <h3 style={{ margin: "8px 0 0" }}>Roadmap 30 / 60 / 90 dias</h3>
              </div>
            </div>
            <div className="growth-phase-tabs">
              {(["days30", "days60", "days90"] as const).map(phase => (
                <button key={phase} type="button" className={`growth-phase-tab${activePhase === phase ? " is-active" : ""}`} onClick={() => setActivePhase(phase)}>
                  {phaseLabel[phase]}
                </button>
              ))}
            </div>
            <div className="scheduled-list" style={{ marginTop: 0 }}>
              {report.roadmap[activePhase].map((item, i) => (
                <div key={i} className="scheduled-card" style={{ gridTemplateColumns: "32px 1fr", gap: "14px", padding: "14px 16px" }}>
                  <span className="growth-roadmap-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.action}</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.55 }}>{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next moves + Content strategy */}
          <div className="growth-bottom-grid" style={{ marginTop: 0 }}>
            <section className="panel-shell" style={{ marginTop: 0 }}>
              <p className="section-kicker">Próximos movimentos</p>
              <h3 style={{ margin: "8px 0 16px" }}>3 ações imediatas</h3>
              <div className="scheduled-list" style={{ marginTop: 0 }}>
                {report.nextMoves.map((move, i) => (
                  <article key={i} className="scheduled-card" style={{ display: "block", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(var(--glow-cyan),0.14)", color: "var(--cyan)", display: "grid", placeItems: "center", fontSize: "0.82rem", fontWeight: 700 }}>{i + 1}</span>
                      <span className={`format-pill`} style={{ fontSize: "0.75rem" }}>{move.effort}</span>
                    </div>
                    <strong style={{ display: "block", marginBottom: 6 }}>{move.move}</strong>
                    <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.55 }}>{move.impact}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel-shell" style={{ marginTop: 0 }}>
              <p className="section-kicker">Estratégia de conteúdo</p>
              <h3 style={{ margin: "8px 0 16px" }}>Por canal</h3>
              <div className="scheduled-list" style={{ marginTop: 0 }}>
                {report.contentStrategy.map((cs, i) => (
                  <article key={i} className="scheduled-card" style={{ display: "block", padding: "16px" }}>
                    <h4 style={{ margin: "0 0 10px", color: "var(--cyan)" }}>{cs.channel}</h4>
                    <div style={{ display: "grid", gap: 4, fontSize: "0.86rem", color: "var(--muted)" }}>
                      <span><strong style={{ color: "var(--text)" }}>Pilar:</strong> {cs.pillar}</span>
                      <span><strong style={{ color: "var(--text)" }}>Formato:</strong> {cs.format}</span>
                      <span><strong style={{ color: "var(--text)" }}>Frequência:</strong> {cs.frequency}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* KPIs */}
          <section className="panel-shell" style={{ marginTop: 0, marginBottom: 20 }}>
            <p className="section-kicker">Métricas de controle</p>
            <h3 style={{ margin: "8px 0 16px" }}>KPIs para acompanhar</h3>
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
