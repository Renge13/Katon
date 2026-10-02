// ============================================================
// tests/pdf-gloss-italic.spec.mjs — the bracketed English gloss is italic in both PDFs
// ============================================================
// Run: npm run test:pdf-gloss-italic
//
// Prompt AQ §4, the PDF half. One voice everywhere (rule 20), so the Complete
// Edition and the Compatibility PDF set "(The Mountain)" the way the web reading
// does: brackets upright, the glossary English inside them italic.
//
// ── THE BODY FACE IS HANKEN GROTESK SINCE PROMPT AW (2026-09-30) ──
// Reading prose was Helvetica and its italic Helvetica-Oblique, both standard-14.
// Since AW the body is the web's sans, Hanken Grotesk, EMBEDDED, and its italic is a
// registered face of its own (lib/pdf/fonts.js LATIN_FACES). So these assertions read
// the DRAWN document: which font each run of text was shown with, and which BaseFont
// that resource names (a subset carries an "ABCDEF+" prefix, stripped). The runs come
// from textBoxes, which decodes embedded faces through their ToUnicode maps; the old
// textByFont read hex runs as latin1, which was right only for a simple font. Not the
// element tree, which would pass on a style the renderer silently ignored.
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
import { textBoxes } from '../lib/pdf/inspect.js';

const GLOSS = ' Kamu adalah Gunung (The Mountain), dengan Aspek Tujuh Pembunuh (Seven Killings) dan satu (catatan kecil) yang bukan istilah.';

/** Font resource name (F1) -> BaseFont (Helvetica-Oblique), read from the PDF's own objects. */
function baseFonts(pdf) {
  const raw = pdf.toString('latin1');
  const byObj = new Map([...raw.matchAll(/(\d+) 0 obj\s*<<[^>]*\/BaseFont\s*\/([A-Za-z0-9+-]+)/g)].map((m) => [m[1], m[2]]));
  const out = new Map();
  for (const m of raw.matchAll(/\/(F\d+) (\d+) 0 R/g)) if (byObj.has(m[2])) out.set(m[1], byObj.get(m[2]));
  return out;
}

/** All text drawn in the body face's italic, and all text drawn in its upright. */
const BODY_ITALIC = 'HankenGrotesk-Italic';
const BODY_UPRIGHT = 'HankenGrotesk-Regular';
function obliqueAndUpright(pdf) {
  const fonts = baseFonts(pdf);
  const face = (res) => (fonts.get(res) || '').replace(/^[A-Z]{6}\+/u, '');
  let oblique = ''; let upright = '';
  for (const run of textBoxes(pdf).flat()) {
    if (face(run.font) === BODY_ITALIC) oblique += run.text;
    if (face(run.font) === BODY_UPRIGHT) upright += run.text;
  }
  // Whitespace is dropped: a line break inside a name leaves no space character in
  // the drawn runs, so "The Mountain" can arrive as "TheMountain".
  const squash = (t) => t.replace(/\s+/gu, '');
  return { oblique: squash(oblique), upright: squash(upright) };
}

test('THE COMPLETE EDITION draws the glossary English in the body italic (Hanken Grotesk Italic), and only that', async () => {
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

// ── A BRACKETED GLOSS IS ONE UNBREAKABLE UNIT (Reyner, 2026-09-30, #186) ──
// The #186 walk after #183 printed "(Peach Blossom-" at a line end and ")" at the start
// of the next: the italic gloss is its own run, and textkit put a hyphenation break on
// the run seam. This slides "(Peach Blossom)" across every position on the line, by
// growing the words before it, and requires the whole unit - "(", both words, ")" - on
// ONE line every time, with no drawn run ending in a hyphen.
test('A BRACKETED GLOSS NEVER BREAKS: "(", the English and ")" share one line at every position', async () => {
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const semanticJson = buildSemanticJson(chart);
  const base = assembleFallback(semanticJson);
  let straddles = 0;
  let checked = 0;
  for (let n = 0; n < 34; n += 1) {
    const lead = `Kamu ${'a'.repeat(n)} berdiri di tengah orang banyak, dan Bunga Persik (Peach Blossom) membuat orang cepat mengingatmu.`;
    const rendered = { ...base, blocks: [{ ...base.blocks[0], text: lead }], penutup: '' };
    const pdf = await renderToBuffer(readingOnly({ chart, semanticJson, rendered }));
    const runs = textBoxes(pdf).flat();
    const i = runs.findIndex((r) => r.text.includes('Peach'));
    assert.ok(i > 0, `n=${n}: the gloss was drawn`);
    checked += 1;
    const gloss = runs[i];
    const open = runs[i - 1];
    const close = runs[i + 1];
    const oneLine = gloss.text.includes('Blossom') && open.text.endsWith('(')
      && Math.abs(open.y - gloss.y) < 0.5 && close && close.text.startsWith(')') && Math.abs(close.y - gloss.y) < 0.5;
    if (!oneLine) straddles += 1;
    assert.ok(oneLine, `n=${n}: the gloss broke - "${open.text.slice(-12)}" @${open.y} | "${gloss.text}" @${gloss.y} | "${close?.text.slice(0, 12)}" @${close?.y}`);
    assert.equal(runs.some((r) => /-$/u.test(r.text.trim()) && /Blossom|Peach|\($/u.test(r.text)), false, `n=${n}: a hyphen was drawn on the gloss`);
  }
  assert.equal(checked, 34);
  assert.equal(straddles, 0);
});
