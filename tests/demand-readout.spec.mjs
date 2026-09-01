// ============================================================
// tests/demand-readout.spec.mjs — the instrument, shown reporting a broken funnel
// ============================================================
// Run: npm run test:readout
//
// Prompt Q commit 5: "The instrument must be shown failing before any number from
// it is trusted. Seed a deliberately wrong fixture and show the script reporting
// the anomaly rather than smoothing it. A read-out that cannot report a broken
// funnel is not evidence about a working one."
//
// This file is that demonstration, pinned so it stays true. The fixture lives in
// `tests/demand-readout.fixture.json` rather than inline, so the same bytes can
// be run by hand:
//
//   node scripts/demand-readout.mjs --fixture tests/demand-readout.fixture.json
//
// ── THE TWO HALVES, AND BOTH ARE NEEDED ──
// A detector that flags everything is as useless as one that flags nothing, so
// the clean fixture below asserts SILENCE just as hard as the broken one asserts
// noise. The specific trap: a refresh bumps `count`, which must NEVER be read as
// a duplicate - that would flag every healthy reader in September.
//
// No `server-only` import: the script's shaping functions are pure and the
// fixture door exists precisely so this needs no credentials.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { anomalies, summarise } from '../scripts/demand-readout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(ROOT, 'tests', 'demand-readout.fixture.json');
const broken = JSON.parse(readFileSync(FIXTURE, 'utf8'));

/** A funnel with nothing wrong with it. Two readers, one of whom refreshed. */
const clean = {
  events: [
    { reading_id: 'a', event: 'reading_created', detail: { has_hour: true }, count: 1, created_at: '2026-09-02T01:00:00.000Z' },
    { reading_id: 'a', event: 'mirror_served', detail: { source: 'rendered' }, count: 7, created_at: '2026-09-02T01:00:10.000Z' },
    { reading_id: 'a', event: 'offer_seen', detail: null, count: 1, created_at: '2026-09-02T01:01:00.000Z' },
    { reading_id: 'a', event: 'upcoming_seen', detail: null, count: 1, created_at: '2026-09-02T01:02:00.000Z' },
    { reading_id: 'a', event: 'interest_registered', detail: { product: 'compat' }, count: 1, created_at: '2026-09-02T01:02:10.000Z' },
    { reading_id: 'b', event: 'reading_created', detail: { has_hour: false }, count: 1, created_at: '2026-09-03T01:00:00.000Z' },
    { reading_id: 'b', event: 'mirror_served', detail: { source: 'module_assembly' }, count: 1, created_at: '2026-09-03T01:00:10.000Z' },
    { reading_id: 'b', event: 'upcoming_seen', detail: null, count: 1, created_at: '2026-09-03T01:02:00.000Z' },
  ],
  interest: [
    { reading_id: 'a', product: 'compat', contact: null, created_at: '2026-09-02T01:02:10.000Z' },
  ],
};

const kinds = (list) => list.map((a) => a.split(':')[0]).sort();

test('the broken fixture is reported, one finding per planted defect', () => {
  const found = anomalies(broken.events, broken.interest);
  assert.deepEqual(kinds(found), [
    'CARD_DOWNLOADED WITHOUT mirror_served',
    'DUPLICATE ROWS',
    'INTEREST WITHOUT upcoming_seen',
    'PURCHASE WITHOUT checkout_started',
    'UNKNOWN EVENT "mirror_serve"',
  ].sort());
});

test('a refresh is NOT a duplicate', () => {
  // r-ok-1 carries count 5 and a is count 7. Reading a bumped count as a second
  // row would flag every healthy reader in September, which would make the
  // anomaly block noise and therefore ignored.
  const found = anomalies(clean.events, clean.interest);
  assert.deepEqual(found, [], `a clean funnel must be silent, got: ${found.join(' | ')}`);
});

test('denominators count distinct readings, never rows', () => {
  const s = summarise(broken.events, broken.interest);
  // r-dupe has TWO mirror_served rows and must still be one completed reader.
  // This is the assertion that would have caught an inflated denominator.
  assert.equal(s.completed, 5, 'r-ok-1, r-ok-2, r-dupe, r-ghost, r-money - r-dupe once');
  assert.equal(s.created, 5);
  assert.equal(s.floored, 1, 'only r-ok-2 was served by module assembly');
  assert.equal(s.upcomingSeen, 2, 'only r-ok-1 and r-ok-2 reached the block');
});

test('the arithmetic is checkable by hand', () => {
  const s = summarise(clean.events, clean.interest);
  assert.equal(s.completed, 2);
  assert.equal(s.upcomingSeen, 2);
  assert.equal(s.compat, 1);
  assert.equal(s.annual, 0);
  assert.equal(s.floored, 1);
  // compat interest = 1/2 = 50%, annual = 0/2 = 0%, floor rate = 1/2 = 50%.
  assert.equal(s.interestSignals, 1);
  assert.equal(s.withContact, 0, 'the tap is the metric; this reader gave no contact');
});

test('interest is divided by upcoming_seen, not by completed readers', () => {
  // THE DISTINCTION THE SECOND DENOMINATOR EXISTS FOR. Three completed readers,
  // only one of whom ever reached the block, and she registered interest. That is
  // 100% of those who had the chance, not 33% of everyone.
  const events = [
    ...['x', 'y', 'z'].map((id) => ({ reading_id: id, event: 'mirror_served', detail: { source: 'rendered' }, count: 1, created_at: '2026-09-02T01:00:00.000Z' })),
    { reading_id: 'x', event: 'upcoming_seen', detail: null, count: 1, created_at: '2026-09-02T01:02:00.000Z' },
  ];
  const interest = [{ reading_id: 'x', product: 'annual', contact: null, created_at: '2026-09-02T01:03:00.000Z' }];

  assert.deepEqual(anomalies(events, interest), []);
  const s = summarise(events, interest);
  assert.equal(s.completed, 3);
  assert.equal(s.upcomingSeen, 1);
  assert.equal(s.annual, 1, '1/1 = 100% of those who had the chance, not 1/3');
});

test('a contact does not change whether the interest counts', () => {
  const events = [
    { reading_id: 'x', event: 'mirror_served', detail: { source: 'rendered' }, count: 1, created_at: '2026-09-02T01:00:00.000Z' },
    { reading_id: 'x', event: 'upcoming_seen', detail: null, count: 1, created_at: '2026-09-02T01:02:00.000Z' },
  ];
  const withNone = summarise(events, [{ reading_id: 'x', product: 'compat', contact: null, created_at: '2026-09-02T01:03:00.000Z' }]);
  const withOne = summarise(events, [{ reading_id: 'x', product: 'compat', contact: 'a@b.c', created_at: '2026-09-02T01:03:00.000Z' }]);
  assert.equal(withNone.compat, withOne.compat, 'the tap is the metric, not the contact');
  assert.equal(withNone.withContact, 0);
  assert.equal(withOne.withContact, 1);
});

test('the CLI exits non-zero on a broken funnel and zero on a clean one', () => {
  // A caller that reads stdout must not be able to take the rates and miss the
  // warning block above them.
  const bad = spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'demand-readout.mjs'), '--fixture', FIXTURE],
    { cwd: ROOT, encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /5 ANOMALY\(S\)/);
  // The warning must come BEFORE the numbers, or it is a footnote.
  assert.ok(bad.stdout.indexOf('ANOMALY') < bad.stdout.indexOf('THE DENOMINATOR'));

  const cleanPath = path.join(ROOT, 'tests', '.demand-readout.clean.tmp.json');
  writeFileSync(cleanPath, JSON.stringify(clean));
  try {
    const ok = spawnSync(process.execPath,
      [path.join(ROOT, 'scripts', 'demand-readout.mjs'), '--fixture', cleanPath],
      { cwd: ROOT, encoding: 'utf8' });
    assert.equal(ok.status, 0, ok.stdout);
    assert.ok(!ok.stdout.includes('ANOMALY'));
  } finally {
    rmSync(cleanPath, { force: true });
  }
});

test('the window filter is inclusive of its last day', () => {
  const run = (args) => spawnSync(process.execPath,
    [path.join(ROOT, 'scripts', 'demand-readout.mjs'), '--fixture', FIXTURE, ...args],
    { cwd: ROOT, encoding: 'utf8' });

  // r-typo's only event is on 2026-09-08. A naive `<= '2026-09-08'` compares
  // against midnight and would drop the whole day.
  const inclusive = run(['--since', '2026-09-08', '--until', '2026-09-08']);
  assert.match(inclusive.stdout, /UNKNOWN EVENT "mirror_serve"/,
    'the last day of the window must be included in full');
});
