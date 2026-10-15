-- Kjønn for medlemmer (valgfritt felt, brukes til statistikk/rapportering til støtteordninger).
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.
-- Familiemedlemmer ligger i family_members (JSON) og trenger ingen endring.

alter table members add column if not exists gender text;

alter table members drop constraint if exists members_gender_check;
alter table members add constraint members_gender_check
  check (gender is null or gender in ('kvinne', 'mann', 'annet', 'ukjent'));
