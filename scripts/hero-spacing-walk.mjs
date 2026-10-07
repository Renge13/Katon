#!/usr/bin/env node
// ============================================================
// scripts/hero-spacing-walk.mjs — measure the hero and footer in a real browser
// ============================================================
//   node scripts/hero-spacing-walk.mjs <base-url> <label>
//   e.g. node scripts/hero-spacing-walk.mjs http://localhost:3001 before
//
// Prompt BK (Reyner, 2026-10-07, option B). Headless Chrome over CDP, the same
// pattern as scripts/measure-head-fit.mjs. For `/` and `/kompatibilitas` at
// 1440x900 and 375x812 it prints Cowork's table (header bottom, h1 top, CTA
// bottom, footer top, footer height, page height) and writes a full-page PNG per
// cell to docs/qa/2026-10-07-bk-spacing/<route>-<label>-<width>.png.
//
// THE NUMBERS COME FROM getBoundingClientRect ON THE RENDERED PAGE, never from the
// style objects - the prompt asks for the browser, and a style object is the
// description of the layout rather than the layout. Every `k-rise` animation is
// finished before measuring: it carries a translateY, and an unfinished one moves
// every box it wraps.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [BASE, LABEL] = process.argv.slice(2);
if (!BASE || !LABEL) {
  console.error('usage: node scripts/hero-spacing-walk.mjs <base-url> <label>');
  process.exit(2);
}
const OUT = 'docs/qa/2026-10-07-bk-spacing';
const PORT = 9227;
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

// Runs in the page. Absolute document coordinates, rounded to the pixel.
const MEASURE = `(() => {
  document.getAnimations().forEach((a) => { try { a.finish(); } catch {} });
  const sy = window.scrollY;
  const top = (el) => (el ? Math.round(el.getBoundingClientRect().top + sy) : null);
  const bot = (el) => (el ? Math.round(el.getBoundingClientRect().bottom + sy) : null);
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const h1 = document.querySelector('h1');
  const cta = document.querySelector('form button[type=submit]') || [...document.querySelectorAll('main button, button')].find((b) => !b.closest('header'));
  // LEAVES ONLY (no element children, plus links and buttons whole). A container's
  // box includes its own bottom padding, which is exactly the space being measured.
  const inner = [...document.querySelectorAll('body *')]
    .filter((el) => !el.closest('header') && !el.closest('footer') && !el.closest('script, style')
      && (el.children.length === 0 || el.matches('a, button')) && el.getBoundingClientRect().height > 0);
  const lastContentBottom = Math.max(...inner.map(bot));
  const op = [...footer.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Dioperasikan') && !d.textContent.includes('Kontak:'));
  const ct = [...footer.querySelectorAll('div')].find((d) => d.textContent.trim().startsWith('Kontak:'));
  return {
    vw: innerWidth, vh: innerHeight,
    headerBottom: bot(header), h1Top: top(h1), gap: top(h1) - bot(header),
    cta: cta ? cta.textContent.trim() : null, ctaBottom: bot(cta),
    lastContentBottom, footerTop: top(footer), contentToFooter: top(footer) - lastContentBottom,
    footerHeight: Math.round(footer.getBoundingClientRect().height),
    pageHeight: document.documentElement.scrollHeight,
    operatorTop: top(op), contactTop: top(ct), contactRight: ct ? Math.round(ct.getBoundingClientRect().right) : null,
  };
})()`;

const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false },
  { width: 375, height: 812, mobile: true },
];
const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/kompatibilitas', name: 'kompatibilitas' },
];

const profile = mkdtempSync(path.join(tmpdir(), 'bkwalk-'));
let chrome;
const rows = [];
try {
  if (!CHROME) throw new Error('no Chrome or Edge found');
  mkdirSync(OUT, { recursive: true });
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
  await cdp.send('Runtime.enable');

  for (const vp of VIEWPORTS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile,
    });
    for (const route of ROUTES) {
      await cdp.send('Page.navigate', { url: BASE + route.path });
      // Wait for the document, the web fonts and hydration to settle.
      for (let i = 0; i < 80; i += 1) {
        const { result } = await cdp.send('Runtime.evaluate', {
          expression: 'document.readyState === "complete" && document.fonts.status === "loaded" && !!document.querySelector("footer")',
          returnByValue: true,
        });
        if (result.value) break;
        await sleep(250);
      }
      await sleep(1500);
      const { result } = await cdp.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
      const m = result.value;
      rows.push({ route: route.path, viewport: `${vp.width}x${vp.height}`, ...m });

      // Full page, so the footer is in the picture whether or not the page scrolls.
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width, height: Math.max(vp.height, m.pageHeight), deviceScaleFactor: 1, mobile: vp.mobile,
      });
      await sleep(300);
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
      const file = path.join(OUT, `${route.name}-${LABEL}-${vp.width}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile,
      });
    }
  }
} finally {
  if (chrome) chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold it */ }
}

console.log(`label: ${LABEL}  base: ${BASE}`);
console.log('| route | viewport | header bottom | h1 top | gap | CTA bottom | last content bottom | footer top | content->footer | footer height | page height | operator top | contact top |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.route} | ${r.viewport} | ${r.headerBottom} | ${r.h1Top} | ${r.gap} | ${r.ctaBottom} (${r.cta}) | ${r.lastContentBottom} | ${r.footerTop} | ${r.contentToFooter} | ${r.footerHeight} | ${r.pageHeight}${r.pageHeight > r.vh ? ` (scrolls ${r.pageHeight - r.vh})` : ''} | ${r.operatorTop} | ${r.contactTop} |`);
}
