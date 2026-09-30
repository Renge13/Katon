#!/usr/bin/env node
// ============================================================
// scripts/build-round6-prompt.mjs — Prompt AT §2: the ROUND-6 prompt, derived
// ============================================================
//   node scripts/build-round6-prompt.mjs            writes docs/content/renderer-prompt-v2-round6.txt
//   node scripts/build-round6-prompt.mjs --check    exits 1 if the file is stale
//
// EXPERIMENT BRANCH ONLY. The round-6 prompt is today's v2 mirror prompt with AT §2's
// changes and nothing else, so it is DERIVED from docs/content/renderer-prompt-v2.txt
// by exact, counted replacements rather than hand-copied: a hand copy is a second
// prompt that drifts from the first. Each edit must match exactly once or the build
// refuses. The report quotes every before/after this prints.
// ============================================================

import fs from 'node:fs';

const BASE = 'docs/content/renderer-prompt-v2.txt';
const OUT = 'docs/content/renderer-prompt-v2-round6.txt';

// [AT §2 item, before, after]. `after` is exactly the ruled text; where the ruling
// says "Add", `before` is the line it is added after, kept verbatim.
export const EDITS = [
  ['1 no mechanism (delete)',
    'Interpret freely means: explain why a fact matters to her and, where it helps, why the engine says it,\nusing only the reasons in `provenance`. Connect facts that belong together.',
    'Interpret freely means: explain why a fact matters to her. Never explain how the chart works: how elements\nfeed, control or combine, how a star is derived, or why the engine concluded something. She reads for what it\nmeans in her life. Connect facts that belong together.'],
  ['5 what helps',
    'Advice is optional, never\nrequired.',
    'When you write about a cost, end that part with what helps.'],
  ['5 never point to what is left out (add)',
    'do not open it with "Mungkin menarik untuk...".',
    'do not open it with "Mungkin menarik untuk...". Never point to facts the reading leaves out or \'has not\nexplored yet\'.'],
  ['5 no questions',
    '- no coaching or reflection questions aimed at her ("Bagian mana dari dirimu ...").',
    '- no questions addressed to her at all, rhetorical or reflective, anywhere in the reading.'],
  ['2 depth first, 3 badges, 4 relations folded, 6 length',
    'After those, choose the facts that make the strongest reading. `required_points` shows what the engine\nranks highest; beyond the first three it is guidance, not a checklist.',
    'Then choose the facts that matter most for her, three or four in all including the first three, and give each\nroom. Tell each as a short story: how it shows up in her days, with one concrete scene; what it costs her; and,\nwhen there is a cost, what helps, from its `actionable`, in your own words. `required_points` shows what the\nengine ranks highest.\n\n'
    + 'Every `bintang` fact appears, by name, in one or two sentences of what it means for her.\n\n'
    + 'When the chart has more than one relationship between pillars (Benturan, Gesekan, Simpul, Ikatan and the\nlike), do not explain them one by one. Weave them into one story of how that friction or pull feels in her\ndaily life. Name each at most once, in passing. If you give a relationship\'s pillars, give all of them exactly\nas `provenance.positions_id` lists them; you may also leave the pillars out.\n\n'
    + 'A full reading is roughly 400-550 words. Be ruthless: cut a fact before you thin every fact.'],
  ['7 brackets',
    'A named term is written as its Indonesian name with `label_bracket` in\nbrackets once, at first mention (`Bunga Persik (Peach Blossom)`);',
    'An Arketipe, Aspek or Bintang name is written as its Indonesian name with\n`label_bracket` in brackets once, at first mention (`Bunga Persik (Peach Blossom)`); a relationship between\npillars gets no bracket;'],
];

export function buildRound6(base) {
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
  const next = buildRound6(base);
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
    if (cur !== next) { console.error(`${OUT} is stale; run node ${process.argv[1]}`); process.exit(1); }
    console.log(`${OUT} is current`);
  } else {
    fs.writeFileSync(OUT, next);
    const w = (t) => t.split(/\s+/u).filter(Boolean).length;
    console.log(`${OUT}: ${w(base)} -> ${w(next)} words`);
    for (const [item, before, after] of EDITS) console.log(`\n[${item}]\n- ${before.replace(/\n/g, ' ')}\n+ ${after.replace(/\n/g, ' ')}`);
  }
}
