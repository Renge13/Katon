// ============================================================
// tests/app-fonts.spec.mjs — the fonts the app promises are the fonts it loads
// ============================================================
// THE DEFECT THIS EXISTS FOR, carried from 2026-08-13 to 2026-08-15 as spec §9's
// "standing dependency":
//
//   `components/cards/Card.js` sets every size in `var(--font-archivo)`.
//   `app/layout.js` loaded Spectral and Hanken Grotesk and NOT Archivo.
//
// So the first route to render a card would have rendered it in the system sans.
// Silently, and looking almost right, because a font stack always resolves to
// something — `var(--font-archivo), Archivo, system-ui, ...` falls through to
// system-ui and the card is merely a bit wrong. Nobody reports that.
//
// ── WHY THIS READS SOURCE RATHER THAN RENDERING ────────────
// `app/layout.js` is JSX and imports `next/font/google`, which is a build-time
// transform. Plain `node --test` cannot load either — importing it fails on the
// first `<`. The alternative was no test at all, which is what let the gap sit
// for two days. So this parses the two files and asserts they AGREE, which is the
// actual failure mode: one side renaming or dropping a variable the other uses.
//
// The runtime half — that the variable resolves to a non-empty value in a real
// browser — is checked against the dev server, not here.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const layout = fs.readFileSync(path.join(ROOT, 'app/layout.js'), 'utf8');
const card = fs.readFileSync(path.join(ROOT, 'components/cards/Card.js'), 'utf8');

/** Every `--font-*` custom property a source file READS through `var()`. */
function fontVarsUsed(src) {
  return [...new Set([...src.matchAll(/var\((--font-[a-z0-9-]+)\)/g)].map((m) => m[1]))];
}

/** Every `--font-*` custom property the layout DECLARES to next/font. */
function fontVarsDeclared(src) {
  return [...new Set([...src.matchAll(/variable:\s*'(--font-[a-z0-9-]+)'/g)].map((m) => m[1]))];
}

test('THE CARD FONT IS LOADED BY THE APP, not just referenced by the card', () => {
  // The card names it...
  const used = fontVarsUsed(card);
  assert.ok(used.includes('--font-archivo'),
    `the card reads ${JSON.stringify(used)} - if it stopped using --font-archivo, this test and the layout both need re-reading`);

  // ...the layout declares it...
  const declared = fontVarsDeclared(layout);
  assert.ok(declared.includes('--font-archivo'),
    `app/layout.js declares ${JSON.stringify(declared)} and the card needs --font-archivo. `
    + 'Without it the card renders in the system sans and nothing else catches it.');

  // ...from next/font, so it is self-hosted and costs no runtime network call...
  assert.match(layout, /import \{[^}]*\bArchivo\b[^}]*\} from 'next\/font\/google'/,
    'Archivo must come through next/font/google like the other two');

  // ...and the variable actually reaches the document, which is the step that
  // makes it resolvable. Declaring the font and forgetting the className is the
  // same bug one layer down.
  const htmlTag = layout.slice(layout.indexOf('<html'), layout.indexOf('>', layout.indexOf('<html')));
  assert.match(htmlTag, /archivo\.variable/,
    'the Archivo class must be on the <html> element, or the variable is declared and never applied');
});

test('EVERY font variable the card reads is one the layout declares', () => {
  // Generalised past Archivo on purpose: the specific gap is closed, and the
  // SHAPE of it - a component reading a variable nobody defines - is the thing
  // that recurs. This catches the next one without anyone adding a test.
  const declared = new Set(fontVarsDeclared(layout));
  const missing = fontVarsUsed(card).filter((v) => !declared.has(v));
  assert.deepEqual(missing, [],
    `components/cards/Card.js reads font variables app/layout.js does not declare: ${missing.join(', ')}`);
});

test('the card asks for weights and a style the loaded font actually carries', () => {
  // The card draws 440, 480, 640, 650 and 800, plus italic on the Aspek line. A
  // next/font request that omits italic, or tops out at 700, renders those as the
  // nearest available cut and the type quietly flattens.
  const archivoCall = layout.slice(layout.indexOf('Archivo({'));
  const block = archivoCall.slice(0, archivoCall.indexOf('});') + 3);
  assert.match(block, /style:\s*\[[^\]]*'italic'/, 'the Aspek line is italic');
  assert.match(block, /weight:\s*\[[^\]]*'800'/, 'the headline is 800');
  assert.match(block, /weight:\s*\[[^\]]*'400'/, 'the badge meanings are 400');
  // And the card really does use them, so this stays tied to the card rather
  // than becoming a wish list.
  assert.match(card, /fontStyle:\s*'italic'/);
  assert.match(card, /fontWeight:\s*800/);
});
