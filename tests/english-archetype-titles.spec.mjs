// ============================================================
// tests/english-archetype-titles.spec.mjs — the archetype is shown by its English name
// ============================================================
// Run: npm run test:english-archetype-titles
//
// RULED 2026-10-02 (Reyner, G1 + E7; CLAUDE.md rule 23 AMENDED): "Accept English
// titles", scope "Everywhere": reading prose, result page, PDFs, cards. The Indonesian
// archetype name is no longer shown to readers and is never bracketed beside the
// English ("Kamu adalah The Garden", not "Taman (The Garden)"). The glossary keeps
// name_id; the rest of the reading stays Indonesian. Prompt BB §3.
//
// The pair is BB's: A 2005-02-14 07:00 (己, Taman / The Garden), B 1999-07-07 17:00
// (庚, Besi Tempa / The Forge).
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildSemanticJson } from '../lib/semantic/index.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { assembleFallback } from '../lib/render/fallback.js';
import { writerPayload } from '../lib/render/payload.js';
import { withEngineOpening } from '../lib/render/pairOpening.js';
import { validateRenderingV2 } from '../lib/validate/v2.js';
import { validateRendering } from '../lib/validate/index.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';

const A = calculateBaziChart({ birthDate: '2005-02-14', birthTime: '07:00' });
const B = calculateBaziChart({ birthDate: '1999-07-07', birthTime: '17:00' });
const PAIR = buildPairSemantic(A, B, { voice: 'v2' });
const MIRROR = buildSemanticJson(A, { voice: 'v2' });
const rejecting = (r) => r.findings.filter((f) => f.severity !== 'flag').map((f) => f.check);
const INDONESIAN = Object.values(GLOSSARY.arketipe).map((e) => e?.name_id).filter(Boolean);

test('PRECONDITION: A is Taman / The Garden, B is Besi Tempa / The Forge', () => {
  assert.equal(GLOSSARY.arketipe[A.day.stem].name_en, 'The Garden');
  assert.equal(GLOSSARY.arketipe[B.day.stem].name_en, 'The Forge');
});

test('THE WRITER IS HANDED NO INDONESIAN ARCHETYPE NAME, mirror and pair', () => {
  for (const [kind, sj, en] of [['mirror', MIRROR, ['The Garden']], ['pair', PAIR, ['The Garden', 'The Forge']]]) {
    const wire = JSON.stringify(writerPayload(sj));
    for (const name of ['Taman', 'Besi Tempa']) assert.ok(!wire.includes(`"${name}"`), `${kind}: "${name}" reaches the writer`);
    for (const name of en) assert.ok(wire.includes(name), `${kind}: the writer has "${name}"`);
  }
});

test('THE PAIR OPENING (p0_opening) names both people by their English titles', () => {
  const opening = PAIR.facts.find((f) => f.id === 'p0_opening');
  assert.ok(opening.label_meaning.includes('The Garden') && opening.label_meaning.includes('The Forge'), opening.label_meaning);
  assert.ok(!opening.label_meaning.includes('Taman') && !opening.label_meaning.includes('Besi Tempa'));
});

test('E7: an opening naming "The Garden" and "The Forge" passes pair.both_named; one naming neither fails', () => {
  const draft = structuredClone(assembleFallback(PAIR));
  const named = withEngineOpening(draft, PAIR).rendered;
  // The English names ALONE: an opening carrying the Indonesian ones would pass on main.
  named.blocks[0].text = 'Ini bacaan tentang The Garden dan The Forge, dan apa yang terjadi saat keduanya bertemu.';
  assert.equal(rejecting(validateRenderingV2(named, PAIR)).includes('pair.both_named'), false,
    JSON.stringify(rejecting(validateRenderingV2(named, PAIR))));
  const nameless = structuredClone(named);
  nameless.blocks[0].text = 'Bacaan ini tentang kalian berdua.';
  assert.ok(rejecting(validateRenderingV2(nameless, PAIR)).includes('pair.both_named'));
});

test('THE FLOOR names the archetype in English, with no Indonesian name and no bracket', () => {
  for (const [kind, sj] of [['mirror', MIRROR], ['pair', PAIR]]) {
    const text = JSON.stringify(assembleFallback(sj));
    assert.ok(text.includes('The Garden'), `${kind} floor names The Garden`);
    for (const name of INDONESIAN) assert.ok(!new RegExp(`(?<![\\p{L}])${name}(?![\\p{L}])`, 'u').test(text), `${kind} floor shows "${name}"`);
    assert.ok(!text.includes('(The Garden)'), `${kind} floor brackets the title`);
  }
});

test('THE GATE NORMALISES a writer\'s Indonesian archetype name to the English title, mirror and pair', () => {
  const cases = [
    ['Kamu adalah Taman (The Garden) yang sabar.', 'Kamu adalah The Garden yang sabar.'],
    ['Kamu adalah Taman yang sabar.', 'Kamu adalah The Garden yang sabar.'],
    ['Kamu adalah The Garden (Taman) yang sabar.', 'Kamu adalah The Garden yang sabar.'],
    ['Kamu adalah Taman [Garden] yang sabar.', 'Kamu adalah The Garden yang sabar.'],
    ['Kamu adalah The Garden yang sabar.', 'Kamu adalah The Garden yang sabar.'],
  ];
  for (const [sj, gate] of [[MIRROR, validateRenderingV2], [buildSemanticJson(A, { voice: 'v1' }), validateRendering]]) {
    for (const [written, served] of cases) {
      const d = structuredClone(assembleFallback(sj));
      d.blocks[0].text = `${written} ${d.blocks[0].text}`;
      const out = gate(d, sj).normalized.blocks[0].text;
      assert.ok(out.startsWith(served), `${sj.voice}: "${written}" -> "${out.slice(0, 60)}"`);
    }
  }
  // Pair: the partner's name too, outside the engine's opening block.
  const d = withEngineOpening(structuredClone(assembleFallback(PAIR)), PAIR).rendered;
  const i = d.blocks.findIndex((b) => !(b.fact_ids || []).includes('p0_opening'));
  d.blocks[i].text = `Besi Tempa (The Forge) membawa ketegasan. ${d.blocks[i].text}`;
  const r = validateRenderingV2(d, PAIR);
  assert.ok(r.normalized.blocks[i].text.startsWith('The Forge membawa ketegasan.'), r.normalized.blocks[i].text.slice(0, 60));
  assert.deepEqual(rejecting(r), []);
});
