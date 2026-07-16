-- Migration: block by EMAIL — a stable identifier that follows a person across
-- devices/browsers, unlike the anonymous per-browser visitor id. Idempotent;
-- run in the Supabase SQL editor.
--
-- Enforced both client-side (booking + contact forms check before submitting)
-- and server-side (the booking Apps Script checks before creating the event).

create table if not exists public.blocked_emails (
  email      text primary key,
  reason     text,
  created_at timestamptz not null default now()
);

alter table public.blocked_emails enable row level security;

-- Only the authenticated admin can view or manage the email blocklist.
drop policy if exists "admin manage email blocklist" on public.blocked_emails;
create policy "admin manage email blocklist"
  on public.blocked_emails for all
  to authenticated using (true) with check (true);

-- Security-definer check so anonymous callers (the public site) and the Apps
-- Script can test ONE email without reading the whole list. Case-insensitive.
create or replace function public.is_email_blocked(em text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocked_emails where lower(email) = lower(trim(em))
  );
$$;

grant execute on function public.is_email_blocked(text) to anon, authenticated;
