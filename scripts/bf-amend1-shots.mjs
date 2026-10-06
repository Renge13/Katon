#!/usr/bin/env node
// ============================================================
// scripts/bf-amend1-shots.mjs — Prompt BF amendment 1 at 375px, headless Chrome
// ============================================================
//   node scripts/bf-amend1-shots.mjs <base-url> <out-dir> <label>
//
// The bf-shots harness, cut to amendment 1's three changes: the one hint under the
// hour field (front door and compat form), the end of the reading (run once with
// compat closed and once with it open; <label> names which), and the hour field
// after "Tambahkan jam lahir". Each step logs what the page holds.
//
// FOCUS EMULATION IS OFF, ON PURPOSE. A headless window has no focus, so `:focus`
// never matches - the same failure iOS Safari produces by ignoring focus(). The H3
// shot must show the mark painting the ring WITHOUT focus, so the run that proves it
// is the one where focus cannot help.
//
// Point it at local dev with GEMINI_API_KEY unset: the reading is the FLOOR.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT, LABEL = 'run'] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/bf-amend1-shots.mjs <base-url> <out-dir> <label>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9336;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-bf-amend1-'));
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
  const HINTS = `({ path: location.pathname,
    hourFields: document.querySelectorAll('select[id$="-time"]').length,
    hints: [...document.querySelectorAll('[data-hour-hint]')].map((h) => h.textContent),
    oldLine: document.body.innerText.includes('Tanpa jam tetap akurat') })`;
  const centerHour = () => js(`(() => { const s = document.querySelector('select[id$="-time"]'); if (s) s.scrollIntoView({ block: 'center' }); return !!s; })()`);

  // ── 1. The front door: one hint ──
  await go(`${BASE}/`);
  await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
  await go(`${BASE}/`);
  await log('front door', HINTS);
  await centerHour(); await sleep(1200);
  await shot(`front-door-one-hint-${LABEL}-375.png`);

  // ── 2. The compat form: one hint ──
  await go(`${BASE}/kompatibilitas`);
  await log('compat form', HINTS);
  await centerHour(); await sleep(1200);
  await shot(`compat-form-one-hint-${LABEL}-375.png`);

  // ── 3. A reading with no hour, and its end ──
  await go(`${BASE}/`);
  const token = await js(`fetch('/api/mirror', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate: '1989-09-13', birthTime: null, termSide: null, gender: 'female' }) })
    .then((r) => r.json()).then(async (c) => { await fetch('/api/mirror/' + c.token); return c.token; })`);
  console.log(`reading ${token}`);
  await go(`${BASE}/r/${token}`);
  await until(`!!document.querySelector('[data-next-block]')`, 15000);
  await js('window.scrollTo(0, document.body.scrollHeight)'); await sleep(1500);
  await log(`end (${LABEL})`, `({ links: [...document.querySelectorAll('[data-next-block] a')].map((a) => a.textContent.trim() + ' -> ' + a.getAttribute('href')),
    compatCard: document.body.innerText.includes('Mulai Bacaan Berdua') })`);
  await shot(`end-of-reading-${LABEL}-375.png`);

  // ── 4. "Tambahkan jam lahir": the hour field is the target ──
  await js(`window.scrollTo(0, 0)`);
  await js(`document.querySelector('[data-hour-missing] a').click()`);
  await until(`location.pathname === '/' && !!document.querySelector('#mirror-time')`, 10000);
  await sleep(2500);
  const FIELD = `(() => { const s = document.querySelector('#mirror-time'); const cs = getComputedStyle(s);
    return { path: location.pathname + location.search, date: document.querySelector('#mirror-date').value, time: s.value,
      active: document.activeElement?.id, windowFocused: document.hasFocus(), matchesFocus: s.matches(':focus'),
      marked: s.hasAttribute('data-focus-target'), border: cs.borderColor, ring: cs.boxShadow }; })()`;
  await log('H3 arrival', FIELD);
  await centerHour(); await sleep(800);
  await shot(`h3-arrival-marked-${LABEL}-375.png`);
  // Picking an hour removes the mark.
  await js(`(() => { const el = document.querySelector('#mirror-time');
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, '09:00');
    el.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await sleep(500);
  await log('after picking 09.00', FIELD);
} finally {
  chrome.kill();
}
