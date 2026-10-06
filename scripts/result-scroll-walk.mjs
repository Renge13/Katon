#!/usr/bin/env node
// ============================================================
// scripts/result-scroll-walk.mjs — does the reading open at its top? (Reyner, 2026-10-07)
// ============================================================
//   node scripts/result-scroll-walk.mjs <base-url> <out-dir> <label>
//
// Headless Chrome at 375x812 (the CDP harness of scripts/bf-shots.mjs). Fills the front
// door, scrolls the submit button into view the way a reader's thumb does, records
// scrollY, taps "Lihat Refleksiku", waits for /r/<token>, then records scrollY and where
// the reading's title (the 44px archetype name) sits, and shoots the screen. Local dev, no Gemini: the FLOOR.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT, LABEL = 'after'] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/result-scroll-walk.mjs <base-url> <out-dir> <label>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9338;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-scroll-'));
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
  const until = async (expr, ms = 30000) => {
    for (let t = 0; t < ms; t += 250) { if (await js(expr)) return true; await sleep(250); }
    return false;
  };
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
    set(document.querySelector('#mirror-time'), '09:00'); await tick();
  })()`);
  // To the bottom of the page: the button stays in view, from the offset a thumb leaves.
  await js('window.scrollTo(0, document.documentElement.scrollHeight)');
  await sleep(600);
  const before = await js('Math.round(scrollY)');
  console.log(`[${LABEL}] at the submit button: scrollY ${before}`);
  await js(`document.querySelector('button[type="submit"]').click()`);
  const TITLE = "[...document.querySelectorAll('div')].find((d) => d.style.fontSize === '44px')";
  await until(`location.pathname.startsWith('/r/') && !!(${TITLE})`);
  await sleep(2500);
  const after = await js(`(() => { const h = ${TITLE}; const r = h.getBoundingClientRect();
    return { path: location.pathname, scrollY: Math.round(scrollY), title: h.textContent, titleTop: Math.round(r.top),
      titleOnScreen: r.top >= 0 && r.bottom <= innerHeight }; })()`);
  console.log(`[${LABEL}] reading opened:`, JSON.stringify(after));
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(path.join(OUT, `reading-opened-${LABEL}-375.png`), Buffer.from(data, 'base64'));
  console.log(`[${LABEL}] wrote reading-opened-${LABEL}-375.png`);
} finally {
  chrome.kill();
}
