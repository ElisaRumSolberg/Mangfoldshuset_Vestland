-- Tillegg til aktiviteter: fremheving + rapport («Slik gikk det») med bilder.
-- Kjør i Supabase Dashboard -> SQL Editor -> New query. Trygt å kjøre flere ganger.
-- (Erstatter featured.sql – den kan kjøres på nytt uten problemer.)

alter table activities add column if not exists featured boolean not null default false;

alter table activities add column if not exists participants int
  check (participants is null or participants >= 0);        -- antall deltakere
alter table activities add column if not exists summary text;   -- kort oppsummering
alter table activities add column if not exists feedback text;  -- tilbakemeldinger, ett utsagn per linje (uten navn)
alter table activities add column if not exists photos text[] not null default '{}'; -- bildeadresser
