#!/usr/bin/env node
// ============================================================
// BC amendment 2c item 3: the reads, per render, over a round.json written by
// scripts/bc-amendment-round.mjs (which records each call's raw model text since 2c).
//   node docs/qa/2026-10-04-bc-paragraphs-round/reads.mjs <round.json> [--json]
//
// Candidates for a person to read, never a verdict (no model judge):
//   raw_paragraphs  paragraphs per chapter in the writer's own `paragraphs` arrays (the served
//                   attempt's raw response)
//   served_paras    paragraphs per chapter in the served text (split on blank lines)
//   second          every chapter's SECOND paragraph, verbatim, for a person to read for a scene
//   supply_inverted every pair.supply_inverted rejection, with its sentence
//   second_person   every sentence with "kamu" or a word ending in "-mu" (ordinary words that
//                   merely end in "mu", such as "bertemu", are excluded)
//   penutup_cond    every penutup sentence with "jika", "dengan menyadari" or "dengan menghargai"
//   clinical        the count of "dinamika" and "menopang" (any suffix)
//
// The last three reads are amendment 2's reads.mjs plus "dengan menghargai"; its control
// (amendment 1's round.json) carries over.
// ============================================================

import { readFileSync } from 'node:fs';

const NOT_SECOND_PERSON = new Set(['temu', 'bertemu', 'ketemu', 'menemu', 'ilmu', 'jamu', 'ramu', 'tamu', 'meramu', 'kemu']);
const sentencesOf = (t) => String(t || '').replace(/\s+/gu, ' ').split(/(?<=[.!?])\s+/u).filter(Boolean);
const secondPerson = (s) => [...s.matchAll(/(?<![\p{L}])(\p{L}*mu)(?![\p{L}])/giu)]
  .map((m) => m[1].toLowerCase())
  .some((w) => w === 'kamu' || (w.length > 2 && !NOT_SECOND_PERSON.has(w)));
const clinicalCount = (t) => [...String(t || '').matchAll(/(?<![\p{L}])(dinamika|menopang)\p{L}*/giu)]
  .reduce((acc, m) => { acc[m[1].toLowerCase()] += 1; return acc; }, { dinamika: 0, menopang: 0 });
const paras = (t) => String(t || '').split(/\n\s*\n/u).map((p) => p.trim()).filter(Boolean);

const { records } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const out = records.map((r) => {
  const bodies = r.reading.blocks.map((b) => b.text || '');
  let raw = null;
  try { raw = JSON.parse(r.raw_responses?.at(-1) ?? 'null'); } catch { raw = null; }
  return {
    pair: r.pair,
    render: r.render,
    raw_paragraphs: raw?.blocks ? raw.blocks.map((b) => (Array.isArray(b.paragraphs) ? b.paragraphs.length : null)) : null,
    served_paras: bodies.map((t) => paras(t).length),
    second: r.reading.blocks.map((b) => ({ heading: b.heading, fact_ids: b.fact_ids, text: paras(b.text)[1] ?? null })),
    supply_inverted: r.findings.flatMap((f) => (f.rejecting || [])
      .filter((x) => x.check === 'pair.supply_inverted').map((x) => ({ attempt: f.attempt, message: x.message }))),
    second_person: [...bodies, r.reading.penutup || ''].flatMap(sentencesOf).filter(secondPerson),
    penutup_cond: sentencesOf(r.reading.penutup).filter((s) => /(?<![\p{L}])jika(?![\p{L}])|dengan menyadari|dengan menghargai/iu.test(s)),
    clinical: clinicalCount([...bodies, r.reading.penutup || ''].join('\n')),
  };
});
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(out, null, 2));
} else {
  for (const x of out) {
    console.log(`${x.pair} #${x.render}: raw ${JSON.stringify(x.raw_paragraphs)} served ${JSON.stringify(x.served_paras)} | supply_inverted ${x.supply_inverted.length}, second_person ${x.second_person.length}, penutup_cond ${x.penutup_cond.length}, dinamika ${x.clinical.dinamika}, menopang ${x.clinical.menopang}`);
    for (const s of x.supply_inverted) console.log(`  [supply_inverted, attempt ${s.attempt}] ${s.message}`);
    for (const s of x.second_person) console.log(`  [2p] ${s}`);
    for (const s of x.penutup_cond) console.log(`  [penutup] ${s}`);
  }
}
