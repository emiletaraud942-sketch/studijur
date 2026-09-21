# StudiJur — 5 minutes de droit par jour

Entraînement quotidien pour les étudiants en L1 de droit : une leçon de 5 minutes,
cinq définitions en révision espacée, une question type examen corrigée et un quiz
de cinq questions. Chaque élève peut aussi déposer ses propres cours, dont StudiJur
tire des leçons au même format.

## Démarrer

```bash
npm install
npm run dev
```

L'application fonctionne **sans aucune clé** : le corpus L1 est embarqué et la
progression est stockée dans le navigateur. Chaque clé ajoutée débloque une
capacité supplémentaire, sans changement de code — voir `.env.example`.

| Clé | Ce qu'elle débloque | Sans elle |
|---|---|---|
| `ANTHROPIC_API_KEY` | génération des leçons depuis les cours déposés | analyseur local, qualité moindre |
| `NEXT_PUBLIC_SUPABASE_*` | comptes et synchronisation multi-appareils | progression locale au navigateur |
| `STRIPE_*` | abonnement et essai de 7 jours | accès ouvert |

La page **Réglages** affiche en direct l'état de chaque service.

## Base de données

Coller `supabase/schema.sql` dans le SQL Editor de Supabase. Le script est
idempotent et active la RLS sur les trois tables.

## Contenu

Le corpus vit dans `lib/corpus/` : `meta.json` décrit les matières,
`parts/<prefixe>.<lettre>.json` contient les leçons. `lib/corpus.ts` les assemble
au chargement — aucune étape de build. Pour ajouter une matière : créer le fichier
de leçons, l'enregistrer dans `meta.json` et dans la table `PARTS`.

`python3 scripts-build-corpus.py` valide le corpus (5 définitions et 5 questions
par leçon, index de réponse valides, plans présents).

## Vérification

`node e2e.mjs` déroule un parcours complet dans un navigateur sans interface :
leçon, définitions, question de cours, quiz, persistance, mode sombre, responsive.
