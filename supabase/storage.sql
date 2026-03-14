-- Kjør denne ETTER schema.sql, i SQL Editor -> New query.
-- Oppretter en public storage-bucket for bilder til aktiviteter og nyheter.

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Alle kan se bilder" on storage.objects
  for select using (bucket_id = 'images');

create policy "Innloggede kan laste opp bilder" on storage.objects
  for insert with check (bucket_id = 'images' and auth.role() = 'authenticated');

create policy "Innloggede kan slette bilder" on storage.objects
  for delete using (bucket_id = 'images' and auth.role() = 'authenticated');
