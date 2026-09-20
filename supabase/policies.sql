-- Run after creating a Supabase Auth admin user.
-- The browser dashboard must sign in that user before writes are allowed.

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
