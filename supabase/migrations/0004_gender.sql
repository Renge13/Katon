-- Katon — 0004: optional gender on the reading row.
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0003.
--
-- WHY THIS COLUMN EXISTS
-- Gender affects EXACTLY ONE thing in BaZi: luck-pillar (大運) direction — forward
-- for yang-year males and yin-year females, reverse otherwise. It does not touch
-- the natal chart, Ten Gods, strength, badges, palaces or compatibility, all of
-- which read the natal chart only.
--
-- Luck pillars are not built yet, so nothing consumes this today. It is stored so
-- it does not have to be re-collected from users later, when the annual reading
-- and the luck-pillar map (paid products 2 and 5) need it.
--
-- NULLABLE AND NULL BY DEFAULT. The natal mirror does not need it and the funnel
-- deliberately does not ask for it, so most rows will be null and that is correct.
-- Do not make it NOT NULL.
alter table public.reading add column if not exists gender text;

alter table public.reading drop constraint if exists reading_gender_chk;
alter table public.reading add constraint reading_gender_chk
  check (gender is null or gender in ('male', 'female'));
