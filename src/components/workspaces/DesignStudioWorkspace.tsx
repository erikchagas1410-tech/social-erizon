"use client";

import { useEffect, useState } from "react";

type StudioPost = {
  id: string;
  status: string;
  caption: string;
  images: string[];
  scheduledAt: string | null;
  createdAt: string;
  postType: string;
  editorialTab: string;
};

type ApprovalQueueResponse = {
  items: StudioPost[];
};

const editorialTabs = [
  { value: "diagnostics", label: "Diagnosticos" },
  { value: "authority", label: "Autoridade" },
  { value: "anti-myth", label: "Anti-mitos" },
  { value: "social-proof", label: "Prova social" },
  { value: "tweet-style", label: "Tweet style" },
  { value: "deep-dive", label: "Deep dive" },
  { value: "erizon", label: "Produto Erizon" },
  { value: "specialists", label: "Especialistas" }
] as const;

const postTypes = [
  { value: "instagram-feed", label: "Instagram Feed" },
  { value: "instagram-carousel", label: "Instagram Carrossel" },
  { value: "instagram-story", label: "Instagram Story" }
] as const;

export function DesignStudioWorkspace() {
  const [editorialTab, setEditorialTab] =
    useState<(typeof editorialTabs)[number]["value"]>("diagnostics");
  const [postType, setPostType] =
    useState<(typeof postTypes)[number]["value"]>("instagram-feed");
  const [posts, setPosts] = useState<StudioPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<StudioPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadGallery();
  }, []);

  async function loadGallery() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/approval-queue", {
        cache: "no-store"
      });
      const payload = (await response.json()) as ApprovalQueueResponse;

      if (!response.ok) {
        throw new Error("Falha ao carregar a galeria do estudio.");
      }

      setPosts(payload.items ?? []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Falha desconhecida ao carregar galeria."
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateAsset() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/agency-generate-queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          editorialTab,
          postType
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Falha ao gerar criativo.");
      }

      setSuccess("Criativo gerado e enviado para a fila real.");
      await loadGallery();
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Falha desconhecida ao gerar criativo."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="panel-shell">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Criacao real</p>
            <h3>Gerar novo criativo</h3>
            <p className="panel-header__copy">
              Escolha o enquadramento e mande a peca direto para a operacao.
            </p>
          </div>
        </div>

        <div className="field-grid">
          <label className="field-shell">
            <span>Tipo de post</span>
            <select
              value={postType}
              onChange={(event) =>
                setPostType(event.target.value as (typeof postTypes)[number]["value"])
              }
            >
              {postTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-shell">
            <span>Aba editorial</span>
            <select
              value={editorialTab}
              onChange={(event) =>
                setEditorialTab(
                  event.target.value as (typeof editorialTabs)[number]["value"]
                )
              }
            >
              {editorialTabs.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="workspace-actions">
          <button
            type="button"
            className="primary-button"
            onClick={generateAsset}
            disabled={submitting}
          >
            {submitting ? "Gerando criativo..." : "Gerar criativo"}
          </button>
          <button type="button" className="ghost-button" onClick={() => void loadGallery()}>
            Atualizar galeria
          </button>
        </div>

        {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}
        {success ? <p className="form-feedback form-feedback--success">{success}</p> : null}
      </section>

      <section className="panel-shell">
        <div className="panel-header">
          <div>
            <p className="section-kicker">Galeria viva</p>
            <h3>Criativos gerados</h3>
            <p className="panel-header__copy">
              Clique em qualquer card para abrir o criativo e a legenda completa.
            </p>
          </div>
        </div>

        <div className="studio-gallery">
          {loading ? (
            <p className="panel-header__copy">Carregando criativos...</p>
          ) : posts.length ? (
            posts.map((post) => (
              <button
                key={post.id}
                type="button"
                className="studio-card"
                onClick={() => setSelectedPost(post)}
              >
                {post.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.images[0]}
                    alt={post.caption.slice(0, 80)}
                    className="studio-card__image"
                  />
                ) : (
                  <div className="studio-card__placeholder">Sem imagem disponivel</div>
                )}
                <div className="studio-card__body">
                  <div className="studio-card__meta">
                    <span className="format-pill">{formatPostType(post.postType)}</span>
                    <span className="status-pill status-pill--pending">
                      {formatStatus(post.status)}
                    </span>
                  </div>
                  <h4>{post.caption.slice(0, 96)}</h4>
                  <p>{post.editorialTab || "sem editorial"}</p>
                </div>
              </button>
            ))
          ) : (
            <p className="panel-header__copy">
              Nenhum criativo ainda. Gere o primeiro para popular o estudio.
            </p>
          )}
        </div>
      </section>

      {selectedPost ? (
        <div
          className="studio-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="studio-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <div>
                <p className="section-kicker">Detalhe do criativo</p>
                <h3>{formatPostType(selectedPost.postType)}</h3>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setSelectedPost(null)}
              >
                Fechar
              </button>
            </div>

            {selectedPost.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedPost.images[0]}
                alt={selectedPost.caption.slice(0, 80)}
                className="studio-modal__image"
              />
            ) : null}

            <div className="generated-summary">
              <div className="generated-summary__header">
                <span className="brand-card__label">{formatStatus(selectedPost.status)}</span>
                <strong>{selectedPost.editorialTab || "sem editorial"}</strong>
              </div>
              <p>{selectedPost.caption}</p>
              <p>
                Criado em {formatDateTime(selectedPost.createdAt)}
                {selectedPost.scheduledAt
                  ? ` · Agendado para ${formatDateTime(selectedPost.scheduledAt)}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatStatus(value: string) {
  switch (value) {
    case "pending_approval":
      return "Aguardando aprovacao";
    case "scheduled":
      return "Agendado";
    case "published":
      return "Publicado";
    default:
      return value;
  }
}

function formatPostType(value: string) {
  switch (value) {
    case "instagram-feed":
      return "Instagram Feed";
    case "instagram-carousel":
      return "Instagram Carrossel";
    case "instagram-story":
      return "Instagram Story";
    case "linkedin":
      return "LinkedIn";
    default:
      return value;
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
