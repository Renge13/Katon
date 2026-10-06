-- ============================================================
-- docs/ops/funnel.sql — the mirror funnel, per step, for a date range
-- ============================================================
-- Prompt BG §2.5 (2026-10-06). READ-ONLY: paste into the Supabase SQL editor, set the
-- two dates in `params`, run. It writes nothing.
--
-- THE FUNNEL, AND WHICH EVENT IS EACH STEP (lib/analytics/events.js):
--   1 reading_created     POST /api/mirror created the reading
--   2 reading_viewed      = mirror_served: GET /api/mirror/<token> returned its prose.
--                         There is no `reading_viewed` event and none is needed: that
--                         request IS the reading being shown (lib/mirror/handlers.js).
--                         Its `count` is NOT a view count: settling a purchase warms the
--                         paid render through the same path (lib/deliver/settle.js), which
--                         bumps it. This query counts distinct readings, so that is moot.
--   3 offer_seen          the Complete Edition offer panel entered her viewport, once per
--                         reading, never on a paid reading or with payments closed
--   4 checkout_started    POST /api/pay/<token> opened a checkout
--   5 purchase_confirmed  DOKU's verified notification (or reconcile) settled it
--
-- A COHORT, NOT A DAILY COUNT. The cohort is the readings CREATED in the range; each later
-- step counts how many of THOSE readings ever reached it, whenever that happened. So the
-- steps divide into each other, and a purchase made today on a reading created last month
-- lands in last month's cohort.
--
-- MIRROR ONLY. Pair readings (compat) are keyed by pair id and never carry
-- `reading_created`, so the cohort join leaves them out; `pair_served` is not a step here.
--
-- `has_hour` is the hour split: `reading_created.detail.has_hour`, recorded since
-- 2026-08-29 (Prompt BG asked for `hour_known`; the field already existed under this name,
-- and a second key would have split the history in two). Rows before 2026-08-29 have no
-- funnel_event at all.
--
-- TEST ROWS: the ids listed in docs/PROGRESS.md, "KNOWN TEST ROWS IN THE SHARED DATABASE"
-- (listed 2026-09-25, updated 2026-09-30). Known, not exhaustive: that section says why.
-- NOT in that list and so NOT excluded below: `Zn-4VU2Ni2lLdcTO25aS2`, the 2026-10-06 Rp
-- 19.000 production purchase that verified gate b (PROGRESS header, Prompt BE §0). If it
-- was Reyner's own, add it to the list here AND in PROGRESS.
-- ============================================================

with params as (
  select timestamptz '2026-10-01 00:00+07' as since,   -- inclusive, WIB
         timestamptz '2026-11-01 00:00+07' as until    -- exclusive, WIB
),
test_rows(id) as (
  values
    ('eJm6p6PjG8f_0eridE39x'), ('Pez1Ggq5SL311dsTIEtc6'), ('g4WH4_9QbCrCj3Gha934q'),
    ('JoWcjAT0Rc3DlLQlj3JiT'), ('PZ0t_B3YDnzdXc2LWV38D'), ('rVe4ca-FOhsprfGUucTxA'),
    ('IKWSWkN5TKqBiOse6hHAu'), ('qvW0XL5L2Zb25p9Xg71Uv'), ('JE8fscaWVJjsYLl7FGMRR'),
    ('3KwGxdMJClDyqSs4ja6sw'), ('ZVm4Aghlo9q1zVDjGFQXi'), ('g8JgXk2w8TkNPRrDUrUXy'),
    ('DzmirWSLSntmMTQm4PfMj'), ('8sAU5yPVp2jQARUdexaJf'), ('5qE-AePzQqw4MiggLzMHV'),
    ('6Mr3rBIZPL-k8mYTE8zsq'), ('nuQxfjOL4zZuwU6kaOh9i'), ('l6BZTZrxQdXYVmIgpTYmA'),
    ('8TQ7V4ksqXtmCHzt1FIaR'), ('zklWIMLWpjKIiFA2Hg1mB'), ('V--V4grHETwx5kMLh81Z2'),
    ('2JsNyR3_koVUNjGbjoqEN'), ('nBC65OQkfhuQ9gdyN-Rix'),
    ('UZ-HaCnzzi9mRX60Ekqyb'), ('pqZObW6PAKOcuwYtvHzcg'), ('qv9aqhEwOxvPreWwme6aH'),
    ('SFSht0M3lhY950g0IZdEN'), ('4fw6vRFT9iWNjQjVtMlOX'), ('1jiZkq5gK5QhBpiH8isP-')
),
cohort as (
  select e.reading_id,
         (e.detail ->> 'has_hour')::boolean as has_hour
  from public.funnel_event e, params p
  where e.event = 'reading_created'
    and e.created_at >= p.since and e.created_at < p.until
    and e.reading_id not in (select id from test_rows)
),
reached as (
  select c.reading_id, c.has_hour,
         bool_or(e.event = 'mirror_served')      as viewed,
         bool_or(e.event = 'offer_seen')         as offer_seen,
         bool_or(e.event = 'checkout_started')   as checkout_started,
         bool_or(e.event = 'purchase_confirmed') as purchase_confirmed
  from cohort c
  left join public.funnel_event e on e.reading_id = c.reading_id
  group by c.reading_id, c.has_hour
),
by_split as (
  select 'all' as split, * from reached
  union all
  select case when has_hour then 'hour given' when has_hour = false then 'no hour' else 'unrecorded' end, *
  from reached
)
select split,
       count(*)                                        as reading_created,
       count(*) filter (where viewed)                  as reading_viewed,
       count(*) filter (where offer_seen)              as offer_seen,
       count(*) filter (where checkout_started)        as checkout_started,
       count(*) filter (where purchase_confirmed)      as purchase_confirmed
from by_split
group by split
order by case split when 'all' then 0 when 'hour given' then 1 when 'no hour' then 2 else 3 end;
