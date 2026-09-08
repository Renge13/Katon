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
// A worksheet header once claimed "4 + 21 + 2 ... 27 distinct slots" against a
// 28-row table. The split is enumerated here so the next amendment cannot
// reintroduce it. The header's PROSE is not asserted - it is prose, it gets
// rewritten, and pinning its wording made this file fail on a reword rather than
// on a defect.
//
// ── IT HAS TWO STATES, BECAUSE THE PROCESS DOES ────────────
// The #28 ruling puts a rulings file on main ALONE, before the PR that applies
// it. So there is a documented window where the file is landed and the bank
// still holds the previous values, and a verifier that cannot represent that
// window mis-models its own process: it goes red on a correct intermediate state
// and trains people to ignore it.
//
// The file's own STATUS line says which state it is in, and the APPLYING commit
// flips it. That is not a flag for silencing this test:
//
//   RULED    every row must be UNAPPLIED. A majority already matching means a
//            PARTIAL application - which is the real danger here, and is what a
//            transcription slip or a half-finished pass looks like.
//   APPLIED  every row must match BYTE FOR BYTE.
//
// Every row is read in both states. The previous rulings file used the same
// convention (STATUS: APPLIED-AS-DRAFTED), so this reads a marker the repo
// already keeps rather than inventing one.
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

/** 'RULED' (landed, not yet applied) or 'APPLIED'. Declared by the file itself. */
function status() {
  const m = /^STATUS:\s*([A-Z-]+)/mu.exec(MD);
  assert.ok(m, 'the rulings file declares no STATUS');
  return m[1];
}

test('THE WORKSHEET IS 28 ROWS AND 28 DISTINCT SLOTS', () => {
  const rows = worksheet();
  assert.equal(rows.length, 28, 'the table has 28 rows');
  assert.equal(new Set(rows.map((r) => `${r.bank}.${r.slot}`)).size, 28, 'and no slot twice');

  const byBank = {};
  for (const r of rows) byBank[r.bank] = (byBank[r.bank] || 0) + 1;
  assert.deepEqual(byBank, { SITE_COPY: 4, PASANGAN_COPY: 22, 'SITE_COPY.privasi': 2 });

  // The file carries a SECOND table - Y-2 chrome, two columns, no bank - which is
  // deliberately not part of the 28. Asserted so a future parser change that
  // starts swallowing it fails with a reason instead of quietly counting 40.
  assert.match(MD, /## Y-2 strings/u);
  assert.equal(rows.some((r) => r.slot.startsWith('sales_closed')), false,
    'the Y-2 table must not be parsed as one of the 28');
});

test('EVERY ROW MATCHES THE STATE THE FILE DECLARES', () => {
  const state = status();
  assert.ok(['RULED', 'APPLIED'].includes(state), `unknown STATUS "${state}"`);

  const applied = [];
  const unapplied = [];
  for (const { bank, slot, value } of worksheet()) {
    const live = bankOf[bank]()[slot];
    (live === value ? applied : unapplied).push(
      `${bank}.${slot}\n    worksheet: ${value}\n    live:      ${live}`,
    );
  }

  if (state === 'APPLIED') {
    assert.deepEqual(unapplied, [],
      `STATUS is APPLIED but these are not verbatim:\n  ${unapplied.join('\n  ')}`);
    return;
  }

  // RULED: landed, not yet applied. A MAJORITY already matching means the pass
  // has begun and stopped - the partial state a hand substitution leaves and the
  // one nobody would notice. A handful of coincidental matches is expected and
  // fine: two slots are identical between the drafts and the ruling.
  assert.ok(applied.length < unapplied.length,
    `STATUS is RULED but ${applied.length} of 28 rows already match, which is a `
    + 'partial application. Finish it and flip STATUS to APPLIED in the same commit.');
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
  // ── PINNED ON THE CLAIM, NOT THE PHRASING ─────────────────
  // The first version matched Reyner's DRAFT wording literally - "tidak ada yang
  // dikirim" - and his ruling says the same thing differently ("Tidak ada email
  // yang dikirim", "tanpa kiriman email"). It failed on a reword, which is
  // exactly what this test's own comment said it must not do. A negation plus a
  // send-verb is the proposition; the sentence around it is his.
  //
  // `ngirim` IS IN THE PATTERN BECAUSE INDONESIAN ASSIMILATES THE STEM. `meN-` +
  // `kirim` is `mengirim`, which does not contain the substring `kirim` - so a
  // pattern matching only `kirim` reads "Kami tidak pernah mengirim pesan" as
  // making no promise at all. Caught by running it against Reyner's ruled string.
  const promisesNothingSent = (s) => /\b(tidak|tanpa)\b/iu.test(s) && /(kirim|ngirim)/iu.test(s);

  for (const [name, value] of [
    ['form_email_help', PASANGAN_COPY.form_email_help],
    ['link_keep', PASANGAN_COPY.link_keep],
    ['privasi_email', SITE_COPY.privasi.privasi_email],
  ]) {
    assert.ok(promisesNothingSent(value), `${name} must still promise nothing is sent: "${value}"`);
  }
  // And the promise is true: there is no mailer in the repo at all.

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
