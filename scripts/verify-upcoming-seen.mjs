#!/usr/bin/env node
// ============================================================
// scripts/verify-upcoming-seen.mjs — the second denominator, observed firing
// ============================================================
//   npm run dev                      (in another terminal)
//   node scripts/verify-upcoming-seen.mjs
//   node scripts/verify-upcoming-seen.mjs --base http://localhost:3000 --keep
//
// Prompt Q commit 4 left ONE proposition unproven, and it is the one every
// September interest rate divides by.
//
// `upcoming_seen` fires from an IntersectionObserver rather than on mount,
// because prompt Q section 3 defines both interest rates as
// interest / `upcoming_seen` so that "a reader who never scrolled to the block
// never had the chance and must not sit in the denominator". The held-back half
// was easy to prove. THE FIRING HALF WAS NOT OBSERVED AT ALL: the agent browser
// pane runs with `document.visibilityState === "hidden"`, and a hidden tab never
// delivers an IntersectionObserver callback, so the check could not be made
// there and said nothing either way.
//
// An unobserved instrument is the failure this repo has a rule about. If the
// observer never fires, `upcoming_seen` is 0, both interest rates divide by zero,
// and the read-out prints `n/a` for the exact question September exists to ask -
// which looks like "nobody wanted either product" only if you do not look.
//
// ── WHY CDP AND NOT PUPPETEER ──
// No new dependency. Node 24 ships a global WebSocket, Chrome ships the DevTools
// Protocol, and this repo's scripts are deliberately dependency-free. Adding a
// ~150MB browser download to prove one callback would be the expensive way round.
//
// ── WHAT IT ASSERTS, AND BOTH HALVES ARE IN ONE RUN ──
//   1. visibilityState is "visible"   - or the whole run proves nothing
//   2. on load, at the top of a 375x812 viewport: NO `upcoming_seen`
//   3. after scrolling the block into view: `upcoming_seen`, exactly once
// One run, one page, so the two observations cannot come from different states.
// ============================================================

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// THE BANK, NOT A COPY OF IT. This harness originally hard-coded the placeholder
// text it searched for, and the moment Reyner ruled the eleven strings it stopped
// finding the block - a verification script that silently stops verifying. Reading
// the same object the component renders makes that drift impossible.
import { UPCOMING_COPY } from '../lib/site/copy.js';

const argv = process.argv.slice(2);
const flag = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const BASE = flag('base', 'http://localhost:3000');
const KEEP = argv.includes('--keep');
const PORT = Number(flag('port', '9222'));

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

function findChrome() {
  const found = CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) throw new Error(`no Chrome or Edge found. Tried:\n  ${CHROME_CANDIDATES.join('\n  ')}`);
  return found;
}

/** Minimal CDP client. One socket, id-matched replies, buffered events. */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = [];
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const { resolve, reject } = this.pending.get(m.id);
        this.pending.delete(m.id);
        return m.error ? reject(new Error(`${m.error.message}`)) : resolve(m.result);
      }
      for (const h of this.handlers) h(m);
      return undefined;
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

  on(fn) { this.handlers.push(fn); }

  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text ?? 'evaluate threw');
    return r.result?.value;
  }
}

async function waitForDevtools(port, tries = 60) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint never came up');
}

// ── run ──

const failures = [];
const check = (ok, label, detail = '') => {
  log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (!ok) failures.push(label);
};

const profile = mkdtempSync(path.join(tmpdir(), 'katon-cdp-'));
let chrome;

try {
  // A reading has to exist before the page can show one. Created through the real
  // route, so this is the same row a reader would get.
  const created = await fetch(`${BASE}/api/mirror`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ birthDate: '1989-02-04', birthTime: '04:00', gender: 'female' }),
  }).then((r) => r.json()).catch(() => null);

  if (!created?.token) throw new Error(`could not create a reading against ${BASE}. Is \`npm run dev\` running?`);
  log(`reading ${created.token} created via ${BASE}/api/mirror\n`);

  const bin = findChrome();
  log(`chrome  ${bin}`);
  chrome = spawn(bin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    'about:blank',
  ], { stdio: 'ignore' });

  const target = await waitForDevtools(PORT);
  const cdp = await CDP.connect(target.webSocketDebuggerUrl);

  // Every POST to the event endpoint, with its body, in order.
  const fired = [];
  cdp.on((m) => {
    if (m.method !== 'Network.requestWillBeSent') return;
    const { url, method, postData } = m.params.request;
    if (!url.includes('/event') || method !== 'POST') return;
    try { fired.push(JSON.parse(postData)); } catch { fired.push({ event: '<unparseable>', postData }); }
  });

  await cdp.send('Network.enable');
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  // The real target: a phone. On a desktop viewport the block could be on screen
  // at load, and then "it did not fire on mount" would be untestable.
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 375, height: 812, deviceScaleFactor: 2, mobile: true,
  });

  const loaded = new Promise((res) => cdp.on((m) => { if (m.method === 'Page.loadEventFired') res(); }));
  await cdp.send('Page.navigate', { url: `${BASE}/r/${created.token}` });
  await loaded;

  // Hydration, then the block in the DOM. Polled rather than slept at, so a slow
  // first compile does not turn into a false pass.
  let ready = false;
  for (let i = 0; i < 80 && !ready; i += 1) {
    ready = await cdp.eval(`!!document.body.innerText && !![...document.querySelectorAll('button')]
      .find(b => b.textContent.includes(${JSON.stringify(UPCOMING_COPY.interestCta)}))`);
    if (!ready) await sleep(250);
  }
  if (!ready) throw new Error('the upcoming block never rendered');

  log('\n-- 1. the run is capable of proving anything at all --');
  const vis = await cdp.eval('document.visibilityState');
  const hasIO = await cdp.eval("typeof IntersectionObserver === 'function'");
  check(vis === 'visible', 'document.visibilityState is "visible"', `got "${vis}"`);
  check(hasIO === true, 'IntersectionObserver exists');

  // Settle: give the observer every chance to fire wrongly before asserting it did not.
  await sleep(1200);

  const geom = await cdp.eval(`(() => {
    const el = [...document.querySelectorAll('div')].find(d => d.textContent.startsWith(${JSON.stringify(UPCOMING_COPY.eyebrow)}));
    const b = el.getBoundingClientRect();
    return JSON.stringify({ top: Math.round(b.top), h: Math.round(b.height), vh: window.innerHeight, scrollY: Math.round(window.scrollY) });
  })()`);

  log('\n-- 2. on mount, at the top of the page --');
  log(`  block geometry ${geom}`);
  const onMount = fired.filter((f) => f.event === 'upcoming_seen');
  check(onMount.length === 0,
    'upcoming_seen did NOT fire on mount',
    `saw ${fired.map((f) => f.event).join(', ') || 'no events'}`);
  check(fired.some((f) => f.event === 'offer_seen'),
    'offer_seen DID fire on mount (so the transport works)');

  log('\n-- 3. after scrolling the block into view --');
  // SNAPSHOTTED IMMEDIATELY BEFORE THE SCROLL, and the reason is not bookkeeping.
  // A check that only counts the total at the end passes on a build that fires on
  // MOUNT just as happily as on one that fires on SCROLL - the total is 1 either
  // way. That is the "passes whether the feature exists or not" shape, and this
  // file would have shipped with it if the neuter run had not been done. Pairing
  // before-and-after makes this check discriminate on its own.
  const beforeScroll = fired.filter((f) => f.event === 'upcoming_seen').length;
  await cdp.eval(`(() => {
    const el = [...document.querySelectorAll('div')].find(d => d.textContent.startsWith(${JSON.stringify(UPCOMING_COPY.eyebrow)}));
    el.scrollIntoView({ block: 'center' });
    return true;
  })()`);

  // Wait for the callback rather than assuming one frame is enough.
  for (let i = 0; i < 40 && !fired.some((f) => f.event === 'upcoming_seen'); i += 1) await sleep(100);

  const afterScroll = fired.filter((f) => f.event === 'upcoming_seen');
  check(beforeScroll === 0 && afterScroll.length === 1,
    'upcoming_seen was ABSENT before the scroll and present exactly once after',
    `before=${beforeScroll} after=${afterScroll.length}`);

  // Scrolling away and back must not fire a second time: the denominator counts
  // readers, and the ref plus the disconnect are what make that true client-side.
  await cdp.eval('window.scrollTo(0, 0); true');
  await sleep(400);
  await cdp.eval(`(() => {
    const el = [...document.querySelectorAll('div')].find(d => d.textContent.startsWith(${JSON.stringify(UPCOMING_COPY.eyebrow)}));
    el.scrollIntoView({ block: 'center' });
    return true;
  })()`);
  await sleep(800);
  check(fired.filter((f) => f.event === 'upcoming_seen').length === 1,
    'scrolling away and back does NOT fire it again',
    `count=${fired.filter((f) => f.event === 'upcoming_seen').length}`);

  log(`\nevent POSTs in order: ${fired.map((f) => f.event + (f.product ? `[${f.product}]` : '')).join(' -> ')}`);
} catch (err) {
  failures.push(err.message);
  console.error(`\nERROR: ${err.message}`);
} finally {
  if (chrome && !KEEP) chrome.kill();
  if (!KEEP) { try { rmSync(profile, { recursive: true, force: true }); } catch { /* windows lock */ } }
}

log(`\n${'='.repeat(56)}`);
if (failures.length) {
  log(`FAILED: ${failures.length}`);
  for (const f of failures) log(`  - ${f}`);
  process.exitCode = 1;
} else {
  log('ALL CHECKS PASSED - the observer was observed, in both directions.');
}
