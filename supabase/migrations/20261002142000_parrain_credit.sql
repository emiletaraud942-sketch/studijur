-- Marque si le parrain a déjà reçu sa récompense de 0,90 € pour ce filleul
-- (voir app/api/stripe/webhook/route.ts) — empêche un double crédit si le
-- webhook rejoue l'événement checkout.session.completed.
alter table public.parrainages
  add column parrain_credite boolean not null default false;

-- Le webhook Stripe ne connaît que l'email du payeur (customer_details.email),
-- jamais son user_id Supabase ; et pour créditer le parrain il lui faut
-- l'email de celui-ci à partir de son user_id. auth.users n'est pas exposé
-- via l'API REST (hors schémas exposés), donc ces deux fonctions font le
-- pont — en security definer, réservées au rôle service_role pour ne jamais
-- devenir un moyen de deviner si un email a un compte.
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where email = p_email limit 1;
$$;

create or replace function public.email_by_user_id(p_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select email from auth.users where id = p_id limit 1;
$$;

revoke all on function public.user_id_by_email(text) from public, anon, authenticated;
revoke all on function public.email_by_user_id(uuid) from public, anon, authenticated;
grant execute on function public.user_id_by_email(text) to service_role;
grant execute on function public.email_by_user_id(uuid) to service_role;
