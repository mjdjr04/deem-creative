-- Migration: soft-block list for abusive/spam visitors. Idempotent — safe to
-- run on an existing database from the Supabase SQL editor.
--
-- This is an IN-APP soft block: the site refuses form submissions from a blocked
-- anonymous visitor id. It deters casual repeat spammers but is bypassable
-- (clearing browser data / incognito / VPN yields a new id). For a true network
-- block, use Cloudflare (see docs/CLOUDFLARE_BLOCKING.md).

create table if not exists public.blocked_visitors (
  visitor_id text primary key,
  reason     text,
  created_at timestamptz not null default now()
);

alter table public.blocked_visitors enable row level security;

-- Only the authenticated admin can view or manage the blocklist.
drop policy if exists "admin manage blocklist" on public.blocked_visitors;
create policy "admin manage blocklist"
  on public.blocked_visitors for all
  to authenticated using (true) with check (true);

-- Anonymous visitors must NOT be able to read the whole list (it would leak
-- every blocked id). Instead this security-definer function lets them check
-- ONLY whether one specific id is blocked, returning a single boolean.
create or replace function public.is_visitor_blocked(vid text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.blocked_visitors where visitor_id = vid);
$$;

grant execute on function public.is_visitor_blocked(text) to anon, authenticated;
