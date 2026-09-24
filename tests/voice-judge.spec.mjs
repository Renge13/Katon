// ============================================================
// tests/voice-judge.spec.mjs — the v2 judge gates, auditably (spec §4b)
// ============================================================
// Run: npm run test:voice-judge
//
// The provider is stubbed. The writer's call and the judge's call are told apart
// by the judge's own system prompt, so each case scripts what the JUDGE says and
// asserts what the pipeline DOES with it. Calibration against real Gemini is a
// separate, spending step (scripts/calibrate-judge.mjs); this file proves the
// wiring: severities, the malformed rule, "a judge that cannot run is not a pass",
// the stored review, and that v1 never calls the judge at all.
// ============================================================

import assert from 'node:assert/strict';
import { test, beforeEach, afterEach } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { renderReading, persistRendered, __clearInFlight } from '../lib/render/index.js';
import { readCache, __clearMemCache } from '../lib/render/cache.js';
import { JUDGE_PROMPT } from '../lib/validate/judge.js';

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
const v2 = () => buildSemanticJson(A, { voice: 'v2' });
const v1 = () => buildSemanticJson(A, { voice: 'v1' });

let saved;
beforeEach(() => {
  saved = { fetch: globalThis.fetch, key: process.env.GEMINI_API_KEY };
  process.env.GEMINI_API_KEY = 'test-key-never-sent-anywhere';
  __clearMemCache();
  __clearInFlight();
});
afterEach(() => {
  globalThis.fetch = saved.fetch;
  if (saved.key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = saved.key;
});

const J1 = {
  sentence: 'Mata Pisau-mu membuatmu cepat memutuskan.', class: 'J1',
  grounding_considered: ['badge_桃花', 'strength_weak'], supported: 'nothing',
  unsupported: 'a Mata Pisau star this chart does not carry',
};
const J3 = {
  sentence: 'Kamu selalu menahan semuanya.', class: 'J3',
  grounding_considered: ['element_dominant_Water'], supported: 'a tendency to hold back',
  unsupported: '"selalu" is more certain than the supplied cost',
};
const J4_COST = {
  sentence: 'void_stack_month', class: 'J4', missing: 'cost',
  grounding_considered: ['void_stack_month'], supported: 'its gift is present',
  unsupported: 'the cost (always waiting for the next proof) is missing',
};
const MALFORMED = { sentence: 'Kamu tenang.', class: 'J1', grounding_considered: [], supported: '', unsupported: '' };

/**
 * The writer returns the floor's own blocks; the judge returns `script[n]` on its
 * n-th call (the last entry repeats). `judgeCalls` counts the judge.
 */
function stub(sj, script) {
  const draft = assembleFallback(sj);
  const calls = { writer: 0, judge: 0 };
  globalThis.fetch = async (_url, opts) => {
    const body = JSON.parse(opts.body);
    const isJudge = body.systemInstruction.parts[0].text === JUDGE_PROMPT;
    if (isJudge) {
      const reply = script[Math.min(calls.judge, script.length - 1)];
      calls.judge += 1;
      if (reply === 'DOWN') return new Response('down', { status: 503 });
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ findings: reply }) }] } }] }), { status: 200 });
    }
    calls.writer += 1;
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ blocks: draft.blocks, penutup: 'Penutup yang cukup panjang untuk sebuah bacaan yang utuh.' }) }] } }],
    }), { status: 200 });
  };
  return calls;
}
const render = (sj) => renderReading(sj, { spendGuards: false, dedupeInFlight: false });

test('A CLEAN JUDGE: served, the review is stored with the render', async () => {
  const sj = v2();
  const calls = stub(sj, [[]]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(calls.judge, 1, 'one judge call');
  assert.deepEqual(out.review.judge, []);
  assert.ok(await persistRendered(out, sj));
  const row = await readCache(out.cache_key);
  assert.ok(row.review, 'the review is on the cached row');
});

test('J1 IS HARD: the draft is rejected, regenerated once, then served when the judge clears it', async () => {
  const sj = v2();
  const calls = stub(sj, [[J1], []]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(calls.writer, 2, 'one regeneration');
  assert.equal(out.review.rejected_drafts[0].findings[0].check, 'v2.judge_j1');
  assert.equal(out.review.rejected_drafts[0].findings[0].severity, 'hard');
});

test('A PERSISTENT J1 FLOORS after its one regeneration', async () => {
  const sj = v2();
  const calls = stub(sj, [[J1]]);
  const out = await render(sj);
  assert.equal(out.source, 'module_assembly');
  assert.equal(calls.writer, 2, 'exactly one regeneration, then the floor');
});

test('J3 IS SOFT (regenerate), J4 MISSING COST IS HARD', async () => {
  let sj = v2();
  stub(sj, [[J3], []]);
  let out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(out.review.rejected_drafts[0].findings[0].severity, 'soft');
  __clearMemCache(); __clearInFlight();
  sj = v2();
  const calls = stub(sj, [[J4_COST], []]);
  out = await render(sj);
  assert.equal(out.review.rejected_drafts[0].findings[0].severity, 'hard');
  assert.equal(calls.writer, 2);
});

test('A MALFORMED FINDING (no grounding shown) IS KEPT AND NEVER ACTED ON', async () => {
  const sj = v2();
  const calls = stub(sj, [[MALFORMED]]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini', 'served: the malformed finding rejected nothing');
  assert.equal(calls.writer, 1);
  assert.equal(out.review.judge_malformed.length, 1, 'but it is stored for reading');
});

test('A JUDGE THAT CANNOT RUN IS NOT A PASS: the floor, and no regeneration', async () => {
  const sj = v2();
  const calls = stub(sj, ['DOWN']);
  const out = await render(sj);
  assert.equal(out.source, 'module_assembly');
  assert.equal(calls.writer, 1, 'no regeneration spent against a reviewer that is down');
});

test('v1 NEVER CALLS THE JUDGE', async () => {
  const sj = v1();
  const calls = stub(sj, [[J1]]);
  await render(sj);
  assert.equal(calls.judge, 0);
});
