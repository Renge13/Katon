#!/usr/bin/env node
// ============================================================
// scripts/measure-watermark-fit.mjs — where does the glyph's INK actually land?
// ============================================================
//   npm run measure:watermark
//   npm run measure:watermark -- --top -150 --right -170     try a candidate
//
// Prompt R section 0b, RULED 2026-08-31:
//
//   "Retain the watermark at 0.80 of card width -> 864px on the 1080px frame. The
//    size is approved; re-derive only its top/right placement during composition."
//
// ── WHAT IS BEING SATISFIED, AND IT IS NOT A NUMBER ──
// `docs/content/card-polish-spec.md:153` states the constraint as a RELATIONSHIP:
//
//   "the glyph's strokes cross the full height of the headline line and reach into
//    the tag row, and its densest region - the crossbar junction - sits off-card."
//
// That is why the old offsets cannot be scaled into the new frame, and why the
// worksheet's §2 banner forbids it: the relationship is to the HEADLINE and the
// TAG ROW, both of which moved, and neither moved proportionally to the card.
//
// ── THE DIV BOX IS NOT THE INK BOX ──
// At font-size 864 with line-height 0.8 the watermark div is 864x691, and the
// strokes sit inset from it by an amount that DIFFERS PER STEM - 一-heavy glyphs
// like 壬 are wide and short, 庚 fills its box. Measuring the div would answer a
// question nobody asked. So each card is rendered TWICE, once with the watermark
// suppressed, and the two are differenced: the bounding box of changed pixels is
// the ink, exactly.
//
// ── ALL TEN STEMS, BECAUSE THE CONSTRAINT IS PER GLYPH ──
// A placement that crosses 甲's headline may miss 丙's. The verdict is the worst
// case over the set, not the average.
//
// No new dependency; same CDP technique as gate-card-b-identity.mjs.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const { renderToStaticMarkup } = ReactDOMServer;

import { GLOSSARY } from '../lib/semantic/glossary.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CardA, CARD_A, WATERMARK_A } from '../components/cards/Card.js';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : Number(argv[i + 1]); };
const TOP = flag('top', WATERMARK_A.top);
const RIGHT = flag('right', WATERMARK_A.right);
const PORT = 9227;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p));

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (!m.id || !this.pending.has(m.id)) return;
      const { resolve, reject } = this.pending.get(m.id);
      this.pending.delete(m.id);
      if (m.error) reject(new Error(m.error.message)); else resolve(m.result);
    };
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('CDP socket failed')); });
    return new CDP(ws);
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
}

/** One real birthdate per Day Master, so every card is a real chart. */
function chartFor(stem) {
  const d = new Date(Date.UTC(1984, 0, 1));
  for (let i = 0; i < 4000; i += 1) {
    const iso = d.toISOString().slice(0, 10);
    const c = calculateBaziChart({ birthDate: iso, birthTime: '09:00' });
    if (c.day.stem === stem) return { iso, chart: c };
    d.setUTCDate(d.getUTCDate() + 1);
  }
  throw new Error(`no chart found for ${stem}`);
}

const STEMS = Object.keys(GLOSSARY.arketipe).filter((s) => GLOSSARY.arketipe[s]?.name_en);

const profile = mkdtempSync(path.join(tmpdir(), 'wmfit-'));
let chrome;
const rows = [];

try {
  if (!CHROME) throw new Error('no Chrome or Edge found');
  chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

  let page;
  for (let i = 0; i < 60 && !page; i += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
      page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    } catch { /* wait */ }
    if (!page) await sleep(250);
  }
  const cdp = await CDP.connect(page.webSocketDebuggerUrl);
  await cdp.send('Page.enable');

  for (const stem of STEMS) {
    const { iso, chart } = chartFor(stem);
    const data = buildCardData({ chart, semanticJson: buildSemanticJson(chart), birthDate: iso });
    const markup = renderToStaticMarkup(React.createElement(CardA, {
      data, scale: 1, id: 'probe', watermarkOffset: { top: TOP, right: RIGHT },
    }));

    const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200..900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#888}</style>
<body>${markup}</body>`;

    await cdp.send('Page.navigate', { url: `data:text/html;base64,${Buffer.from(html).toString('base64')}` });
    await sleep(1800);

    const probe = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        try { await document.fonts.ready; } catch (e) {}
        const obj = document.getElementById('probe-object');
        const card = obj.getBoundingClientRect();
        const rel = (el) => { const r = el.getBoundingClientRect();
          return { top: r.top - card.top, bottom: r.bottom - card.top, left: r.left - card.left, right: r.right - card.left }; };
        const head = rel(document.querySelector('[data-role="headline"]'));
        const tags = rel(document.querySelector('[data-role="tags"]'));
        const wm = document.querySelector('[data-role="watermark"]');

        // Shot A: as rendered. Shot B: watermark suppressed. The DIFFERENCE is ink.
        const shoot = async () => {
          const c = new OffscreenCanvas(1, 1);
          return new Promise((res) => requestAnimationFrame(() => res()));
        };
        void shoot;
        return JSON.stringify({ head, tags, card: { w: card.width, h: card.height } });
      })()`, returnByValue: true, awaitPromise: true,
    });
    const geom = JSON.parse(probe.result.value);

    // ── the two screenshots, and the ink box between them ──
    const shotWith = await cdp.send('Page.captureScreenshot', {
      format: 'png', clip: { x: 0, y: 0, width: CARD_A.card.w, height: CARD_A.card.h, scale: 1 }, captureBeyondViewport: true,
    });
    await cdp.send('Runtime.evaluate', {
      expression: `document.querySelector('[data-role="watermark"]').style.display = 'none'; true`,
    });
    await sleep(250);
    const shotWithout = await cdp.send('Page.captureScreenshot', {
      format: 'png', clip: { x: 0, y: 0, width: CARD_A.card.w, height: CARD_A.card.h, scale: 1 }, captureBeyondViewport: true,
    });

    const ink = await cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const load = (b64) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'data:image/png;base64,' + b64; });
        const [a, b] = await Promise.all([load(${JSON.stringify(shotWith.data)}), load(${JSON.stringify(shotWithout.data)})]);
        const px = (img) => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d');
          x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height); };
        const A = px(a), B = px(b);
        let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, n = 0;
        for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) {
          const i = (y * A.width + x) * 4;
          // A tolerance of 2 per channel: the watermark is a low-alpha wash and
          // PNG round-tripping can move a channel by one.
          if (Math.abs(A.data[i]-B.data[i]) > 2 || Math.abs(A.data[i+1]-B.data[i+1]) > 2 || Math.abs(A.data[i+2]-B.data[i+2]) > 2) {
            n++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
        return JSON.stringify({ n, minX, minY, maxX, maxY });
      })()`, returnByValue: true, awaitPromise: true,
    });
    if (ink.exceptionDetails) throw new Error(ink.exceptionDetails.text ?? 'ink diff threw');
    const box = JSON.parse(ink.result.value);

    // ── the three constraints from card-polish-spec.md:153 ──
    const crossesHeadline = box.n > 0 && box.minY <= geom.head.top && box.maxY >= geom.head.bottom;
    const reachesTagRow = box.n > 0 && box.maxY >= geom.tags.top;
    // "sits off-card": the glyph is clipped by the frame, so its ink runs to the
    // very edge. Measured as ink touching the right edge (and the top, which the
    // negative `top` offset produces).
    const offCardRight = box.maxX >= CARD_A.card.w - 1;
    const offCardTop = box.minY <= 0;

    rows.push({ stem, ...box, head: geom.head, tags: geom.tags, crossesHeadline, reachesTagRow, offCardRight, offCardTop });
  }
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (chrome) chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* lock */ }
}

if (!rows.length) process.exit(process.exitCode ?? 1);

console.log(`CARD A ${CARD_A.card.w}x${CARD_A.card.h}   watermark top ${TOP}, right ${RIGHT}\n`);
console.log(`  ${'stem'.padEnd(6)}${'ink y'.padEnd(16)}${'ink x'.padEnd(16)}${'headline y'.padEnd(15)}${'tags y'.padEnd(14)} cross reach off`);
for (const r of rows) {
  const inkY = `${r.minY}..${r.maxY}`;
  const inkX = `${r.minX}..${r.maxX}`;
  const hy = `${Math.round(r.head.top)}..${Math.round(r.head.bottom)}`;
  const ty = `${Math.round(r.tags.top)}..${Math.round(r.tags.bottom)}`;
  console.log(`  ${r.stem.padEnd(5)} ${inkY.padEnd(16)}${inkX.padEnd(16)}${hy.padEnd(15)}${ty.padEnd(14)} `
    + `${r.crossesHeadline ? ' ok ' : 'MISS'}  ${r.reachesTagRow ? ' ok ' : 'MISS'} ${r.offCardRight ? 'ok' : 'NO'}`);
}
const bad = rows.filter((r) => !r.crossesHeadline || !r.reachesTagRow || !r.offCardRight);
console.log(bad.length
  ? `\n${bad.length} of ${rows.length} FAIL the spec:153 relationship: ${bad.map((r) => r.stem).join(' ')}`
  : `\nALL ${rows.length} satisfy spec:153 - strokes cross the headline, reach the tag row, and run off-card.`);
