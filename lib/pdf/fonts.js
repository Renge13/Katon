// ============================================================
// The PDF's faces — Font.register, once, and verified before use
// ============================================================
// Prompt M build step 2. `@react-pdf/renderer` resolves `fontFamily` against a
// global registry, so registration is a side effect on a module-level singleton and
// has to be idempotent: the build script, a route and a test can all reach it in one
// process, and registering the same family twice is at best wasted work.
//
// ── THE FACE GOES IN AS A DATA URL, NOT A PATH AND NOT A BUFFER ──
// `Font.register` takes a STRING src - a path, a URL, or a data URL - and calls
// `substring` on it. A Buffer therefore dies inside the font loader with
// "dataUrl.substring is not a function", which is how this file learned the contract
// rather than assuming it.
//
// A path would satisfy the API and is still the wrong choice: on Vercel that path may
// not exist, because Next traces what code REFERENCES and a font named only by a
// runtime string is not necessarily bundled into the lambda. The failure mode is the
// worst kind - every local build perfect, the first paid PDF full of tofu. Reading
// the file at module scope and handing over a data URL keeps the asset referenced
// from code and gives the loader the string it actually wants.
//
// Base64 costs ~33% over the 19.6 kB subset. Irrelevant at this size, and it buys a
// font that cannot go missing between here and production.
//
// ── THE CANARY IS CHECKED AT REGISTRATION ─────────────────
// `申` is the glyph Google's subsetter dropped once. The card's build verifies the
// subset it writes and `npm run test:pdf-han-font` re-checks the committed file, so
// this is the third gate on the same character - and it is the only one of the three
// that runs in the process that is about to draw it. A short font is a paid document
// full of tofu, and no check about layout, page count or colour can see it.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Font } from '@react-pdf/renderer';

import { HAN_GLYPHS } from '../card/hanFont.js';
import { codePointsOf, isTrueType } from './ttf.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** The hanzi face. Latin never falls through to it - see FAMILY_LATIN. */
export const FAMILY_HAN = 'KatonHan';

/**
 * The Latin face.
 *
 * Helvetica, which react-pdf carries built in and embeds as a standard Type1 with no
 * font program. Archivo is the card's ruled typeface and is deliberately NOT used
 * here: prompt M's NOT IN THIS PROMPT section rules the design pass out of this
 * build, and swapping the body face is a design decision Reyner signs off after the
 * document's CONTENT is agreed. Naming it here rather than leaving `fontFamily`
 * unset makes that a decision on the record instead of a default nobody chose.
 */
export const FAMILY_LATIN = 'Helvetica';

export const HAN_TTF = path.join(HERE, 'fonts', 'noto-serif-tc-han.ttf');

/** The glyph a subsetter dropped once, and the reason any of this is verified. */
export const CANARY = '申';

let registered = false;

/**
 * Register every face the document draws with, and verify the hanzi subset first.
 *
 * @param {Object} [options]
 * @param {boolean} [options.force=false] re-run even if already registered. Tests
 *   only; a request path has no reason to.
 * @returns {{family: string, glyphs: number}} what was registered
 * @throws {Error} if the TTF is missing, is not a TTF, or is short of a glyph the
 *   product can draw. Loudly, before anything is rendered - a font error that
 *   surfaces as tofu in a paid PDF is the failure this exists to prevent.
 */
export function registerPdfFonts({ force = false } = {}) {
  if (registered && !force) return { family: FAMILY_HAN, glyphs: HAN_GLYPHS.length };

  if (!fs.existsSync(HAN_TTF)) {
    throw new Error(
      `pdf fonts: ${path.relative(process.cwd(), HAN_TTF)} is missing. `
      + 'Run npm run build:han-ttf.',
    );
  }
  const buf = fs.readFileSync(HAN_TTF);
  if (!isTrueType(buf)) {
    // EOT (00 08 00 00) is what a browser-ish User-Agent gets from the same
    // endpoint, and woff2 is what the card uses. Both would fail here, and the
    // message has to say which mistake was made.
    throw new Error('pdf fonts: the hanzi face is not a TTF. react-pdf cannot read '
      + 'woff2 or EOT; run npm run build:han-ttf.');
  }

  const covered = codePointsOf(buf);
  const missing = [...HAN_GLYPHS].filter((c) => !covered.has(c.codePointAt(0)));
  if (missing.length) {
    throw new Error(`pdf fonts: the hanzi subset is short of ${missing.join('')} `
      + `(${missing.length} of ${HAN_GLYPHS.length}). Regenerate with npm run build:han-ttf.`);
  }
  // Stated separately from the loop above even though it is implied by it, because
  // this is the one character with a history and a message naming it is worth more
  // than a count.
  if (!covered.has(CANARY.codePointAt(0))) {
    throw new Error(`pdf fonts: the canary ${CANARY} is missing from the subset.`);
  }

  Font.register({
    family: FAMILY_HAN,
    src: `data:font/ttf;base64,${buf.toString('base64')}`,
  });
  // A hyphenation callback that returns the word whole. react-pdf's default
  // hyphenator is built for Latin and will break a run of hanzi at arbitrary points;
  // Chinese does not hyphenate, and a broken pillar reads as a typo in a paid
  // document. Registered here because it is a property of drawing this face.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
  return { family: FAMILY_HAN, glyphs: HAN_GLYPHS.length };
}

/** Test helper, so a spec can assert the verification path. Never a request path. */
export function __resetPdfFonts() {
  registered = false;
}
