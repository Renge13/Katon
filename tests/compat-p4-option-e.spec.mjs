// ============================================================
// tests/compat-p4-option-e.spec.mjs — P4 option E: contrasting split by directed step
// ============================================================
// Run: npm run test:compat-p4-option-e
//
// Prompt BD1 (Reyner ruled option E 2026-10-04). The rule is
// docs/product/compat-p4-p5-rules.md §1.1 as amended 2026-10-07: family position on the
// generating cycle from each person's OWN Day Master (companion 0, output 1, wealth 2,
// officer 3, resource 4), step d = (kB - kA) mod 5, A the reader.
//
// There is NO ORACLE FOR A PAIR CLAIM (Joey Yap's plotter is single-chart), so this
// asserts the ruled derivation against the engine's own five-element cycle, never a
// claim that a pair "really" has a direction.
//
// What each block guards:
//   - one fixture pair per new pattern, expectations HAND-READ from each chart's family
//     (listed below, not computed by the module), so swapping d=2 and d=3 goes red here;
//   - the position map against elementRelation's cycle, exhaustively, so the numbering
//     cannot drift from lib/semantic/facts.js;
//   - the swap property over a pair sample (the old symmetric claim is false on purpose);
//   - the four cells byte-identical to the rulings file, and every emitted pattern has one;
//   - matching and related pairs keep their pre-change cache key; a contrasting pair's
//     key moves.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { STEM_ELEMENTS } from '../lib/bazi/stems.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { elementRelation } from '../lib/semantic/facts.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { cacheKey } from '../lib/semantic/index.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import { compatTemperament, tenGodRelation, familyStep } from '../lib/compat/temperament.js';

const GLOSSARY = JSON.parse(readFileSync(new URL('../docs/content/glossary.json', import.meta.url), 'utf8'));
const K = GLOSSARY.kompatibilitas;
const RULINGS = readFileSync(
  new URL('../docs/content/compat-p4-option-e-rulings-2026-10-04.md', import.meta.url), 'utf8');

const fixture = (id) => {
  const tc = VALIDATION_CHARTS.find((c) => c.id === id);
  assert.ok(tc, `fixture chart ${id} exists`);
  return calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
};

// The fixture's main profiles, printed from mainProfile() 2026-10-07. The family is
// HAND-READ off the god's family character (財 wealth, 印 resource, 比劫 companion,
// 食傷 output, 官殺 officer), and the position is the ruled numbering:
//   chart  1  正財  wealth     2
//   chart  3  正印  resource   4
//   chart  4  正印  resource   4
//   chart  5  傷官  output     1
//   chart  6  偏財  wealth     2
//   chart 10  比肩  companion  0

test('d=1 -> a_generates_b (charts 5 x 1: output generates wealth)', () => {
  const out = compatTemperament(fixture(5), fixture(1));
  assert.equal(out.relation, 'different_group');
  assert.deepEqual([out.a.element_relation, out.b.element_relation], ['output', 'wealth']);
  assert.equal(out.pattern, 'a_generates_b'); // d = (2 - 1) mod 5 = 1
});

test('d=2 -> a_controls_b (charts 1 x 3: wealth controls resource)', () => {
  const out = compatTemperament(fixture(1), fixture(3));
  assert.equal(out.relation, 'different_group');
  assert.deepEqual([out.a.element_relation, out.b.element_relation], ['wealth', 'resource']);
  assert.equal(out.pattern, 'a_controls_b'); // d = (4 - 2) mod 5 = 2
});

test('d=3 -> b_controls_a (charts 6 x 10: companion controls wealth)', () => {
  const out = compatTemperament(fixture(6), fixture(10));
  assert.equal(out.relation, 'different_group');
  assert.deepEqual([out.a.element_relation, out.b.element_relation], ['wealth', 'companion']);
  assert.equal(out.pattern, 'b_controls_a'); // d = (0 - 2) mod 5 = 3
});

test('d=4 -> b_generates_a (charts 10 x 4: resource generates companion)', () => {
  const out = compatTemperament(fixture(10), fixture(4));
  assert.equal(out.relation, 'different_group');
  assert.deepEqual([out.a.element_relation, out.b.element_relation], ['companion', 'resource']);
  assert.equal(out.pattern, 'b_generates_a'); // d = (4 - 0) mod 5 = 4
});

test('matching and related are unchanged (charts 7 x 9, 1 x 6)', () => {
  assert.equal(compatTemperament(fixture(7), fixture(9)).pattern, 'matching');
  assert.equal(compatTemperament(fixture(1), fixture(6)).pattern, 'related');
});

test('the position map agrees with elementRelation\'s cycle, over all 100 stem pairs x 10 targets', () => {
  // Under ONE Day Master, two targets' families sit on the element cycle itself, so the
  // step between their families must be exactly the element relation between their
  // elements. elementRelation(x, y): drains = x generates y, is_controlled = x controls
  // y, controls = y controls x, feeds = y generates x (see temperament.js RELATION).
  const BY_STEP = ['same', 'drains', 'is_controlled', 'controls', 'feeds'];
  const STEMS = Object.keys(STEM_ELEMENTS);
  let checked = 0;
  for (const dm of STEMS) {
    const dmEl = STEM_ELEMENTS[dm];
    for (const t1 of STEMS) {
      for (const t2 of STEMS) {
        const e1 = STEM_ELEMENTS[t1];
        const e2 = STEM_ELEMENTS[t2];
        const d = familyStep(tenGodRelation(dmEl, e1), tenGodRelation(dmEl, e2));
        assert.equal(elementRelation(e1, e2), BY_STEP[d], `DM ${dm}: ${t1} -> ${t2} step ${d}`);
        checked += 1;
      }
    }
  }
  assert.equal(checked, 1000);
});

/** mulberry32, a seeded PRNG, so the sample is the same on every run. */
function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('swap property over a pair sample: directed patterns mirror, the rest stay', () => {
  const MIRROR = {
    matching: 'matching',
    related: 'related',
    a_generates_b: 'b_generates_a',
    b_generates_a: 'a_generates_b',
    a_controls_b: 'b_controls_a',
    b_controls_a: 'a_controls_b',
  };
  const rand = prng(20261007);
  const pad = (n) => String(n).padStart(2, '0');
  const charts = VALIDATION_CHARTS.map((tc) => fixture(tc.id));
  for (let i = 0; i < 60; i += 1) {
    const d = new Date(Date.UTC(1960, 0, 1) + Math.floor(rand() * 45 * 365.25) * 86400000);
    charts.push(calculateBaziChart({
      birthDate: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      birthTime: `${pad(Math.floor(rand() * 24))}:${pad(Math.floor(rand() * 60))}`,
    }));
  }

  const seen = new Set();
  for (const x of charts) {
    for (const y of charts) {
      const out = compatTemperament(x, y);
      const swapped = compatTemperament(y, x);
      assert.ok(out.pattern in MIRROR, `unknown pattern ${out.pattern}`);
      assert.equal(swapped.pattern, MIRROR[out.pattern]);
      assert.equal(swapped.relation, out.relation);
      assert.deepEqual(swapped.a, out.b);
      assert.deepEqual(swapped.b, out.a);
      seen.add(out.pattern);
    }
  }
  // The sample must reach every pattern, or the mirror table above was never exercised.
  assert.deepEqual([...seen].sort(), Object.keys(MIRROR).sort());
});

/** The rulings file's cell table, parsed: key -> { name_id, ... }. */
function ruledCells() {
  const FIELDS = ['name_id', 'name_en', 'label_meaning', 'meaning_seed', 'daily_seed'];
  const cells = {};
  for (const line of RULINGS.split(/\r?\n/)) {
    const cols = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cols.length !== 6 || !/^`p4_[a-z_]+`$/.test(cols[0])) continue;
    cells[cols[0].slice(1, -1)] = Object.fromEntries(FIELDS.map((f, i) => [f, cols[i + 1]]));
  }
  return cells;
}

const DIRECTED = {
  p4_a_generates_b: 1, p4_a_controls_b: 2, p4_b_controls_a: 3, p4_b_generates_a: 4,
};

test('the four cells are in the glossary, byte-identical to the rulings file', () => {
  const ruled = ruledCells();
  assert.deepEqual(Object.keys(ruled).sort(), Object.keys(DIRECTED).sort(), 'the rulings table has the four keys');
  for (const [key, fields] of Object.entries(ruled)) {
    assert.ok(K[key], `glossary has kompatibilitas.${key}`);
    for (const [field, value] of Object.entries(fields)) {
      assert.ok(value.length > 0, `${key}.${field} is not empty in the rulings`);
      assert.equal(K[key][field], value, `${key}.${field} is byte-identical`);
    }
    assert.match(K[key]._note, new RegExp(`\\bd = ${DIRECTED[key]}\\b`), `${key}._note gives its d`);
    assert.ok(K[key]._note.includes('A is the reader (kamu), B the partner (ia)'), `${key}._note names A and B`);
  }
});

test('every pattern the engine emits has a named cell, and contrasting is never emitted', () => {
  const ids = [1, 3, 4, 5, 6, 7, 9, 10, 12, 13];
  const emitted = new Set();
  for (const x of ids) for (const y of ids) emitted.add(compatTemperament(fixture(x), fixture(y)).pattern);
  assert.equal(emitted.has('contrasting'), false);
  for (const p of emitted) assert.ok(K[`p4_${p}`]?.name_id, `p4_${p} has a name_id`);
});

// ── THE CACHE KEY. ENGINE_VERSION IS NOT BUMPED. ─────────────
// cacheKey hashes the whole semantic JSON (lib/semantic/index.js cacheKey), so only a
// pair whose P4 cell changed may move. These three keys were printed on main @ 17406a7,
// before this change, with exactly this construction. A legitimate later change to
// these pairs' cells, to the pair semantic shape or to ENGINE_VERSION moves them too:
// re-pin with that reason in the commit, never to make this pass.
const INPUTS = { voice: 'v2', status: 'Pacaran', nicknames: { a: 'Rani', b: 'Dimas' } };
const keyOf = (x, y) => cacheKey(buildPairSemantic(fixture(x), fixture(y), INPUTS));

test('matching and related pairs keep their pre-change cache key', () => {
  assert.equal(keyOf(7, 9), 'ef3b5a948bdc546605c669c1f97c614d15880f266b1d590dc34322547a65d11c', 'matching 7x9');
  assert.equal(keyOf(1, 6), 'b18e3c61f7b215849dd1c5532a07069ee71c4491d1b8a5e142d7298e306d4c4d', 'related 1x6');
});

test('a formerly contrasting pair misses the old cache (the instrument can see a change)', () => {
  assert.notEqual(keyOf(1, 3), '74c35725d2bfc21fcaf52afb6e0d78bc34781af02eab53d27c5974ec713dda0d', 'contrasting 1x3 on main');
});
