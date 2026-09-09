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
// ── 28 BECAME 31 ON 2026-09-09, AND THE PARSER MOVED WITH IT ──
// The amendment did three things a single flat regex could not see, and the
// visible symptom was a count of 25 that looked like rows going missing:
//
//   `paid_title` is DROPPED, and its row stays as `~~`paid_title`~~ | DROPPED`
//   so the deletion has a record. It is read as a DROP and asserted ABSENT from
//   the bank - a struck row that silently stopped parsing would let the slot
//   come back with nobody noticing.
//
//   `report_badge_eyebrow` / `report_quadrant_eyebrow` were RENAMED, and their
//   rows carry a "(was `...`)" note in the slot cell. The note is parsed and
//   discarded: the old name is history, not a second slot.
//
//   Four NEW section eyebrows live in the file's SECOND table, which has three
//   columns and no bank column. It is read as PASANGAN_COPY, scoped BY HEADING
//   rather than by shape - the file now holds two other three-column tables
//   (the shared-JSX one and the email was/now record) and a shape-matching
//   parser would compare the bank against a superseded value from one of them.
//   There is an assertion below that neither is being read.
//
// `section_pattern` and `section_rhythm` appear in BOTH tables. That is the one
// ruled value in two places this file is meant to catch, so it is not merely
// deduped: the two copies must agree, byte for byte, or this goes red.
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

/** The text under a `## ` heading, up to the next one. '' selects the preamble. */
function section(heading) {
  const parts = MD.split(/^## /mu);
  if (heading === '') return parts[0];
  const hit = parts.find((p) => p.startsWith(heading));
  assert.ok(hit, `the rulings file has no "## ${heading}" section`);
  return hit;
}

const BANK_ROW =
  /^\|\s*(SITE_COPY(?:\.privasi)?|PASANGAN_COPY)\s*\|\s*`([a-z0-9_]+)`(?:\s*\(was `[a-z0-9_]+`\))?\s*\|\s*`(.*)`\s*\|$/u;
const DROP_ROW =
  /^\|\s*(?:SITE_COPY(?:\.privasi)?|PASANGAN_COPY)\s*\|\s*~~`([a-z0-9_]+)`~~\s*\|\s*DROPPED\b/u;
/** The section-eyebrow table: `| `slot` | `string` | over |`. No bank column. */
const SECTION_ROW = /^\|\s*`([a-z0-9_]+)`\s*\|\s*`(.*?)`\s*\|/u;

/** Slots the file records as deleted. They must be absent from their bank. */
function dropped() {
  return section('').split(/\r?\n/u)
    .map((line) => DROP_ROW.exec(line)).filter(Boolean).map((m) => m[1]);
}

/**
 * Every ruled slot, from BOTH tables, in file order.
 *
 * A slot in both tables is returned once and its two copies are asserted equal
 * on the way through - one ruled value must not be able to become two.
 */
function worksheet() {
  const raw = [];
  for (const line of section('').split(/\r?\n/u)) {
    const m = BANK_ROW.exec(line);
    if (m) raw.push({ bank: m[1], slot: m[2], value: m[3] });
  }
  for (const line of section('Report section eyebrows').split(/\r?\n/u)) {
    const m = SECTION_ROW.exec(line);
    if (m) raw.push({ bank: 'PASANGAN_COPY', slot: m[1], value: m[2] });
  }

  const rows = [];
  const seen = new Map();
  for (const row of raw) {
    const key = `${row.bank}.${row.slot}`;
    if (seen.has(key)) {
      assert.equal(seen.get(key), row.value,
        `${key} is ruled twice in this file and the two copies disagree`);
      continue;
    }
    seen.set(key, row.value);
    rows.push(row);
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

test('THE WORKSHEET IS 31 RULED SLOTS AND ONE DROPPED ONE', () => {
  const rows = worksheet();
  assert.equal(rows.length, 31, 'the two ruled tables carry 31 slots between them');
  assert.equal(new Set(rows.map((r) => `${r.bank}.${r.slot}`)).size, 31, 'and no slot twice');

  const byBank = {};
  for (const r of rows) byBank[r.bank] = (byBank[r.bank] || 0) + 1;
  assert.deepEqual(byBank, { SITE_COPY: 4, PASANGAN_COPY: 25, 'SITE_COPY.privasi': 2 });

  // THE DROP IS AN ASSERTION, NOT A GAP. `paid_title` is recorded as deleted, so
  // the bank must not still carry it - otherwise the row reads as history while
  // the slot is live, which is the exact pair of states a file like this exists
  // to keep from drifting apart.
  assert.deepEqual(dropped(), ['paid_title'], 'one slot is recorded as dropped');
  for (const slot of dropped()) {
    assert.equal(slot in PASANGAN_COPY, false, `${slot} is recorded DROPPED but still in the bank`);
  }

  // THREE OTHER TABLES IN THIS FILE ARE NOT RULED VALUES, and each would do
  // real damage if the parser started reading it. Y-2 chrome is a draft set;
  // the shared-JSX table is hard-coded strings that are in no bank; the email
  // table is a was/now RECORD whose first value column holds the SUPERSEDED
  // string, so reading it would assert the bank against what was just replaced.
  assert.match(MD, /## Y-2 strings/u);
  assert.match(MD, /## Shared with the mirror/u);
  assert.match(MD, /## Email strings/u);
  assert.equal(rows.some((r) => r.slot.startsWith('sales_closed')), false,
    'the Y-2 table must not be parsed as a ruled row');
  assert.equal(rows.some((r) => r.value.includes('Hanya dipakai untuk membuka kembali')), false,
    'the email was/now record must not be parsed as a ruled row');
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
  //
  // ── THIS BRANCH MODELS A TRANCHE AND NOT AN AMENDMENT (2026-09-09) ──
  // Recorded because the next person to land one will hit it, and rediscovering
  // it as a defect costs a morning. The 2026-09-09 amendment moved FOUR strings
  // in an already-applied set of 28, so the honest RULED state was 22 matching
  // and 3 not - and this assertion called that a partial application. It is
  // correct for a fresh tranche, where nothing should match yet, and wrong for
  // an amendment, where almost everything should. It was not rewritten then:
  // that commit APPLIED the strings and flipped STATUS, so it never exercised
  // this branch, and loosening a guard you are not running is how a guard stops
  // guarding. Whoever lands the next amendment should key it on WHICH rows the
  // file marks as amended, not on how many match.
  assert.ok(applied.length < unapplied.length,
    `STATUS is RULED but ${applied.length} of ${applied.length + unapplied.length} rows already `
    + 'match, which is a partial application. Finish it and flip STATUS to APPLIED in the same '
    + 'commit. (If this is an AMENDMENT to an applied set, see the note above this assertion.)');
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

test('THE SHARED JSX STRINGS ARE THE RULED ONES, IN EVERY FILE THAT CARRIES THEM', () => {
  // ── WHY THIS EXISTS AT ALL ─────────────────────────────────
  // These two are ruled copy that is NOT in a copy bank - they are hard-coded in
  // JSX, deliberately, because a bank for two strings is more machinery than the
  // strings are worth. That put them outside every check in this repo: on
  // 2026-09-09 all three could have been reverted and the full suite stayed
  // green. CLAUDE.md's rule is that a commit changing behaviour must have an
  // assertion that fails without it, so here it is.
  //
  // ── THE RULED WORDS ARE READ, NOT RETYPED ──────────────────
  // The values come out of the rulings table itself. A test holding its own copy
  // of a ruled value IS the cause of the next stale-test day - that is the
  // lesson the forge price ladder taught - and it would be a particularly silly
  // one to repeat inside the file whose entire job is byte-identity.
  //
  // LINE NUMBERS IN THE TABLE ARE NOT ASSERTED. They drift on any edit above
  // them, and a test that goes red because a string moved down four lines is a
  // test people learn to ignore.
  const rows = [];
  for (const line of section('Shared with the mirror').split(/\r?\n/u)) {
    const m = /^\|\s*(.+?)\s*\|\s*`(.+?)`\s*\|\s*`(.+?)`\s*\|$/u.exec(line);
    if (!m || m[1].startsWith('---') || m[1] === 'Where') continue;
    const files = [...m[1].matchAll(/`([\w/.]+\.jsx):\d+`/gu)].map((f) => f[1]);
    if (files.length) rows.push({ files, was: m[2], now: m[3] });
  }

  // THREE SINCE 2026-09-09. The third is the season gate's hour helper, ruled
  // with the hour picker (Y-2 Addendum 2 item 4) - #112 flagged it as the one
  // "Jamnya saja" no ruling covered and left it, which is why it is here now.
  assert.equal(rows.length, 3, 'the shared table has three ruled strings');
  assert.deepEqual(rows.flatMap((r) => r.files),
    ['components/BirthFields.jsx', 'components/Funnel.jsx', 'components/PasanganSteps.jsx',
      'components/Funnel.jsx'],
    'the under-CTA line is in BOTH products (the compat half lives in the stepper since Y-2 commit 2), and Funnel carries a second ruled string of its own');

  for (const { files, was, now } of rows) {
    for (const file of files) {
      const src = readFileSync(path.join(ROOT, file), 'utf8');
      assert.ok(src.includes(now), `${file} must carry the ruled string: "${now}"`);
      assert.equal(src.includes(was), false,
        `${file} still carries the superseded string: "${was}"`);
    }
  }
});

test('THE PRICE IS STILL NOT A STRING', () => {
  // Ruled copy is exactly when this could slip in: a `price_note` mentioning
  // 39.000 would be a second source of truth for what the thing costs.
  assert.ok(!/\d{2}[.,]?\d{3}/u.test(JSON.stringify(PASANGAN_COPY)),
    'a price-shaped number reached PASANGAN_COPY');
});
