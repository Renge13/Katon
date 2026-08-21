#!/usr/bin/env node
// ============================================================
// scripts/probe-floor-rate.mjs — how often does a reader get the floor?
// ============================================================
//   npm run probe:floor-rate            10 runs per chart
//   npm run probe:floor-rate -- --n 3   fewer, when the budget is tight
//
// ── THE QUESTION, AND WHY IT IS NOT A LEDGER ROW ───────────
// `persistRendered` returns false on module_assembly (lib/render/index.js:295),
// so a floor is never frozen into `render_cache`. That is right, and it has a
// consequence: the floor is still SERVED. A chart that renders on one visit and
// floors on the next gives the same permanent link two different readings, and a
// hard-failing floor answers with 503. So the floor RATE is the size of a broken
// product promise, not a curiosity.
//
// ── WHAT MAKES THIS MEASUREMENT VALID ──────────────────────
// `renderReading` READS the cache and never writes it; only `persistRendered`
// writes, and no CLI calls it. So N invocations are N real renders rather than
// one render and N-1 cache hits. `cached` is recorded per run anyway: if it ever
// comes back true, a row exists from some other path and that run is not
// evidence about the renderer.
//
// ── THE THREE CAUSES IT SEPARATES ──────────────────────────
//   (a) provider transient  attempt carries `error` (429, 5xx, timeout)
//   (b) Stage 6 rejection   attempt carries `stage6` - the model returned prose
//                           and the gate refused it. NOT benign: the floor rate
//                           is then a property of the content and the prompt,
//                           and no retry policy reaches it.
//   (c) credits/rate limit  a provider error naming quota or exhaustion
// An attempt that fails with BOTH is counted under whichever the payload names.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { renderReading } from '../lib/render/index.js';
import { PROMPT_VERSION } from '../lib/render/prompt.js';

const CHARTS = [
  { label: 'chart 5', date: '1988-07-10', time: '22:00' },
  { label: 'chart 13', date: '1989-02-04', time: '04:00' },
  { label: 'chart 1', date: '1989-09-13', time: '09:00' },
  { label: 'fresh-1996', date: '1996-10-02', time: '19:20' },
];

const nFlag = process.argv.indexOf('--n');
const N = nFlag > -1 ? Number(process.argv[nFlag + 1]) : 10;
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;

const QUOTA = /quota|exhaust|rate.?limit|RESOURCE_EXHAUSTED|429/i;
const rows = [];

for (const c of CHARTS) {
  if (only && c.label !== only) continue;
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  const semantic = buildSemanticJson(chart);
  for (let i = 1; i <= N; i++) {
    const t0 = Date.now();
    let r;
    try {
      r = await renderReading(semantic, { allowUnvalidatedCache: false });
    } catch (e) {
      r = { source: 'THREW', error: String(e && e.message), attempts: [] };
    }
    const attempts = r.attempts || [];
    const errs = attempts.filter((a) => a.error).map((a) => a.error);
    const gate = attempts.filter((a) => !a.ok && a.stage6).map((a) => a.stage6.join('+'));
    rows.push({
      chart: c.label,
      run: i,
      source: r.source,
      model: r.model || null,
      prompt_version: r.prompt_version || null,
      cached: r.cached === true,
      ms: Date.now() - t0,
      attempts: attempts.length,
      gate,
      errs,
      quota: errs.some((e) => QUOTA.test(e)),
      qa_flag: r.qa_flag || null,
    });
    const last = rows[rows.length - 1];
    process.stderr.write(
      '  ' + c.label + ' ' + String(i).padStart(2) + '/' + N + '  ' + last.source
      + (last.cached ? ' CACHED' : '')
      + '  attempts=' + last.attempts
      + (gate.length ? '  gate=[' + gate.join(' | ') + ']' : '')
      + (errs.length ? '  err=[' + errs.join(' | ').slice(0, 120) + ']' : '')
      + '  ' + last.ms + 'ms\n',
    );
  }
}

console.log(JSON.stringify({ prompt_loaded: PROMPT_VERSION, n: N, rows }, null, 1));

const by = {};
for (const r of rows) {
  by[r.chart] ??= { n: 0, floor: 0, gateFloor: 0, netFloor: 0, quota: 0, cached: 0 };
  const b = by[r.chart];
  b.n++;
  if (r.cached) b.cached++;
  if (r.source !== 'gemini') {
    b.floor++;
    if (r.quota) b.quota++;
    else if (r.errs.length && !r.gate.length) b.netFloor++;
    else b.gateFloor++;
  }
}
process.stderr.write('\nFLOOR RATE\n');
for (const [k, b] of Object.entries(by)) {
  process.stderr.write(
    '  ' + k.padEnd(12) + ' floor ' + b.floor + '/' + b.n
    + ' (' + Math.round((b.floor / b.n) * 100) + '%)'
    + '   gate-caused ' + b.gateFloor + '   provider-caused ' + b.netFloor
    + '   quota ' + b.quota + '   cached ' + b.cached + '\n',
  );
}
const tot = Object.values(by).reduce((a, b) => ({
  n: a.n + b.n, floor: a.floor + b.floor, gateFloor: a.gateFloor + b.gateFloor,
  netFloor: a.netFloor + b.netFloor, quota: a.quota + b.quota,
}), { n: 0, floor: 0, gateFloor: 0, netFloor: 0, quota: 0 });
process.stderr.write(
  '  ' + 'ALL'.padEnd(12) + ' floor ' + tot.floor + '/' + tot.n
  + ' (' + Math.round((tot.floor / tot.n) * 100) + '%)'
  + '   gate-caused ' + tot.gateFloor + '   provider-caused ' + tot.netFloor
  + '   quota ' + tot.quota + '\n',
);
