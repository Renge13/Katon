// ============================================================
// tests/pdf-gloss-italic.spec.mjs — the bracketed English gloss is italic in both PDFs
// ============================================================
// Run: npm run test:pdf-gloss-italic
//
// Prompt AQ §4, the PDF half. One voice everywhere (rule 20), so the Complete
// Edition and the Compatibility PDF set "(The Mountain)" the way the web reading
// does: brackets upright, the glossary English inside them italic.
//
// ── THE FACE EXISTS, AND IT IS NOT AN EMBEDDED FILE ────────
// Reading prose is Helvetica (FAMILY_LATIN), one of the PDF standard 14. Its italic,
// Helvetica-Oblique, is standard too: react-pdf resolves `fontStyle: 'italic'` on it
// with no registration and nothing to embed. So these assertions read the DRAWN
// document: which font resource each run of text was shown with, and which BaseFont
// that resource names. Not the element tree, which would pass on a style the
// renderer silently ignored.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderToBuffer } from '@react-pdf/renderer';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { readingOnly } from '../lib/pdf/document.js';
import { buildPairPdf } from '../lib/pdf/build.js';
import { textByFont } from '../lib/pdf/inspect.js';

const GLOSS = ' Kamu adalah Gunung (The Mountain), dengan Aspek Tujuh Pembunuh (Seven Killings) dan satu (catatan kecil) yang bukan istilah.';

/** Font resource name (F1) -> BaseFont (Helvetica-Oblique), read from the PDF's own objects. */
function baseFonts(pdf) {
  const raw = pdf.toString('latin1');
  const byObj = new Map([...raw.matchAll(/(\d+) 0 obj\s*<<[^>]*\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)].map((m) => [m[1], m[2]]));
  const out = new Map();
  for (const m of raw.matchAll(/\/(F\d+) (\d+) 0 R/g)) if (byObj.has(m[2])) out.set(m[1], byObj.get(m[2]));
  return out;
}

/** All text drawn in Helvetica-Oblique, and all text drawn in upright Helvetica. */
function obliqueAndUpright(pdf) {
  const fonts = baseFonts(pdf);
  let oblique = ''; let upright = '';
  for (const [res, text] of textByFont(pdf)) {
    if (fonts.get(res) === 'Helvetica-Oblique') oblique += text;
    if (fonts.get(res) === 'Helvetica') upright += text;
  }
  // Whitespace is dropped: a line break inside a name leaves no space character in
  // the drawn runs, so "The Mountain" can arrive as "TheMountain".
  const squash = (t) => t.replace(/\s+/gu, '');
  return { oblique: squash(oblique), upright: squash(upright) };
}

test('THE COMPLETE EDITION draws the glossary English in Helvetica-Oblique, and only that', async () => {
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const semanticJson = buildSemanticJson(chart);
  const base = assembleFallback(semanticJson);
  const rendered = {
    ...base,
    blocks: base.blocks.map((b, i) => (i === 0 ? { ...b, text: `${b.text}${GLOSS}` } : b)),
  };
  const pdf = await renderToBuffer(readingOnly({ chart, semanticJson, rendered }));
  const { oblique, upright } = obliqueAndUpright(pdf);

  // The floor puts "(The Sun)" on this chart's archetype itself, so the real
  // pipeline's own bracket is covered as well as the injected ones.
  assert.ok(base.blocks[0].text.includes('(The Sun)'), 'precondition: the floor brackets the archetype');
  for (const n of ['The Sun', 'The Mountain', 'Seven Killings']) {
    assert.ok(oblique.includes(n.replace(/ /gu, '')), `"${n}" is drawn italic`);
  }
  assert.equal(oblique.includes('catatankecil'), false, 'a non-glossary bracket stays upright');
  assert.equal(/[()]/u.test(oblique), false, 'the brackets themselves are not italic');
  assert.ok(upright.includes('catatankecil'));
});

test('THE COMPATIBILITY PDF does the same', async () => {
  const a = calculateBaziChart({ birthDate: '1989-09-13', birthTime: null });
  const b = calculateBaziChart({ birthDate: '1997-09-14', birthTime: null });
  const semanticJson = buildPairSemantic(a, b);
  const base = assembleFallback(semanticJson);
  const last = base.blocks.length - 1;
  const rendered = {
    ...base,
    blocks: base.blocks.map((blk, i) => (i === last ? { ...blk, text: `${blk.text}${GLOSS}` } : blk)),
    prompt_version: 'testprompt00',
    stage6_version: '1.57.0',
  };
  const { buffer } = await buildPairPdf({
    chartA: a, chartB: b, semanticJson, rendered,
    pair: { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1997-09-14', gender: 'female' } },
  });
  const { oblique, upright } = obliqueAndUpright(buffer);
  for (const n of ['The Mountain', 'Seven Killings']) assert.ok(oblique.includes(n.replace(/ /gu, '')), `"${n}" is drawn italic`);
  assert.equal(oblique.includes('catatankecil'), false);
  assert.equal(/[()]/u.test(oblique), false);
  assert.ok(upright.includes('catatankecil'));
});
