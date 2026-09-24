// ============================================================
// The compat PDF — the document, through the real builder
// ============================================================
// Run: npm run test:pdf-pair-document
//
// Prompt Y-3 commit 3. Two pairs, both built by `buildPairPdf` - so the fixed
// point, the three verifies and the refusals are all exercised rather than
// described. No network and no provider: the reading is the deterministic floor,
// which is byte-stable, so a layout assertion cannot fail because a model wrote a
// different sentence today.
//
// NOTE: runs under PLAIN node, deliberately NOT `--conditions=react-server`, for
// `tests/pdf-document.spec.mjs`'s reason - @react-pdf/renderer needs the client
// React build.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { RENDER_COPY } from '../lib/render/copy.js';
import { buildPairPdf } from '../lib/pdf/build.js';
import { factRows } from '../lib/pdf/pairDocument.js';
import { REF_PREFIX } from '../lib/pdf/document.js';
import { APPENDIX_HEADING } from '../lib/pdf/build.js';
import { PASANGAN_COPY } from '../lib/site/copy.js';
import {
  drawnCodePoints, pageTexts, textBoxes, collisions,
} from '../lib/pdf/inspect.js';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';
import GLOSSARY from '../docs/content/glossary.json' with { type: 'json' };
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

const PAIRS = {
  'Y-1 fixture': {
    a: calculateBaziChart({ birthDate: '1989-09-13', birthTime: null }),
    b: calculateBaziChart({ birthDate: '1997-09-14', birthTime: null }),
    pair: { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1997-09-14', gender: 'female' } },
  },
  '2x6': {
    a: chartOf(2),
    b: chartOf(6),
    pair: { a: { date: '1990-03-04', gender: 'female' }, b: { date: '1989-03-03', gender: 'male' } },
  },
};

/** One build per pair, reused across assertions - a PDF build is ~1s. */
const built = new Map();
async function build(name) {
  if (built.has(name)) return built.get(name);
  const { a, b, pair } = PAIRS[name];
  const semanticJson = buildPairSemantic(a, b);
  const rendered = {
    ...assembleFallback(semanticJson),
    prompt_version: 'testprompt00',
    stage6_version: '1.25.0',
  };
  const out = await buildPairPdf({
    chartA: a, chartB: b, semanticJson, rendered, pair,
  });
  const result = {
    ...out, a, b, pair, semanticJson, rendered, texts: pageTexts(out.buffer),
  };
  built.set(name, result);
  return result;
}

/** Page text carries the LAYOUT's line breaks; a sentence does not. */
const flat = (t) => t.replace(/\s+/gu, ' ').trim();
const names = Object.keys(PAIRS);

test('THE PDF AUTHORS NOTHING: every block is the cached prose, ON THE READING PAGE', async () => {
  // ── SCOPED TO THE READING PAGE, AND THE FIRST VERSION WAS NOT ──
  // It searched the whole document and PASSED with the last block deleted from the
  // reading page. The reason is specific to this fixture and worth knowing: the
  // FLOOR assembles its blocks out of the glossary's `label_meaning`s, and the facts
  // table prints those same ruled meanings - so every block's text appears twice in
  // a floored document and the check was satisfied by the copy on the facts page.
  //
  // In production the two differ (the reading is model prose, the table is the ruled
  // meaning) and the PDF never serves a floor at all - rule 16 does not persist one
  // and the route answers 409. So the duplication is a property of the fixture, not
  // of the product; the assertion is narrowed because a check that a fixture quirk
  // can satisfy is not a check.
  for (const name of names) {
    const { texts, rendered } = await build(name);
    const readingPage = flat(texts[1]);
    for (const [i, b] of (rendered.blocks || []).entries()) {
      if (!b.text) continue;
      assert.ok(readingPage.includes(flat(b.text)),
        `${name}: block ${i} (${(b.fact_ids || []).join('+')}) is not on the reading page verbatim`);
    }
    // The floor's penutup is the empty string, so this guards the MODEL path only
    // and is stated as such rather than left looking like coverage it does not have.
    if (rendered.penutup) {
      assert.ok(readingPage.includes(flat(rendered.penutup)), `${name}: penutup missing`);
    }
  }
});

test('the engine P0 sentence is on the reading page, ONCE', async () => {
  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const a = semanticJson.core.a.archetype_name_id;
    const b = semanticJson.core.b.archetype_name_id;
    const sentence = `Ini adalah bacaan tentang dua individu: ${a} dan ${b}.`;
    const hits = texts.filter((t) => flat(t).includes(sentence));
    assert.equal(hits.length, 1, `${name}: the opening appears on ${hits.length} pages, want 1`);
    // ── IT IS THE SUB-LINE NOW, NOT THE FIRST LINE. C1, 2026-09-22. ──
    // This asserted that the reading page STARTS with the P0 sentence. On the real
    // PDF that meant a body-size sentence outranked the quadrant headline, so the
    // page opened with its second-most-important line (P2 markup C1, marked ok).
    //
    // WHAT THE 2026-09-14 RULING PROTECTED IS UNCHANGED: the engine's P0 sentence
    // is still on the page, still engine-owned, and still there exactly ONCE -
    // which is the assertion above and the one that ever caught anything. Only its
    // position moved, and the negative below pins that it really did move rather
    // than the test being loosened.
    const page = flat(texts[1]);
    assert.ok(page.includes(sentence), `${name}: the P0 sentence left the reading page`);
    assert.equal(page.startsWith(sentence), false,
      `${name}: P0 is the sub-line now - the quadrant title leads (C1)`);
  }
});

test('EVERY PILLAR CHARACTER OF BOTH CHARTS IS ACTUALLY DRAWN', async () => {
  for (const name of names) {
    const { buffer, a, b } = await build(name);
    // `drawnCodePoints` RETURNS CODE POINTS, NOT CHARACTERS, and comparing the two
    // is how the first version of this reported every glyph missing - on the MIRROR
    // as well, which is what showed it was the instrument and not the document.
    const drawn = drawnCodePoints(buffer);
    const want = [];
    for (const chart of [a, b]) {
      for (const k of ['year', 'month', 'day', 'hour']) {
        const p = chart[k];
        if (p) want.push(p.stem, p.branch);
      }
    }
    assert.ok(want.length >= 12, `${name}: expected at least six pillars across the two charts`);
    const missing = want.filter((c) => !drawn.has(c.codePointAt(0)));
    assert.deepEqual(missing, [], `${name}: not drawn - ${missing.join('')}`);
  }
});

test('NO RAW KEY REACHES THE PAGE - the 2026-09-08 defect, in its next consumer', async () => {
  // `contrasting` and `q4` reached a reader who had paid Rp 39.000 because a payload
  // field carried a key and the component printed it. `lib/pair/serveReading.js` says
  // the PDF is the next consumer that could make the mistake independently; this is
  // the assertion that says it did not.
  const compatKeys = Object.keys(GLOSSARY.kompatibilitas).filter((k) => !k.startsWith('_'));
  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const all = texts.join('\n');
    for (const key of compatKeys) {
      assert.equal(all.includes(key), false, `${name}: the cell KEY "${key}" is on the page`);
    }
    for (const q of ['q1', 'q2', 'q3', 'q4']) {
      assert.equal(all.includes(q), false, `${name}: the quadrant key "${q}" is on the page`);
    }
    const cycle = semanticJson.facts.find((f) => f.id === 'p1_stem_relation')?.provenance?.cycle;
    assert.ok(cycle, `${name}: precondition - the engine resolved a cycle, so hiding it is a choice`);
    assert.equal(all.includes(cycle), false, `${name}: the cycle key "${cycle}" is on the page`);
    // And the p4 pattern key, which is the OTHER half of the 09-08 pair.
    const pattern = semanticJson.core.pattern;
    assert.equal(all.includes(pattern), false, `${name}: the pattern key "${pattern}" is on the page`);
  }
});

test('RULE 25: no score, no axis number, no verdict word in the table or the chrome', async () => {
  const verdict = (BLOCKLIST.verdict?.patterns || [])
    .map((e) => ({ regex: new RegExp(e.pattern, e.flags || 'iu'), source: e.pattern }));
  assert.ok(verdict.length >= 3, 'precondition: the verdict patterns exist to run');

  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const all = texts.join('\n');
    for (const { regex, source } of verdict) {
      const hit = regex.exec(all);
      assert.equal(hit, null, `${name}: /${source}/ matched "${hit?.[0]}"`);
    }
    // The engine HANDS US the ammunition, so its absence is a decision and is
    // asserted as one: p5 carries pull/fit and p3 carries a presence percentage.
    const p5 = semanticJson.facts.find((f) => f.id === 'p5_pull_fit');
    assert.ok(p5.provenance.pull && p5.provenance.fit, 'precondition: the axes exist');
    for (const word of [p5.provenance.pull, p5.provenance.fit]) {
      // `high`/`low` as standalone tokens. A substring test would fire on ordinary
      // words, which is the broken-check shape this repo keeps paying for.
      assert.equal(new RegExp(`\\b${word}\\b`, 'iu').test(all), false,
        `${name}: the ${word} axis value is on the page`);
    }
    const percents = (semanticJson.facts.find((f) => f.id === 'p3_supply')?.provenance?.supplies || [])
      .map((s) => s.supplier_presence_percent).filter((n) => typeof n === 'number');
    for (const pct of percents) {
      assert.equal(all.includes(`${pct}%`), false, `${name}: a supply percentage reached the page`);
    }
  }
});

test('RULE 20: no em-dash, no curly quotes, no question mark', async () => {
  for (const name of names) {
    const { texts } = await build(name);
    const all = texts.join('\n');
    for (const [label, ch] of [['em-dash', '—'], ['en-dash', '–'],
      ['curly quote', '‘'], ['curly quote', '’'],
      ['curly quote', '“'], ['curly quote', '”'],
      ['ellipsis', '…']]) {
      assert.equal(all.includes(ch), false, `${name}: ${label} in the document`);
    }
    assert.equal(all.includes('?'), false, `${name}: a question mark (rule 20)`);
  }
});

test('NO @@UNRULED REACHES A PAGE - amendment i closed the last four', async () => {
  // Y-3's proof list said exactly this, and it is the sentence it was always going
  // to become. While commit 4 was open this asserted the sentinels present were
  // EXACTLY the four held slots, hard-coded rather than derived from the bank - a
  // derived list would have passed for any bank state. Reyner ruled all five on
  // 2026-09-14, so the exception is gone and the check is the flat one.
  for (const name of names) {
    const { texts } = await build(name);
    // Whitespace is still stripped before the scan: the extractor breaks inside a
    // long unbroken token, which is how `@@UNRULED: pdf_chart_a_heading@@` came back
    // as two lines. A sentinel that reappears must not hide in a line break.
    const all = texts.join('\n').replace(/\s+/gu, '');
    const found = [...all.matchAll(/@@UNRULED:([a-z_]+)@@/g)].map((m) => m[1]);
    assert.deepEqual([...new Set(found)].sort(), [],
      `${name}: an unruled sentinel is printed in a paid document`);
  }

  // AND THE RULED WORDS ARE ACTUALLY ON THE PAGES, which the absence check cannot
  // say: a document that printed nothing at all would satisfy it.
  const { texts } = await build('Y-1 fixture');
  const flatAll = texts.join('\n').replace(/\s+/gu, ' ');
  for (const slot of ['pdf_cover_sub', 'pdf_chart_a_heading', 'pdf_chart_b_heading', 'pdf_facts_heading']) {
    assert.ok(flatAll.includes(PASANGAN_COPY[slot].replace(/\s+/gu, ' ')),
      `${slot} is ruled but not drawn`);
  }
});

test('the fixed point converges and all three verifies pass, for BOTH pairs', async () => {
  for (const name of names) {
    const { report, pageMap, texts } = await build(name);
    // Reaching here at all means `buildPdf` did not throw, which IS the three
    // verifies. What is asserted here is the shape of what it reported.
    // ── INVERTED FOR R6, 2026-09-14 ────────────────────────────
    // This asserted `rebuilds >= 1` and `referenced > 0` - a document with
    // references cannot settle on pass 1, because pass 1 prints from `{}`. Reyner
    // ruled the references out, so the true statement is the opposite one, and it is
    // asserted rather than the old line being deleted: the machinery has to go QUIET,
    // not merely pass.
    assert.equal(report.rebuilds, 0, `${name}: nothing is referenced, so nothing to resolve`);
    assert.equal(report.referenced, 0, `${name}: something is still referenced`);
    assert.deepEqual(pageMap, {}, `${name}: a map was resolved for nothing`);
    // ONE PAGE PER SECTION, not a page count (AB §5: page count is a consequence).
    // It was `>= 8` while each chart had a page of its own; C5 stacks them on one.
    // Cover, reading, charts, facts, appendix.
    assert.ok(report.pages >= 5, `${name}: ${report.pages} pages, fewer than the five sections need`);
    assert.ok(report.appendixStart > 1 && report.appendixStart <= report.pages);
    assert.equal(texts.length, report.pages);
    assert.ok(flat(texts[report.appendixStart - 1]).includes(APPENDIX_HEADING));
  }
});

test('NO PAGE CARRIES A REFERENCE LIST, on either pair', () => {
  // ── REPLACES "every reference row is DRAWN, from all three lists" ──
  // The compat document had THREE reference lists - chart A's, chart B's and the
  // facts page's - and that test walked each one asserting every row was drawn on
  // its own page. R6 removed the feature, so the test inverts: the lists must be
  // absent from all three pages, not merely absent from the document as a whole.
  // Kept per-page rather than folded into the document-wide `hal. ` scan above,
  // because three lists disappearing is three things to check.
  const HEADING = 'Yang ada di baganmu';
  for (const name of names) {
    for (const slot of ['pdf_chart_a_heading', 'pdf_chart_b_heading', 'pdf_facts_heading']) {
      const { texts } = built.get(name) || {};
      if (!texts) continue;
      const page = texts.find((t) => t.replace(/\s+/gu, '')
        .includes(PASANGAN_COPY[slot].replace(/\s+/gu, '')));
      assert.ok(page, `${name}: no page carries ${slot}`);
      assert.equal(page.includes(HEADING), false, `${name}: ${slot} still lists references`);
      assert.equal(page.includes(REF_PREFIX), false, `${name}: ${slot} still prints a page number`);
    }
  }
});

test('THE FACTS TABLE DRAWS ITS BRANCH HANZI IN THE HAN FAMILY, not the Latin one', async () => {
  // A branch character set in a Latin-family `Text` is SUBSTITUTED by react-pdf: it
  // renders as a wrong glyph or a tofu, and the first draft of this table did
  // exactly that. `drawnCodePoints` cannot see it - the same characters are drawn
  // correctly on the chart pages and that instrument is document-wide - and
  // `inspect.js` has no per-page, per-font view to ask instead.
  //
  // SO THIS ASSERTS THE OBSERVABLE TELL, and the tell is exact: the extractor maps a
  // han codepoint drawn in the Latin font to whatever Latin glyph shares that index,
  // which came back as a LONE ONE-CHARACTER LINE (`P`, then `*`) where 子 and 未
  // belong. Text drawn in the han family is not extracted at all, so the correct
  // document has no such line. Nothing legitimate on this page is one character
  // long - the columns hold element names, Aspek names and shio names.
  //
  // IT IS A NARROWER CHECK THAN THE DEFECT, and that is stated rather than implied:
  // it would miss a substitution that happened to map to a multi-character run. The
  // check that would not is a per-page font attribution, which `inspect.js` does not
  // have and which this commit is not the place to build.
  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const p2 = semanticJson.facts.find((f) => f.id === 'p2_day_pair');
    assert.ok(p2?.provenance?.a_branch, `${name}: precondition - the table has a branch row`);

    const page = texts.find((t) => t.replace(/\s+/gu, '')
      .includes(PASANGAN_COPY.pdf_facts_heading.replace(/\s+/gu, '')));
    assert.ok(page, `${name}: no facts page`);
    // ── THE TELL NARROWED, AND A POSITIVE CHECK ADDED (2026-09-23) ──
    // `pageTexts` now DECODES the han face through its ToUnicode CMap, so a
    // correctly drawn 子 is a legitimate lone line and the tell is a lone line that
    // is NOT a Han character - which is exactly what a substitution produced (`P`,
    // `*`). And because the han face is visible now, the branch itself can be
    // asserted PRESENT, which the old instrument could not do at all.
    const lone = page.split('\n').map((l) => l.trim())
      .filter((l) => l.length === 1 && !/\p{Script=Han}/u.test(l));
    assert.deepEqual(lone, [],
      `${name}: lone one-character line(s) on the facts page - a substituted hanzi`);
    for (const branch of [p2.provenance.a_branch, p2.provenance.b_branch]) {
      assert.ok(page.includes(branch), `${name}: ${branch} is not drawn as a character on the facts page`);
    }
    // And the pairing rule 23 requires is there: the Indonesian name beside it.
    for (const branch of [p2.provenance.a_branch, p2.provenance.b_branch]) {
      const shio = GLOSSARY.shio?.[branch]?.name_id;
      if (shio) assert.ok(page.includes(shio), `${name}: ${branch} is drawn without ${shio}`);
    }
  }
});

test('the facts table carries every fact the reading does, and no percentages', async () => {
  for (const name of names) {
    const { semanticJson, texts } = await build(name);
    const rows = factRows(semanticJson);
    assert.ok(rows.length >= 5, `${name}: ${rows.length} rows, fewer than P1..P5`);

    const all = flat(texts.join('\n'));
    for (const r of rows) {
      if (r.term) assert.ok(all.includes(r.term), `${name}: the term "${r.term}" is not printed`);
      assert.ok(all.includes(flat(r.meaning)), `${name}: a row's meaning is not printed`);
    }
    // P1's two elements are in the columns, by their glossary names.
    const p1 = semanticJson.facts.find((f) => f.id === 'p1_stem_relation');
    const row = rows.find((r) => r.anchorKey === p1.provenance.variant);
    assert.ok(row && row.a && row.b, `${name}: P1's row has no side`);
    assert.notEqual(row.a, row.b, `${name}: P1's two elements are the same string`);
    // And the direction is in the COLUMNS, so the ruled neutral sentence is printed
    // as ruled rather than rewritten.
    assert.equal(row.meaning, GLOSSARY.kompatibilitas[p1.provenance.variant].label_meaning);
  }
});

// ── THE PALACE FRAME (Reyner, 2026-09-14, ruling 1) ────────

test('A FRAME ROW SAYS WHAT THE FRAME IS, not what the day pair is', async () => {
  // Cowork read the Y-1 PDF and found a row headed `Kursi Terikat` carrying
  // `p2_harmony.label_meaning` - "kursi pasangan kalian saling mengunci" - for a
  // pair whose seats are HARMED, not locked. The frame is B's YEAR pillar touching
  // A's spouse palace; the sentence printed was about a day-pair harmony that does
  // not exist in this chart. Reyner ruled the row's shape on 2026-09-14:
  //
  //   term     the P2 relation's `name_id`, unchanged
  //   columns  the pillar that CREATES the frame, in that person's column; the
  //            spouse palace it touches (the other person's day branch) in theirs
  //   meaning  `p2_palace_frame`'s own `label_meaning`, always
  //
  // "The day-pair variant's `label_meaning` never appears in a frame row."
  const { texts, semanticJson } = await build('Y-1 fixture');
  const frame = semanticJson.facts.find((f) => f.id === 'p2_palace_frame');
  assert.ok(frame, 'precondition: Y-1 carries a palace frame');
  assert.ok(frame.provenance.variants.includes('p2_harmony'),
    'precondition: its frame relation is the 六合 that produced the wrong sentence');

  // ── SCOPED TO THE FACTS PAGE, WHICH IS WHAT THE RULING SAYS ──
  // My first draft searched the WHOLE document and stayed red after the fix. The
  // text was on page 9 - the APPENDIX, where `p2_harmony`'s legend entry carries its
  // own `label_meaning` and is supposed to ("Appendix entry for the variant
  // unchanged"). A wider assertion than the ruling would have forced me to break the
  // legend to satisfy the table.
  const K = GLOSSARY.kompatibilitas;
  const factsPage = flat(texts.find((t) => t.replace(/\s+/gu, '')
    .includes(PASANGAN_COPY.pdf_facts_heading.replace(/\s+/gu, ''))) || '');
  assert.ok(factsPage, 'no facts page');

  assert.equal(factsPage.includes(flat(K.p2_harmony.label_meaning)), false,
    'the day-pair variant\'s meaning is printed on a frame row');
  assert.ok(factsPage.includes(flat(K.p2_palace_frame.label_meaning)),
    'the frame row does not carry the frame\'s own meaning');
  // The term is still the relation's name, which is what makes the row findable
  // against the legend entry for it.
  assert.ok(factsPage.includes(K.p2_harmony.name_id), 'the relation name is gone from the row');
  // AND THE APPENDIX STILL EXPLAINS THE RELATION. Asserted, not assumed: the fix
  // must not have closed the table's gap by emptying the legend.
  assert.ok(flat(texts.join('\n')).includes(flat(K.p2_harmony.label_meaning)),
    'the variant lost its appendix entry');

  // BOTH COLUMNS CARRY A BRANCH, and the row knows it: the pillar creating the
  // frame and the spouse palace it touches. Asserted on the row DATA so a layout
  // change cannot quietly empty one side.
  const rows = factRows(semanticJson);
  const frameRow = rows.find((r) => r.anchorKey === 'p2_harmony');
  assert.ok(frameRow, 'no frame row was emitted at all');
  assert.equal(frameRow.branches, true, 'a frame row holds branch characters');
  assert.ok(frameRow.a && frameRow.b, 'a frame row must name both sides');
  // ── THE MEANING MOVED OFF THE ROW. C2, 2026-09-22. ──────
  // This asserted `frameRow.meaning === K.p2_palace_frame.label_meaning`, which was
  // right under the 2026-09-14 ruling and printed the same sentence on every frame
  // row - so a buyer read it three times in her own data table and the product
  // looked like it was contradicting itself (P2 markup C2, marked ok).
  //
  // THE 2026-09-14 RULING IS NOT REVERSED, and that is the distinction this block
  // exists to keep. It says the DAY-PAIR variant's meaning must never appear on a
  // frame row; it still does not, and the assertion above still checks it. What
  // changed is that the frame's own sentence is now printed ONCE as the frame
  // group's lead line instead of once per row. Same ruled words, one appearance -
  // asserted on the facts page above, and here as an absence from the row.
  assert.equal(frameRow.meaning, '',
    'a frame row carries no meaning cell - the group lead line says it once (C2)');
  // Y-1: B's YEAR 丑 reaches A's spouse palace 子.
  assert.equal(frameRow.a, '子');
  assert.equal(frameRow.b, '丑');
});

// ── THE COVER (Reyner, 2026-09-14, ruling 2) ───────────────

test('THE COVER LEADS WITH THE INDONESIAN NAMES, English once underneath', async () => {
  // ── REVERSED 2026-09-22 (P2 markup A3, Reyner "ok") ──────────
  // Was the 2026-09-14 ruling 2, English first. Rule 23: Indonesian first, English
  // pair once. `tests/pdf-document.spec.mjs` asserts the mirror's half.
  //
  // THE SEPARATOR STAYS ` - `. Reyner's example wrote "The Sun · The Garden" with a
  // middle dot; rule 20 is keyboard characters only, and `·` is not one. Read as an
  // illustration of the CONTENT (both English names, English first) rather than a
  // ruling on the separator, so the existing keyboard hyphen is kept and the
  // question is flagged rather than decided silently.
  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const cover = texts[0].split('\n').map((l) => l.trim()).filter(Boolean);
    const a = semanticJson.core.a;
    const b = semanticJson.core.b;

    const at = cover.indexOf(`${a.archetype_name_id} dan ${b.archetype_name_id}`);
    assert.ok(at > -1, `${name}: the Indonesian pair is not a title line on the cover`);
    assert.equal(cover[at + 1], `${a.archetype_name_en} - ${b.archetype_name_en}`,
      `${name}: the English pair is not the line directly under it`);
    // ORDER IS THE ASSERTION, not mere presence: both strings were on the cover
    // before this ruling too, the other way round.
    assert.ok(texts[0].indexOf(a.archetype_name_id) < texts[0].indexOf(a.archetype_name_en),
      `${name}: the English name still comes first`);
  }
});

test('THE DOCUMENT METADATA TITLE IS UNCHANGED by the cover ruling', async () => {
  // Explicitly ruled: the cover flips, the metadata does not. It is the filename a
  // reader sees in a PDF viewer's tab and in her downloads folder, and it is
  // Indonesian because the document is.
  for (const name of names) {
    const { buffer, semanticJson } = await build(name);
    const want = `Katon - ${semanticJson.core.a.archetype_name_id} dan ${semanticJson.core.b.archetype_name_id}`;
    assert.ok(buffer.toString('latin1').includes(want)
      || buffer.toString('utf16le').includes(want)
      || buffer.includes(Buffer.from(want, 'utf8')),
    `${name}: the metadata title is not "${want}"`);
  }
});

// ── NOTHING OVERLAPS (Reyner, 2026-09-14, ruling 3) ────────

test('NO TEXT IS DRAWN ON TOP OF OTHER TEXT, on any page of either pair', async () => {
  // The compat half of ruling 3; `tests/pdf-document.spec.mjs` carries the mirror's
  // and the full explanation of the cause and of the instrument that was blind.
  // Both documents share `PDF_STYLES`, so both showed the same two collisions: a
  // 34pt cover title with 4.7pt of room, and 26pt pillar characters with 17.4pt -
  // which is the animal name printed over the hanzi.
  for (const name of names) {
    const { buffer } = await build(name);
    const pages = textBoxes(buffer);
    assert.ok(pages.some((p) => p.length > 5), `${name}: the parser found no runs to check`);
    for (const [i, runs] of pages.entries()) {
      const hits = collisions(runs);
      assert.deepEqual(hits.map((h) => `"${h.a.text.slice(0, 18)}"(${h.a.size}) over `
        + `"${h.b.text.slice(0, 18)}"(${h.b.size}) gap ${h.gap}, needs ${h.need}`), [],
      `${name} page ${i + 1}`);
    }
  }
});

// ── NO CROSS-REFERENCES (Reyner, 2026-09-14, R6) ───────────

test('NOT ONE `hal. N` SURVIVES on either pair, and the fixed point is quiet', async () => {
  // The compat half of R6; `tests/pdf-document.spec.mjs` carries the mirror's and
  // the reasoning. Three reference lists went - chart A's, chart B's and the facts
  // page's - so this is the document that had the most of them.
  for (const name of names) {
    const { texts, pageMap, report } = await build(name);
    for (const [i, t] of texts.entries()) {
      assert.equal(t.includes(REF_PREFIX), false,
        `${name} page ${i + 1} still prints a "${REF_PREFIX}" reference`);
    }
    assert.equal(texts.join('\n').includes('Yang ada di baganmu'), false,
      `${name}: the reference list heading survives`);
    assert.equal(report.rebuilds, 0, `${name}: the fixed point still spent a rebuild`);
    assert.equal(report.referenced, 0, `${name}: something is still referenced`);
    assert.deepEqual(pageMap, {}, `${name}: a page map was resolved for nothing`);
  }
});

// ── THE FACTS PAGE AND THE TITLE LINE (R-Y4, 2026-09-14) ───

test('THE TWO SUPPLY ROWS ARE ONE ROW, both columns filled, meaning printed once', async () => {
  // Y-4 commit 3. P3 emitted one row PER SUPPLY, so a pair where each gives the
  // other an element got two rows both headed `Penyeimbang Unsur` carrying the same
  // sentence - the table saying one thing twice. One row, both columns, one meaning.
  for (const name of names) {
    const { semanticJson, texts } = await build(name);
    const supplies = semanticJson.facts
      .find((f) => f.id === 'p3_supply')?.provenance?.supplies || [];
    if (supplies.length < 2) continue;

    const rows = factRows(semanticJson).filter((r) => r.anchorKey === 'p3_supplies');
    assert.equal(rows.length, 1, `${name}: ${rows.length} supply rows, want 1`);
    assert.ok(rows[0].a && rows[0].b, `${name}: a two-way supply must fill both columns`);

    // AND THE SENTENCE IS PRINTED ONCE. The row count above is the data; this is
    // the artifact, and it is the half a reader would actually notice.
    const facts = texts.find((t) => t.replace(/\s+/gu, '')
      .includes(PASANGAN_COPY.pdf_facts_heading.replace(/\s+/gu, '')));
    const meaning = rows[0].meaning.replace(/\s+/gu, ' ');
    const hits = facts.replace(/\s+/gu, ' ').split(meaning).length - 1;
    assert.equal(hits, 1, `${name}: the supply meaning is printed ${hits} times`);
  }
});

test('THE QUADRANT NAME IS THE READING\'S TITLE LINE, after the P0 sentence', async () => {
  // Y-4 commit 3: the engine already decides the quadrant, so naming it at the top
  // of the reading is STRUCTURE (rule 14) rather than a new claim - no new string,
  // no verdict word, just the `name_id` the glossary already rules.
  for (const name of names) {
    const { texts, semanticJson } = await build(name);
    const q = semanticJson.core.quadrant;
    const title = GLOSSARY.kompatibilitas[`p5_${q}`].name_id;
    // The running footer (B2) is drawn first on every page; it is chrome, not the
    // reading, so it is not one of the reading's lines.
    const footer = `Katon - ${RENDER_COPY.pdfEditionCompat}`;
    const lines = texts[1].split('\n').map((l) => l.trim()).filter((l) => l && l !== footer);

    const a = semanticJson.core.a.archetype_name_id;
    const b = semanticJson.core.b.archetype_name_id;
    // ── THE ORDER IS REVERSED, RULED 2026-09-22 (P2 markup C1) ──
    // Was: P0 sentence on line 1, quadrant title on line 2. A body-size sentence
    // standing above the headline is the defect Reyner marked ok to fix - the
    // headline leads and the sentence explains it, which is the order every other
    // page of this document already uses.
    assert.equal(lines[0], title, `${name}: the quadrant title does not lead the reading`);
    assert.equal(lines[1], `Ini adalah bacaan tentang dua individu: ${a} dan ${b}.`,
      `${name}: the P0 sentence is not the line under the title`);
    // ONCE on that page: it is a title, and the P5 block names it again lower down
    // only if the model wrote it, which is not this assertion's business.
    assert.equal(lines.filter((l) => l === title).length, 1,
      `${name}: the title line is repeated on the reading page`);
  }
});
