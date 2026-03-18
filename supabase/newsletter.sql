-- Kjør denne i SQL Editor -> New query.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Alle kan melde seg på nyhetsbrevet" on newsletter_subscribers
  for insert with check (true);

create policy "Innloggede kan se abonnenter" on newsletter_subscribers
  for select using (auth.role() = 'authenticated');
