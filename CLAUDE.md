# StudiJur — 5 minutes de droit par jour

Application de révision quotidienne pour les étudiants en L1 de droit (Émile Taraud, aussi étudiant en droit). Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4, Supabase (auth/sync), Stripe (abonnement), Anthropic API (génération de leçons depuis des cours déposés), déployée sur Vercel (`studijur.fr`).

## Principe à toujours respecter

L'app fonctionne **sans aucune clé** (corpus L1 embarqué, progression locale au navigateur). Chaque intégration (`ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_*`, `STRIPE_*`) débloque une capacité en plus, **jamais** une dépendance dure — ne jamais faire planter ou dégrader brutalement l'app en l'absence d'une de ces clés.

## Sous-agents du projet (`.claude/agents/`)

- **`frontend`** — pages/composants (Next.js/React/Tailwind).
- **`backend`** — API routes, Supabase, Stripe, génération IA des leçons, cron/relances.
- **`data-security`** — RLS/migrations, secrets, auth des routes cron/admin, traitement des cours déposés par les étudiants comme contenu non fiable.
- **`qa`** — build, tests (vitest), `e2e.mjs` (jamais `e2e-prod.mjs` sans le dire explicitement, il vise le site en production).
- **`compta`** — abonnement Stripe, essai gratuit, `/cgv` — conseille, ne remplace pas une vraie relecture fiscale/juridique.
- **`marketing`** — landing `/presentation`, parrainage, emails de relance, pousse-notifications, classement.

Pas d'agent `rh` ici : StudiJur n'a pas de volet équipe/staff à ce jour. Flux recommandé : `backend`/`frontend` implémentent → `qa` vérifie → `data-security` relit si la modif touche RLS/secrets/paiement → `compta`/`marketing` donnent leur avis si pertinent → l'utilisateur valide avant merge.

## Git

Chaque changement part sur une branche, est poussé, puis une Pull Request est ouverte vers `main`. **Ne jamais merger sans que l'utilisateur l'ait explicitement demandé.**
