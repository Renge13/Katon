-- ============================================================
-- docs/ops/compat-funnel.sql — the Compatibility funnel, by source, for a date range
-- ============================================================
-- Prompt BM item 6 (2026-10-08). READ-ONLY: paste into the Supabase SQL editor, set the
-- two dates in `params`, run. It writes nothing.
--
-- TWO QUERIES. The SQL editor shows only the last statement's result, so select one
-- query and run it alone.
--
-- QUERY 1 — PAIRS. The cohort is the pairs CREATED in the range, from `pair_created`
-- (lib/pair/handlers.js, recorded since BM's merge; no pair before it has one). Split by
-- source and by `from_mirror` (the buyer arrived from her own reading). Then, joined on
-- the pair id: `checkout_started` (POST /api/pay/<id> opened a checkout) and `paid`, read
-- from `public.pair.paid` - the column only the verified notification flips (rule 18), so
-- it is the authority rather than a second count of it.
--
-- QUERY 2 — THE COMPAT BLOCK ON THE MIRROR. Over the MIRROR cohort (readings created in
-- the range), how many readers had the Compatibility block on screen (`compat_cta_seen`)
-- and how many tapped it (`compat_cta_click`), by the reading's source.
-- compat_cta_seen FIRED ON MOUNT UNTIL BM's MERGE (2026-10-08) and on viewport
-- intersection after it, so ROWS BEFORE THAT MERGE ARE MOUNTS and are not comparable.
--
-- SOURCE: the link code `k`; else `ref:<referrer host>`; else `(none)`. Read from the
-- create event only: checkout_started and purchase_confirmed share the id and carry no
-- source of their own. Codes: docs/ops/link-codes.md.
--
-- TEST ROWS: every id in docs/PROGRESS.md, "KNOWN TEST ROWS IN THE SHARED DATABASE" -
-- the mirror test readings, the 6 `mock_` pairs, the other walk pairs, and
-- `FpzdJClI11-giquyEpZBA` (Reyner's own Rp 39.000 purchase, 2026-10-07). Known, not
-- exhaustive. Add a new test row here AND in docs/ops/funnel.sql AND in PROGRESS.
-- ============================================================

-- ── QUERY 1: pairs created, by source and from_mirror ──
with params as (
  -- `since` defaults to the first full WIB day after BM's merge (PR #213, merged
  -- 2026-10-09): `pair_created` does not exist before the merge, so the merge day itself
  -- would count only the pairs created after it.
  select timestamptz '2026-10-10 00:00+07' as since,   -- inclusive, WIB
         timestamptz '2026-11-01 00:00+07' as until    -- exclusive, WIB
),
test_rows(id) as (
  values
    -- mirror readings
    ('eJm6p6PjG8f_0eridE39x'), ('Pez1Ggq5SL311dsTIEtc6'), ('IKWSWkN5TKqBiOse6hHAu'),
    ('3KwGxdMJClDyqSs4ja6sw'), ('ZVm4Aghlo9q1zVDjGFQXi'), ('g8JgXk2w8TkNPRrDUrUXy'),
    ('DzmirWSLSntmMTQm4PfMj'), ('8sAU5yPVp2jQARUdexaJf'), ('5qE-AePzQqw4MiggLzMHV'),
    ('6Mr3rBIZPL-k8mYTE8zsq'), ('nuQxfjOL4zZuwU6kaOh9i'), ('l6BZTZrxQdXYVmIgpTYmA'),
    ('8TQ7V4ksqXtmCHzt1FIaR'), ('zklWIMLWpjKIiFA2Hg1mB'), ('V--V4grHETwx5kMLh81Z2'),
    ('2JsNyR3_koVUNjGbjoqEN'), ('nBC65OQkfhuQ9gdyN-Rix'),
    ('Zn-4VU2Ni2lLdcTO25aS2'), ('zDK_PNEbwMDFHYhT_MI2k'), ('WqocaFz1FTMYqLPRBrtnl'),
    -- pairs: walks and Reyner's own purchases
    ('g4WH4_9QbCrCj3Gha934q'), ('JoWcjAT0Rc3DlLQlj3JiT'), ('PZ0t_B3YDnzdXc2LWV38D'),
    ('rVe4ca-FOhsprfGUucTxA'), ('qvW0XL5L2Zb25p9Xg71Uv'), ('JE8fscaWVJjsYLl7FGMRR'),
    ('FpzdJClI11-giquyEpZBA'),
    -- pairs: the 6 with a `mock_` invoice
    ('UZ-HaCnzzi9mRX60Ekqyb'), ('pqZObW6PAKOcuwYtvHzcg'), ('qv9aqhEwOxvPreWwme6aH'),
    ('SFSht0M3lhY950g0IZdEN'), ('4fw6vRFT9iWNjQjVtMlOX'), ('1jiZkq5gK5QhBpiH8isP-')
),
cohort as (
  select e.reading_id as pair_id,
         coalesce(e.detail ->> 'k', 'ref:' || (e.detail ->> 'ref'), '(none)') as source,
         coalesce((e.detail ->> 'from_mirror')::boolean, false)                as from_mirror
  from public.funnel_event e, params p
  where e.event = 'pair_created'
    and e.created_at >= p.since and e.created_at < p.until
    and e.reading_id not in (select id from test_rows)
),
reached as (
  select c.pair_id, c.source, c.from_mirror,
         coalesce(bool_or(e.event = 'checkout_started'), false) as checkout_started,
         coalesce(bool_or(pr.paid), false)                       as paid
  from cohort c
  left join public.funnel_event e on e.reading_id = c.pair_id and e.event = 'checkout_started'
  left join public.pair pr on pr.id = c.pair_id
  group by c.pair_id, c.source, c.from_mirror
)
select source,
       from_mirror,
       count(*)                                  as pair_created,
       count(*) filter (where checkout_started)  as checkout_started,
       count(*) filter (where paid)              as paid
from reached
group by source, from_mirror
order by count(*) desc, source, from_mirror;


-- ── QUERY 2: the Compatibility block on the mirror, by source. Select from here down. ──
with params as (
  -- `since` defaults to the first full WIB day after BM's merge (PR #213, merged
  -- 2026-10-09): rows from the merge day itself mix mount-fired and on-screen
  -- compat_cta_seen, and readings with and without a recorded source.
  select timestamptz '2026-10-10 00:00+07' as since,   -- inclusive, WIB
         timestamptz '2026-11-01 00:00+07' as until    -- exclusive, WIB
),
test_rows(id) as (
  values
    ('eJm6p6PjG8f_0eridE39x'), ('Pez1Ggq5SL311dsTIEtc6'), ('IKWSWkN5TKqBiOse6hHAu'),
    ('3KwGxdMJClDyqSs4ja6sw'), ('ZVm4Aghlo9q1zVDjGFQXi'), ('g8JgXk2w8TkNPRrDUrUXy'),
    ('DzmirWSLSntmMTQm4PfMj'), ('8sAU5yPVp2jQARUdexaJf'), ('5qE-AePzQqw4MiggLzMHV'),
    ('6Mr3rBIZPL-k8mYTE8zsq'), ('nuQxfjOL4zZuwU6kaOh9i'), ('l6BZTZrxQdXYVmIgpTYmA'),
    ('8TQ7V4ksqXtmCHzt1FIaR'), ('zklWIMLWpjKIiFA2Hg1mB'), ('V--V4grHETwx5kMLh81Z2'),
    ('2JsNyR3_koVUNjGbjoqEN'), ('nBC65OQkfhuQ9gdyN-Rix'),
    ('Zn-4VU2Ni2lLdcTO25aS2'), ('zDK_PNEbwMDFHYhT_MI2k'), ('WqocaFz1FTMYqLPRBrtnl')
),
cohort as (
  select e.reading_id,
         coalesce(e.detail ->> 'k', 'ref:' || (e.detail ->> 'ref'), '(none)') as source
  from public.funnel_event e, params p
  where e.event = 'reading_created'
    and e.created_at >= p.since and e.created_at < p.until
    and e.reading_id not in (select id from test_rows)
),
reached as (
  select c.reading_id, c.source,
         bool_or(e.event = 'mirror_served')    as viewed,
         bool_or(e.event = 'compat_cta_seen')  as compat_cta_seen,
         bool_or(e.event = 'compat_cta_click') as compat_cta_click
  from cohort c
  left join public.funnel_event e on e.reading_id = c.reading_id
  group by c.reading_id, c.source
),
by_source as (
  select 'all' as source, viewed, compat_cta_seen, compat_cta_click from reached
  union all
  select source, viewed, compat_cta_seen, compat_cta_click from reached
)
select source,
       count(*)                                  as reading_created,
       count(*) filter (where viewed)            as reading_viewed,
       count(*) filter (where compat_cta_seen)   as compat_cta_seen,
       count(*) filter (where compat_cta_click)  as compat_cta_click
from by_source
group by source
order by (source = 'all') desc, count(*) desc, source;
