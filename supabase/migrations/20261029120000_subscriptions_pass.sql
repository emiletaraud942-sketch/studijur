-- Pass partiels 7 jours (paiement unique, voir lib/tarifs.ts) : sa date de
-- fin vit à côté du statut d'abonnement, dans la même ligne par email. Écrite
-- uniquement par le webhook Stripe (clé de service) ; la RLS existante
-- subscriptions_select_own laisse déjà l'élève relire sa propre ligne.
alter table public.subscriptions add column if not exists pass_expires_at timestamptz;

-- Défense en profondeur : seul le webhook (service_role, qui ignore ces
-- droits) écrit dans `subscriptions`. La RLS n'a de policy que pour SELECT,
-- mais on retire aussi les droits d'écriture hérités par défaut pour que
-- l'ajout accidentel d'une policy ne rende jamais `status` ou
-- `pass_expires_at` modifiables depuis le navigateur.
revoke insert, update, delete, truncate on public.subscriptions from anon, authenticated;

-- Sessions de paiement du pass déjà traitées : Stripe livre ses événements au
-- moins une fois, un rejeu ne doit pas prolonger le pass une seconde fois.
create table if not exists public.pass_sessions_traitees (
  session_id text primary key,
  created_at timestamptz not null default now()
);
alter table public.pass_sessions_traitees enable row level security;
revoke all on public.pass_sessions_traitees from anon, authenticated;
