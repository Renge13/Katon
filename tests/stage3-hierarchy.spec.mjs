// ============================================================
// Stage 3 Phase 2 — hierarchy scoring lock
// ============================================================
// Two of these assertions are load-bearing and D2 names both:
//
//   1. Bintang Penolong must NEVER rank top-3. It is present in 77% of charts,
//      so by construction it is neither extreme nor usually convergent. If it
//      leads on any fixture chart, the extremity term is wrong. Cheap to run,
//      and it catches a whole class of mis-weighting.
//   2. At least one chart must not be `quiet_chart`. A scoring pass that calls
//      every chart quiet is not conservative, it is broken.
//
// The rest guard determinism (the cache key is a hash of this output, so an
// unstable sort is a correctness bug, not an aesthetic one) and record where the
// engine's ranking sits against the hand-written target.
//
// Run: npm run test:stage3-hierarchy
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeBadges } from '../lib/bazi/badges.js';
import { buildFactInventory } from '../lib/semantic/facts.js';
import { scoreFacts, HIERARCHY_PARAMS } from '../lib/semantic/hierarchy.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import PROVECELL from '../docs/content/provecell-01-USER.json' with { type: 'json' };

const chartFor = (tc) => calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
const rankedFor = (tc) => scoreFacts(buildFactInventory(chartFor(tc)));

test('Bintang Penolong never ranks top-3 — on any chart', () => {
  for (const tc of VALIDATION_CHARTS) {
    const top3 = rankedFor(tc).facts.slice(0, 3).map((f) => f.id);
    assert.ok(!top3.includes('badge_天乙貴人'),
      `chart ${tc.id} headlined Bintang Penolong: ${top3.join(', ')}`);
  }
});

test('quiet_chart fires on NO fixture chart, and that is flagged for a ruling', () => {
  // RE-MEASURED 2026-08-11: was [5, 13], now []. Updated deliberately as a dated
  // observation; PROGRESS carries it and flags it.
  //
  // WHY IT MOVED: actionability became an engine declaration (facts.js#
  // ACTIONABLE_KINDS), so facts of a declared-actionable kind gained +10 whether
  // or not their prose had been written. Charts 5 and 13 had no fact at or above
  // `quietFloor` (70); the bonus pushed their top fact over it.
  //
  // THIS IS A BEHAVIOUR DISAPPEARING, NOT JUST A NUMBER, and it is why this test
  // is renamed rather than quietly edited. `quiet_chart` tells the renderer to
  // say less and not manufacture drama - "a quiet chart honestly read beats a
  // loud chart faked". At 0 of 13 that instruction now reaches nobody.
  //
  // It may be correct: those charts DO carry actionable conditions, and the old
  // score under-rated them only because nobody had written the seed yet. Or
  // `quietFloor` may need re-fitting against the new distribution, which is its
  // own change under rule 13 and must not ride with this one.
  const quiet = VALIDATION_CHARTS.filter((tc) => rankedFor(tc).quiet_chart).map((tc) => tc.id);
  assert.deepEqual(quiet, []);

  // The original assertion, kept: a pass that calls every chart quiet is broken.
  assert.ok(quiet.length < VALIDATION_CHARTS.length, 'not every chart may be quiet');
});

test('chart 1 top-3 is the same SET the hand-written target chose', () => {
  // D2: do not target the exact numbers, they were judgment calls. Target the
  // ordering, and the top 3 above all.
  const handTop3 = [...PROVECELL.facts]
    .sort((a, b) => b.importance - a.importance).slice(0, 3).map((f) => f.id).sort();
  assert.deepEqual(handTop3, ['profile_drains_self', 'strength_weak', 'void_month_stack']);

  const engineTop3 = rankedFor(VALIDATION_CHARTS[0]).facts.slice(0, 3).map((f) => f.id).sort();
  assert.deepEqual(engineTop3, ['profile_vs_favorable', 'strength_weak', 'void_stack_month']);
});

test('chart 1 rank correlation against the hand-written target', () => {
  // Spearman over the 11 facts the target file carries. NOT a gate on the exact
  // numbers — a record, so a future change that scrambles the ordering shows up
  // as a drop rather than as nothing.
  const MAPPING = {
    strength_weak: 'strength_weak',
    profile_drains_self: 'profile_vs_favorable',
    void_month_stack: 'void_stack_month',
    officer_convergence: 'aspek_convergence_正官',
    wood_missing: 'element_missing_Wood',
    peach_blossom: 'badge_桃花',
    nobleman: 'badge_天乙貴人',
    spouse_palace: 'spouse_palace',
    metal_half_trine: 'relation_半合_巳酉',
    steward_vs_selfreliant: 'aspek_convergence_比肩',
    day_master_fire: 'day_master_Fire',
  };

  const engineOrder = rankedFor(VALIDATION_CHARTS[0]).facts.map((f) => f.id);
  const handOrder = [...PROVECELL.facts].sort((a, b) => b.importance - a.importance);
  const mapped = handOrder.map((f) => MAPPING[f.id]);

  // Ranks within the mapped subset only, so the five engine-only facts do not
  // distort the comparison.
  const engineSubset = engineOrder.filter((id) => mapped.includes(id));
  let sumD2 = 0;
  mapped.forEach((id, handRank) => {
    const engineRank = engineSubset.indexOf(id);
    sumD2 += (handRank - engineRank) ** 2;
  });
  const n = mapped.length;
  const rho = 1 - (6 * sumD2) / (n * (n * n - 1));

  assert.equal(n, 11);
  // 0.81 -> 0.73, RE-MEASURED 2026-08-11 when actionability became an engine
  // declaration rather than an inference from `actionable_seed` (facts.js#
  // ACTIONABLE_KINDS). Updated deliberately as a dated observation, not
  // regenerated to pass; PROGRESS carries the same figure and the reason.
  //
  // WHY IT MOVED: three chart-1 facts gained the +10 they had never been able to
  // earn, because their kind is actionable but nobody had written their prose
  // yet - strength_weak 78 -> 88, relation_半合_巳酉 69 -> 79,
  // element_dominant_Water 31 -> 41. The hand-written target was scored on
  // 2026-08-02 against a glossary where those cells were empty, so it ranks them
  // where the OLD inference put them. The divergence is the target being stale
  // about authoring state, which is precisely the coupling this change removed.
  assert.equal(Math.round(rho * 100) / 100, 0.73);

  // The one large divergence, recorded because it is INTENDED, not a defect:
  // the target file ranks Bintang Penolong 7th of 11 while the engine puts it
  // last. The target's own note says never headline it and 77% is not
  // extremity; the engine simply applies that rule more consistently than the
  // hand-scored file did.
  assert.equal(engineSubset.indexOf('badge_天乙貴人'), 10);
});

test('convergence dominates a single extreme value', () => {
  // D2: "An Aspek appearing three times, or a void branch carrying three things,
  // outranks any single extreme value." Chart 1 is the case: a three-thing void
  // stack against a missing element, which is maximum extremity.
  const byId = Object.fromEntries(rankedFor(VALIDATION_CHARTS[0]).facts.map((f) => [f.id, f]));
  assert.equal(byId.element_missing_Wood.hierarchy.extremity, 100, 'maximum extremity');
  assert.ok(byId.void_stack_month.importance > byId.element_missing_Wood.importance,
    'a three-thing stack must outrank a maximum-extremity single fact');
});

test('presence, not position count, separates a real convergence from a residual', () => {
  // The Phase 1 finding, now enforced. Chart 1 converges 正官 on three full 癸
  // and 食神 on two hidden 戊 at qi weight 0.1. Both clear the position gate.
  const byId = Object.fromEntries(rankedFor(VALIDATION_CHARTS[0]).facts.map((f) => [f.id, f]));
  const officer = byId.aspek_convergence_正官.hierarchy.convergence;
  const residual = byId.aspek_convergence_食神.hierarchy.convergence;
  assert.equal(officer, 100);
  assert.ok(residual < 15, `a 0.2-presence convergence scored ${residual}`);
});

test('scoring is deterministic and does not mutate the inventory', () => {
  for (const tc of VALIDATION_CHARTS) {
    const inventory = buildFactInventory(chartFor(tc));
    const before = JSON.stringify(inventory);
    const a = JSON.stringify(scoreFacts(inventory));
    const b = JSON.stringify(scoreFacts(buildFactInventory(chartFor(tc))));
    assert.equal(a, b, `chart ${tc.id} is not deterministic`);
    assert.equal(JSON.stringify(inventory), before, `chart ${tc.id}: the inventory was mutated`);
  }
});

test('every score is a clamped integer, sorted descending, with its axes exposed', () => {
  for (const tc of VALIDATION_CHARTS) {
    const { facts } = rankedFor(tc);
    let previous = Infinity;
    for (const f of facts) {
      assert.ok(Number.isInteger(f.importance), `chart ${tc.id}: ${f.id} importance`);
      assert.ok(f.importance >= 0 && f.importance <= 100, `chart ${tc.id}: ${f.id} out of range`);
      assert.ok(f.importance <= previous, `chart ${tc.id}: ${f.id} is out of order`);
      previous = f.importance;
      // Inspectable, exactly as computeStrength exposes its four factors.
      for (const axis of ['role', 'extremity', 'convergence', 'tension', 'actionability']) {
        assert.ok(axis in f.hierarchy, `chart ${tc.id}: ${f.id} is missing ${axis}`);
      }
    }
  }
});

test('the measured frequencies in HIERARCHY_PARAMS match the fixture', () => {
  // The extremity term reads these. A stale figure silently mis-scores every
  // badge that carries it, which is exactly what D2a §2 caught once already.
  const counts = {};
  for (const tc of VALIDATION_CHARTS) {
    for (const badge of computeBadges(chartFor(tc))) counts[badge.key] = (counts[badge.key] ?? 0) + 1;
  }
  const n = VALIDATION_CHARTS.length;
  for (const [key, frequency] of Object.entries(HIERARCHY_PARAMS.badgeFrequency)) {
    assert.equal(frequency, (counts[key] ?? 0) / n, `${key} frequency is stale`);
  }

  const relations = {};
  for (const tc of VALIDATION_CHARTS) {
    const seen = new Set();
    for (const f of buildFactInventory(chartFor(tc))) {
      const type = f.provenance.relation ?? (f.provenance.kind === 'punishment' ? '刑' : null);
      if (type) seen.add(type);
    }
    for (const type of seen) relations[type] = (relations[type] ?? 0) + 1;
  }
  for (const [type, frequency] of Object.entries(HIERARCHY_PARAMS.relationFrequency)) {
    assert.equal(frequency, (relations[type] ?? 0) / n, `${type} frequency is stale`);
  }
});

test('nothing was fitted — the params are the reasoned defaults', () => {
  // Rule 13: scoring logic and its constants do not land in the same commit. If
  // this test is edited, the edit IS the calibration and needs its own
  // measurement and its own commit.
  assert.deepEqual(HIERARCHY_PARAMS.base, { spine: 55, finding: 25 });
  assert.deepEqual(HIERARCHY_PARAMS.weight, {
    convergence: 45, extremity: 35, tension: 30, actionability: 10,
  });
  assert.equal(HIERARCHY_PARAMS.quietFloor, 70);
  assert.ok(HIERARCHY_PARAMS.weight.convergence > HIERARCHY_PARAMS.weight.extremity,
    'D2: convergence is the strongest signal and should dominate');
});
