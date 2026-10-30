-- Pass partiels 7 jours (paiement unique, voir lib/tarifs.ts) : sa date de
-- fin vit à côté du statut d'abonnement, dans la même ligne par email. Écrite
-- uniquement par le webhook Stripe (clé de service) ; la RLS existante
-- subscriptions_select_own laisse déjà l'élève relire sa propre ligne.
alter table public.subscriptions add column if not exists pass_expires_at timestamptz;
