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
import { buildMirrorPrompt, BASE, OUT } from '../scripts/build-mirror-prompt-v2.mjs';

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
//   AV §1 (Cowork's technical ruling, 2026-09-30, on Reyner's blind read of round 6:
//   "We want a definitive story, not a trailer for a sequel"): the close no longer asks
//   her to want more. SUPERSEDES B31's kept open ending. Shared by mirror and pair.
const CLOSE_AV = 'End on a settled, confident observation about who she is.\nThe reading is complete: never hint at more to explore, deeper layers, or what is still waiting.\nDo not open it with "Mungkin menarik untuk...". Advice is optional, never\nrequired.';
//   AZ §2 (Reyner, 2026-10-01, verbatim: "We don't ban specifics for the writer, just
//   give overall direction"): the direction that replaces the lifted word bans, as its
//   own paragraph after the close. Shared by mirror and pair.
const AZ_DIRECTION = 'Write warm, encouraging and empathetic, as one person writing to another, in plain spoken Indonesian: not an essay, a report or a translation. Stay with the facts in the JSON. You are reading this chart, not acting as an oracle: no fate, no fixed future, no dates.';
//   BA §2 (Reyner, 2026-10-01: "Remove the exact phrase rule", amended "just summarize
//   all the threads beautifully at the end to a cohesive epilogue"): the close becomes
//   the epilogue line and the "Mungkin menarik untuk..." phrase rule goes. Shared.
const CLOSE_BA = "End with a short epilogue that gathers the reading's threads into one cohesive closing reflection: not a recap list, not a teaser that invites her to keep reading, and not a new piece of advice.\nThe reading is complete: never hint at more to explore, deeper layers, or what is still waiting.\nAdvice is optional, never\nrequired.";
const BA_EPILOGUE_TAIL = 'and no advice, including advice the body already gave. The epilogue describes; it does not tell her what to do, not even softly.';
const MIRROR_EDITS = [
  ['makes her want to look further, for instance at the people closest to her. Advice', 'makes her want to look further. Advice'],
  ['You may end a thought on an open observation that\nmakes her want to look further. Advice is optional, never\nrequired.', CLOSE_NEW],
  [CLOSE_NEW, CLOSE_AV],
  [CLOSE_AV, `${CLOSE_AV}\n\n${AZ_DIRECTION}`],
  [CLOSE_AV, CLOSE_BA],
  // BA §4's one adjustment (Reyner, 2026-10-01, verbatim), after the smoke stopped on
  // advice-shaped closes: the epilogue line itself, not the AX line, is replaced.
  ['and not a new piece of advice.', BA_EPILOGUE_TAIL],
  // G1's title fix (Reyner, 2026-10-02, verbatim, in #194): one line in the shared base, after
  // the writer translated the English title back ("The Morning Dew Pagi") in the BB smoke.
  ['each block draws on. Headings are short and plain. Paragraph breaks are two newlines.\n',
    'each block draws on. Headings are short and plain. Paragraph breaks are two newlines.\n'
    + 'Write the archetype exactly as its English title: never translated, never paired with an Indonesian word, never in brackets.\n'],
];
const COMPAT_EDITS = [
  ['The penutup leaves something worth exploring between them. It does not sum the pair up and does not\nassign homework', 'The penutup does not sum the pair up and does not\nassign homework'],
  // BA §2 (Reyner, 2026-10-01, on the stop): "delete the pair's penutup line. The shared
  // epilogue line governs the pair too; the verdict guard stays in the pair must-nots."
  ['The penutup does not sum the pair up and does not\nassign homework; a suggestion is allowed, never required.\n\n', ''],
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

// ── THE ROUND-6 SWITCH (Prompt AV §2 item 1): THE MIRROR'S PROMPT IS DERIVED ──
// The v2 mirror sends AE §1 (as edited above) PLUS AT §2's round-6 changes, built by
// scripts/build-mirror-prompt-v2.mjs into renderer-prompt-v2-mirror.txt. The pair keeps
// AE §1 unchanged at its head: it was not tested in round 6.
test('THE v2 MIRROR PROMPT IS AE §1 WITH THE ROUND-6 EDITS, THEN THE MIRROR EXAMPLES', () => {
  assert.equal(loadPrompt('mirror', 'v2'), `${buildMirrorPrompt(AE_MIRROR)}\n${MIRROR_EXAMPLES.trimEnd()}\n`);
});

test('THE BUILT MIRROR PROMPT IS CURRENT: the committed file is what the builder makes from the base', () => {
  assert.equal(read(OUT), buildMirrorPrompt(read(BASE)));
});

test('THE BUILT MIRROR PROMPT IS TRACED INTO THE LAMBDA: every v2 prompt file is in outputFileTracingIncludes', () => {
  // Read at module load with readFileSync, which no bundler follows: untraced, every
  // render route throws ENOENT in production while dev works (next.config.mjs).
  const config = read('next.config.mjs');
  for (const f of [BASE, OUT, 'docs/content/compat-renderer-prompt-v2.txt', 'docs/content/voice-examples-v2.txt']) {
    assert.ok(config.includes(`'./${f}'`), `next.config.mjs does not trace ${f}`);
  }
});

test('ROUND 6 ON THE MIRROR ONLY: the pair prompt carries none of the round-6 edits', () => {
  const pair = loadPrompt('pair', 'v2');
  for (const s of ['Mention a badge only where it belongs in the story', 'A full reading is roughly 400-550 words', 'a relationship between\npillars gets no bracket']) {
    assert.ok(loadPrompt('mirror', 'v2').includes(s), `mirror lacks: ${s}`);
    assert.equal(pair.includes(s), false, `pair carries: ${s}`);
  }
});

test('THE v2 PAIR PROMPT IS AE §1, THEN §2, THEN BOTH EXAMPLE SECTIONS, and nothing else', () => {
  assert.equal(loadPrompt('pair', 'v2'), `${AE_MIRROR}\n${AE_COMPAT}\n${EXAMPLES}`);
});

test('THE EXAMPLES LOAD ON v2 ONLY: no v1 prompt carries the preamble or any example', () => {
  const preamble = 'The examples that follow come from other people\'s charts.';
  // "Samudra" became its English title in the examples (G1, Reyner 2026-10-02).
  const exampleLine = 'Sebagai The Ocean, elemen Air di dalam dirimu';
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

// ── B31 (Reyner, 2026-09-28): REMOVE THE EXAMPLE PHRASE. Its kept open ending is
// SUPERSEDED by AV §1 (2026-09-30), tested below. ──
// Round 4 ended a thought with "Mungkin menarik untuk melihat/memperhatikan ..." in
// 7 of 7 readings, most of them pointing at the people closest to her: the prompt's
// own example, followed. The permission stays; the example goes
// (docs/content/voice-constraint-rulings-2026-09-26.md B31).
test('B31: the v2 prompts carry no example phrase for the close', () => {
  for (const kind of ['mirror', 'pair']) {
    const p = loadPrompt(kind, 'v2').replace(/\s+/gu, ' ');
    assert.equal(p.includes('for instance at the people closest to her'), false, `${kind} still has the example`);
  }
});

test('AV §1, as amended by BA §2: both v2 prompts no longer ask her to want more', () => {
  // AV §1's "End on a settled, confident observation" and the "Mungkin menarik" clause
  // are replaced by BA §2's epilogue line (tested below); the anti-teaser line stays.
  for (const kind of ['mirror', 'pair']) {
    const p = loadPrompt(kind, 'v2').replace(/\s+/gu, ' ');
    assert.ok(p.includes('The reading is complete: never hint at more to explore, deeper layers, or what is still waiting.'), `${kind} lacks the AV §1 line`);
    assert.equal(p.includes('leaves her wanting to look further'), false, `${kind} still asks for the tease`);
  }
});

test('AZ §2: both v2 prompts carry Reyner\'s direction verbatim, in place of the lifted word bans', () => {
  // Reyner, 2026-10-01: "We don't ban specifics for the writer, just give overall direction."
  // In the SHARED base, so the mirror and the pair both carry it.
  for (const kind of ['mirror', 'pair']) {
    const p = loadPrompt(kind, 'v2').replace(/\s+/gu, ' ');
    assert.ok(p.includes(AZ_DIRECTION), `${kind} lacks the AZ direction`);
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
    // ONE close instruction since BA §2: the epilogue line (its own test, below).
    assert.ok(p.includes("End with a short epilogue that gathers the reading's threads"), `${kind} lacks the close instruction`);
    for (const gone of ['You may end a thought on an open observation', 'The penutup leaves something worth exploring between them']) {
      assert.equal(p.includes(gone), false, `${kind} still says: ${gone}`);
    }
  }
});

// ── BA §2 (Reyner, 2026-10-01): THE CLOSE IS AN EPILOGUE; THE EXACT-PHRASE RULE GOES ──
// Reyner: "Remove the exact phrase rule." Amended the same day: "no concrete suggestion
// then, just summarize all the threads beautifully at the end to a cohesive epilogue."
// Cowork's line from that, keyed, in the SHARED base so both prompts carry it once. On
// the stop BA §2 named, the pair's own close line ("a suggestion is allowed") is
// deleted: Reyner, "The shared epilogue line governs the pair too; the verdict guard
// stays in the pair must-nots as it is." Then BA §4's one adjustment, Reyner verbatim,
// after the smoke's advice-shaped closes: the line's tail is his.
const BA_EPILOGUE = "End with a short epilogue that gathers the reading's threads into one cohesive closing reflection: not a recap list, not a teaser that invites her to keep reading, and no advice, including advice the body already gave. The epilogue describes; it does not tell her what to do, not even softly.";
test('BA §2: both v2 prompts close on the epilogue line, with no phrase rule and no competing close', () => {
  for (const kind of ['mirror', 'pair']) {
    const full = loadPrompt(kind, 'v2');
    const instr = full.slice(0, full.indexOf('=== MIRROR EXAMPLES ===')).replace(/\s+/gu, ' ');
    assert.equal(instr.split(BA_EPILOGUE).length - 1, 1, `${kind}: the epilogue line, verbatim, exactly once`);
    for (const gone of ['Mungkin menarik', 'End on a settled', 'a suggestion is allowed', 'The penutup does not sum the pair up']) {
      assert.equal(instr.includes(gone), false, `${kind} still says: ${gone}`);
    }
    // Kept: the anti-teaser line, and the pair's verdict guard.
    assert.ok(instr.includes('The reading is complete: never hint at more to explore, deeper layers, or what is still waiting.'));
  }
  assert.ok(loadPrompt('pair', 'v2').replace(/\s+/gu, ' ').includes('no score and no overall verdict (never "cocok" or "tidak cocok" as a conclusion)'));
  // Kept unchanged (BA §2.3): the imperative line, a behavioural rule with examples.
  assert.ok(loadPrompt('mirror', 'v2').replace(/\s+/gu, ' ').includes("Advice is a plain, optional suggestion, never an imperative or reminder such as 'ingatlah', 'jangan lupa', or 'kamu harus'."));
});

// ── AX §1 (Reyner, 2026-09-30, verbatim): badges, imperatives, not restating the page ──
// The mirror prompt only (the pair was not in round 6). Whitespace-folded because the
// builder wraps lines; the words are Reyner's exactly.
test('AX §1: the v2 mirror prompt carries Reyner\'s three lines verbatim, and the pair none of them', () => {
  const fold = (t) => t.replace(/\s+/gu, ' ');
  const mirror = fold(loadPrompt('mirror', 'v2'));
  const pair = fold(loadPrompt('pair', 'v2'));
  const LINES = [
    'Mention a badge only where it belongs in the story; the page shows every badge on its own card.',
    "Advice is a plain, optional suggestion, never an imperative or reminder such as 'ingatlah', 'jangan lupa', or 'kamu harus'.",
    'Do not restate information already made explicit by the page unless it adds interpretation or context.',
    // "her four pillars" -> "her pillars", and the actionable line added after the
    // imperative line: Reyner, 2026-09-30, the one adjustment after smoke-2.
    'The page already shows her pillars and Pilar Konsepsi, her element bars, and every badge with its one-line meaning.',
    "When you draw on an `actionable`, rewrite it as a possibility in your own words, for example 'Yang bisa membantu adalah …' or 'Kamu bisa …', never in its command form.",
  ];
  assert.equal(mirror.includes('her four pillars'), false, 'the superseded wording is gone');
  for (const l of LINES) {
    assert.ok(mirror.includes(l), `mirror lacks: ${l}`);
    assert.equal(pair.includes(l), false, `pair carries: ${l}`);
  }
  assert.equal(mirror.includes('Every `bintang` fact appears, by name'), false, 'the round-6 badge requirement is gone');
  // The keyed referent (AX §1.3): "optional" is how advice is phrased; a cost still ends with what helps.
  assert.ok(mirror.includes('When you write about a cost, end that part with what helps.'));
});

test('AX §1.2: no example gives a relation an English bracket', () => {
  const ex = loadPrompt('pair', 'v2'); // the pair prompt carries BOTH example sections
  assert.equal(/(Ikatan|Gabungan Penuh|Setengah Gabungan|Benturan|Gesekan|Simpul)\s*\(/u.test(ex), false);
});

test('G1: the v2 mirror prompt names no Arketipe in its bracket rule (Reyner, 2026-10-02)', () => {
  // The archetype is written as its English title, never in brackets (the shared base's
  // line). The mirror's built Form line used to say "An Arketipe, Aspek or Bintang name is
  // written as its Indonesian name with label_bracket in brackets once", which contradicted it.
  const mirror = loadPrompt('mirror', 'v2');
  assert.equal(mirror.includes('Arketipe, Aspek'), false, 'the bracket rule still names the archetype');
  assert.ok(mirror.includes('An Aspek or Bintang name is written as its Indonesian name'));
  assert.ok(mirror.includes('Write the archetype exactly as its English title: never translated, never paired with an Indonesian word, never in brackets.'));
});
