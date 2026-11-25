-- Siklus haid (tab Kita). Jalankan sekali di Supabase -> SQL Editor (aman dijalankan ulang).
-- Hanya berdua (anggota couple) yang bisa melihat dan mengubah. Tidak ada yang publik.
create table if not exists public.cycle_periods (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  start_date date not null,
  end_date date,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint cycle_periods_end_after_start check (end_date is null or end_date >= start_date),
  constraint cycle_periods_one_per_day unique (couple_id, start_date)
);

alter table public.cycle_periods enable row level security;
grant select, insert, update, delete on public.cycle_periods to authenticated;

drop policy if exists "Couple members manage cycle periods" on public.cycle_periods;
create policy "Couple members manage cycle periods" on public.cycle_periods
  for all to authenticated
  using (exists (select 1 from public.couple_members cm
                 where cm.couple_id = cycle_periods.couple_id and cm.user_id = auth.uid()))
  with check (exists (select 1 from public.couple_members cm
                      where cm.couple_id = cycle_periods.couple_id and cm.user_id = auth.uid()));
