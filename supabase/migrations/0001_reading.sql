-- Katon — reading table (locked schema).
-- Run in the Supabase SQL editor (or via the Supabase CLI) for the project whose
-- URL + service role key go in .env.local.

create table if not exists public.reading (
  id              text primary key,          -- CSPRNG bearer token (nanoid)
  day_master      text not null,             -- e.g. '丙' → selects archetype content
  element_variant text,                      -- e.g. 'missing_wood' → selects elementNote
  domain          text,                      -- 'hubungan' | 'karier' | 'rezeki'
  paid            boolean not null default false,  -- ONLY the verified webhook sets true
  wa_number       text,                      -- captured at payment intent
  created_at      timestamptz not null default now(),
  constraint reading_domain_chk
    check (domain is null or domain in ('hubungan', 'karier', 'rezeki'))
);

create index if not exists reading_created_at_idx on public.reading (created_at);

-- SECURITY: all access is server-side via the service role key (which bypasses
-- RLS). Enable RLS with NO policies so anon/authenticated clients are fully
-- locked out — there is no client-side table access in this app.
alter table public.reading enable row level security;
