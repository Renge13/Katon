// ============================================================
// scripts/insert-p4-option-e.mjs — the four P4 option E cells into glossary.json
// ============================================================
//   node scripts/insert-p4-option-e.mjs          write
//   node scripts/insert-p4-option-e.mjs --dry    parse and verify, write nothing
//
// ONE-OFF, Prompt BD1 §3. scripts/apply-rulings.mjs replaces fields in EXISTING cells
// and refuses a missing node, which is correct for it; these are four NEW cells, so
// this script creates them. The strings are READ from the rulings file, never typed
// here, and the run refuses unless each one in the written glossary is byte-identical
// to the rulings file. tests/compat-p4-option-e.spec.mjs re-asserts that permanently.
//
// Guards, each fatal: exactly four rows parsed, each with six non-empty columns; none
// of the four keys already in the glossary; `p4_related` present to insert after.
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';

const RULINGS = 'docs/content/compat-p4-option-e-rulings-2026-10-04.md';
const GLOSSARY = 'docs/content/glossary.json';
const FIELDS = ['name_id', 'name_en', 'label_meaning', 'meaning_seed', 'daily_seed'];
const STEP = { p4_a_generates_b: 1, p4_a_controls_b: 2, p4_b_controls_a: 3, p4_b_generates_a: 4 };
const MEANING = {
  1: "A's family generates B's",
  2: "A's family controls B's",
  3: "B's family controls A's",
  4: "B's family generates A's",
};

const die = (msg) => { console.error(`REFUSING: ${msg}`); process.exit(1); };

const md = readFileSync(RULINGS, 'utf8');
const rows = {};
for (const line of md.split(/\r?\n/)) {
  const cols = line.split('|').slice(1, -1).map((c) => c.trim());
  if (cols.length !== 6 || !/^`p4_[a-z_]+`$/.test(cols[0])) continue;
  const key = cols[0].slice(1, -1);
  if (!(key in STEP)) die(`unexpected key ${key}`);
  if (rows[key]) die(`${key} appears twice`);
  if (cols.some((c) => c.length === 0)) die(`${key} has an empty column`);
  rows[key] = Object.fromEntries(FIELDS.map((f, i) => [f, cols[i + 1]]));
}
if (Object.keys(rows).length !== 4) die(`parsed ${Object.keys(rows).length} rows, expected 4`);

const glossary = JSON.parse(readFileSync(GLOSSARY, 'utf8'));
const K = glossary.kompatibilitas;
for (const key of Object.keys(STEP)) if (key in K) die(`${key} already in the glossary`);
if (!('p4_related' in K)) die('p4_related missing, nowhere to insert');

// Rebuilt in place so the cells sit after p4_related, in d order, and every other key
// keeps its position.
const rebuilt = {};
for (const [k, v] of Object.entries(K)) {
  rebuilt[k] = v;
  if (k !== 'p4_related') continue;
  for (const key of Object.keys(STEP)) {
    const d = STEP[key];
    rebuilt[key] = {
      _note: `temperament.pattern === ${key.slice(3)}: different_group, d = ${d} (${MEANING[d]}). `
        + 'A is the reader (kamu), B the partner (ia). Ruled by Reyner 2026-10-04 '
        + '(docs/content/compat-p4-option-e-rulings-2026-10-04.md). Katon\'s framework, never '
        + 'presented as classical, and it ranks nothing (rule 25).',
      ...rows[key],
    };
  }
}
glossary.kompatibilitas = rebuilt;

const out = JSON.stringify(glossary, null, 1); // the file's own format: 1-space, no trailing newline
const back = JSON.parse(out).kompatibilitas;
for (const [key, fields] of Object.entries(rows)) {
  for (const [f, v] of Object.entries(fields)) {
    if (back[key][f] !== v) die(`${key}.${f} is not byte-identical after serialisation`);
    if (!md.includes(` ${v} |`)) die(`${key}.${f} is not verbatim in the rulings file`);
  }
}

if (process.argv.includes('--dry')) {
  console.log('--dry: 4 cells parsed and verified, nothing written.');
} else {
  writeFileSync(GLOSSARY, out);
  console.log(`inserted 4 cells into ${GLOSSARY}`);
}
for (const [key, f] of Object.entries(rows)) {
  console.log(`  ${key.padEnd(18)} d=${STEP[key]}  ${f.name_id} / ${f.name_en}`);
}
