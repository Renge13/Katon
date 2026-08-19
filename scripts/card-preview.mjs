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
import { auditRendered } from '../lib/card/domContrast.js';
import { accentAudit } from '../lib/card/contrast.js';
import { inkIsDark } from '../lib/card/tokens.js';
import {
  CardA, CardB, TEXT_ROLES, MIN_CONTRAST, AA_EXEMPT, DIM_EXEMPT, MAX_LABEL_MEANING,
  brassTextFallbacks,
} from '../components/cards/Card.js';

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

  // Worst RENDERED text run per token, measured on the same markup this page
  // shows. Not the roles table - see lib/card/domContrast.js for why.
  //
  const worst = {};
  for (const r of rows) {
    const field = CARD_TOKENS[r.stem].field;
    const all = [auditRendered(r.a, field), auditRendered(r.b, field)]
      .flat().sort((x, y) => x.ratio - y.ratio);
    worst[r.stem] = all[0];
  }
  const accent = accentAudit(CARD_TOKENS);
  // PER CARD since 2026-08-19 - Card A judges brass on the flat field, Card B
  // against the sheen ground, and four tokens differ. See brassTextFor.
  const brassFallbackA = new Set(brassTextFallbacks(CARD_TOKENS, 'A').map((f) => f.stem));
  const brassFallbackB = new Set(brassTextFallbacks(CARD_TOKENS, 'B').map((f) => f.stem));

  const html = `<!doctype html>
<meta charset="utf-8">
<title>Katon card preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- ARCHIVO, ruled 2026-08-13, and loaded HERE rather than in app/layout.js: the
     card is wired to no route, so shipping a font download on every page for it
     would be a cost with no reader. The commit that wires a card must add it to
     the layout as --font-archivo. -->
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<style>
  /* The card sets box-sizing on its own boxes now, but the preview's own chrome
     needs the reset too, and its absence is what hid a real geometry bug once. */
  * { box-sizing: border-box; }
  :root { --font-archivo: 'Archivo', system-ui, -apple-system, sans-serif; }
  body { background:#111113; color:#d9d7d2; font-family:var(--font-archivo);
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

<div class="flag"><b>All ten colour tokens were approved on 2026-08-15.</b> ${unapproved.length === 0
  ? 'Nothing on this page is an unruled colour any more.'
  : `${unapproved.length} still unapproved: ${esc(unapproved.join(', '))}.`}
What follows is what approval did NOT settle - four measured states that are known, named and
carried rather than fixed.
<br><br><b>1. Two approved tokens sit under the accent floor.</b> The floor is
${accent.floor.toFixed(2)}, FROZEN at the 2026-08-13 measurement of the then-locked five. It is no
longer derived: with all ten approved, deriving it would return the set's own minimum and the guard
would report all clear at the exact moment a token sat below the bar. Under it:
<span class="no">${esc(accent.below.join(', '))}</span>${accent.under.length === 0
    ? ' - both exempt and listed in <code>ACCENT_EXEMPT</code>' : ''}. Both are light fields, where
accent has less room between a pale field and a dark ink. Accent is decoration and large UI, so
WCAG 4.5 was never the test for it.
<br><br><b>2. Brass on text falls back to ink per token AND PER CARD.</b> Card A judges brass on the
flat field and falls back on <span class="no">${esc([...brassFallbackA].join(', '))}</span>
(${brassFallbackA.size} of 10). Card B carries the sheen, judges brass against every stop it
composites, and falls back on <span class="no">${esc([...brassFallbackB].join(', '))}</span>
(${brassFallbackB.size} of 10). The split is
<b>${esc([...brassFallbackB].filter((s) => !brassFallbackA.has(s)).join(', ') || 'none')}</b>: brass
on the free card, ink on the paid one, because only the paid one has a wash over the words. Two of
Card A's failures are dark fields, which the spec did not expect - pale brass is a LIGHT metallic and
the brightest fields cannot carry it. Fallback tokens draw their name and badge labels in ink; brass
stays on the rim, the seal, the cell border and the pill. Nothing was substituted silently.
<br><br><b>3. The sheen costs contrast in the lit corner.</b> Card B's sheen is white-alpha over the
whole object, and on a light-ink token white moves the surface toward the ink - under the headline.
Ruled at 0.15 and NOT reduced here; the numbers are in <code>npm run audit:card-contrast</code>.
<br><br><b>4. The footer separator.</b> Rendered as <code>|</code>. The 08-03 mock used a middle dot,
which rule 20 bans with zero exceptions, so it cannot come back - but any keyboard character can.</div>

<p><b>Changed in this pass</b>, to <code>docs/content/card-polish-spec.md</code> (ruled 2026-08-14).
<b>Card A is 1a</b>: a leading "The" drops to a kicker so the noun owns the headline at 139px instead
of 112, three hairlines divide the content zones, the hook grows to the second-largest thing on the
card, the diamond comes off the badges, and the stem crops the corner instead of blooming behind it.
<b>Card B is 1e</b>: a FINISH - an SVG rim, a specular sheen, brass on four elements, a foil seal and
a debossed stem - over the pillar cells and bars it already had. Three light-field tokens run the
INVERTED branch, selected by the ink pole and never by a stem list.
<br><br><b>Ink hierarchy is back</b>, ruled 2026-08-14: ${DIM_EXEMPT.length} of
${Object.keys(TEXT_ROLES).length} roles draw under full opacity. The floor did NOT move - it is an
exemption with a pinned list (<code>DIM_EXEMPT</code>), every role off that list still clears
${MIN_CONTRAST} on all ${Object.keys(CARD_TOKENS).length} tokens, and the audit keeps reporting the
exempt roles' real ratios rather than skipping them. Run
<code>npm run audit:card-contrast</code> for the grid.</p>

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
<div class="pair"><div>${r.a}</div><div class="cardwrap" data-stem="${esc(r.stem)}">${r.b}</div></div>
<p class="cap">Chart ${esc(r.iso)} 09:00. Token <span class="${r.approved ? 'yes' : 'no'}">${r.approved ? 'LOCKED' : 'PROPOSED, not approved'}</span>.
Aspek <b>${esc(r.data.aspek)}</b>. Fixed tags ${esc(r.data.tags.fixed.join(', '))}.
Dynamic ${esc(r.data.tags.dynamic.join(', ')) || '(none)'}${r.data.tags.dynamic.length < 3 ? ` <span class="no">(only ${r.data.tags.dynamic.length} - the chart has no more)</span>` : ''}.
Badges ${esc(r.data.badges.map((b) => b.label).join(', ')) || '(none)'}.
Worst contrast <b>${worst[r.stem].ratio.toFixed(2)}</b> on ${esc(JSON.stringify(worst[r.stem].text.slice(0,22)))}, floor ${MIN_CONTRAST} (WCAG AA)${AA_EXEMPT.includes(r.stem) ? " <span class=\"no\">- cannot reach AA, Reyner to rule</span>" : ""}.
Finish ${inkIsDark(CARD_TOKENS[r.stem]) ? '<b>inverted</b> (light field)' : 'as drawn'}.
Brass text ${brassFallbackA.has(r.stem)
    ? '<span class="no">under AA on BOTH cards - drawn in ink</span>'
    : brassFallbackB.has(r.stem)
      ? '<span class="no">brass on Card A, ink on Card B</span> (the sheen, not the field)'
      : 'ok on both cards'}.
Accent on field ${accent.rows.find((x) => x.stem === r.stem).ratio.toFixed(2)}${accent.below.includes(r.stem) ? ` <span class="no">- under the ${accent.floor.toFixed(2)} floor${accent.under.includes(r.stem) ? '' : ', exempt'}</span>` : ''}.
Footer <b>${esc(r.data.footer.left)}</b>${r.data.footer.gender ? '' : ' (null gender: date and source only)'}.
Card B headroom <b data-headroom="${esc(r.stem)}">measuring</b>, at the ${MAX_LABEL_MEANING}-char ceiling
<b data-ceiling="${esc(r.stem)}">measuring</b>.</p>
`).join('\n')}

<h2>Card B's vertical budget, measured in this page</h2>
<p>Card B is a fixed rectangle and its badge block is the one content-driven height on it, so either
the widest content fits or the design is only true for the charts that happen to be short. The
numbers above are measured after layout, in export pixels: <b>headroom</b> is the space left below
the appendix on the chart as rendered, and <b>ceiling</b> is the same measurement with every
<code>label_meaning</code> replaced by ${MAX_LABEL_MEANING} characters of real Indonesian, which is
the tripwire <code>MAX_LABEL_MEANING</code> sets. A negative number is content being clipped by the
card's own <code>overflow: hidden</code>, silently.</p>
<p class="cap">This check exists because the 2026-08-14 foil pass overflowed Api Unggun's Card B by
94 export pixels and nothing caught it: every test passed, the contrast audit passed, and the clipped
text simply was not on the card. A layout that is only correct for the charts you happened to look at
is not a layout.</p>

<script>
(() => {
  var SCALE = 0.28;
  // Real Indonesian, not filler: synthetic "MaMaMa" is far wider than prose and
  // would put the break in the wrong place, which is the same mistake the
  // original budget probe recorded making.
  var SRC = 'Kamu menyerap hal baru lebih cepat daripada orang di sekitarmu, terutama lewat membaca dan mengamati sendiri, dan itu membuat kamu terbiasa mencari jawaban lebih dulu tanpa menunggu siapa pun bicara.';
  var CEIL = (SRC + ' ' + SRC).slice(0, ${MAX_LABEL_MEANING});

  function headroom(obj) {
    // The appendix is the last child that is NOT decorative. Taking
    // lastElementChild grabs the SVG rim, which is inset to the object's own
    // bounds and therefore reports exactly minus-the-padding on every card - a
    // uniform wrong answer, which is the kind that looks like a real measurement.
    var kids = [].slice.call(obj.children).filter(function (c) {
      return c.getAttribute('aria-hidden') !== 'true';
    });
    var app = kids[kids.length - 1];
    // It carries margin-top:auto, which eats all the slack and reports zero
    // whether there is one pixel spare or three hundred. Zeroing it for the
    // measurement is what turns "does it fit" into "by how much".
    var prev = app.style.marginTop;
    app.style.marginTop = '0px';
    var box = obj.getBoundingClientRect();
    var pad = parseFloat(getComputedStyle(obj).paddingBottom);
    var gap = box.bottom - pad - app.getBoundingClientRect().bottom;
    app.style.marginTop = prev;
    return Math.round(gap / SCALE);
  }

  function paint(el, px) {
    el.textContent = px + 'px';
    el.className = px < 0 ? 'no' : '';
  }

  document.querySelectorAll('.cardwrap').forEach(function (wrap) {
    var stem = wrap.getAttribute('data-stem');
    var obj = wrap.firstElementChild.firstElementChild;
    paint(document.querySelector('[data-headroom="' + stem + '"]'), headroom(obj));

    // The ceiling is probed on a CLONE, off-screen, so the page keeps showing the
    // card as it really renders.
    var clone = wrap.cloneNode(true);
    clone.style.cssText = 'position:absolute;left:-99999px;top:0';
    document.body.appendChild(clone);
    clone.querySelectorAll('[data-role="badgeMeaning"]').forEach(function (m) { m.textContent = CEIL; });
    paint(document.querySelector('[data-ceiling="' + stem + '"]'), headroom(clone.firstElementChild.firstElementChild));
    clone.remove();
  });
})();
</script>
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
  console.log(`${rows.length} archetypes, ${rows.filter((r) => r.approved).length} locked tokens, ${unapproved.length} unapproved`);
}

main();
