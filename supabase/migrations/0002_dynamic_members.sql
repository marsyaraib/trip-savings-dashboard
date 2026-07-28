-- ============================================================================
-- Dynamic members: split immutable identity (key) from editable profile
-- (display_name, photo_url). Run this once in the Supabase SQL Editor,
-- after 0001_init.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- members
-- ----------------------------------------------------------------------------
create table if not exists public.members (
  key text primary key,
  display_name text not null,
  photo_url text,
  initials text not null,
  color_class text not null,
  ring_class text not null,
  hex text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.members (key, display_name, initials, color_class, ring_class, hex, sort_order)
values
  ('fafa', 'Fafa', 'FA', 'from-emerald-400 to-emerald-600', 'stroke-emerald-500', '#10b981', 0),
  ('febi', 'Febi', 'FB', 'from-amber-400 to-amber-600', 'stroke-amber-500', '#f59e0b', 1),
  ('nadine', 'Nadine', 'ND', 'from-sky-400 to-sky-600', 'stroke-sky-500', '#0ea5e9', 2),
  ('marsya', 'Marsya', 'MS', 'from-violet-400 to-violet-600', 'stroke-violet-500', '#8b5cf6', 3)
on conflict (key) do nothing;

alter table public.members enable row level security;

drop policy if exists "members_select_all" on public.members;
create policy "members_select_all" on public.members
  for select using (true);

-- No insert/update/delete policy for anon/authenticated — member management
-- only happens through the service-role admin API routes (PIN-protected),
-- same "zero policies" pattern as admin_settings.

-- ----------------------------------------------------------------------------
-- Drop the old CHECK constraints FIRST (they only allow the capitalized
-- names and would reject the lowercase backfill below), THEN backfill
-- existing payments/activity_logs to use the new lowercase keys, THEN add
-- the real foreign key.
-- ----------------------------------------------------------------------------
alter table public.payments drop constraint if exists payments_member_name_check;
alter table public.activity_logs drop constraint if exists activity_logs_member_name_check;

update public.payments set member_name = lower(member_name);
update public.activity_logs set member_name = lower(member_name) where member_name is not null;

alter table public.payments
  drop constraint if exists payments_member_name_fkey,
  add constraint payments_member_name_fkey foreign key (member_name) references public.members(key);
alter table public.activity_logs
  drop constraint if exists activity_logs_member_name_fkey,
  add constraint activity_logs_member_name_fkey foreign key (member_name) references public.members(key);

-- ----------------------------------------------------------------------------
-- Storage bucket for member profile photos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "member_photos_public_read" on storage.objects;
create policy "member_photos_public_read" on storage.objects
  for select using (bucket_id = 'member-photos');

drop policy if exists "member_photos_public_upload" on storage.objects;
create policy "member_photos_public_upload" on storage.objects
  for insert with check (bucket_id = 'member-photos');
