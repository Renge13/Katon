#!/usr/bin/env node
// Compare the frozen structural fixture (current lib/content/matahari.js) against the
// regenerated candidate. Reports (1) STRUCTURAL match (key/type shape — must be identical)
// and (2) the PROSE diff (string values — for founder review). Usage:
//   node scripts/diff-matahari.mjs <staging-dir>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const __dirname = import.meta.dirname;
const ROOT = path.resolve(__dirname, '..');
const STAGE = process.argv[2];
if (!STAGE) { console.error('usage: node scripts/diff-matahari.mjs <staging-dir>'); process.exit(2); }

const fixMod = await import(pathToFileURL(path.join(ROOT, 'scripts/fixtures/matahari.structural.js')).href);
const fixture = fixMod.matahari;

// load candidate with the server-only guard stripped so it imports in plain Node
const cmp = path.join(STAGE, '_cmp');
fs.mkdirSync(cmp, { recursive: true });
for (const f of ['shared.js', 'matahari.js']) {
  const txt = fs.readFileSync(path.join(STAGE, f), 'utf8').replace(/^import 'server-only';\s*\r?\n/m, '');
  fs.writeFileSync(path.join(cmp, f), txt);
}
const candMod = await import(pathToFileURL(path.join(cmp, 'matahari.js')).href);
const candidate = candMod.matahari;

// ---- structural (key/type shape; arrays collapsed, values ignored) ----
function keyShape(v) {
  if (Array.isArray(v)) return 'array';
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v).sort()) o[k] = keyShape(v[k]); return o; }
  return typeof v;
}
const fShape = JSON.stringify(keyShape(fixture.states.balanced));
const cShape = JSON.stringify(keyShape(candidate.states.balanced));
console.log('=== STRUCTURAL (candidate.balanced vs fixture.balanced) ===');
if (fShape === cShape) {
  console.log('PASS — key/type shape identical (literals->constant-refs resolve to same types)\n');
} else {
  console.log('FAIL — shape differs:');
  console.log(' fixture :', fShape);
  console.log(' candidate:', cShape, '\n');
}
console.log('top-level archetype fields:',
  JSON.stringify(keyShape({ stem: candidate.stem, archetypeName: candidate.archetypeName, dayMasterChinese: candidate.dayMasterChinese, dayMasterElement: candidate.dayMasterElement })));
console.log('states present — fixture:', Object.keys(fixture.states).join(','), '| candidate:', Object.keys(candidate.states).join(','), '\n');

// ---- prose diff (string leaves) ----
const diffs = [];
function walk(a, b, p) {
  if (typeof a === 'string' || typeof b === 'string') {
    if (a !== b) diffs.push({ p, a, b });
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const A = a || [], B = b || [];
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i++) walk(A[i], B[i], `${p}[${i}]`);
    return;
  }
  if ((a && typeof a === 'object') || (b && typeof b === 'object')) {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    for (const k of keys) walk(a?.[k], b?.[k], p ? `${p}.${k}` : k);
  }
}
walk(fixture.states.balanced, candidate.states.balanced, '');

console.log(`=== PROSE DIFF (balanced) — ${diffs.length} field(s) changed: current matahari.js -> regenerated ===\n`);
const FULL = process.argv.includes('--full');
const clip = (s) => (s == null ? '(absent)' : (FULL ? s : JSON.stringify(s.length > 240 ? s.slice(0, 240) + '…' : s)));
for (const d of diffs) {
  console.log(`• ${d.p}`);
  console.log(`    CURRENT : ${clip(d.a)}`);
  console.log(`    NEW     : ${clip(d.b)}\n`);
}
fs.rmSync(cmp, { recursive: true, force: true });
