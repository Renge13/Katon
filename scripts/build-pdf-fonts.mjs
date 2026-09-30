#!/usr/bin/env node
// ============================================================
// scripts/build-pdf-fonts.mjs — every Latin face the PDF draws, as TrueType
// ============================================================
//   npm run build:pdf-fonts        (build:spectral-ttf is an alias)
//
// The faces are lib/pdf/fonts.js LATIN_FACES, read here rather than listed: one list
// for registration, this fetch, and the lambda-trace test. Generalised from
// scripts/build-spectral-ttf.mjs (3859cc9) when Prompt AW added Spectral's italic and
// the site's sans, Hanken Grotesk. Same method: react-pdf cannot read woff2, so the
// Google Fonts CSS2 endpoint is asked with a non-browser User-Agent, which answers
// with TrueType, and every file is checked for the TrueType magic before it is
// written. The files are committed; nothing fetches at request time.
// ============================================================

import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LATIN_FACES } from '../lib/pdf/fonts.js';
import { isTrueType } from '../lib/pdf/ttf.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = { 'User-Agent': 'curl/7.0' };

for (const face of LATIN_FACES) {
  const url = `https://fonts.googleapis.com/css2?family=${face.google}`;
  process.stderr.write(`${face.google} as truetype ... `);
  const css = await (await fetch(url, { headers: UA })).text();
  const urls = [...css.matchAll(/url\((https:\/\/[^)]+)\)/gu)].map((m) => m[1]);
  if (urls.length !== 1) throw new Error(`expected one face URL for ${face.google}, found ${urls.length}`);
  const buf = Buffer.from(await (await fetch(urls[0], { headers: UA })).arrayBuffer());
  if (!isTrueType(buf)) {
    throw new Error(`not a TTF: magic ${JSON.stringify(buf.subarray(0, 4).toString('latin1'))}`
      + ' (EOT is 00 08 00 00, woff2 is wOF2)');
  }
  const out = path.join(ROOT, face.relative);
  writeFileSync(out, buf);
  process.stderr.write(`${buf.length} bytes -> ${face.relative}\n`);
}
