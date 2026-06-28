-- Run this in Supabase → SQL Editor to create the public "media" bucket
-- used by the admin for image/media and résumé uploads.
-- Safe to re-run (idempotent).

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
