-- Un filleul doit pouvoir savoir qu'il a été parrainé (pour afficher la
-- réduction de 0,90 € sur /abonnement) — la politique existante ne
-- permettait de lire la ligne qu'au parrain.
create policy "parrainages_select_filleul"
  on public.parrainages for select
  using (auth.uid() = filleul_id);
