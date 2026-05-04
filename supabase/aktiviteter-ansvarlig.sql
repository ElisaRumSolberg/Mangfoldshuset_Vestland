-- Ansvarlig person for en aktivitet (navn, telefon, e-post), vises nederst på
-- aktivitetens kort/side med klikkbare kontaktlenker.
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table activities add column if not exists responsible_name text;
alter table activities add column if not exists responsible_phone text;
alter table activities add column if not exists responsible_email text;
