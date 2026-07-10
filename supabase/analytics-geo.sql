-- Migration: add approximate visitor-location columns to analytics_events.
-- Idempotent — safe to run on an existing database. Run this in the Supabase
-- SQL editor once. `country` already existed; `city`/`region` are new.
--
-- Location is captured first-party (client-side IP geolocation), only after the
-- visitor accepts analytics cookies. It is approximate and cookieless.

alter table public.analytics_events add column if not exists city   text;
alter table public.analytics_events add column if not exists region text;

-- Existing RLS policies (anon insert, authenticated read/delete) already cover
-- all columns, so no policy changes are needed.
