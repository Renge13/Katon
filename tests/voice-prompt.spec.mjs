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
const AE_MIRROR = fenceAfter('## 1. Replace `docs/content/renderer-prompt-v2.txt`');
const AE_COMPAT = fenceAfter('## 2. Replace `docs/content/compat-renderer-prompt-v2.txt`');

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
