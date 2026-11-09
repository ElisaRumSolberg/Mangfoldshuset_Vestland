-- Automatiske tall for forsiden («Samfunnsinnsats»).
-- Faste tilbud: gjennomsnittlig antall deltakere per gang, hvor mange uker i året de samles,
-- og frivillig innsats per gang. Antall samlinger regnes ut fra første dato.
-- Enkeltaktiviteter: frivillige timer totalt. Kjør i Supabase -> SQL Editor. Trygt å kjøre flere ganger.

alter table recurring_programs add column if not exists avg_participants int check (avg_participants is null or avg_participants >= 0);
alter table recurring_programs add column if not exists weeks_per_year int not null default 32 check (weeks_per_year between 1 and 52);
alter table recurring_programs add column if not exists volunteers_per_session int check (volunteers_per_session is null or volunteers_per_session >= 0);
alter table recurring_programs add column if not exists hours_per_volunteer numeric(4,1) check (hours_per_volunteer is null or hours_per_volunteer between 0 and 24);

alter table activities add column if not exists volunteer_hours int check (volunteer_hours is null or volunteer_hours >= 0);
