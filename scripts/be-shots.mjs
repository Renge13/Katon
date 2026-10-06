#!/usr/bin/env node
// ============================================================
// scripts/be-shots.mjs — Prompt BE §3 and §4 at 375px, in headless Chrome
// ============================================================
//   node scripts/be-shots.mjs <base-url> <out-dir>
//   e.g. node scripts/be-shots.mjs http://localhost:3002 docs/qa/2026-10-06-be-site
//
// Against a LOCAL dev server with PAYMENTS_PROVIDER=mock (the in-memory store; no Supabase,
// no Gemini - the reading is the floor). Headless Chrome, because the in-app browser pane was
// hidden and a hidden document runs no IntersectionObserver - the bar could not be shown there.
//   1. §4  a new reading, the offer scrolled into view once, then the page scrolled to the top:
//          the pay bar at the bottom of the screen (bar-after-offer-seen-375.png); plus the
//          same reading BEFORE the offer was reached (no-bar-before-offer-375.png).
//   2. §3  the reading marked paid through the mock door, then opened with ?bayar=selesai:
//          the page lands on the card and download section (landing-after-paid-375.png).
// Viewport 375x812, device scale 2, mobile emulation. Nothing here asserts; the tests do.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, OUT] = process.argv.slice(2);
if (!BASE || !OUT) { console.error('usage: node scripts/be-shots.mjs <base-url> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9333;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-be-shots-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  const js = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(OUT, name), Buffer.from(data, 'base64'));
    console.log(`wrote ${name}`);
  };
  const go = async (url) => { await cdp.send('Page.navigate', { url }); await sleep(3500); };

  // A fresh reading, created the way the funnel creates one.
  await go(`${BASE}/`);
  const token = await js(`fetch('/api/mirror', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate: '1989-09-13', birthTime: '09:00', termSide: null, gender: 'female' }) })
    .then((r) => r.json()).then(async (c) => { await fetch('/api/mirror/' + c.token); return c.token; })`);
  console.log(`reading ${token}`);

  // §4: before the offer has been seen - no bar.
  await go(`${BASE}/r/${token}`);
  console.log('before:', JSON.stringify(await js(`({ bar: !!document.querySelector('[data-pay-bar]'), panel: !!document.querySelector('[data-offer-panel]') })`)));
  await shot('no-bar-before-offer-375.png');

  // §4: the offer scrolled into view once, then back to the top - the bar.
  await js(`document.querySelector('[data-offer-panel]').scrollIntoView({ block: 'center' })`);
  await sleep(1500);
  console.log('at offer:', JSON.stringify(await js(`({ bar: !!document.querySelector('[data-pay-bar]'), seen: localStorage.getItem('katon:offer-seen:${token}') })`)));
  await js('window.scrollTo(0, 0)');
  await sleep(1500);
  console.log('at top:', JSON.stringify(await js(`(() => { const b = document.querySelector('[data-pay-bar]'); return { bar: !!b, rect: b && b.getBoundingClientRect().toJSON(), text: b && b.innerText }; })()`)));
  await shot('bar-after-offer-seen-375.png');

  // §3: paid through the mock door, then back from "checkout" with the marker.
  console.log('mock pay:', JSON.stringify(await js(`fetch('/api/mock-pay/${token}', { method: 'POST' }).then((r) => r.status)`)));
  await go(`${BASE}/r/${token}?bayar=selesai`);
  await sleep(2500);
  console.log('landed:', JSON.stringify(await js(`(() => { const u = document.getElementById('unduh'); return { unduh: !!u, top: u && Math.round(u.getBoundingClientRect().top), scrollY: Math.round(scrollY), bar: !!document.querySelector('[data-pay-bar]'), guide: document.body.innerText.includes('Pembayaran berhasil.') }; })()`)));
  await shot('landing-after-paid-375.png');
} finally {
  chrome.kill();
}
