// ============================================================
// tests/writer-cap-trace.spec.mjs — the day the free cap is hit leaves one row
// ============================================================
// Run: npm run test:writer-cap-trace
//
// Prompt AK §3.4. Nothing was notified when the free writer cap was hit (AJ §5.3):
// a refusal only set an in-memory qa_flag. Now the first refusal of the UTC day
// writes one `writer_cap_reached` row to the existing events table (funnel_event,
// migration 0009) under a `system:` key, so a funnel read-out never counts it as a
// reader. No push alert: that is parked (PROGRESS DEFERRED REGISTER).
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { consume, __clearMemRateLimit } from '../lib/ratelimit.js';
import { DAILY_ATTEMPT_CEILING } from '../lib/render/config.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { renderReading, __clearInFlight, __resetWriterCapTraceForTest } from '../lib/render/index.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { readEvents, __resetAnalyticsMemForTest } from '../lib/analytics/events.js';
import { anomalies } from '../scripts/demand-readout.mjs';

const sj = () => buildSemanticJson(calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' }));
let realFetch;
beforeEach(() => {
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('the writer must not be called past the cap'); };
  __clearMemCache(); __clearInFlight(); __clearMemRateLimit(); __resetAnalyticsMemForTest();
  __resetWriterCapTraceForTest?.();
});
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.GEMINI_API_KEY;
});

async function exhaustFreeCap() {
  for (let i = 0; i <= DAILY_ATTEMPT_CEILING; i += 1) {
    await consume('render_attempts_daily', { global: 'all' }, { limits: { global: DAILY_ATTEMPT_CEILING } });
  }
}

test('THE FIRST FREE-CAP REFUSAL OF THE DAY WRITES ONE writer_cap_reached ROW; the second does not add one', async () => {
  await exhaustFreeCap();
  const first = await renderReading(sj(), { dedupeInFlight: false });
  assert.equal(first.qa_flag, 'spend_guard_daily_ceiling', 'precondition: the free cap refused');
  const rows = (await readEvents()).filter((e) => e.event === 'writer_cap_reached');
  assert.equal(rows.length, 1, `rows: ${JSON.stringify(rows)}`);
  assert.match(rows[0].reading_id, /^system:writer-cap:day-\d+$/u);
  __clearMemCache(); __clearInFlight();
  await renderReading(sj(), { dedupeInFlight: false });
  assert.equal((await readEvents()).filter((e) => e.event === 'writer_cap_reached').length, 1);
});

test('THE FUNNEL READ-OUT DOES NOT COUNT THE SYSTEM ROW as a reader or an unknown event', async () => {
  await exhaustFreeCap();
  await renderReading(sj(), { dedupeInFlight: false });
  const events = await readEvents();
  assert.ok(events.some((e) => e.event === 'writer_cap_reached'), 'precondition');
  const found = anomalies(events, []);
  assert.equal(found.some((a) => a.includes('writer_cap_reached')), false, JSON.stringify(found));
});
