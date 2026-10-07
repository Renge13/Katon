// ============================================================
// tests/compat-direction.spec.mjs — P1 and P4 carry their direction, by name
// ============================================================
// Run: npm run test:compat-direction
//
// Prompt BI PR 2 (Cowork's technical ruling, 2026-10-07). Reyner's paid reading
// FpzdJClI11-giquyEpZBA carries p1_produces A -> B and p4_b_generates_a B -> A, and the
// writer reversed P4 in the same chapter: it had to map `a`/`b` and the cell's "kamu"/"ia"
// to nicknames itself, twice, in opposite directions. The fix is in the JSON, not a gate
// (CHECK 3): every directed P1 and P4 fact carries `direction: { from, to }`, the giver's
// and the receiver's names, built by the engine with the reading's own naming rule
// (nickname, else English archetype title; lib/semantic/pair.js namedSupply).
//
// Over the BD1 harness sample (scripts/compat-base-rates.mjs drawSample, the 5000 pairs
// of seed 20260907), v2 only, like the named supply: v1's prompt was not measured with it.
// The expected names are derived here from the `cycle` / `pattern` prefix (a_ = A gives),
// independently of the module's own mapping.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';
import { drawSample } from '../scripts/compat-base-rates.mjs';

const NICK = { a: 'Rani', b: 'Dimas' };
const INPUTS = { voice: 'v2', status: 'Pacaran', nicknames: NICK };
const { built, pairIdx } = drawSample({ charts: 2000, pairs: 5000, seed: 20260907 });

const factOf = (sj, id) => sj.facts.find((f) => f.id === id);

/** The giver's side from an id like `a_produces_b` / `b_generates_a`, else null. */
const giverOf = (id) => (/^a_/u.test(id) ? 'a' : /^b_/u.test(id) ? 'b' : null);
const other = (side) => (side === 'a' ? 'b' : 'a');

function expectedDirection(id, names) {
  const g = giverOf(id);
  return g ? { from: names[g], to: names[other(g)] } : undefined;
}

test('every directed P1 and P4 fact carries direction by name; undirected ones carry none', () => {
  const seen = { p1: 0, p4: 0, p1_none: 0, p4_none: 0 };
  for (const [i, j] of pairIdx) {
    const sj = buildPairSemantic(built[i].chart, built[j].chart, INPUTS);
    const p1 = factOf(sj, 'p1_stem_relation').provenance;
    const p4 = factOf(sj, 'p4_temperament').provenance;

    // P1: a 天干五合 pair is p1_combination whatever its cycle, and has no direction.
    const p1Want = p1.variant === 'p1_combination' ? undefined : expectedDirection(p1.cycle, NICK);
    assert.deepEqual(p1.direction, p1Want, `P1 ${p1.variant} ${p1.cycle}`);
    if (p1Want) seen.p1 += 1; else seen.p1_none += 1;

    const p4Want = expectedDirection(p4.pattern, NICK);
    assert.deepEqual(p4.direction, p4Want, `P4 ${p4.pattern}`);
    if (p4Want) seen.p4 += 1; else seen.p4_none += 1;
  }
  // The sample reached both branches of both facts, or one assertion above never ran.
  for (const [k, n] of Object.entries(seen)) assert.ok(n > 100, `${k} reached only ${n} times`);
});

test('swapping A and B keeps the same giver: direction follows the PERSON, not the side', () => {
  let directed = 0;
  for (const [i, j] of pairIdx.slice(0, 1000)) {
    const ab = buildPairSemantic(built[i].chart, built[j].chart, INPUTS);
    const ba = buildPairSemantic(built[j].chart, built[i].chart, { ...INPUTS, nicknames: { a: NICK.b, b: NICK.a } });
    for (const id of ['p1_stem_relation', 'p4_temperament']) {
      assert.deepEqual(factOf(ba, id).provenance.direction, factOf(ab, id).provenance.direction, `${id} swapped`);
      if (factOf(ab, id).provenance.direction) directed += 1;
    }
  }
  // Not vacuous: two missing directions are equal, so the swap must be seen on real ones.
  assert.ok(directed > 500, `only ${directed} directed facts were swapped`);
});

test('with no nicknames, the names are the English archetype titles (the reading\'s own fallback)', () => {
  let checked = 0;
  for (const [i, j] of pairIdx.slice(0, 500)) {
    const sj = buildPairSemantic(built[i].chart, built[j].chart, { voice: 'v2', status: 'Menikah', nicknames: {} });
    const names = { a: sj.core.a.archetype_name_en, b: sj.core.b.archetype_name_en };
    const p4 = factOf(sj, 'p4_temperament').provenance;
    assert.deepEqual(p4.direction, expectedDirection(p4.pattern, names));
    if (p4.direction) checked += 1;
  }
  assert.ok(checked > 100, `the fallback was exercised ${checked} times`);
});

test('Reyner\'s pair, the defect\'s own inputs: Rey gives on P1, Eta gives on P4', () => {
  // FpzdJClI11-giquyEpZBA: A male 1989-09-13, B female 1997-09-14, no hours.
  const a = calculateBaziChart({ birthDate: '1989-09-13', birthTime: null, gender: 'male' });
  const b = calculateBaziChart({ birthDate: '1997-09-14', birthTime: null, gender: 'female' });
  const sj = buildPairSemantic(a, b, { voice: 'v2', status: 'Pacaran', nicknames: { a: 'Rey', b: 'Eta' } });
  const p1 = factOf(sj, 'p1_stem_relation').provenance;
  const p4 = factOf(sj, 'p4_temperament').provenance;
  assert.equal(p1.cycle, 'a_produces_b', 'precondition: Rey\'s Fire produces Eta\'s Earth');
  assert.equal(p4.pattern, 'b_generates_a', 'precondition: Eta sparks Rey');
  assert.deepEqual(p1.direction, { from: 'Rey', to: 'Eta' });
  assert.deepEqual(p4.direction, { from: 'Eta', to: 'Rey' });
});

test('v1 carries no direction, and the mirror keeps its cache keys', () => {
  const [i, j] = pairIdx[0];
  const v1 = buildPairSemantic(built[i].chart, built[j].chart, { voice: 'v1', status: 'Pacaran', nicknames: NICK });
  for (const f of v1.facts) assert.equal('direction' in (f.provenance || {}), false, `v1 ${f.id}`);
  // Printed on main @ d777f89 before this change; ENGINE_VERSION is not bumped.
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  assert.equal(cacheKey(buildSemanticJson(chart, { voice: 'v2' })), '61a2eafdb11654406781f01f47a2799b18e44275a46eaeb23866b1f718df85f2');
  assert.equal(cacheKey(buildSemanticJson(chart, { voice: 'v1' })), 'd8d3ffaa08954236ecb222a1c3f8b5fa834c776e2fb657cdf69eddb5016dba29');
});
