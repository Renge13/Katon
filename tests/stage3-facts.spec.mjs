// ============================================================
// Stage 3 Phase 1 — fact inventory lock
// ============================================================
// The fact SET is the thing to protect. A fact that silently stops firing is a
// finding that silently vanishes from every reading of every chart that carries
// it, and nothing downstream would notice: the renderer only ever sees what it
// is given. So the full inventory for all 13 fixture charts is asserted here by
// id, not sampled.
//
// Importance and ordering are NOT asserted. Phase 1 does not score.
//
// Run: npm run test:stage3
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { computeStrength } from '../lib/bazi/strength.ts';
import { computeBadges } from '../lib/bazi/badges.js';
import { buildFactInventory, elementPresence, FACT_GATES } from '../lib/semantic/facts.js';
import { ELEMENT_NAMES_ID, ELEMENT_NAMES_EN, GLOSSARY } from '../lib/semantic/glossary.js';
import { SIX_HARMS, TRINE_SETS } from '../lib/bazi/relations.js';
import { VALIDATION_CHARTS } from './bazi-validation.fixture.js';
import PROVECELL from '../docs/content/provecell-01-USER.json' with { type: 'json' };

const chartFor = (tc) => calculateBaziChart({ birthDate: tc.date, birthTime: tc.time });
const inventoryFor = (tc) => buildFactInventory(chartFor(tc));
const ids = (facts) => facts.map((f) => f.id);

// The full inventory, id by id. Transcribed from a measured run and then read
// through by hand; every entry has a reason to be there.
const EXPECTED = {
  1: ['day_master_Fire', 'strength_weak', 'main_profile', 'element_missing_Wood', 'element_dominant_Water', 'aspek_convergence_比肩', 'aspek_convergence_食神', 'aspek_convergence_偏財', 'aspek_convergence_正官', 'badge_天乙貴人', 'badge_桃花', 'badge_空亡', 'void_stack_month', 'spouse_palace', 'relation_半合_巳酉', 'profile_vs_favorable'],
  2: ['day_master_Earth', 'strength_balanced', 'main_profile', 'element_dominant_Earth', 'aspek_convergence_比肩', 'aspek_convergence_劫財', 'aspek_convergence_正官', 'aspek_convergence_正印', 'badge_天乙貴人', 'badge_驛馬', 'badge_羊刃', 'spouse_palace', 'relation_六合_午未', 'relation_半合_寅午'],
  3: ['day_master_Fire', 'strength_balanced', 'main_profile', 'aspek_convergence_食神', 'aspek_convergence_正官', 'aspek_convergence_七殺', 'aspek_convergence_正印', 'aspek_convergence_偏印', 'badge_文昌', 'badge_驛馬', 'spouse_palace', 'relation_冲_寅申', 'relation_刑_self_辰'],
  4: ['day_master_Water', 'strength_weak', 'main_profile', 'element_dominant_Wood', 'aspek_convergence_劫財', 'aspek_convergence_食神', 'aspek_convergence_傷官', 'badge_天乙貴人', 'badge_文昌', 'badge_驛馬', 'spouse_palace', 'relation_冲_巳亥', 'relation_半合_亥卯', 'relation_刑_self_亥'],
  5: ['day_master_Fire', 'strength_balanced', 'main_profile', 'element_missing_Metal', 'element_dominant_Earth', 'aspek_convergence_食神', 'aspek_convergence_傷官', 'aspek_convergence_正印', 'aspek_convergence_偏印', 'badge_天乙貴人', 'badge_空亡', 'spouse_palace', 'relation_六合_寅亥'],
  6: ['day_master_Water', 'strength_balanced', 'main_profile', 'aspek_convergence_偏財', 'aspek_convergence_七殺', 'aspek_convergence_偏印', 'badge_天乙貴人', 'badge_文昌', 'badge_羊刃', 'badge_空亡', 'spouse_palace', 'relation_害_寅巳'],
  7: ['day_master_Wood', 'strength_weak', 'main_profile', 'element_dominant_Water', 'aspek_convergence_正印', 'badge_桃花', 'spouse_palace', 'relation_冲_子午', 'profile_vs_favorable'],
  8: ['day_master_Metal', 'strength_balanced', 'main_profile', 'element_dominant_Metal', 'aspek_convergence_比肩', 'aspek_convergence_傷官', 'aspek_convergence_正財', 'aspek_convergence_偏印', 'badge_天乙貴人', 'spouse_palace', 'relation_害_子未', 'relation_半合_子辰', 'relation_刑_self_辰'],
  9: ['day_master_Wood', 'strength_weak', 'main_profile', 'aspek_convergence_劫財', 'aspek_convergence_傷官', 'aspek_convergence_正財', 'aspek_convergence_偏財', 'aspek_convergence_七殺', 'aspek_convergence_正印', 'badge_天乙貴人', 'badge_文昌', 'badge_孤辰', 'spouse_palace', 'relation_六合_午未', 'profile_vs_favorable'],
  10: ['day_master_Wood', 'strength_balanced', 'main_profile', 'aspek_convergence_傷官', 'aspek_convergence_正財', 'aspek_convergence_偏財', 'aspek_convergence_正官', 'badge_天乙貴人', 'spouse_palace', 'relation_害_丑午', 'relation_三合_寅午戌'],
  11: ['day_master_Metal', 'strength_balanced', 'main_profile', 'element_dominant_Earth', 'aspek_convergence_傷官', 'aspek_convergence_正印', 'aspek_convergence_偏印', 'badge_天乙貴人', 'badge_驛馬', 'spouse_palace', 'relation_害_丑午', 'relation_半合_寅午'],
  12: ['day_master_Water', 'strength_weak', 'main_profile', 'aspek_convergence_偏財', 'aspek_convergence_七殺', 'badge_天乙貴人', 'badge_文昌', 'spouse_palace', 'relation_刑_self_午', 'profile_vs_favorable'],
  13: ['day_master_Wood', 'strength_balanced', 'main_profile', 'element_dominant_Earth', 'aspek_convergence_比肩', 'aspek_convergence_正財', 'aspek_convergence_偏財', 'aspek_convergence_偏印', 'badge_空亡', 'spouse_palace', 'relation_冲_丑未'],
};

test('the fact set, all 13 charts', () => {
  for (const tc of VALIDATION_CHARTS) {
    assert.deepEqual(ids(inventoryFor(tc)), EXPECTED[tc.id], `chart ${tc.id}`);
  }
});

test('chart 1 covers every fact the hand-written target file carries', () => {
  // docs/content/provecell-01-USER.json is the only shape validated against a
  // real renderer. Its ids are hand-chosen names for the same findings, so the
  // mapping is explicit rather than inferred.
  const TARGET_TO_ENGINE = {
    strength_weak: 'strength_weak',    // was `strength_lean`; corrected in this commit
    profile_drains_self: 'profile_vs_favorable',
    void_month_stack: 'void_stack_month',
    peach_blossom: 'badge_桃花',
    wood_missing: 'element_missing_Wood',
    nobleman: 'badge_天乙貴人',
    officer_convergence: 'aspek_convergence_正官',
    spouse_palace: 'spouse_palace',    // was `spouse_palace_7k`; 七殺 is absent from chart 1
    metal_half_trine: 'relation_半合_巳酉',
    steward_vs_selfreliant: 'aspek_convergence_比肩',
    day_master_fire: 'day_master_Fire',
  };

  const got = new Set(EXPECTED[1]);
  assert.equal(PROVECELL.facts.length, 11, 'the target file carries 11 facts');
  for (const targetFact of PROVECELL.facts) {
    const mapped = TARGET_TO_ENGINE[targetFact.id];
    assert.ok(mapped, `no mapping for target fact ${targetFact.id}`);
    assert.ok(got.has(mapped), `chart 1 lost ${targetFact.id} (-> ${mapped})`);
  }

  // The engine emits five the target file does not. Recorded, not papered over:
  // they are the Phase 2/3 dedupe surface, not defects.
  const extra = EXPECTED[1].filter((id) => !Object.values(TARGET_TO_ENGINE).includes(id));
  assert.deepEqual(extra, [
    // The plain profile fact underneath profile_vs_favorable. Same glossary
    // entry, same four strings; only the framing differs. Marked
    // superseded_by/supersedes so Phase 3 collapses them deterministically
    // instead of by judgment, which is how the target file resolves it too.
    'main_profile',
    // Same finding as officer_convergence seen from the element side. The target
    // file's officer_convergence provenance IS this fact ("Unsur Air muncul di
    // batang bulan, di batang jam, dan sekali lagi di Fondasi Pasanganmu").
    'element_dominant_Water',
    // 戊 x2 at qi weight 0.1 and 庚 x2 at 0.3, both from the duplicated 巳. Two
    // positions each, so they converge by the letter of the rule and barely at
    // all by presence. This is why the convergence term must weight by presence
    // and not by position count.
    'aspek_convergence_食神',
    'aspek_convergence_偏財',
    // The bare void badge underneath void_stack_month. D2 is explicit that the
    // stack must not replace its parts at inventory time; whether both reach the
    // renderer is a Phase 3 question.
    'badge_空亡',
  ]);
});

test('every fact carries the renderer contract shape', () => {
  const CONTENT_FIELDS = ['label', 'label_bracket', 'label_meaning', 'gift', 'cost', 'actionable'];
  for (const tc of VALIDATION_CHARTS) {
    for (const f of inventoryFor(tc)) {
      assert.equal(typeof f.id, 'string', `chart ${tc.id}`);
      assert.ok(['core', 'tension', 'badge', 'extremity', 'convergence', 'combination'].includes(f.type),
        `chart ${tc.id}: ${f.id} has type ${f.type}`);
      assert.equal(typeof f.provenance, 'object', `chart ${tc.id}: ${f.id} provenance`);
      assert.ok(f.provenance.kind, `chart ${tc.id}: ${f.id} provenance.kind`);
      for (const field of CONTENT_FIELDS) {
        assert.ok(field in f, `chart ${tc.id}: ${f.id} is missing ${field}`);
      }
      // No fact may carry an importance in Phase 1. Scoring is Phase 2.
      assert.ok(!('importance' in f), `chart ${tc.id}: ${f.id} was scored in Phase 1`);
    }
  }
});

test('no fact has a glossary gap', () => {
  // Every fact type is fully backed by Reyner-reviewed content. The strength
  // verdict was the last gap and glossary.kekuatan closed it (3b5685e,
  // 2026-08-02). If this grows, new copy is needed and someone has to be told,
  // not the test relaxed.
  const gaps = new Set();
  for (const tc of VALIDATION_CHARTS) {
    for (const f of inventoryFor(tc)) if (f.glossary_gap) gaps.add(f.id);
  }
  assert.deepEqual([...gaps].sort(), []);
});

test('the strength fact carries its glossary entry', () => {
  // The positive form of the assertion above, aimed at the one fact that used to
  // be the gap. A verdict with no label_meaning must fail here rather than ship:
  // rule 21 lets "lemah"/"kuat" through ONLY when the explanation lands in the
  // same breath, so the meaning sentence is not optional decoration.
  for (const tc of VALIDATION_CHARTS) {
    const f = inventoryFor(tc).find((x) => x.id.startsWith('strength_'));
    assert.ok(f, `chart ${tc.id}: no strength fact`);
    assert.equal(f.glossary_gap, undefined, `chart ${tc.id}: ${f.id} still flagged as a gap`);
    for (const field of ['label', 'label_bracket', 'label_meaning', 'gift', 'cost']) {
      assert.ok(f[field], `chart ${tc.id}: ${f.id}.${field} is empty`);
    }
  }
});

test('no English element name leaks into provenance', () => {
  // D2a §5. The strength engine speaks Wood/Fire; every derived string must
  // speak Kayu/Api, and the translation goes through glossary.elemen.
  //
  // SCOPED TO provenance ON PURPOSE. D2a asks for "no English element name
  // anywhere in the output", but label_bracket legitimately carries the
  // glossary's own name_en — "Fire", "Missing Wood" — and rule 23's EN display
  // layer wants exactly that. The blanket version of the assertion would ban the
  // bracket terms the product is built on.
  for (const tc of VALIDATION_CHARTS) {
    for (const f of inventoryFor(tc)) {
      const text = JSON.stringify(f.provenance);
      for (const en of ELEMENT_NAMES_EN) {
        assert.ok(!new RegExp(`"${en}"`).test(text),
          `chart ${tc.id}: ${f.id} provenance carries the English "${en}"`);
      }
      for (const key of ['element', 'season_ruler_element']) {
        if (f.provenance[key] == null) continue;
        assert.ok(ELEMENT_NAMES_ID.includes(f.provenance[key]),
          `chart ${tc.id}: ${f.id} provenance.${key} = ${f.provenance[key]}`);
      }
    }
  }
});

test('badges in the inventory match the badge engine exactly', () => {
  for (const tc of VALIDATION_CHARTS) {
    const chart = chartFor(tc);
    const fromEngine = computeBadges(chart).map((b) => `badge_${b.key}`).sort();
    const fromFacts = ids(buildFactInventory(chart)).filter((id) => id.startsWith('badge_')).sort();
    assert.deepEqual(fromFacts, fromEngine, `chart ${tc.id}`);
  }
});

test('CR-1 fires on 4 of 13, never on a balanced chart', () => {
  // The balanced exclusion is the whole point; without it this is 9 of 13.
  let fired = 0;
  for (const tc of VALIDATION_CHARTS) {
    const chart = chartFor(tc);
    const strength = computeStrength(chart);
    const has = ids(buildFactInventory(chart, strength)).includes('profile_vs_favorable');
    if (has) {
      fired++;
      assert.notEqual(strength.verdict, 'balanced', `chart ${tc.id} forced a tension`);
    }
  }
  assert.equal(fired, 4, 'charts 1, 7, 9 and 12');
});

test('void_stack needs a real stack — chart 1 only', () => {
  const stacks = [];
  for (const tc of VALIDATION_CHARTS) {
    for (const f of inventoryFor(tc)) {
      if (f.id.startsWith('void_stack')) stacks.push([tc.id, f.id, f.stack_size]);
    }
  }
  assert.deepEqual(stacks, [[1, 'void_stack_month', 3]],
    '酉 carrying the profile source, Bunga Persik and Bintang Penolong');
});

test('element presence is percent-of-total and reproduces the target file', () => {
  const c1 = chartFor(VALIDATION_CHARTS[0]);
  const presence = elementPresence(c1);
  assert.deepEqual(presence, { Wood: 0, Fire: 27.5, Earth: 15, Metal: 20, Water: 37.5 });
  // The same five numbers the hand-written file carries, in Indonesian.
  assert.deepEqual(PROVECELL.chart.element_presence,
    { Air: 37.5, Api: 27.5, Logam: 20.0, Tanah: 15.0, Kayu: 0.0 });

  for (const tc of VALIDATION_CHARTS) {
    const total = Object.values(elementPresence(chartFor(tc))).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 100) < 0.35, `chart ${tc.id} sums to ${total}`);
  }
});

test('the gates are stated, not scattered', () => {
  assert.deepEqual(FACT_GATES, {
    elementDominantPct: 35,
    aspekConvergencePositions: 2,
    voidStackNotables: 2,
  });
});

test('relations.js and the glossary agree on 六害; TRINE_SETS matches strength.ts', () => {
  // The 六害 table lives in two places by necessity — code needs it, the glossary
  // documents it. This is what stops them drifting.
  const fromGlossary = GLOSSARY.relasi_cabang.害.pairs.map((p) => [...p]);
  assert.deepEqual(SIX_HARMS, fromGlossary);

  // TRINE_SETS duplicates strength.ts's private TRINES. Asserted through the
  // glossary, which carries the same four sets, so all three stay in step.
  const glossaryTrines = GLOSSARY.relasi_cabang.三合.sets;
  for (const trine of TRINE_SETS) {
    assert.ok(trine.key in glossaryTrines, `${trine.key} missing from the glossary`);
    assert.deepEqual([...trine.key], trine.members, `${trine.key} members`);
  }
  assert.equal(Object.keys(glossaryTrines).length, TRINE_SETS.length);
});

test('supersession is symmetric and only fires with CR-1', () => {
  for (const tc of VALIDATION_CHARTS) {
    const facts = inventoryFor(tc);
    const cr1 = facts.find((f) => f.id === 'profile_vs_favorable');
    const plain = facts.find((f) => f.id === 'main_profile');
    assert.ok(plain, `chart ${tc.id}: main_profile is always present`);
    if (cr1) {
      // An ARRAY as of 2026-08-05: CR-1 absorbs main_profile always, and the
      // convergence of the SAME Aspek when the chart has one (charts 9 and 12).
      assert.ok(Array.isArray(cr1.supersedes), `chart ${tc.id}: supersedes is a list`);
      assert.ok(cr1.supersedes.includes('main_profile'), `chart ${tc.id}`);
      assert.equal(plain.superseded_by, 'profile_vs_favorable', `chart ${tc.id}`);

      // The twin convergence, if any, is absorbed and carries its positions over.
      const twin = facts.find((f) => f.provenance.kind === 'aspek_convergence'
        && f.provenance.god === cr1.provenance.god);
      if (twin) {
        assert.ok(cr1.supersedes.includes(twin.id), `chart ${tc.id}: ${twin.id} absorbed`);
        assert.equal(twin.superseded_by, 'profile_vs_favorable', `chart ${tc.id}`);
        // The collapse must not lose what only the convergence knew.
        assert.deepEqual(cr1.provenance.convergence_positions, twin.provenance.positions,
          `chart ${tc.id}: positions carried`);
        assert.deepEqual(cr1.provenance.convergence_palaces, twin.provenance.palaces,
          `chart ${tc.id}: palaces carried`);
      } else {
        assert.equal(cr1.supersedes.length, 1, `chart ${tc.id}: nothing else to absorb`);
        assert.ok(!('convergence_positions' in cr1.provenance), `chart ${tc.id}`);
      }
    } else {
      assert.ok(!('superseded_by' in plain), `chart ${tc.id}: nothing supersedes it`);
    }
  }
});

test('every relation fact carries its span as a ready Indonesian phrase', () => {
  // `relation_positions` was the ONE gate check a prompt edit did not move
  // (PROGRESS 2026-08-02: 24% -> 28% across baa5b7c0 -> 9f5ee276, flat at n=39,
  // after an instruction that named it explicitly). The renderer was handed an
  // array of positions and asked to say all of them, and kept saying two of
  // three. `positions_id` hands it the finished phrase instead.
  //
  // This asserts the JOIN, not the wording: every name must come from
  // GLOSSARY.pilar, so nothing here can become unreviewed user-facing copy.
  let seen = 0;
  for (const tc of VALIDATION_CHARTS) {
    for (const fact of inventoryFor(tc)) {
      const kind = fact.provenance?.kind;
      if (kind !== 'branch_relation' && kind !== 'punishment') continue;
      seen += 1;

      const phrase = fact.provenance.positions_id;
      assert.equal(typeof phrase, 'string', `chart ${tc.id} ${fact.id}`);

      // Exactly the palaces the fact claims, no more and no fewer. This is the
      // property the renderer was failing to preserve by hand.
      const expected = [...new Set(fact.provenance.palaces)];
      for (const palace of expected) {
        assert.ok(phrase.includes(palace), `chart ${tc.id} ${fact.id}: missing ${palace}`);
      }
      const named = Object.values(GLOSSARY.pilar)
        .map((p) => p.name_id)
        .filter((name) => phrase.includes(name));
      assert.deepEqual(named.sort(), [...expected].sort(),
        `chart ${tc.id} ${fact.id}: phrase names a palace the fact does not claim`);

      // Reading order, never the order the relation table happened to list. Chart
      // 1's 半合 positions are [year, hour, month]; the phrase must not say them
      // that way round.
      const order = ['Pilar Akar', 'Pilar Kerja', 'Pilar Diri', 'Pilar Arah']
        .filter((name) => phrase.includes(name))
        .map((name) => phrase.indexOf(name));
      assert.deepEqual(order, [...order].sort((a, b) => a - b),
        `chart ${tc.id} ${fact.id}: not in reading order`);

      // Indonesian list punctuation: "A dan B", "A, B, dan C".
      if (expected.length === 1) assert.equal(phrase, expected[0]);
      else assert.ok(phrase.includes(' dan '), `chart ${tc.id} ${fact.id}: no conjunction`);
      if (expected.length > 2) assert.ok(phrase.includes(', '), `chart ${tc.id} ${fact.id}`);
    }
  }
  assert.equal(seen, 21, '13 fixture charts carry 21 relation facts between them');
});

test('the chart-1 relation span is the phrase the renderer is told to copy', () => {
  // The worked example, pinned. Positions are [year, hour, month] in the relation
  // table and the phrase is in reading order.
  const fact = inventoryFor(VALIDATION_CHARTS[0])
    .find((f) => f.id === 'relation_半合_巳酉');
  assert.deepEqual([...fact.provenance.positions].sort(), ['hour', 'month', 'year']);
  assert.equal(fact.provenance.positions_id, 'Pilar Akar, Pilar Kerja, dan Pilar Arah');
});
