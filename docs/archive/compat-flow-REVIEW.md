<!--
STATUS: CLOSED 2026-08-02 — all seven decided by Reyner, landed in compatibility-reading-spec.md
and PROGRESS.md. Kept in docs/archive/ as the decision trail only.
DECISIONS: D1 = c (faces + one named fact free). D2 = a (comparison card shareable pre-payment).
D3 = c (P6 Luck Pillar sync descoped from v1). D4 = a (quadrants kept as Katon ruling).
D5 = harga peluncuran cohorts, never silent A/B. D6 = a, CONFIRMED deliberately (no consent line;
P2 reframe copy carries the ethics; reading is anonymous and does not affect person B).
D7 = no login at the mirror; account + email created at first compat checkout.
ORIGINAL SHEET BELOW, unedited.
JOB: reconcile product/compatibility-reading-spec.md (proposal, pre-lock) against the post-08-01
engine and today's decisions, and define the input->output flow. Fill the Keputusan column;
unmentioned rows follow the recommendation, per your standing convention.
After decisions: the spec body gets corrected in place (DOC-STANDARD: one file per topic), and the
engine additions move to a Claude Code prompt (E-series). This sheet then goes to docs/archive/.
-->

# Compatibility flow — reconciliation + input->output

## 1. THE FLOW, assembled from what is already decided

```
INPUT
  Person A: already has a chart (came from the free mirror; readings are cached).
  Person B: birth date REQUIRED; hour OPTIONAL (degrades: no hour pillar, day pillar
            assumed calendar-day, QA-flag if birth near 23:00); gender OPTIONAL
            (needed only for Luck Pillar sync - see D3).

TEASE (free)  <- decided funnel: paywall fires AFTER B is entered and the tease is seen
  P0 pairing reveal: two archetype faces side by side. Scope of what shows free = D1.

PAYWALL
  Price 25-45k TESTED (the spec's 99k is dead - see contradictions).
  Email captured HERE, transactionally framed (receipt + retrieve reading) - per 08-02 session.
  Server-gated via Xendit webhook, same as rule 18.

ENGINE (pair layer - all rule-based or small authored sets, no 100-cell matrix)
  1. chart B computed (same calculator, same conventions)
  2. DM x DM relation ................ stem combine/support/clash - lookup
  3. Spouse Palace block ............. day-branch x day-branch relation (six relations incl 刑)
                                       + does B's chart hit A's day branch, and vice versa
  4. element complementarity ......... favorable-element logic run cross-chart
  5. Ten Gods temperament fit ........ collapsed to ~5 element-relationship dynamics
  6. affinity vs fit quadrant ........ computed from 2+4 (Katon ruling, not classical - D4)
  7. Luck Pillar sync ................ D3: proposed DESCOPED from v1
  -> pair semantic JSON, cached on hash(chartA + chartB + engine_version), canonical A/B
     ordering with a perspective field (P2 is directional)

RENDER
  Flagship-tier model per pipeline-spec model-per-tier binding. Same Stage-6 gate.
  Reading structure P1..P8 from the spec (P6 subject to D3).

OUTPUT
  The paid reading + the comparison card (shareability = D2) + P8 loop-out
  (next pairing / household - later product).
```

## 2. CONTRADICTIONS — spec vs current locked state. Fix in place after this review.

| # | Spec says | Current truth | Action |
|---|-----------|---------------|--------|
| 1 | "99k for a single pairing... ~500k willingness-to-pay" | Price band 25-45k TESTED (CLAUDE.md, PROGRESS). 80-99k explicitly has no evidence | Delete the price section, point at launch-decisions.md |
| 2 | "[You, Hujan] x [Her, Permata]" | 癸 = **Embun** (locked 08-02). Hujan was rejected | Correct example; sweep spec for pre-lock names |
| 3 | "user has... paid, and entered the second person's birth date" (pay BEFORE reveal) | Decided funnel: paywall AFTER 2nd birthdate + tease seen | Reorder: P0 is the tease, paywall sits between P0 and P1 |
| 4 | "Dated windows: 2027 stirs your Spouse Palace" | Rule 25: no dated prophecy; timing is cuaca | See D3 - dated years are the sharpest ethics edge in the product |
| 5 | Luck Pillar sync assumed available | Luck pillars need GENDER (optional field, null default) AND the 13-chart fixture was collected male-only - no female-set validation exists | See D3 |
| 6 | "gila keren" beat, casual asides | One composed voice; the casual register is dead | Authoring-time sweep, no structural change |

## 3. DECISIONS — `[REYNER]`, fill Keputusan

| # | Decision | Options | Rekomendasi | Keputusan |
|---|----------|---------|-------------|-----------|
| D1 | What exactly shows FREE at P0, after B is entered | (a) both archetype faces only; (b) faces + element bars; (c) faces + ONE relational fact (e.g. seat relation named but not explained) | **(c)** - the tease must prove the machine sees something relational, or the paywall asks for faith. One named fact, zero explanation, is the itch. (b) shows data without meaning; (a) shows nothing the mirror didn't | |
| D2 | Is the P0 comparison card shareable pre-payment? | (a) yes, free shareable comparison card; (b) only after payment | **(a)** - it is the compat product's own acquisition engine ("look how different we are"), same logic as Card A. The paid reading, not the card, is the product. Risk to accept: some pairs will screenshot the tease and stop; they were not buyers | |
| D3 | P6 Luck Pillar sync in v1? | (a) full, with dated year windows; (b) phase-only, no dated years ("one of you is in a demanding season"); (c) descope P6 from v1 entirely | **(c) for v1, (b) as fast-follow.** Three reasons stack: dated years skirt rule 25 however cuaca-framed; gender is optional so P6 silently vanishes for null-gender users (a paid section that sometimes does not exist); and there is NO female-set fixture, so per rule 4 the luck-pillar layer is unvalidated. Cutting P6 removes zero engine blockers and the annual-reading product carries timing later, properly validated | |
| D4 | P5 affinity/fit quadrants - keep as a Katon ruling? | (a) keep, documented as Katon synthesis (not classical); (b) cut | **(a)** - it is the beat people quote, and it is honest as long as the quadrant assignment is a written deterministic rule and we never claim classical authority for the framework itself (the INPUTS are classical; the 2x2 is ours) | |
| D5 | Price test design inside 25-45k | (a) single price 35k; (b) A/B two prices (29k vs 39k) from day one | **(b)** - the band exists because evidence does not; a single point learns almost nothing. QRIS makes per-cohort pricing trivial | |
| D6 | Person-B consent posture | (a) nothing; (b) one honest line at input ("Bacaan ini tentang relasimu dengan dia, bukan penilaian atas dirinya" - wording yours); (c) full consent flow | **(b)** - (c) is theater that kills conversion and (a) ignores that B never asked to be read. One composed sentence sets the ethical frame AND doubles as the anti-verdict framing the spec already requires. Register is yours | |
| D7 | Email required at compat checkout | confirm / reject | **Confirm** - recorded 08-02; transactional framing, mirror stays anon | |

## 4. ENGINE ADDITIONS the pair layer needs (future Prompt E, Claude Code)

All deterministic; none touch locked files. The branch-relation tables already exist and are
test-locked - the additions are CROSS-CHART applications of them, plus rules:

1. `pairRelations(chartA, chartB)`: day-branch x day-branch relation; B-branches vs A's day branch
   (spouse-palace hits) and mirrored; stem relation DM x DM.
2. Cross-chart element complementarity from the existing favorable-element output.
   Note: Oracle 4 says supportShare reads systematically HIGH (+3.6) - edge pairs need the
   `strength_confidence` flag before a feed/drain verdict is stated flatly.
3. Affinity/fit quadrant rule (per D4) - written spec first, then implemented.
4. Pair cache key + canonical ordering + perspective field.
5. Stage-3-equivalent hierarchy for the pair JSON (which facts headline).

**Rule 4 note:** Joey's plotter prints single charts only - there is no plotter oracle for the pair
layer. The oracle for the RELATION TABLES is the repo's own locked tests (already verified); the
pair-level weighting and quadrant rules have no external oracle and must be documented as Katon
rulings, in docs, before implementation. Nothing in the pair layer may introduce a new BaZi table
without a written source.

## 5. WHAT STANDS UNCHANGED FROM THE SPEC (no action)

The classical 7-step workflow. The ethical spine (map not verdict, friction cost not failure,
no pass/fail headline score). P1-P4 + P7 structure and payoff types. The authoring-cost analysis
(~5x5 element grid + branch outcome blocks + 4 quadrant blocks, not a 100-cell matrix). P8 loop-out
to household as a later product.
