import { ErizonContentOutput } from "@/types/content";

type PersistedPostRow = {
  id: string;
  title: string;
  caption: string | null;
  format: string;
  status: string;
  created_at: string;
};

export type ApprovalQueueItem = {
  id: string;
  title: string;
  format: string;
  status: string;
  createdAt: string;
  content: ErizonContentOutput | null;
  captionPreview: string;
};

export function serializeContentPayload(content: ErizonContentOutput) {
  return JSON.stringify(content);
}

export function deserializeContentPayload(
  value: string | null
): ErizonContentOutput | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ErizonContentOutput;
  } catch {
    return null;
  }
}

export function toApprovalQueueItem(row: PersistedPostRow): ApprovalQueueItem {
  const content = deserializeContentPayload(row.caption);

  return {
    id: row.id,
    title: row.title,
    format: row.format,
    status: row.status,
    createdAt: row.created_at,
    content,
    captionPreview:
      content?.legenda ?? row.caption ?? "Conteudo salvo sem legenda estruturada."
  };
}
