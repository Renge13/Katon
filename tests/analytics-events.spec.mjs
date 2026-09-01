// ============================================================
// tests/analytics-events.spec.mjs — the counter, and the two things it must never do
// ============================================================
// Prompt Q commit 2. Runs against the DEV FALLBACK (no Supabase configured), which
// is the same path local verification uses, so this suite needs no network and no
// credentials.
//
// THE TWO PROPOSITIONS THIS FILE EXISTS FOR, both of which would be silent
// failures in production:
//
//   1. A REFRESH MUST NOT INFLATE A DENOMINATOR. Every rate in the September
//      read-out divides by "distinct readings with event X". If a second tab or a
//      reload created a second row, every rate would be quietly wrong in a
//      plausible-looking direction, and nothing would look broken.
//
//   2. A COUNTER MUST NEVER BREAK A READING. `recordEvent` is called from inside
//      request paths. If it can throw, instrumentation can take down the product
//      it is measuring.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  recordEvent, recordInterest, readEvents, readInterest,
  FUNNEL_EVENTS, INTEREST_PRODUCTS, __resetAnalyticsMemForTest,
} from '../lib/analytics/events.js';

const R = 'test-reading-id';

test.beforeEach(() => __resetAnalyticsMemForTest());

// ── 1. DEDUPLICATION ────────────────────────────────────────

test('THE DENOMINATOR DOES NOT INFLATE — five serves are one row with count 5', async () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(await recordEvent(R, 'mirror_served', { source: 'rendered' }), true);
  }
  const rows = await readEvents();
  const served = rows.filter((r) => r.event === 'mirror_served');
  assert.equal(served.length, 1, 'one row per (reading, event) — this IS the denominator');
  assert.equal(served[0].count, 5, 'repeats are counted, not discarded');
});

test('first occurrence wins on created_at, repeats move updated_at', async () => {
  await recordEvent(R, 'mirror_served', { source: 'module_assembly' });
  const first = (await readEvents())[0].created_at;
  await recordEvent(R, 'mirror_served', { source: 'rendered' });
  const row = (await readEvents())[0];
  assert.equal(row.created_at, first, 'created_at must pin the FIRST serve');
  assert.ok(row.updated_at >= first, 'updated_at moves');
});

test('different readings are different rows', async () => {
  await recordEvent('a', 'mirror_served', { source: 'rendered' });
  await recordEvent('b', 'mirror_served', { source: 'rendered' });
  assert.equal((await readEvents()).length, 2);
});

// ── 2. IT MUST NOT THROW ────────────────────────────────────

test('A COUNTER NEVER THROWS INTO A REQUEST PATH', async () => {
  // Each of these is a programming error, and each must return false rather than
  // propagate. The reading is more important than the number about the reading.
  assert.equal(await recordEvent(R, 'not_a_real_event'), false, 'unknown event');
  assert.equal(await recordEvent(null, 'mirror_served'), false, 'missing reading id');
  assert.equal(await recordEvent('', 'mirror_served'), false, 'empty reading id');
  assert.equal(await recordInterest(R, 'household'), false, 'unknown product');
  assert.equal(await recordInterest(null, 'compat'), false, 'missing reading id');
  // ...and nothing was written by any of them.
  assert.equal((await readEvents()).length, 0);
  assert.equal((await readInterest()).length, 0);
});

// ── 3. NO PII, ENFORCED AT THE DOOR ─────────────────────────

test('detail REFUSES PII rather than trusting the call site', async () => {
  // The pillars are derived from the birth datetime, so a date in an analytics
  // row IS a chart. Refused under any key, including innocent-looking ones.
  assert.equal(await recordEvent(R, 'reading_created', { birth_date: '1989-09-13' }), false);
  assert.equal(await recordEvent(R, 'reading_created', { birthTime: '09:00' }), false);
  assert.equal(await recordEvent(R, 'reading_created', { name: 'Sari' }), false);
  assert.equal(await recordEvent(R, 'reading_created', { wa_number: '0812' }), false);
  assert.equal(await recordEvent(R, 'reading_created', { note: 'born 1989-09-13' }), false,
    'a bare ISO date is refused even under an innocent key');
  assert.equal((await readEvents()).length, 0, 'nothing PII-bearing was stored');

  // The shapes the events actually use still pass.
  assert.equal(await recordEvent(R, 'reading_created', { has_hour: true }), true);
  assert.equal(await recordEvent(R, 'mirror_served', { source: 'module_assembly' }), true);
});

// ── 4. INTEREST ─────────────────────────────────────────────

test('THE TAP IS THE METRIC — interest records with no contact', async () => {
  assert.equal(await recordInterest(R, 'compat'), true);
  const rows = await readInterest();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].contact, null, 'contact is optional and its absence is not a failure');
});

test('a second tap is one signal, and may add a contact', async () => {
  await recordInterest(R, 'annual');
  await recordInterest(R, 'annual', '0812');
  const rows = await readInterest();
  assert.equal(rows.length, 1, 'one interest per (reading, product)');
  assert.equal(rows[0].contact, '0812');
});

test('blank contact normalises to null, not to an empty string', async () => {
  await recordInterest(R, 'compat', '   ');
  assert.equal((await readInterest())[0].contact, null);
});

// ── 5. THE EVENT LIST IS CLOSED ─────────────────────────────

test('the eight events are fixed, and a typo cannot invent a ninth', async () => {
  assert.equal(FUNNEL_EVENTS.length, 8);
  assert.ok(Object.isFrozen(FUNNEL_EVENTS));
  assert.deepEqual(INTEREST_PRODUCTS, ['compat', 'annual']);
  // A near-miss is rejected. Without the closed list this would create a silent
  // ninth event and halve whatever denominator it was meant to feed.
  assert.equal(await recordEvent(R, 'mirror_serve'), false);
});
