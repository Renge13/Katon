// ============================================================
// Apply a ruled-content tranche to glossary.json
// ============================================================
// The content pass (PROGRESS "MIRROR QA VERDICT 2026-08-10", fix plan step 2)
// lands in tranches. Each tranche is a rulings file Reyner has ruled on, and the
// strings must reach the glossary BYTE-IDENTICALLY - they are his register, and
// a transcription slip in a file nobody reads word-for-word again is invisible.
//
//   node scripts/apply-rulings.mjs docs/content/tranche2-rulings.md --expect 19
//   node scripts/apply-rulings.mjs docs/content/tranche2-rulings.md --expect 19 --dry
//
// ── WHY --expect IS MANDATORY, AND WHY IDENTITY IS NOT ENOUGH ──
// Tranche 1 was applied by an ad-hoc script whose value regex was
// /"([\s\S]*)"/m - greedy, and multiline. It matched from the first quote on the
// PENDING line to the LAST quote in the whole file, so one field silently
// swallowed the remaining ~2KB of the rulings document.
//
// The byte-identity assert did not catch it, and could not have: it checked that
// each applied string appears quoted in the rulings file, and the swallowed text
// genuinely did. Identity answers "did this text come from the file". It says
// nothing about EXTENT - whether the match stopped where it should have. The
// sweep caught it by accident, because the swallowed text contained a banned
// token.
//
// So this script asserts extent directly, three ways, and every one of them
// fails loudly rather than warning:
//
//   1. COUNT. The caller states how many fields the tranche changes. A parser
//      that grabs too much usually grabs too FEW fields as well - the greedy
//      match consumed 14 later assignments along with the text.
//   2. LINE EXTENT. A value must end exactly where its own line ends. This is
//      the direct test for the actual bug, and it does not care what the value
//      contains.
//   3. SHAPE. No newline in a value, and a length ceiling. A glossary seed is a
//      few sentences; anything an order of magnitude past that is a runaway
//      match, not prose.
// ============================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** A ruled string is a few sentences. Tranche 1's longest was 278. */
const MAX_VALUE_CHARS = 600;

/** Where a new field is inserted, by field name. Keeps the JSON readable. */
const INSERT_AFTER = { domain_id: 'label_meaning' };
const DEFAULT_INSERT_AFTER = 'cost_seed';

/**
 * Parse a rulings file into assignments.
 *
 * Every pattern here is LINE-ANCHORED and non-multiline by construction: the
 * file is split into lines first, so no regex can reach past the line it is
 * matching. That is a property of the loop, not of the patterns, which is why it
 * cannot be undone by editing a pattern later.
 *
 * @param {string} md
 * @returns {{assignments: Array, problems: string[]}}
 */
export function parseRulings(md) {
  const assignments = [];
  const problems = [];
  let heading = null;

  md.split(/\r?\n/).forEach((line, index) => {
    const lineNo = index + 1;
    if (line.startsWith('## ')) { heading = line.slice(3).trim(); return; }
    if (!heading) return;

    // The pilar block is matched FIRST. Its lines read "- year (Pilar Akar): ..."
    // and the generic field pattern below matches those too, yielding a field
    // named "year" against a heading that is not a dotted path.
    const isPilar = heading.startsWith('pilar');
    const match = isPilar
      ? /^-\s+(year|month|day|hour)\s+\([^)]*\):\s+"(.*)"\s*$/.exec(line)
      : /^-\s+([a-z_]+)\s*(?:\([^)]*\))?:\s+"(.*)"\s*$/.exec(line);

    if (!match) {
      // A NEAR MISS IS LOUD, NOT SKIPPED. The patterns require the line to end
      // at the closing quote, so a line with a trailing fragment - or a stray
      // quote inside the value - simply does not match. Silently skipping it
      // would drop a ruled string, which is the failure mode this whole script
      // exists to prevent. "- NO CHANGE." lines carry no quote and are ignored.
      if (/^-\s+\S/.test(line) && line.includes('"')) {
        problems.push(`line ${lineNo}: looks like an assignment but does not parse `
          + '(value must end at the final quote on its line)');
      }
      return;
    }

    const value = match[2];

    // GUARD 2 - LINE EXTENT. The value must run to the final quote ON THIS LINE.
    // The tranche-1 bug is exactly this assertion failing.
    if (line.trimEnd().lastIndexOf('"') !== line.trimEnd().length - 1
        || line.trimEnd().indexOf('"') + 1 + value.length !== line.trimEnd().length - 1) {
      problems.push(`line ${lineNo}: value does not span exactly to end of line `
        + `(matched ${value.length} chars)`);
      return;
    }
    // GUARD 3 - SHAPE.
    if (/[\r\n]/.test(value)) { problems.push(`line ${lineNo}: value contains a newline`); return; }
    if (value.length > MAX_VALUE_CHARS) {
      problems.push(`line ${lineNo}: value is ${value.length} chars, ceiling is `
        + `${MAX_VALUE_CHARS} - a runaway match, not prose`);
      return;
    }
    if (value.length === 0) { problems.push(`line ${lineNo}: empty value`); return; }

    assignments.push(isPilar
      ? { block: 'pilar', key: match[1], field: 'domain_id', value, line: lineNo }
      : { block: heading, field: match[1], value, line: lineNo });
  });

  return { assignments, problems };
}

/** Insert or replace a field, keeping every other key where it was. */
function setField(node, field, value) {
  if (field in node) { node[field] = value; return; }
  const after = INSERT_AFTER[field] ?? DEFAULT_INSERT_AFTER;
  const rebuilt = {};
  for (const [k, v] of Object.entries(node)) {
    rebuilt[k] = v;
    if (k === after) rebuilt[field] = value;
  }
  if (!(field in rebuilt)) rebuilt[field] = value;
  for (const k of Object.keys(node)) delete node[k];
  Object.assign(node, rebuilt);
}

/** Parse, verify and apply one tranche. Every failure exits non-zero; none warn. */
function run({ rulingsPath, expected, glossaryPath, dry }) {
  const md = readFileSync(rulingsPath, 'utf8');
  const { assignments, problems } = parseRulings(md);

  if (problems.length) {
    console.error(`REFUSING: ${problems.length} malformed assignment(s)`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }

  // GUARD 1 - COUNT.
  if (assignments.length !== expected) {
    console.error(`REFUSING: parsed ${assignments.length} assignments, --expect said ${expected}.`);
    console.error('  Either the rulings file changed or the parser is wrong. Both need a human.');
    for (const a of assignments) {
      console.error(`  line ${String(a.line).padStart(3)}  ${a.block}${a.key ? `.${a.key}` : ''}`
        + `  ${a.field}  ${a.value.length} chars`);
    }
    process.exit(1);
  }

  const glossary = JSON.parse(readFileSync(glossaryPath, 'utf8'));

  for (const a of assignments) {
    const [section, key] = a.block.split('.');
    const node = a.field === 'domain_id' ? glossary.pilar?.[a.key] : glossary[section]?.[key];
    if (!node) {
      console.error(`REFUSING: no glossary node for ${a.block}${a.key ? `.${a.key}` : ''} `
        + `(line ${a.line})`);
      process.exit(1);
    }
    setField(node, a.field, a.value);
  }

  // IDENTITY, kept as well. It is weaker than the guards above but it is the one
  // that answers "is this Reyner's string, character for character".
  const notVerbatim = assignments.filter((a) => !md.includes(`"${a.value}"`));
  if (notVerbatim.length) {
    console.error(`REFUSING: ${notVerbatim.length} applied string(s) not verbatim in the rulings`);
    process.exit(1);
  }

  // The file is 1-space indented with no trailing newline. Matching it exactly
  // keeps the diff to the fields that actually changed.
  if (dry) {
    console.log(`--dry: ${assignments.length} assignments parsed and verified, nothing written.`);
  } else {
    writeFileSync(glossaryPath, JSON.stringify(glossary, null, 1));
    console.log(`applied ${assignments.length} assignments to ${glossaryPath}`);
  }
  for (const a of assignments) {
    console.log(`  ${`${a.block}${a.key ? `.${a.key}` : ''}`.padEnd(24)} `
      + `${a.field.padEnd(16)} ${String(a.value.length).padStart(4)} chars  (line ${a.line})`);
  }
}

// ── CLI ───────────────────────────────────────────────────
// Gated behind a main check so the parser can be imported by tests. A module
// that runs argv on import cannot be tested, and the guards are the whole point.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const rulingsPath = argv[0];
  const flag = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? null : argv[i + 1];
  };
  const expected = Number(flag('expect'));

  if (!rulingsPath || !Number.isInteger(expected) || expected <= 0) {
    console.error('usage: node scripts/apply-rulings.mjs <rulings.md> --expect <N> [--dry]'
      + ' [--glossary <path>]');
    console.error('\n--expect is REQUIRED. It is the count guard; see this file\'s header.');
    process.exit(2);
  }

  run({
    rulingsPath,
    expected,
    glossaryPath: flag('glossary') ?? 'docs/content/glossary.json',
    dry: argv.includes('--dry'),
  });
}
