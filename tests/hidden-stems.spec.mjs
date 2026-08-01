// ============================================================
// 藏干 hidden-stem table LOCK
// ============================================================
// This table is EVIDENCE, verified branch by branch against Joey Yap's printed
// hidden stems (docs/prompts/C4-data-and-two-corrections.md). It is the single
// most load-bearing lookup in the engine: every one of buildChart, tenGods,
// mainProfile, tenGodTally and strength reads it, so an error here is an error in
// every derived fact at once.
//
// WHY THIS FILE EXISTS
// 子 was wrong for the entire build — specified as 壬 when it is 癸. The cost:
// four fixture charts assigned their Water to the wrong Ten God, the
// zero-presence law read 126/130 instead of 130/130, and Track A sat at 7/13
// when the correct table gives 8/13. It was found only because Joey's own
// per-stem output was collected. A single test would have caught it.
//
// THE TRAP, stated so it is not "fixed" back: the Yang/Yin split of the Water
// and Fire branches is the OPPOSITE of each branch's own polarity label.
//   亥 (Yin branch)  -> 壬 Yang Water        子 (Yang branch) -> 癸 Yin Water
//   巳 (Yin branch)  -> 丙 Yang Fire         午 (Yang branch) -> 丁 Yin Fire
//
// Run: npm run test:hidden-stems
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { HIDDEN_STEMS, BRANCHES, STEM_ELEMENTS } from '../lib/bazi/stems.js';

/** Verified against Joey's printed hidden stems, all twelve branches. */
const VERIFIED = {
  子: [['癸', 1.0]],
  丑: [['己', 0.6], ['癸', 0.3], ['辛', 0.1]],
  寅: [['甲', 0.6], ['丙', 0.3], ['戊', 0.1]],
  卯: [['乙', 1.0]],
  辰: [['戊', 0.6], ['乙', 0.3], ['癸', 0.1]],
  巳: [['丙', 0.6], ['庚', 0.3], ['戊', 0.1]],
  午: [['丁', 0.6], ['己', 0.4]],
  未: [['己', 0.6], ['丁', 0.3], ['乙', 0.1]],
  申: [['庚', 0.6], ['壬', 0.3], ['戊', 0.1]],
  酉: [['辛', 1.0]],
  戌: [['戊', 0.6], ['辛', 0.3], ['丁', 0.1]],
  亥: [['壬', 0.6], ['甲', 0.4]],
};

test('every branch matches the verified 藏干 table exactly', () => {
  for (const branch of BRANCHES) {
    const want = VERIFIED[branch];
    assert.ok(want, `no verified entry for ${branch}`);
    const got = HIDDEN_STEMS[branch];
    assert.ok(got, `HIDDEN_STEMS is missing ${branch}`);
    assert.equal(got.length, want.length, `${branch}: wrong number of hidden stems`);
    got.forEach((h, i) => {
      assert.equal(h.stem, want[i][0], `${branch} position ${i}: stem`);
      assert.equal(h.weight, want[i][1], `${branch} position ${i}: weight`);
    });
  }
});

test('every branch qi shares sum to exactly 1.0', () => {
  // Each branch distributes exactly one unit of weight. A branch summing to
  // anything else silently reweights that pillar against the other three.
  for (const branch of BRANCHES) {
    const total = HIDDEN_STEMS[branch].reduce((s, h) => s + h.weight, 0);
    assert.ok(Math.abs(total - 1.0) < 1e-9, `${branch} sums to ${total}`);
  }
});

test('子 is 癸 and 亥 is 壬 — the polarity trap', () => {
  // The regression that cost this build a full measurement cycle.
  assert.equal(HIDDEN_STEMS['子'][0].stem, '癸', '子 hides YIN Water');
  assert.equal(HIDDEN_STEMS['亥'][0].stem, '壬', '亥 hides YANG Water');
  assert.equal(HIDDEN_STEMS['巳'][0].stem, '丙', '巳 hides YANG Fire');
  assert.equal(HIDDEN_STEMS['午'][0].stem, '丁', '午 hides YIN Fire');
});

test('main qi is the strongest share in every branch', () => {
  // The table is documented "main stem first"; consumers rely on index 0 being
  // the main qi (mainProfile walks it in qi order).
  for (const branch of BRANCHES) {
    const [main, ...rest] = HIDDEN_STEMS[branch];
    for (const r of rest) {
      assert.ok(main.weight >= r.weight, `${branch}: ${r.stem} outweighs main qi ${main.stem}`);
    }
  }
});

test('every hidden stem is a real stem with a known element', () => {
  for (const branch of BRANCHES) {
    for (const h of HIDDEN_STEMS[branch]) {
      assert.ok(STEM_ELEMENTS[h.stem], `${branch}: unknown stem ${h.stem}`);
    }
  }
});
