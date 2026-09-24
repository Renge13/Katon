// ============================================================
// tests/voice-prompt.spec.mjs — the v2 writer prompts are the spec's, verbatim
// ============================================================
// Run: npm run test:voice-prompt
//
// Voice v2 round 2, step 3. The two v2 prompts are the spec's §2 and §3 blockquotes
// VERBATIM, and the v1 prompts - what production sends - do not move. Read from the
// committed spec file itself, never retyped here.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import {
  loadPrompt, MASTER_PROMPTS, PROMPT_VERSIONS, promptVersionFor,
} from '../lib/render/prompt.js';

const spec = readFileSync(new URL('../docs/content/voice-v2-spec-2026-09-24.md', import.meta.url), 'utf8')
  .replace(/\r\n?/g, '\n');
function quoteOf(heading) {
  const rest = spec.slice(spec.indexOf(heading) + heading.length).split('\n');
  const out = [];
  let inQuote = false;
  for (const line of rest) {
    if (line.startsWith('>')) { inQuote = true; out.push(line.replace(/^> ?/, '')); continue; }
    if (inQuote) break;
  }
  return `${out.join('\n').trim()}\n`;
}

// On main bb4a0b0. The v1 prompts are untouched.
const V1_VERSIONS = { mirror: '22316c3349d0ea46', pair: '6e7b2997b97c40a3' };

test('V1 PROMPTS ARE UNTOUCHED', () => {
  assert.deepEqual(PROMPT_VERSIONS, V1_VERSIONS);
  assert.equal(loadPrompt('mirror'), MASTER_PROMPTS.mirror);
  assert.equal(loadPrompt('pair', 'v1'), MASTER_PROMPTS.pair);
});

test('THE v2 MIRROR PROMPT IS SPEC §2, VERBATIM', () => {
  assert.equal(loadPrompt('mirror', 'v2'), quoteOf('## 2. The writer prompt, mirror'));
});

test('THE v2 PAIR PROMPT IS SPEC §2 THEN §3, VERBATIM, and nothing else', () => {
  assert.equal(loadPrompt('pair', 'v2'),
    `${quoteOf('## 2. The writer prompt, mirror')}\n${quoteOf('## 3. The writer prompt, compat')}`);
});

test('v2 IS SHORTER THAN v1 (spec: "v2 is smaller than v1, not larger")', () => {
  assert.ok(loadPrompt('mirror', 'v2').length < loadPrompt('mirror').length / 4);
});

test('A v2 ROW CARRIES A v2 PROMPT VERSION, distinct from every v1 version', () => {
  for (const kind of ['mirror', 'pair']) {
    const v2 = promptVersionFor(kind, 'v2');
    assert.match(v2, /^v2-/u);
    assert.notEqual(v2, V1_VERSIONS[kind]);
  }
});
