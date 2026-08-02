-- Katon — 0006: the Stage 4 / Stage 7 result cache for rendered readings.
-- Run in the Supabase SQL editor AFTER 0005.
--
-- RUN THIS BEFORE DEPLOYING THE CODE THAT READS IT (repo convention). Until the
-- table exists, lib/render/cache.js falls back to its in-memory dev store, which
-- is per-process and non-persistent — every request would be a cache miss and a
-- paid LLM call.
--
-- WHY A SECOND TABLE AND NOT COLUMNS ON `reading`
-- The key is hash(engine_version + semantic JSON), not a reading id. Two
-- different birthdates with identical semantic profiles share one row on
-- purpose (pipeline-spec §Stage 4: more cache hits, still accurate), so the
-- relation is many readings to one rendered text. It cannot live on `reading`.
--
-- NOTHING HERE IS BIRTH DATA. The key is a hash and the payload is prose. Birth
-- date and time stay on `reading`, where they are never returned to a client.

create table if not exists public.render_cache (
  cache_key      text primary key,           -- sha256(engine_version + canonical semantic JSON)
  engine_version text not null,              -- denormalised from the JSON, for bulk re-warm queries
  blocks         jsonb not null,             -- the ordered blocks[] contract
  penutup        text not null default '',
  source         text not null,              -- 'gemini' | 'openai' | 'module_assembly'
  model          text,                       -- null for module_assembly
  prompt_version text,                       -- null for module_assembly

  -- Stage 6 attribution. NULL means the row was written before a validation gate
  -- existed (Prompt H). The serve path requires a non-null value, so pre-gate
  -- rows can never be served to a user by accident once H lands and starts
  -- writing real ones. This is the whole reason the column is nullable rather
  -- than defaulted.
  stage6_version text,

  status         text not null default 'unreviewed',
  created_at     timestamptz not null default now(),
  served_count   integer not null default 0,

  constraint render_cache_status_chk
    check (status in ('unreviewed', 'flagged', 'reviewed')),
  constraint render_cache_source_chk
    check (source in ('gemini', 'openai', 'module_assembly'))
);

-- Bulk re-warm after an engine bump, and the QA queue.
create index if not exists render_cache_engine_version_idx
  on public.render_cache (engine_version);
create index if not exists render_cache_status_idx
  on public.render_cache (status) where status = 'flagged';

-- SECURITY: server-side only, via the service role key (which bypasses RLS).
-- RLS on with NO policies locks anon/authenticated out completely. Rule 19's
-- real abuse risk is content harvesting, and this table is the content.
alter table public.render_cache enable row level security;
