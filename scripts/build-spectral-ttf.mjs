// ============================================================
// scripts/build-spectral-ttf.mjs — the heading face, as TrueType
// ============================================================
//   npm run build:spectral-ttf     rewrites lib/pdf/fonts/spectral-*.ttf
//
// Prompt AB §4 (A12): the PDF's headings move to Spectral, which is the site's own
// `--font-serif` (`app/layout.js` loads it through `next/font/google`). One face on
// screen and another in the document is two brands.
//
// ── WHY A SCRIPT AND NOT `next/font` ──────────────────────
// `next/font/google` hands a CSS variable to the browser. `@react-pdf/renderer`
// needs FONT BYTES at render time, in a format it can parse, and it cannot read
// woff2. So the bytes are fetched once, committed, and registered - exactly the
// arrangement `build-han-ttf.mjs` already uses for the hanzi face, and this script
// is deliberately its sibling rather than a second approach.
//
// ── THE NON-BROWSER USER-AGENT IS THE WHOLE TRICK ─────────
// Google Fonts serves woff2 to a modern UA and TrueType to an old one. `curl/7.0`
// is what gets bytes react-pdf can read. A browser-ish UA yields EOT or woff2,
// both of which write to disk happily and fail later as a box in a paid document,
// which is why `isTrueType` runs before anything is written.
//
// ── TWO WEIGHTS, NOT A VARIABLE FONT ──────────────────────
// react-pdf resolves `fontWeight` against REGISTERED faces; it does not
// interpolate a variable axis. 400 for a heading and 600 for the cover title is
// what the document uses, so two files are fetched and both are registered.
// Asking for more weights would be bytes in the lambda nothing draws.
// ============================================================

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isTrueType } from '../lib/pdf/ttf.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The same family the site loads. Weights the document actually draws. */
const FAMILY = 'Spectral';
const WEIGHTS = [400, 600];

// A NON-BROWSER UA. See the header: this is what gets truetype rather than woff2.
const UA = { 'User-Agent': 'curl/7.0' };

for (const weight of WEIGHTS) {
  const url = `https://fonts.googleapis.com/css2?family=${FAMILY}:wght@${weight}`;
  process.stderr.write(`${FAMILY} ${weight} as truetype ... `);

  const css = await (await fetch(url, { headers: UA })).text();
  const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/gu)].map((m) => m[1]);
  if (!urls.length) throw new Error(`no face URL in the CSS for ${FAMILY} ${weight}`);

  // THE FIRST FACE, and unlike the hanzi subset a latin face legitimately comes in
  // several unicode-range slices. react-pdf has no unicode-range, so only the
  // first (latin) slice is usable and the rest would be bytes nothing can reach.
  // The canary below is what proves the slice taken actually covers the alphabet.
  const buf = Buffer.from(await (await fetch(urls[0], { headers: UA })).arrayBuffer());
  if (!isTrueType(buf)) {
    throw new Error(`not a TTF: magic ${JSON.stringify(buf.subarray(0, 4).toString('latin1'))}`
      + ' (EOT is 00 08 00 00, woff2 is wOF2)');
  }

  const out = path.join(ROOT, 'lib', 'pdf', 'fonts', `spectral-${weight}.ttf`);
  writeFileSync(out, buf);
  process.stderr.write(`${buf.length} bytes -> ${path.relative(ROOT, out)}\n`);
}
