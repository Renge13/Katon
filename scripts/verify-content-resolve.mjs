#!/usr/bin/env node
// Verify the wired content resolves for a stem/state/domain, independent of DB/Supabase.
// Loads lib/content with the server-only guard stripped (plain-Node compat). Usage:
//   node scripts/verify-content-resolve.mjs 丙 governed hubungan
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'lib', 'content');
const TMP = path.join(ROOT, 'scripts', 'fixtures', '_resolve');
fs.mkdirSync(TMP, { recursive: true });
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.js')) continue;
  const txt = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^import 'server-only';\s*\r?\n/m, '');
  fs.writeFileSync(path.join(TMP, f), txt);
}
const C = await import(pathToFileURL(path.join(TMP, 'index.js')).href);

const [stem = '丙', state = 'governed', domain = 'hubungan'] = process.argv.slice(2);
const free = C.getFreeContent(stem, state, domain);
const teaser = C.getTeaser(stem, state, domain);
const paid = C.getPaidDomain(stem, state, domain);

console.log(`resolve(${stem}, ${state}, ${domain}):`);
console.log('  archetype   :', free?.archetypeName, '|', free?.dayMasterChinese, free?.dayMasterElement);
console.log('  servedState :', free?.servedState, `(requested ${state} -> fallback if unwritten)`);
console.log('  modifier    :', free?.card?.modifier);
console.log('  feed / drain:', free?.card?.feed, '/', free?.card?.drain);
console.log('  bridge?     :', Boolean(free?.bridge?.[0]));
console.log('  teaser acc  :', (teaser?.accordion || []).map((a) => a.title));
console.log('  paid beats  :', paid ? ['beat1','beat2','beat3','beat4','beat5','beat6','beat7'].map((b) => (paid[b] ? '✓' : '✗')).join('') : '(null)');
console.log('  beat5 hour  :', paid?.beat5?.hourNote?.slice(0, 40) + '…');
console.log('  closer      :', paid?.closer?.slice(0, 40) + '…');
fs.rmSync(TMP, { recursive: true, force: true });
