import { CalendarPost } from "@/lib/calendar";

type CalendarBoardProps = {
  monthLabel: string;
  days: Array<{
    key: string;
    label: number | null;
    isoDate: string | null;
    isCurrentMonth: boolean;
    isToday: boolean;
    posts: CalendarPost[];
  }>;
};

const statusLabel: Record<CalendarPost["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado"
};

export function CalendarBoard({ monthLabel, days }: CalendarBoardProps) {
  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Agenda real</p>
          <h3>{monthLabel}</h3>
          <p className="panel-header__copy">
            Grade mensal da operacao com leitura por data, formato e status.
          </p>
        </div>
      </div>

      <div className="calendar-grid">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
          <div key={day} className="calendar-grid__header">
            {day}
          </div>
        ))}

        {days.map((day) => (
          <div
            key={day.key}
            className={`calendar-cell${day.isCurrentMonth ? "" : " is-muted"}`}
          >
            {day.label ? (
              <div className={`calendar-cell__day${day.isToday ? " is-today" : ""}`}>
                {day.label}
              </div>
            ) : null}

            <div className="calendar-cell__posts">
              {day.posts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className={`calendar-post calendar-post--${post.status}`}
                  title={`${post.title} • ${statusLabel[post.status]}`}
                >
                  <span>{post.title}</span>
                </div>
              ))}
              {day.posts.length > 3 ? (
                <div className="calendar-post calendar-post--more">
                  +{day.posts.length - 3} posts
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
