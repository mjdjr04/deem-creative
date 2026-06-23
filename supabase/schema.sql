-- ============================================================================
-- Deem Creative — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / idempotent policy drops).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Content table
-- One row per editable section of the site. Each row keeps a DRAFT copy and a
-- PUBLISHED copy of its data as JSON. The admin panel edits draft_data; the
-- public site reads published_data; the "Publish All Changes" button copies
-- draft_data -> published_data for every row.
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  section        text primary key,
  draft_data     jsonb not null default '[]'::jsonb,
  published_data jsonb not null default '[]'::jsonb,
  updated_at     timestamptz not null default now()
);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_site_content on public.site_content;
create trigger trg_touch_site_content
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- Anyone (anon) may READ. Only authenticated (logged-in admin) may WRITE.
-- ---------------------------------------------------------------------------
alter table public.site_content enable row level security;

drop policy if exists "public read content"      on public.site_content;
drop policy if exists "authenticated write content" on public.site_content;
drop policy if exists "authenticated update content" on public.site_content;
drop policy if exists "authenticated delete content" on public.site_content;

create policy "public read content"
  on public.site_content for select
  using (true);

create policy "authenticated write content"
  on public.site_content for insert
  to authenticated with check (true);

create policy "authenticated update content"
  on public.site_content for update
  to authenticated using (true) with check (true);

create policy "authenticated delete content"
  on public.site_content for delete
  to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 3. Publish helper — promotes every draft to published in one atomic call.
-- The admin "Publish All Changes" button calls this via RPC.
-- ---------------------------------------------------------------------------
create or replace function public.publish_all()
returns void
language sql
security definer
set search_path = public
as $$
  -- `section` is the primary key (never null); the WHERE clause satisfies the
  -- "no UPDATE without WHERE" safety guard while still updating every row.
  update public.site_content set published_data = draft_data where section is not null;
$$;

revoke all on function public.publish_all() from anon;
grant execute on function public.publish_all() to authenticated;

-- ---------------------------------------------------------------------------
-- 3b. Contact-form messages
-- Anyone may submit (insert); only the logged-in admin may read/update/delete.
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  phone      text,
  company    text,
  message    text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
-- If the table already exists from an earlier version, add the new columns:
alter table public.messages add column if not exists phone   text;
alter table public.messages add column if not exists company text;

alter table public.messages enable row level security;

drop policy if exists "anyone can submit a message" on public.messages;
drop policy if exists "authenticated read messages"  on public.messages;
drop policy if exists "authenticated update messages" on public.messages;
drop policy if exists "authenticated delete messages" on public.messages;

create policy "anyone can submit a message"
  on public.messages for insert
  to anon, authenticated with check (true);

create policy "authenticated read messages"
  on public.messages for select
  to authenticated using (true);

create policy "authenticated update messages"
  on public.messages for update
  to authenticated using (true) with check (true);

create policy "authenticated delete messages"
  on public.messages for delete
  to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 3c. Chatbot logs
-- Anyone may log a chat exchange (insert); only the admin may read/delete.
-- ---------------------------------------------------------------------------
create table if not exists public.chats (
  id         uuid primary key default gen_random_uuid(),
  session_id text,
  question   text,
  answer     text,
  created_at timestamptz not null default now()
);

alter table public.chats enable row level security;

drop policy if exists "anyone can log a chat"   on public.chats;
drop policy if exists "authenticated read chats" on public.chats;
drop policy if exists "authenticated delete chats" on public.chats;

create policy "anyone can log a chat"
  on public.chats for insert
  to anon, authenticated with check (true);

create policy "authenticated read chats"
  on public.chats for select
  to authenticated using (true);

create policy "authenticated delete chats"
  on public.chats for delete
  to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 3d. Analytics events (first-party, privacy-respecting)
-- Anyone may INSERT a page view / event (only after the visitor accepts
-- analytics cookies on the site); only the logged-in admin may read.
-- No personal data is stored — ids are random and not tied to identity.
-- ---------------------------------------------------------------------------
create table if not exists public.analytics_events (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,            -- 'pageview' | 'event'
  name          text,                     -- event name (null for pageviews)
  path          text,                     -- route, e.g. /portfolio
  referrer_host text,                     -- external referrer hostname
  visitor_id    text,                     -- random id (unique-visitor counting)
  session_id    text,                     -- random per-tab id (visit grouping)
  device        text,                     -- mobile | tablet | desktop
  browser       text,
  os            text,
  screen_w      integer,
  country       text,                     -- reserved for future edge geolocation
  props         jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_type       on public.analytics_events (type);
create index if not exists idx_analytics_path       on public.analytics_events (path);

alter table public.analytics_events enable row level security;

drop policy if exists "anyone can log analytics"      on public.analytics_events;
drop policy if exists "authenticated read analytics"  on public.analytics_events;
drop policy if exists "authenticated delete analytics" on public.analytics_events;

create policy "anyone can log analytics"
  on public.analytics_events for insert
  to anon, authenticated with check (true);

create policy "authenticated read analytics"
  on public.analytics_events for select
  to authenticated using (true);

create policy "authenticated delete analytics"
  on public.analytics_events for delete
  to authenticated using (true);

-- ---------------------------------------------------------------------------
-- 4. Storage bucket for media + resume uploads (public read, admin write).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media"        on storage.objects;
drop policy if exists "authenticated write media" on storage.objects;
drop policy if exists "authenticated update media" on storage.objects;
drop policy if exists "authenticated delete media" on storage.objects;

create policy "public read media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "authenticated write media"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'media');

create policy "authenticated update media"
  on storage.objects for update
  to authenticated using (bucket_id = 'media');

create policy "authenticated delete media"
  on storage.objects for delete
  to authenticated using (bucket_id = 'media');
