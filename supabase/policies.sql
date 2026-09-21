-- Run after creating a Supabase Auth admin user.
-- The browser dashboard must sign in that user before writes are allowed.

drop policy if exists "Authenticated users can upload assets" on storage.objects;
drop policy if exists "Authenticated users can update assets" on storage.objects;
drop policy if exists "Authenticated users can delete assets" on storage.objects;
drop policy if exists "Public can read assets" on storage.objects;
drop policy if exists "Authenticated users can manage clients" on public.clients;
drop policy if exists "Authenticated users can manage projects" on public.projects;
drop policy if exists "Authenticated users can manage leadership" on public.leadership;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  image text,
  logo_url text,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text,
  client text,
  category text,
  project_date date,
  details text,
  images text[] default '{}',
  image_urls text[] default '{}',
  year text,
  created_at timestamptz default now()
);

create table if not exists public.leadership (
  id text primary key,
  name text,
  role text,
  message text,
  image_url text,
  image text,
  type text default 'team',
  created_at timestamptz default now()
);

alter table public.clients add column if not exists image_url text;
alter table public.clients add column if not exists image text;
alter table public.clients add column if not exists logo_url text;
alter table public.projects add column if not exists images text[] default '{}';
alter table public.projects add column if not exists image_urls text[] default '{}';
alter table public.projects add column if not exists project_date date;
alter table public.projects add column if not exists details text;
alter table public.leadership add column if not exists image_url text;
alter table public.leadership add column if not exists image text;
alter table public.leadership add column if not exists message text;
alter table public.leadership add column if not exists role text;

create policy "Authenticated users can upload assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'assets');

create policy "Authenticated users can update assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'assets')
with check (bucket_id = 'assets');

create policy "Authenticated users can delete assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'assets');

create policy "Public can read assets"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'assets');

create policy "Authenticated users can manage clients"
on public.clients
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage projects"
on public.projects
for all
to authenticated
using (true)
with check (true);

create policy "Authenticated users can manage leadership"
on public.leadership
for all
to authenticated
using (true)
with check (true);
