-- Katon — 0007: the mirror route's link from a reading row to its rendered text.
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0006.
--
-- RUN THIS BEFORE DEPLOYING THE CODE THAT READS IT (repo convention). Until the
-- column exists, the mirror POST's insert fails on the cache_key patch and no
-- mirror reading can be created. The legacy funnel does not touch this column
-- and is unaffected either way.
--
-- WHY THIS COLUMN EXISTS
-- `render_cache` is keyed on hash(engine_version + semantic JSON), never on a
-- reading id, because two birthdates with the same semantic profile share one
-- rendered text on purpose (0006's header). That is the right key for the cache
-- and the wrong key for a question the feedback endpoint has to answer: WHICH
-- rendered row did this token actually receive?
--
-- The key is derivable — recompute the chart from the row, rebuild the semantic
-- JSON, re-hash. But it is derivable AS OF NOW, and ENGINE_VERSION is hashed in.
-- Bump the engine between a serve and the 👎 that follows it and the recomputed
-- key names a row the reader never saw, so the thumbs-down would flag the wrong
-- text. Storing the key that was served makes that unambiguous.
--
-- NULLABLE. Every legacy funnel row has a null here and always will: the legacy
-- path renders from contents/*.md and never enters the Stage 3-6 pipeline. A
-- non-null cache_key is therefore also the marker that a row is a MIRROR row.
alter table public.reading add column if not exists cache_key text;

-- The QA join: given a flagged render_cache row, which readings served it.
create index if not exists reading_cache_key_idx
  on public.reading (cache_key) where cache_key is not null;
