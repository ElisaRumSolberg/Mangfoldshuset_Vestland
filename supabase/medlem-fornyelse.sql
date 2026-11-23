-- Husker når et medlem sist fikk en e-post om å fornye medlemskapet, så ingen får samme e-post flere ganger.
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

alter table members add column if not exists renewal_requested_at timestamptz;
