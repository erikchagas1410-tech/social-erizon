create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  caption text,
  format text not null check (format in ('feed', 'carousel', 'story', 'reel')),
  status text not null check (status in ('pending', 'approved', 'scheduled', 'published')),
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_activities (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  type text not null check (type in ('approval', 'generation', 'schedule', 'publish', 'error')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists posts_status_idx on public.posts(status);
create index if not exists posts_scheduled_for_idx on public.posts(scheduled_for);
create index if not exists post_activities_post_id_idx on public.post_activities(post_id);
create index if not exists post_activities_created_at_idx on public.post_activities(created_at desc);

create or replace view public.dashboard_metrics as
select
  count(*) filter (where status = 'pending')::int as pending_approval,
  count(*) filter (where status = 'scheduled')::int as scheduled,
  count(*) filter (where status = 'published')::int as published,
  case
    when count(*) filter (where status in ('approved', 'scheduled', 'published')) = 0 then 0
    else round(
      (
        count(*) filter (where status in ('scheduled', 'published'))::numeric
        / count(*) filter (where status in ('approved', 'scheduled', 'published'))::numeric
      ) * 100,
      2
    )
  end as approval_rate
from public.posts;

create table if not exists public.super_agent_runs (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  objective text,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists super_agent_runs_created_at_idx on public.super_agent_runs(created_at desc);
