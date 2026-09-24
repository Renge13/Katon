// ============================================================
// tests/voice-engine.spec.mjs — engine E1-E2, v2 only (spec §5)
// ============================================================
// Run: npm run test:voice-engine
//
//   E1  `actionable` leaves `must_cover` (actionables stay in the JSON as material
//       the writer MAY use).
//   E2  the pair payload carries BOTH people's mirror facts, by reusing
//       `buildSemanticJson` for A and B - "without this, act 1 and act 2 are
//       impossible".
// Both are v2 ONLY: v1's payload is pinned byte-identical in voice-cache.spec.mjs,
// and each assertion below checks v1 still has the old shape, so it fails both ways.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });
const mustCovers = (sj) => sj.required_points.flatMap((p) => p.must_cover);

test('E1: v2 required points never ask for `actionable`; v1 still does', () => {
  const v1 = buildSemanticJson(A, { voice: 'v1' });
  const v2 = buildSemanticJson(A, { voice: 'v2' });
  assert.ok(mustCovers(v1).includes('actionable'), 'precondition: v1 requires actionables on this chart');
  assert.equal(mustCovers(v2).includes('actionable'), false, 'v2 must_cover carries no actionable');
  // The actionables stay in the JSON as material.
  const withActionable = (sj) => sj.facts.filter((f) => f.actionable).length;
  assert.equal(withActionable(v2), withActionable(v1));
  assert.ok(withActionable(v2) > 0);
  // And nothing else in must_cover moved.
  assert.deepEqual(mustCovers(v2), mustCovers(v1).filter((m) => m !== 'actionable'));
});

test('E2: the v2 pair payload carries both people\'s mirror facts; v1 carries none', () => {
  const v1 = buildPairSemantic(A, B, { voice: 'v1' });
  const v2 = buildPairSemantic(A, B, { voice: 'v2' });
  assert.equal('mirror' in v1, false, 'v1 pair payload unchanged');
  for (const [side, chart] of [['a', A], ['b', B]]) {
    const own = buildSemanticJson(chart, { voice: 'v2' });
    assert.deepEqual(v2.mirror[side].facts, own.facts, `mirror.${side}.facts is buildSemanticJson(${side}).facts`);
  }
  // The partner's portrait facts are now reachable: his Mata Pisau (羊刃) lives
  // only in HIS mirror JSON (worksheet §2.5).
  assert.ok(v2.mirror.b.facts.some((f) => f.id === 'badge_羊刃'), 'B\'s Mata Pisau is in the payload');
  assert.equal(JSON.stringify(v1).includes('badge_羊刃'), false, 'and was not before');
});
