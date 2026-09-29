alter table public.reponses_utilisateur
  drop constraint reponses_utilisateur_source_check;

alter table public.reponses_utilisateur
  add constraint reponses_utilisateur_source_check
  check (source in ('actu', 'quiz', 'definition', 'exam', 'methodo'));
