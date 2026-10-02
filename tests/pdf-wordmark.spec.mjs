// ============================================================
// tests/pdf-wordmark.spec.mjs — the logo dot sits on the wordmark's cap height (Prompt AW §1)
// ============================================================
// Run: npm run test:pdf-wordmark
//
// Reyner, 2026-09-30: "the PDF: orange dot on Katon logo still not aligned". Cowork
// measured r6-07's cover at 200 dpi: the dot's centre about 10px (1.3mm) below the
// cap-height centre of KATON. This measures INK, off the served bytes rasterised by
// lib/pdf/raster.js: the clay dot's pixel box against the ink box of "KATON". The
// word is all capitals with no descender, so its ink box IS the cap height, and its
// vertical centre is the cap-height centre. Fails at more than 1px at 200 dpi.
//
// Every document that carries the mark: the Complete Edition and the Compatibility
// cover (lib/pdf/document.js wordmark(), shared). Plain node: react-pdf needs the
// client React build.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { buildCompleteEditionPdf, buildPairPdf } from '../lib/pdf/build.js';
import { rasterPages, inkBox } from '../lib/pdf/raster.js';

const DPI = 200;
const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });

// The clay accent (#C4622A) and the warm ink (#3C3226), with anti-aliasing slack.
const isClay = (r, g, b) => r > 150 && g > 60 && g < 140 && b < 90 && r - b > 90;
const isInk = (r, g, b) => r < 140 && g < 130 && b < 120 && Math.abs(r - b) < 45;

/** The dot and the word, located in the cover's top band. */
function measure(img) {
  const band = { x0: 0, y0: 0, x1: Math.round(img.width * 0.6), y1: Math.round(img.height * 0.18) };
  const dot = inkBox(img, isClay, band);
  assert.ok(dot, 'the clay dot is on the cover');
  // The word starts right of the dot, on the same line.
  const word = inkBox(img, isInk, { x0: dot.x1 + 2, y0: dot.y0 - 40, x1: band.x1, y1: dot.y1 + 40 });
  assert.ok(word, 'KATON is beside the dot');
  return { dot, word, delta: dot.cy - word.cy };
}

async function coverOf(buffer) {
  const [img] = await rasterPages(buffer, { dpi: DPI, pages: [1] });
  return img;
}

const docs = {
  'Complete Edition': async () => {
    const semanticJson = buildSemanticJson(A);
    const rendered = { ...assembleFallback(semanticJson), prompt_version: 't', stage6_version: 't' };
    return (await buildCompleteEditionPdf({ chart: A, semanticJson, rendered })).buffer;
  },
  Compatibility: async () => {
    const semanticJson = buildPairSemantic(A, B);
    const rendered = { ...assembleFallback(semanticJson), prompt_version: 't', stage6_version: 't' };
    const pair = { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1990-03-04', gender: 'female' } };
    return (await buildPairPdf({ chartA: A, chartB: B, semanticJson, rendered, pair })).buffer;
  },
};

for (const [name, build] of Object.entries(docs)) {
  test(`AW §1: on the ${name} cover the dot's centre is on KATON's cap-height centre (<= 1px at ${DPI} dpi)`, async () => {
    const { dot, word, delta } = measure(await coverOf(await build()));
    assert.ok(Math.abs(delta) <= 1,
      `dot centre y ${dot.cy} vs cap-height centre y ${word.cy}: ${delta.toFixed(1)}px (dot ${dot.y0}-${dot.y1}, caps ${word.y0}-${word.y1})`);
  });
}

test('AW §1 INSTRUMENT: the measure sees a dot moved 3pt off the line (so it can fail)', async () => {
  // A cover whose dot is pushed down on purpose, through the same builder: the check
  // must report it, or its green above proves nothing.
  const { PDF_STYLES } = await import('../lib/pdf/document.js');
  const saved = PDF_STYLES.wordmarkDot.marginTop;
  PDF_STYLES.wordmarkDot.marginTop = (saved || 0) + 6;
  try {
    const { delta } = measure(await coverOf(await docs['Complete Edition']()));
    assert.ok(Math.abs(delta) > 4, `a displaced dot must read as displaced, read ${delta.toFixed(1)}px`);
  } finally {
    PDF_STYLES.wordmarkDot.marginTop = saved;
  }
});
