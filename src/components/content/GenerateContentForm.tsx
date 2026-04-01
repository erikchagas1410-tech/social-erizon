"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  generateContentAction,
  initialGenerateContentState
} from "@/app/generate-content/actions";
import { JsonPreview } from "@/components/content/JsonPreview";

const pillarOptions = [
  "autoridade",
  "educacao",
  "desejo",
  "conexao",
  "prova",
  "conversao_indireta"
] as const;

const formatOptions = [
  "carrossel",
  "post_estatico",
  "frase_impacto",
  "comparacao",
  "analise",
  "checklist",
  "mini_aula",
  "provocacao",
  "insight_estrategico",
  "post_de_decisao"
] as const;

export function GenerateContentForm() {
  const [state, formAction] = useActionState(
    generateContentAction,
    initialGenerateContentState
  );

  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Operacao real</p>
          <h3>Gerar e mandar para aprovacao</h3>
          <p className="panel-header__copy">
            A peca nasce com identidade Erizon, e entra direto no fluxo real do produto.
          </p>
        </div>
      </div>

      <form action={formAction} className="content-form">
        <label className="field-shell">
          <span>Tensao ou tema central</span>
          <textarea
            name="topic"
            rows={4}
            placeholder="Ex.: campanhas que escalam volume e destroem margem sem o gestor perceber."
            required
          />
        </label>

        <label className="field-shell">
          <span>Objetivo da peca</span>
          <textarea
            name="objective"
            rows={3}
            placeholder="Ex.: gerar percepcao de autoridade e mostrar que a Erizon revela prejuizo oculto."
          />
        </label>

        <div className="field-grid">
          <label className="field-shell">
            <span>Pilar</span>
            <select name="pillar" defaultValue="">
              <option value="">Escolha automatica pela IA</option>
              {pillarOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-shell">
            <span>Formato</span>
            <select name="format" defaultValue="">
              <option value="">Escolha automatica pela IA</option>
              {formatOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <SubmitButton />
      </form>

      {state.error ? <p className="form-feedback form-feedback--error">{state.error}</p> : null}
      {state.success ? <p className="form-feedback form-feedback--success">{state.success}</p> : null}

      {state.result ? (
        <>
          <div className="generated-summary">
            <div className="generated-summary__header">
              <span className="brand-card__label">Resultado gerado</span>
              {state.savedPostId ? <strong>Post salvo: {state.savedPostId}</strong> : null}
            </div>
            <h4>{state.result.gancho}</h4>
            <p>{state.result.legenda}</p>
          </div>
          <JsonPreview title="JSON real gerado pela IA" value={state.result} />
        </>
      ) : null}
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button" disabled={pending}>
      {pending ? "Gerando conteudo..." : "Gerar e enviar para aprovacao"}
    </button>
  );
}
