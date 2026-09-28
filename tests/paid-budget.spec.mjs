// ============================================================
// tests/paid-budget.spec.mjs — a paying reader is never floored by free traffic
// ============================================================
// Run: npm run test:paid-budget
//
// Prompt AK §3.1, Reyner's ruling 4 (docs/product/ah-protection-rulings-2026-09-28.md):
// a render for a PAID reading - a paid pair, or the Mirror of a token with a paid
// Complete Edition - draws on its own daily counter (a runaway guard, 500 calls),
// so free traffic exhausting the free cap (1,500, ruling 5) cannot floor her.
//
// In memory: no Supabase, no network. The writer is a stubbed fetch that returns a
// passing draft (the floor's own prose plus a penutup) and counts its calls.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { consume, __clearMemRateLimit } from '../lib/ratelimit.js';
import { DAILY_ATTEMPT_CEILING } from '../lib/render/config.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { __clearInFlight } from '../lib/render/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { createReading } from '../lib/readingStore.js';
import { semanticFromRow } from '../lib/mirror/reading.js';
import { serveMirrorReading } from '../lib/mirror/handlers.js';
import { servePairReading } from '../lib/pair/serveReading.js';
import { createPair, markPairPaid } from '../lib/pairStore.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';

const BIRTH = { birth_date: '1989-09-13', birth_time: '09:00' };
const A = { birthDate: '1989-09-13', birthTime: '09:00' };
const B = { birthDate: '1990-03-04', birthTime: '14:00' };
const req = (ip) => new Request('http://localhost/x', { headers: { 'x-forwarded-for': ip } });

let realFetch;
let calls;
/** A writer that returns a passing draft for whichever reading it is asked about. */
function stubWriter(semanticJson) {
  const draft = { blocks: assembleFallback(semanticJson).blocks, penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.' };
  globalThis.fetch = async () => {
    calls += 1;
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify(draft) }] }, finishReason: 'STOP' }] });
  };
}

/** Spend the whole FREE daily cap, the way free traffic would. */
async function exhaustFreeCap() {
  for (let i = 0; i < DAILY_ATTEMPT_CEILING; i += 1) {
    await consume('render_attempts_daily', { global: 'all' }, { limits: { global: DAILY_ATTEMPT_CEILING } });
  }
  const next = await consume('render_attempts_daily', { global: 'all' }, { limits: { global: DAILY_ATTEMPT_CEILING } });
  assert.equal(next.allowed, false, 'precondition: the free cap is exhausted');
}

let seq = 0;
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

test('FREE CAP EXHAUSTED: an UNPAID mirror is floored (the control - this is ruling 7)', async () => {
  seq += 1;
  const id = `free${seq}`;
  const { semanticJson, key } = semanticFromRow({ ...BIRTH });
  await createReading({ id, ...BIRTH, paid: false, cache_key: key, gender: null });
  await exhaustFreeCap();
  stubWriter(semanticJson);
  const body = await (await serveMirrorReading(req('198.51.100.1'), id)).json();
  assert.equal(body.meta.source, 'module_assembly');
  assert.equal(calls, 0, 'the free cap refused the writer');
});

test('FREE CAP EXHAUSTED: the Mirror of a PAID Complete Edition still calls the writer', async () => {
  seq += 1;
  const id = `paid${seq}`;
  const { semanticJson, key } = semanticFromRow({ ...BIRTH });
  await createReading({ id, ...BIRTH, paid: true, cache_key: key, gender: null });
  await exhaustFreeCap();
  stubWriter(semanticJson);
  const body = await (await serveMirrorReading(req('198.51.100.2'), id)).json();
  assert.ok(calls > 0, 'the writer was never called: the paid reader was floored by free traffic');
  assert.equal(body.meta.source, 'gemini');
});

test('FREE CAP EXHAUSTED: a PAID pair still calls the writer', async () => {
  const pid = `pair-${Math.random().toString(36).slice(2, 10)}`;
  await createPair({
    id: pid,
    a_birth_date: A.birthDate, a_birth_time: A.birthTime, a_gender: null, a_term_side: null,
    b_birth_date: B.birthDate, b_birth_time: B.birthTime, b_gender: null, b_term_side: null,
    sku: 'compat', paid: false, email: null,
  });
  await markPairPaid(pid, new Date().toISOString());
  await exhaustFreeCap();
  stubWriter(buildPairSemantic(calculateBaziChart(A), calculateBaziChart(B)));
  const body = await (await servePairReading(req('198.51.100.3'), pid)).json();
  assert.ok(calls > 0, 'the writer was never called: the paid pair was floored by free traffic');
  assert.equal(body.served_from, 'render');
});
