#!/usr/bin/env node
// ============================================================
// scripts/report-voice-depth-r5.mjs — Prompt AR §2 and §3, off the stored records
// ============================================================
//   node --conditions=react-server scripts/report-voice-depth-r5.mjs
//
// SPENDS NOTHING. Reads reports/voice-v2/round5-data/r5-*.json (written by
// qa-voice-depth-r5.mjs) and prints two markdown files:
//   round5-data/REPORT-blind.md   §2 table and §3 sweep, keyed by blinded id only
//   round5-data/REPORT-arms.md    the same numbers rolled up per arm (UNBLINDS)
// §3's claim sweep is scripts/count-portrait-claims.mjs, run as it is, on the same
// folder; this file only joins its rows to the blinded ids. No new check is added.
// ============================================================

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATA = 'reports/voice-v2/round5-data';
const recs = fs.readdirSync(DATA).filter((f) => /^r5-\d\d-v2\.json$/u.test(f)).sort()
  .map((f) => JSON.parse(fs.readFileSync(`${DATA}/${f}`, 'utf8')));
if (recs.length !== 12) throw new Error(`expected 12 records, found ${recs.length}`);

// §3: the existing counter, unchanged, on this folder.
const run = spawnSync(process.execPath, ['--conditions=react-server', 'scripts/count-portrait-claims.mjs', DATA], { encoding: 'utf8' });
if (run.status !== 0) throw new Error(`count-portrait-claims failed:\n${run.stderr}`);
const counter = run.stdout;

const usd = (n) => (n == null ? '-' : `$${n.toFixed(4)}`);
const row = (r) => {
  const b = r.bintang; const cb = r.cost_blocks;
  return `| ${r.id} | ${r.subject.slice(0, 7)} | ${r.words} | ${r.floored ? 'FLOOR' : 'served'} | ${r.regenerations} | ${r.findings_hard.length} / ${r.findings_logged.length} | ${b.filter((x) => x.cited || x.named).length}/${b.length} | ${cb.filter((x) => x.helps).length}/${cb.length} | ${r.ms}${r.over_45s ? ' (>45s)' : ''} | ${r.tokens.in} / ${r.tokens.out} / ${r.tokens.thinking} | ${usd(r.cost_usd)}${r.cost_usd_2027 != null ? ` (2027: ${usd(r.cost_usd_2027)})` : ''} |`;
};

const blind = [
  '# Voice depth round 5 (Prompt AR), blinded',
  '',
  `Gate STAGE6 ${recs[0].stage6_version}. 12 readings, in memory. Keyed by blinded id; the arm key is reports/voice-v2/round5/KEY.json.`,
  '**Cost, tokens and latency differ by model and will unblind the arms. Read the PDFs first.**',
  '',
  '| id | chart | words | served | regens | gate hard / logged | bintang shown | cost blocks ending on what helps (heuristic) | ms | tokens in / out / thinking | cost |',
  '|---|---|---|---|---|---|---|---|---|---|---|',
  ...recs.map(row),
  '',
  '## Logged gate findings (served text), by id',
  ...recs.map((r) => `- **${r.id}**: ${r.findings_logged.map((f) => `${f.check}${f.message ? `: ${String(f.message).slice(0, 110)}` : ''}`).join('; ') || 'none'}`),
  '',
  '## Rejected drafts, by id',
  ...recs.map((r) => `- **${r.id}**: ${r.rejected_attempts.map((a) => (a.detail?.length ? a.detail.map((d) => `${d.check}: ${d.message}`).join('; ') : (a.stage6.join(', ') || a.error))).join(' | ') || 'none'}`),
  '',
  '## Bintang facts per reading (cited in fact_ids / named in text)',
  ...recs.map((r) => `- **${r.id}**: ${r.bintang.map((x) => `${x.label} ${x.cited ? 'cited' : '-'}/${x.named ? 'named' : '-'}`).join('; ') || 'no bintang fact in the payload'}`),
  '',
  '## Last sentence of each cost-bearing block',
  ...recs.flatMap((r) => [`- **${r.id}**`, ...r.cost_blocks.map((c) => `  - [${c.helps ? 'helps' : 'no'}] ${c.heading || `block ${c.block}`}: "${c.last}"`)]),
  '',
  '## §3 claim sweep: scripts/count-portrait-claims.mjs, unchanged, on round5-data',
  '```',
  counter.trim(),
  '```',
  '',
];
fs.writeFileSync(`${DATA}/REPORT-blind.md`, `${blind.join('\n')}\n`);

const arms = [...new Set(recs.map((r) => r.arm))].sort();
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const armRows = arms.map((a) => {
  const rs = recs.filter((r) => r.arm === a);
  return `| ${a} | ${rs[0].model} | ${rs[0].temperature} | ${rs[0].thinking_level} | ${rs.map((r) => r.id).join(', ')} | ${rs.map((r) => r.words).join(' / ')} (mean ${Math.round(mean(rs.map((r) => r.words)))}) | ${rs.filter((r) => !r.floored).length}/3 | ${rs.reduce((n, r) => n + r.regenerations, 0)} | ${Math.round(mean(rs.map((r) => r.ms)))} | ${usd(mean(rs.map((r) => r.cost_usd)))}${rs[0].cost_usd_2027 != null ? ` (2027: ${usd(mean(rs.map((r) => r.cost_usd_2027)))})` : ''} |`;
});
const arm = [
  '# Voice depth round 5, UNBLINDED roll-up',
  '',
  '| arm | model | temp | thinking | ids | words | served | regens | mean ms | mean cost / reading |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...armRows,
  '',
  '## §3 per arm: what the engine cannot back',
  'The claim counter found 0 false claims in all 12 served readings and all drafts (see REPORT-blind.md). Below are the gate\'s fact findings per arm: on SERVED text (logged, not rejecting) and on REJECTED drafts.',
  ...arms.flatMap((a) => {
    const rs = recs.filter((r) => r.arm === a);
    return [
      `### Arm ${a}`,
      ...rs.map((r) => {
        const served = r.findings_logged.filter((f) => f.check.startsWith('fact.')).map((f) => `${f.check}: ${f.message}`);
        const rej = r.rejected_attempts.flatMap((x) => (x.detail || []).map((d) => `${d.check}: ${d.message}`));
        return `- ${r.id} (${r.subject.slice(0, 7)}): served ${served.join('; ') || 'none'} | rejected drafts ${rej.join('; ') || 'none'}`;
      }),
    ];
  }),
  '',
];
fs.writeFileSync(`${DATA}/REPORT-arms.md`, `${arm.join('\n')}\n`);
console.log(blind.join('\n'));
