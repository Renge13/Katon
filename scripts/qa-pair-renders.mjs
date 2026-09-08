#!/usr/bin/env node
// ============================================================
// scripts/qa-pair-renders.mjs — the pair pipeline's floor rate
// ============================================================
//   node --conditions=react-server scripts/qa-pair-renders.mjs --n 2
//
// ── `--n` IS DRAWS PER PAIR. THE HEADLINE IS DRAWS POOLED. ──
// Both are printed, always, because the two were confusable once already: the
// mirror harness's `--n 10` is ten runs PER CHART (40 pooled over four charts),
// while "the compat n=10 run" was ten pairs at ONE draw each - ten pooled. A
// later reader comparing "n=10" to "n=20" has to know which number moved.
//   ... --out docs/qa/<date>-compat-renders-n20.md
//   ... --estimate        prints the projection, spends nothing
//
// The mirror has `scripts/qa-renders.mjs`. This is the pair's, and it exists as a
// SCRIPT rather than an inline probe because the n=10 run was a probe: its
// numbers are in a committed artifact and the thing that produced them is not, so
// nobody can re-run it or check what it counted.
//
// ── IT MEASURES THE FLOOR RATE, WHICH IS NOT THE FIRST-PASS RATE ──
// A reading FLOORS when it exhausts the regeneration budget and Stage 6 still
// rejects, so `renderReading` serves module assembly. A reading that is rejected
// once and passes on the retry did NOT floor. The n=4 cause check in
// `docs/qa/2026-09-08-compat-penutup-cause.md` reported FIRST-ATTEMPT passes,
// which is a different number and is labelled as one there.
//
// ── THE SPEND GUARDS ARE OFF, DELIBERATELY ─────────────────
// `spendGuards: false`, copied from the mirror harness's reasoning: guard (a) is
// three renders per cache key per hour, and this run renders the same pairs
// repeatedly within minutes. Left on, it would refuse most of the batch INTO the
// floor and report a floor rate for a system that never rendered - the guard
// destroying the instrument that measures the thing it exists to bound.
//
// `dedupeInFlight: false` for the same reason one level down: identical requests
// in flight would collapse into one and the run would count one draw as several.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

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
const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('../tests/bazi-validation.fixture.js');
const BLOCKLIST = JSON.parse(fs.readFileSync('lib/validate/blocklist.json', 'utf8'));

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const N = Number(arg('n', 20));
const ESTIMATE = process.argv.includes('--estimate');
const OUT = arg('out', null);

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/**
 * The pairs, CHOSEN FOR COVERAGE AND FIXED, not sampled.
 *
 * Every quadrant, and at least four pairs raising `p2_reframe_required` - the
 * hardest seats, where the reframe is mandatory and the most rejections were
 * measured. A random draw would give a different mix each run and make two runs
 * incomparable; the whole point of a baseline is that the next one can be
 * subtracted from it.
 *
 * Asserted rather than asserted-in-a-comment: the run REFUSES if the coverage it
 * claims is not the coverage it has.
 */
const PAIRS = [
  [2, 6], [1, 2], [13, 11], [12, 6], [1, 12], [3, 7], [1, 3], [2, 8], [1, 101], [9, 11],
];

const VERDICT = (BLOCKLIST.verdict.patterns || [])
  .map((e) => ({ regex: new RegExp(e.pattern, e.flags || 'iu'), source: e.pattern }));

function coverage() {
  const quadrants = new Set();
  let reframes = 0;
  const rows = [];
  for (const [x, y] of PAIRS) {
    const sj = buildPairSemantic(chartOf(x), chartOf(y));
    const q = sj.facts.find((f) => f.id === 'p5_pull_fit').provenance.quadrant;
    const reframe = sj.safety_flags.includes('p2_reframe_required');
    quadrants.add(q);
    if (reframe) reframes += 1;
    rows.push({ pair: `${x} x ${y}`, x, y, q, reframe, sj });
  }
  return { rows, quadrants: [...quadrants].sort(), reframes };
}

const { rows, quadrants, reframes } = coverage();
if (quadrants.length !== 4) throw new Error(`REFUSING: ${quadrants.length} quadrants, not 4`);
if (reframes < 4) throw new Error(`REFUSING: ${reframes} reframe pairs, fewer than 4`);

const model = modelFor(DEFAULT_TIER, 'gemini');
console.log(`${PAIRS.length} pairs x ${N} draw(s) each = ${PAIRS.length * N} DRAWS POOLED`);
console.log(`quadrants ${quadrants.join(' ')} | reframe pairs ${reframes}`);
console.log(`gate ${STAGE6_VERSION} | prompt ${promptVersionFor('pair')} | model ${model}`);
if (ESTIMATE) { console.log('\n--estimate: nothing spent.'); process.exit(0); }
if (!geminiConfigured()) { console.error('REFUSING: no GEMINI_API_KEY'); process.exit(1); }

const tally = { floors: 0, draws: 0, rejects: {}, verdictFlags: {}, blocks: {} };
const perPair = [];

for (const row of rows) {
  const rec = { ...row, floors: 0, draws: 0, rejects: {}, attemptsTotal: 0 };
  for (let i = 0; i < N; i += 1) {
    let out;
    try {
      out = await renderReading(row.sj, {
        dedupeInFlight: false, spendGuards: false, captureProse: false,
      });
    } catch (e) {
      console.log(`  ${row.pair} draw ${i + 1}: THREW ${e.message}`);
      continue;
    }
    rec.draws += 1; tally.draws += 1;
    rec.attemptsTotal += (out.attempts || []).length;

    for (const a of out.attempts || []) {
      for (const d of a.stage6_detail || []) {
        rec.rejects[d.check] = (rec.rejects[d.check] || 0) + 1;
        tally.rejects[d.check] = (tally.rejects[d.check] || 0) + 1;
        // WHICH BLOCK, not just which check. The n=10 run could name the check and
        // not the place, and "89% is one check" was true and unactionable until
        // the place was found (it was the penutup).
        const where = /at "([^"]{0,40})/u.exec(d.message || '');
        if (where) {
          const key = `${d.check} :: ${where[1].trim().slice(0, 28)}`;
          tally.blocks[key] = (tally.blocks[key] || 0) + 1;
        }
      }
    }

    // PER-PATTERN VERDICT FLAGS. `pair.verdict` is `flag` severity, so it never
    // appears in `stage6_detail` (which records only rejecting findings) and it
    // cannot be counted from the tape. It is counted here off the SERVED text,
    // which is the text a reader would have received.
    const served = JSON.stringify({ blocks: out.blocks, penutup: out.penutup });
    for (const { regex, source } of VERDICT) {
      if (regex.test(served)) tally.verdictFlags[source] = (tally.verdictFlags[source] || 0) + 1;
    }

    if (out.source === 'module_assembly') { rec.floors += 1; tally.floors += 1; }
    process.stdout.write(out.source === 'module_assembly' ? 'F' : '.');
  }
  process.stdout.write('\n');
  perPair.push(rec);
  console.log(`  ${row.pair.padEnd(8)} ${rec.q}  reframe=${rec.reframe}  `
    + `floor ${rec.floors}/${rec.draws}  attempts ${rec.attemptsTotal}`);
}

const pct = (a, b) => (b === 0 ? 'n/a' : `${((a / b) * 100).toFixed(1)}%`);
const sorted = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]);

const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say();
say(`POOLED FLOOR RATE  ${tally.floors}/${tally.draws} = ${pct(tally.floors, tally.draws)}`);
say();
say('REJECTIONS BY CHECK');
for (const [k, v] of sorted(tally.rejects)) say(`  ${String(v).padStart(4)}  ${k}`);
say();
say('REJECTIONS BY PLACE (check :: the excerpt the finding names)');
for (const [k, v] of sorted(tally.blocks).slice(0, 15)) say(`  ${String(v).padStart(4)}  ${k}`);
say();
say('VERDICT FLAGS, PER PATTERN (flag severity: these rejected nothing)');
if (VERDICT.length === 0) say('  no patterns compiled');
for (const { source } of VERDICT) {
  say(`  ${String(tally.verdictFlags[source] || 0).padStart(4)}  ${source}`);
}

if (OUT) {
  const header = [
    `# Compat renders, ${PAIRS.length * N} draws pooled - THE BASELINE`,``,
    `**${PAIRS.length} pairs x ${N} draw(s) each.** The 2026-09-08 n=10 run was these same ten`,
    `pairs at one draw each, so this is the same coverage at twice the sample.`,
    '',
    '```',
    `$ node --conditions=react-server scripts/qa-pair-renders.mjs --n ${N}`,
    '```',
    '',
    `gate \`${STAGE6_VERSION}\` | pair prompt \`${promptVersionFor('pair')}\` | model \`${model}\``,
    '',
    '```',
    ...perPair.map((r) => `${r.pair.padEnd(9)} ${r.q}  reframe=${String(r.reframe).padEnd(5)} `
      + `floor ${String(r.floors).padStart(2)}/${r.draws}  attempts ${r.attemptsTotal}`),
    '```',
    '',
    '```',
    ...lines,
    '```',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, header);
  console.log(`\nwrote ${OUT}`);
}
