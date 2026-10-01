create table public.parrainages (
  id uuid primary key default gen_random_uuid(),
  parrain_id uuid not null references auth.users(id) on delete cascade,
  filleul_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.parrainages enable row level security;

-- Un parrain peut voir la liste des comptes qu'il a parrainés.
create policy "parrainages_select_parrain"
  on public.parrainages for select
  using (auth.uid() = parrain_id);

-- Un nouveau compte peut s'attribuer un seul parrain, lui-même — jamais au
-- nom de quelqu'un d'autre. La contrainte unique sur filleul_id empêche
-- qu'un compte revendique plusieurs parrains.
create policy "parrainages_insert_filleul"
  on public.parrainages for insert
  with check (auth.uid() = filleul_id and filleul_id <> parrain_id);
