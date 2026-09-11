#!/usr/bin/env node
// ============================================================
// scripts/compare-compat-voice.mjs — floor / baseline / round-1, one page
// ============================================================
//   node --conditions=react-server scripts/compare-compat-voice.mjs \
//        --out docs/qa/2026-09-11-compat-three-pair-walk.md
//   ... --estimate     print the plan and spend nothing
//
// Prompt Z section 4: "Reyner reads THREE pairs side by side: floor / old render
// / new render - his verdict is the gate, the numbers only say whether the change
// did anything." This produces that page.
//
// ── THE BASELINE IS RE-RENDERED, NOT REMEMBERED ────────────
// `measure-compat-voice.mjs` recorded RATIOS and threw the prose away
// (`captureProse: false`), so there is no old text to quote. The baseline column
// is produced by putting the two pre-tranche files back, rendering, and putting
// them back again:
//
//   docs/content/glossary.json              at BASELINE_REF (before the 42 seeds)
//   docs/content/compat-renderer-prompt.txt at BASELINE_REF (before 3a/3b/3d)
//
// The swap is in a try/finally and the originals are restored from memory, not
// from git, so an interrupted run cannot leave the tree on the old cells. The
// files are read back and compared afterwards; the script REFUSES to write its
// output if either differs.
//
// ── WHY NOT JUST QUOTE THE Y-1 FIXTURE FOR "OLD" ───────────
// It is one pair, and it predates BOTH the prompt change and #114's P0 template.
// A three-pair page needs the same three pairs in every column or the reader is
// comparing pairs rather than versions.
//
// ── EACH COLUMN RENDERS IN ITS OWN PROCESS, AND THAT IS THE FIX ──
// The first version swapped the files and re-imported the render modules with a
// cache-busting query. It produced a "baseline" carrying `daily_seed` material -
// prose the old cells could not contain:
//
//   ruled p1_produces.daily_seed  "Keputusan dan inisiatif baru hampir selalu
//                                  dipicu oleh orang yang sama..."
//   the "baseline" column          "Dalam keseharian, inisiatif baru hampir
//                                  selalu dipicu oleh orang yang sama..."
//
// The bust query re-imported the WRAPPERS and not `lib/semantic/glossary.js`,
// which reads glossary.json at import time and was already resident with the new
// cells. A comparison whose two columns share a module registry is comparing one
// version to itself, and it would have read as "the change did nothing".
//
// So each column is a CHILD PROCESS (`--only round1|baseline`) with its own
// registry. There is no in-process swap to get wrong.
//
// ── THE FLOOR COSTS NOTHING AND IS NOT A RENDER ────────────
// `assembleFallback` is pure engine content: the ruled cells, concatenated. It is
// the third column because Reyner's verdict on round 1 is literally "is this
// still the floor", and that question needs the floor on the page.

import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ENV = '.env.local';
if (fs.existsSync(ENV)) {
  for (const line of fs.readFileSync(ENV, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback;
};
const ESTIMATE = process.argv.includes('--estimate');
/** Set by the parent when it spawns a column. A child prints JSON and exits. */
const ONLY = arg('only', null);
const OUT = arg('out', null);

/** The commit before the seeds were applied. Its two files ARE the baseline. */
const BASELINE_REF = arg('baseline-ref', '13b2629');
const SWAPPED = ['docs/content/glossary.json', 'docs/content/compat-renderer-prompt.txt'];

/**
 * Three of the harness's ten, chosen to be different from each other rather than
 * representative: a clashing seat, a harmonious one, and the pair that has a real
 * production render behind it.
 */
const PICKS = ['1x2', '2x6', 'Y-1 fixture'];

const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } = await import('../tests/bazi-validation.fixture.js');

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};
/**
 * The Y-1 fixture's births.
 *
 * THE FIXTURE HAS NO `pair` FIELD. It is the verbatim production response from
 * BEFORE Y-2b added one (its top-level keys are status, served_from, facts,
 * reading), so reading `.pair` directly throws. `measure-compat-voice.mjs`
 * carries the same fallback for the same reason; the two must not disagree about
 * which births this pair is.
 */
const FIXTURE_PAIR = (() => {
  const j = JSON.parse(fs.readFileSync('tests/fixtures/pair-reading-g4WH4.json', 'utf8'));
  return j.pair ?? { a: { date: '1989-09-13', gender: 'male' }, b: { date: '1997-09-14', gender: 'female' } };
})();

const ENTRIES = {
  '1x2': () => [chartOf(1), chartOf(2)],
  '2x6': () => [chartOf(2), chartOf(6)],
  'Y-1 fixture': () => [
    calculateBaziChart({ birthDate: FIXTURE_PAIR.a.date, birthTime: '09:00', gender: FIXTURE_PAIR.a.gender }),
    calculateBaziChart({ birthDate: FIXTURE_PAIR.b.date, birthTime: null, gender: FIXTURE_PAIR.b.gender }),
  ],
};

/** Render three pairs on whatever cells and prompt are on disk right now. */
async function renderAll(tag) {
  // Imported INSIDE, after any file swap, and with a cache-busting query so the
  // module graph is rebuilt: glossary.json is read at import time, so a module
  // held from before the swap would quietly render the wrong cells - which is the
  // stale-bundle trap one layer down.
  const bust = `?${tag}-${Date.now()}`;
  const { buildPairSemantic } = await import(`../lib/semantic/pair.js${bust}`);
  const { renderReading } = await import(`../lib/render/index.js${bust}`);
  const { promptVersionFor } = await import(`../lib/render/prompt.js${bust}`);
  const { assembleFallback } = await import(`../lib/render/fallback.js${bust}`);

  const out = {};
  for (const name of PICKS) {
    const [a, b] = ENTRIES[name]();
    const sj = buildPairSemantic(a, b);
    const floor = assembleFallback(sj);
    let rendered = null;
    if (!ESTIMATE) {
      rendered = await renderReading(sj, { dedupeInFlight: false, spendGuards: false, captureProse: false });
    }
    out[name] = { sj, floor, rendered };
  }
  return { out, promptVersion: promptVersionFor('pair') };
}

const prose = (r) => (r?.blocks || [])
  .map((b) => `    ${(b.fact_ids || [])[0] ?? '?'}\n      ${String(b.text || '').trim()}`)
  .join('\n\n') + (r?.penutup ? `\n\n    penutup\n      ${String(r.penutup).trim()}` : '');

if (ONLY) {
  const { out, promptVersion } = await renderAll(ONLY);
  const payload = { promptVersion, pairs: {} };
  for (const name of PICKS) {
    payload.pairs[name] = {
      floor: { blocks: out[name].floor.blocks, penutup: out[name].floor.penutup },
      rendered: out[name].rendered
        ? { blocks: out[name].rendered.blocks, penutup: out[name].rendered.penutup, source: out[name].rendered.source }
        : null,
      a: out[name].sj.core.a.archetype_name_id,
      b: out[name].sj.core.b.archetype_name_id,
      q: out[name].sj.facts.find((f) => f.id === 'p5_pull_fit')?.provenance.quadrant,
      pat: out[name].sj.facts.find((f) => f.id === 'p4_temperament')?.provenance.pattern,
      seat: out[name].sj.facts.find((f) => f.id === 'p2_day_pair')?.provenance.variant,
    };
  }
  process.stdout.write(`<<<JSON>>>${JSON.stringify(payload)}`);
  process.exit(0);
}

/** Run one column in a fresh process, so no module registry is shared. */
function renderColumn(tag) {
  const raw = execFileSync(process.execPath,
    ['--conditions=react-server', 'scripts/compare-compat-voice.mjs', '--only', tag],
    { encoding: 'utf8', maxBuffer: 64e6, stdio: ['ignore', 'pipe', 'inherit'] });
  const i = raw.indexOf('<<<JSON>>>');
  if (i === -1) throw new Error(`child ${tag} printed no payload`);
  return JSON.parse(raw.slice(i + 10));
}

console.log(`three-pair walk | pairs ${PICKS.join(', ')}`);
console.log(`baseline ref ${BASELINE_REF} | swapping ${SWAPPED.join(', ')}`);
if (ESTIMATE) {
  console.log('\n--estimate: 6 renders would be spent (3 baseline + 3 round-1). Nothing spent.');
  process.exit(0);
}

// ── ROUND 1 FIRST, on the tree as it stands ────────────────
console.log('\nrendering round-1 (current cells + prompt)...');
const round1 = renderColumn('round1');

// ── THEN THE BASELINE, with the two files temporarily rolled back ──
const saved = Object.fromEntries(SWAPPED.map((f) => [f, fs.readFileSync(f, 'utf8')]));
let baseline;
try {
  for (const f of SWAPPED) {
    fs.writeFileSync(f, execFileSync('git', ['show', `${BASELINE_REF}:${f}`], { encoding: 'utf8', maxBuffer: 64e6 }));
  }
  console.log('rendering baseline (pre-tranche cells + prompt), in a fresh process...');
  baseline = renderColumn('baseline');
} finally {
  // RESTORED FROM MEMORY, not from git: a `git checkout` here would discard any
  // unrelated edit in those files, and this script must not be able to lose work.
  for (const f of SWAPPED) fs.writeFileSync(f, saved[f]);
}

for (const f of SWAPPED) {
  if (fs.readFileSync(f, 'utf8') !== saved[f]) {
    console.error(`REFUSING to write output: ${f} was not restored.`);
    process.exit(1);
  }
}
console.log('tree restored and verified.');

// ── AND PROVE THE TWO COLUMNS ARE DIFFERENT VERSIONS ───────
// The first attempt at this script produced a baseline that was silently the
// round-1 build. The prompt version is stamped by each child from its own
// registry, so two equal versions mean the swap did not take - and that is a
// refusal, not a warning.
if (baseline.promptVersion === round1.promptVersion) {
  console.error(`REFUSING: both columns report prompt ${round1.promptVersion}. `
    + 'The baseline swap did not take, so this would compare one version to itself.');
  process.exit(1);
}
console.log(`baseline prompt ${baseline.promptVersion} != round 1 prompt ${round1.promptVersion}\n`);

const lines = [];
const say = (s = '') => { lines.push(s); console.log(s); };

say('# Compat reading, three pairs: floor / baseline / round 1');
say();
say('Prompt Z section 4. Reyner reads three pairs side by side; his verdict is the gate.');
say('The numbers in `2026-09-11-compat-voice-after.md` only say whether the change did anything.');
say();
say(`- **floor** — module assembly. The ruled cells, concatenated. No model.`);
say(`- **baseline** — the reading as it shipped before this PR. Cells and prompt from \`${BASELINE_REF}\`, re-rendered today.`);
say(`- **round 1** — 42 seeds + pair prompt \`${round1.promptVersion}\`.`);
say();
say('THE BASELINE IS A FRESH DRAW, not the reading anyone received. Same cells and');
say('same prompt as before the PR, but the model is sampled again, so a difference');
say('between columns is the change PLUS one draw of variance. Two draws of the same');
say('config already differed in the after-run (floors 1/10 then 3/10).');
say();
say(`baseline prompt \`${baseline.promptVersion}\` → round 1 prompt \`${round1.promptVersion}\``);
say();

for (const name of PICKS) {
  const r1 = round1.pairs[name];
  const bs = baseline.pairs[name];
  const { q, pat, seat } = r1;

  say('---');
  say();
  say(`## ${name}  (${pat} · ${q} · ${seat})`);
  say();
  say(`A ${r1.a} · B ${r1.b}`);
  say();
  say('### floor');
  say('```');
  say(prose(r1.floor));
  say('```');
  say();
  say(`### baseline${bs.rendered?.source === 'module_assembly' ? '  (FLOORED — this draw fell to module assembly)' : ''}`);
  say('```');
  say(prose(bs.rendered));
  say('```');
  say();
  say(`### round 1${r1.rendered?.source === 'module_assembly' ? '  (FLOORED — this draw fell to module assembly)' : ''}`);
  say('```');
  say(prose(r1.rendered));
  say('```');
  say();
}

if (OUT) {
  fs.mkdirSync(OUT.replace(/\/[^/]+$/u, ''), { recursive: true });
  fs.writeFileSync(OUT, `${lines.join('\n')}\n`);
  console.log(`\nwrote ${OUT}`);
}
