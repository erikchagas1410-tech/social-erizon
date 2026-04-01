import { approvePost, schedulePost } from "@/app/command-center/actions";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ScheduledPost } from "@/types/dashboard";

type ScheduledPanelProps = {
  posts: ScheduledPost[];
};

const formatLabel: Record<ScheduledPost["format"], string> = {
  feed: "Feed",
  carousel: "Carousel",
  story: "Story",
  reel: "Reel"
};

const statusLabel: Record<ScheduledPost["status"], string> = {
  pending: "Pendente",
  approved: "Aprovado",
  scheduled: "Agendado",
  published: "Publicado"
};

export function ScheduledPanel({ posts }: ScheduledPanelProps) {
  if (!posts.length) {
    return (
      <section className="panel-shell panel-shell--soft">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Pipeline</p>
            <h3>Proximos agendados</h3>
          </div>
          <button type="button" className="ghost-button">
            Ver calendario
          </button>
        </div>
        <EmptyState
          title="Nenhum post futuro encontrado"
          description="A operacao ainda nao tem publicacoes definidas para os proximos dias."
          ctaLabel="Aprovar posts"
        />
      </section>
    );
  }

  return (
    <section className="panel-shell">
      <div className="panel-header">
        <div>
          <p className="section-kicker">Pipeline</p>
          <h3>Proximos agendados</h3>
          <p className="panel-header__copy">
            Conteudos prontos para aprovacao, sequenciamento e publicacao.
          </p>
        </div>
        <button type="button" className="ghost-button">
          Ver calendario
        </button>
      </div>

      <div className="scheduled-list">
        {posts.map((post) => (
          <article key={post.id} className="scheduled-card">
            <div className="scheduled-card__meta">
              <span className={`status-pill status-pill--${post.status}`}>
                {statusLabel[post.status]}
              </span>
              <span className="format-pill">{formatLabel[post.format]}</span>
            </div>

            <div className="scheduled-card__content">
              <h4>{post.title}</h4>
              <p>{formatDateTime(post.scheduledFor)}</p>
            </div>

            <div className="scheduled-card__actions">
              <form action={approvePost}>
                <input type="hidden" name="postId" value={post.id} />
                <button
                  type="submit"
                  className="primary-button secondary"
                  disabled={post.status !== "pending"}
                >
                  Aprovar
                </button>
              </form>

              <form action={schedulePost}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="scheduledFor" value={post.scheduledFor} />
                <button
                  type="submit"
                  className="ghost-button"
                  disabled={post.status === "published"}
                >
                  Agendar
                </button>
              </form>
            </div>
          </article>
        ))}
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
