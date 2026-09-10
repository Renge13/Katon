// ============================================================
// tests/site-header.spec.mjs — the header is on every route
// ============================================================
// Y-2 ruling 1 (persistent header, whole site) and ruling 5 (chrome applies to
// the whole site). The prompt's own instruction for this test is "walk the route
// table, not a list", and that is the only shape that can catch the failure
// worth catching: a NEW route added months from now that nobody thought about.
// A hard-coded list of nine pages would pass forever while route ten shipped
// bare.
//
// ── WHAT ACTUALLY GUARANTEES IT, AND WHAT THIS ASSERTS ─────
// The header is mounted in `app/layout.js`, so coverage is not a property of
// each page - it is a property of there being exactly ONE layout above them all.
// A nested `app/<seg>/layout.js` would shadow the root for its subtree and
// silently drop the header from those routes, which is a Next.js behaviour no
// amount of reading the pages would reveal. So the walk asserts the invariant
// that makes the mount total, rather than grepping nine files for a component
// name none of them contain.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { CHROME_COPY } from '../lib/site/copy.js';
import { isCurrent, NAV_HREFS } from '../lib/site/nav.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const APP = path.join(ROOT, 'app');

/** Every `page.js` under app/, and every `layout.js`, by repo-relative path. */
function routeTable() {
  const pages = [];
  const layouts = [];
  const walk = (dir) => {
    for (const it of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, it.name);
      // `app/api` holds route handlers, not pages, and renders no chrome.
      if (it.isDirectory()) {
        if (path.relative(APP, full) !== 'api') walk(full);
      } else if (it.name === 'page.js' || it.name === 'page.jsx') {
        pages.push(path.relative(ROOT, full).replace(/\\/gu, '/'));
      } else if (it.name === 'layout.js' || it.name === 'layout.jsx') {
        layouts.push(path.relative(ROOT, full).replace(/\\/gu, '/'));
      }
    }
  };
  walk(APP);
  return { pages, layouts };
}

test('EVERY ROUTE IS UNDER THE ONE LAYOUT THAT MOUNTS THE HEADER', () => {
  const { pages, layouts } = routeTable();

  assert.ok(pages.length >= 8,
    `the walk found only ${pages.length} pages, which is too few to be right - `
    + 'it has stopped seeing the route table');

  // THE INVARIANT. One layout, and it is the root. A nested layout is not
  // forbidden forever - it is forbidden SILENTLY, and this is the noise.
  assert.deepEqual(layouts, ['app/layout.js'],
    'a second layout.js exists. Next.js nests layouts, so the routes under it render '
    + 'ITS tree - confirm SiteHeader is still above them, then widen this assertion.');

  const layout = readFileSync(path.join(ROOT, 'app', 'layout.js'), 'utf8');
  assert.match(layout, /import SiteHeader from '@\/components\/SiteHeader\.jsx'/u);
  assert.match(layout, /<SiteHeader \/>/u, 'the root layout renders the header');
  assert.match(layout, /<SiteFooter \/>/u, 'and still renders the footer');
});

test('THE HEADER NAMES BOTH PRODUCTS, FROM THE BANK', () => {
  const src = readFileSync(path.join(ROOT, 'components', 'SiteHeader.jsx'), 'utf8');

  // Read from CHROME_COPY, never typed into the component. A nav label retyped
  // in JSX is a second source of truth for a string Reyner amends in place.
  assert.match(src, /CHROME_COPY\.nav_mirror/u);
  assert.match(src, /CHROME_COPY\.nav_compat/u);
  assert.equal(src.includes(`'${CHROME_COPY.nav_mirror}'`), false,
    'a nav label is typed as a literal in the component as well as read from the bank');

  // The hrefs come from the same pure module the rule does, so neither the URL
  // nor the label is typed into the JSX.
  assert.match(src, /NAV_HREFS\.mirror/u);
  assert.match(src, /NAV_HREFS\.compat/u);
  assert.deepEqual(NAV_HREFS, { mirror: '/', compat: '/kompatibilitas' });
});

test('THE CURRENT ROUTE IS MARKED, AND / DOES NOT MARK EVERYTHING', () => {
  // ── THE BUG THIS EXISTS FOR ────────────────────────────────
  // `pathname.startsWith('/')` is true of every path in the site. A prefix rule
  // applied to the root marks BOTH links on every page, which looks like a
  // styling glitch and is actually the nav lying about where you are. So `/` is
  // an exact match and everything else is a prefix match.
  assert.equal(isCurrent('/', '/'), true);
  assert.equal(isCurrent('/kompatibilitas', '/'), false, '/ must not match a deeper route');
  assert.equal(isCurrent('/privasi', '/'), false);

  // And compat stays marked inside the paid report, which is a route the reader
  // can sit on for a long time.
  assert.equal(isCurrent('/kompatibilitas', '/kompatibilitas'), true);
  assert.equal(isCurrent('/kompatibilitas/abc123', '/kompatibilitas'), true);
  assert.equal(isCurrent('/r/tok', '/kompatibilitas'), false);

  // Not a prefix of a DIFFERENT segment that merely starts the same way.
  assert.equal(isCurrent('/kompatibilitas-lain', '/kompatibilitas'), false);
});

// ── THE LOGOMARK (Y-2b item 1) ─────────────────────────────

test('THE HEADER CARRIES THE LOGOMARK, AND THE PAGE CARRIES NO SECOND ONE', () => {
  // ── REYNER'S RULING ────────────────────────────────────────
  // "Replace the KATON.APP wordmark top-left of SiteHeader with the circle
  // logomark (the orange dot + KATON that the home hero currently shows as its
  // first line). REMOVE that hero logomark line from the home page. One
  // logomark on the page, in the header."
  //
  // Asserted on source rather than by mounting, because `SiteHeader` imports
  // `next/link`, which the plain node runner cannot resolve. The rendered proof
  // is a screenshot on the Vercel preview, in the PR body.
  const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//gu, '').replace(/^\s*\/\/.*$/gmu, '');
  const header = strip(readFileSync(new URL('../components/SiteHeader.jsx', import.meta.url), 'utf8'));
  const funnel = strip(readFileSync(new URL('../components/Funnel.jsx', import.meta.url), 'utf8'));

  // The mark: an orange dot beside letterspaced KATON. The dot is the logomark;
  // `KATON.APP` was type alone and is what this replaces.
  assert.match(header, /borderRadius: '50%'/u, 'the header draws the circle');
  assert.match(header, /var\(--clay\)/u, 'in the accent it has always been');
  assert.match(header, />KATON</u, 'beside the name');
  assert.equal(header.includes('KATON.APP'), false,
    'the wordmark it replaces must be gone, not sitting beside it');

  // ONE ON THE PAGE. The funnel keeps no logomark of its own: the header is on
  // every route now, so any mark inside a page is a second one.
  assert.equal(funnel.includes('Wordmark'), false,
    'the funnel still renders a logomark; with the header there, that is two');
});
