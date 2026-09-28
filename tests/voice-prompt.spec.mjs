// ============================================================
// tests/voice-prompt.spec.mjs — the v2 writer prompts are Prompt AE's, verbatim
// ============================================================
// Run: npm run test:voice-prompt
//
// Voice v2. The two v2 instruction texts are Prompt AE §1 and §2 VERBATIM (they
// replaced the 2026-09-24 spec's §2/§3 on 2026-09-26), followed by Reyner's
// examples (AE §3): the mirror gets the MIRROR section, the pair gets both. The v1
// prompts - what production sends - do not move and never see the examples.
// Every expected text is read from the committed source file, never retyped here.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import {
  loadPrompt, MASTER_PROMPTS, PROMPT_VERSIONS, promptVersionFor,
} from '../lib/render/prompt.js';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\r\n?/g, '\n');

const ae = read('docs/prompts/AE-writer-instructions.md');
function fenceAfter(heading) {
  const at = ae.indexOf(heading);
  assert.notEqual(at, -1, `AE has no heading ${heading}`);
  const open = ae.indexOf('```\n', at);
  return `${ae.slice(open + 4, ae.indexOf('\n```', open + 4))}\n`;
}
// AE §1 and §2 VERBATIM, with the ruled edits since, applied here as those exact
// edits in order, so any other drift from AE still fails the verbatim tests below.
//   B31 (Reyner, 2026-09-28): the open-ended close loses its example clause.
//   B33/B34 (Reyner, 2026-09-28; AK amendment 1 §1b): the close becomes ONE
//   instruction - a confident observation, not "Mungkin menarik untuk..." - and the
//   pair prompt's own close line, which invited an open musing, goes.
const CLOSE_NEW = 'End on a confident observation that leaves her wanting to look\nfurther; do not open it with "Mungkin menarik untuk...". Advice is optional, never\nrequired.';
const MIRROR_EDITS = [
  ['makes her want to look further, for instance at the people closest to her. Advice', 'makes her want to look further. Advice'],
  ['You may end a thought on an open observation that\nmakes her want to look further. Advice is optional, never\nrequired.', CLOSE_NEW],
];
const COMPAT_EDITS = [
  ['The penutup leaves something worth exploring between them. It does not sum the pair up and does not\nassign homework', 'The penutup does not sum the pair up and does not\nassign homework'],
];
const applyEdits = (text, edits, where) => edits.reduce((t, [from, to]) => {
  assert.ok(t.includes(from), `${where} no longer carries: ${from.slice(0, 50)}`);
  return t.replace(from, to);
}, text);
const AE_MIRROR = applyEdits(fenceAfter('## 1. Replace `docs/content/renderer-prompt-v2.txt`'), MIRROR_EDITS, 'AE §1');
const AE_COMPAT = applyEdits(fenceAfter('## 2. Replace `docs/content/compat-renderer-prompt-v2.txt`'), COMPAT_EDITS, 'AE §2');

const EXAMPLES = read('docs/content/voice-examples-v2.txt');
const MIRROR_EXAMPLES = EXAMPLES.slice(0, EXAMPLES.indexOf('=== PAIR EXAMPLES ==='));
const PAIR_ONLY = EXAMPLES.slice(EXAMPLES.indexOf('=== PAIR EXAMPLES ==='));

// On main bb4a0b0. The v1 prompts are untouched.
const V1_VERSIONS = { mirror: '22316c3349d0ea46', pair: '6e7b2997b97c40a3' };

test('V1 PROMPTS ARE UNTOUCHED', () => {
  assert.deepEqual(PROMPT_VERSIONS, V1_VERSIONS);
  assert.equal(loadPrompt('mirror'), MASTER_PROMPTS.mirror);
  assert.equal(loadPrompt('pair', 'v1'), MASTER_PROMPTS.pair);
});

test('THE v2 MIRROR PROMPT IS AE §1 VERBATIM, THEN THE MIRROR EXAMPLES', () => {
  assert.equal(loadPrompt('mirror', 'v2'), `${AE_MIRROR}\n${MIRROR_EXAMPLES.trimEnd()}\n`);
});

test('THE v2 PAIR PROMPT IS AE §1, THEN §2, THEN BOTH EXAMPLE SECTIONS, and nothing else', () => {
  assert.equal(loadPrompt('pair', 'v2'), `${AE_MIRROR}\n${AE_COMPAT}\n${EXAMPLES}`);
});

test('THE EXAMPLES LOAD ON v2 ONLY: no v1 prompt carries the preamble or any example', () => {
  const preamble = 'The examples that follow come from other people\'s charts.';
  const exampleLine = 'Sebagai Samudra, elemen Air di dalam dirimu';
  const pairLine = 'Di antara kalian mengalir dinamika Inti Menghidupi';
  for (const kind of ['mirror', 'pair']) {
    const v1 = loadPrompt(kind, 'v1');
    const v2 = loadPrompt(kind, 'v2');
    for (const s of [preamble, exampleLine, pairLine, '=== MIRROR EXAMPLES ===']) {
      assert.ok(!v1.includes(s), `v1 ${kind} carries "${s}"`);
    }
    assert.ok(v2.includes(preamble), `v2 ${kind} lacks the example preamble`);
    assert.ok(v2.includes(exampleLine), `v2 ${kind} lacks the mirror examples`);
  }
  // The pair section is the pair's alone.
  assert.ok(!loadPrompt('mirror', 'v2').includes(PAIR_ONLY.trim().split('\n')[0]));
  assert.ok(loadPrompt('pair', 'v2').includes(pairLine));
});

test('v2 INSTRUCTIONS ARE SHORTER THAN v1 (spec: "v2 is smaller than v1, not larger")', () => {
  // Measured on the instruction text alone. The examples are material, not rules;
  // with them the v2 mirror is ~10k chars against v1's ~22k, still smaller.
  assert.ok(AE_MIRROR.length < loadPrompt('mirror').length / 4);
  assert.ok(loadPrompt('mirror', 'v2').length < loadPrompt('mirror').length);
});

test('A v2 ROW CARRIES A v2 PROMPT VERSION, distinct from every v1 version', () => {
  for (const kind of ['mirror', 'pair']) {
    const v2 = promptVersionFor(kind, 'v2');
    assert.match(v2, /^v2-/u);
    assert.notEqual(v2, V1_VERSIONS[kind]);
  }
});

// ── B31 (Reyner, 2026-09-28): KEEP THE OPEN-ENDED CLOSE, REMOVE THE EXAMPLE PHRASE ──
// Round 4 ended a thought with "Mungkin menarik untuk melihat/memperhatikan ..." in
// 7 of 7 readings, most of them pointing at the people closest to her: the prompt's
// own example, followed. The permission stays; the example goes
// (docs/content/voice-constraint-rulings-2026-09-26.md B31).
test('B31: the v2 prompts carry the open-ended close WITHOUT its example phrase', () => {
  for (const kind of ['mirror', 'pair']) {
    const p = loadPrompt(kind, 'v2').replace(/\s+/gu, ' ');
    assert.equal(p.includes('for instance at the people closest to her'), false, `${kind} still has the example`);
    // The permission to end open is kept; since B33/B34 it is worded as the
    // confident-close instruction (tested below), so this checks the open ending.
    assert.ok(p.includes('leaves her wanting to look further'), `${kind} lost the open-ended ending itself`);
  }
});

// ── B33 / B34 (Reyner, 2026-09-28): ONE CLOSE INSTRUCTION, NO INVITED QUESTION ──
// "Mungkin menarik" stayed in 4 of 7 round-4b readings after B31. The prompt now says
// it once: end on a confident observation, not "Mungkin menarik untuk...". Questions
// are neither banned nor asked for; the old wording that invited an open musing goes.
// Prompt only: no gate, no blocklist entry (docs/content/voice-constraint-rulings B33, B34).
test('B33/B34: the v2 prompts carry the confident-close instruction and none of the removed wording', () => {
  for (const kind of ['mirror', 'pair']) {
    const p = loadPrompt(kind, 'v2').replace(/\s+/gu, ' ');
    assert.ok(p.includes('End on a confident observation that leaves her wanting to look further; do not open it with "Mungkin menarik untuk...".'),
      `${kind} lacks the new close instruction`);
    for (const gone of ['You may end a thought on an open observation', 'The penutup leaves something worth exploring between them']) {
      assert.equal(p.includes(gone), false, `${kind} still says: ${gone}`);
    }
  }
});
