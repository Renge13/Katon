// ============================================================
// tests/favicon.spec.mjs — the built home page names a tab icon that resolves
// ============================================================
// Prompt BO §1 (Reyner, 2026-10-12: "Yes, add the favicon"). Until then katon.app
// had no tab icon: no `app/icon.*`, `app/apple-icon.*` or `app/favicon.ico`,
// nothing in `app/layout.js` metadata, and a leftover `public/favicon.svg` (a
// purple lightning bolt) that no page linked to.
//
// ── WHY IT BUILDS, AND WHY INTO ITS OWN DIRECTORY ─────────
// An icon is a fact about the SERVED `<head>`, not about a file in `app/`. Next's
// file convention decides whether `app/icon.svg` becomes a `<link rel="icon">`,
// what URL it is served at, and with which content type. Asserting that the file
// exists would pass on a misnamed file Next ignores. So this runs `next build` and
// `next start` and fetches `/` the way a browser does.
//
// The build goes to `.next/favicon-test` (via KATON_DIST_DIR, read once in
// next.config.mjs), never `.next`. Reusing `.next` would mean testing whatever was
// built last - the stale-bundle trap in docs/COWORK-BRIEF.md section 4 - and would
// overwrite the bundle a running `next dev` is serving. The directory is inside
// `.next`, so it is already gitignored and eslint-ignored, and it is removed after.
//
// ── WHAT "RESOLVES TO AN IMAGE" MEANS HERE ────────────────
// Status 200 and an `image/*` content type are not enough: an HTML error page
// served with the wrong header, or an empty body, would pass both. Each icon's
// first bytes must also be the signature of the format its content type claims
// (SVG markup, PNG, ICO). That is the check a broken file cannot pass.
//
// Red first: shown failing on main (`16b5157`) before any icon file existed.
// The run is in the commit message.
// ============================================================

import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const NEXT_BIN = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
const DIST_DIR = path.join('.next', 'favicon-test');
const ENV = { ...process.env, KATON_DIST_DIR: DIST_DIR, NEXT_TELEMETRY_DISABLED: '1' };

let server;
let base;
let headHtml;

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, ms) {
  const until = Date.now() + ms;
  let last;
  while (Date.now() < until) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      last = `status ${res.status}`;
    } catch (err) {
      last = err.message;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`next start never answered ${url} (${last})`);
}

before(async () => {
  const build = spawnSync(process.execPath, [NEXT_BIN, 'build'], {
    cwd: ROOT, env: ENV, encoding: 'utf8',
  });
  assert.equal(build.status, 0,
    `next build failed:\n${(build.stdout || '').slice(-2000)}\n${(build.stderr || '').slice(-2000)}`);

  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [NEXT_BIN, 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd: ROOT, env: ENV, stdio: 'ignore',
  });
  const home = await waitForServer(`${base}/`, 60_000);
  const html = await home.text();
  const open = html.indexOf('<head');
  const close = html.indexOf('</head>');
  assert.ok(open !== -1 && close > open, 'the home page has no <head> element');
  headHtml = html.slice(open, close);
}, { timeout: 300_000 });

after(() => {
  if (server) server.kill();
  rmSync(path.join(ROOT, DIST_DIR), { recursive: true, force: true });
});

/** Every `<link>` in the head whose rel names an icon, with its attributes. */
function iconLinks(head) {
  const links = [];
  for (const [tag] of head.matchAll(/<link\b[^>]*>/giu)) {
    const attrs = {};
    for (const [, name, value] of tag.matchAll(/([a-z-]+)="([^"]*)"/giu)) attrs[name.toLowerCase()] = value;
    if (/\bicon\b/iu.test(attrs.rel || '')) links.push(attrs);
  }
  return links;
}

/** The format a body's first bytes prove, independent of any header. */
function sniff(buf) {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length >= 4 && buf.subarray(0, 4).equals(Buffer.from([0x00, 0x00, 0x01, 0x00]))) return 'ico';
  const text = buf.subarray(0, 200).toString('utf8').trimStart();
  if (/^(<\?xml[^>]*>\s*)?<svg\b/iu.test(text)) return 'svg';
  return 'unknown';
}

const EXPECTED_FORMAT = { 'image/svg+xml': 'svg', 'image/png': 'png', 'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico' };

async function fetchImage(href) {
  const res = await fetch(new URL(href, base));
  const type = (res.headers.get('content-type') || '').split(';')[0].trim();
  const body = Buffer.from(await res.arrayBuffer());
  return { status: res.status, type, body, format: sniff(body) };
}

function assertImage(img, href) {
  assert.equal(img.status, 200, `${href} answered ${img.status}`);
  assert.ok(img.type.startsWith('image/'), `${href} is served as "${img.type}", not an image`);
  assert.ok(img.body.length > 0, `${href} has an empty body`);
  assert.equal(img.format, EXPECTED_FORMAT[img.type],
    `${href} claims ${img.type} but its first bytes read as ${img.format}`);
}

test('THE BUILT HOME PAGE NAMES A TAB ICON, AND IT RESOLVES TO AN IMAGE', async () => {
  const icons = iconLinks(headHtml).filter((l) => /(^|\s)icon(\s|$)/iu.test(l.rel));
  assert.ok(icons.length > 0,
    'the served <head> of / carries no <link rel="icon">, so the browser tab has no icon');
  for (const link of icons) assertImage(await fetchImage(link.href), link.href);
});

test('THE SVG MARK IS LINKED, so modern browsers use the vector rather than the .ico', async () => {
  const svg = iconLinks(headHtml).find((l) => l.type === 'image/svg+xml');
  assert.ok(svg, 'no <link rel="icon" type="image/svg+xml"> in the head - app/icon.svg is missing or ignored');
  assertImage(await fetchImage(svg.href), svg.href);
});

test('THE APPLE TOUCH ICON IS LINKED, A PNG, 180x180', async () => {
  const apple = iconLinks(headHtml).find((l) => l.rel === 'apple-touch-icon');
  assert.ok(apple, 'no <link rel="apple-touch-icon"> in the head');
  const img = await fetchImage(apple.href);
  assertImage(img, apple.href);
  assert.equal(img.format, 'png');
  // IHDR: width and height are the big-endian u32s at bytes 16 and 20.
  assert.deepEqual([img.body.readUInt32BE(16), img.body.readUInt32BE(20)], [180, 180],
    'the apple touch icon is not 180x180');
});

test('/favicon.ico RESOLVES, WITH 16x16 AND 32x32 INSIDE (crawlers ask for it by path)', async () => {
  const img = await fetchImage('/favicon.ico');
  assertImage(img, '/favicon.ico');
  // ICONDIR: u16 count at byte 4, then 16-byte entries; width/height bytes, 0 = 256.
  const count = img.body.readUInt16LE(4);
  const sizes = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16;
    sizes.push(`${img.body[at] || 256}x${img.body[at + 1] || 256}`);
  }
  assert.deepEqual(sizes.sort(), ['16x16', '32x32'], `favicon.ico holds ${sizes.join(', ') || 'nothing'}`);
});

test('THE MARK USES THE CURRENT --kertas AND --clay, read from app/globals.css', () => {
  const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
  const token = (name) => {
    const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'iu'));
    assert.ok(m, `app/globals.css defines no --${name}`);
    return m[1].toLowerCase();
  };
  const svg = readFileSync(path.join(ROOT, 'app', 'icon.svg'), 'utf8').toLowerCase();
  for (const name of ['kertas', 'clay']) {
    assert.ok(svg.includes(token(name)), `app/icon.svg does not use --${name} (${token(name)})`);
  }
});
