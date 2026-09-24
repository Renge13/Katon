// ============================================================
// tests/pdf-passable.spec.mjs — the defects Reyner marked, pinned
// ============================================================
// Run: npm run test:pdf-passable
//
// Prompt AB ("P2") §3. Every assertion here corresponds to one row of
// `docs/handoff/p2-markup-2026-09-22.md`, and every one of them FAILS on the two
// PDFs Reyner read on 2026-09-22 - that is the entry condition for the row being in
// §3 rather than in §4.
//
// ── THE FIXTURE IS THE FLOOR, AND THE ARTIFACT IS NOT ─────
// These build from `assembleFallback`, deliberately, for the reason
// `tests/pdf-document.spec.mjs` already gives: the floor is byte-stable, so a layout
// assertion cannot go red because a model wrote a different sentence today. The two
// PDFs Reyner MARKS UP are model renders fetched from the preview - different job,
// different requirement. Saying which is which is the 2026-09-14 lesson and it is
// said here as well as in the handoff.
//
// ── WHAT THESE CANNOT SEE ─────────────────────────────────
// Whether the result is BEAUTIFUL. Every assertion below is of the form "no empty
// cell", "one size", "not orphaned" - each is a defect's absence, and a document can
// satisfy all of them and still read as a memo. A12 (measure and heading face) is
// deliberately NOT asserted: "~70 characters" is a target Reyner judges on the
// artifact, and a test pinning a character count would freeze a taste decision as a
// number. Acceptance for the layout rows is his "passable", per AB §5.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf } from '../lib/pdf/build.js';
import { buildAppendix } from '../lib/pdf/appendix.js';
import { buildPairAppendix } from '../lib/pdf/pairAppendix.js';
import { pageTexts, textBoxes } from '../lib/pdf/inspect.js';
import { PASANGAN_COPY } from '../lib/site/copy.js';
import { RENDER_COPY } from '../lib/render/copy.js';
import { glossarySplits } from './helpers/pdfRows.mjs';
import { GLOSSARY } from '../lib/semantic/glossary.js';

const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };

const renderedFor = (semanticJson) => ({
  ...assembleFallback(semanticJson),
  prompt_version: 'testprompt00',
  stage6_version: '1.25.0',
});

const cache = new Map();

async function mirror() {
  if (cache.has('mirror')) return cache.get('mirror');
  const chart = calculateBaziChart(A);
  const semanticJson = buildSemanticJson(chart);
  // gender: the reading row's, which the delivery handler passes (R3, 2026-09-24).
  const out = await buildCompleteEditionPdf({
    chart, semanticJson, rendered: renderedFor(semanticJson), gender: 'female',
  });
  const value = { ...out, chart, semanticJson, appendix: buildAppendix({ chart, semanticJson }) };
  cache.set('mirror', value);
  return value;
}

async function compat() {
  if (cache.has('compat')) return cache.get('compat');
  const chartA = calculateBaziChart(A);
  const chartB = calculateBaziChart(B);
  const semanticJson = buildPairSemantic(chartA, chartB);
  const out = await buildPairPdf({
    chartA,
    chartB,
    semanticJson,
    rendered: renderedFor(semanticJson),
    pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
  });
  const value = {
    ...out, chartA, chartB, semanticJson, rendered: renderedFor(semanticJson),
    appendix: buildPairAppendix({ chartA, chartB, semanticJson }),
  };
  cache.set('compat', value);
  return value;
}

/** Every text run on every page, flattened, with its page index. */
const runsOf = (buffer) => textBoxes(buffer)
  .flatMap((runs, page) => runs.map((r) => ({ ...r, page })));

// ── A4: one body size ──────────────────────────────────────

/** The size of the run that drew `snippet`, or null. */
function sizeOfRunContaining(buffer, snippet) {
  const needle = snippet.replace(/\s+/gu, ' ').trim().slice(0, 24);
  if (needle.length < 8) return null;
  for (const r of runsOf(buffer)) {
    if (String(r.text || '').replace(/\s+/gu, ' ').includes(needle)) return r.size;
  }
  return null;
}

test('A4 THE PENUTUP IS SET IN THE BODY SIZE, not a larger one', async () => {
  // `PDF_STYLES.penutup` is `fontSize: 12` against a body of 11. A closing paragraph
  // in a different size reads as a different KIND of text, which is exactly what it
  // is not - it is the last paragraph of the reading. Reyner saw the same defect on
  // screen and called it "the paragraph gap".
  //
  // ── THE FIRST VERSION OF THIS TEST WAS RED FOR THE WRONG REASON ──
  // It asserted "all prose between 10.5 and 13pt is one size" and went red on the
  // MIRROR - where `assembleFallback` produces NO penutup at all, so what it had
  // actually caught was `h2` at 12pt and `coverSub` at 13pt. Both are headings and
  // neither is A4. A band is not a proposition: the fix is to find the penutup's own
  // run and compare it to the body's own run, which is what the row says.
  //
  // COMPAT ONLY, because compat is the fixture that HAS a penutup. The style is
  // shared - `pairDocument.js` imports `PDF_STYLES as s` - so one assertion covers
  // both documents, and a mirror whose model render does produce a penutup inherits
  // the same fixed style.
  // ── THE FIXTURE CARRIES AN EXPLICIT PENUTUP ──────────────
  // `assembleFallback` emits an EMPTY penutup for both documents - measured - so
  // neither floor fixture exercises this style at all. A model render does produce
  // one, and the PDF Reyner read had it. The sentence below is filler and is never
  // asserted on; what is asserted is the SIZE the composer sets for whatever
  // penutup it is given, which is the whole of row A4.
  const chartA = calculateBaziChart(A);
  const chartB = calculateBaziChart(B);
  const semanticJson = buildPairSemantic(chartA, chartB);
  const base = renderedFor(semanticJson);
  const penutup = 'Hubungan ini meminta kesabaran dari kalian berdua pada hari-hari biasa, '
    + 'dan itu terlihat paling jelas ketika rencana kecil berubah tanpa pemberitahuan.';
  const built = await buildPairPdf({
    chartA,
    chartB,
    semanticJson,
    rendered: { ...base, penutup },
    pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
  });

  const bodyText = base.blocks.map((b) => b.text).find((t) => t && t.length > 40);
  const bodySize = sizeOfRunContaining(built.buffer, bodyText);
  const penutupSize = sizeOfRunContaining(built.buffer, penutup);

  assert.ok(bodySize, 'a body run was located');
  assert.ok(penutupSize, 'the penutup run was located');
  assert.equal(penutupSize, bodySize,
    `penutup is ${penutupSize}pt against a ${bodySize}pt body`);
});

// ── A6 / A7: no empty cell reaches a buyer ─────────────────

test('A6 EVERY APPENDIX ROW HAS A TERM - no text hanging off the row above', async () => {
  // The missing-element and dominant-element cells have no `name_id`, so their
  // meaning printed with no label and read as a continuation of the previous entry.
  // Reyner ruled the format on 2026-09-22: `Tanpa [Elemen]` / `Dominan [Elemen]`.
  for (const [name, built] of [['mirror', await mirror()], ['compat', await compat()]]) {
    const unnamed = built.appendix.groups
      .flatMap((g) => g.entries)
      .filter((e) => !e.name || !String(e.name).trim())
      .map((e) => String(e.meaning || '').slice(0, 60));
    assert.deepEqual(unnamed, [],
      `${name}: ${unnamed.length} appendix rows have no term`);
  }
});

test('A7 NO APPENDIX ROW HAS AN EMPTY MEANING, and no group is left empty', async () => {
  // `pilar/conception.label_meaning` is empty by a standing ruling, and the row
  // shipped anyway: a group heading `Pilar Konsepsi` followed by a row labelled
  // `Pilar Konsepsi` followed by nothing. An empty cell in a document she paid for.
  for (const [name, built] of [['mirror', await mirror()], ['compat', await compat()]]) {
    const empty = built.appendix.groups
      .flatMap((g) => g.entries.map((e) => ({ group: g.heading ?? g.name, e })))
      .filter(({ e }) => !String(e.meaning || '').trim())
      .map(({ group, e }) => `${group} / ${e.name}`);
    assert.deepEqual(empty, [], `${name}: appendix rows with no meaning`);

    const barren = built.appendix.groups
      .filter((g) => !g.entries.length)
      .map((g) => g.heading ?? g.name);
    assert.deepEqual(barren, [], `${name}: appendix groups with no rows`);
  }
});

// ── A5 / A9: page breaks ───────────────────────────────────

/**
 * A compat PDF whose reading is long enough to spill.
 *
 * ── WHY A PADDED FIXTURE AND NOT THE PLAIN FLOOR ──────────
 * The floor's own prose does not strand - measured, `7 15 23 23 51 46 44 45` runs
 * per page, nothing short. The PDF REYNER READ did: `7 31 2 23 23 51 46 44 45`, two
 * runs alone on page 3, which is markup row A5. A test that ran only on the floor
 * would have been GREEN on a defect sitting in the artifact, which is the exact
 * shape this repo keeps recording.
 *
 * So the padding is chosen to reproduce the measured artifact rather than to be
 * tidy: 17 repetitions puts 2 runs on page 3, the same strand, and 16 puts 5 there.
 * It is a LAYOUT fixture - the words are filler and are never asserted on - and the
 * proposition is "prose of this length must not strand", which is true of any prose.
 */
async function compatLong() {
  if (cache.has('compat-long')) return cache.get('compat-long');
  const chartA = calculateBaziChart(A);
  const chartB = calculateBaziChart(B);
  const semanticJson = buildPairSemantic(chartA, chartB);
  const base = renderedFor(semanticJson);
  const filler = ' Pola ini terlihat jelas.'.repeat(17);
  const out = await buildPairPdf({
    chartA,
    chartB,
    semanticJson,
    rendered: { ...base, blocks: base.blocks.map((b) => ({ ...b, text: (b.text || '') + filler })) },
    pair: { a: { date: A.birthDate, gender: 'female' }, b: { date: B.birthDate, gender: 'male' } },
  });
  cache.set('compat-long', out);
  return out;
}

test('A5 NO PAGE IS A STRANDED TAIL of two lines and then nothing', async () => {
  // Measured in RUNS rather than characters, because a "line" in a PDF content
  // stream is a positioned run and that is the thing the reader sees stranded.
  const cases = [['mirror', await mirror()], ['compat', await compat()], ['compat-long', await compatLong()]];
  for (const [name, built] of cases) {
    const perPage = textBoxes(built.buffer).map((runs) => runs.length);
    const stranded = perPage
      .map((n, i) => ({ page: i + 1, n }))
      // The cover is legitimately sparse and is not a stranded tail.
      .filter(({ page, n }) => page > 1 && n > 0 && n < 3);
    assert.deepEqual(stranded, [],
      `${name}: pages with fewer than 3 runs: ${JSON.stringify(stranded)} of ${perPage.join(' ')}`);
  }
});

// ── C2: the frame sentence, once ───────────────────────────

test('C2 THE PALACE-FRAME SENTENCE IS PRINTED ONCE, not on every frame row', async () => {
  // AB §2 corrects the markup's diagnosis: this is NOT a glossary entry that lost
  // its key. `p2_palace_frame.label_meaning` is printed on every frame row BY
  // Reyner's ruling of 2026-09-14 - the relation's own meaning must never appear on
  // a frame row - and the cell is nameless by design. So there is nothing to
  // restore; what is wrong is that a buyer reads one sentence three times.
  //
  // THE ASSERTION IS ON THE ARTIFACT'S TEXT, not on the row model, because "how many
  // times does she read it" is a property of the page.
  // SCOPED TO THE FACTS PAGE, which is AB §3's own wording and is the honest
  // boundary: the READING may legitimately say the same thing in prose - that is
  // what the reading is for - and counting document-wide would make this test
  // depend on the model's word choice. The defect is a TABLE repeating itself.
  const built = await compat();
  const pages = pageTexts(built.buffer);
  const factsPageText = pages
    .find((t) => t.includes(PASANGAN_COPY.pdf_facts_heading)) ?? '';
  assert.ok(factsPageText, 'the facts page was located by its ruled heading');

  const frame = built.semanticJson.facts?.find?.((f) => f.id === 'p2_palace_frame');
  const sentence = String(frame?.label_meaning || '').replace(/\s+/gu, ' ').trim();
  assert.ok(sentence.length > 20, 'the frame sentence was found in the semantic JSON');

  const occurrences = factsPageText.replace(/\s+/gu, ' ').split(sentence).length - 1;
  assert.equal(occurrences, 1,
    `the frame sentence appears ${occurrences} times on the facts page; a buyer reads it once`);
});

test('THE REFRAME IS IN THE TABLE UNDER THE SEAT ROWS, AND ONLY ON A HARD SEAT', async () => {
  // ── THE NEAR-MISS THIS PINS ───────────────────────────────
  // AB §2 removed `p2_palace_frame` AND `p2_reframe` from the legend together,
  // saying both "already appear in the table and the reading". Measured: true of
  // the frame, FALSE of the reframe, which produced ZERO facts-table rows. The
  // first build of this prompt therefore deleted - from a paid document - the one
  // sentence that tells a reader a hard seat is not a verdict, and it deleted it
  // for exactly the readers who have a hard seat.
  //
  // Reyner ruled the home for it on 2026-09-22: under the seat rows, in the table,
  // only when the seat is hard. Both halves are asserted, because "only when" is
  // the half that a later refactor would quietly drop.
  const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('./bazi-validation.fixture.js');
  const { factRows } = await import('../lib/pdf/pairDocument.js');
  const all = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
  const pick = (id) => {
    const row = all.find((c) => c.id === id);
    return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
  };
  const reframeText = GLOSSARY.kompatibilitas?.p2_reframe?.label_meaning;
  assert.ok(reframeText, 'the reframe cell is ruled');

  // 2x6 is the hard-seat pair `tests/pdf-pair-appendix.spec.mjs` already names.
  const hard = buildPairSemantic(pick(2), pick(6));
  assert.ok(
    (hard.facts || []).some((f) => f.id === 'p2_reframe'),
    '2x6 is a hard seat, or this fixture has stopped being the case it was chosen for',
  );
  const hardRows = factRows(hard);
  const note = hardRows.find((r) => r.note);
  assert.ok(note, 'a hard seat carries the reframe note in the table');
  assert.equal(note.meaning, reframeText, 'and it is the ruled sentence, unedited');
  assert.equal(note.term, null, 'a note has no term');

  // IT MUST SIT UNDER THE SEAT ROWS, not at the foot of the table. A note after P3
  // and P5 would be a footnote to five facts instead of a reply to two.
  const lastSeat = hardRows.map((r, i) => (r.branches ? i : -1)).filter((i) => i >= 0).pop();
  const noteAt = hardRows.indexOf(note);
  assert.ok(lastSeat >= 0 && noteAt === lastSeat + 1,
    `the note follows the last seat row (seat at ${lastSeat}, note at ${noteAt})`);

  // And a soft seat gets none of it.
  const soft = buildPairSemantic(pick(1), pick(9));
  assert.equal((soft.facts || []).some((f) => f.id === 'p2_reframe'), false, '1x9 is a soft seat');
  assert.equal(factRows(soft).some((r) => r.note), false,
    'a soft seat is not told its seat is survivable, because nobody suggested it was not');
});

// ============================================================
// AB §4, THE LAYOUT ROWS (PR 2, 2026-09-23)
// ============================================================
// Every row below was marked ok by Reyner on the P2 markup. These assert what
// each row makes OBSERVABLE, and every one of them fails on `60ab99e` (the
// inspector fix, before the layout). What they cannot see is whether the page is
// BEAUTIFUL; that is Reyner's round-1 read of the rebuilt PDFs, per AB §5. The
// measure (A12) is measured in the PR, not pinned here, for the reason the header
// of this file gives.

const docs = async () => {
  const m = await mirror();
  const c = await compat();
  return [
    { name: 'mirror', texts: pageTexts(m.buffer), buffer: m.buffer, edition: RENDER_COPY.pdfEditionMirror },
    { name: 'compat', texts: pageTexts(c.buffer), buffer: c.buffer, edition: RENDER_COPY.pdfEditionCompat },
  ];
};

test('A1 THE COVER CARRIES THE WORDMARK AND ITS RULED PRODUCT NAME', async () => {
  for (const d of await docs()) {
    const lines = d.texts[0].split('\n').map((l) => l.trim());
    assert.equal(lines[0], 'KATON', `${d.name}: the cover does not open on the wordmark`);
    // The eyebrow is set `textTransform: uppercase`, so it extracts in capitals.
    assert.ok(lines.includes(d.edition.toUpperCase()), `${d.name}: no "${d.edition}" eyebrow on the cover`);
  }
});

test('A2 NO COVER PRINTS AN ISO DATE OR AN ENGLISH GENDER WORD', async () => {
  for (const d of await docs()) {
    const cover = d.texts[0];
    assert.equal(/\d{4}-\d{2}-\d{2}/u.test(cover), false, `${d.name}: ISO date on the cover`);
    assert.equal(/\b(female|male)\b/u.test(cover), false, `${d.name}: English gender word on the cover`);
  }
  // ~~And the compat cover names the pair exactly as the web report's header does
  // (`pairLine`).~~ SUPERSEDED 2026-09-24 by round-1 markup R3: both covers print
  // `birthSummary` unchanged, one line per person - asserted positively by R3 below.
});

test('B2 EVERY PAGE AFTER THE COVER CARRIES THE RUNNING FOOTER, and the cover does not', async () => {
  for (const d of await docs()) {
    const footer = `Katon - ${d.edition}`;
    assert.equal(d.texts[0].includes(footer), false, `${d.name}: the cover carries the footer`);
    d.texts.slice(1).forEach((t, i) => {
      assert.ok(t.includes(footer), `${d.name}: page ${i + 2} has no running footer`);
    });
  }
});

test('A11 THE DISCLAIMER IS ON THE COVER AND ON NO OTHER PAGE', async () => {
  for (const d of await docs()) {
    const hits = d.texts.map((t, i) => (t.includes(RENDER_COPY.pdfDisclaimer) ? i + 1 : null)).filter(Boolean);
    assert.deepEqual(hits, [1], `${d.name}: the disclaimer is on page(s) ${hits.join(', ')}`);
  }
});

test('C5 BOTH COMPAT CHARTS SHARE ONE PAGE', async () => {
  const [, c] = await docs();
  const both = c.texts.filter((t) => t.includes(PASANGAN_COPY.pdf_chart_a_heading)
    && t.includes(PASANGAN_COPY.pdf_chart_b_heading));
  assert.equal(both.length, 1, 'the two chart blocks are not on one page');
});

test('A10 THE ELEMENTS ARE BARS, NOT A "Kayu: 0" LIST', async () => {
  for (const d of await docs()) {
    const listed = d.texts.join('\n').split('\n').filter((l) => /^(Kayu|Api|Tanah|Logam|Air): /u.test(l.trim()));
    assert.deepEqual(listed, [], `${d.name}: the element presence still prints as a list`);
  }
});

test('C3 A BRANCH AND ITS ANIMAL SIT ON ONE LINE in the facts table', async () => {
  const c = await compat();
  const texts = pageTexts(c.buffer);
  const page = texts.findIndex((t) => t.includes(PASANGAN_COPY.pdf_facts_heading));
  const runs = textBoxes(c.buffer)[page];
  const p2 = c.semanticJson.facts.find((f) => f.id === 'p2_day_pair');
  const branch = p2.provenance.a_branch;
  const animal = GLOSSARY.shio[branch].name_id;
  const han = runs.find((r) => r.text.trim() === branch);
  const name = runs.find((r) => r.text.trim() === animal && han && Math.abs(r.x - han.x) < 40);
  assert.ok(han && name, `precondition: ${branch} and ${animal} are both drawn on the facts page`);
  assert.ok(Math.abs(han.y - name.y) < 2, `${branch} at y=${han.y} and ${animal} at y=${name.y} are stacked, not one line`);
});

test('A8 THE APPENDIX TERM COLUMN IS 150pt, the meaning takes the rest', async () => {
  const m = await mirror();
  const texts = pageTexts(m.buffer);
  const page = texts.findIndex((t) => t.includes('Istilah dalam Bacaanmu'));
  const runs = textBoxes(m.buffer)[page];
  // The first named entry and its meaning: the term, then the run to its right on
  // the same baseline.
  const term = runs.find((r) => r.text.trim() === 'Aspek Pengelola');
  const meaning = runs.find((r) => term && Math.abs(r.y - term.y) < 2 && r.x > term.x + 20);
  assert.ok(term && meaning, 'precondition: a term and its meaning share a row');
  assert.equal(Math.round(meaning.x - term.x), 150, `the meaning starts ${meaning.x - term.x}pt after the term`);
});

// ── R1 (round-1 markup, 2026-09-24): a glossary row never breaks ──
// The #126 orphan/widow assertion (A5) measured PROSE paragraphs; it could not see a
// two-column table row, and passed on a PDF with `Lemah` alone at the foot of p7
// and its meaning on p8. `glossarySplits` reads the appendix pages themselves.

test('R1 NO GLOSSARY ROW BREAKS ACROSS A PAGE, and no group heading is left at a foot', async () => {
  for (const [name, build] of [['mirror', mirror], ['compat', compat]]) {
    const { buffer } = await build();
    assert.deepEqual(glossarySplits(buffer), [], `${name}: a glossary row or heading breaks across a page`);
  }
});

// ── R2 = A (round-1 markup, 2026-09-24): the compat glossary is the READER's ──
// The legend merged both charts' terms, and every per-chart entry is second-person
// mirror text - so the partner's terms were told to the buyer as facts about HER
// (`Seimbang`: "Baganmu berdiri di titik tengah yang stabil" to a reader who is
// Lemah one row above). Ruled A: Kompatibilitas + the reader's own chart terms +
// Shio. Terms found only in the partner's chart are dropped.

/** The terms the appendix PRINTS, read off its term column. */
function printedTerms(buffer) {
  const texts = pageTexts(buffer);
  const start = texts.findIndex((t) => t.includes('Istilah dalam Bacaanmu'));
  return textBoxes(buffer).slice(start)
    .flatMap((runs) => runs.filter((r) => r.size === 10 && r.x < 150).map((r) => r.text.trim()));
}

test('R2 THE COMPAT GLOSSARY CARRIES NO TERM FROM THE PARTNER\'S CHART ALONE, and all of the reader\'s', async () => {
  const c = await compat();
  const printed = new Set(printedTerms(c.buffer));
  // The eight partner-only terms Cowork found on the round-1 PDF, by name.
  for (const t of ['Seimbang', 'Dominan Tanah', 'Tanah', 'Ikatan', 'Aspek Pendorong',
    'Aspek Pelindung', 'Mata Pisau', 'Bintang Perantau']) {
    assert.equal(printed.has(t), false, `the partner's "${t}" is told to the reader`);
  }
  // BOTH WAYS: every term of the reader's own chart is still there, and the
  // Kompatibilitas group, and the partner's Shio (neutral text, and his branches
  // print in the facts table).
  const own = buildAppendix({ chart: c.chartA, semanticJson: buildSemanticJson(c.chartA) });
  for (const g of own.groups) {
    for (const e of g.entries) if (e.name) assert.ok(printed.has(e.name), `the reader's "${e.name}" (${g.group}) is missing`);
  }
  for (const name of ['Kursi Independen', 'Kuda', 'Naga']) {
    assert.ok(printed.has(name), `"${name}" is missing`);
  }
});

// ── R3 (round-1 markup, 2026-09-24): A2 applied the same way on both covers ──
// A2 ruled the stepper's own `birthSummary` form for the covers. The mirror printed
// it without the gender (the chart does not carry one) and the compat printed
// `pairLine` - full months, gender first. Both now print `birthSummary` output
// UNCHANGED, gender included; the compat one line per person, reader first.

test('R3 BOTH COVERS PRINT birthSummary UNCHANGED, gender included, one line per person', async () => {
  const [m, c] = await docs();
  const lines = (t) => t.split('\n').map((l) => l.trim());
  // Read with runs joined: react-pdf may split a line into runs at a digit.
  const joined = (t) => t.replace(/\s*\n\s*/gu, ' ');
  assert.ok(joined(m.texts[0]).includes('13 Sep 1989, 09.00, Perempuan'),
    `mirror cover: ${JSON.stringify(lines(m.texts[0]))}`);
  const cover = joined(c.texts[0]);
  assert.ok(cover.includes('13 Sep 1989, 09.00, Perempuan'), `compat cover, reader: ${cover}`);
  assert.ok(cover.includes('4 Mar 1990, 14.00, Laki-laki'), `compat cover, partner: ${cover}`);
  assert.equal(cover.includes(' dan Laki-laki'), false, 'the two people are not joined into one pairLine sentence');
  assert.ok(cover.indexOf('13 Sep 1989') < cover.indexOf('4 Mar 1990'), 'the reader comes first');
});

// ── R4 (round-1 markup, 2026-09-24): Indonesian decimals on the bars ──
test('R4 THE ELEMENT VALUES USE A DECIMAL COMMA (27,5), never a point', async () => {
  const [m] = await docs();
  const chartPage = m.texts.find((t) => t.includes('Sebaran Unsur'));
  const values = chartPage.split('\n').map((l) => l.trim()).filter((l) => /^\d+([.,]\d+)?$/u.test(l));
  assert.ok(values.length >= 5, `precondition: five values on the chart page, got ${JSON.stringify(values)}`);
  assert.deepEqual(values.filter((v) => v.includes('.')), [], 'a decimal point on an Indonesian page');
  assert.ok(values.includes('27,5'), `Api's 27.5 prints as 27,5: ${JSON.stringify(values)}`);
});
