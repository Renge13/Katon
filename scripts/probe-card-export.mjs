#!/usr/bin/env node
// ============================================================
// scripts/probe-card-export.mjs — the export, rastered and read back
// ============================================================
//   npm run probe:card-export     writes reports/card-export-probe.html
//
// Open it, or drive it with a browser tool: it renders both cards, runs the REAL
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
//
// WHY A GENERATED PAGE RATHER THAN A NODE TEST. html-to-image walks computed
// styles and renders through an SVG foreignObject; it needs a real layout engine
// and a real canvas. jsdom has neither. So the probe ships as a page, and
// `tests/card.spec.mjs` asserts the things that ARE checkable without a DOM (the
// descriptor, the ids, the radius) and points here for the rest.
//
// html-to-image is INLINED from node_modules rather than linked, because the
// report is opened as a `file://` document with no bundler and no network.
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
const OUT = path.join(ROOT, 'reports', 'card-export-probe.html');

const LIB = path.join(ROOT, 'node_modules', 'html-to-image', 'dist', 'html-to-image.js');
if (!fs.existsSync(LIB)) throw new Error(`html-to-image not found at ${LIB}`);
const lib = fs.readFileSync(LIB, 'utf8');

// 甲 Jati is a DARK field with a near-white rim, and 辛 Permata is a LIGHT field
// whose rim is the inverted branch. Both are probed: the light branch is where a
// rim that is nearly the field colour would hide an off-by-one.
const STEMS = ['甲', '辛'];

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

// Rendered at 1:1 export pixels so the capture needs no scaling and a pixel in
// the PNG is a pixel in the markup. The page scales them down for display only.
const cards = STEMS.flatMap((stem) => [
  { stem, card: 'A', id: `probe-${stem}-a`, spec: CARD_A, html: renderToStaticMarkup(React.createElement(CardA, { data: { ...base, stem }, id: `probe-${stem}-a` })) },
  { stem, card: 'B', id: `probe-${stem}-b`, spec: CARD_B, html: renderToStaticMarkup(React.createElement(CardB, { data: { ...base, stem }, id: `probe-${stem}-b` })) },
]);

const meta = cards.map((c) => ({
  stem: c.stem, card: c.card, id: c.id,
  field: CARD_TOKENS[c.stem].field,
  canvas: c.spec.canvas, object: c.spec.card,
}));

const html = `<!doctype html>
<meta charset="utf-8">
<title>Card export probe</title>
<!-- ARCHIVO IS DELIBERATELY NOT LOADED HERE, unlike the other report pages.
     html-to-image tries to inline every stylesheet it can see, and a remote
     Google Fonts sheet is cross-origin: reading its cssRules throws a
     SecurityError and the capture stalls on the fetch. This probe measures
     GEOMETRY — corner alpha, edge colour, output size — none of which depends on
     which sans-serif the type lands in. skipFonts:true below is the same
     decision made twice, so neither the missing link nor a future added one can
     hang the run. For how the cards actually LOOK, use npm run preview:cards. -->
<style>
  * { box-sizing: border-box; }
  :root { --font-archivo: 'Archivo', system-ui, -apple-system, sans-serif; }
  body { background:#111113; color:#d9d7d2; font-family:var(--font-archivo); margin:0; padding:28px; }
  h1 { font-size:20px; margin:0 0 6px; }
  p  { font-size:13px; line-height:1.6; color:#bab7b0; max-width:96ch; }
  /* The cards render at full export size and are shrunk for display ONLY. The
     capture reads the live nodes, so it is unaffected by this transform. */
  .stage { position:absolute; left:-20000px; top:0; }
  table { border-collapse:collapse; margin-top:18px; font-size:12.5px; }
  th, td { border:1px solid #2a2a2f; padding:6px 10px; text-align:left; }
  th { color:#84817a; font-weight:600; letter-spacing:.08em; text-transform:uppercase; font-size:10.5px; }
  .ok { color:#8fc0a0; } .no { color:#e0a05f; }
  #summary { font-size:14px; margin-top:16px; }
</style>

<h1>Card export probe — the pixels, not the markup</h1>
<p>Runs the real html-to-image capture for both targets on each card, draws the result to a canvas
and reads pixels back. Corners must be transparent on the DOWNLOAD (the object has a ${RADIUS}px
radius, so cropping to its bounds leaves alpha there); the edge pixel must be RIM rather than canvas
field; and the SHARE capture must be the full canvas with the field intact.</p>

<div class="stage">
${cards.map((c) => `<div>${c.html}</div>`).join('\n')}
</div>

<div id="out">measuring...</div>

<script>${lib}</script>
<script>
const CARDS = ${JSON.stringify(meta)};
const OBJECT_SUFFIX = ${JSON.stringify(OBJECT_ID_SUFFIX)};

function rgbaAt(img, x, y) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  // NOT filled first: the canvas starts fully transparent, so an alpha of 0 in
  // the readback means the PNG really had no pixel there.
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(x, y, 1, 1).data;
  return { r: d[0], g: d[1], b: d[2], a: d[3] };
}

function load(dataUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = dataUrl;
  });
}

const hex = (p) => '#' + [p.r, p.g, p.b].map((v) => v.toString(16).padStart(2, '0')).join('');
const near = (p, h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  return Math.abs(p.r - r) + Math.abs(p.g - g) + Math.abs(p.b - b);
};

async function run() {
  const rows = [];
  let failures = 0;
  const fail = (m) => { failures++; return '<span class="no">' + m + '</span>'; };
  const pass = (m) => '<span class="ok">' + m + '</span>';

  for (const c of CARDS) {
    const objNode = document.getElementById(c.id + OBJECT_SUFFIX);
    const canvasNode = document.getElementById(c.id);

    // ── DOWNLOAD: the object, no background colour, shadow suppressed ──
    const dlUrl = await window.htmlToImage.toPng(objNode, {
      width: c.object.w, height: c.object.h, pixelRatio: 1, cacheBust: true, skipFonts: true,
      style: { boxShadow: 'none' },
    });
    const dl = await load(dlUrl);

    // 1. SIZE
    const sizeOk = dl.width === c.object.w && dl.height === c.object.h;

    // 2. THE FOUR CORNERS. Sampled 2px in from each corner, which is inside the
    //    40px radius arc and therefore outside the filled shape.
    const corners = [[2, 2], [dl.width - 3, 2], [2, dl.height - 3], [dl.width - 3, dl.height - 3]]
      .map(([x, y]) => rgbaAt(dl, x, y));
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
    //
    //    What BOTH have to show is an opaque pixel: a transparent one means the
    //    crop has eaten a column and the canvas would show through.
    const edge = rgbaAt(dl, 1, Math.round(dl.height / 2));
    const edgeOpaque = edge.a === 255;
    const edgeDelta = near(edge, c.field);
    const edgeOk = c.card === 'B' ? edgeOpaque && edgeDelta > 12 : edgeOpaque;

    // 4. THE CENTRE is opaque, so the whole capture is not empty.
    const centre = rgbaAt(dl, Math.round(dl.width / 2), Math.round(dl.height / 2));

    // ── SHARE: the canvas, field intact ──
    const shUrl = await window.htmlToImage.toPng(canvasNode, {
      width: c.canvas.w, height: c.canvas.h, pixelRatio: 1, cacheBust: true, skipFonts: true,
    });
    const sh = await load(shUrl);
    const shSizeOk = sh.width === c.canvas.w && sh.height === c.canvas.h;
    // 5px in from the share corner is deep inside the field margin (86.4px).
    const shCorner = rgbaAt(sh, 5, 5);
    const shIsField = shCorner.a === 255 && near(shCorner, c.field) <= 12;

    rows.push('<tr><td>' + c.stem + ' Card ' + c.card + '</td>'
      + '<td>' + (sizeOk ? pass(dl.width + 'x' + dl.height) : fail(dl.width + 'x' + dl.height + ' want ' + c.object.w + 'x' + c.object.h)) + '</td>'
      + '<td>' + (cornersClear ? pass('all 4 alpha=0') : fail('alpha ' + cornerAlpha.join(','))) + '</td>'
      + '<td>' + (edgeOk
        ? pass(hex(edge) + (c.card === 'B' ? ' rim, d=' + edgeDelta : ' gradient (no rim on A)'))
        : fail(hex(edge) + (edgeOpaque ? ' = field, d=' + edgeDelta : ' alpha=' + edge.a))) + '</td>'
      + '<td>' + (centre.a === 255 ? pass('opaque') : fail('alpha ' + centre.a)) + '</td>'
      + '<td>' + (shSizeOk ? pass(sh.width + 'x' + sh.height) : fail(sh.width + 'x' + sh.height)) + '</td>'
      + '<td>' + (shIsField ? pass(hex(shCorner) + ' field') : fail(hex(shCorner) + ' want ' + c.field)) + '</td>'
      + '</tr>');
  }

  document.getElementById('out').innerHTML =
    '<table><tr><th>card</th><th>download size</th><th>corners</th><th>edge px</th>'
    + '<th>centre</th><th>share size</th><th>share corner</th></tr>' + rows.join('') + '</table>'
    + '<div id="summary" class="' + (failures ? 'no' : 'ok') + '">'
    + (failures ? failures + ' PIXEL ASSERTION(S) FAILED' : 'ALL PIXEL ASSERTIONS PASSED') + '</div>';
  window.__probe = { failures, done: true };
}

run().catch((e) => {
  document.getElementById('out').innerHTML = '<div class="no">probe threw: ' + e.message + '</div>';
  window.__probe = { failures: -1, done: true, error: e.message };
});
</script>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log(`${cards.length} cards, html-to-image inlined from node_modules (${Math.round(lib.length / 1024)} KB)`);
console.log('Open it in a browser; it prints a table and sets window.__probe.');
