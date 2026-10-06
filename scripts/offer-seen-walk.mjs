#!/usr/bin/env node
// ============================================================
// scripts/offer-seen-walk.mjs — when does the page post `offer_seen`, in a real browser
// ============================================================
//   node scripts/offer-seen-walk.mjs <base-url>
//
// Prompt BG §2.6, the client half. Headless Chrome (CDP over a WebSocket, the harness of
// scripts/bf-shots.mjs), with the Network domain on, so what is counted is the requests
// the page actually sent to /api/mirror/<token>/event with `offer_seen` in the body.
// The server half (one row per reading) is scripts/funnel-walk.mjs.
//
// Against local dev with PAYMENTS_PROVIDER=mock (the `katon-be-mock` launch config):
// a reading created through the form, then: at the top, scrolled to the offer, away and
// back, reloaded and scrolled again, then paid through the mock unlock and scrolled again.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE] = process.argv.slice(2);
if (!BASE) { console.error('usage: node scripts/offer-seen-walk.mjs <base-url>'); process.exit(2); }
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9336;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const offerPosts = [];

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Network.requestWillBeSent') {
        const r = m.params.request;
        if (r.method === 'POST' && /\/api\/mirror\/[^/]+\/event$/.test(r.url) && (r.postData || '').includes('"offer_seen"')) {
          offerPosts.push(r.url);
        }
      }
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-offer-seen-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  const js = async (expression) => {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const go = async (url) => { await cdp.send('Page.navigate', { url }); await sleep(4000); };
  const until = async (expr, ms = 30000) => {
    for (let t = 0; t < ms; t += 250) { if (await js(expr)) return true; await sleep(250); }
    return false;
  };
  const note = (label) => console.log(`${label.padEnd(52)} offer_seen posts so far: ${offerPosts.length}`);
  const toOffer = async () => { await js(`document.querySelector('[data-offer-panel]')?.scrollIntoView({ block: 'center' })`); await sleep(2000); };
  const toTop = async () => { await js('window.scrollTo(0, 0)'); await sleep(1500); };

  await go(`${BASE}/`);
  await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
  await go(`${BASE}/`);
  await js(`(() => {
    const set = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    set(document.querySelector('#mirror-date'), '1989-09-13');
    set(document.querySelector('#mirror-gender'), 'female');
  })()`);
  await js(`document.querySelector('button[type="submit"]').click()`);
  await until(`location.pathname.startsWith('/r/') && !document.querySelector('[data-prose-skeleton][aria-busy]')`);
  const token = await js('location.pathname.split("/")[2]');
  await toTop();
  await sleep(2000);
  console.log(`reading ${token}, offer panel on page: ${await js(`!!document.querySelector('[data-offer-panel]')`)}`);
  note('1. at the top of the reading, offer not reached');
  await toOffer();
  note('2. scrolled to the offer panel');
  await toTop(); await toOffer();
  note('3. away and back to the offer');
  await go(`${BASE}/r/${token}`); await toTop(); await sleep(1500);
  note('4. reloaded, at the top');
  await toOffer();
  note('5. reloaded, scrolled to the offer again');

  const paid = await js(`fetch('/api/mock-pay/${token}', { method: 'POST' }).then((r) => r.json())`);
  console.log(`   mock unlock: ${JSON.stringify(paid)}`);
  await go(`${BASE}/r/${token}`); await toTop(); await sleep(1500);
  await js(`document.querySelector('#unduh, [data-offer-panel]')?.scrollIntoView({ block: 'center' })`); await sleep(2000);
  note('6. paid, reloaded, scrolled to where the offer was');
} finally {
  chrome.kill();
}
