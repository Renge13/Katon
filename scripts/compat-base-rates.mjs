#!/usr/bin/env node
// ============================================================
// scripts/compat-base-rates.mjs — how often each compat clause fires
// ============================================================
//   node scripts/compat-base-rates.mjs [--charts N] [--pairs M] [--seed S]
//   node scripts/compat-base-rates.mjs --selftest
//
// ── WHAT THIS IS FOR ──────────────────────────────────────
// The compat engine's clauses were each tested on ONE hand-derived pair. That
// proves the clause is implemented; it says nothing about whether a clause fires
// for 2% of couples or 95% of them. A verdict that lands on almost everybody is
// not a verdict, and a quadrant nobody reaches is dead content. This prints the
// base rates so that conversation can happen against numbers.
//
// ── IT MEASURES, IT DOES NOT RULE ─────────────────────────
// **NOTHING HERE CHANGES A RULE.** It imports the shipped modules and tallies
// what they return. If a rate looks wrong, the finding is a finding: the rule
// lives in docs/product/compat-p4-p5-rules.md and moves only by a ruling.
//
// ── WHY IT ASSERTS ITS OWN ARITHMETIC ─────────────────────
// This repo has been burned repeatedly by measurements that could not fail - a
// ban-list sweep that compiled zero patterns and printed CLEAN, a card probe that
// a blank PNG passed. A frequency table is the same shape: every number it prints
// looks plausible, and nothing on screen shows a miscount.
//
// So it checks the invariants that MUST hold if the tally is real, and throws
// rather than printing on any breach:
//   - the four quadrant counts sum to M
//   - q1 + q2 equals the pull-high count, q1 + q3 equals the fit-high count
//   - pull is high exactly when >= 1 pull clause fired
//   - fit is high exactly when all three fit clauses held
//   - the six pattern counts sum to M; matching and related each equal their
//     relation count, and the four directed patterns sum to different_group
// And `--selftest` re-runs the pairs whose quadrants the committed specs assert
// by hand, so the pipeline here is checked against known answers, not only
// against itself. **The selftest has been shown failing on purpose** - see the
// QA doc this generates.
//
// ── --variants: WHAT SEVEN RULE SETS WOULD DO TO THE SAME PAIRS ──
// `--variants` prints the quadrant distribution under seven rule sets on the SAME
// seed and the SAME sample, so the columns are comparable pair for pair rather
// than across two draws.
//
// **NOTHING IN lib/ CHANGES AND NO RULE MOVES.** V0 is computed by the SHIPPED
// `compatPullFit`; V1-V6 are computed here, locally, from the same three fact
// objects. They are hypotheticals for Reyner to rule on or discard.
//
// THE GUARD THAT MAKES THE DELTAS MEAN ANYTHING: the local variant engine also
// computes V0, and every pair asserts that its local V0 equals the shipped
// module's output exactly. If the local machinery has drifted from the rule, the
// V0 column disagrees with the module and the run throws - so V1-V6 cannot be
// read as deltas off a V0 that was never the real rule.
//
// PLUS THE MONOTONICITY THE VARIANTS MUST OBEY, asserted per pair, not in
// aggregate. Narrowing or dropping a pull clause can only remove pull; extending
// 2.2.c or tightening 2.2.a can only remove fit, and DELETING a fit conjunct can
// only add it. So:
//   V1.pull => V2.pull => V0.pull      (V1 clauses subset V2 subset V0)
//   V3.fit  => V0.fit                  (2.2.c extended)
//   V4.fit  => V3.fit, V5.fit => V3.fit (2.2.a tightened)
//   V1/V3/V4/V5 pull are IDENTICAL     (same pull rule)
//   V6.pull === V2.pull                 (same pull rule, so identical not ordered)
//   V3.fit  => V6.fit                   (V6 DROPS 2.2.a, so its fit is a superset)
// A variant implemented backwards fails these rather than printing a plausible
// column. Both V6 relations were driven red on purpose - giving V6 the
// unrestricted 2.1.d trips the first on pair 2, and re-adding 2.2.a trips the
// second on pair 1208, which is one of only about four pairs in 5000 where that
// conjunct makes any difference at all.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { compatBranchRelations } from '../lib/compat/branchRelations.js';
import { compatComplementarity } from '../lib/compat/complementarity.js';
import { compatStemRelation } from '../lib/compat/stemRelation.js';
import { compatTemperament } from '../lib/compat/temperament.js';
import { compatPullFit } from '../lib/compat/pullFit.js';
import { p3SupplyKey } from '../lib/semantic/pair.js';

const DEFAULTS = { charts: 2000, pairs: 5000, seed: 20260907 };

const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (hit) return Number(hit.split('=')[1]);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return Number(process.argv[idx + 1]);
  }
  return fallback;
};

/**
 * mulberry32 — a small, well-known 32-bit PRNG. Chosen because it is four lines
 * and needs no dependency, and because the whole point is reproducibility: the
 * same seed must give the same charts on any machine and any Node version, which
 * Math.random cannot promise.
 */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 1960-01-01 .. 2005-12-31 inclusive, as UTC day numbers. UTC arithmetic on
// purpose: it makes the generated STRING deterministic regardless of the machine's
// timezone. Nothing here converts a birth time - the engine takes the naive
// wall-clock string exactly as generated (CLAUDE.md rule 3).
const FIRST_DAY = Date.UTC(1960, 0, 1) / 86400000;
const LAST_DAY = Date.UTC(2005, 11, 31) / 86400000;
const SPAN = LAST_DAY - FIRST_DAY + 1;

const pad = (n) => String(n).padStart(2, '0');

/** One random birth datetime, hour KNOWN. */
function randomBirth(rand) {
  const d = new Date((FIRST_DAY + Math.floor(rand() * SPAN)) * 86400000);
  return {
    birthDate: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    birthTime: `${pad(Math.floor(rand() * 24))}:${pad(Math.floor(rand() * 60))}`,
  };
}

const PULL_CLAUSES = ['2.1.a', '2.1.b', '2.1.c', '2.1.d'];
// 2.2.a was DELETED by the V6 amendment (2026-09-08) and the module no longer
// emits it. Leaving it here kept its held-count at 0 and tripped the "fit high
// exceeds the scarcest held clause" invariant - the guard catching a stale
// constant in its own file, which is the check working rather than a nuisance.
const FIT_CLAUSES = ['2.2.b', '2.2.c'];
const QUADRANTS = ['q1', 'q2', 'q3', 'q4'];
// Six since option E (2026-10-07, Prompt BD1): `contrasting` split four ways by directed
// step. BB §1.3's run on seed 20260907 is the reference these must reproduce exactly:
// 526 / 445 / 977 / 1001 / 1054 / 997.
const PATTERNS = ['matching', 'related', 'a_generates_b', 'a_controls_b', 'b_controls_a', 'b_generates_a'];
const DIRECTED_PATTERNS = PATTERNS.slice(2);
const RELATIONS = ['same_god', 'same_group', 'different_group'];

// ── the clause building blocks, over the tranche-1 fact objects ──
// Each reads exactly what the corresponding ruled clause reads. The 2.1.a/b/c
// blocks and 2.2.b are shared by every variant; only the marked ones differ.

const dayRelationsOf = (branches) => branches.dayBranchPair.map((e) => e.relation);
const palaceOf = (branches) => [...branches.bHitsASpousePalace, ...branches.aHitsBSpousePalace];

/** 2.1.a — dayBranchPair contains harmony 六合 */
const pull_a = ({ branches }) => dayRelationsOf(branches).includes('六合');
/** 2.1.b — dayBranchPair contains clash 冲 (counted as pull on purpose) */
const pull_b = ({ branches }) => dayRelationsOf(branches).includes('冲');
/** 2.1.c — combination present (Day Masters are a 天干五合 pair) */
const pull_c = ({ stems }) => 'combination' in stems;
/** 2.1.d — ANY palace entry is harmony or clash. V0 and V2 only. */
const pull_d = ({ branches }) => palaceOf(branches)
  .some((e) => e.relation === '六合' || e.relation === '冲');
/**
 * 2.1.d restricted to the other person's MONTH branch (V2).
 * In both scans `from` is the other person and `to` is the day branch being hit,
 * so "the other person's month branch" is `from.position === 'month'` in either
 * direction.
 */
const pull_d_month = ({ branches }) => palaceOf(branches)
  .some((e) => e.from.position === 'month' && (e.relation === '六合' || e.relation === '冲'));

/** 2.2.a as ruled — a supplier in EITHER direction. V0, V1, V2, V3. */
const fit_a_either = ({ comp }) => comp.aSupplies !== null || comp.bSupplies !== null;
/** 2.2.a variant — the supplier must serve the receiver's RANK-0 favourable element (V4). */
const fit_a_rank0 = ({ comp }) => [comp.aSupplies, comp.bSupplies]
  .some((s) => s !== null && s.receiver_favourable_rank === 0);
/** 2.2.a variant — supply in BOTH directions (V5). */
const fit_a_both = ({ comp }) => comp.aSupplies !== null && comp.bSupplies !== null;

/** 2.2.b — sameImbalance empty. Unchanged in every variant. */
const fit_b = ({ comp }) => comp.sameImbalance.length === 0;

/** 2.2.c as ruled — no 害 and no 刑 on the DAY PAIR only. */
const fit_c_day = ({ branches }) => {
  const day = dayRelationsOf(branches);
  return !day.includes('害') && !day.includes('刑');
};
/** 2.2.c extended — palace 害/刑 lower fit too (V3, V4, V5). */
const fit_c_day_palace = (facts) => fit_c_day(facts)
  && !palaceOf(facts.branches).some((e) => e.relation === '害' || e.relation === '刑');

/** Standalone: does ANY palace entry carry 害 or 刑? Reported on its own. */
const palaceHarmOrPunishment = ({ branches }) => palaceOf(branches)
  .some((e) => e.relation === '害' || e.relation === '刑');

/**
 * The six rule sets. `pull` and `fit` are lists of predicates: pull is a
 * DISJUNCTION (2.1, any), fit is a CONJUNCTION (2.2, all).
 */
const VARIANTS = {
  // V0 IS THE CURRENT RULE, and since the V6 amendment of 2026-09-08 the current
  // rule IS V6 - narrowed 2.1.d, no 2.2.a, extended 2.2.c. So V0 and V6 are now
  // the same rule set and print identical rows, which is not a redundancy: V0 is
  // asserted per pair against the SHIPPED module, and V6 is the hypothetical run
  // 2b measured. Their two rows agreeing is the verification that the module
  // implements what was ruled.
  V0: { note: 'current rule (= V6, ruled 2026-09-08)', pull: [pull_a, pull_b, pull_c, pull_d_month], fit: [fit_b, fit_c_day_palace] },
  // Vpre is the rule as it stood BEFORE 2026-09-08. Runs 1 and 2 measured it as
  // V0; keeping it under its own name is what lets run 3 show the amendment's
  // effect in one table instead of across two documents.
  Vpre: { note: 'the PRE-2026-09-08 rule (runs 1 and 2 called this V0)', pull: [pull_a, pull_b, pull_c, pull_d], fit: [fit_a_either, fit_b, fit_c_day] },
  V1: { note: 'drop 2.1.d', pull: [pull_a, pull_b, pull_c], fit: [fit_a_either, fit_b, fit_c_day] },
  V2: { note: '2.1.d = month branch only', pull: [pull_a, pull_b, pull_c, pull_d_month], fit: [fit_a_either, fit_b, fit_c_day] },
  V3: { note: 'V1 + palace harm/punishment lower fit', pull: [pull_a, pull_b, pull_c], fit: [fit_a_either, fit_b, fit_c_day_palace] },
  V4: { note: 'V3 + 2.2.a = rank-0 supplier, either direction', pull: [pull_a, pull_b, pull_c], fit: [fit_a_rank0, fit_b, fit_c_day_palace] },
  V5: { note: 'V3 + 2.2.a = supply in BOTH directions', pull: [pull_a, pull_b, pull_c], fit: [fit_a_both, fit_b, fit_c_day_palace] },
  // V6 is the combination the first six did NOT measure, added 2026-09-08 on
  // Reyner's instruction: V2's PULL (2.1.d narrowed to the other person's month
  // branch) with V3's FIT (palace 害/刑 lower fit), and 2.2.a DELETED rather than
  // tightened - run 2 having shown that both proposed tightenings are as inert as
  // the ruled form. Note the fit list has TWO clauses, not three.
  V6: { note: "V2's pull + V3's fit, 2.2.a deleted", pull: [pull_a, pull_b, pull_c, pull_d_month], fit: [fit_b, fit_c_day_palace] },
};
const VARIANT_IDS = Object.keys(VARIANTS);

/** Apply one rule set to one pair's facts. */
function applyVariant({ pull, fit }, facts) {
  const pullHigh = pull.some((clause) => clause(facts));
  const fitHigh = fit.every((clause) => clause(facts));
  return {
    pull: pullHigh ? 'high' : 'low',
    fit: fitHigh ? 'high' : 'low',
    quadrant: pullHigh ? (fitHigh ? 'q1' : 'q2') : (fitHigh ? 'q3' : 'q4'),
  };
}

/** Every compat fact for one ordered pair. The modules, unmodified. */
function evaluate(a, b) {
  const branches = compatBranchRelations(a, b);
  const complementarity = compatComplementarity(a, b);
  const stems = compatStemRelation(a, b);
  return {
    facts: { branches, comp: complementarity, stems },
    pullFit: compatPullFit(branches, complementarity, stems),
    temperament: compatTemperament(a, b),
  };
}

function tally({ charts, pairs, seed }) {
  const rand = mulberry32(seed);

  const built = [];
  for (let i = 0; i < charts; i += 1) {
    const birth = randomBirth(rand);
    built.push({ birth, chart: calculateBaziChart(birth) });
  }

  const counts = {
    quadrant: Object.fromEntries(QUADRANTS.map((q) => [q, 0])),
    pullClause: Object.fromEntries(PULL_CLAUSES.map((c) => [c, 0])),
    fitHeld: Object.fromEntries(FIT_CLAUSES.map((c) => [c, 0])),
    pattern: Object.fromEntries(PATTERNS.map((p) => [p, 0])),
    relation: Object.fromEntries(RELATIONS.map((r) => [r, 0])),
    pullHigh: 0,
    fitHigh: 0,
    // P3, as the reader meets it: the cell `p3SupplyKey` picks (Prompt AM,
    // 2026-09-28), split so "both give" and "only the partner gives" - both
    // `p3_supplies` - stay distinguishable.
    p3: { both: 0, partner_only: 0, reader_only: 0, none: 0 },
    // P1 x P4 overlap (Prompt BD1 §4.1, report only): pairs that get a P1 controls cell
    // AND a P4 controls cell, or a P1 produces cell AND a P4 generates cell - the same
    // kind of dynamic named twice in one reading. `same_dir` counts those whose two
    // directions agree (both a_* or both b_*).
    overlap: { controls: 0, controls_same_dir: 0, generates: 0, generates_same_dir: 0 },
  };

  // Variant tallies. The RNG is untouched by this - charts and pair indices are
  // drawn in exactly the same order whether or not variants are reported - so a
  // --variants run reproduces the V0 numbers of a plain run on the same seed.
  const variant = Object.fromEntries(VARIANT_IDS.map((id) => [id, {
    quadrant: Object.fromEntries(QUADRANTS.map((q) => [q, 0])),
    pullHigh: 0,
    fitHigh: 0,
  }]));
  const standalone = {
    'palace 害/刑 present': 0,
    '2.2.a ruled (either direction)': 0,
    '2.2.a rank-0 (either direction)': 0,
    '2.2.a both directions': 0,
  };
  // How often each pull clause is the ONLY one firing. This is the number that
  // explains a V0-vs-V1 gap: a clause that never fires alone can be deleted
  // without moving a single V0 verdict, however often it "fires".
  const soleClause = { '2.1.a alone': 0, '2.1.b alone': 0, '2.1.c alone': 0, '2.1.d alone': 0 };

  for (let n = 0; n < pairs; n += 1) {
    let i = Math.floor(rand() * built.length);
    let j = Math.floor(rand() * built.length);
    // Ordered pairs of two DIFFERENT charts. A chart against itself is not a
    // couple and would inflate same_god and 自刑 for free.
    while (j === i) j = Math.floor(rand() * built.length);

    const { facts, pullFit, temperament } = evaluate(built[i].chart, built[j].chart);

    // ── the six rule sets, on this same pair ──
    const applied = Object.fromEntries(
      VARIANT_IDS.map((id) => [id, applyVariant(VARIANTS[id], facts)]),
    );

    // THE GUARD ON THE WHOLE VARIANT TABLE: the local V0 must equal the shipped
    // module, pair for pair. Without this, V1-V5 would be deltas off a V0 that
    // was never the real rule.
    if (applied.V0.quadrant !== pullFit.quadrant
      || applied.V0.pull !== pullFit.pull
      || applied.V0.fit !== pullFit.fit) {
      throw new Error(
        `INVARIANT BREACH: local V0 disagrees with lib/compat/pullFit.js on pair ${n} `
        + `(${built[i].birth.birthDate} ${built[i].birth.birthTime} x `
        + `${built[j].birth.birthDate} ${built[j].birth.birthTime}): `
        + `local ${applied.V0.pull}/${applied.V0.fit}/${applied.V0.quadrant} vs `
        + `module ${pullFit.pull}/${pullFit.fit}/${pullFit.quadrant}`,
      );
    }

    assertVariantMonotonicity(applied, n);

    for (const id of VARIANT_IDS) {
      variant[id].quadrant[applied[id].quadrant] += 1;
      if (applied[id].pull === 'high') variant[id].pullHigh += 1;
      if (applied[id].fit === 'high') variant[id].fitHigh += 1;
    }

    if (pullFit.pull_reasons.length === 1) soleClause[`${pullFit.pull_reasons[0]} alone`] += 1;

    if (palaceHarmOrPunishment(facts)) standalone['palace 害/刑 present'] += 1;
    if (fit_a_either(facts)) standalone['2.2.a ruled (either direction)'] += 1;
    if (fit_a_rank0(facts)) standalone['2.2.a rank-0 (either direction)'] += 1;
    if (fit_a_both(facts)) standalone['2.2.a both directions'] += 1;

    counts.quadrant[pullFit.quadrant] += 1;
    if (pullFit.pull === 'high') counts.pullHigh += 1;
    if (pullFit.fit === 'high') counts.fitHigh += 1;
    for (const clause of pullFit.pull_reasons) counts.pullClause[clause] += 1;
    for (const { clause, held } of pullFit.fit_reasons) if (held) counts.fitHeld[clause] += 1;
    counts.pattern[temperament.pattern] += 1;
    counts.relation[temperament.relation] += 1;

    // P1's cell as lib/semantic/pair.js P1_BY_CYCLE picks it: a 天干五合 pair is
    // p1_combination whatever its cycle, so only a non-combination cycle counts.
    const p1Cycle = facts.stems.combination ? null : facts.stems.cycle;
    const p4 = temperament.pattern;
    const dirOf = (id) => (id.startsWith('a_') ? 'a' : id.startsWith('b_') ? 'b' : null);
    if (p1Cycle && /controls/.test(p1Cycle) && /controls/.test(p4)) {
      counts.overlap.controls += 1;
      if (dirOf(p1Cycle) === dirOf(p4)) counts.overlap.controls_same_dir += 1;
    }
    if (p1Cycle && /produces/.test(p1Cycle) && /generates/.test(p4)) {
      counts.overlap.generates += 1;
      if (dirOf(p1Cycle) === dirOf(p4)) counts.overlap.generates_same_dir += 1;
    }

    const supplies = [
      facts.comp.aSupplies && { from: 'a' },
      facts.comp.bSupplies && { from: 'b' },
    ].filter(Boolean);
    const key = p3SupplyKey(supplies);
    counts.p3[key === 'p3_no_supply' ? 'none'
      : key === 'p3_reader_gives' ? 'reader_only'
        : supplies.length === 2 ? 'both' : 'partner_only'] += 1;
  }

  // P3 against the standalone predicates, which read `comp` directly rather than
  // through `p3SupplyKey`: two computations of one fact must agree.
  if (counts.p3.both !== standalone['2.2.a both directions']) {
    throw new Error(`INVARIANT BREACH: P3 both=${counts.p3.both} but 2.2.a both=${standalone['2.2.a both directions']}`);
  }
  if (pairs - counts.p3.none !== standalone['2.2.a ruled (either direction)']) {
    throw new Error(`INVARIANT BREACH: P3 some-supply=${pairs - counts.p3.none} but 2.2.a either=${standalone['2.2.a ruled (either direction)']}`);
  }

  assertInvariants(counts, pairs);
  for (const id of VARIANT_IDS) assertVariantInvariants(id, variant[id], pairs);
  return { counts, built, variant, standalone, soleClause };
}

/**
 * The arithmetic that must hold if the tally is real. Throws rather than letting
 * a plausible-looking table print.
 */
function assertInvariants(counts, pairs) {
  const fail = (msg) => { throw new Error(`INVARIANT BREACH: ${msg}`); };
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

  if (sum(counts.quadrant) !== pairs) fail(`quadrants sum to ${sum(counts.quadrant)}, not ${pairs}`);
  if (sum(counts.pattern) !== pairs) fail(`patterns sum to ${sum(counts.pattern)}, not ${pairs}`);
  if (sum(counts.relation) !== pairs) fail(`relations sum to ${sum(counts.relation)}, not ${pairs}`);
  if (sum(counts.p3) !== pairs) fail(`P3 cells sum to ${sum(counts.p3)}, not ${pairs}`);

  // 2.3: the quadrant is a pure function of the two booleans.
  const q = counts.quadrant;
  if (q.q1 + q.q2 !== counts.pullHigh) fail(`q1+q2=${q.q1 + q.q2} but pull high=${counts.pullHigh}`);
  if (q.q1 + q.q3 !== counts.fitHigh) fail(`q1+q3=${q.q1 + q.q3} but fit high=${counts.fitHigh}`);

  // 2.1: pull is a disjunction, so pull-high can never exceed the clause total
  // and can never be zero while some clause fired.
  const clauseTotal = sum(counts.pullClause);
  if (counts.pullHigh > clauseTotal) fail(`pull high=${counts.pullHigh} exceeds clause hits=${clauseTotal}`);
  if (counts.pullHigh === 0 && clauseTotal > 0) fail('clauses fired but no pair is pull high');

  // 2.2: fit is a conjunction, so fit-high cannot exceed the least-often-held clause.
  const minHeld = Math.min(...Object.values(counts.fitHeld));
  if (counts.fitHigh > minHeld) fail(`fit high=${counts.fitHigh} exceeds scarcest held clause=${minHeld}`);

  // 1.1: matching and related are 1:1 with their relations, and the four directed
  // patterns together are exactly `different_group` (option E, 2026-10-07).
  const pairsOf = [['matching', 'same_god'], ['related', 'same_group']];
  for (const [pattern, relation] of pairsOf) {
    if (counts.pattern[pattern] !== counts.relation[relation]) {
      fail(`${pattern}=${counts.pattern[pattern]} but ${relation}=${counts.relation[relation]}`);
    }
  }
  const directed = DIRECTED_PATTERNS.reduce((n, p) => n + counts.pattern[p], 0);
  if (directed !== counts.relation.different_group) {
    fail(`directed patterns sum to ${directed} but different_group=${counts.relation.different_group}`);
  }
}

/**
 * The logical relations the six rule sets MUST obey, checked per pair rather than
 * in aggregate - an aggregate check can be satisfied by two errors cancelling.
 *
 * Dropping or narrowing a pull clause can only REMOVE pull. Extending 2.2.c or
 * tightening 2.2.a can only REMOVE fit. A variant wired backwards - a predicate
 * negated, the wrong clause list - fails here instead of printing a plausible
 * column.
 */
function assertVariantMonotonicity(v, n) {
  const fail = (msg) => { throw new Error(`INVARIANT BREACH on pair ${n}: ${msg}`); };
  const high = (x) => x === 'high';

  // ── PULL ──
  // Vpre reads all eight palace pairings; V2, V0 and V6 read the month branch
  // only; V1, V3, V4 and V5 read none. So the clause sets nest, and narrowing can
  // only remove pull.
  if (high(v.V1.pull) && !high(v.V2.pull)) fail('V1 pull high but V2 pull low');
  if (high(v.V2.pull) && !high(v.Vpre.pull)) fail('V2 pull high but Vpre pull low');

  // Identical pull rules must give IDENTICAL verdicts, not merely ordered ones -
  // a one-sided implication would let a variant keep the wrong 2.1.d.
  for (const id of ['V3', 'V4', 'V5']) {
    if (v[id].pull !== v.V1.pull) fail(`${id} pull ${v[id].pull} != V1 pull ${v.V1.pull}`);
  }
  for (const id of ['V0', 'V6']) {
    if (v[id].pull !== v.V2.pull) fail(`${id} pull ${v[id].pull} != V2 pull ${v.V2.pull}`);
  }

  // ── FIT ──
  // Vpre, V1 and V2 share the ruled pre-amendment fit; V3/V4/V5 extend 2.2.c and
  // keep some form of 2.2.a; V0 and V6 extend 2.2.c and DROP 2.2.a.
  if (v.V1.fit !== v.Vpre.fit) fail('V1 and Vpre share the fit rule but disagree');
  if (v.V2.fit !== v.Vpre.fit) fail('V2 and Vpre share the fit rule but disagree');
  if (v.V0.fit !== v.V6.fit) fail('V0 and V6 are the same rule set but their fit disagrees');

  // Extending 2.2.c can only remove fit.
  if (high(v.V3.fit) && !high(v.Vpre.fit)) fail('V3 fit high but Vpre fit low');

  // Tightening 2.2.a can only remove fit; DROPPING it can only add fit.
  for (const id of ['V4', 'V5']) {
    if (high(v[id].fit) && !high(v.V3.fit)) fail(`${id} fit high but V3 fit low`);
  }
  if (high(v.V3.fit) && !high(v.V0.fit)) fail('V3 fit high but V0 fit low');
}

/** Same arithmetic as assertInvariants, per variant. */
function assertVariantInvariants(id, v, pairs) {
  const fail = (msg) => { throw new Error(`INVARIANT BREACH [${id}]: ${msg}`); };
  const sum = Object.values(v.quadrant).reduce((a, b) => a + b, 0);
  if (sum !== pairs) fail(`quadrants sum to ${sum}, not ${pairs}`);
  if (v.quadrant.q1 + v.quadrant.q2 !== v.pullHigh) {
    fail(`q1+q2=${v.quadrant.q1 + v.quadrant.q2} but pull high=${v.pullHigh}`);
  }
  if (v.quadrant.q1 + v.quadrant.q3 !== v.fitHigh) {
    fail(`q1+q3=${v.quadrant.q1 + v.quadrant.q3} but fit high=${v.fitHigh}`);
  }
}

const pct = (n, of) => `${((n / of) * 100).toFixed(1)}%`;

function report({ counts }, { charts, pairs, seed }) {
  const lines = [];
  lines.push(`charts=${charts} pairs=${pairs} seed=${seed}`);
  lines.push('');
  lines.push('P5 QUADRANT                       count      rate');
  for (const q of QUADRANTS) {
    lines.push(`  ${q}${' '.repeat(30)}${String(counts.quadrant[q]).padStart(6)}  ${pct(counts.quadrant[q], pairs).padStart(8)}`);
  }
  lines.push(`  pull high${' '.repeat(22)}${String(counts.pullHigh).padStart(6)}  ${pct(counts.pullHigh, pairs).padStart(8)}`);
  lines.push(`  fit high${' '.repeat(23)}${String(counts.fitHigh).padStart(6)}  ${pct(counts.fitHigh, pairs).padStart(8)}`);
  lines.push('');
  lines.push('PULL CLAUSE (fired)               count      rate');
  for (const c of PULL_CLAUSES) {
    lines.push(`  ${c}${' '.repeat(27)}${String(counts.pullClause[c]).padStart(6)}  ${pct(counts.pullClause[c], pairs).padStart(8)}`);
  }
  lines.push('');
  lines.push('FIT CLAUSE                         held      rate     failed      rate');
  for (const c of FIT_CLAUSES) {
    const held = counts.fitHeld[c];
    const failed = pairs - held;
    lines.push(`  ${c}${' '.repeat(26)}${String(held).padStart(6)}  ${pct(held, pairs).padStart(8)}  ${String(failed).padStart(9)}  ${pct(failed, pairs).padStart(8)}`);
  }
  lines.push('');
  lines.push('P4 PATTERN                        count      rate');
  for (const p of PATTERNS) {
    lines.push(`  ${p}${' '.repeat(32 - p.length)}${String(counts.pattern[p]).padStart(6)}  ${pct(counts.pattern[p], pairs).padStart(8)}`);
  }
  lines.push('');
  lines.push('P1 x P4 OVERLAP (report only)     count      rate');
  const OVERLAP_ROWS = [
    ['controls', 'p1_controls + p4_*_controls_*'], ['controls_same_dir', '  of which same direction'],
    ['generates', 'p1_produces + p4_*_generates_*'], ['generates_same_dir', '  of which same direction'],
  ];
  for (const [k, label] of OVERLAP_ROWS) {
    lines.push(`  ${label}${' '.repeat(Math.max(1, 32 - label.length))}${String(counts.overlap[k]).padStart(6)}  ${pct(counts.overlap[k], pairs).padStart(8)}`);
  }
  lines.push('');
  lines.push('P3 SUPPLY (the cell a reader gets) count      rate');
  const P3_ROWS = [
    ['both', 'both give (p3_supplies)'], ['partner_only', 'only the partner (p3_supplies)'],
    ['reader_only', 'only the reader (p3_reader_gives)'], ['none', 'neither (p3_no_supply)'],
  ];
  for (const [k, label] of P3_ROWS) {
    lines.push(`  ${label}${' '.repeat(Math.max(1, 32 - label.length))}${String(counts.p3[k]).padStart(6)}  ${pct(counts.p3[k], pairs).padStart(8)}`);
  }
  return lines.join('\n');
}

function reportVariants({ variant, standalone, soleClause }, { charts, pairs, seed }) {
  const lines = [];
  lines.push(`charts=${charts} pairs=${pairs} seed=${seed}`);
  lines.push('');
  // Self-counting, so adding a variant cannot leave the heading saying "six".
  lines.push(`${VARIANT_IDS.length} RULE SETS, SAME SEED AND SAME ${pairs} PAIRS`);
  lines.push('');
  lines.push('        q1              q2              q3              q4          pull hi   fit hi   rule');
  for (const id of VARIANT_IDS) {
    const v = variant[id];
    const cell = (q) => `${String(v.quadrant[q]).padStart(5)} ${pct(v.quadrant[q], pairs).padStart(6)}`;
    lines.push(
      `  ${id}  ${cell('q1')}   ${cell('q2')}   ${cell('q3')}   ${cell('q4')}   `
      + `${pct(v.pullHigh, pairs).padStart(6)}   ${pct(v.fitHigh, pairs).padStart(6)}   ${VARIANTS[id].note}`,
    );
  }
  lines.push('');
  lines.push('STANDALONE FIRE RATES              count      rate');
  for (const [name, count] of Object.entries({ ...standalone, ...soleClause })) {
    lines.push(`  ${name}${' '.repeat(Math.max(1, 33 - name.length))}${String(count).padStart(6)}  ${pct(count, pairs).padStart(8)}`);
  }
  return lines.join('\n');
}

// ── selftest ──────────────────────────────────────────────
// Known answers: the quadrants the committed spec asserts by hand for six fixture
// pairs. This checks THIS script's pipeline against those, so a wiring mistake
// here (wrong module order, a swapped argument) fails against an outside answer
// rather than only against its own arithmetic.
// UPDATED 2026-09-08 FOR THE V6 AMENDMENT. Three of the six quadrants moved, and
// each move is the amendment reaching a known pair rather than a defect:
//   1 x 2   q1 -> q2   B's hour carries 害, which the extended 2.2.c now counts
//   1 x 3   q3 -> q4   A's year and hour carry 害 into B's day branch
//   12 x 6  q1 -> q2   B's hour carries 刑
// The other three are unchanged. **These values are NOT copied from a run of this
// script** - they are the ones tests/compat-pull-fit.spec.mjs asserts, each
// hand-derived there from the amended clauses, which is what keeps this an
// outside answer rather than the script checking itself.
const KNOWN = [
  [{ birthDate: '1989-09-13', birthTime: '09:00' }, { birthDate: '1990-03-04', birthTime: '14:00' }, 'q2'],
  [{ birthDate: '1990-03-04', birthTime: '14:00' }, { birthDate: '1989-03-03', birthTime: '00:15' }, 'q1'],
  [{ birthDate: '1989-09-13', birthTime: '09:00' }, { birthDate: '1990-06-07', birthTime: '12:00' }, 'q2'],
  [{ birthDate: '1989-09-13', birthTime: '09:00' }, { birthDate: '1992-04-20', birthTime: '08:00' }, 'q4'],
  [{ birthDate: '1990-03-04', birthTime: '14:00' }, { birthDate: '1992-01-05', birthTime: '08:00' }, 'q4'],
  [{ birthDate: '1990-06-07', birthTime: '12:00' }, { birthDate: '1989-03-03', birthTime: '00:15' }, 'q2'],
];

function selftest() {
  let failures = 0;
  for (const [ba, bb, expected] of KNOWN) {
    const { pullFit } = evaluate(calculateBaziChart(ba), calculateBaziChart(bb));
    const ok = pullFit.quadrant === expected;
    if (!ok) failures += 1;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${ba.birthDate} x ${bb.birthDate}  expected ${expected}, got ${pullFit.quadrant}`);
  }
  console.log(failures === 0
    ? `selftest: ${KNOWN.length}/${KNOWN.length} known quadrants reproduced`
    : `selftest: ${failures} of ${KNOWN.length} FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
}

if (process.argv.includes('--selftest')) {
  selftest();
} else {
  const opts = {
    charts: arg('charts', DEFAULTS.charts),
    pairs: arg('pairs', DEFAULTS.pairs),
    seed: arg('seed', DEFAULTS.seed),
  };
  const result = tally(opts);
  console.log(process.argv.includes('--variants')
    ? reportVariants(result, opts)
    : report(result, opts));
}
