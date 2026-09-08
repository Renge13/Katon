// ============================================================
// tests/form-controls.spec.mjs — every rendered input is a styled input
// ============================================================
// `app/globals.css` styles form controls through a list of `input[type="..."]`
// selectors. On 2026-09-08 the compat page shipped an EMAIL field and the list
// had never heard of `email`, so it rendered as a bare browser input beside
// three styled ones. Reyner found it by walking the preview on a phone.
//
// ── WHY THIS IS A TEST AND NOT A WIDER SELECTOR ────────────
// It is COWORK-BRIEF row 47's shape - a rule that enumerates its subjects by
// name is blind to the next subject - and row 47's fix was to invert so subjects
// register themselves. That inversion is not safe in the cascade here: an
// `input:not([type="checkbox"])...` selector would also capture the Upcoming
// contact field, whose smaller transparent styling is INLINE and whose
// `flex: 1 1 200px` would collide with the list's `width: 100%`. Restyling a
// surface Reyner has already ruled, to fix a different surface, is not a fix.
//
// So the list stays and the DISCOVERY moves here. This scans the source for what
// is actually rendered and fails on a type the stylesheet does not cover - which
// is the half that was missing, since nothing ever asked.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function* sourceFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) { yield* sourceFiles(full); continue; }
    if (/\.(jsx?|tsx?)$/u.test(name)) yield full;
  }
}

/**
 * Every `<input>` in the app, with the type it will actually have.
 *
 * An input with no `type` attribute IS `type="text"` per HTML, so it is recorded
 * as such rather than skipped - otherwise the scan would miss exactly the case
 * where someone leaves the attribute off.
 */
function renderedInputTypes() {
  const found = new Map();
  for (const dir of ['components', 'app']) {
    for (const file of sourceFiles(path.join(ROOT, dir))) {
      const src = readFileSync(file, 'utf8');
      // From each `<input` to the end of its tag. JSX puts attributes on their
      // own lines, so this cannot be a single-line match.
      for (const m of src.matchAll(/<input\b([\s\S]*?)\/?>/gu)) {
        const attrs = m[1];
        const type = /\btype\s*=\s*"([a-z]+)"/u.exec(attrs)?.[1] ?? 'text';
        const rel = path.relative(ROOT, file).replace(/\\/gu, '/');
        if (!found.has(type)) found.set(type, []);
        found.get(type).push(rel);
      }
    }
  }
  return found;
}

/** The types `app/globals.css`'s form-control rule actually selects. */
function styledTypes() {
  const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
  const block = /\/\* ── Form controls[\s\S]*?\{/u.exec(css);
  assert.ok(block, 'the form-control rule was not found in app/globals.css');
  return new Set([...block[0].matchAll(/input\[type="([a-z]+)"\]/gu)].map((m) => m[1]));
}

/** Types that must NOT get the field styling - they are not text boxes. */
const EXEMPT = new Set(['checkbox', 'radio', 'file', 'submit', 'button', 'hidden', 'range', 'color']);

test('EVERY INPUT TYPE THE APP RENDERS IS STYLED, or is exempt by kind', () => {
  const rendered = renderedInputTypes();
  const styled = styledTypes();
  assert.ok(rendered.size > 0, 'precondition: the scanner finds inputs at all');

  const unstyled = [];
  for (const [type, files] of rendered) {
    if (EXEMPT.has(type) || styled.has(type)) continue;
    unstyled.push(`input[type="${type}"] in ${[...new Set(files)].join(', ')}`);
  }
  assert.deepEqual(unstyled, [],
    `unstyled form controls - add the type to app/globals.css's form-control rule:\n  ${unstyled.join('\n  ')}`);
});

test('THE EMAIL FIELD IS THE ONE THAT WAS MISSING, and it is covered now', () => {
  // Named explicitly rather than left to the sweep above, because this is the
  // defect that was found on a real phone and the assertion should say so.
  const rendered = renderedInputTypes();
  assert.ok(rendered.has('email'), 'precondition: the compat page renders an email input');
  assert.ok(styledTypes().has('email'), 'and globals.css styles it');
});

test('THE SCANNER SEES AN UNTYPED INPUT AS text, not as nothing', () => {
  // The failure mode this guards: an input with the attribute left off is
  // `type="text"` per HTML, and a scanner that skipped it would report a clean
  // sweep over the one case most likely to be wrong.
  const rendered = renderedInputTypes();
  assert.ok(rendered.has('text'), 'BirthFields and the contact field have untyped or text inputs');
  assert.ok(styledTypes().has('text'));
});
