#!/usr/bin/env node
// ============================================================
// scripts/probe-card-export.mjs — the export, rastered and read back
// ============================================================
//   npm run probe:card-export     writes reports/card-export-probe.html
//   npm run serve:reports         then open http://localhost:4178/card-export-probe.html
//
// It renders both cards in every arrangement production uses, runs the REAL
// html-to-image capture for both targets, draws each result to a canvas, and
// reads individual pixels back. Every assertion in §7.3 of the card polish spec
// is a claim about pixels, and none of them can be checked from markup:
//
//   1. THE DOWNLOAD'S FOUR CORNERS ARE TRANSPARENT. The object has a 40px corner
//      radius, so cropping to its bounds leaves alpha there. A JPEG, or any
//      `backgroundColor` on the capture, fills them with solid triangles — and
//      the failure is invisible until the file lands on someone's white
//      background, which is exactly where a shared card lands.
//   2. THE EDGE PIXEL IS RIM, NOT CANVAS FIELD. The rim is an SVG stroke inset by
//      half its width with `rx: 39`. One pixel out and the crop keeps a hairline
//      of the canvas colour along the border, or eats the rim.
//   3. THE SHARE CAPTURE IS THE CANVAS, at the full feed-native size, with the
//      field intact.
//   4. THERE IS INK IN IT. Added 2026-08-26, and see below for why it was the
//      one that mattered.
//
// ── THREE HOLES THIS FILE HAD, AND ALL THREE LET THE SAME BUG THROUGH ──
//
// From 2026-08-23 to 2026-08-26 the free share button produced a blank rectangle
// in production. This probe passed green throughout. It had three independent
// holes, and closing any one of them would have caught it:
//
//   (a) IT ASSERTED SIZE AND ONE CORNER, NEVER INK. Its share assertions were
//       `sh.width === canvas.w` and one pixel 5px in from the corner being the
//       field colour. A completely blank field-coloured 1080x1440 png passes both
//       — the size is right, and a pixel deep inside the 86.4px margin is field,
//       which is what it would be if the image were nothing but field. The
//       DOWNLOAD path did carry an emptiness check (`centre.a === 255`). The
//       emptiness check existed on the target that worked and was absent from the
//       target that was broken, which is what an instrument written from one
//       target's requirements looks like.
//   (b) IT DID NOT CALL THE PRODUCTION CAPTURE. It hand-copied the two `toPng`
//       calls inline. `components/cards/exportCards.js` had since grown a
//       `transform: scale(factor)` the hand-copy did not have, so the probe was
//       measuring a function that no longer existed. A copy of the code under
//       test is a description of it, not a test of it.
//   (c) IT RENDERED THE CARDS AT scale 1 — "so the capture needs no scaling",
//       which is true and was the problem. Production rendered Card A at
//       `CARD_SCALE`. Scale 1 is the ONE scale at which the defect cannot occur,
//       so the probe was built to sit exactly where nothing could go wrong.
//
// So this file now imports the real `captureCard` (served verbatim into
// reports/vendor/, never re-typed), reads `CARD_SCALE` out of `Funnel.jsx` rather
// than restating it, and runs THREE ARRANGEMENTS per card:
//
//   bare1     card at scale 1, no wrapper        Funnel.jsx:883 (#card-b)
//   wrapped   card at scale 1 in a scaled box    Funnel.jsx:698 (#card-a)
//   scaled    card at CARD_SCALE directly        THE PRE-FIX ARRANGEMENT
//
// `scaled` is the REGRESSION ARM and it is expected to be REFUSED. Its pass
// condition is that `captureCard` throws, because a node laid out at a display
// scale cannot be captured correctly and the only safe answer is to say so. Before
// 2026-08-26 that arm returned a blank png and this probe called it a pass.
//
// ── WHY A GENERATED PAGE RATHER THAN A NODE TEST ─────────────
// html-to-image walks computed styles and renders through an SVG foreignObject;
// it needs a real layout engine and a real canvas. jsdom has neither. So the probe
// ships as a page, and `tests/card.spec.mjs` asserts the things that ARE checkable
// without a DOM (the descriptor, the ids, the radius) and points here for the rest.
//
// ── IT MUST BE SERVED, NOT OPENED FROM THE FILESYSTEM ────────
// `getImageData` is same-origin. From a `file://` document the page has an opaque
// origin, every image drawn into the canvas taints it and the readback throws.
// `npm run serve:reports` exists for this.
//
// ── THE rAF SHIM ─────────────────────────────────────────────
// html-to-image resolves its image loader inside a `requestAnimationFrame`
// callback. A tab that is never visible never fires rAF, so every capture hangs
// forever with no error — which is why an agent browser was believed to be unable
// to run html-to-image at all. It can; the tab is just hidden. The shim changes
// WHEN the callback runs and nothing about what is drawn, and it is what lets this
// probe be driven unattended.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CARD_TOKENS } from '../lib/card/tokens.js';
import { CardA, CardB, CARD_A, CARD_B, OBJECT_ID_SUFFIX, RADIUS } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = path.join(ROOT, 'reports');
const VENDOR = path.join(REPORTS, 'vendor');
const OUT = path.join(REPORTS, 'card-export-probe.html');

// READ, NOT RESTATED. A probe that hardcodes the display scale stops measuring
// production the day someone changes it, and goes on reporting green.
const funnelSrc = fs.readFileSync(path.join(ROOT, 'components', 'Funnel.jsx'), 'utf8');
const scaleMatch = funnelSrc.match(/const CARD_SCALE = ([\d.]+);/);
if (!scaleMatch) throw new Error('CARD_SCALE not found in components/Funnel.jsx - has it been renamed?');
const CARD_SCALE = Number(scaleMatch[1]);

// 甲 Jati is a DARK field with a near-white rim, and 辛 Permata is a LIGHT field
// whose rim is the inverted branch. Both are probed: the light branch is where a
// rim that is nearly the field colour would hide an off-by-one.
const STEMS = ['甲', '辛'];

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

const SPEC = { A: CARD_A, B: CARD_B };

// The three arrangements. `render` is the scale passed to the component; `wrap` is
// the display scale applied by a CSS transform on an ancestor the capture never
// sees. A transform does not change an element's layout box, so `wrapped` is
// captured at 1:1 exactly like `bare1` — that equivalence is asserted below rather
// than assumed.
const ARRANGEMENTS = [
  { key: 'bare1', render: 1, wrap: null, expect: 'ink', note: 'Funnel.jsx:883 #card-b' },
  { key: 'wrapped', render: 1, wrap: CARD_SCALE, expect: 'ink', note: 'Funnel.jsx:698 #card-a' },
  { key: 'scaled', render: CARD_SCALE, wrap: null, expect: 'refused', note: 'the pre-fix arrangement' },
];

const cards = [];
for (const stem of STEMS) {
  for (const card of ['A', 'B']) {
    for (const arr of ARRANGEMENTS) {
      const id = `probe-${card}-${arr.key}-${stem === '甲' ? 'jati' : 'permata'}`;
      const inner = renderToStaticMarkup(React.createElement(card === 'A' ? CardA : CardB,
        { data: { ...base, stem }, scale: arr.render, id }));
      const spec = SPEC[card];
      const html = arr.wrap
        ? `<div style="width:${spec.canvas.w * arr.wrap}px;height:${spec.canvas.h * arr.wrap}px;overflow:hidden">`
          + `<div style="transform:scale(${arr.wrap});transform-origin:top left">${inner}</div></div>`
        : inner;
      cards.push({ stem, card, arrangement: arr.key, expect: arr.expect, note: arr.note, id, html });
    }
  }
}

const meta = cards.map((c) => ({
  stem: c.stem, card: c.card, arrangement: c.arrangement, expect: c.expect, note: c.note, id: c.id,
  field: CARD_TOKENS[c.stem].field,
  canvas: SPEC[c.card].canvas, object: SPEC[c.card].card, margin: SPEC[c.card].margin,
}));

// ── VENDOR: THE PRODUCTION MODULE IS COPIED, NEVER RE-TYPED ──
// Hole (b) above. If this ever becomes a hand-copy again the probe stops testing
// the shipped capture, and that failure is silent.
fs.mkdirSync(VENDOR, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'components', 'cards', 'exportCards.js'), path.join(VENDOR, 'exportCards.js'));
fs.copyFileSync(path.join(ROOT, 'node_modules', 'html-to-image', 'dist', 'html-to-image.js'), path.join(VENDOR, 'html-to-image.js'));

// `exportCards.js` imports three constants from './Card.js'. Card.js is a React
// module and pulling it into a bundler-less page is not worth it; the three values
// are plain data, so they are serialised from the real module rather than restated.
fs.writeFileSync(path.join(VENDOR, 'Card.js'),
  '// GENERATED by scripts/probe-card-export.mjs from components/cards/Card.js. Do not edit.\n'
  + `export const CARD_A = ${JSON.stringify(CARD_A)};\n`
  + `export const CARD_B = ${JSON.stringify(CARD_B)};\n`
  + `export const OBJECT_ID_SUFFIX = ${JSON.stringify(OBJECT_ID_SUFFIX)};\n`, 'utf8');

// The UMD bundle sets `window.htmlToImage`; exportCards.js does a bare ESM
// `import { toPng } from 'html-to-image'`. This is the only bridge, and it
// re-exports rather than reimplements.
fs.writeFileSync(path.join(VENDOR, 'html-to-image.shim.js'),
  '// GENERATED by scripts/probe-card-export.mjs. Bridges the UMD bundle to a bare ESM specifier.\n'
  + 'export const toPng = (...a) => window.htmlToImage.toPng(...a);\n', 'utf8');

const html = `<!doctype html>
<meta charset="utf-8">
<title>Card export probe</title>
<!-- ARCHIVO IS DELIBERATELY NOT LOADED HERE, unlike the other report pages.
     html-to-image tries to inline every stylesheet it can see, and a remote
     Google Fonts sheet is cross-origin: reading its cssRules throws a
     SecurityError and the capture stalls on the fetch. This probe measures
     GEOMETRY and INK - corner alpha, edge colour, output size, colour count -
     none of which depends on which sans-serif the type lands in. Note that the
     capture itself no longer passes skipFonts: it runs the real captureCard, so
     the font path is exercised exactly as production exercises it. For how the
     cards actually LOOK, use npm run preview:cards. -->
<style>
  * { box-sizing: border-box; }
  :root { --font-archivo: 'Archivo', system-ui, -apple-system, sans-serif; }
  body { background:#111113; color:#d9d7d2; font-family:var(--font-archivo); margin:0; padding:28px; }
  h1 { font-size:20px; margin:0 0 6px; }
  p  { font-size:13px; line-height:1.6; color:#bab7b0; max-width:96ch; }
  /* The cards are laid out OFF-SCREEN, not shrunk by a transform on this stage.
     A transform here would change getBoundingClientRect() on the captured nodes
     and so change the very thing under test. The WRAPPED arrangement carries
     its own transform, on purpose, because production does. */
  .stage { position:absolute; left:-30000px; top:0; }
  table { border-collapse:collapse; margin-top:18px; font-size:12.5px; }
  th, td { border:1px solid #2a2a2f; padding:6px 10px; text-align:left; }
  th { color:#84817a; font-weight:600; letter-spacing:.08em; text-transform:uppercase; font-size:10.5px; }
  .ok { color:#8fc0a0; } .no { color:#e0a05f; } .dim { color:#6f6c66; }
  #summary { font-size:14px; margin-top:16px; }
</style>

<h1>Card export probe — the pixels, not the markup</h1>
<p>Runs the real <code>captureCard()</code> from <code>components/cards/exportCards.js</code>, served
verbatim, for both targets on each card in all three arrangements production uses. Corners must be
transparent on the DOWNLOAD (the object has a ${RADIUS}px radius, so cropping to its bounds leaves
alpha there); the edge pixel must be RIM rather than canvas field; the SHARE capture must be the full
canvas with the field intact; <strong>and every capture must carry INK</strong> — a blank
field-coloured png passes every geometry assertion ever written here.
<code>CARD_SCALE = ${CARD_SCALE}</code>, read out of <code>components/Funnel.jsx</code>.</p>

<div class="stage">
${cards.map((c) => `<div>${c.html}</div>`).join('\n')}
</div>

<div id="out">measuring...</div>

<script>${fs.readFileSync(path.join(VENDOR, 'html-to-image.js'), 'utf8')}</script>
<script type="importmap">
{ "imports": { "html-to-image": "./vendor/html-to-image.shim.js" } }
</script>
<script type="module">
// See the header of scripts/probe-card-export.mjs. Without this, every capture
// hangs forever in a tab that is never visible, with no error and no timeout.
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);

import { captureCard, captureSpec } from './vendor/exportCards.js';

const CARDS = ${JSON.stringify(meta)};
const OBJECT_SUFFIX = ${JSON.stringify(OBJECT_ID_SUFFIX)};

function load(dataUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = dataUrl;
  });
}

function pixels(img) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  // NOT filled first: the canvas starts fully transparent, so an alpha of 0 in
  // the readback means the PNG really had no pixel there.
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  return { w: c.width, h: c.height, d: ctx.getImageData(0, 0, c.width, c.height).data };
}

function rgbaAt(p, x, y) {
  const i = (y * p.w + x) * 4;
  return { r: p.d[i], g: p.d[i + 1], b: p.d[i + 2], a: p.d[i + 3] };
}

// THE ASSERTION THE PROBE DID NOT HAVE. A blank capture is one colour across the
// whole image, so distinct === 1 and nonModalShare === 0. The bounding box of the
// non-modal pixels separates "blank" from "drawn but in the wrong place", which a
// colour count alone cannot do.
function ink(p) {
  const counts = new Map();
  for (let i = 0; i < p.d.length; i += 4) {
    const k = p.d[i] + ',' + p.d[i + 1] + ',' + p.d[i + 2] + ',' + p.d[i + 3];
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  let modal = null, top = -1;
  counts.forEach((v, k) => { if (v > top) { top = v; modal = k; } });
  const [mr, mg, mb, ma] = modal.split(',').map(Number);
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1, n = 0;
  for (let i = 0; i < p.d.length; i += 4) {
    if (p.d[i] === mr && p.d[i + 1] === mg && p.d[i + 2] === mb && p.d[i + 3] === ma) continue;
    n++;
    const idx = i / 4, px = idx % p.w, py = (idx / p.w) | 0;
    if (px < x0) x0 = px; if (px > x1) x1 = px;
    if (py < y0) y0 = py; if (py > y1) y1 = py;
  }
  return {
    distinct: counts.size,
    nonModalShare: Math.round((n / (p.w * p.h)) * 10000) / 10000,
    box: x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 },
  };
}

function differing(a, b) {
  if (a.w !== b.w || a.h !== b.h) return -1;
  let n = 0;
  for (let i = 0; i < a.d.length; i += 4) {
    if (Math.abs(a.d[i] - b.d[i]) + Math.abs(a.d[i + 1] - b.d[i + 1]) + Math.abs(a.d[i + 2] - b.d[i + 2]) > 12) n++;
  }
  return n;
}

const hex = (p) => '#' + [p.r, p.g, p.b].map((v) => v.toString(16).padStart(2, '0')).join('');
const near = (p, h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.abs(p.r - r) + Math.abs(p.g - g) + Math.abs(p.b - b);
};

const rows = [];
const findings = [];
let failures = 0;
const fail = (m) => { failures++; return '<span class="no">' + m + '</span>'; };
const pass = (m) => '<span class="ok">' + m + '</span>';
const baselines = {};

for (const c of CARDS) {
  const label = c.stem + ' Card ' + c.card + ' <span class="dim">' + c.arrangement + '</span>';

  // ── THE REGRESSION ARM. Its pass condition is a REFUSAL ──
  // A node laid out at a display scale cannot be captured correctly: html-to-image
  // relayouts the clone at the OUTPUT size, so the card's own children keep their
  // display-scale metrics inside a box three times too wide. captureCard must say
  // so rather than return something that looks like a card.
  if (c.expect === 'refused') {
    let refused = false, detail = '';
    try {
      await captureCard('share', c.card, { id: c.id });
      detail = 'RETURNED AN IMAGE';
    } catch (e) { refused = true; detail = e.message; }
    if (!refused) findings.push(c.id + ': a display-scaled node was captured instead of refused');
    rows.push('<tr><td>' + label + '</td><td class="dim">' + c.note + '</td>'
      + '<td colspan="5">' + (refused ? pass('refused: ' + detail) : fail(detail)) + '</td></tr>');
    continue;
  }

  const dl = pixels(await load(await captureCard('download', c.card, { id: c.id })));
  const sh = pixels(await load(await captureCard('share', c.card, { id: c.id })));

  // 1. SIZE
  const sizeOk = dl.w === c.object.w && dl.h === c.object.h;

  // 2. THE FOUR CORNERS. Sampled 2px in from each corner, which is inside the
  //    40px radius arc and therefore outside the filled shape.
  const corners = [[2, 2], [dl.w - 3, 2], [2, dl.h - 3], [dl.w - 3, dl.h - 3]].map(([x, y]) => rgbaAt(dl, x, y));
  const cornerAlpha = corners.map((p) => p.a);
  const cornersClear = cornerAlpha.every((a) => a === 0);

  // 3. THE EDGE, sampled at mid-height 1px in from the left.
  //
  //    WHAT IS EXPECTED THERE DIFFERS BY CARD, and conflating them would make
  //    this assertion vacuous on one of them. CARD B has the rim: the pixel is
  //    the SVG stroke, so it must be opaque AND measurably away from the field.
  //    CARD A has no rim at all — the 08-13 rejection stands for it — so its
  //    edge is the object's own gradient, which sits close to the field by
  //    construction. Asserting "not field" there would fail a correct card.
  const edge = rgbaAt(dl, 1, Math.round(dl.h / 2));
  const edgeOpaque = edge.a === 255;
  const edgeDelta = near(edge, c.field);
  const edgeOk = c.card === 'B' ? edgeOpaque && edgeDelta > 12 : edgeOpaque;

  // 4. THE SHARE CAPTURE IS THE CANVAS, and 5px in from its corner is deep inside
  //    the 86.4px field margin.
  const shSizeOk = sh.w === c.canvas.w && sh.h === c.canvas.h;
  const shCorner = rgbaAt(sh, 5, 5);
  const shIsField = shCorner.a === 255 && near(shCorner, c.field) <= 12;

  // 5. INK, ON BOTH TARGETS. This is the assertion whose absence shipped a blank
  //    share card for three days while every row above stayed green.
  const dlInk = ink(dl);
  const shInk = ink(sh);
  const dlHasInk = dlInk.distinct > 1 && dlInk.nonModalShare > 0.02;
  const shHasInk = shInk.distinct > 1 && shInk.nonModalShare > 0.02;
  if (!shHasInk) findings.push(c.id + ': SHARE capture is blank (' + shInk.distinct + ' colour(s))');
  if (!dlHasInk) findings.push(c.id + ': DOWNLOAD capture is blank (' + dlInk.distinct + ' colour(s))');

  // 6. THE SHARE'S INK IS THE OBJECT, AT THE RULED MARGIN. A card drawn in the
  //    wrong place has ink and would pass 5. The object is inset by the 86.4px
  //    margin, so the box must start there and be the object's size. Card B's
  //    drop shadow spreads outside the object, so it is bounded rather than
  //    pinned: the box must not START before the shadow could reach.
  const m = c.margin;
  const b = shInk.box;
  const placed = !!b && (c.card === 'A'
    ? Math.abs(b.x - m) <= 2 && Math.abs(b.y - m) <= 2 && Math.abs(b.w - c.object.w) <= 2
    : b.x <= m && b.w >= c.object.w && b.w <= c.canvas.w);
  if (b && !placed) findings.push(c.id + ': share ink is present but misplaced - box ' + JSON.stringify(b));

  // 7. THE WRAPPER IS INVISIBLE TO THE CAPTURE. WRAPPED differs from BARE1
  //    only by a CSS transform on an ancestor, which does not change layout, so
  //    the two captures must be pixel-comparable. This is the assertion that
  //    licenses the fix: if it ever fails, display scaling has started leaking
  //    into the export again.
  let wrapNote = '<span class="dim">baseline</span>';
  const bkey = c.stem + c.card;
  if (c.arrangement === 'bare1') {
    baselines[bkey] = { dl, sh };
  } else if (baselines[bkey]) {
    const dd = differing(dl, baselines[bkey].dl);
    const ds = differing(sh, baselines[bkey].sh);
    const same = dd === 0 && ds === 0;
    if (!same) findings.push(c.id + ': wrapped differs from bare1 by ' + ds + ' share / ' + dd + ' download px');
    wrapNote = same ? pass('identical to bare1') : fail(ds + ' share / ' + dd + ' download px differ');
  }

  rows.push('<tr><td>' + label + '</td>'
    + '<td>' + (sizeOk ? pass(dl.w + 'x' + dl.h) : fail(dl.w + 'x' + dl.h + ' want ' + c.object.w + 'x' + c.object.h)) + '</td>'
    + '<td>' + (cornersClear ? pass('all 4 alpha=0') : fail('alpha ' + cornerAlpha.join(','))) + '</td>'
    + '<td>' + (edgeOk
      ? pass(hex(edge) + (c.card === 'B' ? ' rim, d=' + edgeDelta : ' gradient (no rim on A)'))
      : fail(hex(edge) + (edgeOpaque ? ' = field, d=' + edgeDelta : ' alpha=' + edge.a))) + '</td>'
    + '<td>' + (shSizeOk && shIsField ? pass(sh.w + 'x' + sh.h + ' ' + hex(shCorner)) : fail(sh.w + 'x' + sh.h + ' ' + hex(shCorner))) + '</td>'
    + '<td>' + (dlHasInk ? pass(dlInk.distinct + ' col, ' + dlInk.nonModalShare) : fail('BLANK - ' + dlInk.distinct + ' colour')) + '</td>'
    + '<td>' + (shHasInk && placed
      ? pass(shInk.distinct + ' col @ ' + b.x + ',' + b.y + ' ' + b.w + 'x' + b.h)
      : fail(shInk.box ? 'MISPLACED ' + JSON.stringify(shInk.box) : 'BLANK - ' + shInk.distinct + ' colour')) + '</td>'
    + '<td>' + wrapNote + '</td></tr>');
}

document.getElementById('out').innerHTML =
  '<table><tr><th>card</th><th>download size</th><th>corners</th><th>edge px</th>'
  + '<th>share canvas</th><th>download ink</th><th>share ink + placement</th><th>vs bare1</th></tr>'
  + rows.join('') + '</table>'
  + (findings.length ? '<ul class="no">' + findings.map((f) => '<li>' + f + '</li>').join('') + '</ul>' : '')
  + '<div id="summary" class="' + (failures ? 'no' : 'ok') + '">'
  + (failures ? failures + ' PIXEL ASSERTION(S) FAILED' : 'ALL PIXEL ASSERTIONS PASSED') + '</div>';

window.__probe = { failures, findings, done: true };
</script>
`;

fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log('CARD_SCALE read from components/Funnel.jsx:', CARD_SCALE);
console.log('wrote', OUT);
