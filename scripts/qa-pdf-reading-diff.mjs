#!/usr/bin/env node
// ============================================================
// scripts/qa-pdf-reading-diff.mjs — Prompt AW's text proof: the reading is unchanged
// ============================================================
//   node scripts/qa-pdf-reading-diff.mjs <before-dir> <after-dir>
//
// For each Complete Edition in both dirs (scripts/qa-pdf-design.mjs output), the text
// of the reading pages (from "Bacaanmu" to "Bagan Kelahiran") as ONE word stream,
// compared three ways:
//   1. before vs the SOURCE prose (the AV §3 smoke record): every word, in order;
//   2. after vs the source, the same;
//   3. the headings, case-insensitively (AW sets them as the web's uppercase eyebrow).
// Word streams, because a layout change moves line breaks and nothing else should
// move. Exits 1 on any difference and prints the first one.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';

const [beforeDir, afterDir] = process.argv.slice(2);
const smoke = JSON.parse(fs.readFileSync('reports/voice-v2/round6-switch/smoke-1.json', 'utf8'));
const ids = { 'ce-smewTN': 'smewTNtzNaoQmWysi6mYU', 'ce-chart1': 'chart1' };

// An italic gloss is its own text run, so extraction breaks the line before the
// punctuation that follows it ("(The Mountain)\n,"). Whitespace before closing
// punctuation is that noise, the same before and after, and is dropped.
const words = (t) => t.replace(/\(\s+/gu, '(').replace(/\s+([,.;:!?)])/gu, '$1').split(/\s+/u).filter(Boolean);
function readingText(dir, name) {
  const pages = JSON.parse(fs.readFileSync(path.join(dir, `${name}.pages.json`), 'utf8'));
  const all = pages.join('\n').replace(/Katon - Edisi Lengkap\n/gu, '');
  const from = all.indexOf('Bacaanmu') + 'Bacaanmu'.length;
  return all.slice(from, all.indexOf('Bagan Kelahiran', from));
}
function firstDiff(a, b) {
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i += 1) if (a[i] !== b[i]) return { at: i, got: a.slice(i, i + 6).join(' '), want: b.slice(i, i + 6).join(' ') };
  return null;
}

let bad = 0;
for (const [name, id] of Object.entries(ids)) {
  const rec = smoke.find((r) => r.id === id);
  const source = rec.rendered.blocks.flatMap((b) => [b.heading || '', b.text || '']).concat(rec.rendered.penutup || '').join(' ');
  const sourceWords = words(source).map((w) => w.toUpperCase());
  for (const [label, dir] of [['before', beforeDir], ['after', afterDir]]) {
    // Case-folded: the headings are the only words whose case the design changes.
    const got = words(readingText(dir, name)).map((w) => w.toUpperCase());
    const d = firstDiff(got, sourceWords);
    console.log(`${name} ${label}: ${got.length} words vs source ${sourceWords.length}: ${d ? `DIFFERS at word ${d.at}: "${d.got}" vs "${d.want}"` : 'IDENTICAL'}`);
    if (d) bad += 1;
  }
  // Case-sensitive on the prose alone (headings removed from both sides).
  const heads = new Set(rec.rendered.blocks.map((b) => (b.heading || '').toUpperCase()).filter(Boolean));
  const proseOnly = (t) => { let s = t; for (const h of heads) s = s.split(h).join(' '); return words(s); };
  const afterProse = proseOnly(readingText(afterDir, name).replace(/^[^\n]*$/gmu, (l) => (heads.has(l.trim().toUpperCase()) ? '' : l)));
  const srcProse = words(rec.rendered.blocks.map((b) => b.text).concat(rec.rendered.penutup || '').join(' '));
  const d = firstDiff(afterProse, srcProse);
  console.log(`${name} after, prose case-sensitive: ${d ? `DIFFERS at word ${d.at}: "${d.got}" vs "${d.want}"` : 'IDENTICAL'}`);
  if (d) bad += 1;
}
process.exitCode = bad ? 1 : 0;
