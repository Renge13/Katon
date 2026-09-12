// ============================================================
// tests/compat-stage6-pair.spec.mjs — the pair-only Stage 6 checks
// ============================================================
// Each rejecting check here was shown RED ON A REAL GEMINI RENDER before it was
// trusted, which is prompt X-b2's own condition and the lesson of the production
// copy gate that was documented and tested for ten days while never executing
// (COWORK-BRIEF row 46). The runs are in the commit message.
//
// This file's job afterwards is the cheap one: that the checks stay wired, stay
// scoped to `kind === 'pair'`, and do not touch the mirror.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic, variantKeysFor } from '../lib/semantic/pair.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRendering, STAGE6_VERSION } from '../lib/validate/index.js';
import { pairGuard, REFRAME_OVERLAP } from '../lib/validate/pair.js';
import { stricterDirective } from '../lib/validate/directive.js';
import { styleGuard } from '../lib/validate/style.js';
import { renderedText } from '../lib/validate/text.js';
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };
import { GLOSSARY, sweepableGlossary } from '../lib/semantic/glossary.js';

const c = (d, t) => calculateBaziChart({ birthDate: d, birthTime: t });
const A = c('1989-09-13', '09:00');
// chart 12: the 子卯 punishment on the day pair, so p2_reframe_required is raised.
const HARD_SEAT = c('1990-06-07', '12:00');
const EASY_SEAT = c('1993-06-12', '23:30');

const PENUTUP = 'Peta ini sudah cukup jelas untuk kamu jalani mulai sekarang.';

/** A rendering shaped like a model's, built from the floor's own ruled prose. */
const renderingFor = (sj, mutate = (b) => b) => ({
  blocks: assembleFallback(sj).blocks.map(mutate),
  penutup: PENUTUP,
});

// `check`, like every other guard. It was `code`, which made pair rejections
// record as `undefined` in the QA tape and in the regeneration directive.
const codes = (findings) => findings.map((f) => f.check);

test('STAGE6_VERSION moved, once, for this commit', () => {
  // The repo convention: a change to what Stage 6 ACCEPTS OR REJECTS bumps this
  // in the same commit. Two rejecting checks were added, so it moves once - not
  // twice, and not zero times.
  // 1.23.0: the tension_collapse negation carve-out (Reyner, 2026-09-08).
  // 1.24.0: the compat opening is injected by the engine before this gate reads
  // it (lib/render/pairOpening.js). No predicate here changed; what the gate is
  // handed did, so the served text's verdict can differ for the same model
  // output - which is exactly what this constant answers for.
  assert.equal(STAGE6_VERSION, '1.24.0');
});

test('THE MIRROR IS UNTOUCHED: pairGuard returns [] for kind mirror', () => {
  // The isolation that matters. The mirror's floor-rate fixtures must not move,
  // and the cheapest way to guarantee that is a guard that does nothing at all
  // on a mirror semantic JSON.
  const mirror = buildSemanticJson(A);
  assert.equal(mirror.kind, 'mirror');
  const rendered = renderingFor(mirror);
  assert.deepEqual(pairGuard(rendered, mirror, JSON.stringify(rendered)), []);

  // And through the real entry point, on a real mirror floor: no pair finding.
  const gate = validateRendering(rendered, mirror, { provider: 'module_assembly' });
  assert.equal(codes(gate.findings).some((x) => String(x).startsWith('pair.')), false);
});

test('both_named REJECTS a model render that names only one person', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  const nameA = sj.core.a.archetype_name_id;
  const nameB = sj.core.b.archetype_name_id;
  assert.notEqual(nameA, nameB);

  // An opening that names both passes.
  const ok = renderingFor(sj, (b, i) => (i === 0
    ? { ...b, text: `${nameA} dan ${nameB}. ${b.text}` } : b));
  assert.equal(
    codes(pairGuard(ok, sj, JSON.stringify(ok))).includes('pair.both_named'),
    false,
  );

  // One name missing is the same finding as both missing - deliberately, so a
  // fix cannot add the cheaper of the two.
  //
  // THE OPENING IS REPLACED, NOT PREFIXED, since 2026-09-08: the floor's own
  // opening now carries both names (p0_opening), so prefixing one name to it left
  // a fixture that named BOTH and the assertion could not fail. Caught by running
  // it - the fixture had quietly stopped expressing the proposition.
  for (const named of [nameA, nameB]) {
    const one = renderingFor(sj, (b, i) => (i === 0 ? { ...b, text: `${named} membuka bacaan ini.` } : b));
    const found = pairGuard(one, sj, JSON.stringify(one));
    assert.ok(codes(found).includes('pair.both_named'), `naming only ${named} is rejected`);
    assert.equal(found.find((f) => f.check === 'pair.both_named').severity, 'hard');
  }
});

test('THE FLOOR NAMES BOTH PEOPLE, so both_named now runs on it too', () => {
  // ── THIS TEST INVERTED, AS ITS PREVIOUS VERSION SAID IT WOULD ──
  // It used to read "both_named DOES NOT run on the floor, and that is a content
  // gap", and it asserted the exemption plus the precondition that made the
  // exemption necessary: the floor genuinely did not name both people, because no
  // ruled cell opened a pair reading. Reyner ruled kompatibilitas.p0_opening on
  // 2026-09-08 and the gap closed, so the exemption went with it.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const floor = renderingFor(sj);
  const nameA = sj.core.a.archetype_name_id;
  const nameB = sj.core.b.archetype_name_id;

  // The opening block is the one that changed. It is the FLOOR's own prose, from
  // Reyner's ruled template - nothing here was authored to make a test pass.
  assert.ok(floor.blocks[0].text.includes(nameA), 'the floor opening names A');
  assert.ok(floor.blocks[0].text.includes(nameB), 'and B');

  // THE PARAMETER IS GONE FROM THE CONTRACT, not just unread. A guard that still
  // ACCEPTS a provider is one edit away from branching on it again.
  assert.equal(pairGuard.length, 3, 'pairGuard no longer takes a provider');
  assert.equal(
    codes(pairGuard(floor, sj, JSON.stringify(floor))).includes('pair.both_named'),
    false,
    'the floor names both, so nothing is found',
  );

  // And through the real door, for BOTH providers, which is where the exemption
  // used to live.
  for (const provider of ['module_assembly', 'gemini']) {
    const g = validateRendering(floor, sj, { provider });
    assert.equal(codes(g.findings).includes('pair.both_named'), false, `clean for ${provider}`);
  }

  // Rule 17's floor is still servable, which is the thing the exemption was
  // protecting and is now protected by the content instead.
  const gate = validateRendering(floor, sj, { provider: 'module_assembly' });
  assert.equal(gate.hard, false, 'the floor carries no HARD finding');
  assert.equal(gate.ok, true, 'the floor passes');
});

test('A FLOOR THAT LOST THE OPENING IS REJECTED, provider notwithstanding', () => {
  // The check must be able to FAIL on the floor now, or removing the exemption
  // bought nothing. Strip the opening block's names the way a future edit to
  // fallback.js or to the cell could.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const floor = renderingFor(sj);
  const stripped = {
    ...floor,
    blocks: floor.blocks.map((b, i) => (i === 0 ? { ...b, text: 'Bacaan ini tentang kalian.' } : b)),
  };
  const found = pairGuard(stripped, sj, JSON.stringify(stripped));
  assert.ok(codes(found).includes('pair.both_named'));
  assert.equal(found.find((f) => f.check === 'pair.both_named').severity, 'hard');
  // Through the real door too, on the FLOOR's provider - the path the exemption
  // used to make unreachable.
  const gate = validateRendering(stripped, sj, { provider: 'module_assembly' });
  assert.equal(gate.hard, true, 'a floor that lost the opening is HARD-rejected');
});

test('reframe_present REJECTS a difficult seat whose block drops the reframe', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  assert.ok(sj.safety_flags.includes('p2_reframe_required'), 'precondition: the flag is raised');

  // The floor carries the reframe verbatim, so it passes.
  const carried = renderingFor(sj);
  assert.equal(
    codes(pairGuard(carried, sj, JSON.stringify(carried))).includes('pair.reframe_missing'),
    false,
  );

  // Replace the reframe block's text with another block's - real prose, wrong
  // content. This is the shape the real-render red used.
  const idx = carried.blocks.findIndex((b) => (b.fact_ids || []).includes('p2_reframe'));
  assert.notEqual(idx, -1, 'the reframe has its own block');
  const donor = carried.blocks[carried.blocks.length - 1].text;
  const dropped = {
    ...carried,
    blocks: carried.blocks.map((b, i) => (i === idx ? { ...b, text: donor } : b)),
  };
  const found = pairGuard(dropped, sj, JSON.stringify(dropped));
  assert.ok(codes(found).includes('pair.reframe_missing'));
  assert.equal(found.find((f) => f.check === 'pair.reframe_missing').severity, 'hard');
});

test('reframe_present is SILENT when the seat is easy', () => {
  // It reads `safety_flags`, so a pair with a clean day pair is never asked for
  // a reframe it has no cell for.
  const sj = buildPairSemantic(A, EASY_SEAT);
  assert.equal(sj.safety_flags.includes('p2_reframe_required'), false);
  const rendered = renderingFor(sj);
  assert.equal(
    codes(pairGuard(rendered, sj, JSON.stringify(rendered))).includes('pair.reframe_missing'),
    false,
  );
});

test('the reframe threshold uses stemOverlap, ABOVE the coverage floor', () => {
  // The first version compared 4-plus-letter words and passed on a real render
  // with every reframe sentence stripped, because the reframe's words - `pada`,
  // `yang`, `hubungan`, `pasangan`, `kursi` - are all over a compat reading. It
  // was measuring its own vocabulary.
  //
  // `stemOverlap` drops stopwords and stems tails, and it is what `coverage.js`
  // uses, so this is one definition of "did the idea survive" rather than two.
  assert.ok(REFRAME_OVERLAP > 0.2, 'above COVERAGE_PARAMS.fieldOverlap');
  assert.ok(REFRAME_OVERLAP <= 1);
});

test('A PAIR FINDING IS ATTRIBUTABLE, in the tape and in the directive', () => {
  // ── THE DEFECT THIS ASSERTS AGAINST WAS LIVE FOR A DAY ─────
  // `lib/validate/pair.js` emitted `code` where every other guard emits `check`,
  // and the two places that ATTRIBUTE a finding both read `check`:
  //
  //   lib/render/index.js:463         stage6: rejecting.map((f) => f.check)
  //   lib/validate/directive.js:120   `- [${f.check}] ${scrubForbidden(...)}`
  //
  // Nothing failed, because severity is what the GATE reads. But a pair rejection
  // was recorded in the QA tape as `undefined`, and the regeneration directive
  // told the model `- [undefined] the opening block must name both people`. The
  // n=10 run's rejection table could not have named a pair check even if one had
  // fired - and the whole point of the n=20 run is a per-check count.
  //
  // Asserted through BOTH consumers, not by reading the field name, because the
  // field name is exactly what was wrong and agreed with itself.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const floor = renderingFor(sj);
  const stripped = {
    ...floor,
    blocks: floor.blocks.map((b, i) => (i === 0 ? { ...b, text: 'Bacaan ini tentang kalian.' } : b)),
  };
  const gate = validateRendering(stripped, sj, { provider: 'module_assembly' });

  // 1. THE TAPE. This is the exact expression render/index.js records.
  const tape = gate.findings.filter((f) => f.severity !== 'flag').map((f) => f.check);
  assert.ok(tape.includes('pair.both_named'), `the tape names it: ${tape.join(', ')}`);
  assert.equal(tape.includes(undefined), false, 'and nothing in the tape is undefined');

  // 2. THE DIRECTIVE. The model is told which check rejected it.
  const directive = stricterDirective(gate.findings, []);
  assert.match(directive, /\[pair\.both_named\]/u);
  assert.equal(directive.includes('[undefined]'), false);

  // 3. EVERY GUARD AGREES ON THE FIELD, which is the invariant that failed.
  for (const f of gate.findings) {
    assert.equal(typeof f.check, 'string', `${JSON.stringify(f).slice(0, 80)} carries a check`);
  }
});

// ============================================================
// THE VERDICT PATTERNS (Reyner, 2026-09-08)
// ============================================================

/** Compiled the way lib/validate/style.js#compile does. Never reconstructed. */
const VERDICT = BLOCKLIST.verdict.patterns
  .map((e) => ({ regex: new RegExp(e.pattern, e.flags || 'iu'), source: e.pattern }));

test("the five ruled patterns are present, and they are Reyner's", () => {
  assert.deepEqual(BLOCKLIST.verdict.patterns.map((e) => e.pattern), [
    String.raw`\b(tidak |kurang |sangat )?cocok\b`,
    String.raw`\bberjodoh\b|\bjodoh\b`,
    String.raw`\bpasangan (ideal|sempurna|tepat)\b`,
    String.raw`\b(layak|pantas) (dipertahankan|dilanjutkan|ditinggalkan)\b`,
    String.raw`\b(harus|sebaiknya) (putus|pisah|bertahan)\b`,
  ]);
  for (const e of BLOCKLIST.verdict.patterns) {
    assert.ok(e.note && e.note.length > 40, `${e.pattern} carries its reason`);
  }
});

test('EACH PATTERN FIRES on a sentence carrying it', () => {
  // An instrument that cannot fail means nothing. Every one is shown hitting
  // before any of them is trusted, and each probe is the construction the pattern
  // was ruled for rather than a copy of the regex written back as prose.
  const PROBES = [
    [0, 'Kalian sangat cocok satu sama lain.'],
    [0, 'Hubungan ini tidak cocok.'],
    [0, 'Menurut bagan, kalian cocok.'],
    [1, 'Kalian memang berjodoh.'],
    [1, 'Ini soal jodoh, bukan usaha.'],
    [2, 'Dia pasangan ideal untukmu.'],
    [2, 'Kalian pasangan sempurna.'],
    [3, 'Hubungan ini layak dipertahankan.'],
    [3, 'Hubungan ini tidak pantas dilanjutkan.'],
    [4, 'Sebaiknya putus saja.'],
    [4, 'Kalian harus bertahan.'],
  ];
  for (const [i, text] of PROBES) {
    assert.ok(VERDICT[i].regex.test(text), `/${VERDICT[i].source}/ fires on "${text}"`);
  }

  // And through the guard, which is the thing that ships.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const rendered = renderingFor(sj);
  const found = pairGuard(rendered, sj, 'Menurut bagan ini kalian sangat cocok dan berjodoh.');
  const verdicts = found.filter((f) => f.check === 'pair.verdict');
  assert.equal(verdicts.length, 2, 'both patterns in that sentence are reported');
  assert.ok(verdicts.every((f) => f.severity === 'flag'));
});

test('THEY FLAG AND REJECT NOTHING, which is what lets them travel', () => {
  // Ruled: land the patterns at `flag` first, fit them against real renders, then
  // decide escalation on the count. A flag cannot fail a reading, so no floor rate
  // can move on this commit and the n=20 run measures the patterns rather than
  // being confounded by them.
  //
  // OWED, and written into NEXT.md rather than left as "a later ruling":
  // escalate the verdict category to REJECT for pairs, decided on the n=20
  // per-pattern flag count, as its own isolated gate change.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const rendered = { ...renderingFor(sj), penutup: 'Kalian sangat cocok dan berjodoh.' };
  const gate = validateRendering(rendered, sj, { provider: 'module_assembly' });

  const verdicts = gate.findings.filter((f) => f.check === 'pair.verdict');
  assert.ok(verdicts.length >= 1, 'it sees the verdict');
  assert.ok(verdicts.every((f) => f.severity === 'flag'), 'and only flags it');
  assert.equal(gate.hard, false, 'nothing hard');
  assert.equal(gate.ok, true, 'and the reading still passes, deliberately');
});

test('THE MIRROR IS EXEMPT BY SCOPE, and these two ruled strings prove it', () => {
  // ── THE KNOWN COLLISION, PINNED ────────────────────────────
  // `cocok` also means "suitable", and two RULED MIRROR strings use it that way.
  // Reyner ruled the pattern lands UNCHANGED, because the check is pair-scoped and
  // neither string can reach a pair reading - 240 fixture pair floors swept clean.
  // THIS TEST IS THE TRIPWIRE ON THAT REASONING: the day anyone widens the scope,
  // it goes red before a reader meets a false rejection of Reyner's own copy.
  const collisions = [
    GLOSSARY.bintang['華蓋'].gift_seed,
    GLOSSARY.elemen_hilang['木'].cost_seed,
  ];
  for (const text of collisions) {
    assert.ok(VERDICT[0].regex.test(text),
      'precondition: this ruled mirror string really does hit pattern 0');
  }

  // AND THE GUARD NEVER SEES THEM. Not "does not currently fire" - returns []
  // for a mirror, whatever the text.
  const mirror = buildSemanticJson(A);
  assert.equal(mirror.kind, 'mirror');
  for (const text of collisions) {
    assert.deepEqual(pairGuard(renderingFor(mirror), mirror, text), []);
  }

  // And through the real entry point, on a mirror reading that CONTAINS them.
  const rendered = renderingFor(mirror, (b, i) => (i === 0
    ? { ...b, text: `${b.text} ${collisions.join(' ')}` } : b));
  const gate = validateRendering(rendered, mirror, { provider: 'module_assembly' });
  assert.equal(gate.findings.some((f) => String(f.check).startsWith('pair.')), false,
    'no pair check ever runs on a mirror reading');
});

test('NO RULED kompatibilitas CELL HITS A VERDICT PATTERN', () => {
  // The pair-side half of the sweep, and the one that would be a real defect: a
  // pattern firing on ruled compat copy would punish the renderer for carrying the
  // glossary faithfully. Swept clean across all 25 cells before the patterns
  // landed; asserted here so it stays true as cells are added.
  const cells = Object.entries(sweepableGlossary().kompatibilitas)
    .filter(([k]) => !k.startsWith('_'));
  assert.ok(cells.length >= 25);
  const offenders = [];
  for (const [key, cell] of cells) {
    for (const [field, value] of Object.entries(cell)) {
      if (field.startsWith('_') || typeof value !== 'string') continue;
      for (const { regex, source } of VERDICT) {
        if (regex.test(value)) offenders.push(`${key}.${field} [/${source}/]`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test('THE READER IS NOT BROKEN, which the empty period could never have shown', () => {
  // RENAMED 2026-09-08. It was "no_verdict SHIPS WITH NO PATTERNS", and that
  // claim is now false by design. What survives is the half that mattered.
  assert.equal(BLOCKLIST.verdict.patterns.length, 5);
  assert.ok(BLOCKLIST.verdict._rule.includes('STAGE6_VERSION'), 'the rule says what adding one costs');

  // It reports, and every report is a FLAG. Ruled: nothing rejects until the
  // n=20 flag count says which patterns earn it.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const rendered = renderingFor(sj);
  const found = pairGuard(rendered, sj, 'cocok sekali 95%');
  assert.ok(codes(found).includes('pair.verdict'), 'a live pattern is reported');
  assert.ok(found.every((f) => f.severity === 'flag'), 'and only ever flagged');

  // ── AND IT WOULD ACTUALLY FIRE ONCE A PATTERN EXISTS ──
  // The first version read `blocklist?.verdict?.filter?.(...)`, and `verdict` is
  // an OBJECT with no `.filter`, so the optional call yielded undefined and the
  // `?? []` swallowed it. The check could never have fired even after the
  // patterns were ruled, and would have looked armed the whole time. This
  // exercises the reader against a synthetic category so that cannot recur.
  const synthetic = { verdict: { patterns: [{ pattern: '\\bcocok\\b' }] } };
  const hits = [];
  for (const e of (synthetic.verdict.patterns ?? []).filter((x) => x?.pattern)) {
    if (new RegExp(e.pattern, e.flags || 'iu').test('mereka cocok sekali')) hits.push(e.pattern);
  }
  assert.deepEqual(hits, ['\\bcocok\\b'], 'the reader shape used in pair.js finds a real pattern');
});

// ============================================================
// style.tension_collapse, SCOPED PER BLOCK FOR A PAIR
// ============================================================
// Ruled by Reyner 2026-09-08 on docs/qa/2026-09-08-compat-renders-n10.md, where
// this one category was 16 of 18 rejections. The red run is four REAL Gemini
// renders, re-gated byte-for-byte before and after; it is in the commit message.
// ============================================================

const PHRASE = 'Keduanya saling melengkapi dan tetap selaras.';

/** Read from the ruled data, never retyped. */
const TENSION = new Set(BLOCKLIST.style._pair_scope.tension_collapse.banned_in);

/** Append text to the block carrying `factId`. Fails loudly if there is none. */
const into = (rendering, factId, extra) => {
  const idx = rendering.blocks.findIndex((b) => (b.fact_ids || []).includes(factId));
  assert.notEqual(idx, -1, `precondition: a block carries ${factId}`);
  return {
    ...rendering,
    blocks: rendering.blocks.map((b, i) => (i === idx ? { ...b, text: `${b.text} ${extra}` } : b)),
  };
};

const tension = (rendering, sj) => styleGuard(rendering, renderedText(rendering), 'gemini', sj)
  .filter((f) => f.check === 'style.tension_collapse');

test("Reyner's scope lists are what he ruled, and they live in the DATA file", () => {
  // A silent edit to either list is a change to what Stage 6 accepts. Asserting
  // the literal sets means such an edit cannot land without also landing here,
  // where STAGE6_VERSION is asserted one screen up.
  const scope = BLOCKLIST.style._pair_scope.tension_collapse;
  assert.deepEqual(scope.banned_in,
    ['p2_clash', 'p2_harm', 'p2_punishment', 'p3_same_imbalance', 'p1_controls', 'p5_q2', 'p5_q4']);
  assert.deepEqual(scope.permitted_in,
    ['p3_supplies', 'p2_harmony', 'p1_combination', 'p5_q1', 'p5_q3']);
  // `_`-prefixed keys are skipped by style.js's compile filter, so the scope
  // block cannot be mistaken for a pattern category.
  assert.equal(Object.keys(BLOCKLIST.style).includes('_pair_scope'), true);
});

test('THE MIRROR IS UNTOUCHED: the whole reading is still one haystack', () => {
  const mirror = buildSemanticJson(A);
  const rendered = into(renderingFor(mirror), mirror.facts[0].id, PHRASE);
  const text = renderedText(rendered);

  // Rejected, as it always was.
  assert.equal(tension(rendered, mirror).length, 1);

  // And byte-identical to the pre-scope call, which passed no semanticJson at
  // all. This is the assertion that would catch a scope leaking onto the mirror.
  assert.deepEqual(
    styleGuard(rendered, text, 'gemini', mirror),
    styleGuard(rendered, text, 'gemini'),
  );
});

test('PERMITTED: harmony vocabulary in the P3 supply block passes', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  const p3 = sj.facts.find((f) => f.id === 'p3_supply');
  assert.equal(variantKeysFor(p3)[0], 'p3_supplies', 'precondition: this pair has a supply');

  const rendered = into(renderingFor(sj), 'p3_supply', PHRASE);
  assert.deepEqual(tension(rendered, sj), [],
    'p3_supplies is a complementarity block and the phrase states the fact');
});

test('BANNED: the same phrase in the P2 tension block still rejects', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  const p2 = sj.facts.find((f) => f.id === 'p2_day_pair');
  assert.equal(variantKeysFor(p2)[0], 'p2_punishment', 'precondition: a difficult seat');

  const rendered = into(renderingFor(sj), 'p2_day_pair', PHRASE);
  const found = tension(rendered, sj);
  assert.equal(found.length, 1, 'a tension dissolved into harmony is still the failure');
  assert.match(found[0].message, /saling melengkapi/);
});

test('BANNED: a low-fit quadrant block is a tension block', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  const q = variantKeysFor(sj.facts.find((f) => f.id === 'p5_pull_fit'))[0];
  assert.equal(q, 'p5_q2');
  assert.equal(tension(into(renderingFor(sj), 'p5_pull_fit', PHRASE), sj).length, 1);
});

// ── THE PENUTUP, SCOPED BY THE READING (Reyner, 2026-09-08, second ruling) ──
// The first ruling scoped BLOCKS, and measuring it found the collision was not
// in a block: 4 of 4 real renders closed on "saling melengkapi" in the penutup
// and still rejected, so block scoping moved the floor rate by zero. The penutup
// carries no fact, so it is scoped by the WHOLE READING - scanned when any
// tension fact is present, permitted only when none is.

/** A pair with no tension key at all. 26 of 240 fixture pairs qualify. */
const CALM_A = c('1995-06-01', '06:00');   // chart 4
const CALM_B = c('1989-02-04', '04:00');   // chart 13

test('THE PENUTUP IS SCANNED when the reading carries a tension', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  assert.ok(sj.facts.flatMap(variantKeysFor).some((k) => TENSION.has(k)),
    'precondition: this pair carries a tension');
  const rendered = { ...renderingFor(sj), penutup: `${PENUTUP} ${PHRASE}` };
  assert.equal(tension(rendered, sj).length, 1, 'harmony vocabulary in the close is the collapse');
});

test('THE PENUTUP IS PERMITTED when the reading carries none', () => {
  const sj = buildPairSemantic(CALM_A, CALM_B);
  const keys = sj.facts.flatMap(variantKeysFor);
  assert.equal(keys.some((k) => TENSION.has(k)), false,
    `precondition: no tension key in [${keys.join(' ')}]`);

  const rendered = { ...renderingFor(sj), penutup: `${PENUTUP} ${PHRASE}` };
  assert.deepEqual(tension(rendered, sj), [],
    'there is no tension in this reading for the close to dissolve');
});

test('IT IS NOT SCOPED BY QUADRANT: a calm quadrant with a clashed seat is scanned', () => {
  // The ruling says "any tension fact", not "a low-fit quadrant", and this is
  // why: q1 and q3 are permitted BLOCK keys, so scoping the close by quadrant
  // alone would permit harmony vocabulary over a clashed seat.
  const pairs = [[A, HARD_SEAT], [c('1978-02-16', '14:30'), c('1984-04-21', '18:45')]];
  let checked = 0;
  for (const [x, y] of pairs) {
    const sj = buildPairSemantic(x, y);
    const keys = sj.facts.flatMap(variantKeysFor);
    const seat = keys.find((k) => ['p2_clash', 'p2_harm', 'p2_punishment'].includes(k));
    if (!seat) continue;
    const rendered = { ...renderingFor(sj), penutup: `${PENUTUP} ${PHRASE}` };
    assert.equal(tension(rendered, sj).length, 1, `${seat} keeps the close scanned`);
    checked += 1;
  }
  assert.ok(checked > 0, 'at least one pair carried a difficult seat');
});

test('THE TENSION SET IS banned_in ITSELF, so the two cannot drift', () => {
  // The penutup rule and the block rule read ONE list. A key added to banned_in
  // becomes a tension for both at once, which is the only way to keep a
  // "scanned when there is a tension" rule honest.
  assert.deepEqual([...TENSION].sort(),
    BLOCKLIST.style._pair_scope.tension_collapse.banned_in.slice().sort());
  assert.ok(BLOCKLIST.style._pair_scope._penutup.includes('banned_in'),
    'the data says so as well as the code');
});

test('A BLOCK CARRYING BOTH KEYS IS SCANNED: tension wins', () => {
  // Not hypothetical - p2_palace_frame carries the frame plus every relation
  // found, so one block can hold a harmony and a punishment at once.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const keys = variantKeysFor(sj.facts.find((f) => f.id === 'p2_palace_frame'));
  assert.ok(keys.includes('p2_clash') || keys.includes('p2_punishment'),
    'precondition: this pair\'s palace scan found a tension');

  // Hand the block a permitted key as well, the way a renderer merging two facts
  // into one block would.
  const base = renderingFor(sj);
  const idx = base.blocks.findIndex((b) => (b.fact_ids || []).includes('p2_palace_frame'));
  const merged = {
    ...base,
    blocks: base.blocks.map((b, i) => (i === idx
      ? { ...b, fact_ids: [...b.fact_ids, 'p3_supply'], text: `${b.text} ${PHRASE}` }
      : b)),
  };
  assert.equal(tension(merged, sj).length, 1, 'the permitted key does not launder the tension');
});

// ============================================================
// THE NEGATION CARVE-OUT (Reyner, 2026-09-08, third ruling)
// ============================================================
// `tidak `, `belum ` or `kurang ` IMMEDIATELY before a tension_collapse token
// exempts the match. hedge_construction's carve-out shape with the direction
// reversed: its negation FOLLOWS the token (`bukan X tapi Y`, a lookahead), these
// PRECEDE it (`tidak selaras`, a lookbehind).
// ============================================================

/** RENDER 12 x 6's penutup, verbatim from docs/qa/2026-09-08-compat-penutup-cause.md. */
const RENDER_12x6_PENUTUP = 'Hubungan ini meminta kamu untuk melatih kesabaran saat ritme '
  + 'harian kalian tidak selaras. Bagi dia, hubungan ini meminta keterbukaan untuk '
  + 'menerima dorongan energi yang kamu berikan agar langkahnya lebih mantap.';

test('RENDER 12x6 PASSES, and it is the sentence the ruling was made on', () => {
  // ── THE RED THIS COMMIT WAS WRITTEN AGAINST ────────────────
  // `tidak selaras` is "NOT in harmony". The sentence names the friction and asks
  // for patience with it - the opposite of a tension collapse, and arguably the
  // check's own purpose stated out loud. It rejected because `\bselaras\b` bans a
  // TOKEN where the defect is a CONSTRUCTION.
  //
  // Gated through the whole of `validateRendering` on a real pair, not just the
  // regex, because the penutup's scope is itself conditional (it is scanned when
  // the reading carries a tension) and 12x6 does carry one - so this asserts the
  // carve-out where it actually has to work.
  const sj = buildPairSemantic(c('1990-06-07', '12:00'), c('1984-04-21', '18:45'));
  assert.ok(sj.facts.flatMap(variantKeysFor).some((k) => TENSION.has(k)),
    'precondition: 12x6 carries a tension, so its penutup IS scanned');

  const rendered = { ...renderingFor(sj), penutup: RENDER_12x6_PENUTUP };
  assert.deepEqual(tension(rendered, sj), [], 'a named friction is not a collapsed one');
});

test('THE COLLAPSE THE CHECK EXISTS FOR STILL REJECTS', () => {
  // Run 1's own sentence, quoted in the `menyatu` entry's note: "turned the
  // steward/self-reliant tension into 'menyatu secara selaras'". If this ever
  // passes, the carve-out has eaten the check.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const rendered = { ...renderingFor(sj), penutup: 'Keduanya menyatu secara selaras.' };
  const found = tension(rendered, sj);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /menyatu/u);
  assert.match(found[0].message, /selaras/u);
});

test('EVERY NEGATION x EVERY TOKEN, both directions', () => {
  // The alternation entry is the one worth enumerating: a carve-out written as a
  // prefix on `\bberpadu\b|\bperpaduan\b` would exempt only the FIRST branch and
  // leave the second live - a half-applied edit that looks complete in a diff.
  const NEGATIONS = ['tidak', 'belum', 'kurang'];
  const TOKENS = ['menyatu', 'selaras', 'saling melengkapi', 'identitas utuh',
    'membentuk kesatuan', 'membentuk satu kesatuan', 'berpadu', 'perpaduan'];

  const sj = buildPairSemantic(A, HARD_SEAT);
  const fire = (penutup) => tension({ ...renderingFor(sj), penutup }, sj).length;

  for (const t of TOKENS) {
    assert.equal(fire(`Mereka ${t} di titik itu.`), 1, `bare "${t}" is still banned`);
    for (const n of NEGATIONS) {
      assert.equal(fire(`Mereka ${n} ${t} di titik itu.`), 0, `"${n} ${t}" is exempt`);
    }
  }
});

test('IMMEDIATELY BEFORE, AND NOTHING LOOSER', () => {
  // `tidak selalu selaras` still rejects. A negation two words away is not
  // negating the token - it is qualifying a claim that still asserts harmony, and
  // "not always in harmony" said of a clashed seat is the softening the check was
  // written for. This is the assertion that keeps the carve-out narrow.
  const sj = buildPairSemantic(A, HARD_SEAT);
  const fire = (penutup) => tension({ ...renderingFor(sj), penutup }, sj).length;

  assert.equal(fire('Mereka tidak selalu selaras.'), 1);
  assert.equal(fire('Mereka belum sepenuhnya menyatu.'), 1);
  assert.equal(fire('Bukan selaras, tapi cukup.'), 1, 'only the three ruled negations exempt');
});

test('THE CARVE-OUT IS ON EVERY PATTERN, alternation branches included', () => {
  // Read off the data rather than off the behaviour above, so a pattern added
  // later without the prefix fails here with a name rather than silently widening
  // the ban back out.
  const NEG = '(?<!\\b(?:tidak|belum|kurang) )';
  for (const entry of BLOCKLIST.style.tension_collapse) {
    // The carve-out is punched out FIRST, then the remainder is split. Splitting
    // the raw pattern on `|` also splits the alternation INSIDE the lookbehind
    // (`tidak|belum|kurang`) and reports three phantom branches - which is what
    // the first version of this assertion did.
    const branches = entry.pattern.replaceAll(NEG, '@').split('|');
    for (const branch of branches) {
      assert.ok(branch.startsWith('@'),
        `every top-level branch of ${entry.pattern} carries the carve-out; "${branch}" does not`);
    }
  }
  assert.ok(BLOCKLIST.style._negation.includes('tidak selalu selaras'),
    'the data records what the carve-out deliberately does NOT cover');
});

test('THE MIRROR SEES THE SAME CARVE-OUT, and that is intended', () => {
  // `tension_collapse` is not pair-scoped as a CATEGORY - only WHERE it is scanned
  // is. So this changes what a MIRROR reading may say too, and that is correct
  // rather than incidental: "kamu belum menyatu dengan sisi itu" names a tension
  // in a mirror reading exactly as it does in a pair one. Stated here because a
  // mirror floor-rate comparison across this commit has to know.
  const mirror = buildSemanticJson(A);
  const bare = renderingFor(mirror, (b, i) => (i === 0 ? { ...b, text: `${b.text} Semua menyatu.` } : b));
  const negated = renderingFor(mirror, (b, i) => (i === 0 ? { ...b, text: `${b.text} Semua belum menyatu.` } : b));

  assert.equal(styleGuard(bare, renderedText(bare), 'gemini', mirror)
    .filter((f) => f.check === 'style.tension_collapse').length, 1);
  assert.equal(styleGuard(negated, renderedText(negated), 'gemini', mirror)
    .filter((f) => f.check === 'style.tension_collapse').length, 0);
});
