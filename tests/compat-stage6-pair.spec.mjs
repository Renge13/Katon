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
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { validateRendering, STAGE6_VERSION } from '../lib/validate/index.js';
import { pairGuard } from '../lib/validate/pair.js';
import { stricterDirective } from '../lib/validate/directive.js';
import BLOCKLIST from '../lib/validate/blocklist.json' with { type: 'json' };

const c = (d, t) => calculateBaziChart({ birthDate: d, birthTime: t });
const A = c('1989-09-13', '09:00');
// chart 12: the 子卯 punishment on the day pair, so p2_reframe_required is raised.
const HARD_SEAT = c('1990-06-07', '12:00');

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
  // 1.25.0: `style.hedge_construction` is exempt for `kind === 'pair'` (Reyner,
  // R2 / R2-SCOPE, 2026-09-13). ONE accept-changing edit and it LOOSENS: the
  // shape the compat prompt mandates stops being rejected in compat readings,
  // and stays rejected in mirror ones.
  // 1.26.0-1.38.0 (2026-09-24) are the voice-v2 gate and judge, VOICE=v2 only; this exemption and
  // every v1 check are unchanged by it, which this file's other assertions prove.
  // 1.39.0: pair direction and supplier are hard (Prompt AG item 1): tightens,
  // pair only (tests/pair-truth.spec.mjs).
  // 1.40.0: a cross-chart relation between two non-day pillars is hard (AG item 1).
  // 1.41.0: element dominance agrees with the engine (mirror; v2 pairs via mirror.a/b).
  // 1.42.0: no judge in the v2 render path (Reyner, 2026-09-26, MVP); v1 unchanged.
  // 1.43.0: a cached row is re-gated by the voice that wrote it (AG item 4); v1 unchanged.
  // 1.44.0: fact.badge_invented reads both mirrors on a v2 pair (AG item 4); v1 unchanged.
  // 1.45.0: main's 1.39.0-1.41.0 merged onto v2 (AG item 1).
  // 1.46.0: fact.element_dominance is hard on v2 (AG item 1).
  // 1.47.0: a cached pair row is re-gated on serve (main, AI §2). 1.48.0: that, merged onto v2.
  // 1.64.0: the word bans lifted (AZ). 1.65.0: hedgeAboutReader deleted (BA).
  // 1.66.0: pair.reframe_missing removed (A4, Prompt BB §2.2).
  assert.equal(STAGE6_VERSION, '1.69.0');
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

// reframe_present (pair.reframe_missing) was REMOVED 2026-10-02 (A4, STAGE6 1.66.0):
// its three tests - rejects a dropped reframe, silent on an easy seat, the threshold
// sits above the coverage floor - went with it. tests/gate-rulings-2026-10-02.spec.mjs
// asserts the same dropped-reframe draft is now accepted.

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
// RETIRED 2026-10-01: THE VERDICT PATTERNS, AND THE PAIR SCOPE OF THE REGISTER BANS
// ============================================================
// Reyner (Prompt AZ, STAGE6 1.64.0): "Lift the ban on A and B. We don't ban
// specifics for the writer, just give overall direction." This section used to pin
// the five verdict patterns (2026-09-08), the per-block pair scope of
// style.tension_collapse and style.hedge_construction, and the negation carve-out
// shared by them. All of that left the gate the same day. The patterns and the scope
// are kept, with their notes, under blocklist.json `_retired_2026-10-01`, which
// nothing reads; these tests pin that it is retired rather than lost, and that a pair
// reading carrying the retired words is no longer flagged or rejected for them.
// ============================================================

test('THE VERDICT PATTERNS ARE RETIRED, not lost', () => {
  assert.equal(BLOCKLIST.verdict, undefined, 'nothing gates on verdict.patterns any more');
  const retired = BLOCKLIST['_retired_2026-10-01'];
  assert.deepEqual(retired.verdict.patterns.map((e) => e.pattern), [
    String.raw`\b(tidak |kurang |sangat )?cocok\b`,
    String.raw`\bberjodoh\b|\bjodoh\b`,
    String.raw`\bpasangan (ideal|sempurna|tepat)\b`,
    String.raw`\b(layak|pantas) (dipertahankan|dilanjutkan|ditinggalkan)\b`,
    String.raw`\b(harus|sebaiknya) (putus|pisah|bertahan)\b`,
  ], 'the five ruled patterns, archived with their notes');
  for (const e of retired.verdict.patterns) assert.ok(e.note && e.note.length > 40, `${e.pattern} keeps its reason`);
  assert.ok(retired['style._pair_scope'], 'the pair scope is archived with them');
  assert.equal(BLOCKLIST.style._pair_scope, undefined, 'and nothing reads it');
});

test('A PAIR READING SAYING "cocok" OR "saling melengkapi dan tetap selaras" IS NO LONGER FLAGGED FOR IT', () => {
  const sj = buildPairSemantic(A, HARD_SEAT);
  const sentence = 'Menurut bagan ini kalian sangat cocok dan berjodoh. Keduanya saling melengkapi dan tetap selaras.';
  assert.deepEqual(codes(pairGuard(renderingFor(sj), sj, sentence)).filter((c) => c === 'pair.verdict'), []);
  const rendered = { ...renderingFor(sj), penutup: sentence };
  const gate = validateRendering(rendered, sj, { provider: 'module_assembly' });
  const lifted = codes(gate.findings).filter((c) => ['pair.verdict', 'style.tension_collapse', 'style.hedge_construction'].includes(c));
  assert.deepEqual(lifted, [], `a retired check still fires: ${lifted.join(', ')}`);
  // The kept categories still reach a pair: a medical claim is HARD.
  const med = validateRendering({ ...renderingFor(sj), penutup: 'Mintalah resep dokter yang tepat untuk kalian.' }, sj, { provider: 'module_assembly' });
  assert.ok(codes(med.findings).includes('forbidden.medical'));
  assert.equal(med.hard, true);
});
