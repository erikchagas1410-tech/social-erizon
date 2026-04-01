import { ApprovalQueueItem } from "@/lib/content-persistence";

type ApprovalQueuePanelProps = {
  items: ApprovalQueueItem[];
};

export function ApprovalQueuePanel({ items }: ApprovalQueuePanelProps) {
  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Fila real</p>
          <h3>Aguardando aprovacao</h3>
          <p className="panel-header__copy">
            Tudo o que a IA gerar entra aqui para decisao antes de seguir para agendamento.
          </p>
        </div>
      </div>

      <div className="approval-list">
        {items.map((item) => (
          <article key={item.id} className="approval-card">
            <div className="approval-card__top">
              <span className="status-pill status-pill--pending">Pendente</span>
              <span className="format-pill">{item.format}</span>
            </div>
            <h4>{item.title}</h4>
            <p>{item.content?.ideia_central ?? item.captionPreview}</p>
            <div className="approval-card__meta">
              <span>{formatDate(item.createdAt)}</span>
              <span>{item.content?.pilar ?? "sem pilar identificado"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
