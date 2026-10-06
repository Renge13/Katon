// §3a diagnostic: after the H3 arrival, is the hour select focused, and does :focus paint?
// Run from the repo root against local dev: node docs/qa/2026-10-06-bf-amendment-1/focus-diag.mjs http://localhost:3002
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const BASE = process.argv[2] || 'http://localhost:3002';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => existsSync(p));
const PORT = 9335;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(path.join(tmpdir(), 'katon-focus-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

async function target() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
      const p = list.find((t) => t.type === 'page');
      if (p) return p.webSocketDebuggerUrl;
    } catch { /* not up */ }
    await sleep(250);
  }
  throw new Error('no devtools');
}

try {
  const ws = new WebSocket(await target());
  await new Promise((r) => { ws.onopen = r; });
  let id = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result.value;
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

  const PROBE = `(() => { const s = document.querySelector('#mirror-time'); const cs = s && getComputedStyle(s);
    return { active: document.activeElement?.id || document.activeElement?.tagName, hasFocus: document.hasFocus(),
      matchesFocus: s?.matches(':focus'), border: cs?.borderColor, shadow: cs?.boxShadow, marked: s?.getAttribute('data-focus-target') ?? null }; })()`;

  for (const emulate of [false, true]) {
    await send('Emulation.setFocusEmulationEnabled', { enabled: emulate });
    await send('Page.navigate', { url: `${BASE}/` }); await sleep(3000);
    await js(`sessionStorage.setItem('katon.carry-birth.v1', JSON.stringify({ date: '1989-09-13', time: '', gender: 'female' }))`);
    await send('Page.navigate', { url: `${BASE}/?jam=tambah` }); await sleep(4000);
    console.log(`focus emulation ${emulate ? 'ON ' : 'OFF'}:`, JSON.stringify(await js(PROBE)));
  }
} finally { chrome.kill(); }
