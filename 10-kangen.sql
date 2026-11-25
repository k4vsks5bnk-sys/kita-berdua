-- Tombol kangen. Jalankan sekali di Supabase -> SQL Editor (aman dijalankan ulang).
create table if not exists public.kangen (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  from_id uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists kangen_couple_time on public.kangen (couple_id, created_at desc);

alter table public.kangen enable row level security;
grant select, insert on public.kangen to authenticated;

drop policy if exists "Couple members can read kangen" on public.kangen;
create policy "Couple members can read kangen" on public.kangen
  for select to authenticated using (
    exists (select 1 from public.couple_members cm
            where cm.couple_id = kangen.couple_id and cm.user_id = auth.uid())
  );

drop policy if exists "Members send kangen as themselves" on public.kangen;
create policy "Members send kangen as themselves" on public.kangen
  for insert to authenticated with check (
    from_id = auth.uid()
    and exists (select 1 from public.couple_members cm
                where cm.couple_id = kangen.couple_id and cm.user_id = auth.uid())
  );
