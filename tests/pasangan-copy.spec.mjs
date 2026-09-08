// ============================================================
// tests/pasangan-copy.spec.mjs — the applied copy IS the worksheet
// ============================================================
// `docs/content/pasangan-copy-rulings.md` is the authority on 28 strings and NO
// SCRIPT APPLIES IT: `apply-rulings.mjs` targets the glossary, not a copy bank,
// so the substitution is done by hand. Byte-identity therefore has no `--expect`
// behind it, and this file is what replaces one.
//
// It parses the worksheet and compares every row to the live bank. A
// transcription slip in a file nobody reads word-for-word again is invisible,
// which is the whole reason the rulings-file convention exists.
//
// ── THE COUNT IS ENUMERATED, NOT TRUSTED ───────────────────
// The worksheet's own header claimed "4 + 21 + 2 ... 27 distinct slots" against
// a 28-row table. Corrected on landing, and the arithmetic is asserted here so
// the next amendment cannot reintroduce it.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { SITE_COPY, PASANGAN_COPY } from '../lib/site/copy.js';
import { SENTINEL } from '../scripts/check-unruled-copy.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const MD = readFileSync(path.join(ROOT, 'docs', 'content', 'pasangan-copy-rulings.md'), 'utf8');

/** Every `| bank | `slot` | `string` |` row, in file order. */
function worksheet() {
  const rows = [];
  for (const line of MD.split(/\r?\n/u)) {
    const m = /^\|\s*(SITE_COPY(?:\.privasi)?|PASANGAN_COPY)\s*\|\s*`([a-z0-9_]+)`\s*\|\s*`(.*)`\s*\|$/u
      .exec(line);
    if (m) rows.push({ bank: m[1], slot: m[2], value: m[3] });
  }
  return rows;
}

const bankOf = {
  SITE_COPY: () => SITE_COPY,
  'SITE_COPY.privasi': () => SITE_COPY.privasi,
  PASANGAN_COPY: () => PASANGAN_COPY,
};

test('THE WORKSHEET IS 28 ROWS AND 28 DISTINCT SLOTS', () => {
  const rows = worksheet();
  assert.equal(rows.length, 28, 'the table has 28 rows');
  assert.equal(new Set(rows.map((r) => `${r.bank}.${r.slot}`)).size, 28, 'and no slot twice');

  const byBank = {};
  for (const r of rows) byBank[r.bank] = (byBank[r.bank] || 0) + 1;
  assert.deepEqual(byBank, { SITE_COPY: 4, PASANGAN_COPY: 22, 'SITE_COPY.privasi': 2 });

  // The header states the same numbers. It did not, once.
  assert.match(MD, /22 PASANGAN_COPY slots/u);
  assert.match(MD, /28 DISTINCT SLOTS/u);
});

test('EVERY ROW IS APPLIED, BYTE FOR BYTE', () => {
  const wrong = [];
  for (const { bank, slot, value } of worksheet()) {
    const live = bankOf[bank]()[slot];
    if (live !== value) wrong.push(`${bank}.${slot}\n    worksheet: ${value}\n    live:      ${live}`);
  }
  assert.deepEqual(wrong, [], `not verbatim:\n  ${wrong.join('\n  ')}`);
});

test('NOT ONE SENTINEL SURVIVES IN EITHER BANK', () => {
  // ── THIS TEST REPLACED ITS OWN OPPOSITE ────────────────────
  // `tests/compat-surface.spec.mjs` asserted that all 28 were STILL sentinels,
  // and said in its own comment that it was the record of the surface shipping
  // with named holes and that this is the assertion to invert when the worksheet
  // lands. It has landed.
  const seen = JSON.stringify({ PASANGAN_COPY, home: SITE_COPY, privasi: SITE_COPY.privasi });
  assert.equal(seen.includes(SENTINEL), false, 'a PENDING() sentinel survives in a compat bank');
});

test('THE FOUR PROMISES ARE STILL PROMISES THE CODE KEEPS', () => {
  // The worksheet flags four strings as ASSERTIONS ABOUT BEHAVIOUR rather than
  // chrome: if the behaviour changes, all four change in the same commit. Pinned
  // by their claims, not by their wording, so a rephrase does not fail this and a
  // behaviour change does.
  //
  // `form_email_help` and `link_keep` say nothing is sent to the email. Nothing
  // sends: there is no mailer in the repo at all.
  assert.match(PASANGAN_COPY.form_email_help, /[Tt]idak ada yang dikirim/u);
  assert.match(PASANGAN_COPY.link_keep, /tidak ada yang dikirim ke email/u);
  assert.match(SITE_COPY.privasi.privasi_email, /tidak mengirim apa pun/u);

  // `privasi_second_person` promises B's data is deleted with the reading.
  // **THAT ONE IS NOT KEPT TODAY** - there is no deletion code for any table, and
  // /privasi tells the reader to send a link that does not locate a pair row.
  // Recorded in NEXT.md under "THE DELETION PATH DOES NOT REACH A PAIR"; this
  // assertion exists so the string and the gap are findable from each other.
  assert.match(SITE_COPY.privasi.privasi_second_person, /ikut terhapus/u);
});

test('THE PRICE IS STILL NOT A STRING', () => {
  // Ruled copy is exactly when this could slip in: a `price_note` mentioning
  // 39.000 would be a second source of truth for what the thing costs.
  assert.ok(!/\d{2}[.,]?\d{3}/u.test(JSON.stringify(PASANGAN_COPY)),
    'a price-shaped number reached PASANGAN_COPY');
});
