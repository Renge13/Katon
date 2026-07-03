-- Katon — 0002: element-state keying + demand capture; domain rename rezeki → uang.
-- Run in the Supabase SQL editor (or via the Supabase CLI) AFTER 0001_reading.sql.

-- State keying: the resolved element-state (balanced/amplified/governed/overfueled/
-- depleted) selects the content cell. Replaces element_variant (kept, now unused).
alter table public.reading add column if not exists state text;

-- Demand capture for "segera" domains (Karier / Uang). CAPTURE ONLY.
alter table public.reading add column if not exists interest_domain text;
alter table public.reading add column if not exists interest_wa text;

-- Domain rename: 'rezeki' → 'uang' (SPEC §7). Migrate any existing rows, then swap
-- the CHECK constraint.
update public.reading set domain = 'uang' where domain = 'rezeki';

alter table public.reading drop constraint if exists reading_domain_chk;
alter table public.reading add constraint reading_domain_chk
  check (domain is null or domain in ('hubungan', 'karier', 'uang'));
