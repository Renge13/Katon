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
  brassTextFallbacks, CARD_A, RADIUS,
} from '../components/cards/Card.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'reports', 'card-preview.html');
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// ── CARD A's 4:5 RECOMPOSITION — the INPUT to the design pass, not the pass ──
//
// Ruled 2026-08-29, `docs/content/card-polish-spec.md` §10: Card A loses its
// canvas and its mat and becomes a 1080x1350 card that IS the exported asset.
// §10 forbids implementing against the old geometry, so NOTHING here touches
// `components/cards/Card.js`. This section renders the CURRENT card three ways so
// Reyner can see what has to re-flow before any production code moves.
//
// The only literal in the section. Everything else is derived from CARD_A, because
// a second hand-typed copy of a ruled size is how two sizes end up disagreeing.
const TARGET_A = { w: 1080, h: 1350 };

// Shared scale for the three panels, so they are comparable by eye. Panels are
// rendered at TRUE export size and shrunk by a CSS transform - the same technique
// as `scripts/audit-card-budget.mjs:232-234` (.cell / .clip / .shrink), followed
// rather than reinvented so there is one crop idiom in the repo.
const GEO_SCALE = 0.30;
const GEO_THUMB = 0.093; // matches the existing shelf's Card A treatment
const GEO_CORNER = 0.22;  // corner strip: big enough that a 40px radius is judgeable

/**
 * Every number the recomposition section draws, derived from CARD_A and TARGET_A.
 *
 * THE GUARD IS THE POINT OF THIS FUNCTION. The whole section works by cropping the
 * canvas away: the object is centred at a uniform margin, so an overflow:hidden box
 * of card.w x card.h with the child offset by -margin is an EXACT crop. That
 * identity is the premise. If the margin is 0 or gone, the offset is a no-op and
 * every panel below silently shows a differently-wrong picture that still looks
 * like a card - which is precisely the failure this repo keeps paying for. So it
 * throws instead, loudly, naming the ruling that will cause it.
 */
function geometryA() {
  const m = CARD_A.margin;
  if (typeof m !== 'number' || !Number.isFinite(m) || m <= 0) {
    throw new Error(
      `card-preview: CARD_A.margin is ${JSON.stringify(m)}, so the Card A ` +
      'recomposition section cannot crop. That section offsets the canvas by ' +
      '-CARD_A.margin to lift the object out of it; with no margin the offset is a ' +
      'no-op and all three panels render a mis-crop that still looks like a card.\n\n' +
      `THIS IS THE EXPECTED FAILURE ONCE §10 IS IMPLEMENTED. docs/content/card-polish-spec.md ` +
      `§10 (ruled 2026-08-29) makes Card A ${TARGET_A.w}x${TARGET_A.h} with NO canvas and NO ` +
      'mat. When prompt R lands it, DELETE this section rather than repairing it: its ' +
      'entire subject is the frame §10 removes, so a repaired version would be a ' +
      'picture of nothing.'
    );
  }

  const { canvas, card } = CARD_A;

  // Instagram's portrait maximum is 4:5, which is TARGET_A's ratio. Cropping a
  // 1080-wide canvas to it removes (canvas.h - TARGET_A.h) split evenly.
  const crop = (canvas.h - TARGET_A.h) / 2;
  const reachesObject = crop > m;
  const marginAfter = m - crop;

  const dw = (TARGET_A.w - card.w) / card.w;
  const dh = (TARGET_A.h - card.h) / card.h;
  const da = (TARGET_A.w * TARGET_A.h) / (card.w * card.h) - 1;

  return {
    m, canvas, card, crop, reachesObject, marginAfter,
    dw, dh, da,
    ratioNow: card.w / card.h,
    ratioTarget: TARGET_A.w / TARGET_A.h,
    // Where the old object sits if it is dropped, unchanged, into the new frame.
    insetX: (TARGET_A.w - card.w) / 2,
    insetY: (TARGET_A.h - card.h) / 2,
  };
}

const pct = (n) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;

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
      // §10 recomposition panels. Rendered at TRUE export size and shrunk by CSS
      // transform, so every number in the markup stays an export pixel. Distinct
      // ids because the same card appears seven times on the page and duplicate
      // ids are how a later DOM query silently measures the wrong copy.
      geoCanvas: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-canvas-${i}` })),
      geoObject: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-object-${i}` })),
      geoTarget: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-target-${i}` })),
      geoThumb: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-thumb-${i}` })),
      geoCornW: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-cw-${i}` })),
      geoCornB: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-cb-${i}` })),
      geoCornSq: renderToStaticMarkup(React.createElement(CardA, { data, scale: 1, id: `geo-cs-${i}` })),
    };
  });

  // BEFORE anything is written. A guard that fires after the file lands is a
  // guard that ships the broken page and complains about it.
  const G = geometryA();

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

  // ── §10 RECOMPOSITION SECTION ────────────────────────────────────────────
  // Built here rather than inline in the template so the nesting stays readable.
  // Panels crop the canvas away in CSS; no card prop and no component change.
  const S = GEO_SCALE;
  const dpx = (n) => `${(n * S).toFixed(1)}px`;

  // The object lifted out of its canvas: an EXACT crop, because the object is
  // centred at a uniform margin. `translate` sits inside the same transform as
  // `scale`, so its argument stays an export pixel and reads directly against
  // CARD_A.margin instead of being a pre-multiplied number nobody can check.
  const objectCrop = (markup, scale, extra = '') => `
<div class="geoclip ${extra}" style="width:${(G.card.w * scale).toFixed(1)}px;height:${(G.card.h * scale).toFixed(1)}px">
  <div class="geoshrink geoalpha" style="transform:scale(${scale}) translate(${-G.m}px, ${-G.m}px)">${markup}</div>
</div>`;

  const panelCanvas = (r) => `
<figure class="geopanel" style="margin:0">
  <div class="geoclip" style="width:${dpx(G.canvas.w)};height:${dpx(G.canvas.h)}">
    <div class="geoshrink" style="transform:scale(${S})">${r.geoCanvas}</div>
    <div class="geocrop-band" style="top:0;height:${dpx(G.crop)}"></div>
    <div class="geocrop-band" style="bottom:0;height:${dpx(G.crop)}"></div>
    <div class="geocrop-line" style="top:${dpx(G.crop)}"></div>
    <div class="geocrop-line" style="bottom:${dpx(G.crop)}"></div>
  </div>
  <figcaption>1 &middot; today, as posted<br>${G.canvas.w}x${G.canvas.h} canvas. Dimmed bands are what
  a 4:5 feed crop removes: <em>${G.crop}px</em> top and bottom.</figcaption>
</figure>`;

  const panelObject = (r) => `
<figure class="geopanel" style="margin:0">
  ${objectCrop(r.geoObject, S, 'geocheck')}
  <figcaption>2 &middot; the object alone<br>${G.card.w}x${G.card.h}, cropped out of the canvas.
  Checkerboard shows through the <em>RADIUS ${RADIUS}</em> corners - that is alpha, not white.</figcaption>
</figure>`;

  const panelTarget = (r) => `
<figure class="geopanel" style="margin:0">
  <div class="geohatch" style="position:relative;width:${dpx(TARGET_A.w)};height:${dpx(TARGET_A.h)}">
    <div style="position:absolute;left:${dpx(G.insetX)};top:${dpx(G.insetY)}">${objectCrop(r.geoTarget, S)}</div>
  </div>
  <figcaption>3 &middot; the ${TARGET_A.w}x${TARGET_A.h} target<br>Old object dropped in at TRUE scale.
  Hatched area is the room the recomposition has to spend: <em>${G.insetX.toFixed(1)}px</em> each side,
  <em>${G.insetY.toFixed(1)}px</em> top and bottom.</figcaption>
</figure>`;

  const cornerStrip = (r) => `
<div class="geopanels" style="gap:18px;margin-bottom:30px;align-items:center">
  <p class="cap" style="max-width:16ch;margin:0">${esc(r.data.nameId)}</p>
  <figure class="geopanel" style="margin:0">
    <div style="background:#ffffff;padding:14px">${objectCrop(r.geoCornW, GEO_CORNER)}</div>
    <figcaption>radius ${RADIUS}, on white</figcaption></figure>
  <figure class="geopanel" style="margin:0">
    <div style="background:#000000;padding:14px">${objectCrop(r.geoCornB, GEO_CORNER)}</div>
    <figcaption>radius ${RADIUS}, on black</figcaption></figure>
  <figure class="geopanel" style="margin:0">
    <div style="background:linear-gradient(90deg,#ffffff 50%,#000000 50%);padding:14px">${objectCrop(r.geoCornSq, GEO_CORNER, 'geosq')}</div>
    <figcaption>square-cornered<br>ground irrelevant: <em>no alpha corners</em></figcaption></figure>
</div>`;

  const geoSection = `
<h2>Card A at 4:5 &mdash; what has to re-flow (ruled 2026-08-29, card-polish-spec &sect;10)</h2>

<div class="geohead">
<b>THE GAIN IS OVERWHELMINGLY HORIZONTAL.</b> Width grows <b class="geonum">${pct(G.dw)}</b> while
height grows only <b class="geonum">${pct(G.dh)}</b> - the horizontal gain is
<b class="geonum">${(G.dw / G.dh).toFixed(1)}x</b> the vertical. A reflow that spends the new room on
vertical rhythm is spending room that is not there. The headline measure, the hook and the badge
rows are where ${pct(G.dw)} of width actually lands.
<table>
<tr><td>object today</td><td><b class="geonum">${G.card.w} x ${G.card.h}</b></td>
    <td>ratio <b class="geonum">${G.ratioNow.toFixed(3)}</b> (63:88)</td></tr>
<tr><td>target</td><td><b class="geonum">${TARGET_A.w} x ${TARGET_A.h}</b></td>
    <td>ratio <b class="geonum">${G.ratioTarget.toFixed(3)}</b> (4:5)</td></tr>
<tr><td>delta</td><td><b class="geonum">${pct(G.dw)} w &middot; ${pct(G.dh)} h</b></td>
    <td>area <b class="geonum">${pct(G.da)}</b></td></tr>
</table>
</div>

<p><b>What panel 1 answers, and it is a finding either way.</b> &sect;10 says the current export
depends on platform behaviour. The arithmetic says <b>it does not depend on it for the object</b>: a
4:5 centre crop of the ${G.canvas.w}x${G.canvas.h} canvas removes <b>${G.crop}px</b> top and bottom,
the mat is <b>${G.m}px</b>, and ${G.crop} &lt; ${G.m} - so the crop
<b>${G.reachesObject ? 'REACHES THE OBJECT and clips the card itself' : 'never reaches the object. The card survives a feed crop intact.'}</b>
<br><br><b>What it destroys instead is the uniform margin</b>, which is the whole premise of the
${G.m} value - <code>tests/card.spec.mjs:67</code> derives it as the only number satisfying both
ratios at once. After the crop the mat is <b>${G.m}px</b> left and right against
<b>${G.marginAfter.toFixed(1)}px</b> top and bottom, a
<b class="geonum">${(G.m / G.marginAfter).toFixed(2)}:1</b> asymmetry. So the posted card is not a
clipped card, it is a card in a frame that no longer means anything. That is a WEAKER claim than
"the object gets cropped" and a BETTER argument for &sect;10: the mat is not protecting the object,
it is just failing to be uniform.</p>

<div class="geopanels">${rows.map((r) => panelCanvas(r) + panelObject(r) + panelTarget(r)).join('')}</div>

<p class="cap">All three panels share one scale (${S}), so they are comparable by eye. Every
dimension is derived from <code>CARD_A</code>; the only literal is <code>TARGET_A</code>, which is
&sect;10's ruled size. Panels crop the canvas away in preview CSS - <b>no card prop, no component
change</b>. &sect;10 forbids implementing against the old geometry, so this page is the INPUT to the
design pass, not the pass.</p>

<h2>Panel 3 at feed scale &mdash; glanceability of the target frame</h2>
<div class="shelf">
${rows.map((r) => `<figure style="margin:0"><div class="geohatch" style="position:relative;width:${(TARGET_A.w * GEO_THUMB).toFixed(1)}px;height:${(TARGET_A.h * GEO_THUMB).toFixed(1)}px"><div style="position:absolute;left:${(G.insetX * GEO_THUMB).toFixed(1)}px;top:${(G.insetY * GEO_THUMB).toFixed(1)}px">${objectCrop(r.geoThumb, GEO_THUMB)}</div></div><figcaption>${esc(r.data.nameId)}</figcaption></figure>`).join('\n')}
</div>
<p class="cap">Same feed scale as the shelf above. The hatched band is dead space the recomposition
has to absorb - judge whether the card still reads at a glance once it is spent, not whether the
hatching looks empty.</p>

<h2>The corner question &mdash; open design input, NOT ruled</h2>
<p>&sect;10 flags this and does not decide it. <code>RADIUS</code> is <b>${RADIUS}</b> and it exists
so an OBJECT reads as floating on a canvas. With the canvas gone the radius sits at the frame edge
and exports four transparent corners, which a feed composites against its own background - the same
flatten-to-black hazard <code>docs/prompts/P-card-frame.md</code> recorded for a transparent mat,
arriving through the corners instead. Cowork's proposal in &sect;10 is square and full-bleed for Card
A, radius kept for Card B because it still floats. <b>Reyner's call.</b></p>
${rows.map(cornerStrip).join('\n')}
`;
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

  /* ── §10 recomposition section ──────────────────────────────
     The crop idiom, copied from scripts/audit-card-budget.mjs:232-234: render at
     true export size, size the clip box in DISPLAY px, shrink the child with a
     transform. The translate rides INSIDE the same transform, so its argument
     stays an export pixel and can be read against CARD_A.margin directly. */
  .geoclip { overflow:hidden; position:relative; }
  .geoshrink { transform-origin:top left; }
  .geopanels { display:flex; gap:30px; align-items:flex-start; flex-wrap:wrap; }
  .geopanel figcaption { font-size:10px; letter-spacing:.1em; text-transform:uppercase;
                         color:#84817a; margin:8px 0 0; max-width:34ch; line-height:1.6; }
  .geopanel figcaption em { color:#e0a05f; font-style:normal; }
  /* The alpha corners only exist if nothing paints behind them. The canvas field
     is an INLINE style, so this needs !important to win. */
  .geoalpha > div { background:transparent !important; }
  .geocheck { background-image:
      linear-gradient(45deg,#8a8a8a 25%,transparent 25%,transparent 75%,#8a8a8a 75%),
      linear-gradient(45deg,#8a8a8a 25%,transparent 25%,transparent 75%,#8a8a8a 75%);
    background-size:24px 24px; background-position:0 0,12px 12px; background-color:#f0f0f0; }
  .geohatch { background-image:repeating-linear-gradient(45deg,
      rgba(224,160,95,.22) 0 6px, transparent 6px 14px); background-color:#1a1a1d;
    outline:1px dashed #4a4a52; }
  .geocrop-band { position:absolute; left:0; right:0; background:rgba(10,10,12,.62); }
  .geocrop-line { position:absolute; left:0; right:0; height:0;
                  border-top:2px dashed #e0a05f; }
  .geohead { background:#141a16; border:1px solid #2c4436; border-radius:10px;
             padding:18px 22px; max-width:92ch; margin:16px 0 26px; }
  .geohead table { border-collapse:collapse; font-size:13px; margin:10px 0 0; }
  .geohead td { padding:3px 20px 3px 0; color:#bab7b0; }
  .geohead td b { color:#8fc0a0; }
  .geonum { font-variant-numeric:tabular-nums; }
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
${geoSection}
`;

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html, 'utf8');
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
  console.log(`${rows.length} archetypes, ${rows.filter((r) => r.approved).length} locked tokens, ${unapproved.length} unapproved`);
}

main();
