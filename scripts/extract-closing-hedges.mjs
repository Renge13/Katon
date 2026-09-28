#!/usr/bin/env node
// ============================================================
// scripts/extract-closing-hedges.mjs — the fixture behind AL §2, by script
// ============================================================
//   node scripts/extract-closing-hedges.mjs
//
// Writes tests/fixtures/voice-v2-closing-hedges.json: every stored round-4c v2
// reading whose SERVED text has a block (or the penutup) ending on a sentence
// that begins "Mungkin menarik untuk" / "Menarik untuk", with the whole served
// reading, so the gate can be run on it again at zero cost. Copied out of the
// stored JSON, never retyped (Prompt AL: literals "extracted by script from
// reports/voice-v2/round4c/*.json").
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const DIR = 'reports/voice-v2/round4c';
const OUT = 'tests/fixtures/voice-v2-closing-hedges.json';
const PHRASE = /^(?:mungkin\s+)?menarik\s+untuk\b/iu;
const finalSentence = (text) => String(text ?? '').trim().split(/(?<=[.!?])\s+/u).at(-1);

const readings = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('-v2.json')).sort()) {
  const rec = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  const r = rec.rendered;
  const units = [...r.blocks.map((b, i) => [`blocks[${i}]`, b.text]), ['penutup', r.penutup]];
  const closes = units.filter(([, t]) => PHRASE.test(finalSentence(t))).map(([where, t]) => ({ where, sentence: finalSentence(t) }));
  if (closes.length === 0) continue;
  readings.push({
    source: path.join(DIR, file).replaceAll('\\', '/'), subject: rec.subject, kind: rec.kind,
    inputs: rec.inputs, floored: rec.floored, closes,
    rendered: { blocks: r.blocks, penutup: r.penutup },
  });
}

fs.writeFileSync(OUT, `${JSON.stringify({
  _about: `EVIDENCE, not output. Extracted by scripts/extract-closing-hedges.mjs (Prompt AL §2) from ${DIR}/*.json: every served v2 reading with a block or penutup whose FINAL sentence begins "Mungkin menarik untuk" or "Menarik untuk", and the whole served reading. Never retyped.`,
  readings,
}, null, 2)}\n`);
console.log(`${readings.length} reading(s) -> ${OUT}`);
for (const r of readings) for (const c of r.closes) console.log(`  ${r.source} ${c.where}: ${c.sentence}`);
