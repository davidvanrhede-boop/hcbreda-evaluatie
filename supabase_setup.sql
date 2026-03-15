-- ═══════════════════════════════════════════════════════════════
-- HC BREDA — EVALUATIEPROCES DATABASE SETUP
-- Plak dit script in Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════════════════════

-- ─── TABELLEN ────────────────────────────────────────────────

-- Profielen (gekoppeld aan Supabase Auth users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  naam text not null,
  rol text not null check (rol in ('coach', 'trainer', 'hot', 'observator')),
  created_at timestamptz default now()
);

-- Teams
create table if not exists teams (
  id serial primary key,
  naam text not null unique -- 'O8', 'O9', 'O10', 'O11'
);

insert into teams (naam) values ('O8'), ('O9'), ('O10'), ('O11')
  on conflict do nothing;

-- Spelers
create table if not exists spelers (
  id serial primary key,
  naam text not null,
  team_id integer references teams(id) on delete cascade,
  geboortejaar integer,
  created_at timestamptz default now()
);

-- Koppeling beoordelaar ↔ team (welke coach/trainer hoort bij welk team)
create table if not exists team_assignments (
  id serial primary key,
  profiel_id uuid references profiles(id) on delete cascade,
  team_id integer references teams(id) on delete cascade,
  seizoen text default '2025-2026',
  unique(profiel_id, team_id, seizoen)
);

-- Formulier A: beoordelingen coaches & trainers (eigen team, scores gescheiden)
create table if not exists evaluaties_a (
  id serial primary key,
  beoordelaar_id uuid references profiles(id) on delete cascade,
  speler_id integer references spelers(id) on delete cascade,
  seizoen text default '2025-2026',
  halfjaar text not null check (halfjaar in ('H1', 'H2')),
  eigen_kind boolean default false,
  -- Categorie 1: Huidig niveau (60%)
  passing integer check (passing between 1 and 5),
  dribbelen integer check (dribbelen between 1 and 5),
  schot integer check (schot between 1 and 5),
  positiespel integer check (positiespel between 1 and 5),
  tactisch integer check (tactisch between 1 and 5),
  fysiek integer check (fysiek between 1 and 5),
  toelichting_cat1 text default '',
  -- Categorie 2: Ontwikkeling (30%)
  progressie integer check (progressie between 1 and 5),
  coachbaarheid integer check (coachbaarheid between 1 and 5),
  inzet integer check (inzet between 1 and 5),
  zelfreflectie integer check (zelfreflectie between 1 and 5),
  motivatie integer check (motivatie between 1 and 5),
  toelichting_cat2 text default '',
  -- Categorie 3: Ouders (10%)
  aanwezigheid integer check (aanwezigheid between 1 and 5),
  attitude_lijn integer check (attitude_lijn between 1 and 5),
  teamsfeer integer check (teamsfeer between 1 and 5),
  communicatie_ouders integer check (communicatie_ouders between 1 and 5),
  toelichting_cat3 text default '',
  -- Status
  ingediend boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(beoordelaar_id, speler_id, seizoen, halfjaar)
);

-- Formulier B: selectiedagen observaties
create table if not exists evaluaties_b (
  id serial primary key,
  beoordelaar_id uuid references profiles(id) on delete cascade,
  speler_id integer references spelers(id) on delete cascade,
  seizoen text default '2025-2026',
  selectiedag integer not null check (selectiedag in (1, 2, 3)),
  eigen_kind boolean default false,
  -- Wedstrijdcriteria
  technisch integer check (technisch between 1 and 5),
  samenwerking integer check (samenwerking between 1 and 5),
  beslissingen integer check (beslissingen between 1 and 5),
  inzet_wedstrijd integer check (inzet_wedstrijd between 1 and 5),
  gedrag integer check (gedrag between 1 and 5),
  zichtbaarheid integer check (zichtbaarheid between 1 and 5),
  vergelijking_groep text default '',
  opmerkingen text default '',
  ingediend boolean default false,
  created_at timestamptz default now(),
  unique(beoordelaar_id, speler_id, seizoen, selectiedag)
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

alter table profiles enable row level security;
alter table teams enable row level security;
alter table spelers enable row level security;
alter table team_assignments enable row level security;
alter table evaluaties_a enable row level security;
alter table evaluaties_b enable row level security;

-- Profiles: iedereen ziet eigen profiel; HOT ziet alles
create policy "eigen profiel lezen" on profiles
  for select using (auth.uid() = id);

create policy "hot ziet alle profielen" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

create policy "profiel aanmaken" on profiles
  for insert with check (auth.uid() = id);

create policy "eigen profiel bijwerken" on profiles
  for update using (auth.uid() = id);

-- Teams: iedereen kan teams lezen
create policy "teams lezen" on teams
  for select using (true);

-- Spelers: coach/trainer ziet alleen spelers van eigen team; HOT ziet alles
create policy "eigen team spelers lezen" on spelers
  for select using (
    exists (
      select 1 from team_assignments ta
      where ta.profiel_id = auth.uid()
      and ta.team_id = spelers.team_id
    )
    or
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
    or
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'observator')
  );

create policy "hot spelers beheren" on spelers
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

-- Team assignments: eigen toewijzingen lezen; HOT alles
create policy "eigen assignments lezen" on team_assignments
  for select using (
    profiel_id = auth.uid()
    or
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

create policy "hot assignments beheren" on team_assignments
  for all using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

-- Evaluaties A: beoordelaar ziet en bewerkt alleen eigen rijen; HOT alles
create policy "eigen evaluaties_a lezen" on evaluaties_a
  for select using (
    beoordelaar_id = auth.uid()
    or
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

create policy "eigen evaluaties_a schrijven" on evaluaties_a
  for insert with check (beoordelaar_id = auth.uid());

create policy "eigen evaluaties_a bijwerken" on evaluaties_a
  for update using (beoordelaar_id = auth.uid() and ingediend = false);

-- Evaluaties B: beoordelaar ziet en bewerkt alleen eigen rijen; HOT alles
create policy "eigen evaluaties_b lezen" on evaluaties_b
  for select using (
    beoordelaar_id = auth.uid()
    or
    exists (select 1 from profiles p where p.id = auth.uid() and p.rol = 'hot')
  );

create policy "eigen evaluaties_b schrijven" on evaluaties_b
  for insert with check (beoordelaar_id = auth.uid());

create policy "eigen evaluaties_b bijwerken" on evaluaties_b
  for update using (beoordelaar_id = auth.uid() and ingediend = false);

-- ─── AUTOMATISCH PROFIEL AANMAKEN NA REGISTRATIE ─────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, naam, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'naam', new.email),
    coalesce(new.raw_user_meta_data->>'rol', 'coach')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── KLAAR ───────────────────────────────────────────────────
-- Na uitvoeren: ga naar Authentication > Users en maak accounts aan.
-- Wijs daarna in team_assignments toe welke coach/trainer bij welk team hoort.
