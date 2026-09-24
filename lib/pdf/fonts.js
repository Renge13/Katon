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
// the file and handing over a data URL gives the loader the string it actually wants.
//
// Base64 costs ~33% over the 19.6 kB subset. Irrelevant at this size, and it buys a
// font that cannot go missing between here and production.
//
// ── AND THE READ ITSELF WAS THE 500 (fixed 2026-09-21) ────
// The paragraph above said reading the file "keeps the asset referenced from code".
// THAT WAS FALSE, and it cost every deployed PDF request. `fs.readFileSync` of a path
// built with `path.join` is not a reference any bundler can follow, so the face was
// never traced into the lambda - and webpack inlines `import.meta.url` as a literal,
// so the compiled chunk looked for it under the BUILD MACHINE's directory:
//
//   $ grep -roh "file:///D:/claude-projects/katon[^\"']*" .next/server/
//         1 file:///D:/claude-projects/katon/lib/render/prompt.js
//         1 file:///D:/claude-projects/katon/lib/pdf/fonts.js
//   $ node -e "...app/api/pair/[id]/pdf/route.js.nft.json..."
//     files traced: 238      font files: (NONE)
//
// Both faults are invisible locally, because the build machine IS the runtime and the
// baked path is correct. `GET /api/pair/[id]/pdf` and the mirror's PDF route both
// returned a bodyless 500 from the throw below on every deploy.
//
// The fix is `lib/render/prompt.js`'s, not a new one: a cwd-rooted second candidate,
// and an `outputFileTracingIncludes` entry in `next.config.mjs`. That module met this
// exact pair of faults in Prompt J and it carries the renderer prompts in production
// today, so it is a proven mechanism rather than a plausible one. See
// `tests/pdf-font-lambda.spec.mjs` for what each half is pinned by.
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

/**
 * Where the face lives, relative to the repo root.
 *
 * `next.config.mjs` adds it to `outputFileTracingIncludes` so the Vercel bundle ships
 * it at this same relative path, which is what makes the cwd candidate below resolve.
 * If a deploy ever throws here, that trace entry is the thing that broke.
 */
export const HAN_TTF_RELATIVE = path.join('lib', 'pdf', 'fonts', 'noto-serif-tc-han.ttf');

/**
 * The heading face. The site's own `--font-serif` (`app/layout.js`), so the
 * document and the page are one brand rather than two.
 *
 * TWO WEIGHTS, REGISTERED SEPARATELY, because react-pdf resolves `fontWeight`
 * against registered faces and does not interpolate a variable axis. Fetched by
 * `npm run build:spectral-ttf`, committed, and traced into the lambda beside the
 * hanzi face - see `next.config.mjs`, and see #123 for what a font that is not
 * traced does in production.
 */
export const FAMILY_SERIF = 'KatonSerif';

export const SERIF_TTF_RELATIVE = Object.freeze({
  400: path.join('lib', 'pdf', 'fonts', 'spectral-400.ttf'),
  600: path.join('lib', 'pdf', 'fonts', 'spectral-600.ttf'),
});

/** The module-relative path. Exact under `node --test` and the CLI scripts. */
export const HAN_TTF = path.join(HERE, 'fonts', 'noto-serif-tc-han.ttf');

/**
 * Where to look for the face, in order. `lib/render/prompt.js#promptCandidates`, and
 * deliberately the same shape - two modules solving one problem two ways is how the
 * second one gets it wrong.
 *
 * Neither candidate is reliable alone:
 *   - module-relative, exact under `node --test` and the CLI scripts, and WRONG once
 *     a bundler has relocated this file into a chunk and frozen `import.meta.url` as
 *     the build machine's path;
 *   - cwd-relative, which is what holds on Vercel (the function's working directory
 *     is the traced project root) and in every npm script.
 *
 * @returns {string[]} absolute paths, most specific first
 */
export function fontCandidates() {
  return [HAN_TTF, path.join(process.cwd(), HAN_TTF_RELATIVE)];
}

/**
 * The same two candidates for any face under `lib/pdf/fonts/`.
 *
 * Generalised from `fontCandidates` rather than written a second time: the whole
 * reason `lib/render/prompt.js`'s shape was copied for the hanzi face was that two
 * modules solving one problem two ways is how the second gets it wrong, and a
 * third face would have been the third way.
 *
 * @param {string} relative repo-relative path to the TTF
 * @returns {string[]} absolute paths, module-relative first
 */
export function serifCandidates(relative) {
  // `HERE` is `lib/pdf`, and the faces live in `lib/pdf/fonts` - the same join
  // `HAN_TTF` makes. Dropping `'fonts'` here made the module-relative candidate
  // miss every time and left the cwd one silently carrying both faces, which is a
  // fallback doing the primary's job and is invisible until someone runs a script
  // from another directory.
  return [
    path.join(HERE, 'fonts', path.basename(relative)),
    path.join(process.cwd(), relative),
  ];
}

/**
 * Read a font file from candidates, or throw naming what it tried.
 *
 * The body of `readHanTtf`, taken out so the serif faces get the identical
 * behaviour - including throwing rather than returning an empty buffer, which is
 * what keeps a missing face an error instead of tofu in a paid document.
 *
 * @param {string[]} candidates absolute paths, in order
 * @param {string} label what to name in the error
 * @param {string} [hint] the command that regenerates it
 * @returns {Buffer}
 */
export function readTtf(candidates, label, hint = null) {
  for (const candidate of candidates) {
    try {
      return fs.readFileSync(candidate);
    } catch {
      // Try the next. A genuinely missing face falls out below, with the list.
    }
  }
  throw new Error(`pdf fonts: ${label} is missing.${hint ? ` ${hint}` : ''}`
    + `\nTried:\n  ${candidates.join('\n  ')}`);
}

/**
 * Read the hanzi face, or throw naming every path tried.
 *
 * IT THROWS RATHER THAN RETURNING EMPTY. The subset and canary checks in
 * `registerPdfFonts` are downstream of this read, so a quiet zero-length buffer would
 * surface as tofu in a paid document instead of as an error - which is the failure
 * this file exists to prevent.
 *
 * @param {string[]} [candidates] paths to try, in order
 * @returns {Buffer} the TTF
 * @throws {Error} if no candidate resolves
 */
export function readHanTtf(candidates = fontCandidates()) {
  return readTtf(candidates, HAN_TTF_RELATIVE, 'Run npm run build:han-ttf.');
}

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

  // `readHanTtf` is the existence check: a read that fails on every candidate throws
  // with the list, where `fs.existsSync` on one path could only ever report on one.
  const buf = readHanTtf();
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
  // ── THE HEADING FACE, SAME PATH DISCIPLINE (AB §4, A12) ──
  // Read through the same two-candidate resolver as the hanzi face and handed over
  // as a data URL for the same reason. Both weights are registered under ONE family
  // with different `fontWeight`s, which is how react-pdf selects between faces -
  // it does not interpolate.
  //
  // IT IS NOT VERIFIED WITH A CANARY, and the asymmetry is deliberate. The hanzi
  // face is a SUBSET built by a script that has silently dropped a glyph before, so
  // it is checked glyph by glyph. Spectral is a whole latin face; the failure it
  // can actually have is being absent or being woff2, and both of those throw here
  // rather than drawing tofu. `npm run build:spectral-ttf` checks coverage at fetch
  // time, which is where a subset question belongs.
  for (const [weight, relative] of Object.entries(SERIF_TTF_RELATIVE)) {
    Font.register({
      family: FAMILY_SERIF,
      fontWeight: Number(weight),
      src: `data:font/ttf;base64,${readTtf(
        serifCandidates(relative), relative, 'Run npm run build:spectral-ttf.',
      ).toString('base64')}`,
    });
  }

  // A hyphenation callback that returns the word whole. react-pdf's default
  // hyphenator is built for Latin and will break a run of hanzi at arbitrary points;
  // Chinese does not hyphenate, and a broken pillar reads as a typo in a paid
  // document. Registered here because it is a property of drawing this face.
  //
  // IT APPLIES DOCUMENT-WIDE, which is the other half of why it is here: react-pdf
  // takes ONE hyphenation callback, so registering the serif does not get its own.
  // Indonesian is not hyphenated in this document either, and a heading broken
  // mid-word is the same typo one face over.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
  return { family: FAMILY_HAN, glyphs: HAN_GLYPHS.length };
}

/** Test helper, so a spec can assert the verification path. Never a request path. */
export function __resetPdfFonts() {
  registered = false;
}
