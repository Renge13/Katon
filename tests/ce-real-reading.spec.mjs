// ============================================================
// tests/ce-real-reading.spec.mjs — a paid Complete Edition is always a real reading
// ============================================================
// Run: npm run test:ce-real-reading
//
// Prompt AK §3.6, Reyner's ruling 5 ("must be fixed before launch"): if the saved
// Mirror is missing or is the fallback, the paid flow renders a full reading - on
// the PAID budget (§3.1) - before the PDF is built, and warms it at settle. The
// PDF never prints floor prose.
//
// In memory; the writer is a stubbed fetch. The PDF builder is injected and only
// records what it was handed, so every assertion is about WHICH reading reaches it.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { consume, __clearMemRateLimit } from '../lib/ratelimit.js';
import { DAILY_ATTEMPT_CEILING } from '../lib/render/config.js';
import { readCache, __clearMemCache } from '../lib/render/cache.js';
import { __clearInFlight } from '../lib/render/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { createReading, getReading } from '../lib/readingStore.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { serveDeliveryPdf, NOT_RENDERED } from '../lib/deliver/handlers.js';
import { settleReading } from '../lib/deliver/settle.js';

const BIRTH = { birth_date: '1989-09-13', birth_time: '09:00' };
const req = (ip = '203.0.113.60') => new Request('https://katon.app/api/deliver/x/pdf', { headers: { 'x-forwarded-for': ip } });

let realFetch;
let calls;
function stubWriter(semanticJson) {
  const draft = { blocks: assembleFallback(semanticJson).blocks, penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.' };
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(draft) }] }, finishReason: 'STOP' }] });
  };
}
const stubDown = () => { globalThis.fetch = async () => { calls += 1; return new Response('down', { status: 503 }); }; };
const builder = () => {
  const handed = [];
  return { handed, renderPdf: async (args) => { handed.push(args); return { buffer: Buffer.from('%PDF-1.3 stub'), pageMap: {}, report: {} }; } };
};
async function exhaustFreeCap() {
  for (let i = 0; i <= DAILY_ATTEMPT_CEILING; i += 1) {
    await consume('render_attempts_daily', { global: 'all' }, { limits: { global: DAILY_ATTEMPT_CEILING } });
  }
}
let seq = 0;
async function paidReadingWithNoSavedMirror() {
  seq += 1;
  const id = `ce${seq}`;
  const { semanticJson, key } = semanticFromRow({ ...BIRTH });
  // NO render_cache row: the Mirror she saw was the floor, and rule 16 never stores it.
  await createReading({ id, ...BIRTH, paid: true, cache_key: key, gender: 'female' });
  return { id, semanticJson, key };
}

beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  realFetch = globalThis.fetch;
  calls = 0;
  __clearMemCache(); __clearInFlight(); __clearMemRateLimit();
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
});

test('FREE TRAFFIC USED THE FREE CAP: a paid CE whose saved Mirror is the floor still gets a REAL reading in its PDF', async () => {
  const { id, semanticJson } = await paidReadingWithNoSavedMirror();
  await exhaustFreeCap();
  stubWriter(semanticJson);
  const { handed, renderPdf } = builder();
  const res = await serveDeliveryPdf(req(), id, { renderPdf });
  assert.equal(res.status, 200, `got ${res.status}: the paid PDF did not get a reading`);
  assert.ok(calls > 0, 'the writer was called');
  assert.equal(handed.length, 1);
  assert.ok(handed[0].rendered.stage6_version && !String(handed[0].rendered.stage6_version).endsWith('-floor'), 'a gated render, not the floor');
  assert.ok(handed[0].rendered.penutup.length > 0, 'the floor has no penutup; a render does');
});

test('SETTLE WARMS IT: after a paid transition the full reading is already saved', async () => {
  seq += 1;
  const id = `ce${seq}`;
  const { semanticJson, key } = semanticFromRow({ ...BIRTH });
  await createReading({ id, ...BIRTH, paid: false, cache_key: key, gender: 'female', sku: 'artifact' });
  stubWriter(semanticJson);
  const row = await getReading(id);
  const out = await settleReading(id, row, true, null);
  assert.equal(out.paid, true);
  assert.ok(calls > 0, 'settle started no render');
  const saved = await readCache(key);
  assert.ok(saved && saved.source === 'gemini', 'no real reading was saved at settle');
});

test('THE PROVIDER FAILS: she gets the existing "not ready yet" answer, never a floor PDF', async () => {
  const { id } = await paidReadingWithNoSavedMirror();
  stubDown();
  const { handed, renderPdf } = builder();
  const res = await serveDeliveryPdf(req('203.0.113.61'), id, { renderPdf });
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, NOT_RENDERED);
  assert.equal(handed.length, 0, 'a PDF was built from the floor');
});
