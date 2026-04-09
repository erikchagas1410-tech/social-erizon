"use client";

import { useEffect, useState } from "react";

type AnalyticsSummary = {
  reach: number;
  impressions: number;
  engagement: number;
  followerGrowth: number;
  growthData: Array<{
    date: string;
    followers: number;
  }>;
  topPosts: Array<{
    caption: string;
    engagement: number;
    source: "manual" | "super-agent";
  }>;
  sourceBreakdown: Array<{
    source: "manual" | "super-agent";
    posts: number;
    share: number;
  }>;
};

const dayOptions = [7, 30, 90] as const;

export function AnalyticsWorkspace() {
  const [days, setDays] = useState<(typeof dayOptions)[number]>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/analytics-summary?days=${days}`, {
          cache: "no-store"
        });
        const payload = (await response.json()) as AnalyticsSummary;

        if (!response.ok) {
          throw new Error("Falha ao carregar o resumo de analytics.");
        }

        if (isMounted) {
          setData(payload);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Falha desconhecida ao carregar analytics."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, [days]);

  return (
    <>
      <section className="panel-shell">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Leitura real</p>
            <h3>Resumo de performance</h3>
            <p className="panel-header__copy">
              Alcance, impressao, engajamento e crescimento com recorte dinamico.
            </p>
          </div>

          <div className="segmented-actions" aria-label="Periodo de analytics">
            {dayOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`ghost-button${days === option ? " is-active" : ""}`}
                onClick={() => setDays(option)}
              >
                {option} dias
              </button>
            ))}
          </div>
        </div>

        <div className="metrics-grid metrics-grid--workspace">
          <AnalyticsMetricCard
            label="Reach"
            value={loading ? "..." : formatNumber(data?.reach ?? 0)}
            hint="Volume estimado de pessoas alcancadas."
          />
          <AnalyticsMetricCard
            label="Impressoes"
            value={loading ? "..." : formatNumber(data?.impressions ?? 0)}
            hint="Exibicoes acumuladas no periodo."
          />
          <AnalyticsMetricCard
            label="Engajamento"
            value={loading ? "..." : formatNumber(data?.engagement ?? 0)}
            hint="Interacoes uteis geradas pelos posts."
          />
          <AnalyticsMetricCard
            label="Crescimento"
            value={
              loading ? "..." : formatSignedNumber(data?.followerGrowth ?? 0)
            }
            hint="Variacao projetada de seguidores."
          />
        </div>

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
      </section>

      <section className="analytics-grid">
        <div className="panel-shell">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Tendencia</p>
              <h3>Crescimento por data</h3>
            </div>
          </div>

          <div className="trend-list">
            {loading ? (
              <p className="panel-header__copy">Carregando serie do periodo...</p>
            ) : data?.growthData.length ? (
              data.growthData.map((point) => (
                <div key={point.date} className="trend-row">
                  <span>{formatDate(point.date)}</span>
                  <strong>{formatSignedNumber(point.followers)}</strong>
                </div>
              ))
            ) : (
              <p className="panel-header__copy">
                Ainda nao existem publicacoes suficientes para montar a serie.
              </p>
            )}
          </div>
        </div>

        <div className="panel-shell">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Origem</p>
              <h3>Manual vs Super Agente</h3>
            </div>
          </div>

          <div className="top-posts-list">
            {loading ? (
              <p className="panel-header__copy">Carregando distribuicao...</p>
            ) : data?.sourceBreakdown.length ? (
              data.sourceBreakdown.map((item) => (
                <article key={item.source} className="top-post-card">
                  <span className="format-pill">
                    {item.source === "super-agent" ? "Super Agente" : "Manual"}
                  </span>
                  <h4>{formatNumber(item.posts)} posts publicados</h4>
                  <p>{item.share}% do volume publicado no periodo</p>
                </article>
              ))
            ) : (
              <p className="panel-header__copy">
                Ainda nao existe volume publicado para comparar origens.
              </p>
            )}
          </div>
        </div>

        <div className="panel-shell">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Top posts</p>
              <h3>Melhores entregas do periodo</h3>
            </div>
          </div>

          <div className="top-posts-list">
            {loading ? (
              <p className="panel-header__copy">Carregando ranking...</p>
            ) : data?.topPosts.length ? (
              data.topPosts.map((post, index) => (
                <article key={`${post.caption}-${index}`} className="top-post-card">
                  <span className="format-pill">
                    #{index + 1} {post.source === "super-agent" ? "• SA" : "• Manual"}
                  </span>
                  <h4>{post.caption}</h4>
                  <p>{formatNumber(post.engagement)} interacoes estimadas</p>
                </article>
              ))
            ) : (
              <p className="panel-header__copy">
                Nenhum post publicado entrou nesse recorte ainda.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function AnalyticsMetricCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="metric-card metric-card--blue">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <p className="metric-card__hint">{hint}</p>
    </article>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatSignedNumber(value: number) {
  const formatted = formatNumber(Math.abs(value));
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short"
  }).format(new Date(`${value}T00:00:00`));
}
