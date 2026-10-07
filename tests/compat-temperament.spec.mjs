// ============================================================
// tests/compat-temperament.spec.mjs
// ============================================================
// P4, ruled by Reyner 2026-09-07 (evening). The rule is
// docs/product/compat-p4-p5-rules.md section 1; this spec quotes the clauses it
// asserts. There is NO ORACLE FOR A PAIR CLAIM (Joey Yap's plotter is
// single-chart, probed 2026-08-12), so nothing here claims a pair "really" has a
// temperament. It asserts internal consistency against the engine's own tables.
//
// ── THERE IS NO FAMILY TABLE, AND THIS SPEC IS WHAT PROVES IT ──
// Rule doc 1.3: "The five groups are not a new table: a Ten God is
// element-relation x polarity, so `same_group` is 'same element relation,
// polarity ignored', derived from `lib/bazi/tenGods.js` (read-only)."
//
// `tenGods.js` names the five relations ONLY IN COMMENTS (lines 8-12) and exports
// no relation field - `tenGod()` returns { hanzi, label, stem, element, polarity }
// and its GENERATES/CONTROLS tables are module-private. So prompt X-a's stated
// fallback applies: derive the relation from the god's element versus the Day
// Master's element with `elementRelation` (lib/semantic/facts.js:675), the same
// function commit 4 of prompt W named.
//
// THE 2:1 ASSERTION IS THE GUARD THAT MAKES THAT SAFE, and it is exhaustive over
// all 100 Day-Master-x-target stem pairs. It pins three things at once:
//   1. every one of the ten gods maps to exactly ONE relation,
//   2. every relation is reached by exactly TWO gods,
//   3. the grouping produced via facts.js's GENERATES/CONTROLS is identical to
//      the one tenGods.js's own private tables produce - which is the only
//      available guard on a duplicated table that rule 7 forbids touching.
// A hand-written hanzi -> family map would pass 1 and 2 and could still disagree
// with tenGods.js. Deriving it cannot.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { STEM_ELEMENTS } from '../lib/bazi/stems.js';
import { tenGod } from '../lib/bazi/tenGods.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { mainProfile } from '../lib/bazi/mainProfile.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import { compatTemperament, tenGodRelation } from '../lib/compat/temperament.js';

const STEMS = Object.keys(STEM_ELEMENTS);
const fixture = (id) => {
  const tc = VALIDATION_CHARTS.find((c) => c.id === id);
  assert.ok(tc, `fixture chart ${id} exists`);
  return calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
};

// The fixture's main profiles, printed from mainProfile() 2026-09-07. The group
// column is hand-read off the god's FAMILY CHARACTER against tenGods.js:8-12
// (財 -> wealth, 印 -> resource, 比劫 -> companion, 食傷 -> output, 官殺 -> officer),
// NOT computed by the module under test:
//   chart  1  DM 丙 Fire   正財 Metal  -> wealth      (財)
//   chart  3  DM 丙 Fire   正印 Wood   -> resource    (印)
//   chart  4  DM 癸 Water  正印 Metal  -> resource    (印)
//   chart  5  DM 丙 Fire   傷官 Earth  -> output      (食傷)
//   chart  6  DM 壬 Water  偏財 Fire   -> wealth      (財)
//   chart  7  DM 甲 Wood   正財 Earth  -> wealth      (財)
//   chart  9  DM 甲 Wood   正財 Earth  -> wealth      (財)
//   chart 10  DM 甲 Wood   比肩 Wood   -> companion   (比劫)

test('the fixture main profiles this spec depends on are still what they were', () => {
  // A GUARD ON THE COMMENT BLOCK ABOVE. Those gods are inputs; an input quoted in
  // a comment is a memory the moment mainProfile or the calculator moves. If it
  // does, this fails first and names the cause instead of the cases below failing
  // and looking like a defect in lib/compat/.
  const expected = {
    1: '正財', 3: '正印', 4: '正印', 5: '傷官', 6: '偏財', 7: '正財', 9: '正財', 10: '比肩',
  };
  for (const [id, god] of Object.entries(expected)) {
    assert.equal(mainProfile(fixture(Number(id)), { silent: true }).hanzi, god, `chart ${id}`);
  }
});

test('EXHAUSTIVE 2:1 — ten gods onto five relations, agreeing with tenGods.js', () => {
  const byGod = new Map();
  const byRelation = new Map();

  for (const dm of STEMS) {
    for (const target of STEMS) {
      const { hanzi } = tenGod(dm, target);
      const relation = tenGodRelation(STEM_ELEMENTS[dm], STEM_ELEMENTS[target]);

      // 1. One god, one relation. A god that ever resolves two ways means the
      //    derivation disagrees with tenGods.js's private tables.
      if (byGod.has(hanzi)) {
        assert.equal(byGod.get(hanzi), relation, `${hanzi} resolves consistently (DM ${dm}, ${target})`);
      }
      byGod.set(hanzi, relation);
      byRelation.set(relation, (byRelation.get(relation) ?? new Set()).add(hanzi));
    }
  }

  // 2. All ten gods appear, and exactly five relations.
  assert.equal(byGod.size, 10);
  assert.equal(byRelation.size, 5);
  assert.deepEqual(
    [...byRelation.keys()].sort(),
    ['companion', 'officer', 'output', 'resource', 'wealth'],
  );

  // 3. Two gods per relation - the 2:1 map - and they are the polarity pairs the
  //    rule doc's 1.1 table lists: 比肩/劫財, 食神/傷官, 正財/偏財, 正官/七殺, 正印/偏印.
  const groups = Object.fromEntries(
    [...byRelation].map(([relation, gods]) => [relation, [...gods].sort()]),
  );
  for (const [relation, gods] of Object.entries(groups)) {
    assert.equal(gods.length, 2, `${relation} is reached by exactly two gods`);
  }
  assert.deepEqual(groups, {
    companion: ['劫財', '比肩'].sort(),
    output: ['傷官', '食神'].sort(),
    wealth: ['偏財', '正財'].sort(),
    officer: ['七殺', '正官'].sort(),
    resource: ['偏印', '正印'].sort(),
  });
});

test('same_god -> matching (charts 7 x 9, both 正財)', () => {
  // Rule doc 1.1: "`same_god` | both `main_profile` identical | **matching**".
  // Two different people, same dominant Aspek: chart 7 is 甲 Wood with 正財 Earth,
  // chart 9 is also 甲 Wood with 正財 Earth. 財 is wealth (tenGods.js:10).
  const out = compatTemperament(fixture(7), fixture(9));
  assert.deepEqual(out, {
    kind: 'compat_temperament',
    a: { god: '正財', element_relation: 'wealth' },
    b: { god: '正財', element_relation: 'wealth' },
    relation: 'same_god',
    pattern: 'matching',
  });

  // And across DIFFERENT Day Masters, so it is the god that matches and not the
  // chart: chart 3 is 丙 Fire with 正印, chart 4 is 癸 Water with 正印. Each god is
  // relative to its OWN Day Master, per rule doc 1.1's "to the Day Master".
  const other = compatTemperament(fixture(3), fixture(4));
  assert.equal(other.relation, 'same_god');
  assert.equal(other.pattern, 'matching');
  assert.deepEqual(other.a, { god: '正印', element_relation: 'resource' });
  assert.deepEqual(other.b, { god: '正印', element_relation: 'resource' });
});

test('same_group -> related (charts 1 x 6, 正財 vs 偏財)', () => {
  // Rule doc 1.1: "`same_group` | different god, same element relation to the Day
  // Master (polarity differs): ... 正財/偏財 ... | **related**".
  // Chart 1 is 丙 Fire with 正財 Metal; chart 6 is 壬 Water with 偏財 Fire. Different
  // gods, different elements, different Day Masters - but both are 財, wealth.
  const out = compatTemperament(fixture(1), fixture(6));
  assert.deepEqual(out, {
    kind: 'compat_temperament',
    a: { god: '正財', element_relation: 'wealth' },
    b: { god: '偏財', element_relation: 'wealth' },
    relation: 'same_group',
    pattern: 'related',
  });
});

test('different_group -> a directed pattern (charts 1 x 3, wealth vs resource)', () => {
  // Rule doc 1.1 as amended 2026-10-07 (option E): `different_group` splits by the
  // directed step d = (kB - kA) mod 5. Both are 丙 Fire Day Masters, so this is the
  // case where the CHARTS are closest and the groups still differ: 正財 (財, wealth,
  // position 2) against 正印 (印, resource, position 4), d = 2. One pair per directed
  // pattern lives in tests/compat-p4-option-e.spec.mjs.
  const out = compatTemperament(fixture(1), fixture(3));
  assert.deepEqual(out, {
    kind: 'compat_temperament',
    a: { god: '正財', element_relation: 'wealth' },
    b: { god: '正印', element_relation: 'resource' },
    relation: 'different_group',
    pattern: 'a_controls_b',
  });

  // A second, further apart: chart 5 傷官 (食傷, output, 1) vs chart 10 比肩 (比劫,
  // companion, 0), d = (0 - 1) mod 5 = 4.
  const far = compatTemperament(fixture(5), fixture(10));
  assert.equal(far.relation, 'different_group');
  assert.equal(far.pattern, 'b_generates_a');
  assert.deepEqual(far.a, { god: '傷官', element_relation: 'output' });
  assert.deepEqual(far.b, { god: '比肩', element_relation: 'companion' });
});

test('pattern follows relation; swapping the people keeps relation and mirrors direction', () => {
  // Each pattern names exactly one relation, so the badge stays explainable from the
  // facts. Since option E (2026-10-07) the four directed patterns all name
  // `different_group`, and the ORDER of the two people matters on purpose: A is the
  // reader. The swap property over a wider sample is in tests/compat-p4-option-e.spec.mjs.
  const RELATION_OF = {
    matching: 'same_god',
    related: 'same_group',
    a_generates_b: 'different_group',
    a_controls_b: 'different_group',
    b_controls_a: 'different_group',
    b_generates_a: 'different_group',
  };
  const MIRROR = {
    matching: 'matching',
    related: 'related',
    a_generates_b: 'b_generates_a',
    b_generates_a: 'a_generates_b',
    a_controls_b: 'b_controls_a',
    b_controls_a: 'a_controls_b',
  };
  const ids = [1, 3, 4, 5, 6, 7, 9, 10];

  for (const x of ids) {
    for (const y of ids) {
      const out = compatTemperament(fixture(x), fixture(y));
      assert.equal(RELATION_OF[out.pattern], out.relation, `${x}x${y} pattern follows relation`);

      const swapped = compatTemperament(fixture(y), fixture(x));
      assert.equal(swapped.relation, out.relation, `${x}x${y} relation is symmetric`);
      assert.equal(swapped.pattern, MIRROR[out.pattern], `${x}x${y} direction mirrors`);
      assert.deepEqual(swapped.a, out.b);
      assert.deepEqual(swapped.b, out.a);
    }
  }
});

test('no family table, no glossary, no closed file written, no Indonesian string', () => {
  const source = readFileSync(new URL('../lib/compat/temperament.js', import.meta.url), 'utf8');
  const code = source.replace(/^\s*\/\/.*$/gmu, '').replace(/\/\*[\s\S]*?\*\//gu, '');

  // THE CENTRAL CONSTRAINT: no hanzi -> family map anywhere in the code. If a
  // family table existed it would have to name gods, so the presence of ANY god
  // hanzi in executable code is the tell. The five relation NAMES are allowed -
  // they are labels for elementRelation's outputs, not a table of gods.
  for (const god of ['比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '七殺', '正印', '偏印']) {
    assert.ok(!code.includes(god), `must not name the god ${god} in code`);
  }

  // Reuse, not reimplementation. No glossary import (prompt X-a: no glossary edit),
  // and the cycle comes from the function prompt W already named.
  const imports = [...source.matchAll(/^import .*?from '(.+?)';$/gmu)].map((m) => m[1]);
  assert.deepEqual(imports.sort(), ['../bazi/mainProfile.js', '../bazi/stems.js', '../semantic/facts.js']);
  assert.ok(!code.includes('glossary'), 'no glossary');
  assert.ok(!code.includes('GENERATES') && !code.includes('CONTROLS'), 'no second cycle table');

  // Facts only: no prose, no badge label, no Indonesian, no placeholder. The seven
  // unruled strings are the content layer's and must not leak in here.
  assert.ok(!code.includes('@@UNRULED'), 'no placeholder in lib/compat/');
  const allowed = new Set([
    'compat_temperament', 'same_god', 'same_group', 'different_group',
    'matching', 'related', 'a_generates_b', 'a_controls_b', 'b_controls_a', 'b_generates_a',
    'companion', 'output', 'wealth', 'officer', 'resource',
  ]);
  const godHanzi = /^[一-鿿]+$/u;
  for (const x of [1, 5, 6, 7]) {
    for (const y of [3, 9, 10]) {
      const walk = (node, path) => {
        if (typeof node === 'string') {
          assert.ok(
            allowed.has(node) || godHanzi.test(node),
            `${path} carries a non-fact string: ${JSON.stringify(node)}`,
          );
          return;
        }
        if (node && typeof node === 'object') {
          for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
        }
      };
      walk(compatTemperament(fixture(x), fixture(y)), `${x}x${y}`);
    }
  }
});
