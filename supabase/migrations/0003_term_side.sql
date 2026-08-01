-- Katon — 0003: season-gate resolution for 節-day births with no birth time.
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0002.
--
-- WHY THIS COLUMN EXISTS
-- On the ~12 days a year a 節 (solar term) falls inside the birth day, the MONTH
-- pillar depends on which side of that instant the birth sits. With no birth
-- time the engine cannot know, and probing noon only picks the likelier branch.
-- The season gate asks the user, and the answer must be stored: every read
-- recomputes the chart from this row, so without it a revisit to /r/<token>
-- could render a different month pillar than the one the user resolved.
--
-- This is NOT a birth time. It resolves the month pillar only — the hour pillar
-- stays absent. Storing a stand-in birth_time instead would fabricate a fourth
-- pillar out of a guess.
alter table public.reading add column if not exists term_side text;

alter table public.reading drop constraint if exists reading_term_side_chk;
alter table public.reading add constraint reading_term_side_chk
  check (term_side is null or term_side in ('before', 'after'));
