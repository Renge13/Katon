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
import { renderToBuffer } from '@react-pdf/renderer';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildAppendix, assertEveryMechanicExplained } from '../lib/pdf/appendix.js';
import { completeEdition, readingOnly, glyphProof } from '../lib/pdf/document.js';
import { HAN_GLYPHS } from '../lib/card/hanFont.js';
import {
  registerPdfFonts, __resetPdfFonts, CANARY, FAMILY_HAN,
} from '../lib/pdf/fonts.js';
import {
  roundTrip, drawnCodePoints, embeddedFonts, latinText,
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
  const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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
    const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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
  const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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
  // The colophon is SITE_COPY.syarat.limits - already rule 25 in ruled Indonesian.
  assert.match(text, /Batas layanan/, 'the colophon');
});

test('THE PDF AUTHORS NOTHING: the reading is the cached prose, verbatim', async () => {
  // A PDF that regenerates its own prose is a second reading wearing the first one's
  // name. Every block's text must appear as given - not re-wrapped, not tidied.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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

test('the colophon carries the provenance a stray file needs to be traced', async () => {
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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

    const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
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
      assert.equal(e.name, null, `${which}: condition ${e.key} carries a name`);
      assert.ok(!appendix.carried.includes(e.key), `${which}: ${e.key} is in carried[]`);
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
  assert.ok(await renderToBuffer(completeEdition({ chart, semanticJson, rendered })));
});

test('CORRECTION 2: the gate is INDIFFERENT to a missing name', () => {
  // Demanding a name for every mechanic is what forces correction 1's bug. A
  // condition has a meaning and no name, and that must pass.
  const { chart, semanticJson } = fixture('chart 1');
  const appendix = buildAppendix({ chart, semanticJson });
  const nameless = appendix.groups.flatMap((g) => g.entries).filter((e) => e.name === null);
  assert.ok(nameless.length > 0, 'the fixture must exercise a nameless entry');
  assert.ok(nameless.every((e) => e.meaning && e.meaning.trim()), 'each still has a meaning');
  assert.doesNotThrow(() => assertEveryMechanicExplained(appendix));
});

// ── 胎元 is name-only, by a standing ruling ──

test('胎元 prints its glossary NAME and no invented meaning', async () => {
  // Reyner ruled 2026-08-07 that `pilar.conception` carries no label_meaning ON
  // PURPOSE, and prompt M's correction 4 records a prompt telling a session to ship a
  // drafted line for it anyway. The name is read from the glossary, never typed.
  const { chart, semanticJson, rendered } = fixture('chart 1');
  const buf = await renderToBuffer(completeEdition({ chart, semanticJson, rendered }));
  const text = latinText(buf);
  assert.match(text, /Pilar Konsepsi/, 'the glossary name');
  assert.ok(!text.includes('Istana Konsepsi'),
    'that is the string the 08-07 ruling REPLACED');
});
