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

if (process.argv.includes('--overflow')) {
  // ── DOES THE WHOLE CARD FIT, ON EVERY CHART IN THE FIXTURE? ──
  //
  // WHY THIS EXISTS ALONGSIDE --probe, WHICH LOOKS LIKE IT ANSWERS THE SAME
  // QUESTION. `--probe` varies ONE dimension - `label_meaning` length - on ONE
  // chart, with synthetic filler, and holds the hook and the tag rows at whatever
  // that chart happens to have. Three things vary per chart, not one:
  //
  //   hook          91 to 118 chars   (GLOSSARY.salah_dikira, per stem)
  //   badge meaning 114 to 344 chars  (up to CARD_B_BADGE_LIMIT of them)
  //   tags          4 or 6 rows       (3 fixed + up to 3 dynamic, deduped)
  //
  // So the chart that surfaced the 2026-08-26 overflow - 1989-09-13, chart 1 -
  // ranks SEVENTH of thirteen by total prose. Tuning spacing until that one card
  // fits is fitting to a sample, which is why this arm renders the whole fixture.
  //
  // It measures `scrollHeight - clientHeight` on the object. That is the honest
  // number: the object is a fixed-height column flex with `overflow: hidden`, so
  // content past the bottom is CLIPPED SILENTLY - the failure has no symptom
  // except in the exported file, which is how it shipped.
  //
  // The cards are rendered at scale 1 and shrunk by a CSS transform on a wrapper.
  // A transform does not change the layout box, so every measurement below is in
  // true export pixels while the page stays viewable. Same reasoning as the card
  // display wrapper in components/Funnel.jsx.
  const { VALIDATION_CHARTS } = await import('../tests/bazi-validation.fixture.js');

  const cards = VALIDATION_CHARTS.map((c) => {
    const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
    const data = buildCardData({
      chart, semanticJson: buildSemanticJson(chart),
      birthDate: c.date, gender: c.gender === 'F' ? 'female' : 'male',
    });
    const badges = (data.badges || []).slice(0, CARD_B_BADGE_LIMIT);
    const tags = [...(data.tags?.fixed || []), ...(data.tags?.dynamic || [])];
    return {
      id: c.id, stem: data.stem, domId: `ovf-${c.id}`,
      prose: {
        hook: (data.hook || '').length,
        badges: badges.length,
        meaning: badges.reduce((a, b) => a + (b.meaning || '').length, 0),
        tags: tags.length,
        total: (data.hook || '').length + badges.reduce((a, b) => a + (b.meaning || '').length, 0) + tags.join('').length,
      },
      html: renderToStaticMarkup(React.createElement(CardB, { data, scale: 1, id: `ovf-${c.id}` })),
    };
  });

  // ── THE CONSTRUCTIBLE WORST CASE, NOT JUST THE SAMPLE ──
  //
  // Thirteen charts is a sample. The card has to fit the SPACE, and the space has
  // a worst corner that no fixture chart happens to occupy: the longest hook, the
  // two longest `label_meaning` strings, and a full six tag rows. Every part of it
  // is real Reyner-ruled copy from the glossary - nothing synthetic, nothing
  // padded - so it is a chart the engine can actually produce, not a stress test.
  //
  // Without this row the probe answers "do these thirteen fit", and a green
  // thirteen would be read as "the card fits", which is the sample-fitting Reyner
  // ruled against when he asked for the longest-prose charts rather than the one
  // that surfaced the defect.
  const worstBintang = Object.entries(GLOSSARY.bintang)
    .sort((a, b) => (b[1].label_meaning || '').length - (a[1].label_meaning || '').length)
    .slice(0, CARD_B_BADGE_LIMIT);
  const worstHookStem = Object.entries(GLOSSARY.salah_dikira || {})
    .sort((a, b) => (b[1].line || '').length - (a[1].line || '').length)[0];
  // Seeded from the fixture chart that already carries six tags and the longest
  // hook, so the tag rows and the pillar block are a real chart's.
  const seedChart = VALIDATION_CHARTS.find((c) => c.id === 5) || VALIDATION_CHARTS[0];
  const seedBazi = calculateBaziChart({ birthDate: seedChart.date, birthTime: seedChart.time });
  const seedData = buildCardData({
    chart: seedBazi, semanticJson: buildSemanticJson(seedBazi),
    birthDate: seedChart.date, gender: 'female',
  });
  // ONE WORST CASE PER STEM, because the HEADLINE is the other variable and it is
  // not prose. `splitName` puts a leading article in the kicker and wraps what is
  // left, so a two-word name ("The Morning Dew" -> MORNING / DEW) renders TWO
  // headline lines at 80% size where "The Sun" renders one. That is a block-height
  // difference no amount of badge text expresses, and pairing the worst prose with
  // only the stem that happens to have the longest hook would miss it entirely.
  const worstBadges = worstBintang.map(([, v]) => ({ label: v.name_id, meaning: v.label_meaning, palace: null }));
  // `_note` and any other underscore key are documentation inside the glossary,
  // not stems - `tokenFor` throws on them.
  const stemEntries = Object.entries(GLOSSARY.salah_dikira || {})
    .filter(([k, v]) => !k.startsWith('_') && v && typeof v.line === 'string');
  for (const [stem, entry] of stemEntries) {
    const arche = GLOSSARY.arketipe?.[stem] || {};
    const data = {
      ...seedData,
      stem,
      nameId: arche.name_id || seedData.nameId,
      nameEn: arche.name_en || seedData.nameEn,
      aspek: seedData.aspek,
      hook: entry.line,
      badges: worstBadges,
    };
    const tags = [...(data.tags?.fixed || []), ...(data.tags?.dynamic || [])];
    cards.push({
      id: `MAX ${stem}`, stem, domId: `ovf-max-${stem}`,
      prose: {
        hook: (entry.line || '').length, badges: worstBadges.length,
        meaning: worstBadges.reduce((a, b) => a + b.meaning.length, 0),
        tags: tags.length,
        total: (entry.line || '').length + worstBadges.reduce((a, b) => a + b.meaning.length, 0) + tags.join('').length,
      },
      html: renderToStaticMarkup(React.createElement(CardB, { data, scale: 1, id: `ovf-max-${stem}` })),
    });
  }
  void worstHookStem;

  const meta = cards.map(({ id, stem, domId, prose }) => ({ id, stem, domId, prose }));
  const DISPLAY = 0.26;

  const out = path.join(ROOT, 'reports', 'card-overflow-probe.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>Card B overflow - every fixture chart</title>
<!-- ARCHIVO IS LOADED HERE ON PURPOSE, unlike the export probe. This measures LINE
     BREAKS, and the line break is where the overflow comes from - the wrong font
     gives the wrong answer. next/font self-hosts the same family in the app. -->
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  :root { --font-archivo: 'Archivo', system-ui, -apple-system, sans-serif; }
  body { background:#111113; color:#d9d7d2; font:13px/1.6 ui-monospace,monospace; margin:0; padding:24px; }
  h1 { font:600 18px/1.4 system-ui,sans-serif; margin:0 0 6px; }
  p { font:13px/1.6 system-ui,sans-serif; color:#bab7b0; max-width:104ch; }
  table { border-collapse:collapse; margin:16px 0; font-size:12.5px; }
  th,td { border:1px solid #2a2a2f; padding:5px 9px; text-align:right; }
  th { color:#84817a; font:600 10.5px/1.4 system-ui,sans-serif; letter-spacing:.08em; text-transform:uppercase; }
  td.l, th.l { text-align:left; }
  .ok { color:#8fc0a0; } .no { color:#e0a05f; }
  #summary { font:600 14px/1.5 system-ui,sans-serif; margin-top:12px; }
  .grid { display:flex; flex-wrap:wrap; gap:14px; margin-top:20px; }
  .cell { width:${Math.round(907 * DISPLAY)}px; }
  .cap { font:11px/1.4 ui-monospace,monospace; color:#84817a; padding-bottom:5px; }
  .clip { width:${Math.round(907 * DISPLAY)}px; height:${Math.round(1747 * DISPLAY)}px; overflow:hidden; }
  .shrink { transform:scale(${DISPLAY}); transform-origin:top left; }
</style>
<h1>Card B overflow - every chart in the validation fixture</h1>
<p>Renders Card B at scale 1 for all ${cards.length} fixture charts and reports
<code>scrollHeight - clientHeight</code> on each object. The object is a fixed-height column flex with
<code>overflow: hidden</code>, so anything past the bottom is clipped with no symptom except in the
exported file. <strong>Any positive number is a chart whose paid card loses its footer.</strong>
Cards are laid out at true export size and shrunk ${DISPLAY}x by a CSS transform, which does not
change the layout box, so the numbers are export pixels.</p>
<div id="out">measuring...</div>
<div class="grid">
${cards.map((c) => `<div class="cell"><div class="cap">chart ${c.id} ${c.stem} - ${c.prose.total} prose chars</div><div class="clip"><div class="shrink">${c.html}</div></div></div>`).join('\n')}
</div>
<script>
const CARDS = ${JSON.stringify(meta)};
// One wrapped line of badge meaning is about 36 export px and one line of the
// hook about 59. Under 60px of slack, a single extra line anywhere clips the
// card, so a chart below this floor is passing by luck rather than by margin.
const SLACK_FLOOR = 60;
(async () => {
  // MEASURE AFTER THE FONT LANDS. Archivo and the fallback break lines in
  // different places, and a line is ~60px here - measuring early reports a
  // different card than the one that ships.
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 150));
  const rows = CARDS.map((c) => {
    const el = document.getElementById(c.domId + '-object');
    if (!el) return { ...c, missing: true };
    const overflow = el.scrollHeight - el.clientHeight;
    // SLACK is the free space the appendix's auto top margin is absorbing: the
    // gap between the last block above it and the appendix itself. It is the only
    // honest headroom number on a column flex that pins its last child to the
    // bottom - content ALWAYS reaches the bottom edge, so measuring to the last
    // child reports 0 forever and says nothing. The first version of this probe
    // did exactly that and printed 0 for all thirteen charts, including the four
    // that had hundreds of pixels to spare.
    // Read it as: how much more prose this chart could take before it clips.
    const kids = [...el.children].filter((k) => getComputedStyle(k).position !== 'absolute' && k.tagName !== 'STYLE');
    const app = kids[kids.length - 1];
    const prev = kids[kids.length - 2];
    const slack = app && prev
      ? Math.round((app.getBoundingClientRect().top - prev.getBoundingClientRect().bottom) / ${DISPLAY})
      : null;
    return { ...c, clientH: el.clientHeight, scrollH: el.scrollHeight, overflow, slack };
  });
  rows.sort((a, b) => (b.overflow || 0) - (a.overflow || 0) || (a.slack ?? 1e9) - (b.slack ?? 1e9));
  const bad = rows.filter((r) => r.missing || r.overflow > 0);
  document.getElementById('out').innerHTML =
    '<table><tr><th class="l">chart</th><th>prose</th><th>hook</th><th>badges</th><th>meaning</th>'
    + '<th>tags</th><th>client</th><th>scroll</th><th>OVERFLOW</th><th>slack</th></tr>'
    + rows.map((r) => '<tr><td class="l">' + r.id + ' ' + r.stem + '</td>'
      + '<td>' + r.prose.total + '</td><td>' + r.prose.hook + '</td><td>' + r.prose.badges + '</td>'
      + '<td>' + r.prose.meaning + '</td><td>' + r.prose.tags + '</td>'
      + (r.missing ? '<td colspan="3" class="no">NODE MISSING</td>'
        : '<td>' + r.clientH + '</td><td>' + r.scrollH + '</td>'
          + '<td class="' + (r.overflow > 0 ? 'no' : 'ok') + '">' + (r.overflow > 0 ? '+' + r.overflow : '0') + '</td>'
          + '<td class="' + (r.slack !== null && r.slack < SLACK_FLOOR ? 'no' : 'ok') + '">' + r.slack + '</td>')
      + '</tr>').join('')
    + '</table>'
    + '<div id="summary" class="' + (bad.length ? 'no' : 'ok') + '">'
    + (bad.length
      ? bad.length + ' OF ' + rows.length + ' CHARTS OVERFLOW - worst +' + Math.max(...bad.map((r) => r.overflow || 0)) + 'px'
      : 'all ' + rows.length + ' charts fit. Tightest slack '
        + Math.min(...rows.map((r) => r.slack ?? 1e9)) + 'px'
        + (Math.min(...rows.map((r) => r.slack ?? 1e9)) < SLACK_FLOOR
          ? ' - UNDER ONE LINE. The fixture passing does not mean the wild passes.' : '')) + '</div>';
  window.__overflow = { done: true, worst: Math.max(0, ...rows.map((r) => r.overflow || 0)),
    failing: bad.length, tightest: Math.min(...rows.map((r) => r.slack ?? 1e9)),
    rows: rows.map((r) => ({ id: r.id, stem: r.stem, prose: r.prose.total,
      overflow: r.overflow, slack: r.slack })) };
})();
</script>
`, 'utf8');
  console.log(`\nwrote ${path.relative(ROOT, out)} for ${cards.length} fixture charts`);
  console.log('serve it: npm run serve:reports -> http://localhost:4178/card-overflow-probe.html');
}

// THE LENGTH CAP IS A GATE, AND UNTIL 2026-08-26 IT WAS NOT ONE. This file ended
// with an unconditional `process.exitCode = 0`, so `npm run audit:card-budget` -
// which `scripts/test-all.mjs` lists among its EXTRA_GATES and whose own header
// calls the cap "enforced as a TEST over glossary.json" - printed OVER rows and
// exited clean. It reported; it never enforced.
process.exitCode = over.length ? 1 : 0;
