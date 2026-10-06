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
    // Since BC §2.4 (I3) the writer's first chapter opens a v2 pair, and pair.both_named
    // requires it to name both people: the writer names both English titles first.
    const names = `Kalian berdua, ${payload.core?.a?.archetype_name_en} dan ${payload.core?.b?.archetype_name_en}.`;
    const draft = {
      // A v2 pair answers in `paragraphs` since BC amendment 2c; same two paragraphs.
      blocks: [{ fact_ids: facts.map((f) => f.id), heading: 'Semua', paragraphs: [`${names} ${text}`, 'Kamu dan dia berjalan bersama.'] }],
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

test('A WRITER THAT RESTATES EVERY FACT IT IS GIVEN: the engine opening is served ZERO times, the writer leads (BC I3)', async () => {
  // Was "exactly ONE opening sentence is served" with the engine opening leading. Since
  // Prompt BC §2.4 (I3, 2026-10-02) the writer opens a v2 pair and nothing is prepended,
  // so the engine's sentence must not appear at all: the writer was never handed it.
  const sj = pairV2();
  const out = await render(sj, restatingWriter([]));
  assert.equal(out.source, 'gemini', 'the stub draft must be SERVED, or the count below is the floor\'s');
  // The words BEFORE the names, so a copy with any name form after it is still seen.
  const first = opening(sj).slice(0, opening(sj).indexOf(sj.core.a.archetype_name_en));
  const served = [...out.blocks.map((b) => b.text), out.penutup].join('\n');
  assert.equal(served.split(first).length - 1, 0, `the engine opening appears ${served.split(first).length - 1} times`);
  assert.equal(out.blocks[0].heading, 'Semua', 'the writer\'s own block leads');
});

test('v1 IS UNCHANGED: the v1 pair payload still carries p0_opening (this is v2-only)', async () => {
  const sj = pairV1();
  const captured = [];
  await render(sj, restatingWriter(captured));
  assert.ok(JSON.stringify(captured[0]).includes('p0_opening'));
});
