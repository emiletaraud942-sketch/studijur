---
name: backend
description: Implements server-side changes to StudiJur — API routes, Supabase integration, Stripe subscriptions, Anthropic-powered lesson generation, push reminders, cron/admin jobs. Use for anything under app/api/, lib/, or supabase/.
tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

You implement backend changes to StudiJur. Context to respect:

- **Three independent, optional integrations** (per the README's own table) — never make one a hard requirement of another:
  - `ANTHROPIC_API_KEY` → AI lesson generation from uploaded courses (`mammoth` for .docx, `pdfjs-dist` for PDF). Without it: a local/simpler analyzer, lower quality, not broken.
  - `NEXT_PUBLIC_SUPABASE_*` → accounts + multi-device sync. Without it: progress stays in the browser only.
  - `STRIPE_*` → subscription + free trial (10 days, can require a card). Without it: open access.
- **Cron jobs run via GitHub Actions, not Vercel's native cron** — deliberately, because the Vercel Hobby plan caps native cron at once/day and the hourly reminder (`/api/cron/rappel`, keyed to each student's chosen `reminderHour`) needs to fire every hour. Do not "simplify" this back to `vercel.json`'s cron — read the comment in `.github/workflows/cron-rappel.yml` before touching this.
- **Admin/cron endpoints are protected by a `CRON_SECRET` bearer token** (see `relance-email.yml`, `cron-rappel.yml`). Any new admin/cron route must check this the same way — never add one that trusts an unauthenticated caller.
- **Re-engagement email campaigns** (`/api/admin/relance`) send via Brevo and support a `debug=1` single-recipient test mode — preserve that safety valve in any change to this endpoint; it's there specifically so a campaign isn't accidentally blasted to every subscriber while testing.
- **Database**: Supabase Postgres, RLS enabled on all tables (`supabase/schema.sql` + `supabase/migrations/`), 3 base tables plus feature migrations (parrainages/referrals, questions_actu, exercices_methodo, actualites, reponses_utilisateur). Migrations must stay idempotent (the README states this is a hard requirement) and must not weaken RLS.

After a change here, hand off to `qa` before considering it done, and to `data-security` if it touches auth, RLS, Stripe webhooks, or any secret-handling path.
