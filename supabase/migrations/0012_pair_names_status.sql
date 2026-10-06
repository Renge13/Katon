-- 0012 — the pair's nicknames and relationship status (Prompt BC §1, Reyner 2026-10-02)
--
-- Each person may give a nickname; the relationship status is REQUIRED for every pair
-- created from BC on (one tap: PDKT / Pacaran / Menikah). Existing rows have neither,
-- so all three columns are nullable and the checks allow null.
--
-- RUN THIS IN THE SUPABASE SQL EDITOR BEFORE DEPLOYING THE CODE THAT WRITES THEM
-- (CLAUDE.md, Migrations): POST /api/pair inserts all three, and an insert naming a
-- column the table does not have fails.
--
-- No grant line: this adds columns to an existing table (public.pair, 0010), it does
-- not create one, so the service role's existing access covers them.

alter table public.pair add column if not exists a_nickname text;
alter table public.pair add column if not exists b_nickname text;
alter table public.pair add column if not exists status text;

-- The server sanitises nicknames (lib/pair/names.js: letters, spaces, apostrophe,
-- hyphen, 1-20 characters); the table enforces the length as a second line.
alter table public.pair drop constraint if exists pair_a_nickname_chk;
alter table public.pair add constraint pair_a_nickname_chk
  check (a_nickname is null or char_length(a_nickname) between 1 and 20);

alter table public.pair drop constraint if exists pair_b_nickname_chk;
alter table public.pair add constraint pair_b_nickname_chk
  check (b_nickname is null or char_length(b_nickname) between 1 and 20);

alter table public.pair drop constraint if exists pair_status_chk;
alter table public.pair add constraint pair_status_chk
  check (status is null or status in ('PDKT', 'Pacaran', 'Menikah'));
