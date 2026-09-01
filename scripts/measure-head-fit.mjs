#!/usr/bin/env node
// ============================================================
// scripts/measure-head-fit.mjs — does every archetype head fit the measure?
// ============================================================
//   npm run measure:head-fit
//   npm run measure:head-fit -- --json     the pinnable table, nothing else
//
// Prompt R section 0a, RULED 2026-08-31:
//
//   "Replace the word-count `x 0.80` branch with a real-fit gate. Embun remains
//    at 139 on the new 936px measure unless the rendered text actually fails to
//    fit."
//
// ── WHY A MEASUREMENT AND NOT AN ARITHMETIC GUESS ──
// The branch it replaces fired on `head.length > 1` - a proxy for "this might be
// too wide" that is not even monotonic in width. `MOUNTAIN` is 8 characters and
// renders at FULL size today; `MORNING` is 7 and is the one reduced. The rule
// shrinks the shorter word and leaves the longer one alone, which is what a proxy
// does when nobody checks it against the thing it stands for.
//
// ── WHAT IS ACTUALLY CONSTRAINED IS THE LONGEST WORD, NOT THE HEAD ──
// `<Headline>` renders `head.map(w => E('div', {}, w))`, so every word gets its
// own block and its own line. A multi-word head NEVER has to fit on one line.
// That is why this measures words, not phrases, and why `THE MORNING DEW` was
// never the case to worry about.
//
// ── WHY headless Chrome, AND WHY THE FONT IS CHECKED BEFORE ANY NUMBER ──
// Archivo comes from Google Fonts over the network. A measurement taken with a
// system fallback would be a confident number about a font the card does not use,
// which is worse than no number. `document.fonts.check('800 139px Archivo')` has
// to return true or this refuses to print a table.
//
// No new dependency: Node 24 ships a global WebSocket and Chrome ships the
// DevTools Protocol, the same technique as `scripts/gate-card-b-identity.mjs`.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { GLOSSARY } from '../lib/semantic/glossary.js';
import { CARD_A, PADDING, HEADLINE_SIZE, HEADLINE_TRACKING, HEADLINE_WEIGHT, splitName } from '../components/cards/Card.js';

const JSON_ONLY = process.argv.includes('--json');
const PORT = 9226;
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

/** Every head word of every archetype, with the stem it belongs to. */
function headWords() {
  const out = [];
  for (const [stem, entry] of Object.entries(GLOSSARY.arketipe)) {
    if (!entry?.name_en) continue;
    const { head } = splitName(entry.name_en);
    for (const word of head) out.push({ stem, nameEn: entry.name_en, word });
  }
  return out;
}

const MEASURE = CARD_A.card.w - 2 * PADDING;
const words = headWords();

const profile = mkdtempSync(path.join(tmpdir(), 'headfit-'));
let chrome;
let rows = [];

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

  // EVERY DECLARATION HERE MIRRORS <Headline>'s. If one drifts, this measures a
  // different thing than the card draws, which is the failure mode a measurement
  // harness has: being precisely wrong.
  const spans = words.map(({ stem, word }, i) => `<div class="w" id="w${i}" data-stem="${stem}">${word}</div>`).join('\n');
  const html = `<!doctype html><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap" rel="stylesheet">
<style>
  html,body { margin:0; padding:0; background:#fff; }
  /* display:inline-block so the box is the TEXT's width, not the container's. */
  .w { display:inline-block; font-family:'Archivo'; font-weight:${HEADLINE_WEIGHT};
       font-size:${HEADLINE_SIZE}px; line-height:0.90; letter-spacing:${HEADLINE_TRACKING}px;
       text-transform:uppercase; white-space:pre; }
</style>
<body>${spans}</body>`;

  await cdp.send('Page.navigate', { url: `data:text/html;base64,${Buffer.from(html).toString('base64')}` });
  await sleep(3500);

  const probe = await cdp.send('Runtime.evaluate', {
    expression: `(async () => {
      try { await document.fonts.ready; } catch (e) {}
      const ok = document.fonts.check('${HEADLINE_WEIGHT} ${HEADLINE_SIZE}px Archivo');
      const widths = [...document.querySelectorAll('.w')].map((el) => ({
        id: el.id, w: el.getBoundingClientRect().width,
      }));
      return JSON.stringify({ ok, widths });
    })()`, returnByValue: true, awaitPromise: true,
  });

  const { ok, widths } = JSON.parse(probe.result.value);
  if (!ok) throw new Error('Archivo did not load. Refusing to print widths measured in a fallback font.');

  rows = words.map((entry, i) => {
    const w = widths.find((x) => x.id === `w${i}`).w;
    return { ...entry, width: Math.round(w * 100) / 100, fits: w <= MEASURE, over: Math.round((w - MEASURE) * 100) / 100 };
  });
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (chrome) chrome.kill();
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* windows lock */ }
}

if (!rows.length) process.exit(process.exitCode ?? 1);

const overflowing = rows.filter((r) => !r.fits);

if (JSON_ONLY) {
  console.log(JSON.stringify({
    measuredAt: new Date().toISOString().slice(0, 10),
    headlineSize: HEADLINE_SIZE, measure: MEASURE,
    overflowing: overflowing.map((r) => r.word.toUpperCase()),
    widths: Object.fromEntries(rows.map((r) => [r.word.toUpperCase(), r.width])),
  }, null, 2));
  process.exit(0);
}

console.log(`Archivo ${HEADLINE_WEIGHT}, ${HEADLINE_SIZE}px, tracking ${HEADLINE_TRACKING}, uppercase`);
console.log(`measure ${MEASURE}px  (CARD_A ${CARD_A.card.w} - 2 x PADDING ${PADDING})\n`);
console.log(`  ${'stem'.padEnd(6)}${'word'.padEnd(12)}${'width'.padStart(9)}${'of measure'.padStart(12)}   verdict`);
for (const r of rows.slice().sort((a, b) => b.width - a.width)) {
  const pctOf = `${((r.width / MEASURE) * 100).toFixed(1)}%`;
  console.log(`  ${r.stem.padEnd(6)}${r.word.toUpperCase().padEnd(12)}${String(r.width).padStart(9)}${pctOf.padStart(12)}   ${r.fits ? 'fits' : `OVERFLOWS by ${r.over}`}`);
}

const widest = rows.slice().sort((a, b) => b.width - a.width)[0];
console.log(`\nwidest: ${widest.word.toUpperCase()} at ${widest.width}px, ${Math.round(MEASURE - widest.width)}px spare`);
console.log(overflowing.length
  ? `\n${overflowing.length} HEAD(S) OVERFLOW. Pin them in HEADS_THAT_OVERFLOW in components/cards/Card.js.`
  : '\nALL TEN FIT AT FULL SIZE. HEADS_THAT_OVERFLOW stays empty.');
