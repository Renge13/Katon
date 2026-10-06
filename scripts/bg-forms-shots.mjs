#!/usr/bin/env node
// ============================================================
// scripts/bg-forms-shots.mjs — Prompt BG PR 2 at 375px and desktop, in headless Chrome
// ============================================================
//   node scripts/bg-forms-shots.mjs <closed-base-url> <open-base-url> <out-dir>   (either base may be `skip`)
//
// The CDP harness of scripts/bf-shots.mjs. Two local dev servers: compat CLOSED
// (`katon-be-mock`) and compat OPEN (`katon-compat-mock`, COMPAT_SALES=open), both with
// mock payments and no Gemini, so every reading is the FLOOR.
//
// FOCUS IS EMULATED (Emulation.setFocusEmulationEnabled): a headless window has no focus,
// and Chrome matches neither :focus nor :focus-within in an unfocused document (Prompt BF
// amendment 1 §3a), so a "focused" shot without it would show the resting state.
//
//   §3/§4  front door at 375: empty, the year field focused, filled; the compat form's
//          step 1 at 375, filled, nickname included (compat open)
//   §5     Bagan without and with an hour, at 375 and at 1280
//   §6     /harga's compat card with compat closed; the header with compat open and closed
// Every step logs what the page holds, so the shots are not the only evidence.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [CLOSED, OPEN, OUT] = process.argv.slice(2);
if (!CLOSED || !OPEN || !OUT) { console.error('usage: node scripts/bg-forms-shots.mjs <closed-base> <open-base> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome']
  .find((p) => existsSync(p));
const PORT = 9337;
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

const profile = mkdtempSync(path.join(tmpdir(), 'katon-bg-forms-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

try {
  const cdp = await CDP.connect((await page(PORT)).webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  const size = (width, height) => cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile: width < 768 });
  await size(375, 812);
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
  const go = async (url) => { await cdp.send('Page.navigate', { url }); await sleep(4500); };
  const log = async (label, expr) => console.log(`${label}:`, JSON.stringify(await js(expr)));
  const until = async (expr, ms = 30000) => {
    for (let t = 0; t < ms; t += 250) { if (await js(expr)) return true; await sleep(250); }
    return false;
  };
  const SET = `const set = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
    const tick = () => new Promise((r) => setTimeout(r, 80));`;
  /**
   * Fill a BirthFields block by prefix: year, month, day, then hour and gender. Waits for
   * React to have HYDRATED the fields first (its props key on the element): a value set
   * on server-rendered DOM before that is never seen by the component.
   */
  const hydrated = (prefix) => until(`(() => { const el = document.querySelector('#${prefix}-year');
    return !!el && Object.keys(el).some((k) => k.startsWith('__reactProps')); })()`, 20000);
  const fill = async (prefix, v) => { if (!await hydrated(prefix)) throw new Error(`#${prefix}-year never hydrated`); return fillNow(prefix, v); };
  const fillNow = (prefix, { y, m, d, time = '', gender = 'female' }) => js(`(async () => { ${SET}
    const q = (part) => document.querySelector('#${prefix}-' + part);
    set(q('year'), '${y}'); await tick(); set(q('month'), '${m}'); await tick(); set(q('day'), '${d}'); await tick();
    if ('${time}') { set(q('time'), '${time}'); await tick(); }
    set(q('gender'), '${gender}'); await tick();
  })()`);
  const labels = (prefix) => `[...document.querySelectorAll('[id^="${prefix}-"]')].filter((el) => el.closest('[data-float]'))
    .map((el) => { const w = el.closest('[data-float]'); const l = w.querySelector('label'); const cs = getComputedStyle(l);
      return { id: el.id, label: l.textContent, filled: w.hasAttribute('data-filled'), labelPx: cs.fontSize, labelTop: cs.top }; })`;
  const toTopOf = (sel, offset = 80) => js(`(() => { const e = ${sel}; if (e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - ${offset}); return !!e; })()`);
  const bagan = `[...document.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Bagan Kelahiran'))`;

  // `skip` as the closed base runs only the compat-form section below: two dev servers
  // sharing one .next directory overwrite each other's chunks, so each runs alone.
  if (CLOSED !== 'skip') {
  // ── §3/§4: the front door's fields, empty / focused / filled ──
  await go(`${CLOSED}/`);
  await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
  await go(`${CLOSED}/`);
  await toTopOf(`document.querySelector('#mirror-date')`, 140);
  await sleep(800);
  await log('front door, empty', labels('mirror'));
  await shot('fields-empty-375.png');
  await js(`document.querySelector('#mirror-year').focus()`);
  await sleep(600);
  await log('year focused', `({ active: document.activeElement?.id, yearLabel: getComputedStyle(document.querySelector('label[for="mirror-year"]')).fontSize })`);
  await shot('fields-year-focused-375.png');
  await js('document.activeElement?.blur()');
  await fill('mirror', { y: '1989', m: '9', d: '13', time: '09:00' });
  await sleep(600);
  await log('front door, filled', `({ date: document.querySelector('#mirror-date').getAttribute('data-value'), fields: ${labels('mirror')} })`);
  await shot('fields-filled-375.png');

  // ── §5: Bagan, no hour then with an hour, 375 and desktop ──
  for (const [label, time] of [['no-hour', ''], ['with-hour', '09:00']]) {
    await size(375, 812);
    await go(`${CLOSED}/`);
    await js(`(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} })()`);
    await go(`${CLOSED}/`);
    await fill('mirror', { y: '1989', m: '9', d: '13', time });
    await js(`document.querySelector('button[type="submit"]').click()`);
    await until(`location.pathname.startsWith('/r/') && !document.querySelector('[data-prose-skeleton][aria-busy]')`);
    await sleep(1500);
    const token = await js('location.pathname.split("/")[2]');
    await toTopOf(bagan, 70);
    await sleep(1500);
    await log(`bagan ${label}`, `(() => { const grid = [...document.querySelectorAll('div')].find((d) => d.style.display === 'grid' && d.style.gridTemplateColumns.startsWith('repeat('));
      return { token: ${JSON.stringify('')} || location.pathname, cells: grid ? grid.children.length : null, columns: grid?.style.gridTemplateColumns,
        empty: document.querySelector('[data-pillar-empty]')?.innerText ?? null, h2: document.querySelector('[data-hour-missing]')?.innerText ?? null }; })()`);
    await shot(`bagan-${label}-375.png`);
    await size(1280, 900);
    await go(`${CLOSED}/r/${token}`);
    await toTopOf(bagan, 70);
    await sleep(1500);
    await shot(`bagan-${label}-desktop.png`);
  }
  await size(375, 812);

  // ── §6: /harga with compat closed; the header in both states ──
  await go(`${CLOSED}/harga`);
  await toTopOf(`[...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent === 'Bacaan Kompatibilitas')`, 40);
  await sleep(800);
  await log('/harga compat card, closed', `(() => { const n = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent === 'Bacaan Kompatibilitas');
    let card = n; while (card && !(card.innerText || '').includes('Rp')) card = card.parentElement; while (card && card.parentElement && !card.parentElement.innerText.includes('Bacaan Diri Gratis') && card.parentElement.innerText.length < 900) card = card.parentElement;
    return { text: card?.innerText, links: [...(card?.querySelectorAll('a') ?? [])].map((a) => a.getAttribute('href')) }; })()`);
  await shot('harga-compat-closed-375.png');
  await js('window.scrollTo(0, 0)'); await sleep(500);
  await log('header, compat closed', `[...document.querySelectorAll('header a')].map((a) => a.textContent + ' -> ' + a.getAttribute('href'))`);
  await shot('header-compat-closed-375.png');

  } // end of the CLOSED-server sections

  if (OPEN !== 'skip') {
  await go(`${OPEN}/`);
  await sleep(500);
  await log('header, compat open', `[...document.querySelectorAll('header a')].map((a) => a.textContent + ' -> ' + a.getAttribute('href'))`);
  await shot('header-compat-open-375.png');
  // ── §3/§4 on the compat form (open) ──
  await go(`${OPEN}/kompatibilitas`);
  await sleep(800);
  await fill('a', { y: '1990', m: '3', d: '4', time: '14:00' });
  await js(`(async () => { ${SET} set(document.querySelector('#a-nickname'), 'Sari'); await tick(); })()`);
  await toTopOf(`document.querySelector('#a-date')`, 120);
  await sleep(800);
  await log('compat step 1, filled', `({ date: document.querySelector('#a-date')?.getAttribute('data-value'), fields: ${labels('a')} })`);
  await shot('compat-step1-filled-375.png');
  } // end of the OPEN-server sections
} finally {
  chrome.kill();
}
