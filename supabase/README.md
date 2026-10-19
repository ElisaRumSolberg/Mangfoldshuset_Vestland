# Database (Supabase)

All files are idempotent and can be run more than once in **Supabase → SQL Editor → New query**.

## Run order for a fresh project

1. `schema.sql` – core tables (activities, news, impact stats)
2. `storage.sql` – the `images` bucket
3. `media.sql` – videos and magazine issues
4. `site-settings.sql`, `site-settings-vipps.sql` – editable site images and Vipps link
5. `members.sql`, `members-gender.sql` – membership register
6. `contact.sql`, `applications.sql`, `newsletter.sql`, `paamelding.sql` – public forms
7. `tilbud*.sql`, `utvalg.sql` – recurring programmes and committees
8. `aktivitet*.sql`, `aktiviteter-*.sql`, `activities-price.sql`, `external-link.sql`, `forsidebilder-flere.sql` – activity extras
9. `roles-rls-fix.sql` – role-based Row Level Security (owner / editor / utvalg)
10. `audit-hardening-review.sql` – **current** `admin_role()` definition (missing role never grants access)

## Superseded – do not run

- `roles-rls-hotfix.sql` – an earlier emergency fix. Its `admin_role()` defaults to `owner` when no role is set, which is unsafe. It is kept only for history. Use `audit-hardening-review.sql` instead.

## Setting a role

Roles are stored in `auth.users.raw_app_meta_data` and can only be set from the SQL editor:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"owner"}'::jsonb
where email = 'admin@example.com';
```

Use `owner`, `editor` or `utvalg` (the last one also needs `"utvalg_id": "<id>"`).
