-- Katon — 0008: the fixed-window rate limiter's counters.
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0007.
--
-- RUN THIS BEFORE DEPLOYING THE CODE THAT READS IT (repo convention), and note
-- that this one is louder than the others: lib/ratelimit.js FAILS CLOSED. If the
-- table or the function is missing, every limited request is refused with a 429
-- rather than waved through. A limiter that opens when its backend is missing is
-- not a limiter, and CLAUDE.md rule 19 makes rate limiting a PRECONDITION of
-- public exposure rather than an enhancement.
--
-- WHY A TABLE AND NOT AN IN-PROCESS COUNTER
-- Vercel runs many lambda instances and recycles them. A per-process Map does
-- not limit a rate; it limits a rate PER INSTANCE, so the effective ceiling is
-- the configured one multiplied by however many instances the platform happened
-- to spin up, and it resets on every cold start. The in-memory backend in
-- lib/ratelimit.js is kept for local dev and tests only, mirroring the pattern
-- in readingStore.js and render/cache.js.
--
-- NO BIRTH DATA AND NO READING IDS. The key is a bucket name plus either a
-- client IP or an opaque session id. It is retained only for the length of the
-- window it counts.

create table if not exists public.rate_limit (
  bucket_key   text primary key,          -- '<bucket>:<dimension>:<identity>'
  window_start timestamptz not null,      -- floor(now / window), so the row is reused
  count        integer not null default 0,
  updated_at   timestamptz not null default now()
);

-- For the pruning sweep below.
create index if not exists rate_limit_window_start_idx
  on public.rate_limit (window_start);

-- ONE round trip, atomic. Read-then-write from the app would let two concurrent
-- requests both read the same count and both decide they were under the limit.
-- The conditional in the SET clause is what makes a window ROLL rather than
-- accumulate forever: a hit in a new window resets the count instead of adding
-- to the previous window's total.
--
-- SECURITY DEFINER because the table has RLS on with no policies (same lockout
-- as `reading` and `render_cache`). search_path is pinned, which is the standard
-- hardening for a definer function.
create or replace function public.rate_limit_hit(p_key text, p_window_start timestamptz)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.rate_limit (bucket_key, window_start, count, updated_at)
  values (p_key, p_window_start, 1, now())
  on conflict (bucket_key) do update
    set count = case
                  when rate_limit.window_start = excluded.window_start
                  then rate_limit.count + 1
                  else 1
                end,
        window_start = excluded.window_start,
        updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

-- Housekeeping. The table holds one row per distinct identity seen, so it grows
-- with unique visitors and never shrinks on its own. Nothing calls this yet;
-- run it by hand, or attach it to a schedule, once there is real traffic.
create or replace function public.rate_limit_prune(p_older_than interval default interval '2 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.rate_limit where window_start < now() - p_older_than;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- SECURITY: server-side only, through the service role key. RLS on with NO
-- policies locks anon/authenticated out completely.
alter table public.rate_limit enable row level security;
