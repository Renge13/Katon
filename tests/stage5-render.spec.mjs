// ============================================================
// Stage 5 — prompt loading, the output contract, and the floor
// ============================================================
// Run: npm run test:stage5
//
// No network. The provider adapters are exercised through an injected fetch, so
// this spec never spends an API call and never depends on a key being present.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// lib/render/cache.js carries a `server-only` guard, which resolves to an empty
// stub under that condition — the same way Next's RSC bundle resolves it, and
// the same arrangement scripts/forge-tests.mjs already uses.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

import { MASTER_PROMPT, PROMPT_VERSION, assertPromptLoaded } from '../lib/render/prompt.js';
import { parseRenderResponse, RenderShapeError } from '../lib/render/schema.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { readCache, writeCache, flagCache, __clearMemCache } from '../lib/render/cache.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';
import {
  renderReading, persistRendered, withTargetLanguage, __clearInFlight,
} from '../lib/render/index.js';
import { STAGE6_VERSION, serveFenceReason, serveAllowed } from '../lib/render/fence.js';
import { STAGE6_VERSION as GATE_VERSION } from '../lib/validate/index.js';
import { splitParagraphs, inspectParagraphs } from '../lib/render/paragraphs.js';
import { RENDER_COPY } from '../lib/render/copy.js';
// The gate's own splitter, so a test about the floor's FIRST SENTENCE counts
// sentences the way the check that judges it counts them.
import { sentences } from '../lib/validate/text.js';

const jsonFor = (tc) => buildSemanticJson(calculateBaziChart({
  birthDate: tc.date, birthTime: tc.time,
}));

const CHART_1 = jsonFor(VALIDATION_CHARTS[0]);

// ── the prompt is a file, and it is versioned ──────────────

test('the master prompt loads from its file, whole', () => {
  assert.equal(assertPromptLoaded(), true);
  assert.ok(MASTER_PROMPT.length > 10_000, 'the prompt is ~15k chars');
  // Sections the adapters and Stage 6 both depend on existing.
  for (const marker of ['## OUTPUT FORMAT', '## VOICE', '## THE GOLDEN RULES']) {
    assert.ok(MASTER_PROMPT.includes(marker), `missing ${marker}`);
  }
});

test('the prompt text carries no CR, so prompt_version is platform-stable', () => {
  // The version is stamped on cached readings for attribution. A CRLF checkout
  // must not fork it for identical content, so the SENT text is normalised too.
  assert.ok(!MASTER_PROMPT.includes('\r'), 'prompt text still holds a carriage return');
  assert.match(PROMPT_VERSION, /^[0-9a-f]{16}$/);
});

// ── the ordered blocks[] contract ──────────────────────────

const GOOD = JSON.stringify({
  blocks: [
    { fact_ids: ['void_stack_month'], heading: 'Ruang kerja', text: 'Satu.' },
    { fact_ids: ['strength_weak', 'day_master_Fire'], heading: 'Cadangan', text: 'Dua.\n\nTiga.' },
  ],
  penutup: 'Penutup.',
});

test('a well-formed response parses, and keeps its block order', () => {
  const got = parseRenderResponse(GOOD, { knownFactIds: CHART_1.facts.map((f) => f.id) });
  assert.equal(got.blocks.length, 2);
  assert.deepEqual(got.blocks[0].fact_ids, ['void_stack_month']);
  assert.equal(got.blocks[1].heading, 'Cadangan');
  assert.equal(got.penutup, 'Penutup.');
});

test('an invented fact id is rejected', () => {
  // Rule 14. A cited id that is not in the semantic JSON means the renderer
  // decided something was true, which is the one thing it may never do.
  const bad = JSON.stringify({
    blocks: [{ fact_ids: ['badge_naga_emas'], heading: 'x', text: 'y' }],
    penutup: 'z',
  });
  assert.throws(
    () => parseRenderResponse(bad, { knownFactIds: CHART_1.facts.map((f) => f.id) }),
    RenderShapeError,
  );
});

test('empty, non-JSON and mis-shaped responses all throw the same error type', () => {
  for (const raw of [
    '',
    '   ',
    'Halo, ini bacaanmu.',
    '[]',
    JSON.stringify({ blocks: [], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: [], heading: 'h', text: 't' }], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: ['a'], heading: 'h', text: '' }], penutup: 'x' }),
    JSON.stringify({ blocks: [{ fact_ids: ['a'], heading: 'h', text: 't' }], penutup: '' }),
  ]) {
    assert.throws(() => parseRenderResponse(raw), RenderShapeError, `accepted: ${raw}`);
  }
});

test('a missing heading degrades to empty rather than failing the render', () => {
  const raw = JSON.stringify({
    blocks: [{ fact_ids: ['a'], text: 'teks' }],
    penutup: 'p',
  });
  assert.equal(parseRenderResponse(raw).blocks[0].heading, '');
});

// ── the module-assembled floor ─────────────────────────────

test('the floor covers every required point, in hierarchy order', () => {
  const out = assembleFallback(CHART_1);
  assert.deepEqual(
    out.blocks.map((b) => b.fact_ids[0]),
    CHART_1.required_points.map((p) => p.fact_id),
  );
  assert.equal(out.source, 'module_assembly');
});

test('the floor stands on every fixture chart and authors no typography', () => {
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    const out = assembleFallback(json); // throws on banned typography
    assert.ok(out.blocks.length > 0, `chart ${tc.id} assembled to nothing`);
    for (const block of out.blocks) {
      assert.ok(block.text.trim().length > 0, `chart ${tc.id} emitted an empty block`);
    }
  }
});

test('THE FLOOR SAYS WHERE A RELATION SITS, on every chart that has one', () => {
  // Until 2026-08-12 it did not. A branch relation has no `fact.palace` - its span
  // lives in `provenance.positions_id` because it sits in two or more places - so
  // blockFor skipped it and every floor relation block said WHAT the relation is
  // and never WHERE. Measured before the fix: 0 of 18 relation blocks across the
  // fixture named their span; chart 6's block opened "Gesekan (Harm)." and located
  // nothing.
  //
  // The gate could not catch this: fact.relation_positions SKIPS a block that names
  // no position at all, which is why four rounds of that check's own bugs never
  // surfaced here. So this test is the guard the gate cannot be.
  let relations = 0;
  for (const tc of [...VALIDATION_CHARTS, { id: 'hourless', date: '1989-02-04', time: null }]) {
    const json = jsonFor(tc);
    const out = assembleFallback(json);
    for (const fact of json.facts.filter((f) => f.provenance?.kind === 'branch_relation')) {
      relations += 1;
      const block = out.blocks.find((b) => b.fact_ids.includes(fact.id));
      if (!block) continue; // below the coverage floor, legitimately not rendered
      assert.ok(block.text.includes(fact.provenance.positions_id),
        `chart ${tc.id}: ${fact.id} block does not state its span `
        + `(${fact.provenance.positions_id})`);
    }
  }
  assert.ok(relations >= 17, `expected the fixture to exercise relations, saw ${relations}`);
});

test('the floor never leaves a strength label bare (rule 21, same breath)', () => {
  // glossary kekuatan._note: lemah/kuat must co-occur with its meaning sentence.
  // Structural here - the label and its meaning share ONE text field, so no
  // layout decision downstream can separate them.
  let seen = 0;
  for (const tc of VALIDATION_CHARTS) {
    const json = jsonFor(tc);
    const strength = json.facts.find((f) => f.id.startsWith('strength_'));
    if (!strength) continue;
    const block = assembleFallback(json).blocks.find((b) => b.fact_ids[0] === strength.id);
    if (!block) continue; // below the coverage floor on this chart
    seen += 1;
    const labelAt = block.text.indexOf(strength.label);
    assert.ok(labelAt >= 0, `chart ${tc.id}: strength label absent`);
    assert.ok(
      block.text.includes(strength.label_meaning),
      `chart ${tc.id}: strength label rendered without its meaning`,
    );
    assert.ok(
      block.text.indexOf(strength.label_meaning) > labelAt,
      `chart ${tc.id}: the meaning must follow the label, not precede it`,
    );
  }
  assert.ok(seen > 0, 'no chart exercised the strength block');
});

test('the floor names a badge and never names a null-label condition', () => {
  // "Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu" is the
  // failure the prompt calls out. A condition is described, never named.
  const out = assembleFallback(CHART_1);
  // The palace leads, then the name. Added when Stage 6 caught the floor
  // dropping the palace its own required_point demands.
  const badge = out.blocks.find((b) => b.fact_ids[0] === 'badge_桃花');
  assert.match(badge.text, /^Pilar Kerja\. Bunga Persik \(Peach Blossom\)\./);

  const missing = out.blocks.find((b) => b.fact_ids[0] === 'element_missing_Wood');
  const fact = CHART_1.facts.find((f) => f.id === 'element_missing_Wood');
  assert.equal(fact.label, null, 'fixture assumption: a missing element carries no name');
  assert.equal(missing.heading, '');
  assert.ok(missing.text.startsWith(fact.label_meaning), 'the condition is described, not named');
  assert.ok(!missing.text.includes('Missing Wood'), 'a condition must not wear its bracket');

  // A HEADING-LESS BLOCK MUST STILL CARRY ITS CONTENT, because that is what makes
  // it safe for a renderer to skip the heading rather than print an empty marker.
  // Added 2026-08-21: docs/qa/2026-08-17-renders.md, chart 1's floored render,
  // emitted a bare "### " between "Setengah Gabungan" and "Aspek Pengatur". The
  // DATA above is correct and deliberate - the defect was in the renderer, and
  // scripts/qa-renders.mjs now omits the marker instead of printing it empty.
  // A floored reading is served to real readers (soft findings keep serving, the
  // 2026-08-11 ruling), so this is a live surface and not a probe artifact.
  assert.ok(missing.text.trim().length > 0,
    'a block with no heading must still carry text, or skipping the heading loses it');
});

test('EVERY heading-less floor block still carries text, on every fixture chart', () => {
  // The generalisation of the block above, across the fixture rather than one
  // chart, so a new null-label fact type cannot reintroduce a block that renders
  // as nothing at all.
  let seen = 0;
  for (const tc of VALIDATION_CHARTS) {
    const semantic = buildSemanticJson(calculateBaziChart({
      birthDate: tc.date, birthTime: tc.time,
    }));
    for (const b of assembleFallback(semantic).blocks) {
      if (b.heading !== '') continue;
      seen++;
      assert.ok(b.text.trim().length > 0,
        `chart ${tc.id}: ${b.fact_ids.join(',')} has neither heading nor text`);
    }
  }
  assert.ok(seen > 0, 'no chart exercised a heading-less block, so this asserts nothing');
});

test('the floor reports the two things it cannot say', () => {
  // Both would be new user-facing Indonesian copy, and Reyner is the sole
  // authority on register. Reported as data rather than invented.
  const out = assembleFallback(CHART_1);
  assert.equal(out.penutup, '');
  assert.equal(out.notes.penutup_unavailable, true);
  assert.equal(typeof out.notes.hour_known, 'boolean');
});

// ── the result cache (Stage 4 check + Stage 7 store) ───────
// Against the in-memory dev backend. Supabase is not configured in tests, and
// the two paths are the same shape by construction.

test('a stored reading round-trips on its key, with its attribution', async () => {
  __clearMemCache(); __clearMemRateLimit();
  const key = cacheKey(CHART_1);
  const out = assembleFallback(CHART_1);

  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: out.blocks,
    penutup: out.penutup,
    source: 'gemini',
    model: 'gemini-3.1-flash-lite',
    promptVersion: PROMPT_VERSION,
    stage6Version: 'test-gate-1',
  });

  const row = await readCache(key);
  assert.equal(row.cache_key, key);
  assert.equal(row.blocks.length, out.blocks.length);
  // Flagged readings must be attributable to the exact model AND prompt.
  assert.equal(row.model, 'gemini-3.1-flash-lite');
  assert.equal(row.prompt_version, PROMPT_VERSION);
  assert.equal(row.status, 'unreviewed');
});

test('a row written with no Stage 6 gate is never returned to a serve path', async () => {
  // G task 3. This is the pre-H state: nothing validated it, so nothing serves
  // it - and it stays unservable AFTER H lands, because the discriminator is the
  // absent stage6_version rather than a status that H would start overwriting.
  __clearMemCache(); __clearMemRateLimit();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: assembleFallback(CHART_1).blocks,
    penutup: '',
    source: 'module_assembly',
    stage6Version: null,
  });

  assert.equal(await readCache(key), null, 'an ungated row reached the serve path');
  const qa = await readCache(key, { includeUnvalidated: true });
  assert.ok(qa, 'QA must still be able to see it');
  assert.equal(qa.stage6_version, null);
});

test('the cache refuses to store an empty reading', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await assert.rejects(
    () => writeCache('k', { engineVersion: 'v', blocks: [], source: 'gemini' }),
    /empty reading/,
  );
  await assert.rejects(
    () => writeCache('', { engineVersion: 'v', blocks: [{}], source: 'gemini' }),
    /no cache key/,
  );
});

test('a flagged reading keeps serving', async () => {
  // pipeline-spec Stage 7: pulling it leaves a hole for every user who shares
  // that semantic profile.
  __clearMemCache(); __clearMemRateLimit();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: assembleFallback(CHART_1).blocks,
    penutup: 'x',
    source: 'gemini',
    stage6Version: 'test-gate-1',
  });
  await flagCache(key);

  const row = await readCache(key);
  assert.equal(row.status, 'flagged');
  assert.ok(row.blocks.length > 0, 'a flagged reading still serves');
});

// ── the failover chain ─────────────────────────────────────
// Injected fetch throughout. No key is ever read for its value, only for its
// presence, and no request leaves the process.

const okBody = (payload) => ({
  ok: true, status: 200, json: async () => payload, text: async () => JSON.stringify(payload),
});
const geminiSays = (text) => okBody({ candidates: [{ content: { parts: [{ text }] } }] });
const httpError = (status) => ({
  ok: false, status, text: async () => 'boom', json: async () => ({}),
});

/**
 * A response that passes Stage 6.
 *
 * Derived from the module floor rather than hand-written, so the fixture cannot
 * drift away from what the gate accepts, and so this file authors no Indonesian
 * (Reyner is the sole authority on register). The penutup is a glossary sentence
 * for the same reason - the floor leaves penutup empty and the shape contract
 * requires a non-empty one.
 *
 * Before Prompt H this was a two-word stub. It now has to be a real reading,
 * which is the gate doing its job on the test suite as well as on a provider.
 */
// The penutup is a FIXTURE sentence, not glossary content. It used to be
// `day_master_Fire.label_meaning`, which the floor already renders inside a block,
// so this "valid" render repeated itself and `structure.duplicate_sentence` sent it
// to the floor the moment that check landed (2026-08-04). Any glossary string would
// collide the same way - the floor renders every string of every fact. Same fix as
// goodReading() in tests/stage6-validation.spec.mjs, which carries the long version.
const goodRender = (() => {
  const floor = assembleFallback(CHART_1);
  return JSON.stringify({
    blocks: floor.blocks,
    penutup: 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.',
  });
})();
const validRender = goodRender;

async function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k];
  }
  try {
    return await fn();
  } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

test('a first-try Gemini render returns with its attribution', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return geminiSays(validRender); },
    });
    assert.equal(calls, 1);
    assert.equal(out.source, 'gemini');
    assert.equal(out.model, 'gemini-3.1-flash-lite');
    assert.equal(out.prompt_version, PROMPT_VERSION);
    assert.equal(out.cached, false);
    assert.equal(out.cache_key, cacheKey(CHART_1));
  });
});

// ── SPEND GUARD (b): IN-FLIGHT DE-DUPLICATION ──

test('SPEND GUARD (b): eight concurrent misses on one chart share ONE chain', async () => {
  // THE SHAPE THIS EXISTS FOR. The funnel polls every 3s and a render takes a
  // measured p50 of 7.6s per attempt, up to ~23s at three - so roughly eight polls
  // land inside one render, and before this each one started its own chain. Not a
  // poll bug: a refresh, two tabs, or a shared link opened twice do the same.
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    let release;
    const gate = new Promise((r) => { release = r; });
    // One transport object, shared by every caller: that is what production looks
    // like, where all of them pass undefined.
    const fetchImpl = async () => { calls += 1; await gate; return geminiSays(validRender); };

    const all = Promise.all(Array.from({ length: 8 }, () => renderReading(CHART_1, { fetchImpl })));
    // Let all eight reach the map before the single chain is allowed to finish.
    await new Promise((r) => { setImmediate(r); });
    release();
    const outs = await all;

    assert.equal(calls, 1, 'eight concurrent callers, ONE provider call');
    assert.equal(outs.length, 8);
    for (const out of outs) assert.equal(out.source, 'gemini', 'and every caller gets the reading');

    // A SHALLOW COPY EACH, not one shared object. Two callers holding one
    // reference means one can mutate a field the other reads.
    assert.ok(outs[0] !== outs[1], 'each caller gets its own object');
    outs[0].source = 'mutated';
    assert.equal(outs[1].source, 'gemini', 'and mutating one must not touch another');
  });
});

test('SPEND GUARD (b): the map is cleared on failure, so one chart is not pinned to it', async () => {
  // A rejected chain left in the map would serve its own failure to every later
  // caller for the life of the instance - a cache of a failure, which is the exact
  // thing rule 16 refuses for the floor.
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const boom = async () => { throw new Error('transport is down'); };
    await assert.rejects(
      () => renderReading(CHART_1, { fetchImpl: boom, allowFallback: false }),
    );

    // A fresh caller must get a fresh chain rather than the stored rejection.
    __clearMemCache();
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return geminiSays(validRender); },
    });
    assert.equal(calls, 1, 'the next caller ran its own chain');
    assert.equal(out.source, 'gemini');
  });
});

test('SPEND GUARD (b): callers wanting DIFFERENT renders are never given each other\'s', async () => {
  // A shared promise hands the first caller's options to every later one. Two
  // callers wanting one chart at different regeneration budgets want different
  // renders, and quietly serving one the other's result would be a correctness bug
  // wearing a performance fix's clothes. The map key carries an option signature.
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const fetchImpl = async () => { calls += 1; return geminiSays(validRender); };
    await Promise.all([
      renderReading(CHART_1, { fetchImpl, validationRetries: 0 }),
      renderReading(CHART_1, { fetchImpl, validationRetries: 3 }),
    ]);
    assert.equal(calls, 2, 'different options, different chains');
  });
});

// ── SPEND GUARD (a): RENDERS PER CACHE KEY ──

test('SPEND GUARD (a): the fourth render of one chart in an hour serves the floor', async () => {
  // WHAT THIS BOUNDS. Rule 16 forbids persisting a floor, so a floored reader who
  // reloads gets a genuinely fresh render - which self-heals quality and is the
  // same sentence as unbounded cost. Three per hour per cache key, tuned so one
  // reload still heals (Reyner, 2026-08-22).
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    // The cache is cleared between renders so every call is a genuine miss. That
    // is the floored-reader-reloading shape: nothing was persisted, so nothing hits.
    const render = async () => {
      __clearMemCache();
      return renderReading(CHART_1, {
        fetchImpl: async () => { calls += 1; return geminiSays(validRender); },
      });
    };

    for (let i = 1; i <= 3; i += 1) {
      const out = await render();
      assert.equal(out.source, 'gemini', `render ${i} of 3 must still reach the provider`);
    }
    assert.equal(calls, 3, 'three renders, three provider calls');

    const fourth = await render();
    assert.equal(calls, 3, 'the fourth must not reach the provider at all');

    // IT SERVES, IT DOES NOT 503. Rule 17 names module assembly the
    // always-available floor and this is the condition it is for. A spend guard
    // that took the page away would trade a cost problem for an outage.
    assert.equal(fourth.source, 'module_assembly');
    assert.ok(fourth.blocks.length > 0, 'the reader still gets a reading');
    assert.equal(fourth.qa_flag, 'spend_guard_renders_per_key',
      'and the floor names the guard, not a gate it never reached');
    assert.equal(fourth.stage6_version, `${STAGE6_VERSION}-floor`);

    // The refusal is recorded as an attempt so a floor-rate measurement can tell
    // it from a GATE floor. Conflating the two is the transport-truncation trap
    // one level up, where one 503 turned a real 0 of 39 into a reported 3%.
    const guarded = (fourth.attempts || []).filter((a) => a.spend_guard);
    assert.equal(guarded.length, 1);
    assert.equal(guarded[0].provider, null, 'no provider was involved');
    assert.ok(guarded[0].retry_after > 0, 'and it carries when to try again');
  });
});

test('SPEND GUARD (a): a cache HIT is never charged, so a returning reader is free', async () => {
  // The guard is charged after the cache read for exactly this reason. A shared
  // link that gets read a hundred times costs one render, and metering the reads
  // would refuse the 4th visitor a reading that was already paid for and stored.
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const key = cacheKey(CHART_1);
    await writeCache(key, {
      engineVersion: CHART_1.engine_version,
      blocks: assembleFallback(CHART_1).blocks,
      penutup: 'x',
      source: 'gemini',
      model: 'm',
      promptVersion: 'p',
      stage6Version: STAGE6_VERSION,
    });
    for (let i = 0; i < 6; i += 1) {
      const out = await renderReading(CHART_1, {
        fetchImpl: async () => { throw new Error('must not be called'); },
      });
      assert.equal(out.cached, true, `visit ${i + 1} is a hit`);
      assert.equal(out.source, 'gemini', 'and it is the real reading, not the floor');
    }
  });
});

test('SPEND GUARD (a): the QA opt-out exists, because the guard would break the instrument', async () => {
  // `qa:renders --n 10` renders one chart ten times in minutes. With the guard on,
  // runs 4-10 would floor and the artifact would report a ~70% floor rate for a
  // system at 10% - the guard destroying the instrument that measures the thing
  // the guard exists to bound. Asserted rather than trusted to a comment.
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    for (let i = 0; i < 6; i += 1) {
      __clearMemCache();
      const out = await renderReading(CHART_1, {
        spendGuards: false,
        fetchImpl: async () => { calls += 1; return geminiSays(validRender); },
      });
      assert.equal(out.source, 'gemini', `run ${i + 1} must reach the provider`);
    }
    assert.equal(calls, 6, 'six runs, six provider calls, no guard in the way');
  });
});

test('the master prompt is the front and the chart JSON is the back', async () => {
  // pipeline-spec PAYLOAD STRUCTURE. Chart data in the system instruction would
  // break the cacheable prefix on every call.
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let body;
    await renderReading(CHART_1, {
      fetchImpl: async (_url, init) => {
        body = JSON.parse(init.body);
        return geminiSays(validRender);
      },
    });
    const front = body.systemInstruction.parts[0].text;
    const back = body.contents[0].parts[0].text;
    assert.equal(front, MASTER_PROMPT, 'the front must be the prompt, verbatim');
    assert.ok(!front.includes('void_stack_month'), 'chart data leaked into the cacheable front');
    assert.equal(JSON.parse(back).engine_version, CHART_1.engine_version);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
  });
});

test('a transient failure retries once, then the chain lands on the floor', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return httpError(503); },
    });
    assert.equal(calls, 2, 'retry 1 means two attempts');
    assert.equal(out.source, 'module_assembly');
    assert.equal(out.attempts.length, 2);
    assert.ok(out.blocks.length > 0, 'the floor must always produce a reading');
  });
});

test('a non-retryable failure does not spend the second attempt', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return httpError(400); },
    });
    assert.equal(calls, 1, 'a 400 will be a 400 again; retrying only delays the failover');
  });
});

test('an invented fact id fails the attempt like a 500 would', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const invented = JSON.stringify({
      blocks: [{ fact_ids: ['badge_naga_emas'], heading: 'h', text: 't' }],
      penutup: 'p',
    });
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(invented) });
    assert.equal(out.source, 'module_assembly');
    assert.match(out.attempts[0].error, /unknown fact/);
  });
});



test('a cache hit costs no API call', async () => {
  __clearMemCache(); __clearMemRateLimit();
  const key = cacheKey(CHART_1);
  await writeCache(key, {
    engineVersion: CHART_1.engine_version,
    blocks: [{ fact_ids: ['day_master_Fire'], heading: 'h', text: 'tersimpan' }],
    penutup: 'p',
    source: 'gemini',
    model: 'gemini-3.1-flash-lite',
    promptVersion: PROMPT_VERSION,
    stage6Version: 'test-gate-1',
  });

  await withEnv({ GEMINI_API_KEY: 'test' }, async () => {
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { throw new Error('the cache did not short-circuit'); },
    });
    assert.equal(out.cached, true);
    assert.equal(out.blocks[0].text, 'tersimpan');
  });
});

test('production with no Gemini key REFUSES rather than degrading quietly', async () => {
  // G task 1: a misconfigured deploy must be loud. Silently serving the floor
  // forever is indistinguishable from an outage and means something else.
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ NODE_ENV: 'production', GEMINI_API_KEY: undefined }, async () => {
    await assert.rejects(
      () => renderReading(CHART_1, { fetchImpl: async () => geminiSays(validRender) }),
      (err) => err.name === 'RenderRefused' && err.reason === 'gemini_api_key_unset',
    );
  });
});

test('measurement mode refuses the floor instead of counting it as a pass', async () => {
  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    await assert.rejects(
      () => renderReading(CHART_1, {
        allowFallback: false,
        fetchImpl: async () => httpError(500),
      }),
      (err) => err.name === 'RenderRefused' && err.reason === 'all_providers_failed',
    );
  });
});

// ── the Stage 6 fence ──────────────────────────────────────

test('the fence is OPEN now that Prompt H built the gate, and it names the gate', async () => {
  // Prompt G left this null because no gate existed. H built one. The fence
  // re-exports lib/validate's version rather than declaring its own, so it can
  // only be open when the validating code is actually there.
  assert.equal(STAGE6_VERSION, GATE_VERSION);
  assert.match(STAGE6_VERSION, /^\d+\.\d+\.\d+$/);
  assert.equal(serveFenceReason(), null);
  assert.equal(serveAllowed(), true);

  __clearMemCache(); __clearMemRateLimit();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(validRender) });
    assert.equal(out.stage6_version, STAGE6_VERSION, 'a passing render records its gate');
    await persistRendered(out, CHART_1);

    // Servable WITHOUT includeUnvalidated: the gate ran, so the row is real.
    const row = await readCache(out.cache_key);
    assert.ok(row, 'a validated reading must be servable');
    assert.equal(row.stage6_version, STAGE6_VERSION);
  });
});

test('rows written before the gate existed stay unservable after it exists', async () => {
  // The discriminator was chosen to survive exactly this moment. A status flag
  // would have been overwritten by H; a null stage6_version cannot be.
  __clearMemCache(); __clearMemRateLimit();
  await writeCache('legacy-key', {
    engineVersion: CHART_1.engine_version,
    blocks: [{ fact_ids: ['day_master_Fire'], heading: 'h', text: 'ditulis sebelum gerbang ada' }],
    penutup: 'p',
    source: 'gemini',
    stage6Version: null,
  });
  assert.equal(await readCache('legacy-key'), null);
  assert.ok(await readCache('legacy-key', { includeUnvalidated: true }));
});

// ── the UI contract and the chrome copy ────────────────────

test('a block splits on the double break, and on nothing else', () => {
  assert.deepEqual(splitParagraphs('Satu.\n\nDua.'), ['Satu.', 'Dua.']);
  // A lone newline is never a paragraph break. It stays inside the paragraph so
  // the gate can see it; pre-wrap would have rendered it as a visible artefact.
  assert.deepEqual(splitParagraphs('Satu.\nDua.'), ['Satu.\nDua.']);
  // 3+ collapse rather than producing an empty paragraph.
  assert.deepEqual(splitParagraphs('Satu.\n\n\n\nDua.'), ['Satu.', 'Dua.']);
  assert.deepEqual(splitParagraphs('   '), []);
  assert.deepEqual(splitParagraphs(undefined), []);
});

test('the strict view reports what the tolerant one repairs', () => {
  // Prompt H reads this one. Reports, never fixes.
  const got = inspectParagraphs('Satu.\nDua.\n\nTiga.\n\n\nEmpat.');
  assert.equal(got.paragraphs.length, 3);
  assert.equal(got.breakCount, 2);
  assert.equal(got.strayNewlines, 1, 'the lone newline must be visible to the gate');
  assert.equal(inspectParagraphs('Satu.\n\nDua.').strayNewlines, 0);
});

test('the loading copy never advertises the AI', () => {
  // Decided in PROGRESS: naming the model invites "it just rephrased my input".
  assert.equal(RENDER_COPY.loading, 'Menghitung bagan kelahiranmu');
  for (const banned of ['AI', 'Gemini', 'GPT', 'model', 'kecerdasan']) {
    assert.ok(!RENDER_COPY.loading.includes(banned), `loading copy names "${banned}"`);
  }
  // Rule 20's audit surface. scripts/check-copy.js walks this object too.
  for (const value of Object.values(RENDER_COPY)) {
    assert.ok(!/[—–‘’“”…]/.test(value), `banned typography in "${value}"`);
  }
});

test('target_language is set before keying, so two languages are two entries', () => {
  const en = withTargetLanguage(CHART_1, 'en');
  assert.equal(en.target_language, 'en');
  assert.equal(CHART_1.target_language, 'id', 'the input must not be mutated');
  assert.notEqual(cacheKey(en), cacheKey(CHART_1));
});

test('THE FLOOR OPENS WITH ONE CLAUSE, not two bare label-sentences', () => {
  // CORRECTED 2026-08-21. Ordering the archetype first was necessary and not
  // sufficient: the floor then opened "Matahari (The Sun)." "Api (Fire)." - two
  // noun-phrases, no verb - and Reyner ruled that shape UNSELLABLE as-is.
  //
  // It passed `opening.archetype_missing` the whole time, because that check asserts
  // the NAME is present and cannot see whether a sentence says anything. That
  // weakness is recorded in PROGRESS rather than fixed here.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const first = assembleFallback(semantic).blocks[0];
    const opening = sentences(first.text)[0];
    const arche = semantic.core.archetype_name_id;
    const element = semantic.facts.find((f) => f.id.startsWith('day_master_'))?.label;

    // ONE sentence carries both, and it carries a verb from the copy bank.
    assert.ok(opening.includes(arche), `chart ${tc.id}: the opening must name the archetype`);
    assert.ok(opening.includes(element), `chart ${tc.id}: and the element, in the SAME sentence`);
    assert.ok(opening.includes(RENDER_COPY.floorIdentity.lead),
      `chart ${tc.id}: the clause must come from the audited bank, not from punctuation`);

    // And the element is NOT bracketed: rule 23's ruled scope binds Aspek, Bintang
    // and Arketipe and explicitly not Elemen.
    const bracket = semantic.facts.find((f) => f.id.startsWith('day_master_'))?.label_bracket;
    assert.ok(!opening.includes(`${element} (${bracket})`),
      `chart ${tc.id}: Elemen must not be bracketed (Reyner, verdict section 3)`);

    // The regression this test exists for: the element must not be its own sentence.
    assert.ok(!sentences(first.text).includes(`${element} (${bracket}).`),
      `chart ${tc.id}: the element is a bare label-sentence again`);
  }
});

test('the floor is not FUSED either - the element follows the image, never precedes it', () => {
  // `Api Matahari` is the shape rejected on chart 13. The clause puts the image
  // first and the element after, so `opening.element_fused` must not fire on the
  // always-available floor.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const opening = sentences(assembleFallback(semantic).blocks[0].text)[0];
    const arche = semantic.core.archetype_name_id;
    const element = semantic.facts.find((f) => f.id.startsWith('day_master_'))?.label;
    // `\\s` and not `\s`: inside a template literal the single backslash is dropped,
    // so the pattern would have been `Apis+Matahari` and matched nothing. eslint's
    // no-useless-escape caught it, which is the only reason this test is not vacuous.
    assert.ok(!new RegExp(`${element}\\s+${arche}`).test(opening),
      `chart ${tc.id}: the floor opens fused - "${opening}"`);
  }
});
