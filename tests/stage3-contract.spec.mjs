// ============================================================
// Stage 3 Phase 3 — the JSON contract and the cache key
// ============================================================
// BYTE-IDENTITY IS A CORRECTNESS REQUIREMENT, NOT A NICETY. Stage 4 keys the
// result cache on hash(semantic JSON + engine version). Two runs of the same
// chart that differ by one reordered key or one float that rounds differently
// miss the cache, pay for a second LLM call, and produce a SECOND, DIFFERENT
// READING OF THE SAME BIRTHDATE. The whole deterministic-after-first-generation
// guarantee is exactly this assertion.
//
// Run: npm run test:stage3-contract
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import {
  buildSemanticJson, cacheKey, canonicalize, ENGINE_VERSION, SAFETY_FLAGS, CONTRACT_PARAMS,
} from '../lib/semantic/index.js';
import { ELEMENT_NAMES_ID } from '../lib/semantic/glossary.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import PROVECELL from '../docs/content/provecell-01-USER.json' with { type: 'json' };

const chartFor = (tc) => calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
const jsonFor = (tc) => buildSemanticJson(chartFor(tc));

test('the same chart twice is byte-identical, and so is its cache key', () => {
  for (const tc of VALIDATION_CHARTS) {
    const a = buildSemanticJson(chartFor(tc));
    const b = buildSemanticJson(chartFor(tc));
    assert.equal(JSON.stringify(a), JSON.stringify(b), `chart ${tc.id} is not byte-identical`);
    assert.equal(cacheKey(a), cacheKey(b), `chart ${tc.id} cache key drifted`);
  }
});

test('the cache key survives key reordering but not a version bump', () => {
  const json = jsonFor(VALIDATION_CHARTS[0]);

  // Same content, keys shuffled at the top level. The hash is taken over a
  // canonical form, so a future refactor that reorders a field cannot silently
  // invalidate every cached reading in the table.
  const shuffled = Object.fromEntries(Object.entries(json).reverse());
  assert.equal(cacheKey(shuffled), cacheKey(json));

  // Bumping the version invalidates everything, in one move.
  assert.notEqual(cacheKey({ ...json, engine_version: '9.9.9-test' }), cacheKey(json));

  // Arrays keep their order — `facts` is RANKED, and that ranking is meaning.
  const reordered = { ...json, facts: [...json.facts].reverse() };
  assert.notEqual(cacheKey(reordered), cacheKey(json), 'fact order must affect the key');
});

test('every cache key across the fixture is distinct', () => {
  const keys = VALIDATION_CHARTS.map((tc) => cacheKey(jsonFor(tc)));
  assert.equal(new Set(keys).size, keys.length, 'two charts collided');
  for (const key of keys) assert.match(key, /^[0-9a-f]{64}$/);
});

test('canonicalize sorts object keys and leaves arrays alone', () => {
  const got = canonicalize({ b: 1, a: [{ z: 1, y: 2 }, 3] });
  assert.equal(JSON.stringify(got), '{"a":[{"y":2,"z":1},3],"b":1}');
});

test('the contract carries every top-level field the target file defines', () => {
  const json = jsonFor(VALIDATION_CHARTS[0]);
  for (const field of Object.keys(PROVECELL)) {
    assert.ok(field in json, `the contract lost ${field}`);
  }
  // Deleted deliberately per D2a §4: there are three verdicts and `lean` is not
  // one of them; softening is the renderer's job, learned from confidence.
  assert.ok(!('provisional' in json.strength), '`provisional` must not come back');
  assert.ok(['weak', 'balanced', 'strong'].includes(json.strength.verdict));
});

test('chart 1 reproduces the target file field for field, where the two can agree', () => {
  const json = jsonFor(VALIDATION_CHARTS[0]);

  assert.equal(json.target_language, PROVECELL.target_language);
  assert.equal(json.hour_known, PROVECELL.hour_known);
  assert.equal(json.quiet_chart, PROVECELL.quiet_chart);
  assert.equal(json.boundary_flag, PROVECELL.boundary_flag);

  for (const field of ['day_master', 'element', 'archetype_key', 'main_profile',
    'main_profile_display', 'main_profile_bracket']) {
    assert.equal(json.core[field], PROVECELL.core[field], `core.${field}`);
  }

  // The target file was CORRECTED to weak/confidence_reasons in this commit.
  assert.equal(json.strength.verdict, PROVECELL.strength.verdict);
  assert.deepEqual(json.strength.favorable, PROVECELL.strength.favorable);
  assert.deepEqual(json.strength.unfavorable, PROVECELL.strength.unfavorable);
  assert.deepEqual(json.strength.confidence_reasons, PROVECELL.strength.confidence_reasons);

  for (const field of ['year', 'month', 'day', 'hour']) {
    assert.equal(json.chart[field], PROVECELL.chart[field], `chart.${field}`);
    assert.equal(json.chart.animals[field], PROVECELL.chart.animals[field], `animals.${field}`);
    assert.equal(json.chart.palaces[field], PROVECELL.chart.palaces[field], `palaces.${field}`);
  }
  assert.equal(json.chart.missing_element, PROVECELL.chart.missing_element);
  assert.equal(json.chart.element_presence_note, PROVECELL.chart.element_presence_note);
  for (const [element, pct] of Object.entries(PROVECELL.chart.element_presence)) {
    assert.equal(json.chart.element_presence[element], pct, `element_presence.${element}`);
  }
  assert.deepEqual(json.safety_flags, PROVECELL.safety_flags);
});

test('collapse removes the duplicate paragraph, and records what it removed', () => {
  const json = jsonFor(VALIDATION_CHARTS[0]);
  const ids = json.facts.map((f) => f.id);

  // main_profile is absorbed by the CR-1 tension (same glossary entry, same four
  // strings) and the bare 空亡 badge by the void stack that contains it.
  assert.ok(!ids.includes('main_profile'), 'main_profile survived CR-1');
  assert.ok(!ids.includes('badge_空亡'), 'the bare void badge survived its stack');
  assert.ok(ids.includes('profile_vs_favorable') && ids.includes('void_stack_month'));

  // In ranked order, since the collapse runs after scoring.
  assert.deepEqual(json.qa.facts_collapsed, [
    { id: 'badge_空亡', absorbed_by: 'void_stack' },
    { id: 'main_profile', absorbed_by: 'profile_vs_favorable' },
  ]);
  assert.equal(json.qa.facts_emitted, 16);
  assert.equal(json.facts.length, 14);
});

test('a void badge with no stack over it survives', () => {
  // Charts 5, 6 and 13 carry 空亡 with no stack. Collapsing it there would delete
  // a real finding.
  for (const id of [5, 6, 13]) {
    const tc = VALIDATION_CHARTS.find((c) => c.id === id);
    const ids = jsonFor(tc).facts.map((f) => f.id);
    assert.ok(ids.includes('badge_空亡'), `chart ${id} lost its void badge`);
  }
});

test('main_profile survives on every chart CR-1 did not fire on', () => {
  for (const tc of VALIDATION_CHARTS) {
    const ids = jsonFor(tc).facts.map((f) => f.id);
    const hasCr1 = ids.includes('profile_vs_favorable');
    assert.equal(ids.includes('main_profile'), !hasCr1, `chart ${tc.id}`);
  }
});

test('every required point has a backing fact that is actually emitted', () => {
  // D2: a required point with no fact forces the renderer to author, which is
  // the exact failure that produced an entirely invented inti_diri in run 1.
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    const emitted = new Map(json.facts.map((f) => [f.id, f]));
    assert.ok(json.required_points.length > 0, `chart ${tc.id} has no required points`);
    for (const point of json.required_points) {
      const fact = emitted.get(point.fact_id);
      assert.ok(fact, `chart ${tc.id}: required point ${point.fact_id} has no fact`);
      assert.equal(point.importance, fact.importance, `chart ${tc.id}: ${point.fact_id}`);
      // must_cover can only ask for content the fact actually carries.
      for (const field of point.must_cover) {
        assert.ok(fact[field], `chart ${tc.id}: ${point.fact_id} must_cover ${field} is empty`);
      }
    }
  }
});

test('required points cover the spine and the top findings, chart 1', () => {
  const json = jsonFor(VALIDATION_CHARTS[0]);
  assert.deepEqual(json.required_points.map((p) => p.fact_id), [
    'void_stack_month', 'profile_vs_favorable', 'strength_weak', 'element_missing_Wood',
    'aspek_convergence_正官', 'spouse_palace', 'relation_半合_巳酉', 'badge_桃花', 'day_master_Fire',
  ]);
  // The hand-written file lists 8. The ninth here is day_master_Fire, which the
  // target carries as its FIRST required point ("Inti diri: Api...") — so the
  // two agree on coverage and differ only in what counts as a point.
  assert.equal(PROVECELL.required_points.length, 8);
});

test('no fact reaches the renderer without a label_meaning', () => {
  // A fact with no meaning is a name the reader cannot cash out. The strength
  // verdict was the one hole; glossary.kekuatan closed it (3b5685e, 2026-08-02)
  // and there is no exemption left. Anything appearing here is new content
  // Reyner has to write.
  const gaps = new Set();
  for (const tc of VALIDATION_CHARTS) {
    for (const f of jsonFor(tc).facts) if (!f.label_meaning) gaps.add(f.id);
  }
  assert.deepEqual([...gaps].sort(), []);
});

test('no English element name leaks into the contract blocks', () => {
  // D2a §5. Scoped to the blocks Stage 3 composes; facts[] carries the
  // glossary's own name_en brackets by design (rule 23's EN display layer).
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    for (const name of [...json.strength.favorable, ...json.strength.unfavorable,
      json.core.element, ...Object.keys(json.chart.element_presence)]) {
      assert.ok(ELEMENT_NAMES_ID.includes(name), `chart ${tc.id}: "${name}" is not Indonesian`);
    }
    if (json.chart.missing_element) {
      assert.ok(ELEMENT_NAMES_ID.includes(json.chart.missing_element), `chart ${tc.id}`);
    }
  }
});

test('the version and the unfitted contract constants are stated', () => {
  // 0.4.1 as of 2026-08-04: branch_relation and punishment provenance gained
  // `positions_id`, the pre-verbalised span. A new field in the contract, so the
  // version moves and the whole cache invalidates - which is correct, every cached
  // reading predates the field.
  assert.equal(ENGINE_VERSION, '0.4.2-stage3');
  assert.deepEqual(SAFETY_FLAGS, ['no_fatalism', 'no_medical', 'no_financial', 'no_god_ranking']);
  assert.deepEqual(CONTRACT_PARAMS, { coverageFloor: 65 });
});
