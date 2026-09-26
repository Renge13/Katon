// ============================================================
// tests/voice-judge.spec.mjs — the v2 judge, ADVISORY (spec §4b; ruled 2026-09-24)
// ============================================================
// Run: npm run test:voice-judge
//
// The provider is stubbed. The writer's call and the judge's call are told apart
// by the judge's own system prompt, so each case scripts what the JUDGE says and
// asserts what the pipeline DOES with it. Calibration against real Gemini is a
// separate, spending step (scripts/calibrate-judge.mjs); this file proves the
// wiring. Since 1.29.0 the judge is ADVISORY (Reyner, 2026-09-24): it runs, its
// findings are stored with the spec's severity kept as `judge_severity`, and it
// never rejects, regenerates or floors. D1-D4 alone gate v2. v1 never calls it.
// SINCE 1.33.0 J1 ALONE GATES (round 3, after scripts/calibrate-j1.mjs passed):
// a J1 regenerates once with the quote fed back, a second J1 floors, and a judge
// that cannot run floors too (J1 unchecked is not a pass). J2-J4 stay advisory.
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
  const calls = { writer: 0, judge: 0, writerBodies: [] };
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
    calls.writerBodies.push(opts.body);
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

test('J1 GATES (1.33.0): a J1 regenerates ONCE with the quoted finding fed back; a clean retry is served', async () => {
  const sj = v2();
  const calls = stub(sj, [[J1], []]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(calls.writer, 2, 'one regeneration');
  assert.equal(calls.judge, 2);
  assert.ok(calls.writerBodies[1].includes(J1.sentence), 'the second writer call quotes the J1 sentence');
  assert.ok(calls.writerBodies[1].includes(J1.unsupported), 'and what was unsupported');
  assert.equal(calls.writerBodies[0].includes(J1.sentence), false, 'the first did not');
  const rejected = out.review.rejected_drafts[0].findings.find((f) => f.check === 'v2.judge_j1');
  assert.equal(rejected.severity, 'hard', 'the rejection is stored with the render');
});

test('J1 GATES (1.33.0): a second J1 serves the floor', async () => {
  const sj = v2();
  const calls = stub(sj, [[J1]]);
  const out = await render(sj);
  assert.equal(out.source, 'module_assembly');
  assert.equal(calls.writer, 2, 'the one v2 regeneration, then the floor');
});

test('ADVISORY STILL: a J2 finding is stored at flag, keeps its spec severity, and rejects nothing', async () => {
  const sj = v2();
  const J2 = {
    sentence: 'Bintang Penolong muncul karena Tanda Kekosongan.', class: 'J2',
    grounding_considered: ['badge_天乙貴人', 'void_stack_month'], supported: 'both sit at Pilar Kerja',
    unsupported: 'the causal link',
  };
  const calls = stub(sj, [[J2]]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini', 'served: J2 does not reject');
  assert.equal(calls.writer, 1, 'no regeneration spent on J2');
  const f = out.review.judge[0];
  assert.equal(f.check, 'v2.judge_j2');
  assert.equal(f.severity, 'flag');
  assert.equal(f.judge_severity, 'hard');
});

test('ADVISORY: J3 keeps soft, J4 missing cost keeps hard, neither regenerates', async () => {
  let sj = v2();
  stub(sj, [[J3]]);
  let out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(out.review.judge[0].judge_severity, 'soft');
  __clearMemCache(); __clearInFlight();
  sj = v2();
  const calls = stub(sj, [[J4_COST]]);
  out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(out.review.judge[0].judge_severity, 'hard');
  assert.equal(calls.writer, 1);
});

test('A MALFORMED FINDING (no grounding shown) IS KEPT AND NEVER ACTED ON', async () => {
  const sj = v2();
  const calls = stub(sj, [[MALFORMED]]);
  const out = await render(sj);
  assert.equal(out.source, 'gemini');
  assert.equal(calls.writer, 1);
  assert.equal(out.review.judge_malformed.length, 1, 'but it is stored for reading');
  assert.deepEqual(out.review.judge, []);
});

test('A JUDGE THAT CANNOT RUN IS NOT A PASS (1.33.0): J1 was never checked, so it regenerates, then floors', async () => {
  const sj = v2();
  const calls = stub(sj, ['DOWN']);
  const out = await render(sj);
  assert.equal(out.source, 'module_assembly');
  assert.equal(calls.writer, 2);
  const rejected = out.review?.rejected_drafts ?? null;
  assert.equal(rejected, null, 'the floor carries no review');
});

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

test('v1 NEVER CALLS THE JUDGE', async () => {
  const sj = v1();
  const calls = stub(sj, [[J1]]);
  await render(sj);
  assert.equal(calls.judge, 0);
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
