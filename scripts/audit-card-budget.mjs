#!/usr/bin/env node
// ============================================================
// scripts/audit-card-budget.mjs — does the badge block fit?
// ============================================================
//   npm run audit:card-budget            report glossary lengths vs the ceiling
//   npm run audit:card-budget -- --probe also write reports/card-budget-probe.html
//
// THE PROBLEM THIS MEASURES. Card B's badge block is the only part of the card
// whose size is content-driven: badge count runs 1 to 4 and each carries a
// `label_meaning` of 109 to 186 characters, so the block varies about sevenfold.
// A card is a fixed rectangle. Either the widest content fits or the design is
// only true for the charts that happen to be short, and the rest clip.
//
// TWO LEVERS, BOTH TAKEN, AND A THIRD REFUSED:
//   - cap the count at CARD_B_BADGE_LIMIT (3). Stage 3 already ranks by
//     importance, so the cut drops the least important one.
//   - cap the LENGTH at MAX_LABEL_MEANING, which is what fits at that count,
//     measured with --probe rather than guessed.
//   - REFUSED: auto-scaling type to fit. Cards must stay dimensionally identical
//     across the set; type that shrinks tells the reader how much text it has.
//
// The length cap is enforced as a TEST over `glossary.json`, never as a runtime
// truncation. Those strings are Reyner-ruled and cutting one mid-sentence at
// render time would be the card editing his copy.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { GLOSSARY } from '../lib/semantic/glossary.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CardB, CARD_B_BADGE_LIMIT, MAX_LABEL_MEANING } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const entries = Object.entries(GLOSSARY.bintang)
  .map(([k, v]) => ({ key: k, name: v.name_id, len: (v.label_meaning || '').length }))
  .sort((a, b) => b.len - a.len);

console.log(`badge cap ${CARD_B_BADGE_LIMIT}, label_meaning ceiling ${MAX_LABEL_MEANING} chars\n`);
console.log('  len  over?  bintang');
for (const e of entries) {
  console.log(`  ${String(e.len).padStart(3)}  ${e.len > MAX_LABEL_MEANING ? ' OVER ' : '      '}  ${e.key} ${e.name}`);
}
const over = entries.filter((e) => e.len > MAX_LABEL_MEANING);
const lens = entries.map((e) => e.len);
console.log(`\nmin ${Math.min(...lens)}  max ${Math.max(...lens)}  mean ${Math.round(lens.reduce((a, b) => a + b, 0) / lens.length)}`);
console.log(`${over.length} of ${entries.length} over the ceiling by up to ${over.length ? Math.max(...over.map((e) => e.len)) - MAX_LABEL_MEANING : 0} chars.`);
if (over.length) {
  console.log('These are Reyner-ruled strings. Shortening them is CONTENT WORK, not a code fix.');
}

if (process.argv.includes('--probe')) {
  // Renders Card B with three synthetic badges at a range of lengths, so a
  // browser can be asked where the block stops fitting. This is how
  // MAX_LABEL_MEANING was set; re-run it if the type scale or the card moves.
  // Coarse steps to find the band, then single characters through it. The card
  // steps by whole LINES, so the ceiling is wherever the meaning gains its third.
  const LENGTHS = process.env.CARD_PROBE_LENGTHS
    ? process.env.CARD_PROBE_LENGTHS.split(',').map(Number)
    : [109, 118, 120, 122, 124, 126, 128, 130, 150, 186];
  // REAL Indonesian, not lorem: glyph widths differ enough between synthetic
  // filler and actual copy to move the line break by a character or two, and the
  // number this probe produces becomes a content constraint on Reyner's strings.
  // The longest real `label_meaning` is the source, cut to length.
  const longest = entries[0].key;
  const source = GLOSSARY.bintang[longest].label_meaning.repeat(3);
  const filler = (n) => source.slice(0, n);
  const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  const base = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });

  const cards = LENGTHS.map((n) => {
    const data = {
      ...base,
      badges: Array.from({ length: CARD_B_BADGE_LIMIT }, (_, i) => ({
        label: `Bintang Contoh ${i + 1}`, meaning: filler(n), palace: null,
      })),
    };
    return `<section data-len="${n}"><h3>${n} chars x ${CARD_B_BADGE_LIMIT}</h3>`
      + renderToStaticMarkup(React.createElement(CardB, { data, scale: 0.5 })) + '</section>';
  });

  const out = path.join(ROOT, 'reports', 'card-budget-probe.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Card B budget probe</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}:root{--font-archivo:'Archivo',system-ui,sans-serif}
body{background:#111113;color:#d9d7d2;font-family:var(--font-archivo);display:flex;gap:22px;flex-wrap:wrap;padding:24px}
h3{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#84817a;margin:0 0 8px}</style>
${cards.join('\n')}`, 'utf8');
  console.log(`\nwrote ${path.relative(ROOT, out)} at lengths ${LENGTHS.join(', ')}`);
}

process.exitCode = 0;
