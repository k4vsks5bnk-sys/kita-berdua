-- Journey (tab Kenangan → Journey): satu foto + keterangan, urut seperti linimasa.
-- Jalankan sekali di Supabase -> SQL Editor (aman dijalankan ulang).
-- Data (keterangan, tanggal) hanya untuk berdua. File foto ada di bucket publik `journey`
-- dengan nama acak, jadi hanya bisa dibuka oleh yang punya link-nya (sama seperti galeri).

create table if not exists public.journey_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  storage_path text not null unique,
  caption text not null default '' check (char_length(caption) <= 500),
  taken_on date not null default current_date,
  width int,
  height int,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists journey_photos_couple_time on public.journey_photos (couple_id, taken_on desc, created_at desc);

alter table public.journey_photos enable row level security;
grant select, insert, update, delete on public.journey_photos to authenticated;

drop policy if exists "Couple members manage journey" on public.journey_photos;
create policy "Couple members manage journey" on public.journey_photos
  for all to authenticated
  using (exists (select 1 from public.couple_members cm
                 where cm.couple_id = journey_photos.couple_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.couple_members cm
                      where cm.couple_id = journey_photos.couple_id and cm.user_id = auth.uid()));

-- Bucket: maksimal 1 MB per file, hanya WebP/JPEG (foto sudah dikompres di HP).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('journey', 'journey', true, 1048576, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Upload & hapus hanya ke folder couple sendiri: journey/<couple_id>/<acak>.webp
drop policy if exists "Journey upload by couple" on storage.objects;
create policy "Journey upload by couple" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'journey'
    and exists (select 1 from public.couple_members cm
                where cm.user_id = auth.uid() and cm.couple_id::text = (storage.foldername(name))[1])
  );

drop policy if exists "Journey delete by couple" on storage.objects;
create policy "Journey delete by couple" on storage.objects
  for delete to authenticated using (
    bucket_id = 'journey'
    and exists (select 1 from public.couple_members cm
                where cm.user_id = auth.uid() and cm.couple_id::text = (storage.foldername(name))[1])
  );
