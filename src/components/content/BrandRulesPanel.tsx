import { erizonBrand } from "@/lib/erizon-brand";

export function BrandRulesPanel() {
  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Identidade</p>
          <h3>Motor de marca Erizon</h3>
          <p className="panel-header__copy">
            Diretrizes fixas que orientam toda criacao antes de qualquer texto.
          </p>
        </div>
      </div>

      <div className="brand-grid">
        <article className="brand-card">
          <span className="brand-card__label">Tom</span>
          <strong>{erizonBrand.tone}</strong>
          <p>A marca fala como quem domina decisao, risco e dinheiro.</p>
        </article>
        <article className="brand-card">
          <span className="brand-card__label">Nucleo narrativo</span>
          <strong>Dinheiro, risco e clareza operacional</strong>
          <p>{erizonBrand.narrativeCore.join(" · ")}</p>
        </article>
        <article className="brand-card">
          <span className="brand-card__label">Direcao visual</span>
          <strong>{erizonBrand.style}</strong>
          <div className="color-row">
            {erizonBrand.colors.map((color) => (
              <span
                key={color}
                className="color-swatch"
                style={{ backgroundColor: color }}
                aria-label={color}
              />
            ))}
          </div>
        </article>
      </div>

      <div className="rule-columns">
        <div className="rule-list">
          <span className="brand-card__label">Regras absolutas</span>
          {erizonBrand.rules.map((rule) => (
            <p key={rule}>{rule}</p>
          ))}
        </div>
        <div className="rule-list">
          <span className="brand-card__label">Check final</span>
          {erizonBrand.creativeChecks.map((rule) => (
            <p key={rule}>{rule}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
