#!/usr/bin/env node
// ============================================================
// scripts/build-han-ttf.mjs — the same hanzi subset, as TTF, for the PDF
// ============================================================
//   npm run build:han-ttf     rewrites lib/pdf/fonts/noto-serif-tc-han.ttf
//
// Prompt M build step 2. `@react-pdf/renderer` takes TTF and cannot read the woff2
// the card uses, so the PDF needs the same glyphs in a second format. This is the
// TTF sibling of scripts/build-han-subset.mjs and it deliberately shares that
// script's OUTPUT rather than re-deriving its input.
//
// ── THE GLYPH SET COMES FROM THE CARD'S OWN SUBSET ─────────
// It reads `HAN_GLYPHS` out of lib/card/hanFont.js, which build-han-subset.mjs
// generates from glossary.json plus the ten stems, the twelve branches and both
// characters of 胎元. Re-deriving the set here would give two lists that agree today
// and drift the first time the glossary grows. Reading the generated one makes the
// two subsets cover the same characters BY CONSTRUCTION.
//
// ── WHY A DIFFERENT USER-AGENT ─────────────────────────────
// Google Fonts content-negotiates on UA, and the `&text=` subsetting parameter works
// the same either way. Measured 2026-08-21 against `Noto Serif TC` with `text=甲申`:
//
//   Chrome 120 UA   -> format('woff2'),    magic "wOF2"
//   MSIE 8 UA       -> (no format given),  magic 00 08 00 00   <- EOT, unusable
//   curl/7.0        -> format('truetype'), magic 00 01 00 00   <- what we want
//
// So the "legacy UA" trick is really a NON-BROWSER UA. MSIE returns EOT, which would
// have failed later and less clearly, so the magic bytes are asserted rather than the
// format string.
//
// ── ONE FACE, WHICH IS A REQUIREMENT AND NOT A PREFERENCE ──
// The woff2 build emits TWO @font-face rules, because Google's subsetter dropped 印
// and 申 from a 65-glyph request and the fix was a second request emitted as a second
// face. A browser picks between faces by unicode-range; **react-pdf cannot** - it
// registers one source per family and has no unicode-range concept. So a two-file TTF
// would render tofu for whichever glyphs landed in the second file.
//
// Measured 2026-08-21: the truetype response for all 65 comes back as ONE file, and
// coverage is verified below rather than assumed. If Google ever drops a glyph from
// the TTF path this script THROWS instead of writing a font with a hole in it.
//
// ── 申 IS THE CANARY ───────────────────────────────────────
// It is an EARTHLY BRANCH, so it appears in the chart of anyone born in a 申 year,
// month, day or hour, and it is the glyph Google's subsetter dropped once already. A
// missing glyph is a tofu box in a paid PDF and no check about layout, colour or page
// count can see it. Coverage is therefore read out of the font's own `cmap` table -
// the font is asked what it contains, not the request and not the CSS.
//
// LICENSE: Noto Serif TC is SIL Open Font License 1.1. Redistribution of a subset is
// permitted; the license travels with the file and is named in lib/pdf/fonts/README.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { HAN_GLYPHS, HAN_FAMILY } from '../lib/card/hanFont.js';
// ONE cmap reader, shared with the test that checks the COMMITTED file. Two
// implementations of the same measurement is a mistake this session already paid for.
import { codePointsOf, isTrueType } from '../lib/pdf/ttf.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lib', 'pdf', 'fonts', 'noto-serif-tc-han.ttf');

// A NON-BROWSER UA. See the header: this is what gets truetype rather than woff2.
const UA = { 'User-Agent': 'curl/7.0' };

const cssUrl = (chars) => 'https://fonts.googleapis.com/css2?family='
  + HAN_FAMILY.replace(/ /g, '+') + ':wght@400&text=' + encodeURIComponent(chars);

const glyphs = [...HAN_GLYPHS];
process.stderr.write(`asking for ${glyphs.length} glyphs as truetype ... `);

const css = await (await fetch(cssUrl(HAN_GLYPHS), { headers: UA })).text();
const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);
if (urls.length !== 1) {
  throw new Error(`expected ONE face, got ${urls.length}. react-pdf has no `
    + 'unicode-range, so a split subset would render tofu. See this file\'s header.');
}

const buf = Buffer.from(await (await fetch(urls[0], { headers: UA })).arrayBuffer());
// An HTML error page, or EOT from a browser-ish UA, would otherwise be written to
// disk and fail later as a box in a paid document.
if (!isTrueType(buf)) {
  throw new Error('not a TTF: magic ' + JSON.stringify(buf.subarray(0, 4).toString('latin1'))
    + ' (EOT is 00 08 00 00, woff2 is wOF2)');
}
process.stderr.write(`${buf.length} bytes\n`);

const covered = codePointsOf(buf);
const missing = glyphs.filter((c) => !covered.has(c.codePointAt(0)));
if (missing.length) {
  throw new Error(`the TTF subset is SHORT of ${missing.length} glyph(s): ${missing.join('')}`
    + '\nA missing glyph is a tofu box in a paid PDF. Refusing to write it.');
}
if (!covered.has('申'.codePointAt(0))) {
  throw new Error('申 is absent - the canary. See this file\'s header.');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`${glyphs.length} glyphs, ${buf.length} bytes, one face, 申 present`);
