-- منّا — VOL. 01
-- Run this once in Supabase → SQL Editor → New query → Run.

create sequence if not exists contribution_number_seq start 1;

create table if not exists public.contributions (
  id                  uuid primary key default gen_random_uuid(),
  public_number       integer not null unique default nextval('contribution_number_seq'),

  -- the sentence
  text                text not null check (char_length(text) between 1 and 200),
  text_normalized     text not null,

  -- who said it
  source_type         text not null check (source_type in ('self', 'known', 'published', 'unknown')),
  source_name         text check (source_name is null or char_length(source_name) <= 120),

  -- how the contributor appears
  display_name        text check (display_name is null or char_length(display_name) <= 40),
  anonymous           boolean not null default false,
  location_text       text check (location_text is null or char_length(location_text) <= 40),

  -- moderation
  status              text not null default 'pending'
                        check (status in ('pending', 'approved', 'rejected', 'flagged')),
  auto_flags          text[] not null default '{}',
  needs_rights_review boolean not null default false,
  moderation_note     text,

  -- consent (required to submit)
  consent             boolean not null check (consent = true),
  consent_at          timestamptz not null default now(),

  -- private, never returned publicly
  ip_hash             text,
  delete_token_hash   text not null unique,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  approved_at         timestamptz
);

alter sequence contribution_number_seq owned by public.contributions.public_number;

create index if not exists contributions_status_number_idx
  on public.contributions (status, public_number);
create index if not exists contributions_normalized_idx
  on public.contributions (text_normalized);
create index if not exists contributions_ip_time_idx
  on public.contributions (ip_hash, created_at);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists contributions_touch on public.contributions;
create trigger contributions_touch before update on public.contributions
  for each row execute function public.touch_updated_at();

-- Lock the table down. The website talks to it only from the server with the
-- secret key, so the public (anon) key can read or write nothing at all.
alter table public.contributions enable row level security;
revoke all on public.contributions from anon, authenticated;
revoke all on sequence contribution_number_seq from anon, authenticated;
