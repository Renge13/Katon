#!/usr/bin/env node
// ============================================================
// scripts/extract-d1-heading-misfires.mjs — the fixture behind AL §1, by script
// ============================================================
//   node scripts/extract-d1-heading-misfires.mjs
//
// Writes tests/fixtures/voice-v2-d1-heading-misfires.json: every
// v2.d1_invented_term REJECTION line in the stored readings below whose term sat
// in a block HEADING of the rejected draft and nowhere in its prose, with that
// heading. The literals are copied out of the stored JSON, never retyped (Prompt
// AL: "red-first literals come from REJECTION lines or served JSON").
// ============================================================

import fs from 'node:fs';

const SOURCES = [
  'reports/voice-v2/round4c/PZ0t_B3YDnzdXc2LWV38D-v2.json',
  'reports/voice-v2/round4b/rVe4ca-FOhsprfGUucTxA-v2.json',
];
const OUT = 'tests/fixtures/voice-v2-d1-heading-misfires.json';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, (c) => `\\${c}`);

const cases = [];
for (const file of SOURCES) {
  const rec = JSON.parse(fs.readFileSync(file, 'utf8'));
  (rec.d_findings_rejected || []).forEach((rejection, i) => {
    const draft = rec.drafts[i];
    for (const line of rejection.detail || []) {
      if (line.check !== 'v2.d1_invented_term') continue;
      const term = /^"([^"]+)"/u.exec(line.message)?.[1];
      const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(term)}(?![\\p{L}\\p{N}])`, 'u');
      const inProse = draft.blocks.some((b) => re.test(b.text || '')) || re.test(draft.penutup || '');
      const block = draft.blocks.find((b) => re.test(b.heading || ''));
      if (!block || inProse) continue;
      cases.push({
        source: file, draft: i + 1, kind: rec.kind, inputs: rec.inputs,
        rejection: line.message, term, heading: block.heading, fact_ids: block.fact_ids,
      });
    }
  });
}

fs.writeFileSync(OUT, `${JSON.stringify({
  _about: `EVIDENCE, not output. Extracted by scripts/extract-d1-heading-misfires.mjs (Prompt AL §1) from ${SOURCES.join(', ')}: every v2.d1_invented_term REJECTION line whose term sat in a heading of the rejected draft and nowhere in its prose, with that heading. Never retyped.`,
  cases,
}, null, 2)}\n`);
console.log(`${cases.length} heading-only D1 rejection(s) -> ${OUT}`);
for (const c of cases) console.log(`  ${c.source}#draft${c.draft}  ${c.rejection}  <- heading "${c.heading}"`);
