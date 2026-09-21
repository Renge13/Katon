// ============================================================
// The compat PDF — the pair appendix (legend) generator
// ============================================================
// Run: npm run test:pdf-pair-appendix
//
// Prompt Y-3 commit 2. Pure data, no PDF, no fonts, no network - which is the whole
// reason this piece is built and tested before the composer exists. Prompt M called
// the single-chart version "the piece most likely to be wrong"; this one joins two
// charts to one legend and is more so.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { factRows } from '../lib/pdf/pairDocument.js';
import {
  assertEveryMechanicExplained, assertAnchorsUnique, anchorIds, anchorId, GROUP_ORDER,
} from '../lib/pdf/appendix.js';
import {
  buildPairAppendix, PAIR_GROUP, PAIR_GROUP_ORDER, PER_CHART_GROUPS, NOT_A_TERM,
} from '../lib/pdf/pairAppendix.js';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';
import GLOSSARY from '../docs/content/glossary.json' with { type: 'json' };

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/**
 * The Y-1 fixture pair's births. Same two as `scripts/measure-compat-voice.mjs:86`,
 * and named here for the same reason it names them: that pair is the repo's only
 * `p2_harm` and the only one with a real production render behind it
 * (`tests/fixtures/pair-reading-g4WH4.json`), so every compat measurement since
 * 2026-09-11 includes it and this appendix should be checked on the same pair the
 * prose was.
 */
const Y1 = {
  a: calculateBaziChart({ birthDate: '1989-09-13', birthTime: null }),
  b: calculateBaziChart({ birthDate: '1997-09-14', birthTime: null }),
};

const PAIRS = {
  'Y-1 fixture': Y1,
  '2x6': { a: chartOf(2), b: chartOf(6) },
};

const appendixFor = ({ a, b }) => {
  const semanticJson = buildPairSemantic(a, b);
  return { semanticJson, appendix: buildPairAppendix({ chartA: a, chartB: b, semanticJson }) };
};

const COMPAT_CELLS = Object.keys(GLOSSARY.kompatibilitas).filter((k) => !k.startsWith('_'));

test('IT IS THEIR PAIR, NOT THE GLOSSARY: the compat subset is a strict subset', () => {
  for (const [name, pair] of Object.entries(PAIRS)) {
    const { appendix } = appendixFor(pair);
    const keys = appendix.groups.find((g) => g.group === PAIR_GROUP).entries.map((e) => e.key);

    assert.ok(keys.length > 0, `${name}: no compat cells resolved at all`);
    assert.ok(keys.length < COMPAT_CELLS.length,
      `${name}: ${keys.length} of ${COMPAT_CELLS.length} compat cells - a legend that lists `
      + 'every cell is a reference book, and the reader bought a reading about one pair');
    for (const k of keys) assert.ok(COMPAT_CELLS.includes(k), `${name}: ${k} is not a ruled cell`);
    assert.equal(new Set(keys).size, keys.length, `${name}: a cell appears twice`);
  }
});

test('2x6 STILL GETS ITS REFRAME - in the facts table now, not the legend', () => {
  // ── THIS TEST CAUGHT A REAL DEFECT AND IS KEPT FOR IT ────
  // It used to assert the reframe was an APPENDIX entry, in the correction 1 shape:
  // no name, a meaning, `condition: true`. Prompt AB §2 moved both unnamed compat
  // cells out of the legend on the stated ground that they "already appear in the
  // table and the reading" - and this assertion went red, correctly, because that
  // was true of `p2_palace_frame` and FALSE of `p2_reframe`:
  //
  //   $ node -e "...factRows(buildPairSemantic(chart2, chart6))..."
  //     facts-table rows for p2_reframe: 0
  //
  // Building AB as written would have deleted the de-catastrophising line from a
  // paid document, for exactly the readers whose seats are hard. Reyner ruled the
  // fix on 2026-09-22: print it in the FACTS TABLE under the seat rows, hard seats
  // only, and drop it from the legend.
  //
  // So the proposition is unchanged - "the reframe reaches a reader who needs it" -
  // and only the surface it is asserted on has moved. The legend half is asserted
  // NEGATIVELY here so the old home cannot quietly come back and give her two.
  const { semanticJson, appendix } = appendixFor(PAIRS['2x6']);
  // The precondition, from the engine rather than from the pair's name: the prompt
  // picked 2x6 for its seat, and a fixture chart edit could quietly change that.
  assert.ok(semanticJson.safety_flags.includes('p2_reframe_required'),
    'precondition: 2x6 is a pair the prompt MANDATES the reframe for');

  const compat = appendix.groups.find((g) => g.group === PAIR_GROUP).entries;
  assert.equal(compat.some((e) => e.key === 'p2_reframe'), false,
    'the legend no longer carries it - a legend lists terms, and this has none');

  const note = factRows(semanticJson).find((r) => r.note);
  assert.ok(note, 'the facts table carries it, under the seat rows');
  assert.equal(note.meaning, GLOSSARY.kompatibilitas.p2_reframe.label_meaning,
    'and it is the ruled sentence, unedited');
});

test('NO CELL REACHES THE LEGEND WITHOUT A TERM, and none leaks into a reference list', () => {
  // ── WHAT THIS REPLACED ───────────────────────────────────
  // `CORRECTION 1: an unnamed cell carries meaning, no name, and no reference row`,
  // which REQUIRED at least one nameless entry per pair (`expected at least one
  // nameless entry`). That was correct while unnamed cells lived in the legend.
  //
  // They no longer do. P2 markup A6 read the real PDF and found what those rows
  // look like to a buyer: paragraphs with no label, hanging off the row above.
  // Reyner ruled them out on 2026-09-22 - `p2_palace_frame` became the facts
  // table's frame-group lead line, `p2_reframe` became a note under the seat rows.
  //
  // THE HALF OF THE OLD TEST THAT STILL MATTERS IS KEPT, and it is the sharp half:
  // a nameless thing must never reach a reference list as a bare KEY. The old
  // comment says exactly why - "a future `name: e.key` would satisfy every other
  // check here and put `p2_reframe` in a reader-facing list as a bare key" - and
  // that hazard did not go away when the rows did. So the loop still runs; what
  // changed is that the expected count of nameless entries is now ZERO rather than
  // at least one, and both are asserted.
  for (const [name, pair] of Object.entries(PAIRS)) {
    const { appendix } = appendixFor(pair);
    const unnamed = appendix.groups.flatMap((g) => g.entries).filter((e) => e.name === null);
    assert.deepEqual(unnamed.map((e) => `${e.section}.${e.key}`), [],
      `${name}: a legend row with no term`);

    for (const e of unnamed) {
      assert.ok(e.meaning.trim().length > 0, `${name}: ${e.key} has neither name nor meaning`);
      // THE REFERENCE LISTS ARE THE "what is in your chart" LISTS, and a thing with
      // no name cannot be in one. This is the assertion that would catch correction
      // 1 being undone - a future `name: e.key` would satisfy every other check here
      // and put `p2_reframe` in a reader-facing list as a bare key.
      for (const list of ['compat', 'chartA', 'chartB']) {
        assert.equal(appendix[list].some((r) => r.key === e.key && r.section === e.section), false,
          `${name}: ${e.section}.${e.key} has no name and must not appear in ${list}`);
      }
      assert.equal(appendix.carried.includes(null), false, `${name}: a null leaked into carried`);
    }
  }
});

test('p0_opening is NOT a term: its cell is a template and never becomes an entry', () => {
  // It resolves through `variantKeysFor` exactly like every other fact, so nothing
  // structural keeps it out - only `NOT_A_TERM`. An entry for it would print `{A}`
  // and `{B}` into a paid document, which is the concrete failure this guards.
  assert.ok(NOT_A_TERM.has('p0_opening'));
  assert.ok(GLOSSARY.kompatibilitas.p0_opening.label_meaning.includes('{A}'),
    'precondition: the cell really is an unfilled template');

  for (const [name, pair] of Object.entries(PAIRS)) {
    const { semanticJson, appendix } = appendixFor(pair);
    assert.ok((semanticJson.facts || []).some((f) => f.id === 'p0_opening'),
      `${name}: precondition - the fact is present, so exclusion is what keeps it out`);
    const keys = appendix.groups.flatMap((g) => g.entries).map((e) => e.key);
    assert.equal(keys.includes('p0_opening'), false, `${name}: the opening template became a term`);
    const text = appendix.groups.flatMap((g) => g.entries).map((e) => e.meaning).join('\n');
    assert.equal(text.includes('{A}'), false, `${name}: an unfilled placeholder reached the legend`);
    assert.equal(text.includes('{B}'), false, `${name}: an unfilled placeholder reached the legend`);
  }
});

test('the two charts merge into ONE legend: shared terms are deduped, anchors unique', () => {
  for (const [name, pair] of Object.entries(PAIRS)) {
    const { appendix } = appendixFor(pair);
    // `assertAnchorsUnique` throws on a collision, which is what a naive concat of
    // two charts' appendices would produce the moment both carry the same Shio - and
    // a collision is a reference silently pointing at another entry's page.
    const unique = assertAnchorsUnique(appendix);
    assert.equal(new Set(unique).size, unique.length);
    assert.equal(unique.length, appendix.count);

    // The dedupe is real rather than incidental: both charts DO share entries, and
    // the merged count is smaller than the two lists laid end to end.
    const both = appendix.chartA.length + appendix.chartB.length;
    const shared = appendix.chartA.filter((e) => appendix.chartB.includes(e));
    assert.ok(shared.length > 0, `${name}: expected the two charts to share Pilar entries`);
    assert.ok(appendix.count < both + appendix.compat.length,
      `${name}: nothing was deduped, so two charts produced two legends`);
    // SHARED ENTRIES ARE THE SAME OBJECT, which is what lets both chart pages'
    // reference lists resolve to one anchor instead of two. `anchorId` is CALLED
    // rather than reimplemented here - a second copy of its sanitiser would be a
    // check on two derivations instead of on the artifact, which is the mistake the
    // writer and the verifier sharing `anchorId` exists to avoid.
    const ids = anchorIds(appendix);
    for (const e of shared) {
      assert.equal(ids.filter((i) => i === anchorId(e)).length, 1,
        `${name}: ${e.section}.${e.key} is anchored twice`);
    }
  }
});

test("CORRECTION 2's gate passes: every mechanic in the legend carries a meaning", () => {
  for (const [name, pair] of Object.entries(PAIRS)) {
    const { appendix } = appendixFor(pair);
    assert.doesNotThrow(() => assertEveryMechanicExplained(appendix), `${name}`);
  }
});

test('the group order is prompt M\'s ENTIRE list, with Kompatibilitas first', () => {
  // ── REVERSED 2026-09-14, AND THE TEST WAS SHOWN RED FIRST ──
  // This asserted `GROUP_ORDER.filter((g) => g !== 'Relasi Cabang')` under Y-3's
  // enumeration. Reyner ruled the group back IN on 2026-09-14: R2 bounds the
  // document only by the LOCKED RULES, and "a reader might read a personal 冲 as a
  // pair one" is a presentation worry, not one of them. Putting the group back
  // reddened this with `+ 'Relasi Cabang'`, which is the run in the commit message.
  //
  // It is still pinned to a LITERAL list rather than to `GROUP_ORDER` itself, so a
  // group silently added to the mirror's order does not silently enter a paid
  // compat document - the reason the original was pinned at all survives the
  // reversal.
  assert.equal(PAIR_GROUP_ORDER[0], PAIR_GROUP);
  assert.deepEqual(PER_CHART_GROUPS, [
    'Aspek', 'Bintang', 'Elemen dan Kekuatan', 'Relasi Cabang', 'Pilar', 'Shio', 'Pilar Konsepsi',
  ]);
  assert.deepEqual(PER_CHART_GROUPS, GROUP_ORDER,
    'every mirror group is in the compat legend now');
  assert.notEqual(PER_CHART_GROUPS, GROUP_ORDER,
    'a COPY, so an edit to one order cannot move the other');

  for (const [name, pair] of Object.entries(PAIRS)) {
    const { appendix } = appendixFor(pair);
    const order = appendix.groups.map((g) => g.group);
    assert.deepEqual(order, PAIR_GROUP_ORDER.filter((g) => order.includes(g)),
      `${name}: groups are out of ruled order`);
    // `Relasi Cabang` MAY be here now (ruled 2026-09-14). It is not asserted
    // PRESENT, because a pair whose two charts happen to carry no internal branch
    // relation legitimately has none - an empty group is dropped, never rendered
    // empty, which the loop below still asserts.
    for (const g of appendix.groups) {
      assert.ok(g.entries.length > 0, `${name}: ${g.group} rendered empty`);
    }
  }
});
