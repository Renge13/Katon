// ============================================================
// tests/pdf-inspect-cid.spec.mjs — the inspector can read an embedded face
// ============================================================
// Run: npm run test:pdf-inspect-cid
//
// AB §4 (A12) put the headings in Spectral, an EMBEDDED TrueType face. pdfkit
// draws every embedded face as a CID-keyed Type0 font, and `pageTexts` DROPPED
// CID runs by design (they were glyph ids, and decoding them as latin1 is noise).
// So the first build with serif headings made every heading invisible to the
// inspector: `build.js` verify 2 threw "no page carries the appendix heading", and
// every test that finds a page by its heading would have gone blind the same way -
// the permissive-direction failure this file's subject exists to prevent.
//
// The fix reads each font's ToUnicode CMap and decodes CID runs through it, which
// is what a PDF viewer's copy-paste does. This spec is the probe: one page, one
// serif line, one hanzi line, one Helvetica line - and all three must come back.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { Document, Page, Text, renderToBuffer } from '@react-pdf/renderer';

import { registerPdfFonts, FAMILY_SERIF, FAMILY_HAN } from '../lib/pdf/fonts.js';
import { pageTexts, textBoxes } from '../lib/pdf/inspect.js';

const E = React.createElement;

async function probe() {
  registerPdfFonts();
  return renderToBuffer(E(Document, null,
    E(Page, { size: 'A4' },
      E(Text, { style: { fontFamily: FAMILY_SERIF, fontSize: 20 } }, 'Istilah dalam Bacaanmu'),
      E(Text, { style: { fontFamily: FAMILY_SERIF, fontWeight: 600, fontSize: 13 } }, 'Kursi Pasangan'),
      E(Text, { style: { fontFamily: FAMILY_HAN, fontSize: 20 } }, '丙子'),
      E(Text, { style: { fontSize: 11 } }, 'Helvetica tetap terbaca.'))));
}

test('pageTexts READS TEXT DRAWN IN AN EMBEDDED (CID) FACE', async () => {
  const [page] = pageTexts(await probe());
  assert.ok(page.includes('Istilah dalam Bacaanmu'), `serif 400 invisible; page text was ${JSON.stringify(page)}`);
  assert.ok(page.includes('Kursi Pasangan'), 'serif 600 invisible');
  assert.ok(page.includes('丙子'), 'the hanzi face decodes to its characters');
  assert.ok(page.includes('Helvetica tetap terbaca.'), 'and the simple font still reads');
});

test('pageTexts CARRIES NO GLYPH-ID NOISE: no NUL, no C0 control bytes', async () => {
  const [page] = pageTexts(await probe());
  // The failure the old heuristic existed for: CID bytes read as latin1.
  assert.equal(/[\u0000-\u0008\u000e-\u001f]/u.test(page), false, JSON.stringify(page));
});

test('textBoxes DECODES THE SAME RUNS, with their sizes', async () => {
  const runs = textBoxes(await probe())[0];
  const serif = runs.find((r) => r.text.includes('Istilah dalam Bacaanmu'));
  assert.ok(serif, `no serif run; runs were ${JSON.stringify(runs.map((r) => r.text))}`);
  assert.equal(serif.size, 20);
});
