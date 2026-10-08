#!/usr/bin/env node
// ============================================================
// scripts/bl-pillar-labels-walk.mjs — Prompt BL in headless Chrome, and the PDF pages
// ============================================================
//   node scripts/bl-pillar-labels-walk.mjs <base-url> <out-dir>
//
// The browser half of tests/pillar-time-labels.spec.mjs: jsdom does no layout, so the
// two layout rulings are measured here, in a real browser, on readings created through
// the form (one with an hour, one without):
//   §6  each header is ONE line and its rendered text is never wider than its card,
//       at 320, 375 and 1280px;
//   §1  the header does not touch the INTI DIRI pill on the day card: the paper between
//       the header's text and the pill (the card's top edge on the others) is measured;
//   §5  the header's computed font size equals the card eyebrow's.
// CONTROL, every run: at 320px the month header's text is replaced in the DOM by an
// oversized one and the same measurement must report it, then the text is put back.
// A run whose control does not fire exits 1, whatever the real measurements say.
//
// The harness of scripts/bf-amendment-2-shots.mjs (CDP over a WebSocket, no dependency),
// headless because a hidden in-app browser pane runs no animation frames.
// Point it at local dev with GEMINI_API_KEY unset: every reading is the FLOOR, not a
// render. The Bagan does not depend on the prose.
//
// Then the PDF chart pages from the floor: the Complete Edition and the compat
// document (both persons' charts share one page), rasterised.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/bl-pillar-labels-walk.mjs <base-url> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9337;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// The least paper between the header's text and what is under it, in CSS px.
const MIN_CLEAR = 4;
const OVERSIZED = 'Bulan kelahiran menurut kalender matahari';

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

async function page(port) {
  for (let i = 0; i < 60; i += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const p = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

// Every Bagan column, measured. The header's TEXT width is a Range over its contents:
// the header div itself is as wide as its column whatever the word, so measuring the
// div could never fail.
const MEASURE = `(() => [...document.querySelectorAll('[data-pillar-col]')].map((col) => {
  const h = col.querySelector('[data-pillar-time]');
  const card = col.lastElementChild;
  const range = document.createRange(); range.selectNodeContents(h);
  const t = range.getBoundingClientRect();
  const c = card.getBoundingClientRect();
  const pill = [...card.children].find((d) => getComputedStyle(d).position === 'absolute');
  const eyebrow = [...card.children].find((d) => getComputedStyle(d).position !== 'absolute');
  const under = pill ? pill.getBoundingClientRect().top : c.top;
  return {
    position: col.getAttribute('data-pillar-col'), text: h.textContent,
    textW: +t.width.toFixed(1), cardW: +c.width.toFixed(1), lines: range.getClientRects().length,
    clear: +(under - t.bottom).toFixed(1), under: pill ? 'pill' : 'card',
    headerPx: getComputedStyle(h).fontSize, eyebrowPx: getComputedStyle(eyebrow).fontSize,
    empty: card.hasAttribute('data-pillar-empty'),
  };
}))()`;

const problems = (cols) => {
  const out = [];
  if (!cols.length) out.push('no pillar columns on the page');
  for (const c of cols) {
    if (c.lines !== 1) out.push(`${c.position}: ${c.lines} lines`);
    if (c.textW > c.cardW) out.push(`${c.position}: text ${c.textW}px wider than card ${c.cardW}px`);
    if (c.clear < MIN_CLEAR) out.push(`${c.position}: ${c.clear}px clear above the ${c.under}`);
    if (c.headerPx !== c.eyebrowPx) out.push(`${c.position}: header ${c.headerPx}, eyebrow ${c.eyebrowPx}`);
  }
  return out;
};

const VIEWPORTS = [
  { name: '320', width: 320, height: 700, mobile: true },
  { name: '375', width: 375, height: 812, mobile: true },
  { name: '1280', width: 1280, height: 900, mobile: false },
];

let failed = false;
const profile = mkdtempSync(path.join(tmpdir(), 'katon-bl-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  const viewport = (v) => cdp.send('Emulation.setDeviceMetricsOverride', { width: v.width, height: v.height, deviceScaleFactor: 2, mobile: v.mobile });
  const js = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const until = async (expr, ms = 45000) => {
    for (let t = 0; t < ms; t += 250) { if (await js(expr)) return true; await sleep(250); }
    return false;
  };
  const shot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, name), Buffer.from(data, 'base64'));
    console.log(`  wrote ${name}`);
  };
  // To the Bagan: the row's top 150px below the viewport top, so the intro is in frame.
  const toBagan = async () => {
    await js(`(() => { const g = document.querySelector('[data-pillar-col]'); if (g) window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 150); })()`);
    await sleep(1200);
  };

  async function reading(time) {
    await viewport(VIEWPORTS[1]);
    await cdp.send('Page.navigate', { url: `${BASE}/` });
    await sleep(3000);
    await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
    await cdp.send('Page.navigate', { url: `${BASE}/` });
    await until(`(() => { const el = document.querySelector('#mirror-year'); return !!el && Object.keys(el).some((k) => k.startsWith('__reactProps')); })()`);
    await js(`(async () => {
      const set = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      const tick = () => new Promise((r) => setTimeout(r, 80));
      set(document.querySelector('#mirror-year'), '1989'); await tick();
      set(document.querySelector('#mirror-month'), '9'); await tick();
      set(document.querySelector('#mirror-day'), '13'); await tick();
      ${time ? `set(document.querySelector('#mirror-time'), '${time}'); await tick();` : ''}
    })()`);
    await js(`document.querySelector('button[type="submit"]').click()`);
    if (!await until(`location.pathname.startsWith('/r/') && !!document.querySelector('[data-pillar-time], [data-pillar-empty], [data-hour-missing]') || (location.pathname.startsWith('/r/') && [...document.querySelectorAll('p')].some((p) => p.textContent.startsWith('Empat pilar')))`)) {
      throw new Error('the reading never opened');
    }
    await sleep(2500);
    return js('location.pathname');
  }

  for (const [label, time] of [['with-hour', '09:00'], ['no-hour', null]]) {
    const at = await reading(time);
    console.log(`\n== ${label}: ${at}`);
    console.log(`  intro: ${JSON.stringify(await js(`[...document.querySelectorAll('p')].map((p) => p.textContent).find((t) => t.startsWith('Empat pilar')) ?? null`))}`);
    for (const v of VIEWPORTS) {
      await viewport(v);
      await sleep(900);
      await toBagan();
      const cols = await js(MEASURE);
      const bad = problems(cols);
      console.log(`  ${v.name}px: ${cols.map((c) => `${c.text || '(none)'}[${c.position}${c.empty ? ', empty' : ''}] text ${c.textW}/${c.cardW} card, ${c.lines} line, ${c.clear}px over ${c.under}, ${c.headerPx}=${c.eyebrowPx}`).join(' | ')}`);
      if (bad.length) { failed = true; console.log(`  FAIL ${v.name}px: ${bad.join('; ')}`); } else console.log(`  OK ${v.name}px`);
      if (v.name !== '320') await shot(`bagan-${label}-${v.name}.png`);

      // THE CONTROL, at the narrowest width: an oversized month header must be reported.
      if (v.name === '320') {
        const original = await js(`(() => { const h = document.querySelector('[data-pillar-col="month"] [data-pillar-time]'); const t = h.textContent; h.textContent = ${JSON.stringify(OVERSIZED)}; return t; })()`);
        await sleep(300);
        const controlBad = problems(await js(MEASURE));
        const fired = controlBad.some((s) => s.startsWith('month:'));
        console.log(`  CONTROL 320px, month header "${OVERSIZED}": ${fired ? 'FIRED' : 'DID NOT FIRE'}: ${controlBad.join('; ')}`);
        if (!fired) failed = true;
        await shot(`control-oversized-${label}-320.png`);
        await js(`(() => { document.querySelector('[data-pillar-col="month"] [data-pillar-time]').textContent = ${JSON.stringify(original)}; })()`);
        const restored = problems(await js(MEASURE));
        console.log(`  restored to "${original}": ${restored.length ? `FAIL ${restored.join('; ')}` : 'OK'}`);
        if (restored.length) failed = true;
        await shot(`bagan-${label}-320.png`);
      }
    }
  }
} finally {
  chrome.kill();
}

// ── THE PDF CHART PAGES, from the floor ──
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { buildPairSemantic } = await import('../lib/semantic/pair.js');
const { assembleFallback } = await import('../lib/render/fallback.js');
const { buildCompleteEditionPdf, buildPairPdf } = await import('../lib/pdf/build.js');
const { textBoxes } = await import('../lib/pdf/inspect.js');
const { rasterPages } = await import('../lib/pdf/raster.js');

const floor = (sj) => ({ ...assembleFallback(sj), prompt_version: 'floor', stage6_version: 'floor' });
const chartPageOf = (buffer) => textBoxes(buffer).findIndex((runs) => runs.some((r) => r.text.trim() === 'PILAR DIRI')) + 1;
async function savePage(buffer, name) {
  const n = chartPageOf(buffer);
  const runs = textBoxes(buffer)[n - 1];
  const words = runs.filter((r) => ['Tahun', 'Bulan', 'Hari', 'Jam'].includes(r.text.trim())).map((r) => r.text.trim());
  console.log(`\n${name}: chart page ${n}, headers drawn: ${words.join(' ')}`);
  const [img] = await rasterPages(buffer, { dpi: 130, pages: [n] });
  writeFileSync(path.join(OUT, `${name}-p${String(n).padStart(2, '0')}.png`), img.png());
  console.log(`  wrote ${name}-p${String(n).padStart(2, '0')}.png`);
}

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const sjA = buildSemanticJson(A);
await savePage((await buildCompleteEditionPdf({ chart: A, semanticJson: sjA, rendered: floor(sjA), gender: 'female' })).buffer, 'pdf-ce-chart');
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00' });
const pj = buildPairSemantic(A, B);
await savePage((await buildPairPdf({
  chartA: A, chartB: B, semanticJson: pj, rendered: floor(pj),
  pair: { a: { date: '1989-09-13', gender: 'female' }, b: { date: '1990-03-04', gender: 'male' } },
})).buffer, 'pdf-compat-chart');

console.log(failed ? '\nFAIL' : '\nOK: every header one line, within its card, clear of the pill; the control fired');
process.exitCode = failed ? 1 : 0;
