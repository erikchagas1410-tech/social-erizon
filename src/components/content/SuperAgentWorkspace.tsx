"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  initialSuperAgentState,
  runSuperAgentAction
} from "@/app/super-agent/actions";

export function SuperAgentWorkspace() {
  const [state, formAction] = useActionState(
    runSuperAgentAction,
    initialSuperAgentState
  );

  const result = state.result;

  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Super Agente Viral</p>
          <h3>Tendencia, carrossel, variantes e agenda em uma execucao</h3>
          <p className="panel-header__copy">
            O agente identifica o melhor sinal, cria narrativa viral e pode mandar as variantes direto para aprovacao.
          </p>
        </div>
      </div>

      <form action={formAction} className="content-form">
        <label className="field-shell">
          <span>Tema, tensao ou mercado para atacar</span>
          <textarea
            name="topic"
            rows={4}
            placeholder="Ex.: ROAS bonito escondendo margem destruida em operacoes que escalam sem diagnostico"
            required
          />
        </label>

        <label className="field-shell">
          <span>Objetivo estrategico</span>
          <textarea
            name="objective"
            rows={3}
            placeholder="Ex.: gerar 3 variacoes fortes para Instagram e LinkedIn com chance real de save e share"
          />
        </label>

        <fieldset className="channel-fieldset">
          <legend>Canais prioritarios</legend>
          <label className="channel-option">
            <input type="checkbox" name="channels" value="linkedin" defaultChecked />
            <span>LinkedIn</span>
          </label>
          <label className="channel-option">
            <input type="checkbox" name="channels" value="instagram" defaultChecked />
            <span>Instagram</span>
          </label>
        </fieldset>

        <label className="channel-option" style={{ justifyContent: "flex-start" }}>
          <input type="checkbox" name="saveVariants" />
          <span>Mandar as variantes virais direto para aprovacao</span>
        </label>

        <label className="channel-option" style={{ justifyContent: "flex-start" }}>
          <input type="checkbox" name="scheduleVariants" />
          <span>Agendar automaticamente as variantes nos primeiros slots da semana</span>
        </label>

        <label className="channel-option" style={{ justifyContent: "flex-start" }}>
          <input type="checkbox" name="executeCampaign" />
          <span>Executar campanha encadeada de 3 posts com espacamento estrategico</span>
        </label>

        <SubmitButton />
      </form>

      {state.error ? <p className="form-feedback form-feedback--error">{state.error}</p> : null}
      {state.success ? <p className="form-feedback form-feedback--success">{state.success}</p> : null}

      {state.savedPostIds.length ? (
        <section className="panel-shell panel-shell--soft" style={{ marginTop: 20 }}>
          <p className="section-kicker">Fila alimentada</p>
          <h4>Posts salvos</h4>
          <p>{state.savedPostIds.join(", ")}</p>
        </section>
      ) : null}

      {state.scheduledPostIds.length ? (
        <section className="panel-shell panel-shell--soft" style={{ marginTop: 20 }}>
          <p className="section-kicker">Calendario alimentado</p>
          <h4>Posts agendados</h4>
          <p>{state.scheduledPostIds.join(", ")}</p>
        </section>
      ) : null}

      {state.campaignPostIds.length ? (
        <section className="panel-shell panel-shell--soft" style={{ marginTop: 20 }}>
          <p className="section-kicker">Campanha executada</p>
          <h4>Posts vinculados ao arco da campanha</h4>
          <p>{state.campaignPostIds.join(", ")}</p>
        </section>
      ) : null}

      {result ? (
        <div style={{ display: "grid", gap: 20, marginTop: 20 }}>
          <section className="panel-shell panel-shell--soft">
            <p className="section-kicker">Sinal lider</p>
            <h4>{result.selectedTrend?.topic ?? "Nenhum sinal encontrado"}</h4>
            <p>{result.selectedTrend?.rationale}</p>
            <p>
              <strong>Viral score:</strong> {result.selectedTrend?.viralScore ?? 0} | <strong>Formato:</strong>{" "}
              {result.selectedTrend?.recommendedFormat ?? "-"} | <strong>Pilar:</strong>{" "}
              {result.selectedTrend?.recommendedPillar ?? "-"}
            </p>
          </section>

          <section className="panel-shell panel-shell--soft">
            <p className="section-kicker">Radar</p>
            <h4>Tendencias ranqueadas</h4>
            <div style={{ display: "grid", gap: 12 }}>
              {result.trends.map((trend) => (
                <div key={trend.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
                  <strong>{trend.topic}</strong>
                  <p>{trend.angle}</p>
                  <p>
                    Score {trend.viralScore} | {trend.source} | {trend.recommendedFormat}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {result.carousel ? (
            <section className="panel-shell panel-shell--soft">
              <p className="section-kicker">Carrossel</p>
              <h4>{result.carousel.title}</h4>
              <div style={{ display: "grid", gap: 12 }}>
                {result.carousel.slides.map((slide) => (
                  <div key={slide.index} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
                    <strong>
                      {slide.index}. {slide.emoji} {slide.headline}
                    </strong>
                    <p>{slide.supportingText}</p>
                    <p>Visual: {slide.visualDirection}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel-shell panel-shell--soft">
            <p className="section-kicker">Variantes virais</p>
            <h4>3 angulos para atacar o mesmo tema</h4>
            <div style={{ display: "grid", gap: 12 }}>
              {result.viralVariants.map((variant) => (
                <div key={variant.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
                  <strong>{variant.hook}</strong>
                  <p>{variant.strategy}</p>
                  <p>
                    Score {variant.viralScore} | {variant.recommendedChannels.join(" + ")} | {variant.recommendedTime}
                  </p>
                  <p>{variant.content.legenda}</p>
                </div>
              ))}
            </div>
          </section>

          {result.campaign ? (
            <section className="panel-shell panel-shell--soft">
              <p className="section-kicker">Campanha</p>
              <h4>{result.campaign.name}</h4>
              <p>{result.campaign.thesis}</p>
              <p>{result.campaign.audienceIntent}</p>
              <div style={{ display: "grid", gap: 12 }}>
                {result.campaign.steps.map((step) => (
                  <div key={step.order} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
                    <strong>
                      Etapa {step.order}: {step.title}
                    </strong>
                    <p>{step.objective}</p>
                    <p>
                      {step.format} | {step.pillar} | D+{step.recommendedDayOffset}
                    </p>
                    <p>
                      Hook: {step.hook}
                    </p>
                    <p>
                      Angulo: {step.angle}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel-shell panel-shell--soft">
            <p className="section-kicker">Scheduler</p>
            <h4>Semana sugerida</h4>
            <div style={{ display: "grid", gap: 12 }}>
              {result.weeklySchedule.map((slot) => (
                <div key={`${slot.day}-${slot.time}`} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 }}>
                  <strong>{slot.day} - {slot.time}</strong>
                  <p>{slot.objective}</p>
                  <p>
                    {slot.format} | {slot.pillar} | {slot.channels.join(" + ")}
                  </p>
                  <p>{slot.reason}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-shell panel-shell--soft">
            <p className="section-kicker">Readiness</p>
            <h4>Canais habilitados</h4>
            <p>
              Instagram: {String(result.publishingReadiness.instagram)} | LinkedIn: {String(result.publishingReadiness.linkedin)} | Facebook: {String(result.publishingReadiness.facebook)} | TikTok: {String(result.publishingReadiness.tiktok)}
            </p>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button" disabled={pending}>
      {pending ? "Executando super agente..." : "Executar Super Agente"}
    </button>
  );
}
