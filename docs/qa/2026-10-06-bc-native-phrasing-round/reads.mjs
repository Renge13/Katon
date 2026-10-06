#!/usr/bin/env node
// ============================================================
// BC amendment 2d item 3: the reads, per render, over a round.json written by
// scripts/bc-amendment-round.mjs.
//   node docs/qa/2026-10-06-bc-native-phrasing-round/reads.mjs <round.json> [--json]
//
// Carried from docs/qa/2026-10-04-bc-paragraphs-round/reads.mjs (same definitions):
//   raw / served paragraphs per chapter, pair.supply_inverted rejections, "kamu"/"-mu"
//   sentences, penutup "jika"/"dengan menyadari"/"dengan menghargai", dinamika/menopang.
// New for 2d:
//   phrases   every sentence with "disengaja", "memegang ruang", "pekerjaan emosional" or
//             "hadir sepenuhnya" (the last is the prompt's own example phrase)
//   overlap   distinct six-word sequences of the render shared with the gold sample
//             (docs/content/compat-target-sample-2026-10-02.md)
//
// THE OVERLAP METHOD is Cowork's 2c read, reproduced before it was trusted: lowercase runs of
// letters (so "sehari-hari" is two words), the render's chapter texts and penutup without
// headings, the gold sample's body after its header comment with headings, DISTINCT
// six-word sequences. On docs/qa/2026-10-04-bc-paragraphs-round/round.json, sample render 1,
// it gives 437 of 675 - Cowork's figure exactly. CONTROL: gold against itself must be 100%,
// and the script exits 2 if it is not.
// ============================================================

import { readFileSync } from 'node:fs';

const ROOT = new URL('../../../', import.meta.url);
const NOT_SECOND_PERSON = new Set(['temu', 'bertemu', 'ketemu', 'menemu', 'ilmu', 'jamu', 'ramu', 'tamu', 'meramu', 'kemu']);
const sentencesOf = (t) => String(t || '').replace(/\s+/gu, ' ').split(/(?<=[.!?])\s+/u).filter(Boolean);
const secondPerson = (s) => [...s.matchAll(/(?<![\p{L}])(\p{L}*mu)(?![\p{L}])/giu)]
  .map((m) => m[1].toLowerCase())
  .some((w) => w === 'kamu' || (w.length > 2 && !NOT_SECOND_PERSON.has(w)));
const clinicalCount = (t) => [...String(t || '').matchAll(/(?<![\p{L}])(dinamika|menopang)\p{L}*/giu)]
  .reduce((acc, m) => { acc[m[1].toLowerCase()] += 1; return acc; }, { dinamika: 0, menopang: 0 });
const paras = (t) => String(t || '').split(/\n\s*\n/u).map((p) => p.trim()).filter(Boolean);
const PHRASES = /disengaja|memegang ruang|pekerjaan emosional|hadir sepenuhnya/iu;

const words = (t) => String(t || '').toLowerCase().match(/\p{L}+/gu) || [];
const sixGrams = (ws) => {
  const s = new Set();
  for (let i = 0; i + 6 <= ws.length; i += 1) s.add(ws.slice(i, i + 6).join(' '));
  return s;
};
const goldMd = readFileSync(new URL('docs/content/compat-target-sample-2026-10-02.md', ROOT), 'utf8').replace(/\r\n?/gu, '\n');
const GOLD = sixGrams(words(goldMd.slice(goldMd.indexOf('-->') + 3)));
const shared = (set) => [...set].filter((g) => GOLD.has(g)).length;
const goldSelf = shared(GOLD);
if (goldSelf !== GOLD.size) { console.error(`CONTROL FAILED: gold vs gold ${goldSelf}/${GOLD.size}`); process.exit(2); }

const { records } = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const out = records.map((r) => {
  const bodies = r.reading.blocks.map((b) => b.text || '');
  const prose = [...bodies, r.reading.penutup || ''].join('\n');
  let raw;
  try { raw = JSON.parse(r.raw_responses?.at(-1) ?? 'null'); } catch { raw = null; }
  const grams = sixGrams(words(prose));
  return {
    pair: r.pair,
    render: r.render,
    raw_paragraphs: raw?.blocks ? raw.blocks.map((b) => (Array.isArray(b.paragraphs) ? b.paragraphs.length : null)) : null,
    served_paras: bodies.map((t) => paras(t).length),
    supply_inverted: r.findings.flatMap((f) => (f.rejecting || [])
      .filter((x) => x.check === 'pair.supply_inverted').map((x) => ({ attempt: f.attempt, message: x.message }))),
    second_person: sentencesOf(prose).filter(secondPerson),
    penutup_cond: sentencesOf(r.reading.penutup).filter((s) => /(?<![\p{L}])jika(?![\p{L}])|dengan menyadari|dengan menghargai/iu.test(s)),
    clinical: clinicalCount(prose),
    phrases: sentencesOf(prose).filter((s) => PHRASES.test(s)),
    overlap: { shared: shared(grams), of: grams.size },
  };
});
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify({ gold_self: `${goldSelf}/${GOLD.size}`, renders: out }, null, 2));
} else {
  console.log(`control: gold vs gold ${goldSelf}/${GOLD.size}`);
  for (const x of out) {
    const pct = x.overlap.of ? Math.round((100 * x.overlap.shared) / x.overlap.of) : 0;
    console.log(`${x.pair} #${x.render}: raw ${JSON.stringify(x.raw_paragraphs)} served ${JSON.stringify(x.served_paras)} | overlap ${x.overlap.shared}/${x.overlap.of} (${pct}%) | supply_inverted ${x.supply_inverted.length}, second_person ${x.second_person.length}, penutup_cond ${x.penutup_cond.length}, dinamika ${x.clinical.dinamika}, menopang ${x.clinical.menopang}, phrases ${x.phrases.length}`);
    for (const s of x.supply_inverted) console.log(`  [supply_inverted, attempt ${s.attempt}] ${s.message}`);
    for (const s of x.second_person) console.log(`  [2p] ${s}`);
    for (const s of x.penutup_cond) console.log(`  [penutup] ${s}`);
    for (const s of x.phrases) console.log(`  [phrase] ${s}`);
  }
}
