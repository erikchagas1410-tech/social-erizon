import { cancelSchedule, reschedulePost } from "@/app/calendar/actions";
import { CalendarPost } from "@/lib/calendar";

type CalendarQueueProps = {
  posts: CalendarPost[];
};

const formatLabel: Record<CalendarPost["format"], string> = {
  feed: "Feed",
  carousel: "Carousel",
  story: "Story",
  reel: "Reel"
};

const statusLabel: Record<CalendarPost["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado"
};

export function CalendarQueue({ posts }: CalendarQueueProps) {
  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Fila temporal</p>
          <h3>Posts com data definida</h3>
          <p className="panel-header__copy">
            Reagende ou remova slots diretamente da agenda operacional.
          </p>
        </div>
      </div>

      <div className="calendar-queue">
        {posts.length ? (
          posts.map((post) => (
            <article key={post.id} className="calendar-queue__card">
              <div className="calendar-queue__top">
                <span className={`status-pill status-pill--${post.status}`}>
                  {statusLabel[post.status]}
                </span>
                <span className="format-pill">{formatLabel[post.format]}</span>
              </div>

              <h4>{post.title}</h4>
              <p>{post.ideaCentral ?? post.captionPreview}</p>

              <div className="calendar-queue__meta">
                <span>{formatDateTime(post.scheduledFor)}</span>
                <span>{post.publishedAt ? "Ja publicado" : "Aguardando slot"}</span>
              </div>

              <div className="calendar-queue__actions">
                <form action={reschedulePost} className="calendar-queue__form">
                  <input type="hidden" name="postId" value={post.id} />
                  <input
                    type="datetime-local"
                    name="scheduledFor"
                    defaultValue={toDatetimeLocal(post.scheduledFor)}
                    required
                  />
                  <button type="submit" className="primary-button secondary">
                    Reagendar
                  </button>
                </form>

                <form action={cancelSchedule}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="ghost-button"
                    disabled={post.status === "published"}
                  >
                    Remover agenda
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state__orb" />
            <h3>Nenhum post agendado neste mes</h3>
            <p>A agenda ainda nao tem publicacoes definidas neste periodo.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short"
  }).format(new Date(value));
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
