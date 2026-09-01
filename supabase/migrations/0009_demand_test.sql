-- ============================================================
-- 0009_demand_test.sql — funnel counters for the September demand test
-- ============================================================
-- Prompt Q, commit 2. Ruled by Reyner 2026-08-29.
--
-- RUN THIS IN THE SUPABASE SQL EDITOR BEFORE DEPLOYING THE CODE THAT READS IT.
-- There is no CLI migration tracking in this repo (CLAUDE.md, REPO CONVENTIONS),
-- so the ordering is a human obligation and not something CI enforces.
--
-- WHAT THIS IS FOR. Nothing measures the funnel today. September acquires traffic
-- that will only arrive once, and a rate computed afterwards from data nobody
-- recorded is not recoverable. These two tables are the smallest thing that can
-- answer WHICH PRODUCT PEOPLE WANT without building either candidate.
--
-- RULE 16 IS NOT VIOLATED, and this comment is here because a future session will
-- reasonably ask. Rule 16 forbids PERSISTING A FLOOR RENDER. `funnel_event`
-- records THAT a floor was served, never the prose it served. It does not become
-- a cache entry, `readCache` never reads it, and the next request still retries
-- the provider exactly as before. Recording an event is not caching a result.
--
-- NO PII. `funnel_event.detail` carries render source and a boolean, and nothing
-- else - never a birth date, birth time, name or contact. Contact lives only in
-- `product_interest`, only when the reader typed it into the optional field.
-- ============================================================

-- ── The funnel counter ──────────────────────────────────────
create table if not exists public.funnel_event (
  id         bigserial primary key,
  reading_id text not null,
  event      text not null,
  detail     jsonb,
  count      integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- THE UNIQUE INDEX IS THE DENOMINATOR'S INTEGRITY, not a storage optimisation.
-- One row per (reading, event) means a refresh, a second tab or a shared link
-- opened twice CANNOT inflate "completed mirror readers". Repeats bump `count`
-- and `updated_at`; `created_at` keeps the FIRST occurrence, so a rate and a
-- timing question can both be answered from the same row.
create unique index if not exists funnel_event_once_idx
  on public.funnel_event (reading_id, event);

create index if not exists funnel_event_created_idx on public.funnel_event (created_at);

-- ── Interest in the two unbuilt products ────────────────────
create table if not exists public.product_interest (
  id         bigserial primary key,
  reading_id text not null,
  product    text not null,
  contact    text,
  created_at timestamptz not null default now()
);

-- One interest per (reading, product). A reader tapping twice is one signal.
create unique index if not exists product_interest_once_idx
  on public.product_interest (reading_id, product);

-- ── RLS on, NO policies ─────────────────────────────────────
-- Exactly like `reading`: all access is server-side through the service role key,
-- which bypasses RLS. There is no client-side table access anywhere in this app
-- and these tables do not introduce the first one. RLS with no policies means a
-- leaked anon key reads nothing, which is the point.
alter table public.funnel_event enable row level security;
alter table public.product_interest enable row level security;
