#!/usr/bin/env node
// ============================================================
// BC amendment 2 item 3: the three extra reads, per render, over a round.json written by
// scripts/bc-amendment-round.mjs. Served text only (chapter texts and the penutup).
//   node docs/qa/2026-10-04-bc-names-close-round/reads.mjs <round.json>
//
// Candidates for a person to read, never a verdict:
//   second_person  every sentence with "kamu" or a word ending in "-mu" (a short list of
//                  ordinary words that merely end in "mu", such as "bertemu", is excluded)
//   penutup_cond   every penutup sentence containing "jika" or "dengan menyadari"
//   clinical       the count of "dinamika" and "menopang" (any suffix: dinamikanya)
//
// CONTROL: run it on docs/qa/2026-10-04-bc-adjustment-round/round.json first. That round
// served "kursi pasanganmu" (nonames 2), "Dengan menyadari bahwa ..." in a penutup
// (nonames 1) and 9 dinamika/menopang sentences; all three must show up.
// ============================================================

import { readFileSync } from 'node:fs';

const NOT_SECOND_PERSON = new Set(['temu', 'bertemu', 'ketemu', 'menemu', 'ilmu', 'jamu', 'ramu', 'tamu', 'meramu', 'kemu']);
const sentencesOf = (t) => String(t || '').replace(/\s+/gu, ' ').split(/(?<=[.!?])\s+/u).filter(Boolean);
const secondPerson = (s) => [...s.matchAll(/(?<![\p{L}])(\p{L}*mu)(?![\p{L}])/giu)]
  .map((m) => m[1].toLowerCase())
  .some((w) => w === 'kamu' || (w.length > 2 && !NOT_SECOND_PERSON.has(w)));
const clinicalCount = (t) => [...String(t || '').matchAll(/(?<![\p{L}])(dinamika|menopang)\p{L}*/giu)]
  .reduce((acc, m) => { acc[m[1].toLowerCase()] += 1; return acc; }, { dinamika: 0, menopang: 0 });

const { records } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const out = [];
for (const r of records) {
  const bodies = r.reading.blocks.map((b) => b.text || '');
  const all = [...bodies, r.reading.penutup || ''].flatMap(sentencesOf);
  const pen = sentencesOf(r.reading.penutup);
  out.push({
    pair: r.pair,
    render: r.render,
    second_person: all.filter(secondPerson),
    penutup_cond: pen.filter((s) => /(?<![\p{L}])jika(?![\p{L}])|dengan menyadari/iu.test(s)),
    clinical: clinicalCount([...bodies, r.reading.penutup || ''].join('\n')),
  });
}
for (const x of out) {
  console.log(`${x.pair} #${x.render}: second_person ${x.second_person.length}, penutup_cond ${x.penutup_cond.length}, dinamika ${x.clinical.dinamika}, menopang ${x.clinical.menopang}`);
  for (const s of x.second_person) console.log(`  [2p] ${s}`);
  for (const s of x.penutup_cond) console.log(`  [penutup] ${s}`);
}
