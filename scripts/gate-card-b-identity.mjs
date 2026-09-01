#!/usr/bin/env node
// ============================================================
// scripts/gate-card-b-identity.mjs — Card B did not move, proved in pixels
// ============================================================
//   node scripts/gate-card-b-identity.mjs --baseline    write the reference PNGs
//   node scripts/gate-card-b-identity.mjs               compare against them
//
// Prompt R commit 1 changes CARD_A's geometry and the `Canvas` component that
// BOTH cards render through. R's OUT OF SCOPE section is absolute about the other
// card - "Card B. Entirely." - and `card-polish-spec.md` §10 makes it a product
// rule rather than a tidiness one: Card B's stronger physical treatment is part of
// what is being paid for.
//
// A SHARED COMPONENT IS EXACTLY WHERE THAT PROMISE BREAKS SILENTLY. Card B's
// markup could keep every assertion in `tests/card.spec.mjs` green and still shift
// a pixel, because those assertions check declarations and substrings, not the
// drawn result. This renders the thing and counts differing pixels.
//
// ── WHY PIXELS AND NOT MARKUP ──
// Markup identity is the cheaper check and it is not the promise. `RADIUS`,
// gradient stops and the rim are drawn, not declared; a change to how `Canvas`
// composes them can leave the string identical and the image different, or leave
// the string different and the image identical. The paid artifact is an IMAGE, so
// the gate is on the image.
//
// ── WHY headless Chrome AND NO NEW DEPENDENCY ──
// Same reason as `scripts/verify-upcoming-seen.mjs`: Node 24 ships a global
// WebSocket and Chrome ships the DevTools Protocol, so a real screenshot costs an
// import of neither puppeteer nor a PNG library. `Page.captureScreenshot` returns
// base64 PNG; the comparison is done on the DECODED RGBA surface via
// `createImageBitmap`-free canvas-less decoding in the page itself, which keeps
// this file free of an image decoder too.
//
// THE BASELINE IS EVIDENCE. `--baseline` is run on the PRE-CHANGE tree and the
// PNGs are committed. Regenerating them to make a failing gate pass is the
// solar-term fixture mistake (CLAUDE.md rule 5) in another costume.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const { renderToStaticMarkup } = ReactDOMServer;

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { CardB } from '../components/cards/Card.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_DIR = path.join(ROOT, 'tests', 'baseline', 'card-b');
const WRITE = process.argv.includes('--baseline');
const PORT = Number(process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 9223);

/**
 * FOUR CHARTS, NOT ONE. Card B's surface varies by Day Master token (seven dark
 * fields, three light), and a single chart would prove one gradient. These four
 * are the ones R's commit 2 names for the recomposition review, minus the two
 * that are not archetype-driven.
 */
const CHARTS = [
  { label: 'ding-api-unggun', birthDate: '1989-09-13', birthTime: '09:00' },
  { label: 'jia-jati', birthDate: '1984-03-15', birthTime: '11:00' },
  { label: 'gui-embun', birthDate: '1983-11-08', birthTime: '14:00' },
  { label: 'bing-matahari', birthDate: '1986-06-21', birthTime: '10:00' },
];

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

/** A standalone page holding ONE Card B at 1:1, on a neutral ground. */
function pageFor(chart) {
  const c = calculateBaziChart({ birthDate: chart.birthDate, birthTime: chart.birthTime });
  const data = buildCardData({ chart: c, semanticJson: buildSemanticJson(c), birthDate: chart.birthDate });
  const markup = renderToStaticMarkup(React.createElement(CardB, { data, scale: 1 }));
  return `<!doctype html><meta charset="utf-8">
<style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:#7a7a7a}</style>
<body>${markup}</body>`;
}

const results = [];
const profile = mkdtempSync(path.join(tmpdir(), 'katon-cardb-'));
let chrome;

try {
  if (!CHROME) throw new Error('no Chrome or Edge found');
  if (WRITE) mkdirSync(BASELINE_DIR, { recursive: true });

  chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });

  const target = await devtools(PORT);
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');

  for (const chart of CHARTS) {
    const html = pageFor(chart);
    await cdp.send('Page.navigate', { url: `data:text/html;base64,${Buffer.from(html).toString('base64')}` });
    // Fonts and the SVG rim need a beat; a screenshot taken mid-layout would make
    // this gate flap, and a flapping gate is one people disable.
    await sleep(1200);

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 },
      captureBeyondViewport: true,
    });
    const png = Buffer.from(shot.data, 'base64');
    const file = path.join(BASELINE_DIR, `${chart.label}.png`);

    if (WRITE) {
      writeFileSync(file, png);
      results.push({ label: chart.label, wrote: png.length });
      continue;
    }

    if (!existsSync(file)) throw new Error(`no baseline for ${chart.label}. Run with --baseline on the pre-change tree.`);
    const ref = readFileSync(file);

    // Byte comparison first: identical PNG bytes means identical pixels, and it
    // is free. Only when they differ is a pixel count worth computing.
    if (ref.equals(png)) {
      results.push({ label: chart.label, differing: 0, bytes: png.length });
      continue;
    }

    // DIFFERENT BYTES ARE NOT YET DIFFERENT PIXELS - PNG encoders are allowed to
    // vary. Decode both in the page and count actual RGBA differences, so the
    // gate reports what it claims to report.
    const differing = await countDifferingPixels(cdp, ref, png);
    results.push({ label: chart.label, differing, bytes: png.length, refBytes: ref.length });
  }
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (chrome) chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* windows lock */ }
}

async function countDifferingPixels(cdp, aBuf, bBuf) {
  const expr = `(async () => {
    const load = (b64) => new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = 'data:image/png;base64,' + b64;
    });
    const [a, b] = await Promise.all([load(${JSON.stringify(aBuf.toString('base64'))}),
                                      load(${JSON.stringify(bBuf.toString('base64'))})]);
    if (a.width !== b.width || a.height !== b.height) return -1;
    const draw = (img) => {
      const c = new OffscreenCanvas(img.width, img.height);
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, img.width, img.height).data;
    };
    const da = draw(a), db = draw(b);
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i+1] !== db[i+1] || da[i+2] !== db[i+2] || da[i+3] !== db[i+3]) n++;
    }
    return n;
  })()`;
  const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? 'pixel compare threw');
  return r.result.value;
}

// ── report ──
console.log(`${'='.repeat(60)}`);
if (WRITE) {
  console.log(`BASELINE WRITTEN: ${results.length} reference PNG(s) in tests/baseline/card-b/`);
  for (const r of results) console.log(`  ${r.label.padEnd(18)} ${r.wrote} bytes`);
  console.log('\nThese are EVIDENCE. Do not regenerate them to make a failing gate pass.');
} else {
  const bad = results.filter((r) => r.differing !== 0);
  for (const r of results) {
    const verdict = r.differing === 0 ? 'IDENTICAL' : (r.differing === -1 ? 'SIZE CHANGED' : `${r.differing} PIXELS DIFFER`);
    console.log(`  ${r.differing === 0 ? 'PASS' : 'FAIL'}  ${r.label.padEnd(18)} ${verdict}`);
  }
  if (bad.length) {
    console.log(`\nCARD B MOVED on ${bad.length} of ${results.length} charts. Prompt R does not touch Card B.`);
    process.exitCode = 1;
  } else if (results.length) {
    console.log(`\nCard B is pixel-identical on all ${results.length} charts.`);
  }
}
