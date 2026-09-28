#!/usr/bin/env node
// ============================================================
// scripts/check-example-reuse.mjs — did a render copy Reyner's examples?
// ============================================================
//   node scripts/check-example-reuse.mjs <dir-with-render-json> [--n 6]
//
// Prompt AE item 4: "a grep for any sentence reused from the examples". SPENDS
// NOTHING. For every render record (<subject>-<voice>.json, the shape
// qa-voice-v2-renders.mjs writes) it reads the SERVED text and every captured
// draft, and reports:
//   exact     a whole sentence identical to an example sentence (case and
//             punctuation folded);
//   shingle   any run of N consecutive words (default 6) shared with an example.
// The examples are the block texts in docs/content/voice-examples-v2.txt; the
// preamble, the section markers and the "Facts it drew on" notes are not prose the
// writer was shown as a reading, so they are excluded.
//
// CONTROL FIRST: an example sentence planted into a fake reading must be reported
// as exact, and a clean sentence must not, or the run exits 1 before reading
// anything - an instrument that cannot fire proves nothing (CHECK 2).
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const argAt = (name) => process.argv.indexOf(`--${name}`);
const DIR = process.argv[2];
const N = argAt('n') > -1 ? Number(process.argv[argAt('n') + 1]) : 6;
if (!DIR) throw new Error('usage: check-example-reuse.mjs <dir> [--n 6]');

const raw = fs.readFileSync('docs/content/voice-examples-v2.txt', 'utf8').replace(/\r\n?/g, '\n');
// Each example is "--- Example N..." then a "Facts it drew on" paragraph (it wraps
// over several lines), then the prose paragraphs. Split on the header, drop the
// header line and the first paragraph, keep the rest.
const exampleProse = raw.split(/^--- Example[^\n]*\n/mu).slice(1)
  .map((chunk) => chunk.split(/^===[^\n]*$/mu)[0])
  .flatMap((chunk) => chunk.split(/\n\s*\n/u).map((p) => p.trim()).filter(Boolean).slice(1))
  .join('\n');
if (/Facts it drew on|label_meaning/u.test(exampleProse)) throw new Error('an example note leaked into the prose');

const fold = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/gu, ' ').trim();
const sentences = (t) => String(t || '').split(/(?<=[.!?])\s+|\n+/u).map((s) => s.trim()).filter(Boolean);
const shingles = (s) => {
  const w = fold(s).split(' ').filter(Boolean);
  const out = new Set();
  for (let i = 0; i + N <= w.length; i += 1) out.add(w.slice(i, i + N).join(' '));
  return out;
};

// ── GLOSSARY TEXT IS NOT REUSE ─────────────────────────────
// Reyner's examples quote the glossary's own meaning lines ("dipercaya memegang hal
// penting dan merawatnya dengan rapi" is a gift seed), and the writer is TOLD to
// use those lines. Measured before this exclusion: round 3, rendered before the
// examples existed, "shared" 6-word runs with them on every reading. So a run that
// also occurs anywhere in docs/content/glossary.json is material, not copying.
const glossaryStrings = [];
const walk = (n) => {
  if (typeof n === 'string') glossaryStrings.push(n);
  else if (Array.isArray(n)) n.forEach(walk);
  else if (n && typeof n === 'object') Object.values(n).forEach(walk);
};
walk(JSON.parse(fs.readFileSync('docs/content/glossary.json', 'utf8')));
const GLOSSARY_SHINGLES = new Set(glossaryStrings.flatMap((s) => sentences(s).flatMap((x) => [...shingles(x)])));

// The same exclusion for whole sentences: an example sentence that is itself a
// glossary line, or made only of glossary runs, is material. Found by the first
// round-4 run, where a v1 reading - which never sees the examples - scored an
// "exact" hit on the p1 daily seed.
const GLOSSARY_SENTENCES = new Set(glossaryStrings.flatMap((s) => sentences(s).map(fold)));
const fromGlossary = (s) => GLOSSARY_SENTENCES.has(fold(s))
  || ([...shingles(s)].length > 0 && [...shingles(s)].every((g) => GLOSSARY_SHINGLES.has(g)));
const EX_SENTENCES = new Map(sentences(exampleProse).filter((s) => !fromGlossary(s)).map((s) => [fold(s), s]));
const EX_SHINGLES = new Set(sentences(exampleProse).flatMap((s) => [...shingles(s)])
  .filter((g) => !GLOSSARY_SHINGLES.has(g)));

/** Maximal runs of >= N words in `s` that are covered by example-only shingles. */
function sharedRuns(s) {
  const w = fold(s).split(' ').filter(Boolean);
  const covered = new Array(w.length).fill(false);
  for (let i = 0; i + N <= w.length; i += 1) {
    if (EX_SHINGLES.has(w.slice(i, i + N).join(' '))) for (let k = i; k < i + N; k += 1) covered[k] = true;
  }
  const runs = [];
  let start = -1;
  for (let i = 0; i <= w.length; i += 1) {
    if (i < w.length && covered[i]) { if (start < 0) start = i; } else if (start >= 0) {
      runs.push(w.slice(start, i).join(' '));
      start = -1;
    }
  }
  return runs;
}

function reuse(rendered) {
  const text = [...(rendered?.blocks || []).map((b) => b.text || ''), rendered?.penutup || ''].join('\n');
  const exact = [];
  const shared = [];
  for (const s of sentences(text)) {
    if (EX_SENTENCES.has(fold(s))) exact.push(s);
    else shared.push(...sharedRuns(s));
  }
  return { exact, shingles: shared };
}

// ── control ────────────────────────────────────────────────
const planted = [...EX_SENTENCES.values()][0];
const ctl = reuse({ blocks: [{ text: `Kalimat biasa yang tidak ada di contoh. ${planted}` }], penutup: '' });
const clean = reuse({ blocks: [{ text: 'Kalimat biasa yang sama sekali tidak ada di contoh mana pun hari ini.' }], penutup: '' });
if (ctl.exact.length !== 1 || clean.exact.length !== 0 || clean.shingles.length !== 0) {
  console.error('CONTROL FAILED', { ctl, clean });
  process.exit(1);
}
console.log(`control: planted example sentence found (exact 1); clean sentence found nothing. ${EX_SENTENCES.size} example sentences, ${N}-word shingles.`);

// ── the renders ────────────────────────────────────────────
let any = 0;
for (const f of fs.readdirSync(DIR).filter((x) => /-v[12]\.json$/u.test(x)).sort()) {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const served = reuse(r.rendered);
  const drafts = (r.drafts || []).map((d) => reuse(d));
  const draftHits = drafts.reduce((n, d) => n + d.exact.length + d.shingles.length, 0);
  any += served.exact.length + served.shingles.length + draftHits;
  console.log(`${f.padEnd(34)} ${r.floored ? 'FLOOR ' : 'render'} served: exact ${served.exact.length}, ${N}-word ${served.shingles.length}; drafts (${drafts.length}): ${draftHits} hit(s)`);
  for (const s of served.exact) console.log(`    EXACT  ${s}`);
  for (const g of served.shingles) console.log(`    SHARED "${g}"`);
  drafts.forEach((d, i) => {
    for (const s of d.exact) console.log(`    draft${i + 1} EXACT  ${s}`);
    for (const g of d.shingles) console.log(`    draft${i + 1} SHARED "${g}"`);
  });
}
console.log(any === 0 ? 'no reuse found' : `${any} reuse hit(s) in total`);
