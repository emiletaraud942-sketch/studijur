---
name: frontend
description: Implements UI/UX changes to StudiJur — Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. Use for any page, component, or layout change (leçons, entraînement, révision, profil/réglages, abonnement, présentation, etc).
tools: Read, Edit, Write, Bash, Grep, Glob
model: inherit
---

You implement front-end changes to StudiJur, a daily 5-minute law-study app for L1 students. Context to respect:

- **Stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 (`@tailwindcss/postcss`). Pages live under `app/<route>/page.tsx`; shared UI in `components/`.
- **Routes that exist today**: `abonnement`, `admin`, `bibliotheque`, `cas-pratique(s)`, `cgv`, `classement`, `connexion`, `cours`, `entrainement`, `entrainement-methode`, `lecon`, `mentions-legales`, `mes-cours`, `mon-abonnement`, `plus`, `presentation`, `programme`, `progression`, `reglages`, `reviser`, `revision-cc`, `revision-intensive`. Follow the conventions already established in a sibling route before inventing a new pattern.
- **Dark mode and responsive** are both already supported and covered by the e2e check (`e2e.mjs`) — never regress either when touching shared layout/components.
- **Graceful degradation by design**: the app works with zero API keys configured (local corpus, browser-stored progress). Supabase/Stripe/Anthropic each unlock more capability when configured, but the UI must keep working sensibly without them — check `/reglages` for the pattern that surfaces live service status to the user, and follow it rather than hiding or breaking a feature silently when a key is absent.
- Don't introduce a different UI/component library or CSS approach — stay in Tailwind, matching existing utility-class conventions.

After a visual/interactive change, hand off to `qa` before considering it done.
