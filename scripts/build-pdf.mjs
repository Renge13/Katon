#!/usr/bin/env node
// ============================================================
// scripts/build-pdf.mjs — emit a Complete Edition PDF
// ============================================================
//   npm run build:pdf                       chart 1, the full document
//   npm run build:pdf -- --reading-only     build step 2's one page
//   npm run build:pdf -- --date 1988-07-10 --time 22:00
//   npm run build:pdf -- --out reports/x.pdf
//
// SPENDS NOTHING BY DEFAULT. The reading comes from `render_cache` if a row exists,
// and from the deterministic FLOOR if one does not - never from a provider. Prompt M:
// "The PDF reads render_cache and never re-renders. A PDF that regenerates its own
// prose is a second reading wearing the first one's name."
//
// A floor-sourced build is LABELLED in the console output, because a document built
// on module assembly is not a document built on a reading, and the difference is
// invisible once the PDF is open - the floor is fluent Indonesian and reads like the
// real thing. That is the 08-21 lesson about floors in QA artifacts, one medium over.
//
// ── WHY IT WRITES INTO reports/ ────────────────────────────
// Gitignored. A generated PDF is not evidence in the sense docs/qa/ artifacts are -
// it is rebuildable from the cache row at zero cost, and committing binaries that
// change on every layout tweak would be noise.
//
// ── THIS SCRIPT RUNS WITHOUT --conditions=react-server ─────
// AND THE CACHE READ IS THEREFORE A CHILD PROCESS. Not a workaround - the two
// requirements are genuinely exclusive under plain `node`:
//
//   lib/render/cache.js   carries `server-only`, which resolves to an empty stub
//                         ONLY under --conditions=react-server.
//   @react-pdf/renderer   needs the CLIENT React build. Under that same condition
//                         React resolves to its react-server entry, which lacks the
//                         internals the reconciler reaches for, and rendering dies
//                         with "Cannot read properties of undefined (reading 'S')".
//
// Inside Next they coexist: `server-only` is satisfied by the bundler and a Node
// route is not an RSC. So this is a property of the script runner, not the design,
// and the production path has no such split.
//
// The alternative was a second cache reader without the guard, which means two
// implementations of "what a render_cache row is". One reader, two processes.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderToBuffer } from '@react-pdf/renderer';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { readingOnly, glyphProof } from '../lib/pdf/document.js';
import { buildCompleteEditionPdf } from '../lib/pdf/build.js';
import { buildAppendix } from '../lib/pdf/appendix.js';
import { roundTrip } from '../lib/pdf/inspect.js';
import { CANARY } from '../lib/pdf/fonts.js';
import { HAN_GLYPHS } from '../lib/card/hanFont.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : null;
};

const DATE = flag('date') || '1989-09-13';
const TIME = flag('time') || '09:00';
const READING_ONLY = process.argv.includes('--reading-only');
const OUT = path.resolve(flag('out')
  || path.join(ROOT, 'reports', READING_ONLY ? 'katon-reading-page.pdf' : 'katon-complete.pdf'));

const chart = calculateBaziChart({ birthDate: DATE, birthTime: TIME });
const semanticJson = buildSemanticJson(chart);

// The cache first, always, through the one reader that exists. A missing row and an
// unreachable Supabase are the same outcome here - the floor - and both are LABELLED,
// because a document built on module assembly is not a document built on a reading
// and the difference is invisible once the PDF is open.
let row = null;
try {
  const out = execFileSync(process.execPath, [
    '--conditions=react-server',
    path.join(ROOT, 'scripts', 'dump-render-cache.mjs'),
    DATE, TIME,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  row = JSON.parse(out || 'null');
} catch (err) {
  console.error(`cache read failed, falling back to the floor: ${err.message.split('\n')[0]}`);
}

let rendered = row;
let source = 'render_cache';
if (!rendered) {
  rendered = { ...assembleFallback(semanticJson), prompt_version: null, stage6_version: null };
  source = 'module_assembly (THE FLOOR - not a reading)';
}

// THE COMPLETE EDITION GOES THROUGH THE FIXED POINT, ALWAYS. This script does not
// render one itself: `buildCompleteEditionPdf` is the only door to those bytes,
// because build step 4 is ship-blocking and a script that could bypass it is a
// script that will. `--reading-only` is build step 2's one page and has no appendix,
// so it has nothing to cross-reference and renders directly.
let buf;
let refReport = null;
if (READING_ONLY) {
  buf = await renderToBuffer(readingOnly({ chart, semanticJson, rendered }));
} else {
  const built = await buildCompleteEditionPdf({ chart, semanticJson, rendered });
  buf = built.buffer;
  refReport = built.report;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, buf);

// ── THE ROUND TRIP, ON EVERY BUILD, IN TWO PARTS ──────────
// Not only in the test. `npm run test:pdf-han-font` checks the committed subset and
// `registerPdfFonts` checks it again in-process, but neither of those looks at the
// PDF. Tofu does not throw: the build reports success, the file opens, and the pillar
// cells are empty boxes. So the artifact is opened and asked what is in it.
//
// PART 1 IS THIS DOCUMENT'S OWN CHARACTERS. Only those - and the first version of
// this asserted the CANARY here too, which was wrong in a way worth recording: 申 is
// the Monkey branch, chart 1 draws 己巳癸酉丙子甲, and a document that never drew 申
// cannot be asked whether 申 survived. It "passed" only because the CMap parser was
// over-expanding ranges. A check that asserts something absent is not strict, it is
// broken.
const chars = [...new Set(
  ['year', 'month', 'day', 'hour']
    .flatMap((k) => [...(semanticJson.chart?.[k] || '')]),
)];
const trip = roundTrip(buf, chars);

const appendix = buildAppendix({ chart, semanticJson });

console.error(`\nwrote ${path.relative(ROOT, OUT)} (${(buf.length / 1024).toFixed(1)} kB)`);
console.error(`chart ${DATE} ${TIME} - ${semanticJson.core?.archetype_name_id}`);
console.error(`reading source: ${source}`);
console.error(`appendix: ${appendix.count} entries in `
  + `${appendix.groups.filter((g) => g.entries.length).length} groups`);

// ── BUILD STEP 4's REPORT ─────────────────────────────────
// Printed in the shape prompt M's correction 3 specifies, because the point of that
// shape is that a reader can tell which of the three checks passed rather than
// reading one aggregate OK. Nothing here can be false: every line reports a number
// the build already refused to proceed without.
if (refReport) {
  const r = refReport;
  console.error(`\npage map converged after ${r.rebuilds} rebuild(s)`);
  console.error(`REF VERIFY (by construction): ${r.anchors}/${r.anchors} anchors land where printed`);
  console.error(`appendix starts on page ${r.appendixStart} of ${r.pages}; `
    + `refs pointing before it: ${r.refsBeforeAppendix}`);
  console.error(`reference rows drawn on the chart page: ${r.referenced}/${r.referenced}`);
  // The gap between anchors and refs is correction 1, not a shortfall. Named, so
  // nobody reads 19 of 21 as two missing references.
  if (r.unreferenced.length) {
    console.error(`anchored but not referenced (conditions - correction 1): `
      + `${r.unreferenced.join(', ')}`);
  }
}
console.error(`embedded fonts: ${trip.fonts.map((f) => `${f.glyphs} glyphs/${f.bytes}B`).join(', ')}`);

if (!trip.ok) {
  console.error(`\nROUND TRIP FAILED. missing from this document: ${trip.missing.join('') || '(none)'}`);
  console.error(`outlines embedded: ${trip.outlined}`);
  console.error('This is the tofu case. The PDF rendered and the glyphs are not in it.');
  process.exit(1);
}
console.error(`round trip 1/2 OK: this document's ${chars.length} characters survived, with outlines`);

// PART 2 IS THE CANARY, and it needs a document that actually draws it. `glyphProof`
// draws every glyph the product can draw - the whole subset - through the same font
// path, so 申 is asked of a page that contains 申.
const proof = await renderToBuffer(glyphProof({ chars: [...HAN_GLYPHS] }));
const proofTrip = roundTrip(proof, [...HAN_GLYPHS]);
if (!proofTrip.ok) {
  console.error(`\nCANARY FAILED. missing from the glyph proof: ${proofTrip.missing.join('')}`);
  console.error('The subset registered and these glyphs still did not reach a PDF.');
  process.exit(1);
}
console.error(`round trip 2/2 OK: all ${HAN_GLYPHS.length} subset glyphs survived, `
  + `${CANARY} among them`);
