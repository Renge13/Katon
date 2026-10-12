// ============================================================
// tests/card-save.spec.mjs — "Simpan kartu" saves the card, by platform
// ============================================================
// Run: npm run test:card-save
//
// RULED BY REYNER 2026-10-12 on #216 (record: docs/prompts/S-share-sheet.md).
// The card button is "Simpan kartu" everywhere and it SAVES the image:
//   - Android and desktop: a direct download of the PNG. No share sheet, even
//     where the browser could open one (Android Chrome, macOS Safari).
//   - iPhone / iPad: the share sheet with the image FILE ONLY (no text, no
//     title). A web download on iOS lands in Files, not Photos; the sheet's
//     "Save Image" is the route into Photos.
//   - iOS / iPadOS is detected EXPLICITLY, not by feature support: iPadOS
//     reports as a Mac, so a touch-capable "Macintosh" is an iPad.
//   - `card_downloaded` fires as before, never on AbortError.
//
// Red first: shown failing on the branch head before the change (`eefb3b3`),
// where the button shared wherever files were shareable and sent text. The run is
// in the commit message.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildCardData } from '../lib/card/cardData.js';
import { ShareCardA } from '../components/Funnel.jsx';

const LABEL = 'Simpan kartu';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const chart = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '04:00' });
const DATA = buildCardData({ chart, semanticJson: buildSemanticJson(chart) });

const UA = {
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
  // iPadOS 13+ sends the desktop Safari string. Only the touch points tell them apart.
  mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
};

/**
 * One device: its user agent, its touch points, and a share sheet that ACCEPTS
 * files (the hard case: every device here could share, and only iOS may).
 */
function device({ ua, touch = 0, canShare = true, onShare } = {}) {
  const rec = { shared: [], downloads: [], events: [] };
  const prevFetch = globalThis.fetch;
  const prevCreate = document.createElement;
  Object.defineProperty(navigator, 'userAgent', { value: ua, configurable: true });
  Object.defineProperty(navigator, 'maxTouchPoints', { value: touch, configurable: true });
  Object.defineProperty(navigator, 'canShare', { value: () => canShare, configurable: true, writable: true });
  Object.defineProperty(navigator, 'share', {
    value: async (p) => { rec.shared.push(p); if (onShare) return onShare(p); return undefined; },
    configurable: true, writable: true,
  });
  document.createElement = function (tag, ...rest) {
    const el = prevCreate.call(document, tag, ...rest);
    if (tag === 'a') el.click = () => rec.downloads.push(el.download);
    return el;
  };
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/event')) rec.events.push(JSON.parse(init.body).event);
    return { ok: true, status: 200, json: async () => ({}) };
  };
  rec.restore = () => {
    for (const k of ['userAgent', 'maxTouchPoints', 'canShare', 'share']) delete navigator[k];
    document.createElement = prevCreate;
    globalThis.fetch = prevFetch;
  };
  return rec;
}

async function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => { root.render(React.createElement(ShareCardA, { data: DATA, token: 'tok', capture: async () => PNG })); });
  await act(async () => { await new Promise((r) => setTimeout(r, 5)); }); // the eager capture lands
  const button = () => [...host.querySelectorAll('button')][0];
  return {
    button,
    tap: async () => {
      await act(async () => { button().click(); });
      await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    },
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

async function tapOn(spec) {
  const d = device(spec);
  const ui = await mount();
  try {
    const label = ui.button().textContent.trim();
    await ui.tap();
    return { label, ...d };
  } finally { ui.unmount(); d.restore(); }
}

test('THE LABEL IS "Simpan kartu" ON EVERY PLATFORM', async () => {
  for (const spec of [{ ua: UA.android }, { ua: UA.iphone, touch: 5 }, { ua: UA.mac, touch: 5 }, { ua: UA.mac }, { ua: UA.windows, canShare: false }]) {
    const r = await tapOn(spec);
    assert.equal(r.label, LABEL, `label on ${spec.ua.slice(13, 40)}`);
  }
});

test('ANDROID: a direct download, and no share call even though the sheet accepts files', async () => {
  const r = await tapOn({ ua: UA.android, touch: 5 });
  assert.equal(r.shared.length, 0, `share() was called: ${JSON.stringify(r.shared)}`);
  assert.equal(r.downloads.length, 1);
  assert.match(r.downloads[0], /\.png$/u);
  assert.deepEqual(r.events, ['card_downloaded']);
});

test('iPHONE: the share sheet with the image file ONLY - no text, no title', async () => {
  const r = await tapOn({ ua: UA.iphone, touch: 5 });
  assert.equal(r.downloads.length, 0, 'iOS must not take the web download (it lands in Files)');
  assert.equal(r.shared.length, 1);
  assert.deepEqual(Object.keys(r.shared[0]), ['files'], `payload keys: ${Object.keys(r.shared[0])}`);
  assert.equal(r.shared[0].files.length, 1);
  assert.equal(r.shared[0].files[0].type, 'image/png');
  assert.deepEqual(r.events, ['card_downloaded']);
});

test('iPADOS REPORTS AS A MAC: a touch "Macintosh" is an iPad and gets the sheet', async () => {
  const r = await tapOn({ ua: UA.mac, touch: 5 });
  assert.equal(r.downloads.length, 0);
  assert.equal(r.shared.length, 1);
  assert.deepEqual(Object.keys(r.shared[0]), ['files']);
});

test('DESKTOP: a real Mac (no touch) downloads, though Safari could share - not by feature support', async () => {
  const r = await tapOn({ ua: UA.mac, touch: 0 });
  assert.equal(r.shared.length, 0);
  assert.equal(r.downloads.length, 1);
  assert.deepEqual(r.events, ['card_downloaded']);
});

test('DESKTOP: Windows downloads', async () => {
  const r = await tapOn({ ua: UA.windows, canShare: false });
  assert.equal(r.shared.length, 0);
  assert.equal(r.downloads.length, 1);
  assert.deepEqual(r.events, ['card_downloaded']);
});

test('iOS AbortError: no download, no card_downloaded', async () => {
  const r = await tapOn({ ua: UA.iphone, touch: 5, onShare: () => { throw new DOMException('dismissed', 'AbortError'); } });
  assert.equal(r.shared.length, 1, 'precondition: the sheet opened');
  assert.equal(r.downloads.length, 0);
  assert.deepEqual(r.events, []);
});
