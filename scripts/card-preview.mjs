#!/usr/bin/env node
// ============================================================
// scripts/card-preview.mjs — render every archetype's card, to look at
// ============================================================
// Writes `reports/card-preview.html`. Open it in a browser.
//
//   npm run preview:cards
//
// WHY A FILE AND NOT A ROUTE. The card is not wired to anything a user reaches,
// and adding a page to ship it to a reviewer would put it on the deployed site.
// The repo already answers this the same way (`npm run gallery:rejections` ->
// `reports/`), so this follows that rather than inventing a second pattern.
//
// WHAT IT IS FOR. Three decisions are open and none of them can be taken from
// source code — they need eyes:
//   1. the five UNAPPROVED colour tokens, next to the five locked ones
//   2. what separates the card object from the canvas when both are one colour
//   3. whether Card B's difference survives being 100px tall in a feed
// The page puts each of those in front of the reader rather than describing it,
// including a thumbnail shelf, because a difference that needs a caption is not
// a difference.
//
// Charts are picked by SEARCHING for a real birthdate per Day Master stem, not
// hand-written: a hardcoded date that drifts one solar term renders the wrong
// archetype and nothing would catch it.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
// react-dom/server is CommonJS, so the named import fails under plain node.
import ReactDOMServer from 'react-dom/server';

const { renderToStaticMarkup } = ReactDOMServer;

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CARD_TOKENS } from '../lib/card/tokens.js';
import { CardA, CardB } from '../components/cards/Card.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'reports', 'card-preview.html');
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** One real birthdate per Day Master, found by walking days from a fixed start. */
function chartsPerStem() {
  const found = new Map();
  const start = Date.UTC(1990, 0, 1);
  for (let i = 0; i < 400 && found.size < STEMS.length; i++) {
    const d = new Date(start + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const chart = calculateBaziChart({ birthDate: iso, birthTime: '09:00' });
    const stem = chart.day.stem;
    if (!found.has(stem)) found.set(stem, { iso, chart });
  }
  return STEMS.map((s) => ({ stem: s, ...found.get(s) }));
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function main() {
  const rows = chartsPerStem().map(({ stem, iso, chart }, i) => {
    const semanticJson = buildSemanticJson(chart);
    // Alternate the footer so BOTH ruled gender strings and the null case are all
    // visible on one page: PEREMPUAN, LAKI-LAKI, then date-only.
    const gender = i % 3 === 0 ? 'female' : i % 3 === 1 ? 'male' : null;
    const data = buildCardData({ chart, semanticJson, birthDate: iso, gender });
    return {
      stem, iso, data,
      approved: CARD_TOKENS[stem].approved,
      a: renderToStaticMarkup(React.createElement(CardA, { data, scale: 0.36 })),
      b: renderToStaticMarkup(React.createElement(CardB, { data, scale: 0.28 })),
      thumbA: renderToStaticMarkup(React.createElement(CardA, { data, scale: 0.093 })),
      thumbB: renderToStaticMarkup(React.createElement(CardB, { data, scale: 0.07 })),
    };
  });

  const unapproved = rows.filter((r) => !r.approved).map((r) => r.data.nameId);

  const html = `<!doctype html>
<meta charset="utf-8">
<title>Katon card preview</title>
<style>
  :root { --font-hanken: system-ui, -apple-system, "Segoe UI", sans-serif;
          --font-spectral: Georgia, "Times New Roman", serif; }
  body { background:#111113; color:#d9d7d2; font-family:var(--font-hanken);
         margin:0; padding:40px 36px 120px; }
  h1 { font-size:26px; margin:0 0 8px; letter-spacing:.01em; }
  h2 { font-size:12px; letter-spacing:.24em; text-transform:uppercase; color:#84817a;
       border-bottom:1px solid #26262a; padding-bottom:10px; margin:52px 0 24px; }
  p  { font-size:13.5px; line-height:1.7; color:#bab7b0; max-width:92ch; }
  b  { color:#e6e4de; }
  .flag { background:#1d1712; border:1px solid #5a3a20; border-radius:10px;
          padding:16px 20px; max-width:92ch; margin-top:16px; }
  .pair { display:flex; gap:26px; align-items:flex-start; margin-bottom:40px; flex-wrap:wrap; }
  .cap { font-size:12px; color:#84817a; margin:10px 0 0; }
  .cap .no { color:#e0a05f; }
  .cap .yes { color:#8fc0a0; }
  .shelf { display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end; }
  .shelf figcaption { font-size:9.5px; letter-spacing:.08em; color:#5f5d58;
                      text-transform:uppercase; margin-top:6px; text-align:center; }
</style>

<h1>Katon cards, all ten archetypes</h1>
<p>Generated by <code>npm run preview:cards</code>. Card A is the free shareable, a 63:88 object on a
3:4 1080x1440 canvas at a uniform 86.4 margin. Card B is 1080x1920. Both are shown scaled; every
dimension in the markup is the real export pixel size.</p>

<div class="flag"><b>Three things on this page are NOT decided, and looking at them is the point.</b>
<br><br><b>1. Colour tokens.</b> ${unapproved.length} of ten are the 2026-08-03 proposal and are
unapproved: ${esc(unapproved.join(', '))}. They render so they can be judged next to the five locked
ones; they must not ship. Source and measurements:
<code>docs/content/sharecard-tokens-proposal.html</code>.
<br><br><b>2. What separates the card object from the canvas</b> when both carry the same colour.
Rendered here as a hairline inset plus a soft shadow, which needs no fourth token per archetype. The
alternative is a different surface value for the card, which does.
<br><br><b>3. Does Card B read as the paid one at thumbnail size?</b> The shelf at the bottom is the
test. Print resolution is invisible in a feed, so the difference has to be the 9:16 silhouette, the
Indonesian name above the English one, and the appendix band.</div>

<h2>Thumbnail shelf — the only test that matters for questions 2 and 3</h2>
<div class="shelf">
${rows.map((r) => `<figure style="margin:0"><div>${r.thumbA}</div><figcaption>${esc(r.data.nameId)} A</figcaption></figure>`).join('\n')}
</div>
<div class="shelf" style="margin-top:22px">
${rows.map((r) => `<figure style="margin:0"><div>${r.thumbB}</div><figcaption>${esc(r.data.nameId)} B</figcaption></figure>`).join('\n')}
</div>
<p class="cap">Top row Card A, bottom row Card B, both at feed scale. If you cannot tell the rows
apart without reading the captions, question 3 is answered no.</p>

${rows.map((r) => `
<h2>${esc(r.data.nameId)} / ${esc(r.data.nameEn)} &mdash; ${esc(r.stem)} ${esc(r.data.element)}</h2>
<div class="pair"><div>${r.a}</div><div>${r.b}</div></div>
<p class="cap">Chart ${esc(r.iso)} 09:00. Token <span class="${r.approved ? 'yes' : 'no'}">${r.approved ? 'LOCKED' : 'PROPOSED, not approved'}</span>.
Aspek <b>${esc(r.data.aspek)}</b>. Fixed tags ${esc(r.data.tags.fixed.join(', '))}.
Dynamic ${esc(r.data.tags.dynamic.join(', ')) || '(none)'}.
Footer <b>${esc(r.data.footer.left)}</b>${r.data.footer.gender ? '' : ' (null gender: date and source only)'}.</p>
`).join('\n')}
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
  console.log(`${rows.length} archetypes, ${rows.filter((r) => r.approved).length} locked tokens, ${unapproved.length} unapproved`);
}

main();
