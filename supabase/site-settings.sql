-- Globale bilder som admin kan bytte ut (forsiden og Om oss), i stedet for
-- den innebygde fargeplakaten. Flere bilder glir automatisk over i hverandre
-- som en slideshow. Én rad (id = 1). Trygt å kjøre flere ganger.

create table if not exists site_settings (
  id int primary key default 1,
  hero_images text[] not null default '{}',
  om_oss_images text[] not null default '{}',
  check (id = 1)
);

insert into site_settings (id)
values (1)
on conflict (id) do nothing;

alter table site_settings enable row level security;

drop policy if exists "Alle kan lese site_settings" on site_settings;
create policy "Alle kan lese site_settings" on site_settings
  for select using (true);

drop policy if exists "Innloggede kan endre site_settings" on site_settings;
create policy "Innloggede kan endre site_settings" on site_settings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
