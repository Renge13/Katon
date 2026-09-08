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

/**
 * Every SELECTOR LIST in globals.css that enumerates input types, and the types
 * each one names.
 *
 * ── THE FIRST VERSION READ ONLY THE FIRST LIST, AND MISSED TWO ──
 * It found the "Form controls" rule and stopped, so adding `email` there turned
 * it green while the narrow-mobile trim, the :hover rule and the :focus rule
 * still did not mention email - the field was styled at desktop width and lost
 * its padding, its hover border and its focus ring below 400px. Caught by
 * reading the computed styles in a browser, not by this test.
 *
 * **That is the same defect one level up: a check that enumerates ONE of its
 * subjects is blind to the rest of them.** So this returns every list, and the
 * assertion below holds them to the same coverage.
 */
function typeLists() {
  const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
  const lists = [];
  // A rule's selector runs from the previous BRACE - either `}` closing the last
  // rule or `{` opening an @media block - to its own `{`.
  //
  // **THE FIRST VERSION ACCEPTED ONLY `}` AND SO COULD NOT SEE INSIDE @media**,
  // which is precisely where the missing narrow-mobile entry was. It found four
  // lists, satisfied its own `>= 4` guard, and stayed green with the defect live.
  // Found by deleting that entry on purpose and watching nothing go red.
  for (const m of css.matchAll(/(^|[{}])([^{}]*?input\[type="[a-z]+"\][^{}]*?)\{/gu)) {
    const selector = m[2];
    const types = [...selector.matchAll(/input\[type="([a-z]+)"\]/gu)].map((x) => x[1]);
    // Pseudo-element rules (::-webkit-*) are date/time internals, not field
    // styling, and must NOT grow an email entry - there is no such pseudo.
    if (/::-webkit/u.test(selector)) continue;
    lists.push({ selector: selector.trim().split('\n').join(' ').slice(0, 60), types: new Set(types) });
  }
  return lists;
}

/** The types the MAIN form-control rule selects - the one that gives a field its box. */
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

test('EVERY TYPE LIST AGREES, so a field is not styled at one width and bare at another', () => {
  // `date` and `time` legitimately appear alone in their own rules (min-height,
  // cursor). What must not happen is a TEXT-LIKE type appearing in some lists and
  // not others: that is how the email field kept its box at desktop and lost its
  // padding, hover border and focus ring below 400px.
  const TEXT_LIKE = ['text', 'email', 'tel', 'number'];
  const lists = typeLists();
  // FIVE, and the count is EXACT rather than a floor: a floor is exactly what let
  // the missing @media list pass unnoticed.
  assert.equal(lists.length, 5,
    `found ${lists.length} type lists; expected the field rule, the date/time rule, `
    + 'the narrow-mobile trim, :hover and :focus');

  const gaps = [];
  for (const { selector, types } of lists) {
    // A rule that names ONLY date/time is a date/time rule, not a field list.
    const textLikeHere = TEXT_LIKE.filter((t) => types.has(t));
    if (textLikeHere.length === 0) continue;
    for (const t of TEXT_LIKE) {
      // `number` has no :hover rule today and that predates this test; only
      // `email` is asserted across the board, because it is the one that shipped
      // broken and the one this file exists for.
      if (t !== 'email') continue;
      if (!types.has(t)) gaps.push(`input[type="${t}"] missing from: ${selector}`);
    }
  }
  assert.deepEqual(gaps, [], `a text-like input is styled inconsistently:\n  ${gaps.join('\n  ')}`);
});
