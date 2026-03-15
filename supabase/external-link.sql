-- Kjør denne i SQL Editor -> New query.

alter table activities add column if not exists external_link text;
alter table news add column if not exists external_link text;
