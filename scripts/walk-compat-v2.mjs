#!/usr/bin/env node
// ============================================================
// scripts/walk-compat-v2.mjs — the same three pairs, round 1 beside round 2
// ============================================================
//   node --conditions=react-server --env-file-if-exists=.env.local \
//     scripts/walk-compat-v2.mjs --out docs/qa/2026-09-13-compat-three-pair-walk-v2.md
//   ... --estimate      print the plan, spend nothing
//
// Prompt Z round 2 section 5. The floor and baseline columns are deliberately
// NOT re-rendered: they are in the v1 artifact and neither has moved, so paying
// for them again would buy a second copy of a number this repo already owns.
// Round 1's column is QUOTED out of that artifact rather than re-rendered for the
// same reason, and because it cannot be re-rendered - its prompt version is gone.
//
// ── WHAT WENT WRONG LAST TIME, AND WHAT STOPS IT HERE ──────
// v1's first build produced a "baseline" column that was a second round-1 render:
// swapping the content files and re-importing with a cache-bust re-imported the
// wrappers but not `lib/semantic/glossary.js`, which was already resident. The
// tell was `daily_seed` prose in a column whose cells cannot contain it.
//
// That failure mode cannot occur here because NOTHING IS SWAPPED. One build, one
// prompt version, one column rendered; the other column is text read off disk.
// The header prints both prompt versions so the reader can see they differ.
// ============================================================

import fs from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { renderReading } from '../lib/render/index.js';
import { promptVersionFor } from '../lib/render/prompt.js';
import { STAGE6_VERSION } from '../lib/validate/index.js';
import { geminiConfigured } from '../lib/render/config.js';
import { VALIDATION_CHARTS } from '../tests/bazi-validation.fixture.js';

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const OUT = arg('out', null);
const ESTIMATE = process.argv.includes('--estimate');
const V1 = 'docs/qa/2026-09-11-compat-three-pair-walk.md';

const chartOf = (id) => {
  const row = VALIDATION_CHARTS.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/** THE SAME THREE AS v1. A different three would not be a walk v2. */
const PAIRS = [
  { label: '1x2', sj: buildPairSemantic(chartOf(1), chartOf(2)) },
  { label: '2x6', sj: buildPairSemantic(chartOf(2), chartOf(6)) },
  {
    label: 'Y-1 fixture',
    sj: buildPairSemantic(
      calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' }),
      calculateBaziChart({ birthDate: '1997-09-14', birthTime: null }),
    ),
  },
];

/** The `### round 1` block under a given `## <pair>` heading of the v1 artifact. */
function v1Round1(pairLabel) {
  const lines = fs.readFileSync(V1, 'utf8').split('\n');
  let inPair = false;
  let taking = false;
  const out = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      inPair = line.slice(3).trim().startsWith(pairLabel);
      // ── AND `taking` IS CLEARED HERE, WHICH IT WAS NOT ─────
      // The first version set `inPair` on a `##` and left `taking` alone, so the
      // 1x2 column ran past the end of its own section and swallowed the next
      // pair's heading and fence. Caught by reading the generated page rather
      // than the code: a quoted column is exactly the thing no assertion in this
      // script can judge, so it has to be looked at.
      taking = false;
    } else if (line.startsWith('### ')) {
      taking = inPair && line.slice(4).toLowerCase().startsWith('round 1');
    } else if (taking && line.trim() !== '```' && line.trim() !== '---') {
      // The v1 page fences each column. Quoting a fence inside a fence ends the
      // block early and the rest of the column renders as prose.
      out.push(line);
    }
  }
  const text = out.join('\n').trim();
  if (!text) throw new Error(`REFUSING: no "### round 1" for "${pairLabel}" in ${V1}`);
  return text;
}

const proseOf = (out) => (out.blocks || [])
  .map((b) => `    ${(b.fact_ids || []).join(' + ')}\n      ${(b.text || '').replace(/\n\n/gu, '\n      ')}`)
  .join('\n\n') + (out.penutup ? `\n\n    penutup\n      ${out.penutup}` : '');

const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say(`walk v2 | gate ${STAGE6_VERSION} | round 2 prompt ${promptVersionFor('pair')}`);
say(`round 1 column is QUOTED from ${V1} (prompt fcdd1dd95968be52), never re-rendered`);
say(`${PAIRS.length} pairs, up to 2 draws each if the first floors`);
if (ESTIMATE) { console.log('\n--estimate: nothing spent.'); process.exit(0); }

/**
 * Re-splice the framing note into an existing page, rendering nothing.
 *
 * The note carries the numbers, and a number changes when it is re-measured -
 * so without this, correcting a figure in the framing costs three renders and
 * produces a DIFFERENT page, whose prose no longer matches the corrected figure.
 * That is how a page and its own headline drift apart.
 */
if (process.argv.includes('--note-only')) {
  if (!OUT) throw new Error('REFUSING: --note-only needs --out');
  const existing = fs.readFileSync(OUT, 'utf8').split('\n');
  const bodyAt = existing.findIndex((l) => /^## [^R]/u.test(l) && !l.startsWith('## READ')
    && !l.startsWith('## WHAT') && !l.startsWith('## ONE'));
  if (bodyAt < 0) throw new Error('REFUSING: no pair section found in the existing page');
  const notePath = OUT.replace(/\.md$/u, '.note.md');
  const note = fs.readFileSync(notePath, 'utf8').trim();
  fs.writeFileSync(
    OUT,
    `${existing.slice(0, 5).join('\n')}\n\n${note}\n\n${existing.slice(bodyAt).join('\n')}`,
    'utf8',
  );
  console.log(`re-spliced ${notePath} into ${OUT}; nothing rendered`);
  process.exit(0);
}

// AFTER the --note-only exit above: re-splicing the framing spends nothing and
// must not need a key. It was above it once, and `--note-only` refused on a
// machine with no key while doing no work that needed one.
if (!geminiConfigured()) { console.error('REFUSING: no GEMINI_API_KEY'); process.exit(1); }

const results = [];
for (const p of PAIRS) {
  const draws = [];
  // SECTION 5: "if a round-2 draw floors, say so and draw again, reporting both".
  // Both are reported. A second draw is not a retry that replaces the first - a
  // floored draw is a real outcome a reader could have received.
  for (let i = 0; i < 2; i += 1) {
    const out = await renderReading(p.sj, {
      dedupeInFlight: false, spendGuards: false, captureProse: true,
    });
    draws.push(out);
    process.stdout.write(out.source === 'module_assembly' ? 'F' : '.');
    if (out.source !== 'module_assembly') break;
  }
  results.push({ ...p, draws });
}
process.stdout.write('\n');

for (const r of results) {
  say();
  say(`## ${r.label}   A ${r.sj.core.a.archetype_name_id} · B ${r.sj.core.b.archetype_name_id}`);
  say();
  say('### round 1  (quoted from v1, prompt fcdd1dd95968be52)');
  say('```');
  say(v1Round1(r.label));
  say('```');

  r.draws.forEach((out, i) => {
    const floored = out.source === 'module_assembly';
    say();
    say(`### round 2, draw ${i + 1}${floored ? '  (FLOORED — module assembly)' : ''}`);
    const rejected = (out.attempts || []).flatMap((a) => a.stage6_detail || []);
    if (rejected.length) {
      say('');
      say('rejections on the way here, with the literal that fired:');
      for (const d of rejected) say(`  - ${d.check}: ${d.message}`);
    }
    const flagged = (out.findings || []).filter((f) => f.severity === 'flag');
    if (flagged.length) {
      say('');
      say('log-only flags on the SERVED reading:');
      for (const f of flagged) say(`  - ${f.check}: ${f.message}`);
    }
    say('```');
    say(proseOf(out));
    say('```');
  });
}

if (OUT) {
  // ── THE FRAMING IS A FILE, NOT A HAND-EDIT ON THE OUTPUT ───
  // The first version of this page had its "read this first" section pasted on
  // afterwards, and the next run silently deleted it. A page that cannot be
  // regenerated is a page nobody dares re-run, and the numbers in the framing
  // are exactly the ones that move when it is.
  const notePath = OUT.replace(/\.md$/u, '.note.md');
  const note = fs.existsSync(notePath) ? `${fs.readFileSync(notePath, 'utf8').trim()}\n\n` : '';
  if (!note) console.log(`(no framing note at ${notePath})`);
  fs.mkdirSync(OUT.replace(/\/[^/]+$/u, ''), { recursive: true });
  fs.writeFileSync(
    OUT,
    `# Compat reading, three pairs: round 1 / round 2\n\n${lines.slice(0, 3).join('\n')}\n\n${note}${lines.slice(3).join('\n')}\n`,
    'utf8',
  );
  console.log(`\nwrote ${OUT}`);
}
