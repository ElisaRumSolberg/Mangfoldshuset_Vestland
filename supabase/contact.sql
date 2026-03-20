-- Kjør denne i SQL Editor -> New query.

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

create policy "Alle kan sende kontaktmelding" on contact_messages
  for insert with check (true);

create policy "Innloggede kan lese kontaktmeldinger" on contact_messages
  for select using (auth.role() = 'authenticated');

create policy "Innloggede kan slette kontaktmeldinger" on contact_messages
  for delete using (auth.role() = 'authenticated');
