// ============================================================
// tests/compat-p0-engine.spec.mjs — the opening is the engine's sentence
// ============================================================
// Prompt Z section 3c, ruled after the three-pair walk. The defect is E2 in
// `docs/qa/2026-09-11-compat-three-pair-walk.md`: the Y-1 round-1 reading opened
// "Bacaan ini menyoroti dinamika antara dua individu dengan arketipe Matahari dan
// Taman", where the ruled sentence is "Ini adalah bacaan tentang dua individu:
// Matahari dan Taman". `pair.both_named` passed it, correctly - both names are
// there - and that is the point: no check that reads for NAMES can hold a ruled
// SENTENCE, so the sentence stopped being the model's to write.
//
// ── WHAT WENT RED, AND ON WHICH BUILD ──────────────────────
// Every assertion below was run against the unmodified main build first, with
// `lib/render/pairOpening.js` present but its two call sites in
// lib/render/index.js commented out. Recorded in the commit message with the
// output. The one that matters is the last test in this file: without the
// injection an opening that names NEITHER person reaches the gate and
// `pair.both_named` fires; with it, the engine's sentence is what the gate reads.
// A test that only asserted "the opening is the ruled string" would also pass on
// a build where the model happened to copy it.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { engineOpening, withEngineOpening, OPENING_FACT_ID } from '../lib/render/pairOpening.js';
import { renderReading, __clearInFlight } from '../lib/render/index.js';
import { validateRendering } from '../lib/validate/index.js';
import { STRUCTURE_PARAMS } from '../lib/validate/structure.js';
import { GLOSSARY, fillPairTemplate } from '../lib/semantic/glossary.js';
import { __clearMemCache } from '../lib/render/cache.js';
import { __clearMemRateLimit } from '../lib/ratelimit.js';
import { VALIDATION_CHARTS, HOUR_UNKNOWN_CHARTS } from './bazi-validation.fixture.js';

const ALL = [...VALIDATION_CHARTS, ...HOUR_UNKNOWN_CHARTS];
const chartOf = (id) => {
  const row = ALL.find((c) => c.id === id);
  if (!row) throw new Error(`no fixture chart ${id}`);
  return calculateBaziChart({ birthDate: row.date, birthTime: row.time });
};

/**
 * THE SAME ELEVEN THE INSTRUMENT USES. Nine from `scripts/qa-pair-renders.mjs`
 * plus the Y-1 fixture pair, which is the list `scripts/measure-compat-voice.mjs`
 * measures and the walk artifact reports. A twelfth pair invented here would make
 * "11/11" a different eleven than the one in the commit message.
 */
// THE FIXTURE PAYLOAD DOES NOT CARRY THE BIRTHS, and `measure-compat-voice.mjs`
// reads `j.pair` with a hardcoded fallback that is therefore the live path on
// every run:
//   node -e "console.log(Object.keys(require('./tests/fixtures/pair-reading-g4WH4.json')))"
//   -> [ 'status', 'served_from', 'facts', 'reading' ]        (2026-09-13)
// So the two births are written here, matching that fallback exactly, rather than
// read through a lookup that cannot succeed. Logged as a follow-up on the
// instrument, not fixed in this PR: the same dates, either way.
const FIXTURE_PAIR = { a: { date: '1989-09-13', time: '09:00' }, b: { date: '1997-09-14', time: null } };

const PAIRS = [
  ...[[2, 6], [1, 2], [13, 11], [12, 6], [1, 12], [3, 7], [1, 3], [2, 8], [1, 101], [9, 11]]
    .map(([x, y]) => ({ label: `${x} x ${y}`, sj: buildPairSemantic(chartOf(x), chartOf(y)) })),
  {
    label: 'Y-1 fixture',
    sj: buildPairSemantic(
      calculateBaziChart({ birthDate: FIXTURE_PAIR.a.date, birthTime: FIXTURE_PAIR.a.time }),
      calculateBaziChart({ birthDate: FIXTURE_PAIR.b.date, birthTime: FIXTURE_PAIR.b.time }),
    ),
  },
];

/** The ruled cell, filled, exactly as `lib/semantic/pair.js` fills it. */
const ruledOpening = (sj) => fillPairTemplate(
  GLOSSARY.kompatibilitas.p0_opening.label_meaning,
  sj.core.a.archetype_name_id,
  sj.core.b.archetype_name_id,
);

const PENUTUP = 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.';
/** A rendering shaped like a model's, built from the floor's own ruled prose. */
const renderingFor = (sj, mutate = (b) => b) => ({
  blocks: assembleFallback(sj).blocks.map(mutate),
  penutup: PENUTUP,
});

// ── the eleven ─────────────────────────────────────────────

test('11/11 pair openings are the ruled sentence, byte for byte', () => {
  assert.equal(PAIRS.length, 11);
  for (const { label, sj } of PAIRS) {
    const block = engineOpening(sj);
    assert.ok(block, `${label}: no opening block`);
    assert.deepEqual(block.fact_ids, [OPENING_FACT_ID], label);
    // THE FULL STOP IS THE FLOOR'S `sentence()`, not a second formatter: the cell
    // ends without terminal punctuation and `blockFor` closes it. If the cell ever
    // gains its own full stop this goes red, which is the correct outcome - two
    // full stops in the opening is exactly the kind of thing nobody would notice.
    assert.equal(block.text, `${ruledOpening(sj)}.`, label);
  }
});

test('THE FLOOR IS BYTE-IDENTICAL: injection changes nothing on the assembled path', () => {
  // The claim the floor-path call site makes in its own comment, asserted rather
  // than reasoned about. The floor already assembles `p0_opening` first because it
  // is the first required point; this says so with an assertion, so the day that
  // ordering changes the injection is visibly doing work instead of silently
  // starting to.
  for (const { label, sj } of PAIRS) {
    const floor = assembleFallback(sj);
    const { rendered, hadOwnOpening } = withEngineOpening(floor, sj);
    assert.equal(hadOwnOpening, true, `${label}: the floor did not carry p0_opening`);
    assert.deepEqual(rendered, floor, label);
  }
});

test('THE OPENING CANNOT TRIP block_too_short, for ANY pair of archetypes', () => {
  // ── FOUND BY THE FALSIFICATION RUN, NOT BY READING THE CODE ──
  // Disabling the injection made a 34-character stand-in opening floor the render
  // on `structure.block_too_short` (minBlockChars 40), and that is a hazard this
  // change introduces: until now the model wrote a long opening and this short
  // ruled sentence only ever appeared on the floor, which no gate reads. It now
  // reaches Stage 6 on every pair render.
  //
  // Asserted over all 45 archetype pairs rather than the 11 rendered above,
  // because the failure would be a NAME-LENGTH failure and the eleven do not
  // contain the shortest two names. 40 is unfitted and may move; if it ever moves
  // past the shortest opening, this goes red before a reader sees a floor.
  const names = Object.values(GLOSSARY.arketipe).map((v) => v.name_id).filter(Boolean);
  assert.equal(names.length, 10, 'rule 24: exactly ten archetypes');

  let shortest = Infinity;
  for (const a of names) {
    for (const b of names) {
      if (a === b) continue;
      shortest = Math.min(shortest, `${fillPairTemplate(GLOSSARY.kompatibilitas.p0_opening.label_meaning, a, b)}.`.length);
    }
  }
  assert.ok(
    shortest >= STRUCTURE_PARAMS.minBlockChars,
    `shortest possible opening is ${shortest} chars, floor is ${STRUCTURE_PARAMS.minBlockChars}`,
  );
});

// ── the model's opening is dropped ─────────────────────────

test("E2's own paraphrase is replaced, and does not survive anywhere", () => {
  const { sj } = PAIRS[1];
  // The literal round-1 Y-1 opening from the walk artifact, with this pair's
  // names. Verbatim from the artifact rather than invented, so the test is about
  // the render that was actually rejected.
  const paraphrase = `Bacaan ini menyoroti dinamika antara dua individu dengan arketipe ${sj.core.a.archetype_name_id} dan ${sj.core.b.archetype_name_id}.`;
  const model = renderingFor(sj, (b) => (
    b.fact_ids[0] === OPENING_FACT_ID ? { ...b, text: paraphrase } : b
  ));

  const { rendered, hadOwnOpening } = withEngineOpening(model, sj);
  assert.equal(hadOwnOpening, true);
  assert.equal(rendered.blocks[0].text, `${ruledOpening(sj)}.`);
  assert.equal(
    JSON.stringify(rendered).includes('menyoroti dinamika'), false,
    'the model opening was kept somewhere',
  );
  // The reading did not LOSE a block: one in, one out.
  assert.equal(rendered.blocks.length, model.blocks.length);
});

test('a model opening braided with P1 keeps P1 and loses only the claim', () => {
  // The recorded limit in pairOpening.js, held to an assertion so it stays a
  // limit rather than becoming a surprise. Dropping the whole block here would
  // drop P1 with it, which is a worse reading than one whose P1 opens late.
  const { sj } = PAIRS[0];
  const p1 = sj.facts.find((f) => f.id.startsWith('p1_'));
  const model = {
    blocks: [{ fact_ids: [OPENING_FACT_ID, p1.id], heading: 'Dua orang', text: 'Dua orang bertemu di sini.' }],
    penutup: PENUTUP,
  };

  const { rendered, hadOwnOpening } = withEngineOpening(model, sj);
  assert.equal(hadOwnOpening, true);
  assert.equal(rendered.blocks.length, 2);
  assert.deepEqual(rendered.blocks[1].fact_ids, [p1.id]);
  assert.equal(rendered.blocks[1].text, 'Dua orang bertemu di sini.');
});

// ── the mirror is not touched ──────────────────────────────

test('THE MIRROR IS UNTOUCHED: no opening is injected into a mirror reading', () => {
  const mirror = buildSemanticJson(chartOf(1));
  assert.equal(mirror.kind, 'mirror');
  assert.equal(engineOpening(mirror), null);

  const floor = assembleFallback(mirror);
  const { rendered, hadOwnOpening } = withEngineOpening(floor, mirror);
  assert.equal(hadOwnOpening, false);
  assert.equal(rendered, floor, 'the mirror rendering was copied, not passed through');
});

// ── through renderReading, on both paths ───────────────────

const okBody = (json) => ({ ok: true, status: 200, json: async () => json, text: async () => '' });
const geminiSays = (text) => okBody({ candidates: [{ content: { parts: [{ text }] } }] });

async function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) {
    saved[k] = process.env[k];
    if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k];
  }
  try { return await fn(); } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

/** The floor's own prose as a model response, with the opening block mutated. */
const modelResponse = (sj, mutate) => JSON.stringify(renderingFor(sj, mutate));

test('THE MODEL PATH: a paraphrased opening is replaced before the gate, and counted', async () => {
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  const { sj } = PAIRS[1];
  await withEnv({ GEMINI_API_KEY: 'test' }, async () => {
    const out = await renderReading(sj, {
      dedupeInFlight: false,
      spendGuards: false,
      fetchImpl: async () => geminiSays(modelResponse(sj, (b) => (
        b.fact_ids[0] === OPENING_FACT_ID
          ? { ...b, text: `Dua individu: ${sj.core.a.archetype_name_id} dan ${sj.core.b.archetype_name_id}.` }
          : b
      ))),
    });

    assert.equal(out.source, 'gemini', `floored instead: ${JSON.stringify(out.findings)}`);
    assert.equal(out.blocks[0].text, `${ruledOpening(sj)}.`);
    assert.equal(out.stage6_version, '1.24.0');
    // LOG ONLY, on the attempt record the QA tape already reads.
    assert.equal(out.attempts.at(-1).p0_model_wrote_anyway, true);
  });
});

test('THE MODEL PATH: a model that obeys is not counted', async () => {
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  const { sj } = PAIRS[1];
  await withEnv({ GEMINI_API_KEY: 'test' }, async () => {
    const out = await renderReading(sj, {
      dedupeInFlight: false,
      spendGuards: false,
      // The prompt's instruction obeyed: no p0 block at all.
      fetchImpl: async () => geminiSays(JSON.stringify({
        blocks: assembleFallback(sj).blocks.filter((b) => b.fact_ids[0] !== OPENING_FACT_ID),
        penutup: PENUTUP,
      })),
    });

    assert.equal(out.source, 'gemini', `floored instead: ${JSON.stringify(out.findings)}`);
    assert.equal(out.blocks[0].text, `${ruledOpening(sj)}.`);
    assert.equal(out.attempts.at(-1).p0_model_wrote_anyway, undefined);
  });
});

test('THE FLOOR PATH: the provider fails, the reader still gets the ruled opening', async () => {
  __clearMemCache(); __clearMemRateLimit(); __clearInFlight();
  const { sj } = PAIRS[1];
  await withEnv({ GEMINI_API_KEY: 'test' }, async () => {
    // The exact failure round 1 hit on 2x6: the provider is gone, the floor
    // serves, and it must serve rather than 503.
    const out = await renderReading(sj, {
      dedupeInFlight: false,
      spendGuards: false,
      fetchImpl: async () => ({ ok: false, status: 503, text: async () => 'boom', json: async () => ({}) }),
    });

    assert.equal(out.source, 'module_assembly');
    assert.equal(out.blocks[0].text, `${ruledOpening(sj)}.`);
    assert.deepEqual(out.blocks[0].fact_ids, [OPENING_FACT_ID]);
  });
});

// ── THE ASSERTION THAT GOES RED WITHOUT THE CHANGE ─────────

test('WITHOUT THE INJECTION both_named fires; WITH it the gate reads the ruled sentence', () => {
  const { sj } = PAIRS[1];
  // An opening that names NEITHER person. This is what the injection is for: not
  // "the sentence is prettier", but "the reading that used to be unservable is
  // now servable because the engine supplied the part the model got wrong".
  const nameless = renderingFor(sj, (b) => (
    b.fact_ids[0] === OPENING_FACT_ID
      ? { ...b, text: 'Bacaan ini membahas hubungan antara dua orang.' }
      : b
  ));

  const before = validateRendering(nameless, sj, { provider: 'gemini' });
  assert.equal(
    before.findings.some((f) => f.check === 'pair.both_named'), true,
    'the un-injected rendering was supposed to fail both_named',
  );

  const after = validateRendering(withEngineOpening(nameless, sj).rendered, sj, { provider: 'gemini' });
  assert.equal(after.findings.some((f) => f.check === 'pair.both_named'), false);
});
