// ============================================================
// tests/link-source.spec.mjs — the link code (?k=), its validators and the capture
// ============================================================
// Run: npm run test:link-source
//
// Prompt BM (Reyner, 2026-10-08). A tracked post carries `?k=<code>`; the first page
// load of a tab session records {k, ref, landing} in sessionStorage and takes `k` out
// of the address bar. The server re-validates with the SAME functions
// (lib/site/linkSource.js) before anything reaches `funnel_event.detail`; the route
// half is tests/link-source-route.spec.mjs.
//
// THE DATE CLAUSE IS THE ONE THAT MATTERS. `assertNoPii` (lib/analytics/events.js)
// throws on any \d{4}-\d{2}-\d{2} run in `detail`, and `recordEvent` swallows the
// throw, so a code like `th-2026-10-08` would silently drop the whole row. A bad code
// must cost the code, never the event.
//
// Each capture case builds its own jsdom window, so the URL, the referrer and the
// storage are the test's, not a shared global's.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import {
  SOURCE_KEY, cleanCode, cleanRef, cleanLanding, cleanSource, refFromReferrer, landingOf,
  captureSource, readSource, __resetLinkSourceForTest,
} from '../lib/site/linkSource.js';

// ── the validators (item 1 and item 2 of the prompt) ──

test('BM 1: the code validator accepts lowercase codes and refuses everything else', () => {
  for (const ok of ['th-arch1', 'ig1', 'a', '0', 'x'.repeat(24)]) assert.equal(cleanCode(ok), ok, ok);
  for (const bad of ['TH', 'Th-arch1', 'a b', 'x'.repeat(25), 'th-2026-10-08', '../x', '-th', '', 'th_1', null, undefined, 7, {}]) {
    assert.equal(cleanCode(bad), null, String(bad));
  }
});

test('BM 1: a date run anywhere in a code nulls it, whatever surrounds it', () => {
  assert.equal(cleanCode('2026-10-08'), null);
  assert.equal(cleanCode('th-2026-10-08-a'), null);
  // Not a date run: allowed.
  assert.equal(cleanCode('th-202610'), 'th-202610');
});

test('BM 2: ref is a hostname or null - never a path, never this site', () => {
  assert.equal(cleanRef('l.threads.com'), 'l.threads.com');
  assert.equal(cleanRef('L.Threads.COM'), 'l.threads.com', 'lowercased');
  assert.equal(cleanRef('l.threads.com/foo'), null, 'a path is refused');
  assert.equal(cleanRef('l.threads.com?x=1'), null, 'a query is refused');
  assert.equal(cleanRef('www.katon.app'), null);
  assert.equal(cleanRef('katon.app'), null);
  assert.equal(cleanRef('katon-eta.vercel.app'), null, 'a preview host is this site');
  assert.equal(cleanRef(''), null);
  assert.equal(cleanRef('a'.repeat(65)), null, '64 characters at most');
  // The same reason as the code's date clause: a host with a date run would drop the event.
  assert.equal(cleanRef('2026-10-08.example.com'), null);
});

test('BM 2: refFromReferrer keeps only the hostname of a referrer URL', () => {
  assert.equal(refFromReferrer('https://l.threads.com/l/?u=https%3A%2F%2Fkaton.app%2F%3Fk%3Dth-arch1'), 'l.threads.com');
  assert.equal(refFromReferrer('https://www.katon.app/r/abc'), null);
  assert.equal(refFromReferrer(''), null);
  assert.equal(refFromReferrer('not a url'), null);
});

test('BM 2: landing is the first path segment, mapped to a closed set, never a token', () => {
  assert.equal(landingOf('/'), 'home');
  assert.equal(landingOf(''), 'home');
  assert.equal(landingOf('/kompatibilitas'), 'kompatibilitas');
  assert.equal(landingOf('/kompatibilitas/FpzdJClI11-giquyEpZBA'), 'kompatibilitas');
  assert.equal(landingOf('/r/eJm6p6PjG8f_0eridE39x'), 'r');
  assert.equal(landingOf('/harga'), 'harga');
  assert.equal(landingOf('/tentang'), 'tentang');
  assert.equal(landingOf('/privasi'), 'privasi');
  assert.equal(landingOf('/syarat'), 'other');
  assert.equal(landingOf('/eJm6p6PjG8f_0eridE39x'), 'other');
  assert.equal(cleanLanding('r'), 'r');
  assert.equal(cleanLanding('r/eJm6p6PjG8f_0eridE39x'), null);
});

test('BM 4: cleanSource re-validates every field and never throws on junk', () => {
  assert.deepEqual(cleanSource({ k: 'th-arch1', ref: 'l.threads.com', landing: 'home' }),
    { k: 'th-arch1', ref: 'l.threads.com', landing: 'home' });
  assert.deepEqual(cleanSource({ k: 'th-2026-10-08', ref: 'x.com/a', landing: 'nope', extra: 'dropped' }),
    { k: null, ref: null, landing: null });
  for (const junk of [null, undefined, 'th-arch1', 42, [], { k: { a: 1 } }]) {
    assert.deepEqual(cleanSource(junk), { k: null, ref: null, landing: null }, JSON.stringify(junk));
  }
});

// ── the capture (items 2 and 3) ──

function page(url, referrer = '') {
  __resetLinkSourceForTest();
  return new JSDOM('<!doctype html><html><body></body></html>', { url, referrer: referrer || undefined });
}

test('BM 2+3: first load stores {k, ref, landing} and strips k, keeping every other param and the hash', () => {
  const dom = page('https://katon.app/?k=th-arch1&x=1#bagan', 'https://l.threads.com/l/');
  captureSource(dom.window);
  assert.equal(dom.window.location.pathname + dom.window.location.search + dom.window.location.hash, '/?x=1#bagan');
  assert.deepEqual(JSON.parse(dom.window.sessionStorage.getItem(SOURCE_KEY)),
    { k: 'th-arch1', ref: 'l.threads.com', landing: 'home' });
  assert.deepEqual(readSource(dom.window), { k: 'th-arch1', ref: 'l.threads.com', landing: 'home' });
});

test('BM 3: ?bayar=selesai survives the strip', () => {
  const dom = page('https://katon.app/r/tok?bayar=selesai&k=ig1');
  captureSource(dom.window);
  assert.equal(dom.window.location.search, '?bayar=selesai');
  assert.equal(readSource(dom.window).landing, 'r');
});

test('BM 3: a URL with no k is not rewritten at all', () => {
  const dom = page('https://katon.app/harga?x=a%20b');
  const before = dom.window.history.length;
  captureSource(dom.window);
  assert.equal(dom.window.location.search, '?x=a%20b', 'byte for byte');
  assert.equal(dom.window.history.length, before);
});

test('BM 3: an INVALID k is still stripped, and stored as null', () => {
  const dom = page('https://katon.app/?k=TH');
  captureSource(dom.window);
  assert.equal(dom.window.location.search, '');
  assert.equal(readSource(dom.window).k, null);
});

test('BM 2: first write wins - a later load in the same tab with another k does not overwrite', () => {
  const dom = page('https://katon.app/?k=th-arch1');
  captureSource(dom.window);
  // A new page load in the same tab: same sessionStorage, new URL, module state reset.
  __resetLinkSourceForTest();
  dom.reconfigure({ url: 'https://katon.app/kompatibilitas?k=other' });
  captureSource(dom.window);
  assert.equal(dom.window.location.search, '', 'the second code is still stripped from the bar');
  assert.deepEqual(readSource(dom.window), { k: 'th-arch1', ref: null, landing: 'home' });
});

test('BM 2: a first visit with no code is a first touch too, and a later code does not replace it', () => {
  const dom = page('https://katon.app/tentang');
  captureSource(dom.window);
  __resetLinkSourceForTest();
  dom.reconfigure({ url: 'https://katon.app/?k=th-arch1' });
  captureSource(dom.window);
  assert.deepEqual(readSource(dom.window), { k: null, ref: null, landing: 'tentang' });
});

test('BM 2: storage blocked - the value lives in the module for this page load, and nothing throws', () => {
  const dom = page('https://katon.app/kompatibilitas?k=ig1&y=2');
  const w = dom.window;
  const blocked = {
    location: w.location,
    document: w.document,
    history: w.history,
    get sessionStorage() { throw new Error('SecurityError: storage blocked'); },
  };
  assert.doesNotThrow(() => captureSource(blocked));
  assert.equal(w.location.search, '?y=2');
  assert.deepEqual(readSource(blocked), { k: 'ig1', ref: null, landing: 'kompatibilitas' });
});

test('BM 4: readSource re-validates what storage holds, so a tampered entry cannot carry a date', () => {
  const dom = page('https://katon.app/');
  dom.window.sessionStorage.setItem(SOURCE_KEY, JSON.stringify({ k: 'th-2026-10-08', ref: 'x', landing: 'home' }));
  assert.deepEqual(readSource(dom.window), { k: null, ref: 'x', landing: 'home' });
  dom.window.sessionStorage.setItem(SOURCE_KEY, '{not json');
  assert.equal(readSource(dom.window), null);
});
