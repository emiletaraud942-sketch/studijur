create table public.actualites (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  resume text not null,
  date_publication date not null,
  source_url text not null,
  source_nom text not null,
  notion_id text not null,
  url_origine text,
  statut text not null default 'draft' check (statut in ('draft', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

comment on table public.actualites is
  'Actu juridique du jour, générée en brouillon par l''IA puis relue à la main avant publication. notion_id référence l''id d''une leçon du corpus statique (pas de FK : le corpus n''est pas en base). Jamais publiée sans source_url ni notion_id (voir règles applicatives dans lib/actualites.ts).';
comment on column public.actualites.url_origine is
  'URL collée dans l''admin ayant servi de matière première au brouillon — peut différer de source_url (la source officielle citée à l''élève, ex. Légifrance).';

create index actualites_statut_idx on public.actualites (statut);
create index actualites_notion_id_idx on public.actualites (notion_id);

alter table public.actualites enable row level security;

-- Lecture publique des actus publiées uniquement (élève connecté ou non) ;
-- toute écriture (génération, édition, validation, rejet) passe par la
-- clé de service côté serveur, jamais par le client — même convention que
-- public.course_submissions.
create policy actualites_select_published on public.actualites
  for select
  using (statut = 'published');
