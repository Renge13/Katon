#!/usr/bin/env node
// ============================================================
// scripts/build-han-subset.mjs — the card's hanzi face, subsetted
// ============================================================
//   npm run build:han-subset      rewrites lib/card/hanFont.js
//
// ── WHY THE CARD NEEDS ITS OWN FACE AT ALL ─────────────────
// components/cards/Card.js drew every hanzi in Georgia, "Times New Roman",
// serif. Georgia has NO CJK GLYPHS, so all four sites - pillar stem, pillar
// branch, seal, watermark - were rendered by whatever the OS substituted. The
// EXPORTED PNG therefore differed between iPhone, Android and Windows, on the
// object whose entire job is to travel. A live defect, not PDF preparation.
//
// ── WHY NOT next/font ──────────────────────────────────────
// Noto_Serif_TC's `subsets` option in next/font/google is
// 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese' - there is no CJK member, so
// the `subsets: ['latin']` pattern Archivo uses has no equivalent here. Left
// unsubsetted the family is 108 unicode-range chunks. Measured 2026-08-17.
//
// ── WHY A DATA URI RATHER THAN A FILE IN /public ───────────
// html-to-image renders through an SVG foreignObject and must embed every font
// it draws. A URL means a fetch at capture time, the class of bug that already
// cost this repo a tainted canvas and an opaque getImageData. A data URI cannot
// fail to load, cannot taint, and works identically in the app, in
// `npm run preview:cards` and in `npm run probe:card-export` - three surfaces
// that would otherwise need three copies of the same @font-face.
//
// LICENSE: Noto Serif TC is SIL Open Font License 1.1. Redistribution of a
// subset is permitted; the license travels with it and is named in the module.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lib', 'card', 'hanFont.js');
const FAMILY = 'Noto Serif TC';
const UA = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

// THE GLYPH SET IS DERIVED, NEVER TYPED. Every hanzi the card can draw comes
// from the chart (ten stems, twelve branches) or from a glossary label, and
// glossary.json turns out to be a superset of both - 65 distinct characters,
// with the stems, the branches and both characters of 胎元 already inside it.
const glossary = fs.readFileSync(path.join(ROOT, 'docs', 'content', 'glossary.json'), 'utf8');
const glyphs = [...new Set([
  ...(glossary.match(/[㐀-䶿一-鿿]/gu) || []),
  ...'甲乙丙丁戊己庚辛壬癸',
  ...'子丑寅卯辰巳午未申酉戌亥',
  '胎', '元',
])].sort();

const cssUrl = (chars) => 'https://fonts.googleapis.com/css2?family='
  + FAMILY.replace(/ /g, '+') + ':wght@400&text=' + encodeURIComponent(chars.join(''));

async function fetchFace(chars) {
  const css = await (await fetch(cssUrl(chars), { headers: UA })).text();
  const src = css.match(/url\((https:\/\/[^)]+)\)/);
  const range = css.match(/unicode-range:\s*([^;}]+)/);
  if (!src) throw new Error("no font url in Google's response:\n" + css.slice(0, 400));
  const buf = Buffer.from(await (await fetch(src[1], { headers: UA })).arrayBuffer());
  // A silent HTML error page would otherwise be base64'd into the module and
  // fail only in a browser, as a box, which nothing here would catch.
  if (buf.subarray(0, 4).toString('latin1') !== 'wOF2') {
    throw new Error('not a woff2: ' + JSON.stringify(buf.subarray(0, 8).toString('latin1')));
  }
  const covered = (range ? range[1].split(',') : [])
    .map((r) => parseInt(r.trim().replace('U+', ''), 16))
    .filter(Number.isFinite);
  return { buf, range: range ? range[1].trim() : null, covered };
}

// ── GOOGLE'S SUBSETTER DOES NOT ALWAYS HONOUR THE WHOLE LIST ──
// Measured 2026-08-17: asking for all 65 returned a subset declaring 63, and the
// two it dropped were 印 and 申. 申 is an EARTHLY BRANCH, which the card draws in
// a pillar cell, so the first build of this file would have rendered tofu on
// every chart carrying a 申 branch. Asked for on their own, both come back fine.
//
// So coverage is VERIFIED against the server's own unicode-range rather than
// assumed from the request, and whatever is missing is fetched again and emitted
// as an additional @font-face. Several faces under one family is ordinary CSS -
// the browser picks per unicode-range. The build THROWS if coverage is still
// short, because a short subset fails as a box in an exported PNG and no check
// about colour, size or layout can see that.
const faces = [];
let remaining = [...glyphs];
for (let pass = 0; pass < 4 && remaining.length; pass++) {
  const face = await fetchFace(remaining);
  faces.push(face);
  const before = remaining.length;
  remaining = remaining.filter((c) => !face.covered.includes(c.codePointAt(0)));
  console.error('  pass ' + (pass + 1) + ': asked ' + before
    + ', covered ' + face.covered.length + ', ' + face.buf.length + ' bytes'
    + (remaining.length ? ', still missing ' + remaining.join('') : ''));
  if (remaining.length === before) {
    throw new Error('no progress; unservable glyphs: ' + remaining.join(''));
  }
}
if (remaining.length) throw new Error('subset short of: ' + remaining.join(''));

const bytes = faces.reduce((n, f) => n + f.buf.length, 0);
const payload = faces.map((f) => ({ b64: f.buf.toString('base64'), range: f.range }));

// The emitted module uses plain concatenation and NO template literals, so a
// generator that writes a generator needs no escaping tricks to stay readable.
const mod = [
  '// GENERATED by scripts/build-han-subset.mjs - do not edit by hand.',
  '// Regenerate with: npm run build:han-subset',
  '//',
  '// ' + FAMILY + ', subsetted to the ' + glyphs.length + ' hanzi the card can draw,',
  '// in ' + faces.length + ' @font-face rule(s). The build script says why that can exceed one.',
  '// SIL Open Font License 1.1 - https://openfontlicense.org',
  '//',
  '// The set is DERIVED from docs/content/glossary.json plus the ten stems, the twelve',
  '// branches and both characters of 胎元; the glossary is a superset of all three.',
  '// Coverage is asserted at build time AND in tests/card.spec.mjs - a missing glyph is a',
  '// box in an exported PNG, and that is invisible to every other check this repo has.',
  '//',
  '// ' + bytes + ' bytes of woff2 across ' + faces.length + ' face(s).',
  '',
  '/** The family name the card asks for. Must match the @font-face rules below. */',
  'export const HAN_FAMILY = ' + JSON.stringify(FAMILY) + ';',
  '',
  '/** Every hanzi the subset contains, sorted. */',
  'export const HAN_GLYPHS = ' + JSON.stringify(glyphs.join('')) + ';',
  '',
  'const HAN_FACES = ' + JSON.stringify(payload) + ';',
  '',
  '/**',
  ' * The @font-face rules, as CSS text.',
  ' *',
  ' * Rendered into a <style> the card owns, so the face travels with the markup into',
  ' * every surface that renders it - the app, the preview page, the export probe - from',
  ' * ONE definition. font-display is block rather than swap: a card is captured to a PNG,',
  ' * and swapping mid-capture would bake the fallback glyphs into the file.',
  ' */',
  'export function hanFontFaceCss() {',
  '  return HAN_FACES.map(function (f) {',
  '    return "@font-face{font-family:\'" + HAN_FAMILY + "\';font-style:normal;font-weight:400;"',
  '      + "font-display:block;src:url(data:font/woff2;base64," + f.b64 + ") format(\'woff2\');"',
  '      + (f.range ? "unicode-range:" + f.range + ";" : "")',
  '      + "}";',
  '  }).join("");',
  '}',
  '',
].join('\n');

fs.writeFileSync(OUT, mod);
console.error('wrote ' + path.relative(ROOT, OUT));
console.error(FAMILY + ': ' + glyphs.length + ' glyphs, ' + faces.length
  + ' face(s), ' + bytes + ' bytes woff2');
