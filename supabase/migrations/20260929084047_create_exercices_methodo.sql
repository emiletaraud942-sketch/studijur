create table public.exercices_methodo (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('cas_pratique', 'commentaire_arret', 'dissertation')),
  notion_id text not null,
  enonce text not null,
  grille_correction jsonb not null,
  corrige_type text not null,
  statut text not null default 'draft' check (statut in ('draft', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

comment on table public.exercices_methodo is
  'Exercice de méthode (cas pratique / commentaire d''arrêt / dissertation), généré en brouillon par l''IA à partir du contenu existant d''une notion (leçon du corpus), puis relu à la main avant publication. notion_id référence l''id d''une leçon (pas de FK : le corpus n''est pas en base). Pas de notation automatique : l''élève s''auto-évalue contre grille_correction (tableau de critères) et corrige_type après rédaction libre — voir app/entrainement-methode.';
comment on column public.exercices_methodo.grille_correction is
  'Tableau de critères de correction (jsonb, ex. ["cite l''article applicable", "qualifie correctement les faits", ...]) — pas de pondération par critère pour l''instant.';

create index exercices_methodo_statut_idx on public.exercices_methodo (statut);
create index exercices_methodo_notion_id_idx on public.exercices_methodo (notion_id);

alter table public.exercices_methodo enable row level security;

-- Même convention que public.actualites : lecture publique des seuls
-- exercices publiés ; toute écriture (génération, édition, validation,
-- rejet) passe par la clé de service côté serveur.
create policy exercices_methodo_select_published on public.exercices_methodo
  for select
  using (statut = 'published');
