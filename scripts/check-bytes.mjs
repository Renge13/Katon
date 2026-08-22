#!/usr/bin/env node
// ============================================================
// scripts/check-bytes.mjs — no stray control bytes in tracked source
// ============================================================
// WHY THIS EXISTS, and it is a near-miss rather than a hypothetical. On
// 2026-08-22 an edit to lib/render/prompt.js wrote the separator string
// `' directive '` with NUL bytes where the two spaces belonged. It did not fail
// to parse, it did not fail lint, and it did not fail the type check. `file`
// called the module "data" instead of JavaScript, and the only visible symptom
// was a hash that disagreed with the same expression typed out in a test - which
// is how it was caught, by luck, because that test happened to exist.
//
// The consequence had it shipped: `PROMPT_VERSION` is derived from that literal
// and stamped onto every cached reading, so every row would have carried a
// version computed from a corrupt string. Not wrong output - an attribution label
// built on a byte nobody could see.
//
// So: a byte-level check, because every other gate in this repo reads text.
//
// ── EVERY CONTROL CHARACTER HERE IS AN ESCAPE SEQUENCE ─────
// Written that way on purpose. A literal control byte in this file would be the
// exact thing it exists to reject, and the file has to pass its own check.
// ============================================================

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

// Text files only. A NUL inside a font or an image is what a font or an image IS.
const TEXT = /\.(m?[jt]sx?|json|md|txt|css|ya?ml|sql|sh)$/;

// TAB (0x09), LF (0x0a) and CR (0x0d) are legitimate. Everything else below 0x20,
// plus DEL (0x7f), is not something anyone types on purpose into source.
const ALLOWED = new Set([0x09, 0x0a, 0x0d]);
const isBad = (b) => (b < 0x20 && !ALLOWED.has(b)) || b === 0x7f;

/**
 * Renders a snippet with any control byte shown as `<0x..>`.
 *
 * `no-control-regex` is disabled for exactly this line and nowhere else. The rule
 * is right in general and wrong here: matching control characters is what this
 * file does, and the alternative is a hex editor.
 */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = new RegExp('[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]', 'g');
const readable = (text) => text
  .replace(/\n/g, '\\n')
  .replace(/\t/g, '\\t')
  .replace(CONTROL_CHARS, (c) => `<0x${c.charCodeAt(0).toString(16).padStart(2, '0')}>`);

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && TEXT.test(f));

const issues = [];
for (const file of files) {
  let buf;
  try {
    if (!statSync(file).isFile()) continue;
    buf = readFileSync(file);
  } catch {
    continue; // in the index but not in the working tree
  }
  for (let i = 0; i < buf.length; i++) {
    if (!isBad(buf[i])) continue;
    // Report the line and a readable window, so the fix is obvious without a hex
    // editor - which is the whole problem with this class of defect.
    const line = buf.subarray(0, i).toString('utf8').split('\n').length;
    issues.push({
      file,
      line,
      byte: buf[i],
      window: readable(buf.subarray(Math.max(0, i - 30), i + 30).toString('utf8')),
    });
    break; // one report per file is enough to send someone to it
  }
}

if (issues.length > 0) {
  console.error(`x Stray control bytes in ${issues.length} tracked file(s):\n`);
  for (const x of issues) {
    console.error(`  ${x.file}:${x.line} - 0x${x.byte.toString(16).padStart(2, '0')}`);
    console.error(`    ...${x.window}...\n`);
  }
  console.error('Only TAB, LF and CR are allowed. Replace the byte with whatever it was');
  console.error('meant to be - usually a space - rather than deleting it.');
  process.exit(1);
}

console.log(`OK No stray control bytes. Scanned ${files.length} tracked text file(s).`);
