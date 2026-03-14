-- Kjør denne ETTER schema.sql og storage.sql, i SQL Editor -> New query.

-- Video-støtte på aktiviteter og nyheter
alter table activities add column if not exists video_url text;
alter table news add column if not exists video_url text;

-- Mangfoldsposten (magasin-utgaver med PDF)
create table if not exists magazine_issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issue_date date not null default current_date,
  cover_image_url text,
  pdf_url text not null,
  created_at timestamptz not null default now()
);

alter table magazine_issues enable row level security;

create policy "Alle kan lese magasinutgaver" on magazine_issues for select using (true);
create policy "Innloggede kan endre magasinutgaver" on magazine_issues for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
