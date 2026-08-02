// ============================================================
// Stage 6 — the gate
// ============================================================
// Run: npm run test:stage6
//
// One adversarial fixture per check, asserting REJECTION, plus a known-good
// reading asserting a PASS. A gate with only negative tests rejects everything
// and looks healthy doing it.
//
// The known-good is the module-assembled floor, not hand-written prose. Two
// reasons: this file then authors no Indonesian (Reyner is the sole authority on
// register), and it asserts something worth asserting on its own - rule 17 calls
// module assembly the always-available floor beneath both providers, so a floor
// that cannot pass the gate is not a floor.
//
// NOTE: run with `node --conditions=react-server` (the npm script does this).
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';

import { assembleFallback } from '../lib/render/fallback.js';
import { renderReading, persistRendered } from '../lib/render/index.js';
import { readCache, __clearMemCache } from '../lib/render/cache.js';
import { MASTER_PROMPT } from '../lib/render/prompt.js';
import { scrubInternal, internalFieldNames } from '../lib/render/payload.js';
import {
  validateRendering, stricterDirective, STAGE6_VERSION, CATEGORIES,
} from '../lib/validate/index.js';
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };
import { stemOverlap, distinctiveStems } from '../lib/validate/text.js';

const jsonFor = (tc) => buildSemanticJson(calculateBaziChart({
  birthDate: tc.date, birthTime: tc.time,
}));
const CHART_1 = jsonFor(VALIDATION_CHARTS[0]);

/** The floor, plus a glossary sentence for the penutup the floor cannot write. */
function goodReading(semantic = CHART_1) {
  const floor = assembleFallback(semantic);
  const core = semantic.facts.find((f) => f.type === 'core' && f.label_meaning);
  return { blocks: floor.blocks, penutup: core.label_meaning };
}

/** Deep copy with one block's text replaced, so fixtures stay one-line diffs. */
function withBlockText(reading, factId, text) {
  const copy = structuredClone(reading);
  const block = copy.blocks.find((b) => b.fact_ids.includes(factId));
  block.text = text;
  return copy;
}

const checksIn = (result) => result.findings.map((f) => f.check);

// ── the gate passes what it should ─────────────────────────

test('the module-assembled floor passes its own gate, on every fixture chart', () => {
  // Rule 17's floor has to clear the bar every other output clears. When this
  // was first run it did NOT - the floor never named a palace, while five of
  // chart 1's nine required points demand one. lib/render/fallback.js now leads
  // each block with the palace. This test is what caught that.
  for (const tc of VALIDATION_CHARTS) {
    const semantic = jsonFor(tc);
    const result = validateRendering(goodReading(semantic), semantic, {
      provider: 'module_assembly',
    });
    assert.ok(result.ok, `chart ${tc.id} floor rejected: ${checksIn(result).join(', ')}`);
    assert.equal(result.hard, false);
  }
});

test('a passing result records the gate version that passed it', () => {
  const result = validateRendering(goodReading(), CHART_1);
  assert.equal(result.stage6_version, STAGE6_VERSION);
  assert.match(STAGE6_VERSION, /^\d+\.\d+\.\d+$/);
});

// ── 1. FACT GUARD ──────────────────────────────────────────

test('a contradicted strength verdict is a HARD reject', () => {
  // The chart is weak. pipeline-spec's example: JSON "Seimbang" + text "lemah".
  const bad = withBlockText(goodReading(), 'strength_weak',
    'Kamu Api Kuat. Tenagamu lahir dari dalam dirimu sendiri dan tidak pernah habis.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(result.hard, 'a false verdict is not a style slip');
  assert.ok(checksIn(result).includes('fact.strength_contradiction'));
});

test('a bare strength label is rejected even when nothing contradicts it', () => {
  // Rule 21 + glossary.kekuatan._note. label and label_meaning are separate JSON
  // fields, so emitting the label alone is mechanically possible and nothing
  // upstream can stop it. This is the check that stops it.
  const bad = withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(
    checksIn(result).some((c) => c.startsWith('fact.strength_')),
    'a label with no resolution must not pass',
  );
});

test('the same-breath check accepts a REWRITE, not just a copy', () => {
  // The prompt forbids copying label_meaning verbatim, so a gate that demanded
  // the verbatim string would reject correct behaviour and reward the run-2
  // transcription failure. Paraphrase that keeps the substance must pass.
  const fact = CHART_1.facts.find((f) => f.id === 'strength_weak');
  const paraphrase = 'Kamu Api Lemah. Lemah di sini tidak berbicara soal kemampuan. '
    + 'Sumber tenagamu berada di luar dirimu, jadi tempat yang tepat membuatmu melesat '
    + 'dan tempat yang salah menguras habis cadanganmu. '
    + `${fact.gift} ${fact.cost}`;
  const result = validateRendering(withBlockText(goodReading(), 'strength_weak', paraphrase),
    CHART_1);
  assert.ok(result.ok, `rejected a valid rewrite: ${checksIn(result).join(', ')}`);

  // And the proxy is doing real work: the paraphrase is NOT the original.
  assert.ok(!paraphrase.includes(fact.label_meaning), 'fixture must not be a copy');
  assert.ok(stemOverlap(fact.label_meaning, paraphrase).ratio > 0.25);
});

test('an invented badge is a HARD reject', () => {
  // The run-1 failure. Chart 1 carries Bunga Persik and Bintang Penolong; it
  // does not carry Mata Pisau.
  assert.ok(!CHART_1.facts.some((f) => f.label === 'Mata Pisau'), 'fixture assumption');
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    'Di petamu ada Mata Pisau, dan itu membuat keputusanmu tajam sejak awal. '
    + 'Kamu memutuskan cepat dan jarang menyesal.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(result.hard);
  assert.ok(checksIn(result).includes('fact.badge_invented'));
});

test('a null-label condition worn as a badge is a HARD reject', () => {
  // renderer-prompt names this failure verbatim.
  const bad = withBlockText(goodReading(), 'element_missing_Wood',
    'Tidak ada satu pun Unsur yang Hilang (Missing Element) berupa Kayu di petamu, '
    + 'dan itu mengubah cara kamu memulai sesuatu yang baru.');
  const result = validateRendering(bad, CHART_1);
  assert.ok(result.hard);
  assert.ok(checksIn(result).includes('fact.condition_named'));
});

test('a dropped palace is caught (observed in gate-check runs 1 and 2)', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'profile_vs_favorable');
  assert.equal(fact.palace, 'Pilar Kerja', 'fixture assumption');
  const bad = withBlockText(goodReading(), 'profile_vs_favorable',
    `${fact.label_meaning} ${fact.gift} ${fact.cost}`); // everything but the palace
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('fact.palace_dropped'));
});

test('a misstated branch-relation span is caught (observed in gate-check run 2)', () => {
  // The 半合 spans year + hour + month; run 2 wrote "tahun dan bulan".
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  assert.deepEqual([...fact.provenance.positions].sort(), ['hour', 'month', 'year']);
  const bad = withBlockText(goodReading(), fact.id,
    `Ini datang dari tahun dan bulan kelahiranmu. ${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  const result = validateRendering(bad, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('fact.relation_positions'));
});

test('naming NO positions is allowed; naming the RIGHT set is allowed', () => {
  // The check must not force the renderer to list pillars it had no reason to.
  const fact = CHART_1.facts.find((f) => f.provenance?.kind === 'branch_relation');
  const silent = withBlockText(goodReading(), fact.id,
    `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(silent, CHART_1)).includes('fact.relation_positions'));

  const complete = withBlockText(goodReading(), fact.id,
    'Tarikan ini datang dari tahun, bulan dan jam kelahiranmu sekaligus. '
    + `${fact.label_meaning} ${fact.gift} ${fact.cost}`);
  assert.ok(!checksIn(validateRendering(complete, CHART_1)).includes('fact.relation_positions'));
});

// ── 2. COVERAGE ────────────────────────────────────────────

test('a required point in no block is caught', () => {
  const reading = goodReading();
  reading.blocks = reading.blocks.filter((b) => !b.fact_ids.includes('badge_桃花'));
  const result = validateRendering(reading, CHART_1);
  assert.ok(!result.ok);
  assert.ok(checksIn(result).includes('coverage.missing_point'));
});

test('a dropped cost is caught under its own check name', () => {
  // Gift-without-cost is the ethics failure mode: rule 25's "never rank a state
  // as good or bad" only has teeth if the costs survive.
  const fact = CHART_1.facts.find((f) => f.id === 'aspek_convergence_正官');
  const bad = withBlockText(goodReading(), fact.id, `${fact.label_meaning} ${fact.gift}`);
  const result = validateRendering(bad, CHART_1);
  assert.ok(checksIn(result).includes('coverage.cost_dropped'));
});

test('coverage never penalises ORDER', () => {
  // The carried principle: validate coverage, never structural conformance. The
  // prompt promises the renderer it will not be punished for an unusual order,
  // and the gate has to keep that promise.
  const reading = goodReading();
  reading.blocks = [...reading.blocks].reverse();
  const result = validateRendering(reading, CHART_1);
  assert.ok(result.ok, `reordering was penalised: ${checksIn(result).join(', ')}`);
});

test('the slot-filling check is inert against today\'s Stage 3, and that is the point', () => {
  // Prompt H specifies: flag when block order matches JSON order AND importance
  // is non-monotonic. Stage 3 emits facts[] sorted by descending importance, so
  // those two conditions are mutually exclusive and the check cannot fire.
  // Implemented as specced rather than reinterpreted - reinterpreting it would
  // mean flagging the order the prompt explicitly asks for. Reported, not hidden.
  const inJsonOrder = goodReading(); // the floor emits required_points order
  const result = validateRendering(inJsonOrder, CHART_1);
  assert.ok(!checksIn(result).includes('coverage.slot_filling'));

  const importances = CHART_1.facts.map((f) => f.importance);
  assert.deepEqual(importances, [...importances].sort((a, b) => b - a),
    'if facts[] ever stops being importance-sorted, this check wakes up');
});

// ── 3. FORBIDDEN CONTENT ───────────────────────────────────

test('every forbidden category hard-rejects', () => {
  const cases = {
    fatalism: 'Pada tahun 2027 kamu akan menemukan arah yang kamu cari.',
    medical: 'Pola ini sering muncul sebagai gejala penyakit yang perlu kamu periksa.',
    financial: 'Waktu yang tepat untuk masuk ke investasi saham sudah dekat.',
    ranking: 'Aspek Pengatur adalah aspek terbaik yang bisa dimiliki seseorang.',
    self_harm: 'Kalau terasa berat, menyerah saja lebih ringan.',
  };
  for (const [category, sentence] of Object.entries(cases)) {
    const bad = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Kalimat tambahan supaya blok ini cukup panjang untuk diperiksa.`);
    const result = validateRendering(bad, CHART_1);
    assert.ok(result.hard, `${category} did not hard-reject`);
    assert.ok(checksIn(result).includes(`forbidden.${category}`), `${category} not caught`);
  }
});

// ── 4. STYLE GUARD ─────────────────────────────────────────

test('the bukan-X-tapi-Y construction is caught, in prose and in the penutup', () => {
  // THE load-bearing regex. It has escaped an explicit prompt ban three times:
  // renderer-prompt-notes run 5 (twice) and PROGRESS gate-check run 2, where it
  // appeared in the penutup - which is why the penutup is checked too.
  const inProse = withBlockText(goodReading(), 'day_master_Fire',
    'Pengakuan sulit menempel, bukan karena hasilnya kurang, melainkan karena rasa '
    + 'memilikinya jarang ikut datang.');
  assert.ok(checksIn(validateRendering(inProse, CHART_1)).includes('style.hedge_construction'));

  const inPenutup = goodReading();
  inPenutup.penutup = 'Kamu bukan orang yang lambat, tapi orang yang menunggu pemicunya.';
  assert.ok(checksIn(validateRendering(inPenutup, CHART_1)).includes('style.hedge_construction'));
});

test('tension-collapse vocabulary is caught', () => {
  // Run 1 turned the steward/self-reliant tension into "menyatu secara selaras
  // ... membentuk identitas utuh" - neutering the one fact Reyner confirms he
  // lives.
  const bad = withBlockText(goodReading(), 'profile_vs_favorable',
    'Pilar Kerja. Dua sisi ini akhirnya menyatu dan membentuk identitas utuh yang khas milikmu.');
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('style.tension_collapse'));
});

test('typography, hanzi, questions and arithmetic are all caught', () => {
  const cases = [
    ['style.typography', 'Kamu tahu arahmu — dan kamu tetap berjalan pelan setiap harinya.'],
    ['style.hanzi', 'Cabang bulanmu adalah 酉, dan itu menentukan tekanan yang kamu rasakan.'],
    ['style.rhetorical_question', 'Bagian mana dari dirimu yang paling butuh ruang sekarang?'],
    ['style.arithmetic', 'Air mengisi 37% dari petamu, jadi apimu jarang menyala penuh.'],
    ['style.bare_polarity', 'Kamu Api Yang, dan itu membuat caramu hadir terasa terbuka.'],
    ['style.slang', 'Kamu ngerasa capek terus padahal kerjanya tidak seberapa berat.'],
    ['style.particles', 'Itu tuh yang bikin kamu bertahan lama di tempat yang sama.'],
    ['style.hedging', 'Kamu mungkin akan merasa lebih ringan setelah membaca ini semua.'],
    ['style.adverbial', 'Kamu bergerak secara alami ketika ada yang memberi dorongan.'],
    ['style.meta', 'Sebagai AI, saya membaca petamu dan menemukan pola yang menarik.'],
    ['style.essay_connectives', 'Hal ini membuat kamu terlihat tenang di mata orang lain.'],
  ];
  for (const [check, sentence] of cases) {
    const bad = withBlockText(goodReading(), 'day_master_Fire',
      `${sentence} Satu kalimat lagi supaya blok ini punya panjang yang wajar.`);
    assert.ok(checksIn(validateRendering(bad, CHART_1)).includes(check), `${check} not caught`);
  }
});

test('an unsanctioned English bracket is caught, a glossary one is not', () => {
  // Rule 23 sanctions exactly one English use: the bracket after an Indonesian
  // name, once. The allowlist is DERIVED from glossary name_en values, so a new
  // entry is sanctioned automatically and no second list can drift.
  const invented = withBlockText(goodReading(), 'day_master_Fire',
    'Inti dirimu adalah Api (Solar Yang Energy), dan itu terasa di caramu hadir.');
  assert.ok(checksIn(validateRendering(invented, CHART_1)).includes('style.unsanctioned_bracket'));

  // The floor writes "Bunga Persik (Peach Blossom)" and must not be flagged.
  assert.ok(!checksIn(validateRendering(goodReading(), CHART_1))
    .includes('style.unsanctioned_bracket'));
});

test('OpenAI output is graded on the same checks, with its own allowance knob', () => {
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    'Kamu bukan orang yang lambat, tapi orang yang menunggu pemicunya dari luar.');
  for (const provider of ['gemini', 'openai']) {
    const result = validateRendering(bad, CHART_1, { provider });
    assert.ok(checksIn(result).includes('style.hedge_construction'), provider);
  }
});

// ── 5. STRUCTURE ───────────────────────────────────────────

test('3+ newlines normalise, a lone newline is rejected, and the normalised text is returned', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'day_master_Fire');
  const body = `${fact.label_meaning} ${fact.gift}`;

  const collapsed = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${body}\n\n\n\n${fact.cost}`);
  const ok = validateRendering(collapsed, CHART_1);
  const block = ok.normalized.blocks.find((b) => b.fact_ids.includes('day_master_Fire'));
  assert.ok(block.text.includes('\n\n'), 'the break survives');
  assert.ok(!/\n{3,}/.test(block.text), '3+ newlines must collapse to 2');
  assert.ok(!checksIn(ok).includes('structure.stray_newline'));

  const stray = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${body}\n${fact.cost}`);
  assert.ok(checksIn(validateRendering(stray, CHART_1)).includes('structure.stray_newline'));
});

test('more than two paragraph breaks in one block is rejected', () => {
  const fact = CHART_1.facts.find((f) => f.id === 'day_master_Fire');
  const bad = withBlockText(goodReading(), 'day_master_Fire',
    `Api (Fire). ${fact.label_meaning}\n\n${fact.gift}\n\n${fact.cost}\n\nSatu bagian lagi.`);
  assert.ok(checksIn(validateRendering(bad, CHART_1)).includes('structure.too_many_breaks'));
});

// ── the regeneration directive ─────────────────────────────

test('the stricter directive names the failures and omits the flags', () => {
  const bad = withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.');
  const result = validateRendering(bad, CHART_1);
  const directive = stricterDirective(result.findings);

  assert.ok(directive.includes('REGENERATION'));
  for (const f of result.findings.filter((x) => x.severity !== 'flag')) {
    assert.ok(directive.includes(f.check), `directive omitted ${f.check}`);
  }
  assert.ok(!directive.includes('[coverage.slot_filling]'), 'a flag is not a failure to fix');
});

// ── the payload scrub (the sanctioned engine line) ─────────

test('internal_only fields never reach a provider', () => {
  // The marker existed on three facts since Stage 3 was written and NOTHING read
  // it. confidence_reasons joined it on 2026-08-02 because it ships English with
  // hanzi ("root 巳 pulled toward Metal by 半合") to a renderer banned from both.
  assert.ok(internalFieldNames(CHART_1).includes('confidence_reasons'));
  assert.ok(internalFieldNames(CHART_1).includes('support_share'));

  const sent = JSON.stringify(scrubInternal(CHART_1));
  // These two are marked everywhere they occur, so they must be gone globally.
  for (const field of ['confidence_reasons', 'support_share']) {
    assert.ok(!sent.includes(`"${field}"`), `${field} survived the scrub`);
  }
  assert.ok(!sent.includes('internal_only'), 'naming the marker to a model invites a mention');

  // `percent` is NOT asserted globally, and the reason is a REPORTED Stage 3
  // inconsistency rather than a gap here: element_dominant_* declares
  // internal_only ['provenance.percent'] and element_missing_* does not, so a
  // zero percent still reaches the provider. The scrub honours each marker where
  // it is declared; it cannot honour one that was never written.
  const scrubbed = scrubInternal(CHART_1);
  const dominant = scrubbed.facts.find((f) => f.id.startsWith('element_dominant_'));
  if (dominant) assert.ok(!('percent' in dominant.provenance), 'a declared path must be honoured');

  // The record itself is untouched: the key was taken over the full object.
  assert.ok(JSON.stringify(CHART_1).includes('confidence_reasons'));
});

// ── the data files are data, and must stay loadable ────────

test('every blocklist pattern compiles and carries a note', () => {
  // Prompt H: the lists are data files with their own schema test, so a
  // malformed edit fails CI rather than production. Reyner can extend them
  // without a code deploy, and this is what makes that safe.
  let count = 0;
  for (const group of ['forbidden_content', 'style']) {
    for (const [category, entries] of Object.entries(BLOCKLIST[group])) {
      if (category.startsWith('_')) continue;
      assert.ok(Array.isArray(entries), `${group}.${category} must be an array`);
      assert.ok(entries.length > 0, `${group}.${category} is empty`);
      for (const entry of entries) {
        assert.equal(typeof entry.pattern, 'string', `${group}.${category} pattern`);
        assert.ok(entry.note && entry.note.length > 10,
          `${group}.${category} /${entry.pattern}/ needs a note saying why it exists`);
        assert.doesNotThrow(() => new RegExp(entry.pattern, 'iu'),
          `${group}.${category} /${entry.pattern}/ does not compile`);
        count += 1;
      }
    }
  }
  assert.ok(count > 30, `only ${count} patterns loaded`);
  assert.ok(CATEGORIES.forbidden.length >= 5 && CATEGORIES.style.length >= 8);
});

test('NO ENGINE STRING WOULD TRIP THE STYLE GATE', () => {
  // The invariant that makes this gate safe to point at rendered text.
  //
  // Until f068352 the glossary itself held `secara `, `cenderung` and `mungkin`,
  // so these regexes would have rejected readings for faithfully carrying
  // Reyner-reviewed engine content - the gate punishing the renderer for obeying
  // the engine. The ban-sweep cleaned all 12. This asserts it stays clean, and
  // will fail the moment a new entry reintroduces one.
  const offenders = [];
  const patterns = [];

  // Scoped to the fields lib/semantic/glossary.js#contentFrom actually reads
  // into the semantic JSON, because those are the only strings that can reach
  // prose. Checking every string in the file instead would flag internal
  // descriptors that no renderer ever sees.
  //
  // Two such descriptors exist and BOTH carry bare yin/yang, which golden rule 5
  // bans in prose: `arketipe.*.element` ("Api Yang") and `salah_dikira.*.name_id`
  // ("Api Yang" again). Neither is wired into a fact today. Both are REPORTED
  // rather than silently exempted, because the day one is wired in, the gate
  // will reject every reading that names it and the cause will not be obvious.
  const RENDERED_FIELDS = new Set([
    'name_id', 'label_meaning', 'gift_seed', 'cost_seed', 'actionable_seed',
    'branch_name_id', 'branch_label_meaning', 'line',
  ]);
  const EXEMPT = /^glossary\.salah_dikira\./;
  for (const [category, entries] of Object.entries(BLOCKLIST.style)) {
    if (category.startsWith('_')) continue;
    for (const entry of entries) patterns.push([category, new RegExp(entry.pattern, 'iu')]);
  }

  (function walk(node, path) {
    if (typeof node === 'string') {
      if (path.includes('_note') || path.includes('_README') || EXEMPT.test(path)) return;
      if (!RENDERED_FIELDS.has(path.split('.').at(-1))) return;
      for (const [category, regex] of patterns) {
        if (regex.test(node)) offenders.push(`${path} [${category}]: ${node.slice(0, 70)}`);
      }
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    }
  }(GLOSSARY, 'glossary'));

  assert.deepEqual(offenders, []);
});

test('distinctive stems ignore function words and short words', () => {
  const stems = distinctiveStems('Kamu yang tidak pernah bersandar pada keberuntungan');
  assert.ok(!stems.includes('kamu'), 'a stopword is not evidence of paraphrase');
  assert.ok(stems.some((s) => 'bersandar'.startsWith(s)));
  assert.equal(stemOverlap('', 'apa pun').ratio, 1, 'an empty source can never fail a block');
});

// ── the failstates (Prompt H) ──────────────────────────────
// Fail -> regenerate ONCE with a stricter directive. Fail twice -> module floor
// + flag for QA. Exercised through the real chain with an injected fetch.

const geminiSays = (text) => ({
  ok: true, status: 200,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  text: async () => text,
});

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

const asResponse = (reading) => JSON.stringify(reading);
const GOOD = asResponse(goodReading());
const BAD = asResponse(withBlockText(goodReading(), 'strength_weak', 'Kamu Api Lemah.'));

test('a Stage 6 failure regenerates ONCE, and the retry carries the directive', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const systems = [];
    const out = await renderReading(CHART_1, {
      fetchImpl: async (_url, init) => {
        const body = JSON.parse(init.body);
        systems.push(body.systemInstruction.parts[0].text);
        return geminiSays(systems.length === 1 ? BAD : GOOD);
      },
    });

    assert.equal(systems.length, 2, 'exactly one regeneration');
    assert.ok(!systems[0].includes('REGENERATION'), 'the first call is the clean prompt');
    assert.ok(systems[1].includes('REGENERATION'), 'the retry must be told what was wrong');
    assert.ok(systems[1].includes('fact.strength_'), 'and told WHICH check failed');
    assert.ok(systems[1].startsWith(MASTER_PROMPT), 'the master prompt stays the verbatim front');

    assert.equal(out.source, 'gemini');
    assert.equal(out.stage6_version, STAGE6_VERSION);
    assert.equal(out.attempts.at(-1).regenerated, true);
  });
});

test('failing TWICE serves the floor and flags the chart for QA', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      fetchImpl: async () => { calls += 1; return geminiSays(BAD); },
    });

    assert.equal(calls, 2, 'one original plus one regeneration, then stop');
    assert.equal(out.source, 'module_assembly');
    assert.equal(out.qa_flag, 'stage6_failed_twice');
    assert.ok(out.findings.length > 0, 'the reason must survive onto the QA row');
    // The floor is engine content, so no gate ran over it. Marked, not faked.
    assert.equal(out.stage6_version, `${STAGE6_VERSION}-floor`);
    assert.ok(out.blocks.length > 0, 'the product never hard-fails on the free mirror');
  });
});

test('a floor result is stored under its own gate marker, never the gate version', async () => {
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    const out = await renderReading(CHART_1, { fetchImpl: async () => geminiSays(BAD) });
    await persistRendered(out, CHART_1);
    const row = await readCache(out.cache_key);
    assert.equal(row.stage6_version, `${STAGE6_VERSION}-floor`,
      'a QA row must be able to tell a validated render from the floor at a glance');
    assert.equal(row.source, 'module_assembly');
  });
});

test('validationRetries 0 measures the FIRST-PASS rate', async () => {
  // The number that says whether the PROMPT works, as distinct from whether the
  // pipeline works. The harness needs both.
  __clearMemCache();
  await withEnv({ GEMINI_API_KEY: 'test', OPENAI_API_KEY: undefined }, async () => {
    let calls = 0;
    const out = await renderReading(CHART_1, {
      validationRetries: 0,
      fetchImpl: async () => { calls += 1; return geminiSays(BAD); },
    });
    assert.equal(calls, 1, 'no regeneration budget means no regeneration');
    assert.equal(out.source, 'module_assembly');
  });
});
