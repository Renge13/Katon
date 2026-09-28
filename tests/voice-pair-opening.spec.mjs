// ============================================================
// tests/voice-pair-opening.spec.mjs — the v2 pair writer is never handed the opening
// ============================================================
// Run: npm run test:voice-pair-opening
//
// Prompt AJ §2 (Cowork's ruling, 2026-09-28). Round 4's PZ0t served the opening
// sentence TWICE: the engine prepends `p0_opening` (lib/render/pairOpening.js), but
// the writer was also given the opening's text as a fact and a required point, so
// it wrote it again inside a braided block, which `withEngineOpening` keeps minus
// the claim. The cause is removed: the v2 pair payload carries no `p0_opening`.
// `withEngineOpening`'s strip stays as the backstop, and the id stays a KNOWN fact
// id, so a writer that cites it anyway is stripped, not rejected.
//
// The provider is stubbed through `fetchImpl`; nothing is spent.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { renderReading, __clearInFlight } from '../lib/render/index.js';
import { __clearMemCache } from '../lib/render/cache.js';

const A = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00', gender: 'female' });
const B = calculateBaziChart({ birthDate: '1990-03-04', birthTime: '14:00', gender: 'male' });
const pairV2 = () => buildPairSemantic(A, B, { voice: 'v2' });
const pairV1 = () => buildPairSemantic(A, B);
const opening = (sj) => sj.facts.find((f) => f.id === 'p0_opening').label_meaning;

const ok = (text) => new Response(JSON.stringify({
  candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }],
}), { status: 200 });

/**
 * A writer that RESTATES EVERY FACT IT IS GIVEN, in one braided block, the way the
 * round-4 draft did. It reads the facts out of the request it receives, so what it
 * can restate is exactly what the payload handed it.
 */
function restatingWriter(captured) {
  return async (_url, opts) => {
    const body = JSON.parse(opts.body);
    captured.push(body);
    const user = body.contents?.[0]?.parts?.map((p) => p.text).join('') ?? '';
    const payload = JSON.parse(user);
    const facts = payload.facts || [];
    const text = facts.map((f) => f.label_meaning).filter(Boolean).join(' ');
    const draft = {
      blocks: [{ fact_ids: facts.map((f) => f.id), heading: 'Semua', text: `${text}\n\nKamu dan dia berjalan bersama.` }],
      penutup: 'Penutup yang cukup panjang untuk kalian berdua, dan untukmu.',
    };
    return ok(JSON.stringify(draft));
  };
}

async function render(sj, fetchImpl) {
  __clearMemCache(); __clearInFlight();
  const prev = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key-never-sent';
  try {
    return await renderReading(sj, { spendGuards: false, dedupeInFlight: false, fetchImpl });
  } finally {
    if (prev === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prev;
  }
}

test('THE v2 PAIR WRITER IS NEVER HANDED THE OPENING: no p0_opening text in what it receives', async () => {
  const sj = pairV2();
  const captured = [];
  await render(sj, restatingWriter(captured));
  assert.ok(captured.length >= 1, 'the writer was called');
  const sent = JSON.stringify(captured[0]);
  assert.equal(sent.includes('p0_opening'), false, 'the id reached the writer');
  assert.equal(sent.includes(opening(sj).slice(0, 40)), false, 'the opening text reached the writer');
});

test('A WRITER THAT RESTATES EVERY FACT IT IS GIVEN: exactly ONE opening sentence is served', async () => {
  const sj = pairV2();
  const out = await render(sj, restatingWriter([]));
  assert.equal(out.source, 'gemini', 'the stub draft must be SERVED, or the count below is the floor\'s');
  // The words BEFORE the names. A copy inside a braided block gets "(The Sun)"
  // inserted after the archetype (round 4, PZ0t), so a needle that includes the
  // names cannot see the copy - the first draft of this test passed on the defect.
  const first = opening(sj).slice(0, opening(sj).indexOf(sj.core.a.archetype_name_id));
  const served = [...out.blocks.map((b) => b.text), out.penutup].join('\n');
  assert.equal(served.split(first).length - 1, 1, `the opening appears ${served.split(first).length - 1} times`);
  assert.deepEqual(out.blocks[0].fact_ids, ['p0_opening'], 'the engine opening still leads');
});

test('v1 IS UNCHANGED: the v1 pair payload still carries p0_opening (this is v2-only)', async () => {
  const sj = pairV1();
  const captured = [];
  await render(sj, restatingWriter(captured));
  assert.ok(JSON.stringify(captured[0]).includes('p0_opening'));
});
