// ============================================================
// The Complete Edition PDF — the appendix generator
// ============================================================
// Run: npm run test:pdf-appendix
//
// Prompt M build step 1. Pure data, no PDF, no fonts, no network - which is the
// whole reason the appendix is built and tested before anything renders. Prompt M
// calls it the piece most likely to be wrong.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this), the
// same arrangement the other engine specs use.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import {
  buildAppendix, assertEveryMechanicExplained, GROUP_ORDER,
} from '../lib/pdf/appendix.js';

const forChart = (tc) => {
  const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
  return { chart, semanticJson: buildSemanticJson(chart) };
};
const CHART_1 = forChart(VALIDATION_CHARTS[0]);
const flat = (a) => a.groups.flatMap((g) => g.entries.map((e) => ({ ...e, group: g.group })));

// ── it is her chart, not the glossary ──────────────────────

test('the appendix is the USED SUBSET, and far smaller than the glossary', () => {
  const a = buildAppendix(CHART_1);
  const glossarySize = ['aspek', 'bintang', 'elemen', 'kekuatan', 'elemen_hilang',
    'elemen_dominan', 'shio', 'relasi_cabang', 'pilar']
    .reduce((n, s) => n + Object.keys(GLOSSARY[s]).filter((k) => !k.startsWith('_')).length, 0);
  assert.ok(a.count > 0, 'chart 1 assembled to nothing');
  assert.ok(a.count < glossarySize / 2,
    `${a.count} entries against a glossary of ${glossarySize} is not a subset worth calling one`);
});

test('groups appear in the ruled order, and an empty group is dropped rather than printed', () => {
  const a = buildAppendix(CHART_1);
  const order = a.groups.map((g) => g.group);
  assert.deepEqual(order, GROUP_ORDER.filter((g) => order.includes(g)),
    'group order must follow prompt M');
  for (const g of a.groups) assert.ok(g.entries.length > 0, `${g.group} rendered empty`);
});

// ── CORRECTION 1: a `label: null` fact is never named ──────

test('A CONDITION IS LABELLED BY ITS ABSENCE, never by an invented noun', () => {
  // ── WHAT THIS REPLACED, AND WHY IT IS NOT A REVERSAL ─────
  // Until 2026-09-22 this test was `A CONDITION IS NEVER NAMED - not in English,
  // not in Indonesian`, and it asserted `entry.name === null`. Its reasoning was
  // correction 1's: a first draft printed `label_bracket`, so a paid Indonesian
  // document said "Missing Wood" and "Dominant Officer"; a second invented "Kayu
  // yang Hilang". Both NAME A THING SHE DOES NOT CARRY, which is what
  // `fact.condition_named` HARD-rejects in the renderer and what floored chart 5 at
  // attempt 2 in Reyner's 08-19 read.
  //
  // THAT REASONING IS INTACT. What changed is that the rows printed with no label
  // at all, so three paragraphs hung off the row above them and read as its
  // continuation (P2 markup A6, read on the real PDF). Reyner ruled the format on
  // 2026-09-22: `Tanpa [Elemen]` / `Dominan [Elemen]`.
  //
  // `Tanpa Kayu` names the ABSENCE. `Kayu yang Hilang` names a missing thing as a
  // thing. The old test could not tell those apart because it forbade both; this
  // one requires the first and still forbids the second.
  const conditions = CHART_1.semanticJson.facts.filter((f) => f.label === null);
  assert.ok(conditions.length >= 2, 'fixture assumption: chart 1 carries unnamed conditions');

  const entries = flat(buildAppendix(CHART_1));
  for (const fact of conditions) {
    const entry = entries.find((e) => e.fact_id === fact.id);
    assert.ok(entry, `${fact.id} is in her chart and must still be EXPLAINED`);
    assert.equal(entry.condition, true, `${fact.id} is still a condition`);
    assert.ok(entry.meaning.length > 0, `${fact.id} must carry its ruled meaning`);

    // THE RULED FORMAT, and the element word must be the glossary's own.
    assert.match(entry.name, /^(Tanpa|Dominan) \S+$/u,
      `${fact.id}: "${entry.name}" is not the ruled condition format`);
    assert.equal(entry.name, `${entry.name.split(' ')[0]} ${fact.provenance.element}`,
      `${fact.id}: the element word must come from the fact, not be composed`);

    // AND THE TWO OLD DEFECTS STAY BANNED BY NAME, because a format check alone
    // would accept `Dominant Officer` if someone put it in `provenance.element`.
    assert.notEqual(entry.name, fact.label_bracket, 'never the English bracket');
    assert.equal(/hilang|yang Hilang/u.test(entry.name), false,
      'never the invented noun correction 1 threw out');
  }
});

test('a condition never reaches the "what is in your chart" list', () => {
  // That list is things she CARRIES. A missing element is not one.
  const a = buildAppendix(CHART_1);
  assert.equal(a.carried.filter((n) => n === null).length, 0, 'carried must hold no nulls');
  assert.equal(a.carried.length, a.count - flat(a).filter((e) => e.condition).length);
  for (const e of flat(a)) {
    if (e.condition) assert.ok(!a.carried.includes(e.name), 'a condition leaked into carried');
  }
});

test('NO label_bracket STRING APPEARS ANYWHERE IN THE APPENDIX', () => {
  // The literal first-draft bug, asserted across the whole fixture rather than on
  // the two strings that were caught by eye. Any English bracket for a condition is
  // the defect, whatever it happens to say.
  for (const tc of VALIDATION_CHARTS) {
    const built = forChart(tc);
    const a = buildAppendix(built);
    const printed = JSON.stringify(a);
    for (const fact of built.semanticJson.facts) {
      if (fact.label !== null || !fact.label_bracket) continue;
      assert.ok(!printed.includes(fact.label_bracket),
        `chart ${tc.id}: "${fact.label_bracket}" (a condition's bracket) is printed`);
    }
  }
});

// ── CORRECTION 2: the gate tests MEANING, never NAME ──────

test('THE SHIP GATE DEMANDS A MEANING AND IS INDIFFERENT TO A NAME', () => {
  // Ruled by Reyner 2026-08-20. Written the naive way - every mechanic must have a
  // named legend entry - the gate would FORCE correction 1's bug.
  const a = buildAppendix(CHART_1);
  assert.doesNotThrow(() => assertEveryMechanicExplained(a),
    'chart 1 must ship: every mechanic carries a meaning');

  // A nameless entry with a meaning passes.
  const nameless = structuredClone(a);
  nameless.groups[0].entries[0].name = null;
  assert.doesNotThrow(() => assertEveryMechanicExplained(nameless),
    'a missing NAME must not block the ship');

  // A meaningless entry does not, and the error names it.
  const mute = structuredClone(a);
  mute.groups[0].entries[0].meaning = '';
  assert.throws(() => assertEveryMechanicExplained(mute), (err) => {
    assert.match(err.message, /label_meaning/);
    assert.ok(err.message.includes(mute.groups[0].entries[0].key), 'the error must name the entry');
    return true;
  });
});

test('the gate would have caught the empty Shio entries, and did', () => {
  // `shio` carries its explanation in `trait` and has no `label_meaning` at all.
  // Reading one field everywhere produced three silently empty Shio entries on the
  // first run of this generator; the gate is what surfaced them.
  const a = buildAppendix(CHART_1);
  const shio = a.groups.find((g) => g.group === 'Shio');
  assert.ok(shio && shio.entries.length > 0, 'chart 1 must exercise Shio');
  for (const e of shio.entries) {
    assert.ok(e.meaning.trim().length > 0, `${e.key} has no explanation`);
    assert.equal(e.meaning, GLOSSARY.shio[e.key].trait, 'shio explains itself with `trait`');
  }
});

// ── nothing is hand-typed that exists as data ──────────────

test('PILLAR NAMES COME FROM THE GLOSSARY, never from a hand-typed string', () => {
  // Cowork's draft hand-typed "Pilar Leluhur". The glossary says "Pilar Akar".
  const a = buildAppendix(CHART_1);
  const pilar = a.groups.find((g) => g.group === 'Pilar');
  assert.ok(pilar, 'the Pilar group must exist');
  for (const e of pilar.entries) {
    assert.equal(e.name, GLOSSARY.pilar[e.key].name_id, `${e.key} drifted from the glossary`);
  }
  assert.ok(pilar.entries.some((e) => e.name === 'Pilar Akar'), 'the year pillar is Pilar Akar');
  assert.ok(!JSON.stringify(a).includes('Pilar Leluhur'), 'the hand-typed name must not appear');
});

test('every printed name and meaning is a glossary string, on every fixture chart', () => {
  // The register guard: CLAUDE.md makes Reyner the sole authority, so a word
  // invented in this generator would be unreviewed user-facing copy.
  const strings = new Set();
  for (const section of Object.values(GLOSSARY)) {
    if (!section || typeof section !== 'object') continue;
    for (const entry of Object.values(section)) {
      if (!entry || typeof entry !== 'object') continue;
      for (const v of Object.values(entry)) if (typeof v === 'string') strings.add(v);
    }
  }
  // ── ONE COMPOSED FORM IS ALLOWED, AND EXACTLY ONE ────────
  // WIDENED 2026-09-22, NOT WEAKENED. A condition's label is now `Tanpa [Elemen]` /
  // `Dominan [Elemen]` (Reyner's ruling, P2 markup A6), which is COMPOSED and so is
  // not a glossary string - this test went red on `"Tanpa Kayu" is not a glossary
  // string` and it was right to.
  //
  // The guard it exists to be is unchanged: no word invented in this generator
  // reaches a paid document. So the composition is admitted by SHAPE - one of two
  // ruled prefixes, then a string that must itself be in the glossary - rather than
  // by adding `Tanpa Kayu` to an allowlist. An allowlist would have to grow by five
  // entries per prefix and would accept `Tanpa Officer` on the day someone wired
  // the wrong field.
  const RULED_CONDITION = /^(Tanpa|Dominan) (.+)$/u;
  for (const tc of VALIDATION_CHARTS) {
    for (const e of flat(buildAppendix(forChart(tc)))) {
      if (e.name !== null && !strings.has(e.name)) {
        const m = RULED_CONDITION.exec(e.name);
        assert.ok(m, `chart ${tc.id}: "${e.name}" is not a glossary string`);
        assert.ok(e.condition, `chart ${tc.id}: "${e.name}" uses the condition format but is not one`);
        assert.ok(strings.has(m[2]),
          `chart ${tc.id}: "${m[2]}" in "${e.name}" is not a glossary element name`);
      }
      // A display-only entry carries NO meaning by ruling, so there is nothing to
      // check - and asserting one would be asserting that the ruling is broken.
      if (e.display_only) { assert.equal(e.meaning, '', `${e.key} must carry no meaning`); continue; }
      assert.ok(strings.has(e.meaning), `chart ${tc.id}: ${e.key}'s meaning is not a glossary string`);
    }
  }
});

// ── it stands on every chart ───────────────────────────────

test('the appendix ships on every fixture chart, with no duplicate entry', () => {
  for (const tc of VALIDATION_CHARTS) {
    const a = buildAppendix(forChart(tc));
    assert.doesNotThrow(() => assertEveryMechanicExplained(a), `chart ${tc.id} would not ship`);
    const keys = flat(a).map((e) => `${e.section}.${e.key}`);
    assert.deepEqual([...new Set(keys)].length, keys.length,
      `chart ${tc.id} lists the same entry twice`);
  }
});

test('胎元 PRINTS REYNER\'S MEANING (Prompt AX, 2026-09-30), and no invented one', () => {
  // ── THE 2026-08-07 DISPLAY-ONLY RULING IS LIFTED BY ITS AUTHOR ──
  // It said `pilar.conception` carries no label_meaning on purpose, and prompt M's
  // correction 4 threw out a Cowork-drafted sentence for it. Reyner wrote one himself
  // on 2026-09-30 (Prompt AX, verbatim in the glossary `_note`). So the test that
  // guarded "no meaning" now guards "exactly HIS meaning": the row prints it, the
  // group comes back with it, and it is the glossary's string, not code's.
  const RULED = 'Dihitung dari perkiraan masa pembuahan, sekitar sepuluh bulan sebelum kelahiranmu. Pilar ini melengkapi bagan dan tidak dibaca sendiri.';
  assert.equal(GLOSSARY.pilar.conception.label_meaning, RULED, 'the glossary carries Reyner\'s AX line');
  assert.match(GLOSSARY.pilar.conception._note, /LIFTED by Reyner 2026-09-30/u, 'the _note records the lifted ruling');
  const a = buildAppendix(CHART_1);
  const entry = flat(a).find((e) => e.key === 'conception');
  assert.ok(entry, 'the conception row prints now that it has a meaning');
  assert.equal(entry.meaning, RULED);
  assert.equal(entry.display_only, false, 'no longer exempt from correction 2');
  assert.ok(a.groups.some((g) => g.group === 'Pilar Konsepsi'), 'its group heading returns with its row');
  // "Istana Konsepsi" is the string the 08-07 ruling replaced; it must not come back.
  assert.ok(!JSON.stringify(a).includes('Istana Konsepsi'), 'the replaced name must not come back through the PDF');
  assert.doesNotThrow(() => assertEveryMechanicExplained(a));
});
test('an hour-less chart lists no hour pillar and still ships', () => {
  const chart = calculateBaziChart({ birthDate: '1989-02-04', birthTime: null });
  const a = buildAppendix({ chart, semanticJson: buildSemanticJson(chart) });
  const pilar = a.groups.find((g) => g.group === 'Pilar');
  assert.ok(!pilar.entries.some((e) => e.key === 'hour'),
    'a chart with no hour must not explain a pillar it does not have');
  assert.ok(pilar.entries.some((e) => e.key === 'year'), 'the pillars it does have still appear');
  assert.doesNotThrow(() => assertEveryMechanicExplained(a));
});

// ── SHIO IS THE BIRTH-YEAR ANIMAL ONLY (Prompt AW §3 item 1, Reyner 2026-09-30) ──
// "we usually only know one Shio - the year we born - but the glossary lists 4, it
// will potentially confuse the reader." The appendix's Shio group is the YEAR branch's
// animal alone. The other three stay where they are: under each pillar on the chart
// page, where an animal labels a pillar and is not "your Shio".
test('AW §3.1: the Shio group holds the year branch\'s animal and nothing else', () => {
  for (const tc of VALIDATION_CHARTS) {
    const chart = calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
    const semanticJson = buildSemanticJson(chart);
    const shio = buildAppendix({ chart, semanticJson }).groups.find((g) => g.group === 'Shio');
    const year = [...(semanticJson.chart.year || '')][1];
    assert.ok(shio, `chart ${tc.id}: a Shio group`);
    assert.deepEqual(shio.entries.map((e) => e.key), [year], `chart ${tc.id}: the year's ${year} only`);
    assert.equal(shio.entries[0].name, GLOSSARY.shio[year].name_id);
  }
});
