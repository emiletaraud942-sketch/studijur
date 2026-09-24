# cours/

Miroir en Markdown du dossier Google Drive **« Cours propre »** : la mise au
propre quotidienne des cours de droit d'Émile, déjà utilisée pour alimenter
le corpus JSON du site (`/mes-cours`, génération de fiches, recherche).

## Pourquoi ce dossier existe

Le Drive reste la **source de vérité** — c'est là que la mise au propre
quotidienne écrit. Ce dossier est une **copie de lecture** pensée pour être
consultée directement depuis le dépôt : `Glob`/`Grep` sur ces fichiers coûte
beaucoup moins cher qu'un aller-retour `search_files` + `read_file_content`
sur Drive à chaque fois qu'une session a besoin d'une info précise dans les
cours (une date, une définition, un exemple de jurisprudence...).

## Convention de nommage

Un fichier par document Drive, préfixé par son numéro de matière tel qu'il
apparaît dans le titre du document Drive (`01 — ...` → `01-....md`) :

- `01-introduction-aux-normes-juridiques.md`
- `02-introduction-generale-au-droit.md`
- `03-dates-et-articles-a-connaitre.md`
- `04-introduction-historique-au-droit-public.md`
- `05-droit-constitutionnel.md`
- `05b-etats-composes-et-notion-de-constitution-23-09-2026.md` — addendum
  daté, pas encore fusionné dans `05` (voir plus bas)
- `06-organisation-juridictionnelle.md`
- `07-methodologie.md`
- `08-ue5-perspectives-europeennes-internationales.md`

Un document daté ajouté en cours de semaine (ex. `05b`, ajouté le
23/09/2026) reste un fichier séparé jusqu'à sa **consolidation du dimanche**
dans le document principal correspondant — exactement comme côté Drive.
Quand la consolidation a lieu sur Drive, le fichier `NNb-...md` doit être
supprimé du dépôt et son contenu fusionné dans `NN-....md`.

## Mise à jour

Ce dossier est tenu à jour par la routine **« StudiJur — sync site depuis
Cours propre (19h30) »** : à chaque fois qu'elle intègre du contenu Drive
modifié dans le corpus JSON du site, elle met aussi à jour le fichier
`cours/<slug>.md` correspondant, dans le même commit. La routine **« Mise au
propre quotidienne des cours de droit » (17h00)** ne touche jamais ce
dossier : elle reste volontairement limitée à Drive.

En cas de doute sur la fraîcheur d'un fichier, la ligne *dernière mise à
jour* en tête de chaque document donne la date de la dernière modification
côté Drive au moment de la copie.
