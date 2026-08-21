// ============================================================
// The PDF's hanzi face — coverage of the COMMITTED file
// ============================================================
// Run: npm run test:pdf-han-font
//
// No network. `npm run build:han-ttf` verifies coverage before it writes; this
// verifies the file that is actually in the repo, which is the one a build will ship.
// A regeneration that quietly came back short would otherwise reach a paid PDF as a
// tofu box, and no check about layout, page count or colour can see that.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HAN_GLYPHS, HAN_FAMILY } from '../lib/card/hanFont.js';
import { codePointsOf, isTrueType } from '../lib/pdf/ttf.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TTF = path.join(ROOT, 'lib', 'pdf', 'fonts', 'noto-serif-tc-han.ttf');

test('the PDF hanzi face is committed, and it is a TTF', () => {
  // react-pdf takes TTF and cannot read the card's woff2. EOT (00 08 00 00) is what a
  // browser-ish User-Agent returns from the same endpoint, so the magic is asserted
  // rather than the file extension.
  assert.ok(fs.existsSync(TTF), `${path.relative(ROOT, TTF)} is missing; run npm run build:han-ttf`);
  assert.ok(isTrueType(fs.readFileSync(TTF)), 'not a TTF - EOT and woff2 both fail here');
});

test('IT COVERS EVERY GLYPH THE CARD CAN DRAW, 申 INCLUDED', () => {
  // The two subsets must hold the same characters: the PDF prints the same pillars the
  // card does. The set is read from the card's own generated module, so the lists
  // cannot drift - and coverage is read from the font's cmap, so the font is asked
  // what it contains rather than trusted to honour the request.
  const covered = codePointsOf(fs.readFileSync(TTF));
  const missing = [...HAN_GLYPHS].filter((c) => !covered.has(c.codePointAt(0)));
  assert.deepEqual(missing, [], `the committed TTF is short of: ${missing.join('')}`);
  assert.ok(HAN_GLYPHS.length >= 60, 'the fixture set should be the full ~65, not a stub');
});

test('申 IS PINNED BY NAME, because it is the glyph that went missing once', () => {
  // Google's subsetter dropped 印 and 申 from a 65-glyph woff2 request on 2026-08-17,
  // which is why the card's face is two @font-face rules. 申 is an EARTHLY BRANCH, so
  // it appears in the chart of anyone born in a 申 year, month, day or hour.
  const covered = codePointsOf(fs.readFileSync(TTF));
  for (const canary of ['申', '印']) {
    assert.ok(covered.has(canary.codePointAt(0)), `${canary} is absent from the PDF face`);
  }
});

test('ONE FACE, because react-pdf has no unicode-range', () => {
  // The card's woff2 is TWO faces and a browser picks between them by unicode-range.
  // react-pdf registers one source per family and has no such concept, so a split
  // subset would render tofu for whatever landed in the second file. This asserts the
  // shape the PDF depends on: a single file that covers the whole set on its own.
  const covered = codePointsOf(fs.readFileSync(TTF));
  const inOneFile = [...HAN_GLYPHS].every((c) => covered.has(c.codePointAt(0)));
  assert.ok(inOneFile, 'the whole set must be reachable from ONE file');
  assert.equal(HAN_FAMILY, 'Noto Serif TC', 'the family name the PDF will register');
});

test('the cmap reader REFUSES an unknown subtable rather than reporting a short set', () => {
  // A parser gap and a subsetter bug must never look the same: one is our defect, the
  // other is tofu in a paid document. Format 13 is real but not served here.
  const buf = Buffer.alloc(64);
  buf.writeUInt16BE(1, 4); // one table
  buf.write('cmap', 12, 'latin1');
  buf.writeUInt32BE(28, 12 + 8); // cmap at 28
  buf.writeUInt16BE(1, 28 + 2); // one subtable
  buf.writeUInt32BE(12, 28 + 4 + 4); // subtable at cmap+12 = 40
  buf.writeUInt16BE(13, 40); // format 13
  assert.throws(() => codePointsOf(buf), /unhandled cmap subtable format 13/);
});
