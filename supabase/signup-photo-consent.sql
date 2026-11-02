-- Bildesamtykke ved påmelding til aktiviteter (valgfritt avkrysningsfelt i påmeldingsskjemaet).
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.
-- Kjør denne FØR koden som bruker kolonnen publiseres, ellers feiler påmeldinger.

alter table activity_signups add column if not exists photo_consent boolean not null default false;
