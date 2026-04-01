import path from "node:path";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export async function uploadAssetForPublishing(file: File): Promise<string> {
  if (!file || !file.size) {
    throw new Error("Nenhum arquivo valido foi enviado para publicacao.");
  }

  const mimeType = file.type || "application/octet-stream";
  const extension = inferExtension(file.name, mimeType);
  const bytes = Buffer.from(await file.arrayBuffer());

  if (hasSupabaseEnv()) {
    return uploadToSupabaseStorage(bytes, mimeType, extension);
  }

  const blobToken =
    process.env.BLOB_READ_WRITE_TOKEN ?? process.env.BLOB_UPLOAD_TOKEN ?? "";

  if (blobToken) {
    return uploadToVercelBlob(bytes, mimeType, extension, blobToken);
  }

  if (process.env.IMGBB_API_KEY) {
    return uploadToImgBb(bytes, process.env.IMGBB_API_KEY);
  }

  throw new Error(
    "Nenhum storage configurado para upload de asset. Configure Supabase Storage, Vercel Blob ou ImgBB."
  );
}

async function uploadToSupabaseStorage(
  bytes: Buffer,
  mimeType: string,
  extension: string
) {
  const supabase = getSupabaseClient();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "erizon-media";
  const objectPath = `posts/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const uploadResult = await supabase.storage
    .from(bucket)
    .upload(objectPath, bytes, {
      contentType: mimeType,
      upsert: true
    });

  if (uploadResult.error) {
    throw new Error(`Falha ao subir asset no Supabase Storage: ${uploadResult.error.message}`);
  }

  const publicResult = supabase.storage.from(bucket).getPublicUrl(objectPath);

  if (!publicResult.data.publicUrl) {
    throw new Error("Nao foi possivel gerar a URL publica do asset no Supabase.");
  }

  return publicResult.data.publicUrl;
}

async function uploadToVercelBlob(
  bytes: Buffer,
  mimeType: string,
  extension: string,
  token: string
) {
  const filename = `erizon-post-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const response = await fetch(`https://blob.vercel-storage.com/${filename}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": mimeType,
      "x-api-version": "7"
    },
    body: bytes,
    cache: "no-store"
  });

  const payload = (await response.json()) as { url?: string; error?: { message?: string } };

  if (!response.ok || !payload.url) {
    throw new Error(
      `Falha ao subir asset no Vercel Blob: ${payload.error?.message ?? "sem detalhes"}`
    );
  }

  return payload.url;
}

async function uploadToImgBb(bytes: Buffer, apiKey: string) {
  const formData = new URLSearchParams();
  formData.append("key", apiKey);
  formData.append("image", bytes.toString("base64"));

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
    cache: "no-store"
  });

  const payload = (await response.json()) as {
    success?: boolean;
    data?: {
      url?: string;
      image?: { url?: string };
      medium?: { url?: string };
      thumb?: { url?: string };
    };
    error?: { message?: string };
  };

  const candidates = [
    payload.data?.url,
    payload.data?.image?.url,
    payload.data?.medium?.url,
    payload.data?.thumb?.url
  ].filter(Boolean) as string[];

  const url = candidates.find((candidate) => candidate.startsWith("http"));

  if (!response.ok || !payload.success || !url) {
    throw new Error(
      `Falha ao subir asset no ImgBB: ${payload.error?.message ?? "sem detalhes"}`
    );
  }

  return url;
}

function inferExtension(filename: string, mimeType: string) {
  const rawExtension = path.extname(filename).replace(".", "").toLowerCase();

  if (rawExtension) {
    return rawExtension;
  }

  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}
