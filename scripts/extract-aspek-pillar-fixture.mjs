#!/usr/bin/env node
// ============================================================
// scripts/extract-aspek-pillar-fixture.mjs — the literals behind the Aspek-at-pillar check
// ============================================================
//   node scripts/extract-aspek-pillar-fixture.mjs
//
// Writes tests/fixtures/voice-v2-aspek-pillar.json (Prompt AO §2): the served sentences
// the check is red-first and controlled on, copied out of the stored JSON by script,
// never retyped, with each reading's births.
//   reject   round 4d PZ0t, served: "Aspek Pengelola-mu ... di Pilar Kerja dan Pilar Diri"
//   log      an2 run 1 PZ0t, served: the same claim with no possessive (subject unknown)
//   control  round 4d chart1, served: its true Aspek-at-pillar and relation-span sentences
// ============================================================

import fs from 'node:fs';

const SRC = [
  { role: 'reject', file: 'reports/voice-v2/round4d/PZ0t_B3YDnzdXc2LWV38D-v2.json', find: /Aspek Pengelola-mu yang menonjol di Pilar Kerja dan Pilar Diri/u },
  { role: 'log', file: 'reports/voice-v2/an2/r1/PZ0t_B3YDnzdXc2LWV38D-v2.json', find: /Aspek Pengelola yang menonjol di Pilar Kerja dan Pilar Diri/u },
  // AN quoted these loosely ("Aspek Pengelola ... di pilar kerja"); the served text puts the
  // pillar first, and the relation carries its bracket. Matched as served.
  { role: 'control', file: 'reports/voice-v2/round4d/chart1-v2.json', find: /^Di pilar kerja, kamu membawa Aspek Pengelola|Setengah Gabungan \(Half Combination\) antara Pilar Akar, Pilar Kerja, dan Pilar Arah/u },
];
const split = (t) => String(t ?? '').split(/(?<=[.!?])\s+/u);
const out = [];
for (const s of SRC) {
  const rec = JSON.parse(fs.readFileSync(s.file, 'utf8'));
  for (const block of rec.rendered.blocks) {
    for (const sentence of split(block.text)) {
      if (s.find.test(sentence)) out.push({ role: s.role, source: s.file, kind: rec.kind, inputs: rec.inputs, fact_ids: block.fact_ids, heading: block.heading, sentence });
    }
  }
}
for (const role of ['reject', 'log', 'control']) if (!out.some((x) => x.role === role)) throw new Error(`no ${role} literal found`);
fs.writeFileSync('tests/fixtures/voice-v2-aspek-pillar.json', `${JSON.stringify({
  _about: 'EVIDENCE, not output. Extracted by scripts/extract-aspek-pillar-fixture.mjs (Prompt AO §2) from the stored served readings named in each entry. Never retyped.',
  cases: out,
}, null, 2)}\n`);
for (const x of out) console.log(`${x.role.padEnd(8)} ${x.source.replace('reports/voice-v2/', '')}  ${x.sentence}`);
