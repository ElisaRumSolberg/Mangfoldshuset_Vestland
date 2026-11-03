-- Bilde av ukens rett, knyttet til ett ukenummer (vises bare den uken).
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table recurring_programs add column if not exists menu_image_url text;
alter table recurring_programs add column if not exists menu_image_week int;
