import { ActivityItem } from "@/types/dashboard";

type ActivityFeedProps = {
  items: ActivityItem[];
};

const activityLabel: Record<ActivityItem["type"], string> = {
  approval: "Aprovacao",
  generation: "Geracao",
  schedule: "Agendamento",
  publish: "Publicacao",
  error: "Erro"
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <aside className="activity-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Agora</p>
          <h3>Feed de atividade</h3>
          <p className="panel-header__copy">
            Eventos que mantem a central com cara de operacao viva.
          </p>
        </div>
      </div>

      <div className="activity-list">
        {items.map((item) => (
          <article key={item.id} className={`activity-card activity-card--${item.type}`}>
            <div className="activity-card__eyebrow">
              <span>{activityLabel[item.type]}</span>
              <time dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
            </div>
            <p>{item.message}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
