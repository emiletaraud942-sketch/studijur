create table public.questions_actu (
  id uuid primary key default gen_random_uuid(),
  actualite_id uuid not null references public.actualites(id) on delete cascade,
  enonce text not null,
  type text not null check (type in ('qcm', 'vrai_faux', 'ouverte')),
  choix jsonb,
  reponse text not null,
  explication text not null,
  source_citee text not null,
  created_at timestamptz not null default now()
);

comment on table public.questions_actu is
  'Question(s) associée(s) à une actualité (public.actualites). choix ne sert que pour type=''qcm'' (tableau de propositions). source_citee est distincte de actualites.source_url : elle permet de citer un texte précis (article de code, arrêt) si la question en vise un.';

create index questions_actu_actualite_id_idx on public.questions_actu (actualite_id);

alter table public.questions_actu enable row level security;

-- Même règle que actualites : visible seulement si l'actu parente est publiée.
create policy questions_actu_select_published on public.questions_actu
  for select
  using (
    exists (
      select 1 from public.actualites a
      where a.id = questions_actu.actualite_id and a.statut = 'published'
    )
  );
