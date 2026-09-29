create table public.reponses_utilisateur (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notion_id text not null,
  question_id text not null,
  source text not null check (source in ('actu', 'quiz', 'definition', 'exam')),
  correcte boolean not null,
  temps_reponse_ms integer,
  created_at timestamptz not null default now()
);

comment on table public.reponses_utilisateur is
  'Journal d''audit, écriture seule : une ligne par réponse notée, tous types confondus (actu du jour, quiz, définitions, correction IA de question). Jamais relu par le client — l''état vivant de maîtrise vit dans progress.state (notions), voir lib/srs.ts. Sert à l''agrégation ultérieure par notion sur l''ensemble des élèves. question_id est un identifiant libre (ex. "actu:<uuid>", "quiz:<lessonId>:<index>"), pas une FK : il couvre aussi bien public.questions_actu que les questions du corpus statique, hors base.';

create index reponses_utilisateur_notion_id_idx on public.reponses_utilisateur (notion_id);
create index reponses_utilisateur_user_notion_idx on public.reponses_utilisateur (user_id, notion_id);

alter table public.reponses_utilisateur enable row level security;

-- Écriture seule, et seulement pour sa propre ligne : aucune policy de
-- lecture n'est définie, l'agrégation par notion se fera côté serveur avec
-- la clé de service (contourne RLS), jamais depuis le client.
create policy reponses_utilisateur_insert_own on public.reponses_utilisateur
  for insert
  with check (auth.uid() = user_id);
