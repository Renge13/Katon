#!/usr/bin/env node
// ============================================================
// scripts/probe-sheen.mjs — what the sheen actually costs, and where
// ============================================================
//   npm run probe:sheen        writes reports/sheen-probe.html
//
// Open it, or drive it with a browser tool. `window.__sheen()` returns the whole
// measurement as JSON; the page also prints it and renders thumbnails.
//
// ── WHY THIS EXISTS ────────────────────────────────────────
// `audit:card-contrast` reports the sheen's cost as ink over
// `composite(#fff, field, 0.15)` — the gradient's PEAK alpha, applied to every
// token as if every word sat in the brightest pixel of the card. That is a sound
// worst case and a poor description: 0.15 occurs at exactly one corner, and the
// headline is inset by 72px of padding under a kicker. The published figure
// therefore cannot answer the only question anyone is asking, which is whether
// MOVING the highlight buys back the two tokens that lose AA in the lit corner.
//
// Answering it needs the two things markup cannot supply: where each word is,
// and what alpha the gradient has there. So the geometry is measured in a real
// layout engine, and the colour maths is `lib/card/contrast.js` inlined from
// source rather than re-derived — the number here and the number in the audit
// come from the same function.
//
// ── WHAT IT MODELS ─────────────────────────────────────────
// The sheen is read off the RENDERED element's computed `background-image`, not
// from a copy of the declaration. Angle and stops are parsed from it, and a
// candidate placement re-evaluates that same parsed gradient at a different
// angle. Nothing in `components/cards/Card.js` is changed, and the probe cannot
// drift from the card by construction.
//
// Interpolation is PREMULTIPLIED, which is what browsers do. The light-field
// branch runs white -> transparent -> black, and non-premultiplied interpolation
// would invent grey in the middle of it.
//
// Ground is the token's FLAT FIELD, matching `audit:card-contrast` so the two
// are comparable. The object's own gradient steps AWAY from the ink at every
// stop, so the flat field stays the pessimistic surface.
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
import { CardB, CARD_B } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'reports', 'sheen-probe.html');

// The colour maths, inlined from the repo's own module. Read from disk so it
// cannot fall out of step with the audit or the tests.
const contrastSrc = fs
  .readFileSync(path.join(ROOT, 'lib', 'card', 'contrast.js'), 'utf8')
  .replace(/^export /gm, '');

// THE CANDIDATE. A pure MIRROR of the ruled angle: 360 - 158. The gradient line
// length is |W*sin a| + |H*cos a|, which is identical for 158 and 202, and every
// stop keeps its offset and its colour. So the finish's magnitude, its softness
// and its rate of falloff are bit-identical and the ONLY thing that changes is
// which top corner is lit. That is what makes this a move rather than a redesign
// — any other angle would also change how fast the highlight decays, and then
// two things would be under test at once (CLAUDE.md rule 13).
const CANDIDATES = [
  { deg: null, label: 'ruled (as built)' },
  { deg: 202, label: 'mirrored to the top-right' },
];

// AND THE WHOLE CIRCLE, because the mirror is one hypothesis and the question is
// whether ANY placement of this gradient clears the floor. Rotating is the only
// move that leaves the finish's magnitude untouched, so the sweep is the complete
// search over "move it" — if nothing here clears AA, no move does, and the
// remaining levers all change the finish itself.
const SWEEP = Array.from({ length: 72 }, (_, i) => i * 5);

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const base = buildCardData({
  chart, semanticJson: buildSemanticJson(chart), birthDate: '1989-09-13', gender: 'female',
});

const stems = Object.keys(CARD_TOKENS);
const cards = stems.map((stem) => ({
  stem,
  id: `sheen-${stem}`,
  html: renderToStaticMarkup(
    React.createElement(CardB, { data: { ...base, stem }, id: `sheen-${stem}` }),
  ),
}));

const page = `<!doctype html>
<meta charset="utf-8">
<title>Sheen probe - Card B</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
<style>
  :root { --font-archivo: 'Archivo'; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #14161a; color: #e8e6e1;
         font: 14px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace; padding: 28px; }
  h1 { font-size: 19px; margin: 0 0 6px; }
  p.note { color: #9aa0a8; max-width: 78ch; margin: 0 0 22px; }
  /* Cards render at 1:1 export pixels and are scaled for display only. Every
     measurement is normalised against the object's own rect, so the transform
     cannot reach the numbers. */
  .rail { display: flex; gap: 26px; overflow-x: auto; padding-bottom: 20px; }
  .slot { width: ${Math.round(CARD_B.canvas.w * 0.16)}px; flex: none; }
  .slot > .scaler { width: ${CARD_B.canvas.w}px; transform: scale(0.16);
                    transform-origin: top left; height: ${Math.round(CARD_B.canvas.h * 0.16)}px; }
  .thumbs { display: flex; gap: 14px; flex-wrap: wrap; margin: 10px 0 26px; }
  .thumb { width: ${Math.round(CARD_B.canvas.w * 0.1)}px; }
  .thumb > .scaler { width: ${CARD_B.canvas.w}px; transform: scale(0.1);
                     transform-origin: top left; height: ${Math.round(CARD_B.canvas.h * 0.1)}px; }
  pre#out { white-space: pre; overflow-x: auto; background: #0d0f12; padding: 18px;
            border-radius: 8px; border: 1px solid #262a30; }
</style>

<h1>The sheen, measured where the words actually are</h1>
<p class="note">Card B, all ten tokens, rendered at export size. Ground is the flat field, matching
audit:card-contrast. Call <code>window.__sheen()</code> for JSON.</p>

<div class="rail">
${cards.map((c) => `  <div class="slot"><div class="scaler">${c.html}</div></div>`).join('\n')}
</div>

<h1 style="margin-top:34px">Thumbnail, ruled vs mirrored</h1>
<p class="note">Each pair is the SAME card twice, at feed-thumbnail width. The right-hand copy is a
clone with the sheen's angle rewritten in the DOM; nothing else differs. If the finish survives the
move, the two read as the same object with the light on the other side.</p>
<div class="thumbs" id="thumbs"></div>

<pre id="out">measuring...</pre>

<script type="module">
${contrastSrc}

const MIN = 4.5;
const CANDIDATES = ${JSON.stringify(CANDIDATES)};
const SWEEP = ${JSON.stringify(SWEEP)};
const FIELDS = ${JSON.stringify(Object.fromEntries(stems.map((s) => [s, CARD_TOKENS[s].field])))};
const STEMS = ${JSON.stringify(stems)};

/** rgb()/rgba() as [r,g,b,a]. */
function rgba(str) {
  const n = str.match(/[-\\d.]+/g).map(Number);
  return [n[0], n[1], n[2], n.length > 3 ? n[3] : 1];
}
const hex = ([r, g, b]) => '#' + [r, g, b]
  .map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

/**
 * Parse a computed \`linear-gradient(Ndeg, c1 p1%, c2 p2%, ...)\`.
 * Splits on top-level commas only — every colour is an rgba(...) with commas in it.
 */
function parseGradient(img) {
  const m = img.match(/linear-gradient\\(([^]*)\\)\\s*$/);
  if (!m) throw new Error('not a linear-gradient: ' + img);
  const parts = [];
  let depth = 0, cur = '';
  for (const ch of m[1]) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur);
  const deg = parseFloat(parts.shift());
  const stops = parts.map((p) => {
    const s = p.trim();
    const cut = s.lastIndexOf(' ');
    return { color: rgba(s.slice(0, cut)), pos: parseFloat(s.slice(cut)) / 100 };
  });
  return { deg, stops };
}

/**
 * The gradient's colour at normalised point (nx, ny) inside a w x h box.
 * CSS geometry: 0deg points up, angles run clockwise, and the gradient line is
 * centred on the box with length |w*sin| + |h*cos|.
 */
function sampleAt(grad, deg, w, h, nx, ny) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const px = nx * w - w / 2, py = ny * h - h / 2;
  let t = (px * dx + py * dy) / len + 0.5;
  t = Math.max(0, Math.min(1, t));

  const s = grad.stops;
  let i = 0;
  while (i < s.length - 2 && t > s[i + 1].pos) i++;
  const A = s[i], B = s[i + 1] || s[i];
  const span = B.pos - A.pos;
  const f = span <= 0 ? 0 : Math.max(0, Math.min(1, (t - A.pos) / span));
  // PREMULTIPLIED, which is what a browser does. Straight interpolation between
  // transparent white and transparent black would manufacture a grey band.
  const out = [0, 0, 0];
  const alpha = A.color[3] + (B.color[3] - A.color[3]) * f;
  for (let k = 0; k < 3; k++) {
    const pm = A.color[k] * A.color[3] + (B.color[k] * B.color[3] - A.color[k] * A.color[3]) * f;
    out[k] = alpha > 0 ? pm / alpha : 0;
  }
  return { color: hex(out), alpha, t };
}

/** Every text run that is not aria-hidden, with its box normalised to the object. */
function textBoxes(object) {
  const objRect = object.getBoundingClientRect();
  const walker = document.createTreeWalker(object, NodeFilter.SHOW_TEXT);
  const out = [];
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const el = n.parentElement;
    if (seen.has(el)) continue;
    seen.add(el);
    let hidden = false, opacity = 1;
    for (let p = el; p && p !== object.parentElement; p = p.parentElement) {
      if (p.getAttribute && p.getAttribute('aria-hidden') === 'true') hidden = true;
      opacity *= parseFloat(getComputedStyle(p).opacity || '1');
    }
    if (hidden) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // A SOLID background on an ancestor becomes the ground for its subtree — the
    // brass day-pillar cell does this. Same rule as lib/card/domContrast.js.
    let ground = null;
    for (let p = el; p && p !== object.parentElement && !ground; p = p.parentElement) {
      const bg = getComputedStyle(p).backgroundColor;
      const c = rgba(bg);
      if (c[3] === 1) ground = hex(c);
    }
    // SHIELDED FROM THE SHEEN. The sheen is painted UNDER the content, so any
    // text sitting on an element that paints its own opaque fill above it cannot
    // be reached by it at all — the INTI DIRI pill (a brass gradient) is the one
    // case on this card. Counting it made the pill look like the binding
    // constraint on the three light tokens, which is a measurement of nothing:
    // its ratio is brass-on-brass and does not move with the field, let alone
    // with a wash beneath the thing it is drawn on. audit:card-contrast already
    // owns that number.
    let shielded = false;
    for (let p = el; p && p !== object; p = p.parentElement) {
      if (getComputedStyle(p).backgroundImage !== 'none') shielded = true;
    }
    out.push({
      text: n.nodeValue.trim().slice(0, 24),
      color: hex(rgba(getComputedStyle(el).color)),
      opacity,
      solidGround: ground,
      shielded,
      x0: (r.left - objRect.left) / objRect.width,
      y0: (r.top - objRect.top) / objRect.height,
      x1: (r.right - objRect.left) / objRect.width,
      y1: (r.bottom - objRect.top) / objRect.height,
    });
  }
  return out;
}

/** Worst contrast this run reaches anywhere inside its own box, at this angle. */
function worstOver(run, grad, deg, w, h, field) {
  let worst = Infinity, at = null;
  const N = 6;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const nx = run.x0 + ((run.x1 - run.x0) * i) / N;
      const ny = run.y0 + ((run.y1 - run.y0) * j) / N;
      const s = sampleAt(grad, deg, w, h, nx, ny);
      const ground = run.solidGround || field;
      const lit = composite(s.color, ground, s.alpha);
      const ratio = contrast(composite(run.color, lit, run.opacity), lit);
      if (ratio < worst) { worst = ratio; at = { alpha: s.alpha, nx, ny }; }
    }
  }
  return { ratio: worst, ...at };
}

window.__sheen = function () {
  const result = { candidates: CANDIDATES, tokens: [] };
  for (const stem of STEMS) {
    const object = document.getElementById('sheen-' + stem + '-object');
    const field = FIELDS[stem];
    // READ THE SHEEN OFF THE CARD. The only direct child that is aria-hidden,
    // inset to all four edges and painted with a linear-gradient.
    const sheenEl = [...object.children].find((el) => el.getAttribute('aria-hidden') === 'true'
      && getComputedStyle(el).backgroundImage.includes('linear-gradient')
      && getComputedStyle(el).position === 'absolute'
      && getComputedStyle(el).inset !== 'auto');
    if (!sheenEl) throw new Error('sheen not found on ' + stem);
    const grad = parseGradient(getComputedStyle(sheenEl).backgroundImage);
    const w = object.getBoundingClientRect().width;
    const h = object.getBoundingClientRect().height;
    const runs = textBoxes(object).filter((r) => !r.shielded);

    // ── THE NUMBER THAT DECIDES THIS ───────────────────────
    // How much white the token's binding FULL-OPACITY text can carry anywhere on
    // the card before it drops under the floor. It is a property of the token and
    // the role, not of the gradient, so it holds for EVERY placement — including
    // ones this sweep does not try, and including a redrawn finish. If the
    // tolerance is below the alpha the sheen has wherever that text sits, no move
    // fixes it and the lever has to be the field, the ink or the sheen's strength.
    const full = runs.filter((r) => r.opacity === 1);
    const binding = full.map((r) => ({
      ...r, flat: contrast(composite(r.color, r.solidGround || field, r.opacity), r.solidGround || field),
    })).sort((a, b) => a.flat - b.flat)[0];
    let tolerance = 0;
    for (let a = 0; a <= 1.0001; a += 0.001) {
      const ground = binding.solidGround || field;
      const lit = composite('#ffffff', ground, a);
      if (contrast(composite(binding.color, lit, 1), lit) < MIN) break;
      tolerance = a;
    }

    const row = {
      stem, field, ruledDeg: grad.deg,
      peakAlpha: Math.max(...grad.stops.map((s) => s.color[3])),
      binding: { text: binding.text, color: binding.color, flat: binding.flat, tolerance },
      arms: [],
    };
    for (const cand of CANDIDATES) {
      const deg = cand.deg === null ? grad.deg : cand.deg;
      const scored = runs.map((r) => ({ ...r, ...worstOver(r, grad, deg, w, h, field) }))
        .sort((a, b) => a.ratio - b.ratio);
      const headline = scored.filter((r) => r.color && r.opacity === 1)
        .sort((a, b) => a.ratio - b.ratio)[0];
      row.arms.push({
        label: cand.label,
        deg,
        // The binding constraint at FULL opacity. Dimmed roles are DIM_EXEMPT and
        // are reported separately rather than gating anything.
        worstFull: headline ? { text: headline.text, ratio: headline.ratio, alpha: headline.alpha } : null,
        worstAny: { text: scored[0].text, ratio: scored[0].ratio, opacity: scored[0].opacity, alpha: scored[0].alpha },
        underAA: scored.filter((r) => r.opacity === 1 && r.ratio < MIN).map((r) => r.text),
        // Alpha over the whole lit corner region, independent of any text.
        cornerAlpha: {
          tl: sampleAt(grad, deg, w, h, 0, 0).alpha,
          tr: sampleAt(grad, deg, w, h, 1, 0).alpha,
          bl: sampleAt(grad, deg, w, h, 0, 1).alpha,
          br: sampleAt(grad, deg, w, h, 1, 1).alpha,
        },
      });
    }
    result.tokens.push(row);
    row._runs = runs;
    row._grad = grad;
    row._w = w;
    row._h = h;
  }

  // THE SWEEP. For each angle, the worst full-opacity text ratio across all ten
  // tokens — one number that says whether that placement is shippable.
  result.sweep = SWEEP.map((deg) => {
    let worst = Infinity, who = null;
    for (const row of result.tokens) {
      for (const run of row._runs) {
        if (run.opacity !== 1) continue;
        const s = worstOver(run, row._grad, deg, row._w, row._h, row.field);
        if (s.ratio < worst) { worst = s.ratio; who = row.stem + ' ' + run.text; }
      }
    }
    return { deg, worst, who };
  });
  for (const row of result.tokens) { delete row._runs; delete row._grad; delete row._w; delete row._h; }
  return result;
};

// ── THE THUMBNAIL PAIR ─────────────────────────────────────
// Four tokens: the two that lose AA (乙, 丙), the darkest field (庚) and a light
// field (辛), so both sheen branches are on screen. The mirrored copy is a DOM
// CLONE with one number rewritten — same markup, same fonts, same everything.
{
  const rail = document.getElementById('thumbs');
  for (const stem of ['乙', '丙', '庚', '辛']) {
    const src = document.getElementById('sheen-' + stem);
    for (const deg of [null, 202]) {
      const wrap = document.createElement('div');
      wrap.className = 'thumb';
      const scaler = document.createElement('div');
      scaler.className = 'scaler';
      const copy = src.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      if (deg !== null) {
        for (const el of copy.querySelectorAll('div[aria-hidden="true"]')) {
          const bg = el.style.background || '';
          if (bg.startsWith('linear-gradient(158deg')) {
            el.style.background = bg.replace('158deg', deg + 'deg');
          }
        }
      }
      scaler.appendChild(copy);
      wrap.appendChild(scaler);
      const cap = document.createElement('div');
      cap.style.cssText = 'font-size:11px;color:#9aa0a8;text-align:center;margin-top:4px';
      cap.textContent = stem + ' ' + (deg === null ? 'ruled' : 'mirrored');
      wrap.appendChild(cap);
      rail.appendChild(wrap);
    }
  }
}

const r = window.__sheen();
const pad = (s, n) => String(s).padStart(n);
let txt = 'CARD B - worst FULL-OPACITY text ratio, measured at the box each word occupies\\n';
txt += 'floor ' + MIN + ', ground = flat field (same as audit:card-contrast)\\n\\n';
txt += 'stem   ruled ' + r.tokens[0].arms[0].deg + 'deg        mirrored 202deg      delta\\n';
for (const t of r.tokens) {
  const [a, b] = t.arms;
  const f = (x) => pad(x.worstFull.ratio.toFixed(2), 5) + ' a=' + x.worstFull.alpha.toFixed(3)
    + (x.worstFull.ratio < MIN ? ' UNDER' : '      ');
  txt += ' ' + t.stem + '   ' + f(a) + '   ' + f(b) + '   '
    + pad((b.worstFull.ratio - a.worstFull.ratio >= 0 ? '+' : '')
      + (b.worstFull.ratio - a.worstFull.ratio).toFixed(2), 6) + '\\n';
}
const best = [...r.sweep].sort((a, b) => b.worst - a.worst);
txt += '\\nHOW MUCH WHITE EACH TOKEN CAN CARRY on its binding full-opacity text\\n';
txt += '(a property of the token, not of the placement - it holds for every angle)\\n';
for (const t of r.tokens) {
  txt += ' ' + t.stem + '   ' + t.binding.text.padEnd(12) + ' ' + t.binding.color
    + '  flat ' + pad(t.binding.flat.toFixed(2), 5)
    + '   tolerates alpha <= ' + t.binding.tolerance.toFixed(3) + '\\n';
}

txt += '\\nEVERY PLACEMENT, worst full-opacity text over all ten tokens\\n';
txt += '  best angle    ' + pad(best[0].deg, 4) + 'deg  ' + best[0].worst.toFixed(2) + '  (' + best[0].who + ')\\n';
txt += '  ruled 158deg        ' + r.sweep.find((s) => s.deg === 160).worst.toFixed(2) + ' (at 160, nearest sample)\\n';
txt += '  angles clearing ' + MIN + ': ' + (r.sweep.filter((s) => s.worst >= MIN).map((s) => s.deg).join(', ') || 'NONE') + '\\n';

txt += '\\ncorner alpha (tl / tr / bl / br)\\n';
for (const t of r.tokens) {
  const c = (x) => [x.cornerAlpha.tl, x.cornerAlpha.tr, x.cornerAlpha.bl, x.cornerAlpha.br]
    .map((v) => v.toFixed(3)).join(' ');
  txt += ' ' + t.stem + '   ruled ' + c(t.arms[0]) + '    mirrored ' + c(t.arms[1]) + '\\n';
}
document.getElementById('out').textContent = txt;
</script>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, page);
console.log(`wrote ${path.relative(ROOT, OUT)}`);
console.log('Serve it (npm run serve:reports) and open /sheen-probe.html, or drive it with a browser tool.');
console.log('window.__sheen() returns the full measurement as JSON.');
