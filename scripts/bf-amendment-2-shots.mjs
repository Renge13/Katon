#!/usr/bin/env node
// ============================================================
// scripts/bf-amendment-2-shots.mjs — Prompt BF amendment 2 at 375px, in headless Chrome
// ============================================================
//   node scripts/bf-amendment-2-shots.mjs <base-url> <out-dir>
//
// The harness of scripts/bf-shots.mjs (CDP over a WebSocket, no dependency), headless
// for the same reason: a hidden in-app browser pane runs no animation frames.
//
// Walks the two changes through the real UI, then builds the Complete Edition:
//   1. a reading created by the form with NO hour, so the device remembers it; its
//      Bagan block (no Pilar Konsepsi, no caption, H2/H3 present);
//   2. H3 "Tambahkan jam lahir": the arrival shows no resume card, the hour field is
//      marked, and its top is measured at 375x812 and 375x667; a plain visit to `/`
//      afterwards shows the card again (the memory was kept);
//   3. a reading WITH an hour, and its Bagan block;
//   4. the Complete Edition for 1989-09-13 09:00 female from the FLOOR (the inputs of
//      scripts/be-pdf-pages.mjs), its chart page rasterised: 胎元 still printed.
//
// Point it at local dev with GEMINI_API_KEY unset and no Supabase: every reading is the
// FLOOR, not a render.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/bf-amendment-2-shots.mjs <base-url> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9335;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-bf-a2-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  const viewport = (height) => cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height, deviceScaleFactor: 2, mobile: true });
  await viewport(812);
  const js = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, name), Buffer.from(data, 'base64'));
    console.log(`wrote ${name}`);
  };
  const go = async (url) => { await cdp.send('Page.navigate', { url }); await sleep(4000); };
  const log = async (label, expr) => console.log(`${label}:`, JSON.stringify(await js(expr)));
  const until = async (expr, ms = 30000) => {
    for (let t = 0; t < ms; t += 250) { if (await js(expr)) return true; await sleep(250); }
    return false;
  };
  const clickSel = (sel) => js(`(() => { const el = ${sel}; if (el) el.click(); return !!el; })()`);
  const fill = (date, time) => js(`(() => {
    const set = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    set(document.querySelector('#mirror-date'), ${JSON.stringify(date)});
    if (${JSON.stringify(time)}) set(document.querySelector('#mirror-time'), ${JSON.stringify(time)});
    set(document.querySelector('#mirror-gender'), 'female');
  })()`);
  const create = async () => {
    await clickSel(`document.querySelector('button[type="submit"]')`);
    await until(`location.pathname.startsWith('/r/') && !document.querySelector('[data-prose-skeleton][aria-busy]')`);
    await sleep(1500);
    return js('location.pathname.split("/")[2]');
  };
  // The Bagan block: scrolled to, and what it holds. Konsepsi is looked for by its name,
  // its caption element, and the glossary caption's opening words.
  const bagan = async (label, file) => {
    await js(`(() => { const e = [...document.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Bagan Kelahiran')); if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 70); })()`);
    await sleep(1500);
    await log(label, `({ intro: [...document.querySelectorAll('p')].map((p) => p.textContent).find((t) => t.startsWith('Empat')),
      pillars: [...document.querySelectorAll('div')].filter((d) => /^PILAR /i.test(d.textContent) && d.children.length === 0).map((d) => d.textContent),
      konsepsi: /pilar konsepsi/i.test(document.body.innerText),
      caption: !!document.querySelector('[data-conception-caption]') || document.body.innerText.includes('Dihitung dari perkiraan masa pembuahan'),
      hourMissing: document.querySelector('[data-hour-missing]')?.innerText ?? null })`);
    await shot(file);
  };
  const ARRIVAL = `({ path: location.pathname + location.search,
    resumeCard: !!document.querySelector('[data-resume-card]'),
    bukaBacaanku: document.body.innerText.includes('Buka bacaanku'),
    remembered: (() => { try { return !!localStorage.getItem('katon.last-reading.v1'); } catch { return 'throws'; } })(),
    date: document.querySelector('#mirror-date')?.value, gender: document.querySelector('#mirror-gender')?.value,
    marked: document.querySelector('#mirror-time')?.hasAttribute('data-focus-target'),
    scrollY, viewport: innerWidth + 'x' + innerHeight,
    hourTop: Math.round(document.querySelector('#mirror-time').getBoundingClientRect().top),
    hourBottom: Math.round(document.querySelector('#mirror-time').getBoundingClientRect().bottom) })`;

  // ── 1. A reading with NO hour, through the form ──
  await go(`${BASE}/`);
  await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
  await go(`${BASE}/`);
  await fill('1989-09-13', '');
  const noHourToken = await create();
  console.log(`reading without hour ${noHourToken}`);
  await bagan('bagan, no hour', 'bagan-no-hour-375.png');

  // ── 2. H3, the arrival ──
  if (!await clickSel(`document.querySelector('[data-hour-missing] a')`)) throw new Error('no H3 link');
  await until(`location.pathname === '/' && !!document.querySelector('#mirror-date')`, 8000);
  await sleep(2500);
  await js('window.scrollTo(0, 0)');
  await sleep(500);
  await log('H3 arrival at 375x812', ARRIVAL);
  await shot('h3-arrival-no-card-375x812.png');
  await viewport(667);
  await sleep(800);
  await js('window.scrollTo(0, 0)');
  await log('H3 arrival at 375x667', ARRIVAL);
  await shot('h3-arrival-no-card-375x667.png');
  await viewport(812);

  // A later, plain visit to `/`: the memory was kept, so the card is back.
  await go(`${BASE}/`);
  await sleep(1500);
  await log('plain visit to / afterwards', `({ path: location.pathname + location.search, resumeCard: !!document.querySelector('[data-resume-card]'),
    hourTop: Math.round(document.querySelector('#mirror-time').getBoundingClientRect().top) })`);
  await shot('front-door-card-after-arrival-375.png');

  // ── 3. A reading WITH an hour ──
  await fill('1989-09-13', '09:00');
  const hourToken = await create();
  console.log(`reading with hour ${hourToken}`);
  await bagan('bagan, with hour', 'bagan-with-hour-375.png');
} finally {
  chrome.kill();
}

// ── 4. The Complete Edition's chart page, from the floor ──
const { calculateBaziChart } = await import('../lib/bazi/buildChart.js');
const { buildSemanticJson } = await import('../lib/semantic/index.js');
const { assembleFallback } = await import('../lib/render/fallback.js');
const { buildCompleteEditionPdf, CHART_HEADING } = await import('../lib/pdf/build.js');
const { pageTexts } = await import('../lib/pdf/inspect.js');
const { rasterPages } = await import('../lib/pdf/raster.js');

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const sj = buildSemanticJson(chart);
const ce = await buildCompleteEditionPdf({ chart, semanticJson: sj, rendered: { ...assembleFallback(sj), prompt_version: 'floor', stage6_version: 'floor' }, gender: 'female' });
const texts = pageTexts(ce.buffer);
const n = texts.findIndex((t) => t.includes(CHART_HEADING) && /pilar diri/i.test(t)) + 1;
const cp = chart.conceptionPalace;
console.log('CE chart page:', JSON.stringify({ page: n, of: texts.length, konsepsi: /pilar konsepsi/i.test(texts[n - 1]), han: texts[n - 1].includes(`${cp.stem}${cp.branch}`), conception: `${cp.stem}${cp.branch}` }));
const [png] = (await rasterPages(ce.buffer, { dpi: 110 })).filter((p) => p.page === n);
writeFileSync(path.join(OUT, `ce-chart-page-${String(n).padStart(2, '0')}.png`), png.png());
console.log(`wrote ce-chart-page-${String(n).padStart(2, '0')}.png`);
