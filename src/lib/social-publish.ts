import { deserializeContentPayload } from "@/lib/content-persistence";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import { ErizonContentOutput, PublicationChannel } from "@/types/content";

type PublishResult = {
  channel: PublicationChannel;
  externalId: string;
};

type PostRow = {
  id: string;
  title: string;
  caption: string | null;
  status: string;
};

type ActivityRow = {
  message: string;
};

export async function publishPostToChannel(
  postId: string,
  channel: PublicationChannel
): Promise<PublishResult> {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase nao configurado para publicar.");
  }

  const supabase = getSupabaseClient();

  const postResult = await supabase
    .from("posts")
    .select("id, title, caption, status")
    .eq("id", postId)
    .single();

  if (postResult.error || !postResult.data) {
    throw new Error(postResult.error?.message ?? "Post nao encontrado.");
  }

  const activityResult = await supabase
    .from("post_activities")
    .select("message")
    .eq("post_id", postId)
    .eq("type", "publish");

  if (activityResult.error) {
    throw new Error(activityResult.error.message);
  }

  const previousMessages = (activityResult.data as ActivityRow[]).map((item) => item.message);

  if (previousMessages.some((message) => message.startsWith(`Published on ${channel}:`))) {
    throw new Error(`Este post ja foi publicado no canal ${channel}.`);
  }

  const content = deserializeContentPayload((postResult.data as PostRow).caption);

  if (!content) {
    throw new Error("Conteudo estruturado nao encontrado para este post.");
  }

  if (content.canais_publicacao?.length && !content.canais_publicacao.includes(channel)) {
    throw new Error(`O canal ${channel} nao esta habilitado para esta peca.`);
  }

  if (channel === "linkedin") {
    const externalId = await publishToLinkedIn(content);

    return {
      channel,
      externalId
    };
  }

  const externalId = await publishToInstagram(content);

  return {
    channel,
    externalId
  };
}

async function publishToLinkedIn(content: ErizonContentOutput) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrnInput = process.env.LINKEDIN_PERSON_URN;

  if (!accessToken || !personUrnInput) {
    throw new Error("Credenciais do LinkedIn ausentes.");
  }

  const author = personUrnInput.startsWith("urn:")
    ? personUrnInput
    : `urn:li:person:${personUrnInput}`;

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0"
    },
    body: JSON.stringify({
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: truncate(`${content.gancho}\n\n${content.legenda}`, 3000)
          },
          shareMediaCategory: "NONE",
          media: []
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }),
    cache: "no-store"
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Falha ao publicar no LinkedIn: ${responseText}`);
  }

  return response.headers.get("x-restli-id") ?? "linkedin-post-created";
}

async function publishToInstagram(content: ErizonContentOutput) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const graphVersion = process.env.INSTAGRAM_GRAPH_VERSION ?? "v22.0";

  if (!accessToken || !accountId) {
    throw new Error("Credenciais do Instagram ausentes.");
  }

  if (!content.asset_url_publicacao) {
    throw new Error("Instagram exige asset_url_publicacao para publicar.");
  }

  const containerResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${accountId}/media`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        image_url: content.asset_url_publicacao,
        caption: truncate(`${content.gancho}\n\n${content.legenda}`, 2200),
        access_token: accessToken
      }),
      cache: "no-store"
    }
  );

  const containerPayload = (await containerResponse.json()) as {
    id?: string;
    error?: { message?: string };
  };

  if (!containerResponse.ok || !containerPayload.id) {
    throw new Error(
      `Falha ao criar container no Instagram: ${containerPayload.error?.message ?? "sem detalhes"}`
    );
  }

  const publishResponse = await fetch(
    `https://graph.facebook.com/${graphVersion}/${accountId}/media_publish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        creation_id: containerPayload.id,
        access_token: accessToken
      }),
      cache: "no-store"
    }
  );

  const publishPayload = (await publishResponse.json()) as {
    id?: string;
    error?: { message?: string };
  };

  if (!publishResponse.ok || !publishPayload.id) {
    throw new Error(
      `Falha ao publicar no Instagram: ${publishPayload.error?.message ?? "sem detalhes"}`
    );
  }

  return publishPayload.id;
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}
