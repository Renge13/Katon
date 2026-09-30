#!/usr/bin/env node
// ============================================================
// scripts/build-mirror-prompt-v2.mjs — the v2 MIRROR prompt, derived (Prompt AV §2)
// ============================================================
//   node scripts/build-mirror-prompt-v2.mjs            writes docs/content/renderer-prompt-v2-mirror.txt
//   node scripts/build-mirror-prompt-v2.mjs --check    exits 1 if the file is stale
//
// THE ROUND-6 PROMPT, IN PRODUCTION FOR THE MIRROR ONLY. Reyner's blind read of round 6
// (2026-09-30) picked it on every chart that had a winner; AV §2 switches it in.
//
// WHY IT IS DERIVED AND NOT EDITED IN PLACE. docs/content/renderer-prompt-v2.txt is
// also the head of the v2 PAIR prompt (lib/render/prompt.js MASTER_PROMPTS_V2.pair),
// and the pair writer was not tested in round 6, so it stays on that file. The
// mirror's prompt is that file plus AT §2's changes, applied here by exact, counted
// replacements: each must match once or the build refuses. A hand copy would be a
// second prompt that drifts from the first; this way an edit to the shared file
// reaches both, and a test (tests/voice-prompt.spec.mjs) fails if the built file is
// stale. This is scripts/build-round6-prompt.mjs from exp/voice-round6 (81e0855),
// with item 5's "Mungkin menarik" line following AV §1's rewrite of the closing line.
// ============================================================

import fs from 'node:fs';

export const BASE = 'docs/content/renderer-prompt-v2.txt';
export const OUT = 'docs/content/renderer-prompt-v2-mirror.txt';

// [AT §2 item, before, after]. `after` is exactly the ruled text; where the ruling
// says "Add", `before` is the line it is added after, kept verbatim.
export const EDITS = [
  ['1 no mechanism (delete)',
    'Interpret freely means: explain why a fact matters to her and, where it helps, why the engine says it,\nusing only the reasons in `provenance`. Connect facts that belong together.',
    'Interpret freely means: explain why a fact matters to her. Never explain how the chart works: how elements\nfeed, control or combine, how a star is derived, or why the engine concluded something. She reads for what it\nmeans in her life. Connect facts that belong together.'],
  ['5 what helps',
    'Advice is optional, never\nrequired.',
    // + AX §1.3, Reyner 2026-09-30, verbatim. "optional" is how the advice is phrased
    // to her; the writer still ends a cost with what helps.
    // + Reyner 2026-09-30, verbatim, added after the imperative line: smoke-2 found
    // four imperatives, and both `cobalah` sentences paraphrased a command-form
    // `actionable` seed (docs/qa/2026-09-30-round6-switch-smoke.md).
    'When you write about a cost, end that part with what helps. Advice is a plain, optional suggestion, never an\nimperative or reminder such as \'ingatlah\', \'jangan lupa\', or \'kamu harus\'.\n'
    + 'When you draw on an `actionable`, rewrite it as a possibility in your own words, for example \'Yang bisa\nmembantu adalah …\' or \'Kamu bisa …\', never in its command form.'],
  ['5 never point to what is left out (add)',
    'Do not open it with "Mungkin menarik untuk...".',
    'Do not open it with "Mungkin menarik untuk...". Never point to facts the reading leaves out or \'has not\nexplored yet\'.'],
  ['5 no questions',
    '- no coaching or reflection questions aimed at her ("Bagian mana dari dirimu ...").',
    '- no questions addressed to her at all, rhetorical or reflective, anywhere in the reading.'],
  ['2 depth first, 3 badges, 4 relations folded, 6 length',
    'After those, choose the facts that make the strongest reading. `required_points` shows what the engine\nranks highest; beyond the first three it is guidance, not a checklist.',
    'Then choose the facts that matter most for her, three or four in all including the first three, and give each\nroom. Tell each as a short story: how it shows up in her days, with one concrete scene; what it costs her; and,\nwhen there is a cost, what helps, from its `actionable`, in your own words. `required_points` shows what the\nengine ranks highest.\n\n'
    // AX §1.1 and §1.4, Reyner 2026-09-30, verbatim, replacing round 6's "Every
    // `bintang` fact appears, by name, ..."; then AX's one factual sentence, with
    // "her four pillars" -> "her pillars" (Reyner, 2026-09-30).
    + 'Mention a badge only where it belongs in the story; the page shows every badge on its own card.\n'
    + 'Do not restate information already made explicit by the page unless it adds interpretation or context.\n'
    + 'The page already shows her pillars and Pilar Konsepsi, her element bars, and every badge with its one-line\nmeaning.\n\n'
    + 'When the chart has more than one relationship between pillars (Benturan, Gesekan, Simpul, Ikatan and the\nlike), do not explain them one by one. Weave them into one story of how that friction or pull feels in her\ndaily life. Name each at most once, in passing. If you give a relationship\'s pillars, give all of them exactly\nas `provenance.positions_id` lists them; you may also leave the pillars out.\n\n'
    + 'A full reading is roughly 400-550 words. Be ruthless: cut a fact before you thin every fact.'],
  ['7 brackets',
    'A named term is written as its Indonesian name with `label_bracket` in\nbrackets once, at first mention (`Bunga Persik (Peach Blossom)`);',
    'An Arketipe, Aspek or Bintang name is written as its Indonesian name with\n`label_bracket` in brackets once, at first mention (`Bunga Persik (Peach Blossom)`); a relationship between\npillars gets no bracket;'],
];

/** The mirror prompt from the shared base. Throws when any edit does not match exactly once. */
export function buildMirrorPrompt(base) {
  let out = base;
  for (const [item, before, after] of EDITS) {
    const n = out.split(before).length - 1;
    if (n !== 1) throw new Error(`AT §2 item ${item}: expected the base text exactly once, found ${n}`);
    out = out.replace(before, after);
  }
  return out;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const base = fs.readFileSync(BASE, 'utf8').replace(/\r\n/g, '\n');
  const next = buildMirrorPrompt(base);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
    if (cur !== next) { console.error(`${OUT} is stale; run node scripts/build-mirror-prompt-v2.mjs`); process.exit(1); }
    console.log(`${OUT} is current`);
  } else {
    fs.writeFileSync(OUT, next);
    const w = (t) => t.split(/\s+/u).filter(Boolean).length;
    console.log(`${OUT}: ${w(base)} -> ${w(next)} words`);
    for (const [item, before, after] of EDITS) console.log(`\n[${item}]\n- ${before.replace(/\n/g, ' ')}\n+ ${after.replace(/\n/g, ' ')}`);
  }
}
