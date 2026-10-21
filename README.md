# Mangfoldshuset Vestland

[![Tests](https://github.com/ElisaRumSolberg/Mangfoldshuset_Vestland/actions/workflows/test.yml/badge.svg)](https://github.com/ElisaRumSolberg/Mangfoldshuset_Vestland/actions/workflows/test.yml)

Website and admin panel for **Mangfoldshuset Vestland**, a non-profit community organisation in Bergen, Norway. The site presents activities, committees and news to the public, takes membership applications, and gives volunteers an admin area to run everything without a developer.

**Live:** <https://www.mangfoldshusetvestland.no>

> The source is public as a portfolio piece. The organisation's name, logo and content belong to Mangfoldshuset Vestland.

## What it does

**Public site (Norwegian)**
- Home page with animated impact counters, upcoming activities and news
- Activities (one-off events and weekly/monthly recurring programmes, computed automatically), with year-grouped archive, sign-up forms and reports from past events
- Committee ("utvalg") pages that assemble themselves from the activities, photos and feedback tagged for them
- Membership form (single or family), volunteer, idea and partnership forms, contact form
- Magazine viewer (PDF flip-book), news, privacy policy and membership terms
- SEO: sitemap, canonical URLs, structured data; accessibility work (44 px targets, headings, labels, forced-light colour scheme)

**Admin panel (Norwegian / Turkish, switchable)**
- Role-based access: `owner`, `editor`, and `utvalg` (can edit only their own committee)
- Activities, recurring programmes, committees, news, magazine issues, site images and Vipps link
- Members: status badges, search, age/gender statistics for grant reporting, edit, mark as paid, per-person view of family memberships
- Messages and applications inbox
- In-app user guide, confirmation before every delete, clear success/error messages
- Password reset flow

**Automation**
- Daily cron that e-mails members before and after their membership expires
- Daily cron that reminds new members who have not paid yet (3 and 14 days)
- E-mail notifications to the organisation for new members, messages and applications

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, `proxy.ts`), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase: Postgres with Row Level Security, Auth, Storage |
| E-mail | Resend (verified domain, SPF/DKIM) |
| Hosting | Vercel (cron jobs, preview and production deployments) |
| Validation | Zod |
| Tests | Vitest (unit), Playwright + axe-core (browser/accessibility audit) |

## Security notes

- Row Level Security on every table. Private data (members, messages, applications, sign-ups) cannot be read with the public API key.
- Roles live in `app_metadata` (set only through the Supabase SQL editor); `admin_role()` returns nothing for anonymous requests. Every server action also re-checks the role.
- Public sign-up on the Supabase project is disabled; admins are created manually.
- Spam protection on public forms (honeypot, minimum fill time, per-address rate limit) and server-side validation.
- Secrets are environment variables only. Nothing sensitive is committed.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your own Supabase / Resend values
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (anon/publishable) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for cron jobs and rate limiting |
| `RESEND_API_KEY`, `RESEND_FROM` | Outgoing e-mail |
| `CRON_SECRET` | Authorises the cron endpoints |
| `NEXT_PUBLIC_SITE_URL` | Canonical site address |

### Database

The schema is a set of idempotent SQL files in [`supabase/`](supabase). See [`supabase/README.md`](supabase/README.md) for the order to run them.

### Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run lint     # ESLint
npm test         # unit tests (Vitest)
npx playwright test   # read-only browser/accessibility audit
```

## Project structure

```
src/
  app/            routes: public pages, /admin, /api/cron
  components/     shared UI (navbar, footer, sliders, forms, admin language switch)
  lib/            domain logic: validation, recurring dates, member statistics,
                  reminders, i18n for the admin, Supabase clients, auth guards
supabase/         SQL migrations and policies
tests/browser/    Playwright audit
```
