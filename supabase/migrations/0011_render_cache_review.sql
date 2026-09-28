-- 0011: render_cache.review - the voice-v2 reviewer's findings, stored with the render.
--
-- Voice v2 round 2 (docs/content/voice-v2-spec-2026-09-24.md §4b): "Findings are
-- stored with the render so any rejection can be read and argued with later."
-- Written ONLY for v2 rows (lib/render/cache.js omits the key on a v1 write), so
-- v1 - production - needs nothing from this column.
--
-- APPLY BEFORE setting VOICE=v2 on any deployment that writes to Supabase.
-- A column, not a table: no grant is needed (CLAUDE.md, Migrations).

alter table public.render_cache add column if not exists review jsonb;
