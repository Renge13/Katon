#!/usr/bin/env node
// ============================================================
// scripts/probe-card-host.mjs — does the card lay out the same on any page?
// ============================================================
//   npm run probe:card-host      exits 1 if any card's layout depends on its host
//   ... -- --dump <file.json>    also write every measured box, so two TREES can be
//                                diffed (the pre-change card on the production host
//                                against the post-change card on either host)
//
// THE DEFECT THIS EXISTS FOR (2026-09-30, docs/qa/2026-09-30-card-b-headline.md §5).
// Card B's tags, badge labels, Aspek line, kicker, `nameId` and footer lines set no
// `line-height`, so they inherited it from whatever page mounted the card. The app's
// body is `line-height: 1.6` (app/globals.css). A headless capture from a page with
// no rule read 0px overflow on a tree where production read +40px: tag rows at a
// 37px pitch instead of 50. So a change to the site's body type could re-lay the
// paid card, and the only instrument that matched production did so because its
// own body happened to be `13px/1.6`.
//
// WHAT IT MEASURES. Every card, Card A and Card B, on the gate's five charts, is
// rendered at scale 1 into TWO host pages that differ ONLY in the body's
// line-height: `normal` (no rule at all, the browser default) and `1.6` (production).
// For each, it records the box of EVERY element inside the object, relative to the
// object, plus the object's scrollHeight. The two lists must be equal to the
// hundredth of a pixel. One element off is a fail, and the report names it.
//
// WHY BOXES AND NOT PIXELS. A pixel diff says THAT something moved; a box list says
// WHAT moved and by how much, which is what a reviewer needs from a layout claim.
// `scripts/gate-card-b-identity.mjs` is the pixel instrument and answers a different
// question (did Card B change against its baseline).
//
// ARCHIVO IS LOADED, as in `audit-card-budget.mjs --overflow`: line breaks decide
// which boxes exist, and the fallback font breaks lines somewhere else.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CardA, CardB, OBJECT_ID_SUFFIX } from '../components/cards/Card.js';

const { renderToStaticMarkup } = ReactDOMServer;
const DUMP = process.argv.includes('--dump') ? process.argv[process.argv.indexOf('--dump') + 1] : null;
const PORT = Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 9224);

// The gate's five charts (scripts/gate-card-b-identity.mjs), so both instruments
// look at the same cards. 1954-01-07 10:00 is the real 癸 chart that clipped by 40px.
const CHARTS = [
  { birthDate: '1989-09-13', birthTime: '09:00' },
  { birthDate: '1984-03-15', birthTime: '11:00' },
  { birthDate: '1983-11-08', birthTime: '14:00' },
  { birthDate: '1986-06-21', birthTime: '10:00' },
  { birthDate: '1954-01-07', birthTime: '10:00' },
];

// The ONLY difference between the two pages. Everything else is held equal so a
// difference in the boxes has exactly one candidate cause.
const HOSTS = {
  normal: 'html,body{margin:0;padding:0}',
  production: 'html,body{margin:0;padding:0}body{line-height:1.6}',
};

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function devtools(port) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

function pageFor(card, chart, hostCss) {
  const c = calculateBaziChart({ birthDate: chart.birthDate, birthTime: chart.birthTime });
  const data = buildCardData({ chart: c, semanticJson: buildSemanticJson(c), birthDate: chart.birthDate });
  const id = `probe-${card.toLowerCase()}`;
  const markup = renderToStaticMarkup(React.createElement(card === 'A' ? CardA : CardB, { data, scale: 1, id }));
  return {
    stem: data.stem,
    objectId: `${id}${OBJECT_ID_SUFFIX}`,
    html: `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}:root{--font-archivo:'Archivo',system-ui,-apple-system,sans-serif}${hostCss}</style>
<body>${markup}</body>`,
  };
}

/** Every element's box inside the object, relative to it, in export px. */
const MEASURE = (objectId) => `(async () => {
  await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 150));
  const obj = document.getElementById(${JSON.stringify(objectId)});
  if (!obj) return { missing: true };
  const o = obj.getBoundingClientRect();
  const r2 = (n) => Math.round(n * 100) / 100;
  const boxes = [...obj.querySelectorAll('*')].map((el, i) => {
    const b = el.getBoundingClientRect();
    const text = (el.children.length ? '' : el.textContent || '').trim().slice(0, 24);
    return { i, tag: el.tagName.toLowerCase(), text,
      x: r2(b.left - o.left), y: r2(b.top - o.top), w: r2(b.width), h: r2(b.height) };
  });
  return { boxes, scrollH: obj.scrollHeight, clientH: obj.clientHeight,
    lineHeight: getComputedStyle(obj).lineHeight };
})()`;

const results = [];
const profile = mkdtempSync(path.join(tmpdir(), 'katon-cardhost-'));
let chrome;

try {
  if (!CHROME) throw new Error('no Chrome or Edge found');
  chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check',
    '--force-device-scale-factor=1', '--window-size=1200,2000',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  const target = await devtools(PORT);
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');

  for (const card of ['A', 'B']) {
    for (const chart of CHARTS) {
      const measured = {};
      let stem;
      for (const [host, css] of Object.entries(HOSTS)) {
        const page = pageFor(card, chart, css);
        stem = page.stem;
        await cdp.send('Page.navigate', { url: `data:text/html;base64,${Buffer.from(page.html).toString('base64')}` });
        await sleep(400);
        const r = await cdp.send('Runtime.evaluate', { expression: MEASURE(page.objectId), returnByValue: true, awaitPromise: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? 'measure threw');
        if (r.result.value.missing) throw new Error(`card ${card} ${chart.birthDate}: object node missing`);
        measured[host] = r.result.value;
      }
      const a = measured.normal;
      const b = measured.production;
      const moved = [];
      const n = Math.max(a.boxes.length, b.boxes.length);
      for (let i = 0; i < n; i += 1) {
        const p = a.boxes[i];
        const q = b.boxes[i];
        if (!p || !q || p.tag !== q.tag || p.x !== q.x || p.y !== q.y || p.w !== q.w || p.h !== q.h) {
          moved.push({ p, q });
        }
      }
      results.push({
        card, chart: `${chart.birthDate} ${chart.birthTime}`, stem,
        elements: b.boxes.length, moved, measured,
        scroll: [a.scrollH - a.clientH, b.scrollH - b.clientH],
        lineHeight: [a.lineHeight, b.lineHeight],
      });
    }
  }
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (chrome) chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* windows lock */ }
}

if (DUMP) {
  writeFileSync(DUMP, JSON.stringify(results.map(({ card, chart, stem, measured }) => ({ card, chart, stem, measured })), null, 1));
}

// ── report ──
console.log('='.repeat(72));
console.log('host pages: body line-height NORMAL vs 1.6 (production). Everything else equal.\n');
for (const r of results) {
  const verdict = r.moved.length ? `${r.moved.length} of ${r.elements} ELEMENTS MOVED` : `IDENTICAL (${r.elements} elements)`;
  console.log(`  ${r.moved.length ? 'FAIL' : 'PASS'}  card ${r.card}  ${r.stem}  ${r.chart}  ${verdict}`);
  console.log(`        object line-height ${r.lineHeight[0]} / ${r.lineHeight[1]}   scrollH-clientH ${r.scroll[0]} / ${r.scroll[1]}`);
  for (const { p, q } of r.moved.slice(0, 3)) {
    const fmt = (b) => (b ? `${b.tag} y=${b.y} h=${b.h}` : 'absent');
    console.log(`        ${(q || p).tag} "${(q || p).text}": ${fmt(p)}  ->  ${fmt(q)}`);
  }
}
const bad = results.filter((r) => r.moved.length);
if (bad.length) {
  console.log(`\n${bad.length} of ${results.length} cards lay out differently depending on the host page.`);
  process.exitCode = 1;
} else if (results.length) {
  console.log(`\nAll ${results.length} cards lay out identically on both host pages.`);
}
