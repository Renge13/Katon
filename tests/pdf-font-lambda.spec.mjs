// ============================================================
// tests/pdf-font-lambda.spec.mjs — the hanzi face survives the BUNDLER
// ============================================================
// Run: npm run test:pdf-font-lambda
//
// ── THE DEFECT THIS PINS, MEASURED 2026-09-21 ──────────────
// `GET /api/pair/[id]/pdf` returned a bodyless 500 on the #122 preview. The cause
// was not in #122 - it is in `lib/pdf/fonts.js` and it has been there since the PDF
// shipped, on the mirror's route as well as the pair's. Two independent faults, both
// read off the built artifact rather than reasoned about:
//
//   $ npx next build
//   $ grep -roh "file:///D:/claude-projects/katon[^\"']*" .next/server/
//         1 file:///D:/claude-projects/katon/lib/render/prompt.js
//         1 file:///D:/claude-projects/katon/lib/pdf/fonts.js
//
// 1. THE PATH IS THE BUILD MACHINE'S. Webpack inlines `import.meta.url` as a literal,
//    so the compiled chunk carries
//        path.dirname(fileURLToPath("file:///D:/claude-projects/katon/lib/pdf/fonts.js"))
//    and looks for the face under a directory that does not exist in the lambda.
//
//   $ node -e "...require('.next/server/app/api/pair/[id]/pdf/route.js.nft.json')..."
//     files traced: 238      font files: (NONE)
//
// 2. THE FACE IS NOT IN THE BUNDLE AT ALL. Next traces what code REFERENCES, and a
//    path built with `path.join` is not a reference it can follow. The same trace
//    lists `glossary.json`, `stem-combinations.json` and both renderer prompts - so
//    the instrument can see assets; it sees four and not this one.
//
// `fs.existsSync` therefore returns false and `registerPdfFonts` throws its "is
// missing. Run npm run build:han-ttf." error, uncaught, on every deployed PDF
// request. Locally both faults are invisible, because the build machine and the
// runtime are the same machine and the baked path is correct.
//
// ── WHY THE FIX IS `lib/render/prompt.js`'s AND NOT A NEW ONE ──
// That module hit this exact pair of faults in Prompt J and solved both: a
// cwd-rooted second candidate, and an `outputFileTracingIncludes` entry. It is
// load-bearing for every reading served today, so it is a proven mechanism rather
// than a plausible one. The font was the one runtime asset that never got it.
//
// ── WHAT THESE ASSERTIONS CAN AND CANNOT SEE ───────────────
// Locally the two candidates RESOLVE TO THE SAME FILE, so no test run on this
// machine can tell a one-candidate loader from a two-candidate one by loading the
// font. That is the whole reason the defect survived. So the fallback is exercised
// with a deliberately wrong first candidate - the bundled case, reproduced in
// process - and the trace entry is asserted against `next.config.mjs` itself, which
// is the artifact that was wrong.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';

import nextConfig from '../next.config.mjs';
import {
  fontCandidates, readHanTtf, HAN_TTF_RELATIVE, CANARY,
} from '../lib/pdf/fonts.js';
import { codePointsOf, isTrueType } from '../lib/pdf/ttf.js';

test('A CANDIDATE IS ROOTED AT cwd, NOT AT import.meta.url', () => {
  const candidates = fontCandidates();
  const fromCwd = path.join(process.cwd(), HAN_TTF_RELATIVE);

  assert.ok(
    candidates.includes(fromCwd),
    'the lambda finds the face through its working directory - the traced project '
    + `root. Candidates were:\n  ${candidates.join('\n  ')}`,
  );
  // NOT asserted: that the two candidates DIFFER. Run from the repo root they are
  // the same string, which is the whole reason this defect survived every local
  // green - so an assertion that they differ would fail here on correct code and
  // pass only where nobody runs it. The property that matters is that a path the
  // bundler cannot freeze is in the list at all; the fallback test below is what
  // exercises the two being tried in turn.
  assert.ok(candidates.length >= 2, 'both candidates, module-relative first');
});

test('THE FACE IS FOUND WHEN THE FIRST CANDIDATE IS WRONG - the bundled case', () => {
  // What the lambda actually presents: a first candidate under a build-machine
  // directory that does not exist, and a cwd-rooted one that does. A loader with no
  // fallback throws here, which is the 500.
  const bundled = [
    path.join(path.sep, 'vercel', 'path0-does-not-exist', HAN_TTF_RELATIVE),
    path.join(process.cwd(), HAN_TTF_RELATIVE),
  ];

  const buf = readHanTtf(bundled);
  assert.ok(isTrueType(buf), 'a real TTF came back, not a stub or an empty read');
  assert.ok(
    codePointsOf(buf).has(CANARY.codePointAt(0)),
    `the face found through the fallback still carries the canary ${CANARY}`,
  );
});

test('EVERY CANDIDATE MISSING IS A LOUD THROW THAT NAMES WHAT IT TRIED', () => {
  // The fallback must not turn a genuinely absent font into a quiet empty buffer.
  // `registerPdfFonts`'s subset and canary checks are downstream of this read, so a
  // silent failure here would surface as tofu in a paid document instead of an
  // error - the failure `lib/pdf/fonts.js` exists to prevent.
  const nowhere = [
    path.join(path.sep, 'no-such-root-a', HAN_TTF_RELATIVE),
    path.join(path.sep, 'no-such-root-b', HAN_TTF_RELATIVE),
  ];
  assert.throws(() => readHanTtf(nowhere), (err) => {
    assert.match(err.message, /no-such-root-a/u, 'the message lists what it tried');
    assert.match(err.message, /no-such-root-b/u);
    assert.match(err.message, /build:han-ttf/u, 'and still says how to regenerate it');
    return true;
  });
});

test('next.config.mjs TRACES THE FACE INTO EVERY /api BUNDLE', () => {
  // Finding the right path is half of it. The file has to BE in the lambda, and
  // tracing is what puts it there. The two renderer prompts are already listed here
  // for exactly this reason; the font is the entry that was missing.
  const includes = nextConfig.outputFileTracingIncludes ?? {};
  const api = includes['/api/**/*'] ?? [];

  const wanted = `./${HAN_TTF_RELATIVE.split(path.sep).join('/')}`;
  assert.ok(
    api.includes(wanted),
    `the hanzi face must be traced into the serverless bundle as ${wanted}. `
    + `The /api entries are:\n  ${api.join('\n  ')}`,
  );
  // The prompts are asserted alongside it rather than left implicit: this list is
  // the one place a deploy's runtime assets are declared, and a future edit that
  // adds the font by replacing the array would pass an assertion about the font
  // alone while breaking every render.
  assert.ok(api.includes('./docs/content/renderer-prompt.txt'), 'the mirror prompt is still traced');
  assert.ok(api.includes('./docs/content/compat-renderer-prompt.txt'), 'and the pair prompt');
});
