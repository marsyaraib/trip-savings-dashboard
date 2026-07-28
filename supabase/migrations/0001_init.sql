-- ============================================================================
-- Overseas Trip Savings Dashboard — initial schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- payments
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_name text not null check (member_name in ('Fafa', 'Febi', 'Nadine', 'Marsya')),
  payment_month int not null check (payment_month between 1 and 12),
  payment_year int not null check (payment_year between 2026 and 2027),
  payment_date date not null,
  amount numeric(14, 2) not null check (amount > 0),
  note text,
  proof_image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_member on public.payments (member_name);
create index if not exists idx_payments_month_year on public.payments (payment_year, payment_month);

-- ----------------------------------------------------------------------------
-- activity_logs
-- ----------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  activity text not null,
  activity_type text not null default 'payment_added'
    check (activity_type in ('payment_added', 'proof_uploaded', 'milestone_reached', 'month_completed', 'target_completed')),
  member_name text check (member_name in ('Fafa', 'Febi', 'Nadine', 'Marsya')),
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created_at on public.activity_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- admin_settings (single row holding a HASHED admin PIN)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  admin_pin text not null -- bcrypt hash, never store plain text
);

-- Seed a default PIN of 123456. CHANGE THIS after setup by running:
--   update public.admin_settings set admin_pin = crypt('YOUR_NEW_PIN', gen_salt('bf'));
insert into public.admin_settings (admin_pin)
select crypt('123456', gen_salt('bf'))
where not exists (select 1 from public.admin_settings);

-- ----------------------------------------------------------------------------
-- RPC: verify_admin_pin — the ONLY way to check a PIN.
-- Runs with definer rights so it can read admin_settings even though the
-- table itself has no public policies. Returns a boolean, never the hash.
-- ----------------------------------------------------------------------------
create or replace function public.verify_admin_pin(pin_attempt text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  select admin_pin into stored_hash from public.admin_settings limit 1;
  if stored_hash is null then
    return false;
  end if;
  return stored_hash = crypt(pin_attempt, stored_hash);
end;
$$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.admin_settings enable row level security;

-- payments: anyone (anon key) can read and insert. No update/delete —
-- those only happen through the server route using the service role key.
drop policy if exists "payments_select_all" on public.payments;
create policy "payments_select_all" on public.payments
  for select using (true);

drop policy if exists "payments_insert_all" on public.payments;
create policy "payments_insert_all" on public.payments
  for insert with check (true);

-- activity_logs: anyone can read and insert (append-only feed).
drop policy if exists "activity_logs_select_all" on public.activity_logs;
create policy "activity_logs_select_all" on public.activity_logs
  for select using (true);

drop policy if exists "activity_logs_insert_all" on public.activity_logs;
create policy "activity_logs_insert_all" on public.activity_logs
  for insert with check (true);

-- admin_settings: intentionally NO policies for anon/authenticated.
-- With RLS enabled and zero policies, the table is completely
-- inaccessible to the public anon key. Only the service role
-- (server-only) and the SECURITY DEFINER function above can read it.

-- ----------------------------------------------------------------------------
-- Storage bucket for transfer proof uploads
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_proofs_public_read" on storage.objects;
create policy "payment_proofs_public_read" on storage.objects
  for select using (bucket_id = 'payment-proofs');

drop policy if exists "payment_proofs_public_upload" on storage.objects;
create policy "payment_proofs_public_upload" on storage.objects
  for insert with check (bucket_id = 'payment-proofs');

-- ----------------------------------------------------------------------------
-- Realtime: let the dashboard subscribe to live changes
-- (wrapped so re-running this migration is safe / idempotent)
-- ----------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.payments;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception when duplicate_object then
  null;
end $$;
