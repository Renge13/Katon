#!/usr/bin/env node
// ============================================================
// scripts/dump-render-cache.mjs — one cache row, as JSON on stdout
// ============================================================
//   node --conditions=react-server scripts/dump-render-cache.mjs <date> <time>
//
// ── WHY THIS IS A SEPARATE PROCESS, AND IT IS NOT A WORKAROUND ──
// `lib/render/cache.js` carries `server-only`, which resolves to an empty stub ONLY
// under `--conditions=react-server`. `@react-pdf/renderer`'s reconciler needs the
// CLIENT React build and crashes under that same condition - React resolves to its
// react-server entry, which has none of the internals the reconciler reaches for
// ("Cannot read properties of undefined (reading 'S')").
//
// So the two cannot share a process under plain `node`. They CAN share one inside
// Next, where `server-only` is satisfied by the bundler and a Node route is not an
// RSC, which is why this is a property of the script runner rather than of the
// design.
//
// The alternative was a second cache reader that skips `server-only`, and that means
// two implementations of "what a render_cache row is" - the defect this repo has paid
// for repeatedly. One reader, two processes.
//
// Prints `null` when there is no row. Never renders and never spends.
// ============================================================

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';
import { readCache } from '../lib/render/cache.js';

const [date, time] = process.argv.slice(2);
if (!date) {
  console.error('usage: dump-render-cache.mjs <YYYY-MM-DD> [HH:MM]');
  process.exit(2);
}

const semantic = buildSemanticJson(calculateBaziChart({
  birthDate: date, birthTime: time || null,
}));

// `includeUnvalidated: false` deliberately. A row that never passed Stage 6 is not a
// reading, and a paid document is the last place to relax that.
const row = await readCache(cacheKey(semantic), { includeUnvalidated: false });
process.stdout.write(JSON.stringify(row ?? null));
