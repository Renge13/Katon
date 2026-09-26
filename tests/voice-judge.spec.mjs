// ============================================================
// tests/voice-judge.spec.mjs — NO JUDGE IN THE RENDER PATH (Reyner, 2026-09-26, MVP)
// ============================================================
// Run: npm run test:voice-judge
//
// Reyner's MVP ruling (docs/product/product-boundary-rulings-2026-09-26.md item 5):
// engine -> Flash-lite writer -> deterministic checks -> serve. The judge
// (lib/validate/judge.js, scripts/calibrate-j1.mjs) is a development/QA tool run by
// hand on samples and never runs on a user's reading. So a render, v1 or v2, makes
// ZERO judge calls whatever the judge would have said, and a judge that is down
// changes nothing. STAGE6 1.42.0 removed the J1 gate that 1.33.0 added.
//
// The provider is stubbed. The writer's call and the judge's call are told apart
// by the judge's own system prompt, so a judge call is COUNTED even though none
// should happen. The judge.js unit tests below stay: the QA tool still has to be
// right when someone runs it.
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

// A J1 the old gate would have rejected on: an invented star.
const J1 = {
  sentence: 'Mata Pisau-mu membuatmu cepat memutuskan.', class: 'J1',
  grounding_considered: ['badge_桃花', 'strength_weak'], supported: 'nothing',
  unsupported: 'a Mata Pisau star this chart does not carry',
};
const J4_COST = {
  sentence: 'void_stack_month', class: 'J4', missing: 'cost',
  grounding_considered: ['void_stack_month'], supported: 'its gift is present',
  unsupported: 'the cost (always waiting for the next proof) is missing',
};

/**
 * The writer returns the floor's own blocks; the judge, if it were ever called,
 * returns `script[n]` on its n-th call. `calls.judge` counts it.
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

test('A v2 RENDER MAKES ZERO JUDGE CALLS, even where the judge would have said J1', async () => {
  const sj = v2();
  const calls = stub(sj, [[J1]]);
  const out = await render(sj);
  assert.equal(calls.judge, 0, 'no judge call on a user render');
  assert.equal(calls.writer, 1, 'one writer call: nothing to regenerate for');
  assert.equal(out.source, 'gemini', 'served: a J1 the judge never saw rejects nothing');
});

test('A JUDGE THAT IS DOWN CHANGES NOTHING (it is never asked)', async () => {
  const sj = v2();
  const calls = stub(sj, ['DOWN']);
  const out = await render(sj);
  assert.equal(calls.judge, 0);
  assert.equal(out.source, 'gemini');
  assert.ok(!out.findings.some((f) => String(f.check).startsWith('v2.judge_')), 'no v2.judge_* finding of any kind');
});

test('THE REVIEW IS STILL STORED WITH THE RENDER, deterministic findings only', async () => {
  const sj = v2();
  stub(sj, [[J4_COST]]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.deepEqual(Object.keys(out.review).sort(), ['deterministic', 'rejected_drafts']);
  assert.ok(!out.attempts.some((a) => 'judge' in a || 'judge_usage' in a), 'no judge fields on the attempts');
  assert.ok(await persistRendered(out, sj));
  const row = await readCache(out.cache_key);
  assert.ok(row.review, 'the review is on the cached row');
});

test('v1 NEVER CALLS THE JUDGE', async () => {
  const sj = v1();
  const calls = stub(sj, [[J1]]);
  await render(sj);
  assert.equal(calls.judge, 0);
});

// ── THE QA TOOL (lib/validate/judge.js), run by hand on samples ──

test('FLASH-LITE ONLY (Reyner, 2026-09-26): the judge is the WRITER\'s model id, read from config', async () => {
  const { JUDGE_MODEL } = await import('../lib/validate/judge.js');
  const { modelFor, DEFAULT_TIER } = await import('../lib/render/config.js');
  assert.equal(JUDGE_MODEL, modelFor(DEFAULT_TIER, 'gemini'));
  assert.equal(JUDGE_MODEL, 'gemini-3.1-flash-lite');
  // And it is the model the judge actually calls.
  const sj = v2();
  let url = null;
  globalThis.fetch = async (u) => {
    url = String(u);
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"findings":[]}' }] } }] }), { status: 200 });
  };
  await judgeRendering(assembleFallback(sj), sj);
  assert.ok(url.includes('/gemini-3.1-flash-lite:generateContent'), url);
});

// ── THE FIX ROUND (2026-09-24): (c) J4 only over the render's own points, (d) no
// non-findings, (a) the relation glosses read the right way round ──
import { wellFormed, judgeRendering } from '../lib/validate/judge.js';

test('(d) A NON-FINDING IS MALFORMED: unsupported "None" or empty', () => {
  const g = ['void_stack_month'];
  assert.equal(wellFormed({ class: 'J1', grounding_considered: g, supported: 'x', unsupported: 'None' }), false);
  assert.equal(wellFormed({ class: 'J1', grounding_considered: g, supported: 'x', unsupported: ' ' }), false);
  assert.equal(wellFormed({ class: 'J1', grounding_considered: g, supported: 'x', unsupported: 'a star the chart lacks' }), true);
});

test('(c) J4 ONLY OVER THE RENDER\'S OWN REQUIRED POINTS, and none with an empty list', async () => {
  const sj = v2();
  const stray = { ...J4_COST, sentence: 'aspek_convergence_食神' }; // a fact, not a required point
  assert.ok(!sj.required_points.some((r) => r.fact_id === stray.sentence), 'precondition');
  globalThis.fetch = async () => new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: JSON.stringify({ findings: [J4_COST, stray] }) }] } }],
  }), { status: 200 });
  const draft = assembleFallback(sj);
  const out = await judgeRendering(draft, sj);
  assert.deepEqual(out.findings.map((f) => f.sentence), ['void_stack_month']);
  assert.deepEqual(out.malformed.map((f) => f.sentence), ['aspek_convergence_食神']);
  const none = await judgeRendering(draft, { ...sj, required_points: [] });
  assert.deepEqual(none.findings, [], 'no required points, no J4');
});

test('(a) THE GLOSSES READ THE ENGINE THE RIGHT WAY ROUND, pinned on chart 1', () => {
  // relation_to_season is elementRelation(season ruler, Day Master): the arguments
  // the other way round from relation_to_day_master. Chart 1 is Fire born in a
  // Metal month, worksheet S2's "Api menghabiskan tenaga untuk menundukkan Logam".
  const facts = v2().facts;
  const strength = facts.find((f) => f.id.startsWith('strength_')).provenance;
  assert.deepEqual([strength.element, strength.season_ruler_element, strength.relation_to_season], ['Api', 'Logam', 'controls']);
  assert.ok(JUDGE_PROMPT.includes("controls = the Day Master's element controls the season's"));
  // Missing Wood, which feeds Fire (worksheet S2: "Api menyala dari kayu").
  const wood = facts.find((f) => f.id === 'element_missing_Wood').provenance;
  assert.equal(wood.relation_to_day_master, 'feeds');
  assert.ok(JUDGE_PROMPT.includes("feeds = it produces the Day Master's element"));
});
