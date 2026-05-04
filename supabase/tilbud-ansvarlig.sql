-- Ansvarlig person for et fast tilbud (navn, telefon), i tillegg til det
-- eksisterende "contact" (e-post) feltet. Vises nederst på tilbudets kort.
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table recurring_programs add column if not exists responsible_name text;
alter table recurring_programs add column if not exists responsible_phone text;
