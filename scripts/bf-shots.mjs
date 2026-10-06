#!/usr/bin/env node
// ============================================================
// scripts/bf-shots.mjs — Prompt BF's walk at 375px, in headless Chrome
// ============================================================
//   node scripts/bf-shots.mjs <base-url> <out-dir>
//
// The same harness as scripts/be-shots.mjs (CDP over a WebSocket, no dependency),
// and headless for the same reason: the in-app browser pane is hidden, and a
// hidden document runs no animation frames, so the reading's reveals never land.
//
// Walks Reyner's own path from 2026-10-06 through the real UI: the front door,
// a reading created by the form with NO hour, the Bagan block, the end of the
// reading, then /harga by the footer's client-side link and the browser's back
// button, then the header's "Bacaan Diri", R2, R3 and H3. Run against `main` and
// against the branch, it shows the back button before and after the fix. Each
// step prints what the page holds, so the shots are not the only evidence.
//
// Point it at local dev with GEMINI_API_KEY unset: the reading is the FLOOR, not a
// render, and that is what every prose shot here shows.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/bf-shots.mjs <base-url> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9334;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-bf-shots-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
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
  // What the page holds, in one line, for every step below.
  const STATE = `({
    path: location.pathname + location.search,
    form: !!document.querySelector('#mirror-date'),
    reading: document.body.innerText.includes('REFLEKSIMU') || document.body.innerText.includes('Refleksimu'),
    resume: !!document.querySelector('[data-resume-card]'),
    remembered: (() => { try { return localStorage.getItem('katon.last-reading.v1'); } catch { return 'throws'; } })(),
  })`;
  const center = (sel) => js(`(() => { const el = ${sel}; if (el) el.scrollIntoView({ block: 'center' }); return !!el; })()`);
  const clickSel = (sel) => js(`(() => { const el = ${sel}; if (el) el.click(); return !!el; })()`);
  const byText = (tag, text) => `[...document.querySelectorAll('${tag}')].find((e) => e.textContent.trim().startsWith(${JSON.stringify(text)}))`;

  // ── 1. The front door, nothing remembered ──
  await go(`${BASE}/`);
  await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
  await go(`${BASE}/`);
  await log('front door', STATE);
  await center(`document.querySelector('#mirror-time')`);
  await sleep(1200);
  await shot('front-door-h1-375.png');

  // ── 2. A reading through the form: date and gender, NO hour ──
  await js(`(() => {
    const set = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    set(document.querySelector('#mirror-date'), '1989-09-13');
    set(document.querySelector('#mirror-gender'), 'female');
  })()`);
  await clickSel(`document.querySelector('button[type="submit"]')`);
  await until(`location.pathname.startsWith('/r/') && !document.querySelector('[data-prose-skeleton][aria-busy]')`);
  await sleep(1500);
  const token = await js('location.pathname.split("/")[2]');
  console.log(`reading ${token}`);
  await log('after create', STATE);

  // ── 3. Bagan Kelahiran without an hour ──
  await js(`(() => { const e = ${byText('div', 'Bagan Kelahiran')}; if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 70); })()`);
  await sleep(1500);
  await log('bagan', `({ intro: [...document.querySelectorAll('p')].map((p) => p.textContent).find((t) => t.startsWith('Empat')),
    pillars: [...document.querySelectorAll('div')].filter((d) => /^PILAR /i.test(d.textContent) && d.children.length === 0).map((d) => d.textContent),
    hourMissing: document.querySelector('[data-hour-missing]')?.innerText ?? null,
    caption: document.querySelector('[data-conception-caption]')?.innerText ?? null })`);
  await shot('bagan-no-hour-375.png');

  // ── 4. The end of the free reading (compat closed on this server) ──
  await js('window.scrollTo(0, document.body.scrollHeight)');
  await sleep(1500);
  await log('end', `({ next: document.querySelector('[data-next-block]')?.innerText ?? null })`);
  await shot('end-of-reading-compat-closed-375.png');

  // ── 4b. In the same session: the header's "Bacaan Diri" straight from the reading, then back ──
  await clickSel(`document.querySelector('header nav a[href="/"]')`);
  await until(`location.pathname === '/'`, 8000);
  await sleep(2000);
  await log('in-session header Bacaan Diri', STATE);
  await js('history.back()');
  await sleep(3000);
  await log('in-session back', STATE);

  // ── 5. /harga by the footer's client-side link, then the browser's back button ──
  await clickSel(`document.querySelector('footer a[href="/harga"]')`);
  await until(`location.pathname === '/harga'`, 8000);
  await sleep(1500);
  await log('on /harga', STATE);
  await js('history.back()');
  await sleep(4000);
  await log('back from /harga', STATE);
  await js('window.scrollTo(0, 0)');
  await sleep(800);
  await shot('back-from-harga-375.png');

  // ── 6. The header's "Bacaan Diri" ──
  await clickSel(`document.querySelector('header nav a[href="/"]')`);
  await until(`location.pathname === '/'`, 8000);
  await sleep(2500);
  await log('header Bacaan Diri', STATE);
  await js('window.scrollTo(0, 0)');
  await shot('front-door-resume-card-375.png');

  // ── 7. R2 opens the reading; R3 forgets it ──
  if (await clickSel(byText('a', 'Buka bacaanku'))) {
    await until(`location.pathname.startsWith('/r/')`, 8000);
    await sleep(3000);
    await log('R2', STATE);
    await js('history.back()');
    await sleep(4000);
  }
  if (await clickSel(byText('button', 'Mulai bacaan baru'))) {
    await sleep(800);
    await log('R3', STATE);
  }

  // ── 8. H3 from the reading without an hour ──
  await go(`${BASE}/r/${token}`);
  await sleep(1500);
  if (await clickSel(`document.querySelector('[data-hour-missing] a')`)) {
    await until(`location.pathname === '/' && !!document.querySelector('#mirror-date')`, 8000);
    await sleep(2500);
    await log('H3 arrival', `({ path: location.pathname + location.search, date: document.querySelector('#mirror-date')?.value,
      gender: document.querySelector('#mirror-gender')?.value, time: document.querySelector('#mirror-time')?.value,
      focused: document.activeElement?.id })`);
    await center(`document.querySelector('#mirror-time')`);
    await sleep(800);
    await shot('h3-arrival-hour-focused-375.png');
  } else {
    console.log('H3: no link on this build');
  }
} finally {
  chrome.kill();
}
