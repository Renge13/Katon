#!/usr/bin/env node
// ============================================================
// scripts/report-voice-round6.mjs — Prompt AT §4, off the stored records
// ============================================================
//   node --conditions=react-server scripts/report-voice-round6.mjs
//
// SPENDS NOTHING. Reads reports/voice-v2/round6-data/r6-*.json and writes:
//   round6-data/REPORT-blind.md   keyed by blinded id only; the arm-revealing columns
//                                 (ms, tokens, cost) are in a separate section at the end
//   round6-data/REPORT-arms.md    per-arm roll-up (UNBLINDS)
// Measures are recomputed from the SERVED text here, so a fix to a measure does not need
// a re-render. The claim sweep is scripts/count-portrait-claims.mjs, unchanged.
// ============================================================

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATA = 'reports/voice-v2/round6-data';
const G = JSON.parse(fs.readFileSync('docs/content/glossary.json', 'utf8'));
const recs = fs.readdirSync(DATA).filter((f) => /^r6-\d\d-v2\.json$/u.test(f)).sort()
  .map((f) => JSON.parse(fs.readFileSync(`${DATA}/${f}`, 'utf8')));
if (recs.length !== 10) throw new Error(`expected 10 records, found ${recs.length}`);

// Relation English, compared the way the gate compares brackets (lowercase), and also
// with hyphens as spaces: the writer wrote "(half-combination)" and "(self-punishment)",
// which no glossary string matches exactly and every reader reads as the same English.
const norm = (s) => s.toLowerCase().replace(/-/gu, ' ').replace(/\s+/gu, ' ').trim();
const REL_EN = new Set(Object.entries(G.relasi_cabang).filter(([k]) => !k.startsWith('_')).map(([, v]) => norm(v.name_en)));
const isRelationEnglish = (b) => REL_EN.has(norm(b)) || [...REL_EN].some((r) => norm(b).endsWith(r)) || /^(self )?punishment$|^trine$/u.test(norm(b));

const run = spawnSync(process.execPath, ['--conditions=react-server', 'scripts/count-portrait-claims.mjs', DATA], { encoding: 'utf8' });
if (run.status !== 0) throw new Error(`count-portrait-claims failed:\n${run.stderr}`);

const row = (r) => {
  const relOwn = r.relations.filter((x) => x.own_block).length;
  const relBr = r.brackets.list.filter(isRelationEnglish);
  return `| ${r.id} | ${r.subject.slice(0, 7)} | ${r.words} | ${r.floored ? 'FLOOR' : 'served'} | ${r.regenerations} | ${r.findings_hard.length} / ${r.findings_logged.length} | ${r.bintang.filter((x) => x.named).length}/${r.bintang.length} | ${r.relations.length} (${relOwn} own block) | ${relBr.length} / ${r.brackets.total} | ${r.questions.length} |`;
};
const blind = [
  '# Voice round 6 (Prompt AT), blinded',
  '',
  `Gate: ${recs[0].gate}. 10 readings, flash-lite, ROUND-6 prompt, in memory. Keyed by blinded id; the key is reports/voice-v2/round6/KEY.json.`,
  '',
  '| id | chart | words | served | regens | hard / logged | bintang named | relation facts | brackets on relations / total | questions to her |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...recs.map(row),
  '',
  '## Brackets in each served reading (relation English marked *)',
  ...recs.map((r) => `- **${r.id}**: ${r.brackets.list.map((b) => (isRelationEnglish(b) ? `*(${b})*` : `(${b})`)).join(' ') || 'none'}`),
  '',
  '## Bintang facts: named or not',
  ...recs.map((r) => `- **${r.id}**: ${r.bintang.map((x) => `${x.label} ${x.named ? 'named' : 'NOT named'}`).join('; ') || 'none in the payload'}`),
  '',
  '## Relation facts: own block, and how many sentences name each',
  ...recs.map((r) => `- **${r.id}**: ${r.relations.map((x) => `${x.label} ${x.own_block ? 'OWN BLOCK' : 'folded'}, ${x.sentences_naming_it} sentence(s)`).join('; ') || 'none'}`),
  '',
  '## Questions addressed to her',
  ...recs.map((r) => `- **${r.id}**: ${r.questions.map((q) => `"${q}"`).join(' ') || 'none'}`),
  '',
  '## Last sentence of each block that carries a cost (for a read, not scored)',
  ...recs.flatMap((r) => [`- **${r.id}**`, ...r.cost_blocks.map((c) => `  - ${c.heading || `block ${c.block}`}: "${c.last}"`)]),
  '',
  '## Sentences that may explain the mechanism (word-list hits, for a read)',
  ...recs.map((r) => `- **${r.id}**: ${r.mechanism_sentences.map((s) => `"${s}"`).join(' ') || 'none'}`),
  '',
  '## Gate findings: logged on the served text, and rejected drafts',
  ...recs.map((r) => `- **${r.id}**: logged ${[...new Set(r.findings_logged.map((f) => f.check))].join(', ') || 'none'} | rejected ${r.rejected_attempts.map((a) => (a.detail?.length ? a.detail.map((d) => `${d.check}: ${d.message}`).join('; ') : (a.stage6.join(', ') || a.error))).join(' | ') || 'none'}`),
  '',
  '## §4 truth sweep: scripts/count-portrait-claims.mjs, unchanged, on round6-data',
  '```',
  run.stdout.trim(),
  '```',
  '',
  '## ARM-REVEALING COLUMNS. Read the PDFs first.',
  '| id | ms | tokens in / out / thinking | cost |',
  '|---|---|---|---|',
  ...recs.map((r) => `| ${r.id} | ${r.ms} | ${r.tokens.in} / ${r.tokens.out} / ${r.tokens.thinking} | $${r.cost_usd.toFixed(4)} |`),
  '',
];
fs.writeFileSync(`${DATA}/REPORT-blind.md`, `${blind.join('\n')}\n`);

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const arms = [...new Set(recs.map((r) => r.arm))].sort().map((a) => {
  const rs = recs.filter((r) => r.arm === a);
  return `| ${a} | ${rs[0].temperature} | ${rs.map((r) => `${r.id} ${r.subject.slice(0, 7)} ${r.words}w`).join('; ')} | ${Math.round(mean(rs.map((r) => r.words)))} | ${rs.filter((r) => !r.floored).length}/${rs.length} | ${rs.reduce((n, r) => n + r.regenerations, 0)} | ${rs.reduce((n, r) => n + r.brackets.list.filter(isRelationEnglish).length, 0)} | ${rs.reduce((n, r) => n + r.bintang.filter((x) => x.named).length, 0)}/${rs.reduce((n, r) => n + r.bintang.length, 0)} | $${mean(rs.map((r) => r.cost_usd)).toFixed(4)} |`;
});
fs.writeFileSync(`${DATA}/REPORT-arms.md`, `${[
  '# Voice round 6, UNBLINDED roll-up', '',
  '| arm | temp | readings | mean words | served | regens | relation brackets | bintang named | mean cost |',
  '|---|---|---|---|---|---|---|---|---|', ...arms, ''].join('\n')}\n`);
console.log(blind.join('\n'));
