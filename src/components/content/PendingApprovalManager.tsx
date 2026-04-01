"use client";

import { bulkApprovePosts, bulkSchedulePosts } from "@/app/approval/actions";
import { ApprovalQueueItem } from "@/lib/content-persistence";

type PendingApprovalManagerProps = {
  title: string;
  description: string;
  items: ApprovalQueueItem[];
  mode: "approve" | "schedule";
};

export function PendingApprovalManager({
  title,
  description,
  items,
  mode
}: PendingApprovalManagerProps) {
  if (!items.length) {
    return null;
  }

  const action = mode === "approve" ? bulkApprovePosts : bulkSchedulePosts;

  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">{mode === "approve" ? "Decisao" : "Agendamento"}</p>
          <h3>{title}</h3>
          <p className="panel-header__copy">{description}</p>
        </div>
      </div>

      <form action={action} className="queue-form">
        {mode === "schedule" ? (
          <label className="field-shell">
            <span>Data e hora do agendamento</span>
            <input name="scheduledFor" type="datetime-local" required />
          </label>
        ) : null}

        <div className="approval-list">
          {items.map((item) => (
            <label key={item.id} className="approval-card approval-card--selectable">
              <div className="approval-card__select">
                <input type="checkbox" name="postIds" value={item.id} />
                <span className="status-pill status-pill--pending">
                  {mode === "approve" ? "Pendente" : "Aprovado"}
                </span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.content?.ideia_central ?? item.captionPreview}</p>
              <div className="approval-card__meta">
                <span>{formatDate(item.createdAt)}</span>
                <span>{item.content?.pilar ?? "sem pilar"}</span>
              </div>
            </label>
          ))}
        </div>

        <button type="submit" className="primary-button">
          {mode === "approve" ? "Aprovar selecionados" : "Agendar selecionados"}
        </button>
      </form>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
