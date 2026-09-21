// ============================================================
// The Complete Edition PDF — font path, round trip, and the two corrections
// ============================================================
// Run: npm run test:pdf-document
//
// No network and no provider. The reading is the deterministic floor, which is the
// right fixture here for the same reason it is the wrong thing to SHIP unlabelled:
// it is byte-stable, so a layout assertion cannot fail because a model wrote a
// different sentence today.
//
// NOTE: runs under PLAIN node, deliberately NOT `--conditions=react-server`.
// @react-pdf/renderer needs the client React build; under that condition React
// resolves to its react-server entry and the reconciler dies with "Cannot read
// properties of undefined (reading 'S')". Nothing here imports a `server-only`
// module, which is what makes that possible. See scripts/build-pdf.mjs.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { renderToBuffer } from '@react-pdf/renderer';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import {
  buildAppendix, assertEveryMechanicExplained, anchorId, anchorIds, GROUP_ORDER,
} from '../lib/pdf/appendix.js';
import {
  completeEdition, readingOnly, glyphProof, REF_PREFIX,
} from '../lib/pdf/document.js';
import {
  buildCompleteEditionPdf, verifyReferences, APPENDIX_HEADING, CHART_HEADING,
} from '../lib/pdf/build.js';
import { HAN_GLYPHS } from '../lib/card/hanFont.js';
import {
  registerPdfFonts, __resetPdfFonts, CANARY, FAMILY_HAN,
} from '../lib/pdf/fonts.js';
import {
  roundTrip, drawnCodePoints, embeddedFonts, latinText, pageTexts, pageObjectOrder,
  namedDestinationPages, textBoxes, collisions,
} from '../lib/pdf/inspect.js';

const CHARTS = {
  'chart 1': { date: '1989-09-13', time: '09:00' },
  // The 立春 boundary chart, and one with a DIFFERENT condition set.
  'chart 13': { date: '1989-02-04', time: '04:00' },
  hourless: { date: '1989-02-04', time: null },
};

function fixture(which) {
  const { date, time } = CHARTS[which];
  const chart = calculateBaziChart({ birthDate: date, birthTime: time });
  const semanticJson = buildSemanticJson(chart);
  const rendered = {
    ...assembleFallback(semanticJson),
    prompt_version: 'testprompt00',
    stage6_version: '1.17.0',
  };
  return { chart, semanticJson, rendered };
}

// ── build step 2: registration ──

test('registerPdfFonts verifies the subset BEFORE registering, and is idempotent', () => {
  __resetPdfFonts();
  const first = registerPdfFonts();
  assert.equal(first.family, FAMILY_HAN);
  assert.ok(first.glyphs >= 60, 'the full ~65 subset, not a stub');
  // Idempotent because registration is a side effect on a module-level singleton and
  // a script, a route and this test can all reach it in one process.
  assert.deepEqual(registerPdfFonts(), first);
});

// ── build step 2: one page, and the 申 round trip ──

test('THE 申 ROUND TRIP: every subset glyph survives INTO a PDF, canary included', async () => {
  // The property that matters is not "it rendered". Tofu does not throw - the build
  // reports success, the file opens, and the pillar cells are empty boxes. So this
  // opens the artifact.
  //
  // IT ASKS A DOCUMENT THAT ACTUALLY DRAWS 申, and the first version of this did not.
  // 申 is the Monkey branch; chart 1 draws 己巳癸酉丙子甲 and no 申 at all, so asking
  // a chart-1 PDF whether 申 survived is asking about something absent. It "passed"
  // anyway, because the CMap parser was over-expanding ranges - a verifier wrong in
  // the PERMISSIVE direction, which is worse than no verifier. `glyphProof` draws
  // the whole subset so the question has a document that can answer it.
  const buf = await renderToBuffer(glyphProof({ chars: [...HAN_GLYPHS] }));

  const drawn = drawnCodePoints(buf);
  assert.ok(drawn.has(CANARY.codePointAt(0)),
    `${CANARY} is not in the document's ToUnicode map - this is the tofu case`);
  const missing = [...HAN_GLYPHS].filter((c) => !drawn.has(c.codePointAt(0)));
  assert.deepEqual(missing, [], `the subset registered and these did not reach the PDF: ${missing.join('')}`);

  // ENCODED is only half of it. An outline has to be embedded to draw it with, and
  // `glyf` is where outlines live. More than one glyph means it is not a lone
  // .notdef.
  const fonts = embeddedFonts(buf);
  assert.ok(fonts.length >= 1, 'no font program was embedded at all');
  const outlined = fonts.filter((f) => f.tables.includes('glyf') && f.glyphs > 1);
  assert.ok(outlined.length >= 1, `no embedded font carries outlines: ${JSON.stringify(fonts)}`);
});

test('THE VERIFIER IS NOT PERMISSIVE: it reports only what was drawn', async () => {
  // The regression guard for the false pass above. A chart-1 document draws seven
  // characters and 申 is not one of them, so the verifier must say so. If this ever
  // starts passing, the CMap parser has gone back to expanding ranges it cannot read.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
  const drawn = drawnCodePoints(buf);

  assert.ok(!drawn.has(CANARY.codePointAt(0)),
    'chart 1 draws no 申; a verifier that finds one is over-expanding the CMap');
  assert.ok(drawn.size < 100,
    `a document with eight glyphs cannot have drawn ${drawn.size} characters`);
  for (const c of ['己', '巳', '癸', '酉', '丙', '子']) {
    assert.ok(drawn.has(c.codePointAt(0)), `chart 1 draws ${c} and the verifier missed it`);
  }
});

test('BUILD STEP 2: the one-page deliverable renders, with prose and hanzi together', async () => {
  // The smallest thing that exercises the whole font path - register, resolve, embed,
  // draw hanzi - beside real prose. Kept as its own export and its own test because a
  // failure here is unambiguous in a way the same failure inside five sections is not.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = await renderToBuffer(readingOnly({ chart, semanticJson, rendered }));

  assert.ok(buf.length > 1000, 'a PDF was produced');
  const text = latinText(buf);
  assert.match(text, /Bacaanmu/, 'the reading is on it');
  // And the hanzi actually drew, which is the half a Latin-only page cannot prove.
  const drawn = drawnCodePoints(buf);
  for (const c of ['己', '巳']) {
    assert.ok(drawn.has(c.codePointAt(0)), `${c} did not reach the one-page build`);
  }
});

test('every hanzi the chart page draws survives, on three charts', async () => {
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson, rendered } = fixture(which);
    const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
    const chars = [...new Set(['year', 'month', 'day', 'hour']
      .flatMap((k) => [...(semanticJson.chart?.[k] || '')]))];
    const trip = roundTrip(buf, chars);
    assert.ok(trip.ok, `${which}: missing ${trip.missing.join('')}`);
  }
});

test('an HOUR-LESS chart draws three pillars, not a blank fourth', async () => {
  // `hour_known: false` is a fact the reading states once, plainly. A blank cell
  // would be the document implying it a second time, in a place nothing checks.
  const { semanticJson } = fixture('hourless');
  assert.equal(semanticJson.hour_known, false, 'the fixture must actually lack an hour');
  assert.ok(!semanticJson.chart.hour, 'and the chart block must not carry one');
});

// ── build step 3: the full document ──

test('the full document has all five sections and more than one page', async () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
  const text = latinText(buf);

  // Page count is a CONSEQUENCE, never a target (prompt M), so this asserts only
  // that the document is multi-page rather than pinning a number that every layout
  // change would break.
  const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  assert.ok(pages >= 5, `expected at least one page per section, got ${pages}`);

  assert.match(text, /Matahari/, 'the cover names her archetype');
  assert.match(text, /Bacaanmu/, 'the reading section');
  assert.match(text, /Bagan Kelahiran/, 'the chart page, and NOT a hanzi heading');
  assert.match(text, /Istilah dalam Bacaanmu/, 'the appendix');
  // RULE 25 IS ONE LINE NOW, not a page. Reyner killed the colophon on 2026-08-22
  // ("copy-pasted Terms of Service text kills the product experience right at the
  // finish line"), so the obligation moved to the foot of the chart page and the
  // document ends on her own material. The old assertion was /Batas layanan/.
  assert.match(text, /cermin refleksi diri/, 'rule 25, in Reyner\'s one line');
  assert.equal(text.includes('Batas layanan'), false,
    'the ToS page is GONE, not merely shortened');
});

test('THE PDF AUTHORS NOTHING: the reading is the cached prose, verbatim', async () => {
  // A PDF that regenerates its own prose is a second reading wearing the first one's
  // name. Every block's text must appear as given - not re-wrapped, not tidied.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
  // WHITESPACE IS REMOVED ON BOTH SIDES, not collapsed, and the difference matters.
  // react-pdf writes each LINE as its own show operation and drops the space it broke
  // at, so a concatenation of runs joins the last word of one line to the first of the
  // next. Collapsing whitespace does not repair that; ignoring it entirely does, and
  // the comparison is still exact about the character sequence, which is what
  // "verbatim" means here. Line breaking is layout. Anything else is the document
  // editing the reading.
  const strip = (x) => x.replace(/\s+/g, '');
  const text = strip(latinText(buf));

  for (const block of rendered.blocks) {
    const want = strip(block.text);
    assert.ok(text.includes(want),
      `a block's text did not survive verbatim:\n${block.text.slice(0, 120)}`);
  }
  assert.ok(text.includes(strip(rendered.penutup)), 'the penutup too');
});

test('the provenance survived the colophon it used to live on', async () => {
  // The ruling was about the ToS text and said nothing about these two lines. They
  // moved to the chart-page foot rather than dying with the page, because a document
  // in someone's downloads folder still has to be traceable to the engine, prompt and
  // gate that produced it - and `stage6_version` is the gate that CLEARED this prose.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
  const text = latinText(buf);
  assert.match(text, /testprompt00/, 'the prompt version that produced the prose');
  assert.match(text, /1\.17\.0/, 'and the gate that cleared it');
  assert.match(text, /katon\.app/);
});

// ── CORRECTION 1: a condition is never named, in any language ──

test('CORRECTION 1: a `label: null` condition is named in NEITHER English NOR Indonesian', async () => {
  // Cowork's first draft printed the `label_bracket`, so a paid Indonesian document
  // said "Missing Wood". The second draft "fixed" it by inventing "Kayu yang Hilang".
  // BOTH are wrong: naming a condition is naming a thing she does not carry, and
  // `fact.condition_named` HARD-rejects the model for exactly this.
  for (const which of ['chart 1', 'chart 13']) {
    const { chart, semanticJson, rendered } = fixture(which);
    const conditions = (semanticJson.facts || []).filter((f) => f.label === null);
    assert.ok(conditions.length > 0, `${which} should carry a condition fact`);

    const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
    const text = latinText(buf);

    for (const c of conditions) {
      // (a) the English bracket, which is the only form it HAS.
      if (c.label_bracket) {
        assert.ok(!text.includes(c.label_bracket),
          `${which}: the document names the condition "${c.label_bracket}"`);
      }
    }
    // (b) the invented Indonesian, which is the same defect in the local language.
    for (const invented of ['Kayu yang Hilang', 'Air yang Dominan', 'Logam yang Hilang']) {
      assert.ok(!text.includes(invented), `${which}: the document invented "${invented}"`);
    }
  }
});

test('CORRECTION 1: a condition is absent from the "what is in your chart" list', async () => {
  // `carried` is things she HAS. The assertion lives in buildAppendix; this is the
  // check that it is actually true of the data the document draws from.
  for (const which of ['chart 1', 'chart 13']) {
    const { chart, semanticJson } = fixture(which);
    const appendix = buildAppendix({ chart, semanticJson });
    const conditionEntries = appendix.groups
      .flatMap((g) => g.entries)
      .filter((e) => e.condition);
    assert.ok(conditionEntries.length > 0, `${which} should have a condition entry`);
    for (const e of conditionEntries) {
      // ── THE NAME ASSERTION MOVED, THE `carried` ONE DID NOT ──
      // This used to require `e.name === null`. Reyner ruled the condition format
      // on 2026-09-22 (`Tanpa [Elemen]` / `Dominan [Elemen]`, P2 markup A6),
      // because a row with no label at all printed as a paragraph hanging off the
      // row above it. `tests/pdf-appendix.spec.mjs` owns the format now.
      //
      // WHAT THIS TEST IS ACTUALLY ABOUT IS UNCHANGED AND IS THE LINE BELOW:
      // `carried` is the "what is in your chart" list, and a missing element is
      // not in her chart whatever it is labelled. Naming the absence does not make
      // it a possession, and that is the distinction correction 1 was drawing.
      assert.ok(!appendix.carried.includes(e.key), `${which}: ${e.key} is in carried[]`);
      assert.ok(!appendix.carried.includes(e.name),
        `${which}: the condition's LABEL reached carried[] - naming an absence must `
        + 'not turn it into something she carries');
    }
  }
});

// ── CORRECTION 2: the gate asserts MEANING, never NAME ──

test('CORRECTION 2: the gate runs at the document door, not only in the script', async () => {
  // No caller should be able to emit a PDF without it. Proven by making it fail: an
  // entry with no meaning must stop the document being built at all.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const appendix = buildAppendix({ chart, semanticJson });

  // Sanity: the real appendix passes.
  assert.doesNotThrow(() => assertEveryMechanicExplained(appendix));

  // And an unexplained mechanic is refused, naming itself.
  const broken = {
    ...appendix,
    groups: appendix.groups.map((g, i) => (i === 0 && g.entries.length
      ? { ...g, entries: [{ ...g.entries[0], meaning: '' }, ...g.entries.slice(1)] }
      : g)),
  };
  assert.throws(() => assertEveryMechanicExplained(broken), /no label_meaning for/);

  // The document itself calls it, so this cannot be bypassed by a caller.
  assert.ok((await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer);
});

test('CORRECTION 2: the gate checks MEANINGS and never demands a name', () => {
  // ── WHY THE FIXTURE CLAUSE CHANGED, AND WHY THE GATE DID NOT ──
  // This required `nameless.length > 0` - a real precondition while conditions
  // shipped unlabelled, and impossible since Reyner ruled the `Tanpa [Elemen]` /
  // `Dominan [Elemen]` format on 2026-09-22. It went red on "the fixture must
  // exercise a nameless entry", which was the fixture assumption expiring, not the
  // gate breaking.
  //
  // THE GATE ITSELF IS UNCHANGED AND SO IS THE REASON FOR IT. Correction 2:
  // demanding a name for every mechanic is what forced correction 1's bug, so
  // `assertEveryMechanicExplained` looks at MEANINGS only. Asserted directly now
  // rather than through a nameless row that no longer exists - by feeding it an
  // entry with no name at all, which is a shape the generator does not currently
  // produce and which the gate must still accept.
  const { chart, semanticJson } = fixture('chart 1');
  const appendix = buildAppendix({ chart, semanticJson });
  assert.ok(
    appendix.groups.flatMap((g) => g.entries).every((e) => e.meaning && e.meaning.trim()),
    'every shipped entry has a meaning',
  );
  assert.doesNotThrow(() => assertEveryMechanicExplained(appendix));

  // A NAMELESS ENTRY STILL PASSES, constructed rather than found. If a later
  // ruling brings unlabelled rows back, the gate must not be what stops it.
  assert.doesNotThrow(() => assertEveryMechanicExplained({
    groups: [{ group: 'Kondisi', entries: [{ key: 'x', section: 'y', name: null, meaning: 'ada.' }] }],
  }), 'the gate is indifferent to a missing name');

  // And it still REFUSES a missing meaning, which is the half that catches a real
  // gap. Without this the test above would pass on a gate that checks nothing.
  assert.throws(() => assertEveryMechanicExplained({
    groups: [{ group: 'Kondisi', entries: [{ key: 'x', section: 'y', name: 'Ada', meaning: '' }] }],
  }), /no label_meaning/u, 'and it still refuses an unexplained mechanic');
});

// ── 胎元 is name-only, by a standing ruling ──

test('胎元 prints its glossary NAME and no invented meaning', async () => {
  // Reyner ruled 2026-08-07 that `pilar.conception` carries no label_meaning ON
  // PURPOSE, and prompt M's correction 4 records a prompt telling a session to ship a
  // drafted line for it anyway. The name is read from the glossary, never typed.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = (await buildCompleteEditionPdf({ chart, semanticJson, rendered })).buffer;
  const text = latinText(buf);
  assert.match(text, /Pilar Konsepsi/, 'the glossary name');
  assert.ok(!text.includes('Istana Konsepsi'),
    'that is the string the 08-07 ruling REPLACED');
});

// ── build step 4: the reference fixed point, and the three verifies ──
//
// PROMPT M CALLS THIS STEP SHIP-BLOCKING, so most of what is below is NEGATIVE.
// A refusal that has never been observed refusing is a branch nobody has run, and
// this repo has already paid for one of those: `openaiConfigured()` returned false
// for the project's whole life and the failover it guarded never once executed.

test('THE ANCHORS SURVIVE R6 even though nothing references them', async () => {
  // ── REWRITTEN 2026-09-14 FOR R6, NOT DELETED ──────────────
  // This asserted that the fixed point spent a rebuild and that the returned
  // `pageMap` covered every appendix entry. Reyner ruled the page-number references
  // out, so the document declares NO references, `buildPdf` resolves no map, and both
  // of those are now false BY DESIGN - the new test one screen down asserts the
  // opposite (`rebuilds === 0`, `pageMap` empty) as the ruled behaviour.
  //
  // WHAT IS WORTH KEEPING IS THE OTHER HALF: the appendix still writes an `id` on
  // every entry, so the named destinations are still in the bytes and the machinery
  // still has something to guard. Read from the ARTIFACT rather than from the
  // builder's return value, which is the honest source now.
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson, rendered } = fixture(which);
    const { buffer, pageMap, report } = await buildCompleteEditionPdf({
      chart, semanticJson, rendered,
    });
    const appendix = buildAppendix({ chart, semanticJson });
    const dests = namedDestinationPages(buffer);

    assert.equal(report.rebuilds, 0, `${which}: nothing is referenced, so nothing to resolve`);
    assert.deepEqual(pageMap, {}, `${which}: a map was resolved for nothing`);
    assert.equal(report.anchors, 0, `${which}: no anchor needs resolving`);
    assert.equal(dests.size, appendix.count,
      `${which}: the bytes still carry a destination per entry`);
    assert.equal(report.refsBeforeAppendix, 0, `${which}: no ref points into the reading`);
    assert.ok(report.appendixStart > 1 && report.appendixStart <= report.pages,
      `${which}: appendix start ${report.appendixStart} of ${report.pages}`);

    // ── THE ANCHOR-VS-REFERENCE EQUATION IS GONE WITH THE FEATURE ──
    // This asserted `report.anchors - report.referenced === conditions.length` and
    // that `report.unreferenced` IS the condition set - correction 1 expressed as
    // arithmetic. With nothing referenced both sides are zero, so the equation would
    // hold vacuously for any appendix and would be exactly the check that cannot
    // fail. It is deleted rather than kept green. Correction 1 itself is still
    // asserted, on the artifact, by the condition test directly below.
    //
    // WHAT SURVIVES IS THE DESTINATIONS THEMSELVES: every appendix entry still
    // anchors, which is what keeps the machinery meaningful for a future reference.
    for (const e of appendix.groups.flatMap((g) => g.entries)) {
      assert.ok(dests.has(anchorId(e)), `${which}: ${anchorId(e)} lost its destination`);
      const page = dests.get(anchorId(e));
      assert.ok(page >= report.appendixStart && page <= report.pages,
        `${which}: ${anchorId(e)} anchors outside the appendix, on page ${page}`);
    }
  }
});

test('A CONDITION IS STILL EXPLAINED, on the page its anchor points at', async () => {
  // ── NARROWED 2026-09-14 FOR R6 ─────────────────────────────
  // This was "every reference row is drawn, and points at the page the term is on".
  // There are no reference rows any more, so that half is gone with the feature.
  // The half that survives is correction 1's, and it is about the APPENDIX rather
  // than the references: a `label: null` condition is anchored, is explained, and
  // carries no name. Deleting the whole test would have taken that with it.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const pageMap = Object.fromEntries(namedDestinationPages(buffer));
  const texts = pageTexts(buffer);
  const appendix = buildAppendix({ chart, semanticJson });

  for (const e of appendix.groups.flatMap((g) => g.entries)) {
    const page = pageMap[anchorId(e)];
    if (e.condition || !e.name) {
      // CORRECTION 1, ASSERTED ON THE ARTIFACT. A condition is anchored and
      // explained and carries NO reference row - so the assertion is that its
      // meaning is on the page it anchors to, and that nothing before the appendix
      // names it. `assertConditionsUnnamed` covers the naming elsewhere; here it is
      // the reference surface specifically.
      assert.ok(texts[page - 1].includes(e.meaning.slice(0, 24)),
        `a condition's meaning is not on its anchored page ${page}`);
      continue;
    }
    // A NAMED ENTRY IS ON THE PAGE ITS ANCHOR POINTS AT. The old assertion here was
    // that a reference row reading `<name>  hal. N` was drawn somewhere before the
    // appendix; there are no reference rows since R6, so that half is gone. This
    // half is not about references at all - it is that the anchor written into the
    // bytes lands on the page the entry is actually printed on, which is what makes
    // the destination worth keeping.
    assert.ok(texts[page - 1].includes(e.name),
      `${e.name} anchors to page ${page} and is not on it`);
  }
  // AND NO `hal. ` ANYWHERE, which is the ruling this test was narrowed under.
  assert.equal(texts.join('\n').includes(REF_PREFIX), false);
});

test('verify 1 REFUSES a stale map - the drift correction 3 is about', async () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  // FROM THE ARTIFACT, not from the builder's return: since R6 the document
  // references nothing, so `buildPdf` resolves no map - but the appendix still
  // anchors every entry, and this test is about the MACHINERY, which Reyner kept as
  // code precisely so a future anchor is still guarded. Feeding it the destinations
  // the bytes actually carry is what keeps that guard exercised.
  const pageMap = Object.fromEntries(namedDestinationPages(buffer));
  const anchors = Object.keys(pageMap);
  const referenced = anchors.map((id) => ({ id, name: 'x' }));

  // Every anchor claimed one page later than it is: the off-by-one a two-pass build
  // produces when its own second pass pushed the appendix.
  const stale = Object.fromEntries(anchors.map((id) => [id, pageMap[id] + 1]));
  assert.throws(
    () => verifyReferences({
      buffer, pageMap: stale, anchors, referenced,
    }),
    /REF VERIFY 1 failed/,
    'a map that disagrees with the emitted bytes must not verify',
  );
});

test('verify 2 REFUSES a reference pointing before the appendix', async () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  // FROM THE ARTIFACT, not from the builder's return: since R6 the document
  // references nothing, so `buildPdf` resolves no map - but the appendix still
  // anchors every entry, and this test is about the MACHINERY, which Reyner kept as
  // code precisely so a future anchor is still guarded. Feeding it the destinations
  // the bytes actually carry is what keeps that guard exercised.
  const pageMap = Object.fromEntries(namedDestinationPages(buffer));
  const anchors = Object.keys(pageMap);
  const [first] = anchors;

  // Page 2 is the reading. This is the exact failure the discarded verifier had: it
  // found `Pilar Kerja` in the reading and called that the appendix entry.
  assert.throws(
    () => verifyReferences({
      buffer,
      pageMap: { ...pageMap, [first]: 2 },
      anchors,
      referenced: [{ id: first, name: 'x' }],
    }),
    /REF VERIFY [12] failed/,
    'a reference into the reading must not verify',
  );
});

test('verify 3 REFUSES a document that printed no reference rows', async () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const appendix = buildAppendix({ chart, semanticJson });
  const anchors = anchorIds(appendix);

  // An EMPTY map is pass 1's real state, and pass 1's document has no references in
  // it. So this is not a synthetic case: it is what shipping without the fixed point
  // would produce, and checks 1 and 2 are both satisfied by it. Only check 3 sees it.
  const buffer = await renderToBuffer(completeEdition({
    chart, semanticJson, rendered, pageMap: {},
  }));
  const measured = namedDestinationPages(buffer);
  const pageMap = Object.fromEntries(anchors.map((id) => [id, measured.get(id)]));
  const referenced = appendix.groups
    .flatMap((g) => g.entries)
    .filter((e) => !e.condition && e.name)
    .map((e) => ({ id: anchorId(e), name: e.name }));

  assert.throws(
    () => verifyReferences({
      buffer, pageMap, anchors, referenced,
    }),
    /REF VERIFY 3 failed/,
    'a converged map that reached no reader must not verify',
  );
});

test('completeEdition REFUSES to build without a page map', () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  assert.throws(
    () => completeEdition({ chart, semanticJson, rendered }),
    /pageMap is required/,
    'a caller who does not know about the fixed point gets an error, not a '
    + 'reference-free document',
  );
  // `{}` is legal, because pass 1 has nothing to print yet.
  assert.ok(completeEdition({
    chart, semanticJson, rendered, pageMap: {},
  }));
});

test('the two headings the verifies locate pages by are really in the document', async () => {
  // THE ONE SOFT SPOT in build.js, named in its own docblock: the verifies find the
  // chart page and the appendix by heading string. A rename in document.js would
  // otherwise break a check rather than the document, silently.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const texts = pageTexts(buffer);
  for (const heading of [APPENDIX_HEADING, CHART_HEADING]) {
    assert.equal(texts.filter((t) => t.includes(heading)).length, 1,
      `"${heading}" must appear on exactly one page - the verifies index by it`);
  }
});

test('pageTexts attributes each page its OWN text', async () => {
  // The first cut of this reader used a lazy regex that ran from an object with no
  // stream to the NEXT object's stream, so every page got its neighbour's text. The
  // symptom would be invisible in an aggregate check, so this pins the shape.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer, report } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const texts = pageTexts(buffer);
  assert.equal(texts.length, pageObjectOrder(buffer).length, 'one text per page');
  assert.equal(texts.length, report.pages);
  assert.ok(texts[0].includes(semanticJson.core.archetype_name_id), 'page 1 is the cover');
  // THE LAST PAGE IS THE APPENDIX NOW. It was the colophon until 2026-08-22; the
  // document deliberately ends on her own material. Asserted by CONSTRUCTION rather
  // than by a substring that happens to be there: the appendix's final entry is the
  // last thing the document emits, so its name must be on the last page.
  const entries = buildAppendix({ chart, semanticJson }).groups.flatMap((g) => g.entries);
  const last = entries[entries.length - 1];
  assert.ok(texts[report.pages - 1].includes(last.name || last.meaning.slice(0, 24)),
    'the last page must carry the appendix\'s final entry');
  assert.equal(texts[report.pages - 1].includes('Batas layanan'), false,
    'and it must not carry the ToS text the ruling removed');
  assert.ok(!texts[0].includes(APPENDIX_HEADING), 'the cover does not carry the appendix heading');
});

test('anchorId is deterministic, collision-free, and safe for a PDF name', () => {
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson } = fixture(which);
    const ids = anchorIds(buildAppendix({ chart, semanticJson }));
    assert.equal(new Set(ids).size, ids.length, `${which}: anchors collide`);
    for (const id of ids) {
      assert.match(id, /^[A-Za-z0-9_.-]+$/,
        `${id} carries bytes a PDF name string cannot: Shio keys are hanzi and must `
        + 'be escaped, not passed through');
    }
  }
});

// ============================================================
// THE REFACTOR FIXTURE — the mirror document did not move
// ============================================================
// Prompt Y-3 commit 1 turns `buildCompleteEditionPdf` into a thin wrapper over a
// builder that takes a COMPOSER, so the compat PDF can be a second composer rather
// than a second pipeline. The whole risk of that refactor is that it changes the
// mirror document by accident, and no other assertion in this file would notice:
// they check properties (a heading is present, the last page is the appendix), and
// a refactor that moved a paragraph or dropped a row satisfies every one of them.
//
// So this compares the ARTIFACT, not properties of it. `tests/fixtures/pdf-chart1-
// pages.json` was captured on the pre-refactor build and is EVIDENCE, not output:
// regenerate it only for an intended, ruled change to the MIRROR document, never to
// make this go green. Same rule as `tests/solar-terms.fixture.json`.
//
// SHOWN RED FIRST, and the prompt's suggested break did NOT work - which is worth
// recording more than the break that did. Y-3 said to show it red by changing one
// style value (`coverTitle.fontSize` 34 -> 33). It stayed GREEN: `pageTexts`
// extracts the text a page draws and not how it is drawn, so this assertion is blind
// to typography BY CONSTRUCTION. That is a real limit and it is stated rather than
// papered over - if the refactor had changed a font, nothing here would say so.
//
// A second probe was also inert: dropping the penutup from `readingPage` changed
// nothing, because the mirror floor's penutup is the empty string
// (`assembleFallback(semanticJson).penutup === ''`). An assertion that looks like it
// covers something the fixture does not contain is exactly the shape this repo has
// paid for, so the miss is named here rather than left for the next reader to find.
//
// THE RED THAT COUNTS is a change in the class this actually guards - reader-visible
// text and pagination. `'Bagan Kelahiran'` -> `'Bagan Kelahiranx'` in document.js
// fails it with `page 5 text moved`. All three runs are in the commit message.
test('THE MIRROR DOCUMENT IS BYTE-FOR-BYTE THE SAME DOCUMENT after the refactor', async () => {
  const FIXTURE = JSON.parse(
    readFileSync(new URL('./fixtures/pdf-chart1-pages.json', import.meta.url), 'utf8'),
  );
  const { chart, semanticJson, rendered } = fixture('chart 1');
  // The fixture records the inputs it was captured with, so a drifting fallback or a
  // changed version string fails HERE, naming itself, instead of surfacing as a
  // mystery text diff forty lines down.
  assert.equal(rendered.prompt_version, FIXTURE._fixture.prompt_version);
  assert.equal(rendered.stage6_version, FIXTURE._fixture.stage6_version);

  const { buffer, pageMap, report } = await buildCompleteEditionPdf({
    chart, semanticJson, rendered,
  });

  // Page texts first and page by page: a whole-array deepEqual on eight pages of
  // prose prints a diff nobody can read, and the page number is the first thing
  // anyone debugging this wants.
  const texts = pageTexts(buffer);
  assert.equal(texts.length, FIXTURE.pages.length, 'page COUNT moved');
  for (const [i, expected] of FIXTURE.pages.entries()) {
    assert.equal(texts[i], expected, `page ${i + 1} text moved`);
  }
  // The map and the counts too. A refactor could preserve every glyph and still
  // resolve a reference to a different page, and `hal. N` lives inside page text -
  // so this is not implied by the loop above only because the loop would catch it
  // as an unattributable text diff rather than as what it is.
  assert.deepEqual(pageMap, FIXTURE.pageMap, 'the page map moved');
  assert.equal(report.pages, FIXTURE.report.pages);
  assert.equal(report.appendixStart, FIXTURE.report.appendixStart);
  assert.equal(report.anchors, FIXTURE.report.anchors);
  assert.equal(report.referenced, FIXTURE.report.referenced);
  assert.equal(report.rebuilds, FIXTURE.report.rebuilds, 'the fixed point converged differently');
});

// ── THE COVER (Reyner, 2026-09-14, ruling 2) ───────────────

test('THE COVER LEADS WITH THE ENGLISH NAME, Indonesian underneath', async () => {
  // Ruled 2026-09-14 on the compat cover and applied HERE TOO in the same ruling -
  // "same `coverPage` shape". `name_en` is the bigger title; `name_id` sits under
  // it, smaller, with the element it always carried.
  //
  // THIS MOVES THE MIRROR DOCUMENT, which is why `tests/fixtures/pdf-chart1-
  // pages.json` is re-pinned in the same commit. It is the first intended change to
  // that document since the fixture was captured, and the fixture's own header says
  // regenerate only for exactly this: an intended, ruled change.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const cover = pageTexts(buffer)[0].split('\n').map((l) => l.trim()).filter(Boolean);
  const core = semanticJson.core;

  assert.equal(cover[0], core.archetype_name_en, 'the first line is not the English name');
  assert.equal(cover[1], `${core.archetype_name_id} - ${core.element}`,
    'the Indonesian name and element are not the line under it');
  // ORDER, not presence: both were on the cover before, the wrong way round.
  const page = pageTexts(buffer)[0];
  assert.ok(page.indexOf(core.archetype_name_en) < page.indexOf(core.archetype_name_id),
    'the Indonesian name still comes first');

  // THE METADATA TITLE IS UNCHANGED, explicitly ruled. It is what a reader sees in
  // a viewer tab and in her downloads folder, and it stays Indonesian.
  assert.ok(buffer.includes(Buffer.from(`Katon - ${core.archetype_name_id}`, 'utf8')),
    'the metadata title moved with the cover');
});

// ── NOTHING OVERLAPS (Reyner, 2026-09-14, ruling 3) ────────

test('NO TEXT IS DRAWN ON TOP OF OTHER TEXT, on any page', async () => {
  // Reyner, reading the Y-1 PDF: the cover title sat on its sub-line and the animal
  // names were printed over the hanzi on every chart page. Both documents, because
  // both share these styles.
  //
  // ── THE CAUSE WAS ONE INHERITED NUMBER ─────────────────────
  // `page` sets `fontSize: 11, lineHeight: 1.6`. react-pdf resolves that to an
  // ABSOLUTE 17.6pt and inherits the number, not the ratio - so every element with a
  // larger font got a 17.6pt line box regardless of its size. A 34pt cover title had
  // 4.7pt of room; a 26pt pillar character had 17.4pt. The fix is per-style
  // `lineHeight`, which is line-height and spacing only, as ruled.
  //
  // ── THE INSTRUMENT'S FIRST VERSION WAS BLIND AND SAID CLEAN ──
  // It read `Td`/`Tm`. react-pdf writes `1 0 0 1 0 <pageHeight> Tm` for every run
  // and carries position in nested `cm` translations, so every run came back at the
  // same y and the collision scan skipped every pair as "same baseline". Its control
  // passed because the control fed SYNTHETIC runs and never exercised the parser.
  // `textBoxes` walks the CTM stack now, and the control below is the real document.
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson, rendered } = fixture(which);
    const { buffer } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
    const pages = textBoxes(buffer);
    assert.ok(pages.some((p) => p.length > 5), `${which}: the parser found no runs to check`);
    for (const [i, runs] of pages.entries()) {
      const hits = collisions(runs);
      assert.deepEqual(hits.map((h) => `"${h.a.text.slice(0, 18)}"(${h.a.size}) over `
        + `"${h.b.text.slice(0, 18)}"(${h.b.size}) gap ${h.gap}, needs ${h.need}`), [],
      `${which} page ${i + 1}`);
    }
  }
});

// ── NO CROSS-REFERENCES (Reyner, 2026-09-14, R6) ───────────

test('NOT ONE `hal. N` SURVIVES, and the fixed point converges on pass 1', async () => {
  // Reyner read the compat PDF and ruled the page-number cross-references OUT: a
  // reading is a document, not an index. The `Yang ada di baganmu` list and every
  // `hal. N` row go from both composers.
  //
  // THE MACHINERY STAYS AS CODE BY THE SAME RULING - the fixed point, the three
  // verifies, the /Dests reading. It costs nothing and guards any future anchor. But
  // with nothing referenced there is nothing to resolve, so the loop must settle on
  // its FIRST pass rather than spending a rebuild discovering that. `rebuilds === 0`
  // is the assertion that says the machinery went quiet instead of merely passing.
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson, rendered } = fixture(which);
    const { buffer, pageMap, report } = await buildCompleteEditionPdf({
      chart, semanticJson, rendered,
    });
    const texts = pageTexts(buffer);
    for (const [i, t] of texts.entries()) {
      assert.equal(t.includes(REF_PREFIX), false,
        `${which} page ${i + 1} still prints a "${REF_PREFIX}" reference`);
    }
    assert.equal(texts.join('\n').includes('Yang ada di baganmu'), false,
      `${which}: the reference list heading survives`);
    assert.equal(report.rebuilds, 0, `${which}: the fixed point still spent a rebuild`);
    assert.equal(report.referenced, 0, `${which}: something is still referenced`);
    assert.deepEqual(pageMap, {}, `${which}: a page map was resolved for nothing`);
  }
});

// ── THE KAMUS RINGKAS (Reyner, 2026-09-14, R7 and R8) ──────

test('THE APPENDIX IS A TWO-COLUMN TABLE, term beside meaning', async () => {
  // R7: the glossary stays an appendix, as one compact two-column "Kamus Ringkas"
  // at the very end, with `GROUP_ORDER` as thin sub-headings. Asserted on the
  // GEOMETRY rather than on the prose: a term and its meaning share a baseline and
  // sit at different x, which is what "two columns" means and what a stacked layout
  // cannot fake.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const { buffer, report } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  const appendix = buildAppendix({ chart, semanticJson });
  const pages = textBoxes(buffer);

  // ── THE `display_only` EXCLUSION IS NOW UNREACHABLE, AND KEPT ──
  // It excluded 胎元, which carries NO `label_meaning` on purpose (Reyner,
  // 2026-08-07): a name with an empty right column, so asserting a meaning beside
  // it would have been asserting against the ruling.
  //
  // Since 2026-09-22 (P2 markup A7) a row with no meaning does not print at all, so
  // there is no `display_only` entry left to exclude and the precondition that
  // asserted one - "the exclusion is exercised" - went red. That precondition was
  // doing real work and its removal is recorded rather than silent: what it
  // protected against was the filter drifting into a no-op while looking correct.
  //
  // THE FILTER STAYS. `buildAppendix` still sets `display_only`, and if a later
  // ruling gives 胎元 a meaning the row returns with the flag on it. A filter that
  // currently matches nothing is cheaper than rediscovering why it was needed.
  const all = appendix.groups.flatMap((g) => g.entries);
  const named = all.filter((e) => e.name && !e.display_only);
  assert.ok(named.length > 5, 'precondition: chart 1 has a legend worth tabulating');
  assert.deepEqual(all.filter((e) => e.display_only), [],
    'A7: a row with no meaning does not print, so nothing is display-only any more');

  for (const e of named) {
    // The run that draws the term, anywhere in the appendix.
    let found = null;
    for (const runs of pages.slice(report.appendixStart - 1)) {
      const term = runs.find((r) => r.text.replace(/\s+/gu, '') === e.name.replace(/\s+/gu, ''));
      if (!term) continue;
      // A run on the SAME baseline and to the RIGHT of it is the meaning column.
      found = runs.find((r) => r.y === term.y && r.x > term.x);
      if (found) break;
    }
    assert.ok(found, `${e.name} has no meaning beside it - the row is still stacked`);
  }

  // GROUP HEADINGS SURVIVE as thin sub-headings, in prompt M's ruled order.
  const appendixText = pageTexts(buffer).slice(report.appendixStart - 1).join('\n');
  const present = GROUP_ORDER.filter((g) => appendix.groups.some((x) => x.group === g));
  let cursor = -1;
  for (const g of present) {
    const at = appendixText.indexOf(g);
    assert.ok(at > cursor, `${g} is out of GROUP_ORDER in the appendix`);
    cursor = at;
  }
});

test('R8: THE APPENDIX PRINTS EVERY RULED CELL WHOLE, never a first sentence', async () => {
  // Reyner ruled "no truncation to one sentence". NOTHING IN THE CODE EVER
  // TRUNCATED - `meaningOf` returns the cell and the page printed it - so this is a
  // GUARD rather than a fix, and it is worth having precisely because the
  // two-column table is the change most likely to introduce one: a narrow column
  // invites a `slice`.
  for (const which of Object.keys(CHARTS)) {
    const { chart, semanticJson, rendered } = fixture(which);
    const { buffer, report } = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
    const appendix = buildAppendix({ chart, semanticJson });
    const tail = pageTexts(buffer).slice(report.appendixStart - 1).join('\n').replace(/\s+/gu, ' ');

    for (const e of appendix.groups.flatMap((g) => g.entries)) {
      if (!e.meaning) continue;
      assert.ok(tail.includes(e.meaning.replace(/\s+/gu, ' ')),
        `${which}: ${e.section}.${e.key} is not printed whole`);
    }
  }
});
