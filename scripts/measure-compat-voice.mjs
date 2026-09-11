#!/usr/bin/env node
// ============================================================
// scripts/measure-compat-voice.mjs — does a block SAY anything the cell did not?
// ============================================================
//   node --conditions=react-server scripts/measure-compat-voice.mjs
//   ... --estimate            print the plan and the coverage, spend nothing
//   ... --label baseline      names the run in the output
//   ... --out docs/qa/<file>.md
//   ... --falsify            run the instrument checks alone, spend nothing
//
// Prompt Z section 2. The question is NOT "did it pass the gate" - it passes.
// The question is whether the model is writing or transcribing, and the measure
// is how much of each glossary cell's distinctive vocabulary survives into the
// block that carries it. A block that reproduces its cell scores 1.00.
//
// ── THE INSTRUMENT IS THE REPO'S, AND THAT IS A DEVIATION FROM THE PROMPT ──
// Prompt Z says to copy `hug.mjs`, "stems > 3 letters, cell-side ratio". THAT
// FILE IS NOT IN THE REPO:
//
//   $ find . -name "hug*" -not -path "*/node_modules/*"   ->  (nothing)
//
// It was Cowork's throwaway, and the prompt's own instruction - copy, do not
// reconstruct - cannot be followed for a file that does not exist. Rebuilding it
// from a one-line description is the reconstruction the instruction forbids.
//
// So this uses `lib/validate/text.js#stemOverlap`, which is the comparison the
// GATE itself makes (`coverage.js`, `pair.js`, `fact.js` all call it). One
// definition of "did the idea survive", used by the thing being measured and the
// thing measuring it.
//
// IT IS NOT THE SAME NUMBER AS THE PROMPT'S TABLE, and the difference is stated
// rather than smoothed over: the repo uses `MIN_STEM = 5` where hug.mjs used
// 4, so it counts fewer, longer stems. The fixture row is RE-DERIVED here under
// this instrument (`--falsify` prints it) so the before and after sit on one
// ruler. Prompt Z's table stays true of hug.mjs and is not comparable to these.
//
// ── THE PAIRS ARE qa-pair-renders.mjs's, NOT NEW ONES ──────
// That harness already fixes ten pairs and REFUSES if their coverage is not what
// it claims. Picking ten fresh dates would have produced a second pair set to
// keep in step, and two harnesses disagreeing about which pairs are canonical is
// worse than either. Prompt Z asks for four quadrants, three p4 patterns and at
// least one p2_harm and one p2_clash; the first is already asserted there, the
// rest are asserted HERE, against the same list.

import fs from 'node:fs';

// .env.local is Next's convention; plain node does not load it.
const ENV = '.env.local';
if (fs.existsSync(ENV)) {
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { renderReading } = await import('../lib/render/index.js');
const { geminiConfigured, modelFor, DEFAULT_TIER } = await import('../lib/render/config.js');
const { promptVersionFor } = await import('../lib/render/prompt.js');
const { STAGE6_VERSION } = await import('../lib/validate/index.js');
const { stemOverlap } = await import('../lib/validate/text.js');
const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('../tests/bazi-validation.fixture.js');

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const ESTIMATE = process.argv.includes('--estimate');
const FALSIFY_ONLY = process.argv.includes('--falsify');
const LABEL = arg('label', 'run');
const OUT = arg('out', null);

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/**
 * The Y-1 fixture's own births, so its blocks are measured against ITS cells.
 * Read from the payload rather than typed: `pair-reading-g4WH4.json` is the
 * verbatim production response and carries them.
 */
const FIXTURE_PAIR = (() => {
  const j = JSON.parse(fs.readFileSync('tests/fixtures/pair-reading-g4WH4.json', 'utf8'));
  return j.pair ?? { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1997-09-14', gender: 'female' } };
})();

/**
 * Nine from qa-pair-renders.mjs, plus the Y-1 FIXTURE PAIR itself.
 *
 * Prompt Z asks for "the Y-1 fixture pair plus nine", and it is not decoration:
 * that pair is the only one with a real production render to compare against,
 * and it is the repo's only `p2_harm` - which the prompt also requires. Reusing
 * qa-pair-renders' ten unchanged gave p2_clash, p2_harmony, p2_none and
 * p2_punishment and NO p2_harm, so the coverage assertion below would have
 * refused. `[9, 11]` is dropped for it; the other nine are that harness's,
 * unchanged, so the two runs still share most of their sample.
 *
 * An entry is either a pair of fixture chart ids or an explicit `{ a, b }` of
 * births, because the fixture pair is production data and not in the chart
 * fixture.
 */
const PAIRS = [
  [2, 6], [1, 2], [13, 11], [12, 6], [1, 12], [3, 7], [1, 3], [2, 8], [1, 101],
  {
    label: 'Y-1 fixture',
    a: { date: FIXTURE_PAIR.a.date, time: '09:00', gender: FIXTURE_PAIR.a.gender },
    b: { date: FIXTURE_PAIR.b.date, time: null, gender: FIXTURE_PAIR.b.gender },
  },
];

/** One entry of PAIRS -> { label, semantic }. */
function semanticFor(entry) {
  if (Array.isArray(entry)) {
    return { label: `${entry[0]}x${entry[1]}`, sj: buildPairSemantic(chartOf(entry[0]), chartOf(entry[1])) };
  }
  return {
    label: entry.label,
    sj: buildPairSemantic(
      calculateBaziChart({ birthDate: entry.a.date, birthTime: entry.a.time, gender: entry.a.gender }),
      calculateBaziChart({ birthDate: entry.b.date, birthTime: entry.b.time, gender: entry.b.gender }),
    ),
  };
}

const words = (s) => String(s ?? '').trim().split(/\s+/u).filter(Boolean).length;

/**
 * The cell a block is carrying, and the block's text.
 *
 * A block names its facts; the FIRST fact is its subject (blocks list their lead
 * fact first). The cell is that fact's own content - `label_meaning` today, and
 * after the tranche the three fields together, which is the point: the ratio
 * must be measured against everything the model was GIVEN, or adding fields
 * would lower it arithmetically without the prose changing at all.
 */
function cellTextFor(fact) {
  return [fact.label_meaning, fact.meaning_seed, fact.daily_seed]
    .filter((s) => typeof s === 'string' && s.trim()).join(' ');
}

function measureRendering(sj, out) {
  const byId = new Map((sj.facts || []).map((f) => [f.id, f]));
  const rows = [];
  for (const b of out.blocks || []) {
    const id = (b.fact_ids || [])[0];
    const fact = byId.get(id);
    if (!fact) continue;
    const cell = cellTextFor(fact);
    if (!cell) continue;
    const { ratio, hits, total } = stemOverlap(cell, b.text || '');
    rows.push({
      id,
      ratio,
      hits,
      total,
      blockWords: words(b.text),
      cellWords: words(cell),
      verbatim: String(b.text || '').trim() === cell.trim(),
    });
  }
  return rows;
}

// ── THE INSTRUMENT'S OWN CHECKS, PRINTED BEFORE ANY NUMBER ──
// A CLEAN from an instrument that cannot discriminate is not evidence. Two
// controls, both spending nothing: the floor must score 1.00 (it IS the cells),
// and an unrelated paragraph must score near 0.
function falsify() {
  const sj = buildPairSemantic(chartOf(PAIRS[0][0]), chartOf(PAIRS[0][1]));
  const fact = sj.facts.find((f) => cellTextFor(f));
  // THE FIXTURE HAS ITS OWN PAIR, and the first version of this used PAIRS[0]'s
  // cells against the fixture's blocks - a different quadrant, a different p2
  // variant, so it was comparing prose to cells that were never its input. It
  // reported p5 at 0.09 against the prompt's 1.00 and the gap was my bug, not a
  // change in the render. Built from the fixture's OWN births, which the payload
  // carries.
  const fixSj = semanticFor(PAIRS[PAIRS.length - 1]).sj;
  const cell = cellTextFor(fact);

  const identical = stemOverlap(cell, cell).ratio;
  const unrelated = stemOverlap(cell,
    'Kucing itu tidur di atas kursi kayu sepanjang sore sementara hujan turun pelan di luar jendela.').ratio;

  // And the Y-1 production fixture, re-derived under THIS instrument, so the
  // prompt's hug.mjs table and this run are never mistaken for one ruler.
  const prod = JSON.parse(fs.readFileSync('tests/fixtures/pair-reading-g4WH4.json', 'utf8'));
  const prodRows = [];
  for (const b of prod.reading.blocks) {
    const id = (b.fact_ids || [])[0];
    const f = fixSj.facts.find((x) => x.id === id);
    if (!f) continue;
    const c = cellTextFor(f);
    if (!c) continue;
    prodRows.push({ id, ratio: stemOverlap(c, b.text).ratio });
  }

  console.log('INSTRUMENT CHECKS');
  console.log(`  a cell against itself      ${identical.toFixed(2)}   (expect 1.00)`);
  console.log(`  a cell against an unrelated paragraph  ${unrelated.toFixed(2)}   (expect < 0.20)`);
  const ok = identical === 1 && unrelated < 0.2;
  console.log(`  -> the instrument ${ok ? 'DISCRIMINATES' : 'IS BLIND; refusing to report numbers'}`);
  if (prodRows.length) {
    console.log('  the Y-1 fixture under THIS instrument (not hug.mjs):');
    for (const r of prodRows) console.log(`    ${r.id.padEnd(18)} ${r.ratio.toFixed(2)}`);
  }
  return ok;
}

// ── COVERAGE, ASSERTED RATHER THAN CLAIMED ─────────────────
function coverage() {
  const rows = [];
  const quadrants = new Set();
  const patterns = new Set();
  const p2 = new Set();
  for (const entry of PAIRS) {
    const { label, sj } = semanticFor(entry);
    const q = sj.facts.find((f) => f.id === 'p5_pull_fit').provenance.quadrant;
    const pat = sj.facts.find((f) => f.id === 'p4_temperament').provenance.pattern;
    quadrants.add(q); patterns.add(pat);
    for (const f of sj.facts) {
      // The VARIANT is the cell that fires (p2_harm, p2_clash, p2_none...), which
      // is what Prompt Z's coverage requirement is actually about. The
      // `relations` array holds objects, and adding those to a Set printed
      // "[object Object]" - a coverage line that cannot be read is not coverage.
      if (f.id === 'p2_day_pair' && f.provenance.variant) p2.add(f.provenance.variant);
    }
    rows.push({ pair: label, q, pat, sj });
  }
  return { rows, quadrants: [...quadrants].sort(), patterns: [...patterns].sort(), p2: [...p2].sort() };
}

const { rows, quadrants, patterns, p2 } = coverage();

console.log(`compat voice measurement | label=${LABEL}`);
console.log(`${PAIRS.length} pairs, one draw each = ${PAIRS.length} renders`);
console.log(`quadrants ${quadrants.join(' ')} | p4 ${patterns.join(' ')} | p2 relations ${p2.join(' ') || '(none)'}`);
console.log(`gate ${STAGE6_VERSION} | prompt ${promptVersionFor('pair')} | model ${modelFor(DEFAULT_TIER, 'gemini')}`);
console.log();

const sane = falsify();
console.log();
if (FALSIFY_ONLY) process.exit(sane ? 0 : 1);
if (!sane) process.exit(1);

if (quadrants.length !== 4) throw new Error(`REFUSING: ${quadrants.length} quadrants, not 4`);
if (patterns.length !== 3) throw new Error(`REFUSING: ${patterns.length} p4 patterns, not 3`);
// Prompt Z: "at least one p2_harm and one p2_clash". Asserted, not hoped for -
// the first version of this list had neither the fixture pair nor a p2_harm, and
// nothing would have said so.
for (const need of ['p2_harm', 'p2_clash']) {
  if (!p2.includes(need)) throw new Error(`REFUSING: no ${need} pair in the sample (have ${p2.join(' ')})`);
}

if (ESTIMATE) { console.log('--estimate: nothing spent.'); process.exit(0); }
if (!geminiConfigured()) { console.error('REFUSING: no GEMINI_API_KEY'); process.exit(1); }

const all = [];
const perPair = [];
let floors = 0;
const rejects = {};

for (const row of rows) {
  let out;
  try {
    // The same options qa-pair-renders.mjs uses, and for its reasons: the spend
    // guard would refuse this batch INTO the floor and report a floor rate for a
    // system that never rendered.
    out = await renderReading(row.sj, { dedupeInFlight: false, spendGuards: false, captureProse: false });
  } catch (e) {
    console.log(`  ${row.pair}: THREW ${e.message}`);
    continue;
  }
  const floored = out.source === 'module_assembly';
  if (floored) floors += 1;
  for (const a of out.attempts || []) {
    for (const d of a.stage6_detail || []) rejects[d.check] = (rejects[d.check] || 0) + 1;
  }
  const measured = measureRendering(row.sj, out);
  all.push(...measured);
  perPair.push({ pair: row.pair, q: row.q, pat: row.pat, floored, rows: measured });
  process.stdout.write(floored ? 'F' : '.');
}
process.stdout.write('\n\n');

const median = (xs) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ratios = all.map((r) => r.ratio);
const wordRatios = all.map((r) => (r.cellWords ? r.blockWords / r.cellWords : 0));

const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say(`# compat voice — ${LABEL}`);
say();
say(`pairs ${PAIRS.length} | blocks measured ${all.length} | floors ${floors}/${PAIRS.length}`);
say(`gate ${STAGE6_VERSION} | prompt ${promptVersionFor('pair')}`);
say();
say('## cell-stem overlap (1.00 = the block carries every distinctive stem of its cell)');
const buckets = { '1.00': 0, '0.80-0.99': 0, '0.60-0.79': 0, '0.40-0.59': 0, '<0.40': 0 };
for (const r of ratios) {
  if (r >= 1) buckets['1.00'] += 1;
  else if (r >= 0.8) buckets['0.80-0.99'] += 1;
  else if (r >= 0.6) buckets['0.60-0.79'] += 1;
  else if (r >= 0.4) buckets['0.40-0.59'] += 1;
  else buckets['<0.40'] += 1;
}
for (const [k, v] of Object.entries(buckets)) say(`  ${k.padEnd(10)} ${String(v).padStart(3)}  ${'#'.repeat(v)}`);
say(`  median ${median(ratios).toFixed(2)} | verbatim blocks ${all.filter((r) => r.verbatim).length}`);
say();
say('## block words / cell words (1.0 = the block is as long as its input)');
say(`  median ${median(wordRatios).toFixed(2)} | min ${Math.min(...wordRatios).toFixed(2)} | max ${Math.max(...wordRatios).toFixed(2)}`);
say();
say('## per fact id (median overlap across the ten pairs)');
const byId = {};
for (const r of all) (byId[r.id] ||= []).push(r.ratio);
for (const [id, xs] of Object.entries(byId).sort()) {
  say(`  ${id.padEnd(20)} n=${String(xs.length).padStart(2)}  median ${median(xs).toFixed(2)}`);
}
say();
say('## Stage 6 findings by check (rejections across all attempts)');
const sortedRejects = Object.entries(rejects).sort((a, b) => b[1] - a[1]);
if (!sortedRejects.length) say('  none');
for (const [k, v] of sortedRejects) say(`  ${k.padEnd(34)} ${v}`);

if (OUT) {
  fs.mkdirSync(OUT.replace(/\/[^/]+$/u, ''), { recursive: true });
  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
  console.log(`\nwrote ${OUT}`);
}
