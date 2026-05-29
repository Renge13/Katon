-- Katon — Phase 4a: payment + re-entry columns.
-- Run after 0001 in the Supabase SQL editor (or via the Supabase CLI).

alter table public.reading
  -- Re-entry: store the raw birth inputs so the chart can be recomputed
  -- server-side on every read (single source of truth). SERVER-ONLY — these are
  -- never returned to the client and never logged. RLS (enabled in 0001, no
  -- policies) already restricts all access to the service key.
  add column if not exists birth_date text,
  add column if not exists birth_time text,
  -- Payment correlation + idempotency.
  add column if not exists invoice_id text,      -- Xendit invoice id (external_id = reading id)
  add column if not exists paid_at timestamptz,  -- set once, on the false→true transition
  add column if not exists wa_sent boolean not null default false; -- WA-send-once guard

create index if not exists reading_invoice_id_idx on public.reading (invoice_id);
