"use client";

import { useState } from "react";
import type { GrowthReport, OnboardingData } from "@/types/growth-analyst";

const EMPTY: OnboardingData = {
  companyName: "", niche: "", stage: "",
  revenueChannels: [], avgTicket: "", idealClient: "", closingTime: "",
  positioning: [], differentiator: "", mainProblem: "", trafficGoal: [],
  hasInstagram: "", hasGoogle: "", hasSite: "", hasCrm: "",
  leadResponder: "", responseTime: "", hasQualification: "",
  investmentRange: "", clientsPerMonth: "", clientValue: "", notes: ""
};

/* ─── Pill components ────────────────────────────────────────────── */

function Radio({ value, current, onChange, children }: {
  value: string; current: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  const active = current === value;
  return (
    <button type="button" className={`option-pill${active ? " is-active" : ""}`} onClick={() => onChange(active ? "" : value)}>
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
    <button type="button" className={`option-pill${active ? " is-active is-active--check" : ""}`} onClick={() => onChange(active ? current.filter(x => x !== value) : [...current, value])}>
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

/* ─── Section header ─────────────────────────────────────────────── */

function Block({ num, title, hint, children }: { num: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="panel-shell ob-block">
      <div className="ob-block__head">
        <span className="ob-block__num">{num}</span>
        <div>
          <h3 className="ob-block__title">{title}</h3>
          {hint ? <p className="ob-block__hint">{hint}</p> : null}
        </div>
      </div>
      <div className="ob-block__body">{children}</div>
    </section>
  );
}

function Q({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ob-question">
      <p className="ob-question__label">{label}</p>
      {children}
    </div>
  );
}

/* ─── Report sub-components ─────────────────────────────────────── */

function ScoreCard({ label, value, tone, hint }: { label: string; value: string; tone: "violet" | "blue" | "cyan" | "green"; hint: string }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__hint">{hint}</p>
    </article>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */

interface WorkspaceProps {
  initialData?: OnboardingData;
  initialReport?: GrowthReport;
  readOnly?: boolean;
  onGenerated?: () => void;
}

export function GrowthAnalystWorkspace({
  initialData,
  initialReport,
  readOnly = false,
  onGenerated
}: WorkspaceProps = {}) {
  const [d, setD] = useState<OnboardingData>(initialData ?? EMPTY);
  const [report, setReport] = useState<GrowthReport | null>(initialReport ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"days30" | "days60" | "days90">("days30");

  const set = (f: keyof OnboardingData) => (v: string) => setD(p => ({ ...p, [f]: v }));
  const setArr = (f: keyof OnboardingData) => (v: string[]) => setD(p => ({ ...p, [f]: v }));

  async function run() {
    if (!d.companyName || !d.niche) { setError("Preencha nome e nicho da empresa."); return; }
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await fetch("/api/growth-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: `${d.niche} — ${d.companyName}`,
          stage: d.stage,
          monthlyRevenue: `Ticket médio: ${d.avgTicket || "n/d"} | Ciclo: ${d.closingTime || "n/d"}`,
          mainChannel: d.revenueChannels.join(", ") || "Indicação",
          teamSize: `Leads: ${d.leadResponder || "n/d"} | Resposta: ${d.responseTime || "n/d"} | Qualificação: ${d.hasQualification || "n/d"}`,
          biggestChallenge: d.mainProblem || "Não informado",
          mainGoal: d.trafficGoal.join(", ") || "Crescimento geral",
          leadSource: d.revenueChannels.join(", "),
          uniqueValue: `Posicionamento: ${d.positioning.join(", ") || "n/d"}. Diferencial: ${d.differentiator || "n/d"}`,
          whatFailed: d.notes || "Não informado",
          context: JSON.stringify({
            clienteIdeal: d.idealClient,
            estrutura: { instagram: d.hasInstagram, google: d.hasGoogle, site: d.hasSite, crm: d.hasCrm },
            investimento: d.investmentRange,
            metaMensal: d.clientsPerMonth,
            valorCliente: d.clientValue
          }),
          _raw: d
        })
      });
      const json = (await res.json()) as GrowthReport & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Erro");
      setReport(json);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha desconhecida.");
    } finally {
      setLoading(false);
    }
  }

  const phaseLabel = { days30: "30 dias", days60: "60 dias", days90: "90 dias" };

  return (
    <>
      {/* Form blocks — hidden when viewing a past session */}
      {!readOnly && (<>
      {/* 1 — Identificação */}
      <Block num="01" title="Identificação da empresa" hint="Nome e nicho — personaliza toda a análise.">
        <div className="ob-two-col">
          <Q label="Nome da empresa">
            <input className="ob-input" type="text" placeholder="Ex: Iconico, NovaMente, FluxoAds..." value={d.companyName} onChange={e => set("companyName")(e.target.value)} />
          </Q>
          <Q label="Nicho / setor">
            <input className="ob-input" type="text" placeholder="Ex: Arquitetura, Agência de tráfego, SaaS B2B..." value={d.niche} onChange={e => set("niche")(e.target.value)} />
          </Q>
        </div>
        <Q label="Estágio atual do negócio">
          <div className="option-row">
            {["Validando", "0 – 10k/mês", "10k – 50k/mês", "50k – 200k/mês", "+ 200k/mês"].map(v => (
              <Radio key={v} value={v} current={d.stage} onChange={set("stage")}>{v}</Radio>
            ))}
          </div>
        </Q>
      </Block>

      {/* 2 — Como faturam */}
      <Block num="02" title="Como faturam hoje" hint="De onde vem o dinheiro agora.">
        <Q label="Canais de aquisição ativos (pode marcar mais de um)">
          <div className="option-row">
            {["Indicação", "Instagram", "Google", "LinkedIn", "Outbound / cold", "Eventos", "Marketplace", "Outros"].map(v => (
              <Check key={v} value={v} current={d.revenueChannels} onChange={setArr("revenueChannels")}>{v}</Check>
            ))}
          </div>
        </Q>
      </Block>

      {/* 3 — Produto/Serviço */}
      <Block num="03" title="Produto e cliente" hint="Os números que definem a saúde comercial do negócio.">
        <div className="ob-three-col">
          <Q label="Ticket médio">
            <input className="ob-input" type="text" placeholder="Ex: R$ 8.000 / mês" value={d.avgTicket} onChange={e => set("avgTicket")(e.target.value)} />
          </Q>
          <Q label="Perfil do cliente ideal">
            <input className="ob-input" type="text" placeholder="Ex: Dono de e-commerce com equipe" value={d.idealClient} onChange={e => set("idealClient")(e.target.value)} />
          </Q>
          <Q label="Tempo médio de fechamento">
            <input className="ob-input" type="text" placeholder="Ex: 2 semanas" value={d.closingTime} onChange={e => set("closingTime")(e.target.value)} />
          </Q>
        </div>
      </Block>

      {/* 4 — Posicionamento */}
      <Block num="04" title="Posicionamento" hint="Como querem ser percebidos no mercado.">
        <Q label="Como querem ser vistos? (pode marcar mais de um)">
          <div className="option-row">
            {["Premium", "Alto padrão", "Acessível", "Técnico", "Inovador", "Conceitual", "Referência no nicho"].map(v => (
              <Check key={v} value={v} current={d.positioning} onChange={setArr("positioning")}>{v}</Check>
            ))}
          </div>
        </Q>
        <Q label="O que diferencia vocês hoje?">
          <textarea className="ob-textarea" rows={2} placeholder="Deixa eles falarem — anote aqui..." value={d.differentiator} onChange={e => set("differentiator")(e.target.value)} />
        </Q>
      </Block>

      {/* 5 — Problema atual */}
      <Block num="05" title="Problema atual" hint="O gargalo que está impedindo o crescimento — o mais importante de entender.">
        <Q label="Hoje o maior problema é:">
          <div className="option-row">
            {["Falta de leads", "Leads desqualificados", "Baixa conversão", "Falta de previsibilidade", "Ticket baixo", "Dependência de indicação", "Time pequeno"].map(v => (
              <Radio key={v} value={v} current={d.mainProblem} onChange={set("mainProblem")}>{v}</Radio>
            ))}
          </div>
        </Q>
      </Block>

      {/* 6 — Objetivo */}
      <Block num="06" title="Objetivo com tráfego e marketing" hint="O que querem conquistar com uma estratégia de crescimento.">
        <Q label="O que querem hoje? (pode marcar mais de um)">
          <div className="option-row">
            {["Mais clientes", "Leads mais qualificados", "Posicionamento de marca", "Escala rápida", "Menos dependência de indicação", "Entrar em novo segmento", "Aumentar ticket"].map(v => (
              <Check key={v} value={v} current={d.trafficGoal} onChange={setArr("trafficGoal")}>{v}</Check>
            ))}
          </div>
        </Q>
      </Block>

      {/* 7 — Estrutura */}
      <Block num="07" title="Estrutura digital atual" hint="O que já existe rodando hoje.">
        <div className="ob-infra-grid">
          {([["Instagram ativo?", "hasInstagram"], ["Google ativo?", "hasGoogle"], ["Site?", "hasSite"], ["CRM?", "hasCrm"]] as const).map(([label, field]) => (
            <div key={field} className="ob-infra-item">
              <p className="ob-infra-label">{label}</p>
              <YesNo value={d[field]} onChange={set(field)} />
            </div>
          ))}
        </div>
      </Block>

      {/* 8 — Processo comercial */}
      <Block num="08" title="Processo comercial" hint="Como os leads são tratados depois que chegam.">
        <Q label="Quem responde os leads?">
          <div className="option-row">
            {["Dono", "Equipe", "Misto"].map(v => (
              <Radio key={v} value={v} current={d.leadResponder} onChange={set("leadResponder")}>{v}</Radio>
            ))}
          </div>
        </Q>
        <Q label="Tempo de resposta ao lead:">
          <div className="option-row">
            {["Imediato", "Horas", "Dias"].map(v => (
              <Radio key={v} value={v} current={d.responseTime} onChange={set("responseTime")}>{v}</Radio>
            ))}
          </div>
        </Q>
        <Q label="Existe qualificação antes da reunião?">
          <YesNo value={d.hasQualification} onChange={set("hasQualification")} />
        </Q>
      </Block>

      {/* 9 — Investimento */}
      <Block num="09" title="Investimento em marketing" hint="Budget disponível para colocar o plano em prática.">
        <Q label="Quanto pretendem investir inicialmente?">
          <div className="option-row">
            {["Até R$ 1.000", "R$ 1k – R$ 3k", "R$ 3k – R$ 10k", "Acima de R$ 10k"].map(v => (
              <Radio key={v} value={v} current={d.investmentRange} onChange={set("investmentRange")}>{v}</Radio>
            ))}
          </div>
        </Q>
      </Block>

      {/* 10 — Meta e ROI */}
      <Block num="10" title="Meta real e ROI" hint='A pergunta que fecha: "Se a gente trouxer X clientes por mês, já resolve?"'>
        <div className="ob-two-col">
          <Q label="Quantos clientes por mês já seria suficiente?">
            <input className="ob-input" type="text" placeholder="Ex: 4 novos clientes/mês" value={d.clientsPerMonth} onChange={e => set("clientsPerMonth")(e.target.value)} />
          </Q>
          <Q label="Um cliente fechado representa quanto em média?">
            <input className="ob-input" type="text" placeholder="Ex: R$ 15.000 de receita" value={d.clientValue} onChange={e => set("clientValue")(e.target.value)} />
          </Q>
        </div>
        {d.clientsPerMonth && d.clientValue ? (
          <div className="ob-roi-preview">
            <span className="section-kicker">Preview de ROI</span>
            <p>Com <strong>{d.clientsPerMonth}</strong> e ticket de <strong>{d.clientValue}</strong> — construa esse número na cabeça deles antes de fechar.</p>
          </div>
        ) : null}
        <Q label="Observações da reunião (objeções, contexto, sinais):">
          <textarea className="ob-textarea" rows={2} placeholder="Anote tudo que vai ajudar a IA a personalizar o plano..." value={d.notes} onChange={e => set("notes")(e.target.value)} />
        </Q>
      </Block>

      </>)}

      {/* CTA — only in new mode */}
      {!readOnly && (<>
      {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
      <div className="workspace-actions" style={{ marginTop: 8 }}>
        <button type="button" className="primary-button" onClick={() => void run()} disabled={loading}>
          {loading ? "Analisando negócio..." : "Gerar plano de crescimento"}
        </button>
        {report ? (
          <button type="button" className="ghost-button" onClick={() => { setReport(null); setD(EMPTY); setError(null); }}>
            Novo onboarding
          </button>
        ) : null}
      </div>
      </>)}

      {/* Loading */}
      {loading ? (
        <section className="panel-shell" style={{ textAlign: "center", padding: "48px 24px", marginTop: 20 }}>
          <div className="growth-loading__pulse" style={{ margin: "0 auto 20px" }} />
          <p className="section-kicker">Processando</p>
          <h3 style={{ margin: "8px 0 0" }}>Analista de growth trabalhando...</h3>
          <p className="panel-header__copy">Lendo contexto, identificando gargalos e mapeando alavancas de crescimento.</p>
        </section>
      ) : null}

      {/* Report */}
      {report && !loading ? (
        <>
          <div className="metrics-grid" style={{ marginTop: 20 }}>
            <ScoreCard label="Growth Score" value={`${report.growthScore}`} tone="violet" hint="Potencial de crescimento com os recursos atuais." />
            <ScoreCard label="Meta mensal" value={d.clientsPerMonth || "—"} tone="cyan" hint="Volume que muda o cenário da operação." />
            <ScoreCard label="Valor por cliente" value={d.clientValue || "—"} tone="green" hint="Receita média por fechamento." />
            <ScoreCard label="Investimento" value={d.investmentRange || "—"} tone="blue" hint="Budget disponível para ativar o crescimento." />
          </div>

          <section className="panel-shell">
            <p className="section-kicker">Diagnóstico</p>
            <h3 style={{ margin: "8px 0 16px" }}>{report.diagnosis.title}</h3>
            <blockquote className="growth-bottleneck-quote">{report.bottleneck}</blockquote>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: "12px 0 0" }}>{report.diagnosis.body}</p>
          </section>

          <section className="panel-shell">
            <p className="section-kicker">Oportunidades</p>
            <h3 style={{ margin: "8px 0 16px" }}>Alavancas identificadas</h3>
            <div className="growth-opportunities-grid" style={{ marginTop: 0 }}>
              {report.opportunities.map((opp, i) => (
                <article key={i} className="scheduled-card" style={{ display: "block", padding: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <h4 style={{ margin: 0 }}>{opp.title}</h4>
                    <span className={`status-pill status-pill--${opp.priority === "alta" ? "pending" : opp.priority === "media" ? "approved" : "scheduled"}`}>{opp.priority}</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>{opp.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel-shell">
            <p className="section-kicker">Plano de execução</p>
            <h3 style={{ margin: "8px 0 0" }}>Roadmap 30 / 60 / 90 dias</h3>
            <div className="growth-phase-tabs">
              {(["days30", "days60", "days90"] as const).map(p => (
                <button key={p} type="button" className={`growth-phase-tab${phase === p ? " is-active" : ""}`} onClick={() => setPhase(p)}>{phaseLabel[p]}</button>
              ))}
            </div>
            <div className="scheduled-list" style={{ marginTop: 0 }}>
              {report.roadmap[phase].map((item, i) => (
                <div key={i} className="scheduled-card" style={{ gridTemplateColumns: "32px 1fr", gap: 14, padding: "14px 16px" }}>
                  <span className="growth-roadmap-item__num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{item.action}</strong>
                    <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.55 }}>{item.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="growth-bottom-grid" style={{ marginTop: 0 }}>
            <section className="panel-shell" style={{ marginTop: 0 }}>
              <p className="section-kicker">Próximos movimentos</p>
              <h3 style={{ margin: "8px 0 16px" }}>3 ações imediatas</h3>
              <div className="scheduled-list" style={{ marginTop: 0 }}>
                {report.nextMoves.map((move, i) => (
                  <article key={i} className="scheduled-card" style={{ display: "block", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(var(--glow-cyan),0.14)", color: "var(--cyan)", display: "grid", placeItems: "center", fontSize: "0.82rem", fontWeight: 700 }}>{i + 1}</span>
                      <span className="format-pill">{move.effort}</span>
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
