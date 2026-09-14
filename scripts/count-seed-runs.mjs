// ============================================================
// scripts/count-seed-runs.mjs — how much of a seed came through whole
// ============================================================
// Prompt Z round 2, B3's instrument. The round-1 headline was "the first nine
// words of 10 of 42 ruled seeds appear verbatim in the output", and that number
// was computed ad hoc in a session and then quoted in a walk artifact and a PR
// comment. A number nothing can recompute is a memory. This is the recomputation.
//
// ── WHAT IT COUNTS, AND WHY NINE ───────────────────────────
// A seed is a DEFAULT the renderer is meant to condition and mostly reword. The
// gate already has a floor on how much must survive (`COVERAGE_PARAMS`
// fieldOverlap, 0.2) and no ceiling on how much may, because "too much survived"
// is a voice judgement, not a fact. This is the ceiling's instrument, not the
// ceiling: nine consecutive words is long enough that a coincidence is
// implausible in Indonesian and short enough to catch "the seed with two words
// changed", which is the failure the prompt names.
//
// It is NOT a gate and must not become one without Reyner ruling the threshold.
// It prints; it never rejects.
//
// ── THE EXAMPLE IS COUNTED TOO, AND THAT IS THE POINT ──────
// Round 2 puts a WORKED BLOCK in the prompt (B3) because prohibition without
// demonstration did not work. The obvious hazard of showing a model a good block
// is that it copies the block. So the same ruler is run over the example's own
// text, and the target is zero.
//
//   $ node scripts/count-seed-runs.mjs --prose docs/qa/2026-09-11-compat-three-pair-walk.md
//   $ node scripts/count-seed-runs.mjs --falsify
//
// `--falsify` runs it against the ROUND-1 artifact and refuses unless the known
// figure comes back. An instrument that cannot reproduce a number it already
// published is not measuring what it measured before.
// ============================================================

import fs from 'node:fs';

import GLOSSARY from '../docs/content/glossary.json' with { type: 'json' };

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};

const RUN = 9;
const V1_ARTIFACT = 'docs/qa/2026-09-11-compat-three-pair-walk.md';

/**
 * The round-1 figure, RECOMPUTED - and it is not the one that was published.
 *
 * ── THE PUBLISHED NUMBER WAS 10/42 AND THIS DOES NOT REPRODUCE IT ──
 * That figure was computed ad hoc in a session, quoted in the round-1 walk
 * artifact and in the PR #116 comment, and never committed. Writing the counting
 * down makes the answer depend visibly on the definition, and it does:
 *
 *   normalised (lowercase, punctuation stripped)        13/42   <- this script
 *   raw substring, punctuation and case kept             8/42
 *
 *   $ node scripts/count-seed-runs.mjs --prose <v1 artifact> --column "round 1"
 *
 * 10 is between them and no definition tried here returns it, so the ad-hoc run
 * used a third rule that is gone. THE PUBLISHED FIGURE IS NOT CORRECTED IN THE
 * ARTIFACT - it is a dated record of what was measured, and re-stamping an
 * artifact after the fact is the failure this repo keeps finding. It is corrected
 * HERE, where the next run happens, and in the round-2 walk.
 *
 * The finding is unchanged and slightly stronger: the copying moved rather than
 * stopped, and it moved more than was reported.
 */
const V1_EXPECTED = 13;

/**
 * Words, lowercased, punctuation gone.
 *
 * Punctuation is stripped rather than kept because the interesting failure is a
 * model that copies a clause and repunctuates it; keeping commas would let
 * "berbalik, keteraturan" read as a different string from "berbalik. Keteraturan"
 * and undercount exactly the case the B3 em-dash edit created.
 */
const words = (s) => String(s ?? '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
  .split(/\s+/u)
  .filter(Boolean);

/** Every RUN-long window of a text, as space-joined strings. */
function windows(text) {
  const w = words(text);
  const out = [];
  for (let i = 0; i + RUN <= w.length; i += 1) out.push(w.slice(i, i + RUN).join(' '));
  return out;
}

/** The FIRST window only - the opening of the string, which is what B3 counts. */
const firstRun = (text) => windows(text)[0] ?? null;

/** The 42 ruled compat seeds, in glossary order. */
function seeds() {
  const out = [];
  for (const [key, cell] of Object.entries(GLOSSARY.kompatibilitas)) {
    for (const field of ['meaning_seed', 'daily_seed']) {
      if (cell?.[field]) out.push({ id: `${key}.${field}`, text: cell[field] });
    }
  }
  return out;
}

/**
 * The B3 worked example's OUTPUT text, read out of the prompt rather than typed.
 *
 * Read, so that editing the example edits the thing measured. Typed, and the two
 * drift the first time a word changes and the count silently starts describing a
 * block nobody ships.
 */
function exampleText() {
  const prompt = fs.readFileSync('docs/content/compat-renderer-prompt.txt', 'utf8');
  const line = prompt.split('\n').find((l) => l.trim().startsWith('text: Unsur Air milikmu'));
  if (!line) throw new Error('REFUSING: the B3 example text is not where this expects it');
  return line.trim().replace(/^text:\s*/, '');
}

/**
 * The `### <column>` sections of a walk artifact, joined.
 *
 * ── WITHOUT THIS THE INSTRUMENT MEASURES THE WRONG THING ───
 * A walk artifact holds three columns, and the FLOOR column is assembled
 * straight out of the glossary cells - so it reproduces seeds verbatim BY
 * CONSTRUCTION. Counting the whole file therefore counts the engine's own
 * content as the model copying, and it does: the file scores 13/42 whole and
 * lower on any single model column.
 *
 * A FLOORED column is skipped for the same reason and it is not the same
 * omission: that column IS module assembly, printed under a round-1 heading
 * because that is the draw that happened. It is engine content wearing a model
 * column's label, and it is the exact thing that makes a whole-file count
 * meaningless.
 */
function columnsOf(text, prefix) {
  const lines = text.split('\n');
  const out = [];
  let taking = false;
  let skipped = 0;
  for (const line of lines) {
    if (line.startsWith('### ')) {
      const heading = line.slice(4);
      const floored = /FLOORED/i.test(heading);
      taking = heading.toLowerCase().startsWith(prefix.toLowerCase()) && !floored;
      if (heading.toLowerCase().startsWith(prefix.toLowerCase()) && floored) skipped += 1;
      continue;
    }
    if (taking) out.push(line);
  }
  if (out.length === 0) throw new Error(`REFUSING: no "### ${prefix}" column in this file`);
  if (skipped) console.log(`(skipped ${skipped} FLOORED column(s): module assembly, not model prose)`);
  return out.join('\n');
}

function report(label, corpusText) {
  const corpus = new Set(windows(corpusText));
  const rows = seeds().map((s) => ({ ...s, run: firstRun(s.text) }))
    .filter((s) => s.run)
    .map((s) => ({ ...s, hit: corpus.has(s.run) }));

  const ex = exampleText();
  const exFirst = firstRun(ex);
  const exAny = windows(ex).filter((w) => corpus.has(w));

  console.log(`\n=== ${label} ===`);
  console.log(`seeds with their first ${RUN} words verbatim: ${rows.filter((r) => r.hit).length}/${rows.length}`);
  for (const r of rows.filter((x) => x.hit)) console.log(`  ${r.id}`);
  console.log(`B3 example, first ${RUN} words verbatim: ${corpus.has(exFirst) ? 1 : 0}/1`);
  console.log(`B3 example, ANY ${RUN}-word run reproduced: ${exAny.length}`);
  for (const w of exAny) console.log(`  "${w}"`);

  return { seedHits: rows.filter((r) => r.hit).length, seedTotal: rows.length, exampleAny: exAny.length };
}

if (process.argv.includes('--falsify')) {
  // THE INSTRUMENT MUST REPRODUCE ITS OWN PUBLISHED NUMBER. If this stops being
  // V1_EXPECTED, either the seeds moved, the artifact moved, or the counting
  // changed - and every later figure this script prints is incomparable with the
  // round-1 walk until someone says which.
  const got = report(
    `FALSIFIER: round 1 columns of ${V1_ARTIFACT}`,
    columnsOf(fs.readFileSync(V1_ARTIFACT, 'utf8'), 'round 1'),
  );
  const ok = got.seedHits === V1_EXPECTED && got.seedTotal === 42;
  console.log(`\nexpected ${V1_EXPECTED}/42, got ${got.seedHits}/${got.seedTotal} -> ${ok ? 'REPRODUCED' : 'REFUSED'}`);
  process.exit(ok ? 0 : 1);
}

const prose = arg('prose');
if (!prose) {
  console.error('usage: node scripts/count-seed-runs.mjs --prose <file> [--column <name>] | --falsify');
  process.exit(2);
}
const column = arg('column');
const raw = fs.readFileSync(prose, 'utf8');
report(column ? `${prose} :: ${column}` : prose, column ? columnsOf(raw, column) : raw);
