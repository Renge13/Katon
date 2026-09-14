// ============================================================
// tests/pair-semantic.spec.mjs — the pair's semantic JSON
// ============================================================
// THE CONTRACT IS THE MIRROR'S, and that is the thing this file asserts. If the
// pair's output satisfied a slightly different contract, `renderReading`,
// `validateRendering`, `assembleFallback` and `persistRendered` would each need
// to know which kind they were handed - and the point of prompt X-b2 is that
// none of them does.
//
// So the assertions are mostly structural comparisons against a real mirror
// semantic JSON built in the same test, rather than a hand-written list of field
// names that could drift from what the mirror actually emits.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic, variantKeysFor } from '../lib/semantic/pair.js';
import { GLOSSARY, fillPairTemplate } from '../lib/semantic/glossary.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRendering } from '../lib/validate/index.js';
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chart = (id) => {
  const tc = ALL.find((c) => c.id === id);
  assert.ok(tc, `fixture chart ${id} exists`);
  return calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
};
const pair = (x, y) => buildPairSemantic(chart(x), chart(y));

// Quadrant coverage under the V6 rule (run 3, 2026-09-08), hand-derived in
// tests/compat-pull-fit.spec.mjs: q1 = 2 x 6, q2 = 1 x 12, q3 = 3 x 7, q4 = 1 x 3.
const BY_QUADRANT = { q1: [2, 6], q2: [1, 12], q3: [3, 7], q4: [1, 3] };

// The construction tests/stage6-validation.spec.mjs uses for a passing penutup.
const PENUTUP = 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.';

test('kind is present on BOTH builders, and they differ', () => {
  // The one field every consumer branches on. Without it the two cache-key
  // spaces could collide and `renderOnce` would have nothing to select a prompt
  // by. Asserted on both because adding it to one is the failure mode.
  assert.equal(buildSemanticJson(chart(1)).kind, 'mirror');
  assert.equal(pair(1, 2).kind, 'pair');
});

test('THE CONTRACT: the pair carries every field the pipeline reads', () => {
  const mirror = buildSemanticJson(chart(1));
  const p = pair(1, 2);

  // The fields `renderReading`, `validateRendering`, `assembleFallback` and
  // `computeCacheKey` actually consume. Compared against the MIRROR's own output
  // rather than a hand-written list, so this cannot drift from reality.
  for (const field of ['kind', 'engine_version', 'target_language', 'core', 'facts', 'required_points', 'safety_flags']) {
    assert.ok(field in mirror, `precondition: the mirror has ${field}`);
    assert.ok(field in p, `the pair must carry ${field}`);
  }

  // Every fact has the shape `fact()` produces plus the ranking fields the
  // contract layer reads.
  for (const f of p.facts) {
    assert.equal(typeof f.id, 'string');
    assert.equal(typeof f.type, 'string');
    assert.ok(f.provenance, `${f.id} has provenance`);
    assert.ok(f.hierarchy?.role, `${f.id} has a hierarchy role`);
    assert.equal(typeof f.importance, 'number', `${f.id} has an importance`);
  }
});

test('EVERY required point has a backing fact, and every must_cover string exists on it', () => {
  // The contract's central invariant: a required point can never ask for content
  // that is not there. `requiredPoints()` derives must_cover from what the fact
  // carries, so this fails only if the pair builds a point some other way.
  for (const [quadrant, [x, y]] of Object.entries(BY_QUADRANT)) {
    const p = pair(x, y);
    const byId = new Map(p.facts.map((f) => [f.id, f]));
    for (const point of p.required_points) {
      const f = byId.get(point.fact_id);
      assert.ok(f, `${quadrant}: required point ${point.fact_id} has a backing fact`);
      for (const key of point.must_cover) {
        assert.ok(f[key], `${quadrant}: ${point.fact_id} carries its must_cover "${key}"`);
      }
    }
  }
});

test('every quadrant produces a p5_pull_fit SPINE fact', () => {
  for (const [quadrant, [x, y]] of Object.entries(BY_QUADRANT)) {
    const p = pair(x, y);
    const f = p.facts.find((x2) => x2.id === 'p5_pull_fit');
    assert.ok(f, `${quadrant}: the fact exists`);
    assert.equal(f.hierarchy.role, 'spine', `${quadrant}: it is spine`);
    assert.equal(f.provenance.quadrant, quadrant, `${quadrant}: and it is the right one`);
    assert.equal(p.core.quadrant, quadrant);

    // Spine facts are always required, whatever their importance.
    assert.ok(
      p.required_points.some((r) => r.fact_id === 'p5_pull_fit'),
      `${quadrant}: and it is a required point`,
    );
  }
});

test('the P2 REFRAME is flagged exactly when the day pair carries 冲, 害 or 刑', () => {
  // The spec's ethical spine, and the flag Stage 6's `reframe_present` will read.
  // 1 x 12's day pair is the 子卯 punishment; 3 x 7 has an empty day pair.
  const flagged = pair(1, 12);
  assert.ok(flagged.safety_flags.includes('p2_reframe_required'));
  assert.equal(flagged.facts.find((f) => f.id === 'p2_day_pair').type, 'tension');

  const clean = pair(3, 7);
  assert.ok(!clean.safety_flags.includes('p2_reframe_required'));
  assert.equal(clean.facts.find((f) => f.id === 'p2_day_pair').type, 'core');

  // And the flag is NOT raised by a palace 害 alone - 1 x 3 has two of them and an
  // empty day pair. The reframe is about the seat, per the spec.
  assert.ok(!pair(1, 3).safety_flags.includes('p2_reframe_required'));
});

test('the pair safety flags include the mirror\'s AND the two a pair needs', () => {
  const mirror = buildSemanticJson(chart(1));
  const p = pair(1, 2);
  for (const flag of mirror.safety_flags) {
    assert.ok(p.safety_flags.includes(flag), `the pair keeps the mirror's ${flag}`);
  }
  // rule doc 2.4, and rule 25 applied to two people rather than one.
  assert.ok(p.safety_flags.includes('no_verdict'));
  assert.ok(p.safety_flags.includes('two_people'));
});

test('EMPTY FACTS ARE OMITTED, never emitted as null', () => {
  // 3 x 7 carries no cross-chart branch relation at all, so both palace facts
  // must be absent rather than present-and-empty: `assembleFallback` builds a
  // block per required fact, and an empty one would be a heading with nothing
  // under it in the floor.
  const p = pair(3, 7);
  assert.equal(p.facts.some((f) => f.id === 'p2_b_hits_a'), false);
  assert.equal(p.facts.some((f) => f.id === 'p2_a_hits_b'), false);

  // 1 x 101 shares a missing element; 1 x 2 does not.
  assert.ok(pair(1, 101).facts.some((f) => f.id === 'p3_same_imbalance'));
  assert.equal(pair(1, 2).facts.some((f) => f.id === 'p3_same_imbalance'), false);
});

test('NO BIRTH DATA REACHES THE SEMANTIC JSON, for either person', () => {
  // Ruled 2026-09-07: B's birth input is the second input to a calculation and
  // nothing else. A's is refused too - the semantic JSON is handed to a PROVIDER
  // (lib/render/payload.js), and a birth date in it would leave the building.
  const p = pair(1, 2);
  assert.ok(p.facts.length > 0, 'precondition: there are facts, so this is not vacuous');

  const raw = JSON.stringify(p);
  for (const value of ['1989-09-13', '09:00', '1990-03-04', '14:00']) {
    assert.ok(!raw.includes(value), `${value} must not appear`);
  }
  for (const key of ['birth_date', 'birthDate', 'birth_time', 'birthTime']) {
    assert.ok(!raw.includes(key), `${key} must not appear`);
  }
});

test('THE SECTION IS KEYED BY VARIANT, and its shape is the rulings file\'s', () => {
  // CORRECTED 2026-09-08. The first shape gave each FACT one cell, which cannot
  // work: `assembleFallback` picks the floor's text straight out of the cell, so
  // one cell per fact means a clashed seat and a harmonised seat read
  // identically. The floor picks text by RELATION.
  //
  // The authority on the shape is docs/content/compat-glossary-rulings.md, and
  // this test PARSES IT rather than restating its key list - a second copy of
  // the shape is the thing that would drift.
  // ALL THREE rulings files, because the section is the union of three tranches:
  // the 24-cell tranche of 2026-09-08 (morning), `p0_opening` the same evening
  // once the floor's naming gap was recorded, and the 42 SEEDS of 2026-09-10
  // (`meaning_seed` + `daily_seed` on each of the 21 FACT cells).
  //
  // PARSED, NOT RESTATED, and that is why adding a tranche is a one-line change
  // here: this test's whole design is that the rulings files are the authority on
  // the shape and a second copy of the key list is the thing that would drift.
  // The seeds file adds fields to existing cells rather than new cells, so the
  // 25-cell count below is unchanged and the per-cell field sets grow.
  const md = ['compat-glossary-rulings.md', 'compat-glossary-rulings-2.md', 'compat-seeds-rulings.md']
    .map((f) => readFileSync(path.join(ROOT, 'docs', 'content', f), 'utf8'))
    .join('\n');
  const ruled = {};
  let heading = null;
  for (const line of md.split(/\r?\n/u)) {
    if (line.startsWith('## ')) {
      heading = line.slice(3).trim().replace('kompatibilitas.', '');
      // ACCUMULATE, never reset. The seeds tranche adds FIELDS to cells the
      // earlier files already ruled, so the same `## kompatibilitas.p1_same`
      // heading appears in two files - and `= []` made the last file win,
      // leaving the expectation holding only the seeds. A cell's ruled shape is
      // the union of every tranche that touched it.
      ruled[heading] ||= [];
      continue;
    }
    if (!heading) continue;
    const m = /^-\s+([a-z_]+):\s+"(.*)"\s*$/u.exec(line);
    if (m) ruled[heading].push(m[1]);
  }

  assert.equal(Object.keys(ruled).length, 25, 'the two rulings files have 25 cells');

  const cells = Object.keys(GLOSSARY.kompatibilitas).filter((k) => !k.startsWith('_'));
  assert.deepEqual(cells.slice().sort(), Object.keys(ruled).sort(),
    'the glossary key set IS the rulings file\'s');

  // Field for field, and 46 in total. The applier refuses on a count mismatch, so
  // a shape that drifts from 46 here fails there too - this says so earlier and
  // with the offending cell named.
  let total = 0;
  for (const [key, fields] of Object.entries(ruled)) {
    const have = Object.keys(GLOSSARY.kompatibilitas[key]).filter((k) => !k.startsWith('_'));
    assert.deepEqual(have.slice().sort(), fields.slice().sort(), `${key} has exactly the ruled fields`);
    total += have.length;
  }
  // 46 from the first tranche, plus p0_opening's one (what `--expect 1` checks on
  // the second), plus the 42 SEEDS of 2026-09-10 - `meaning_seed` and
  // `daily_seed` on each of the 21 FACT cells. `_template` is metadata and is
  // stripped by the same `_`-prefix rule as `_note`, so it is not an assignment
  // and does not count.
  //
  // 46 + 1 + 42 = 89, and the arithmetic is written out because this number is
  // the one a later tranche has to update deliberately rather than by reading a
  // failure and typing whatever the actual was.
  assert.equal(total, 89, '89 assignments across the three tranches');

  // NO SEEDS. Nothing was ruled for gift/cost/actionable, and a placeholder for a
  // string nobody has ruled is an invitation to invent one.
  // METADATA KEYS STRIPPED, same rule scanUnruled uses. The section's own
  // _README NAMES the three dropped fields in explaining that they are dropped,
  // so a raw scan matches the documentation rather than the data - the third time
  // this exact shape has appeared in two days.
  const raw = JSON.stringify(GLOSSARY.kompatibilitas, (k, v) => (k.startsWith('_') ? undefined : v));
  for (const dropped of ['gift_seed', 'cost_seed', 'actionable_seed']) {
    assert.ok(!raw.includes(dropped), `no ${dropped} anywhere in the section`);
  }
  // And the two folded sub-objects are gone: the badge IS name_id.
  assert.equal('pattern' in GLOSSARY.kompatibilitas, false, 'pattern.* folded into p4_*');
  assert.equal('quadrant' in GLOSSARY.kompatibilitas, false, 'quadrant.* folded into p5_q*');
});

test('THE OPENING FACT NAMES BOTH PEOPLE, and p0_names stays dropped', () => {
  // ── THE HISTORY, KEPT, BECAUSE IT IS WHY THE CELL HAD TO BE RULED ──
  // `p0_names` was dropped on 2026-09-08 (morning): no opening cell existed, and
  // a fact with `entry: null` has `label: null`, which the glossary reserves for
  // CONDITIONS - so the floor's identity clause tripped `fact.condition_named` as
  // a HARD finding. `RENDER_COPY.floorIdentity` could only ever have named one of
  // the two people anyway.
  //
  // Reyner ruled `p0_opening` the same evening. It is a TEMPLATE, so the sentence
  // is his and the two names are the engine's, and NOTHING was invented to make
  // this pass.
  const pj = pair(1, 2);
  assert.equal(pj.facts.some((f) => f.id === 'p0_names'), false, 'the null-entry fact stays dead');

  const p0 = pj.facts.find((f) => f.id === 'p0_opening');
  assert.ok(p0, 'the opening is a fact, so the FLOOR carries it too');
  assert.equal(p0.hierarchy.role, 'spine');

  const { archetype_name_id: a } = pj.core.a;
  const { archetype_name_id: b } = pj.core.b;
  assert.notEqual(a, b);
  assert.ok(p0.label_meaning.includes(a), 'A is named in the opening');
  assert.ok(p0.label_meaning.includes(b), 'and B is');

  // THE BRACES NEVER SURVIVE. They trip style.code_leak, and a template that
  // reached a reader would be the model's input echoed back at them.
  assert.equal(/[{}]/u.test(p0.label_meaning), false, 'no slot survives substitution');
  assert.equal(p0.label_meaning.includes('{A}'), false);
});

test('THE FLOOR PASSES STAGE 6 ON EVERY QUADRANT, with no sentinel in it', () => {
  // The whole point of the rulings landing. Before them the floor carried
  // `@@UNRULED: kompat_*@@` and hard-failed; this is the assertion that says the
  // deterministic floor is now servable, which is what rule 17 requires of it.
  for (const [quadrant, [x, y]] of Object.entries(BY_QUADRANT)) {
    const pj = pair(x, y);
    const floor = assembleFallback(pj);
    assert.ok(!JSON.stringify(floor.blocks).includes('@@UNRULED'), `${quadrant}: no sentinel`);

    const gate = validateRendering(
      { blocks: floor.blocks, penutup: PENUTUP },
      pj,
      { provider: 'module_assembly' },
    );
    assert.equal(gate.hard, false, `${quadrant}: no HARD finding on the floor`);
    assert.equal(gate.ok, true, `${quadrant}: the floor passes`);
  }
});

test('every fact resolves a RULED cell', () => {
  // A missing key would surface as a silently empty floor block, so pair.js
  // throws on one. This exercises the mapping across pairs that reach different
  // variants rather than trusting the table by reading it.
  for (const [x, y] of [[1, 2], [1, 12], [2, 6], [3, 7], [1, 3], [1, 101]]) {
    const pj = pair(x, y);
    assert.ok(pj.facts.length > 0, 'precondition: there are facts');
    for (const f of pj.facts) {
      // EVERY fact resolves a cell now - `p0_names` was dropped, because no
      // opening cell was ruled and a fact with no cell hard-failed the floor.
      assert.ok(f.label_meaning, `${x}x${y} ${f.id} resolved a cell`);
      assert.ok(!f.label_meaning.includes('@@UNRULED'),
        `${x}x${y} ${f.id} carries RULED text, not a placeholder`);
      assert.equal(f.glossary_gap, undefined, `${x}x${y} ${f.id} is not a gap`);
    }
  }
});

test('variantKeysFor NAMES THE CELL THE FACT ACTUALLY CARRIES', () => {
  // ── THIS IS THE ANTI-DRIFT ASSERTION, and it is the whole reason the gate is
  // allowed to derive variant keys instead of reading a field off the fact ──
  // Stage 6 scopes tension_collapse by these keys (STAGE6_VERSION 1.19.0). The
  // derivation lives beside the construction but is not the same code, which is
  // the "a check holding its own copy of a ruled value IS the cause" shape. So:
  // for every fact of every pair below, at least one derived key must name the
  // GLOSSARY object the fact was actually built from.
  //
  // Compared on `label_meaning` rather than by identity, because a semantic JSON
  // that has been through the cache is a parsed copy and `===` would pass here
  // and fail in production - the exact class of bug this file exists to catch.
  const K = GLOSSARY.kompatibilitas;
  let checked = 0;
  for (const [x, y] of [[1, 2], [1, 12], [2, 6], [3, 7], [1, 3], [1, 101], [13, 11], [12, 6]]) {
    const pj = pair(x, y);
    for (const f of pj.facts) {
      const keys = variantKeysFor(f);
      assert.ok(keys.length > 0, `${x}x${y} ${f.id} derives at least one key`);
      for (const k of keys) assert.ok(K[k], `${x}x${y} ${f.id} -> "${k}" is a real cell`);
      // A TEMPLATE CELL IS COMPARED FILLED. The fact carries the substituted
      // sentence and the cell carries the slots, so the raw strings differ by
      // design - and comparing raw would have made this assertion unfalsifiable
      // for exactly the cell the substitution exists for.
      const cellText = (k) => (K[k]._template
        ? fillPairTemplate(K[k].label_meaning, pj.core.a.archetype_name_id, pj.core.b.archetype_name_id)
        : K[k].label_meaning);
      assert.ok(keys.some((k) => cellText(k) === f.label_meaning),
        `${x}x${y} ${f.id}: derived [${keys.join(', ')}] but the fact carries another cell`);
      checked += 1;
    }
  }
  assert.ok(checked >= 40, `exercised ${checked} facts`);
});

test('EVERY scoped key is a real cell, and the two lists do not overlap', () => {
  // A typo in either list would silently make a block unclassified - scanned,
  // which is the safe direction, and therefore invisible. This is the check that
  // makes the silence audible.
  const scope = BLOCKLIST.style._pair_scope.tension_collapse;
  for (const k of [...scope.banned_in, ...scope.permitted_in]) {
    assert.ok(GLOSSARY.kompatibilitas[k], `"${k}" is a kompatibilitas cell`);
  }
  const both = scope.banned_in.filter((k) => scope.permitted_in.includes(k));
  assert.deepEqual(both, [], 'no key is both banned and permitted');
});

test('THE VARIANT IS THE RELATION, so two seats do not read alike', () => {
  // The correction, asserted. Under the old shape both of these resolved the one
  // `p2_day_pair` cell and would have produced the same sentence.
  const clash = pair(2, 6).facts.find((f) => f.id === 'p2_day_pair');
  const none = pair(3, 7).facts.find((f) => f.id === 'p2_day_pair');
  assert.equal(clash.provenance.variant, 'p2_clash');
  assert.equal(none.provenance.variant, 'p2_none');
  assert.notEqual(clash.label_meaning, none.label_meaning);

  // A punishment outranks a harmony on the same pair: the cell named is the one
  // the reframe is about.
  assert.equal(pair(1, 12).facts.find((f) => f.id === 'p2_day_pair').provenance.variant, 'p2_punishment');

  // P1 is direction-neutral by ruling: both directions of produces share a cell.
  const cycles = new Set();
  for (const [x, y] of [[1, 2], [2, 1], [1, 12], [12, 1]]) {
    cycles.add(pair(x, y).facts.find((f) => f.id === 'p1_stem_relation').provenance.variant);
  }
  for (const v of cycles) assert.match(v, /^p1_(same|produces|controls|combination)$/u);
});

test('THE REFRAME IS ITS OWN REQUIRED FACT, so the FLOOR carries it too', () => {
  // A safety_flag tells the RENDERER a reframe is needed; it puts no ruled words
  // anywhere the floor can reach. As a fact it becomes a required point with its
  // own block, so the spec's ethical spine is not something only the LLM honours.
  const hard = pair(1, 12);
  assert.ok(hard.safety_flags.includes('p2_reframe_required'));
  const reframe = hard.facts.find((f) => f.id === 'p2_reframe');
  assert.ok(reframe, 'the reframe is a fact');
  assert.equal(reframe.hierarchy.role, 'spine');
  assert.ok(hard.required_points.some((r) => r.fact_id === 'p2_reframe'));

  // And absent when the seat is fine.
  assert.equal(pair(3, 7).facts.some((f) => f.id === 'p2_reframe'), false);
});

test('THE FLOOR TOLERATES A CELL WITH ONLY label_meaning', () => {
  // Five of the 24 cells carry label_meaning alone - the reframe, the palace
  // frame and the three P7 leads. `blockFor` iterates
  // ['label_meaning','gift','cost','actionable'] and skips falsy fields, so this
  // already holds; it is asserted because nothing else in the repo exercises a
  // cell with no name and no seeds, and a future edit to that loop would break
  // the floor's reframe silently.
  const hard = pair(1, 12);
  const floor = assembleFallback(hard);
  const ids = floor.blocks.flatMap((b) => b.fact_ids ?? []);
  assert.ok(ids.includes('p2_reframe'), 'the text-only reframe produced a block');

  const block = floor.blocks.find((b) => (b.fact_ids ?? []).includes('p2_reframe'));
  assert.ok(block.text.trim().length > 0, 'and the block has text, not an empty string');

  // No block anywhere is empty. An empty one is what a tolerated-but-unhandled
  // cell would produce, and it would read as a heading with nothing under it.
  for (const b of floor.blocks) {
    assert.ok(b.text.trim().length > 0, `block ${(b.fact_ids ?? []).join(',')} is not empty`);
  }
});

// ── THE P0 OPENING (Y-2b item 5, amendment h) ──────────────

test('THE OPENING NAMES TWO PEOPLE, NOT THREE', async () => {
  // ── WHAT REYNER PHOTOGRAPHED ───────────────────────────────
  // "Bacaan ini tentang kamu, Api Unggun, dan Samudra." Three items in a list,
  // for a reading about two people - and the reader is one of them, so it reads
  // as her plus two strangers.
  //
  // IT IS AN ENGINE TEMPLATE, established before anything was changed:
  //   $ grep -rn "Bacaan ini tentang" docs lib components
  //   docs/content/glossary.json:712  "label_meaning": "Bacaan ini tentang kamu, {A}, dan {B}."
  // substituted at lib/semantic/pair.js by `fillPairTemplate`. So rule 14 is
  // already satisfied - the engine owns the sentence - and the fix is the words.
  const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
  const { buildPairSemantic } = await import('../lib/semantic/pair.js');

  const sj = buildPairSemantic(
    calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'male' }),
    calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'female' }),
  );
  const p0 = sj.facts.find((f) => f.id === 'p0_opening');
  const a = sj.core.a.archetype_name_id;
  const b = sj.core.b.archetype_name_id;

  assert.equal(p0.label_meaning, `Ini adalah bacaan tentang dua individu: ${a} dan ${b}`);

  // A first, B second - she typed her own birth into step 1, and a reading that
  // reverses them is a reading about the wrong person first.
  assert.ok(p0.label_meaning.indexOf(a) < p0.label_meaning.indexOf(b));

  // "kamu" is gone: the reader is not a THIRD item in a list of two.
  assert.equal(/\bkamu\b/u.test(p0.label_meaning), false,
    'the reader must not be listed alongside the two archetypes');

  // "dua", not the digit. Reyner amended that himself on Cowork's flag.
  assert.ok(p0.label_meaning.includes('dua individu'));
  assert.equal(p0.label_meaning.includes('2 individu'), false);

  // AND THE HARD GATE STILL PASSES. `pair.both_named` requires the opening block
  // to contain both archetype names; the ruled sentence contains both, which is
  // why this is a data change and not a gate change - no STAGE6_VERSION move.
  assert.ok(p0.label_meaning.includes(a) && p0.label_meaning.includes(b));
});
