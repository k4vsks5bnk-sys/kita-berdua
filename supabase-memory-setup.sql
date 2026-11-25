-- Run once in Supabase SQL Editor for the existing Kita Berdua project.
-- Public gallery metadata is separate from the private `entries` table.
create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 140),
  caption text check (char_length(caption) <= 1500),
  taken_on date,
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  constraint photo_path_matches_couple check (
    storage_path like couple_id::text || '/%' and
    storage_path !~ '[^a-zA-Z0-9_./-]' and
    storage_path !~ '\.\.'
  )
);

alter table public.memory_photos enable row level security;
grant select on public.memory_photos to anon, authenticated;
grant insert, delete on public.memory_photos to authenticated;

drop policy if exists "Anyone can view memory photos" on public.memory_photos;
create policy "Anyone can view memory photos" on public.memory_photos
  for select to anon, authenticated using (true);

drop policy if exists "Couple members can add memory photos" on public.memory_photos;
create policy "Couple members can add memory photos" on public.memory_photos
  for insert to authenticated with check (
    exists (select 1 from public.couple_members cm
            where cm.couple_id = memory_photos.couple_id and cm.user_id = auth.uid())
  );

drop policy if exists "Couple members can remove memory photos" on public.memory_photos;
create policy "Couple members can remove memory photos" on public.memory_photos
  for delete to authenticated using (
    exists (select 1 from public.couple_members cm
            where cm.couple_id = memory_photos.couple_id and cm.user_id = auth.uid())
  );

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('kenangan','kenangan',true,8388608,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
set public = true, file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage object names are <couple UUID>/<random UUID>.<extension>.
drop policy if exists "Members upload couple photos" on storage.objects;
create policy "Members upload couple photos" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'kenangan'
    and exists (select 1 from public.couple_members cm
      where cm.user_id = auth.uid()
        and cm.couple_id::text = (storage.foldername(name))[1])
  );

drop policy if exists "Members delete couple photos" on storage.objects;
create policy "Members delete couple photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'kenangan'
    and exists (select 1 from public.couple_members cm
      where cm.user_id = auth.uid()
        and cm.couple_id::text = (storage.foldername(name))[1])
  );
