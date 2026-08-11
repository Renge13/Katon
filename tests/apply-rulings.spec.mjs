// ============================================================
// The rulings applier's guards
// ============================================================
// These test the GUARDS, not the happy path. The applier already ran correctly
// once; what failed was its ability to notice that it had run incorrectly.
//
// Tranche 1 was applied with a greedy /"([\s\S]*)"/m, which swallowed the rest
// of the rulings file into one field. The byte-identity check passed, because
// the swallowed text really was in the file. Identity answers "did this come
// from the file"; it says nothing about EXTENT. Every case below is a way of
// asking about extent.
//
// Run: npm run test:rulings
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseRulings } from '../scripts/apply-rulings.mjs';

const GOOD = [
  '## elemen.火',
  '- label_meaning: "Kehadiranmu langsung terasa sebelum kamu bicara."',
  '- actionable_seed (NEW field): "Atur jadwal untuk mengisi energimu."',
  '',
  '## bintang.天乙貴人',
  '- NO CHANGE. Anchor cell.',
  '',
  '## pilar — NEW `domain_id` field',
  '- year (Pilar Akar): "asal-usul dan latar belakangmu"',
  '- month (Pilar Kerja): "pekerjaan dan kariermu"',
].join('\n');

test('a well-formed tranche parses to exactly its assignments', () => {
  const { assignments, problems } = parseRulings(GOOD);
  assert.deepEqual(problems, []);
  assert.equal(assignments.length, 4);
  assert.deepEqual(assignments.map((a) => `${a.block}${a.key ? `.${a.key}` : ''}.${a.field}`), [
    'elemen.火.label_meaning',
    'elemen.火.actionable_seed',
    'pilar.year.domain_id',
    'pilar.month.domain_id',
  ]);
  // A "NO CHANGE" cell contributes nothing and must not be silently counted.
  assert.ok(!assignments.some((a) => a.block.includes('天乙貴人')));
});

test('THE TRANCHE-1 SHAPE: a value cannot swallow the lines after it', () => {
  // What actually happened: the value pattern was /"([\s\S]*)"/m - greedy AND
  // multiline - so one field matched from its own opening quote to the LAST
  // quote in the document, absorbing every assignment after it. 19 fields
  // became 5, and one of them held ~2KB of other people's strings.
  //
  // Splitting into lines BEFORE matching makes that structurally impossible, so
  // the test is that the later assignments all survive as themselves. If a
  // future edit reintroduces a multiline flag, this count drops and the test
  // fails - which is the guard doing its job.
  const { assignments, problems } = parseRulings(GOOD);
  assert.deepEqual(problems, []);
  assert.equal(assignments.length, 4, 'a swallowed match would show up as too FEW assignments');
  for (const a of assignments) {
    assert.ok(!/[\r\n]/.test(a.value), `${a.field} spans a line break`);
    assert.ok(a.value.length < 100, `${a.field} is ${a.value.length} chars - suspiciously long`);
  }
  // The last assignment in the file must still be its own, not part of the first.
  assert.equal(assignments.at(-1).value, 'pekerjaan dan kariermu');
});

test('a line with text after the closing quote is refused on extent', () => {
  // The directly testable half of the extent guard: the value must reach the
  // final quote on its line, so a trailing fragment means the match stopped in
  // the wrong place - or started in it.
  const trailing = ['## aspek.正官', '- actionable_seed: "Buat jadwal sendiri." lalu sisa teks'];
  const { assignments, problems } = parseRulings(trailing.join('\n'));
  assert.equal(assignments.length, 0, 'a value with trailing text must not be accepted');
  assert.equal(problems.length, 1, 'and it must be REPORTED, not silently skipped');
  assert.match(problems[0], /looks like an assignment but does not parse/);
});

test('a NO CHANGE line is ignored without being reported as malformed', () => {
  // The near-miss report must not cry wolf on the anchor cells, or a tranche
  // with three unchanged entries refuses to apply for no reason.
  const { assignments, problems } = parseRulings(
    '## bintang.天乙貴人\n- NO CHANGE. Anchor cell; passes all three tests as-is.',
  );
  assert.deepEqual(assignments, []);
  assert.deepEqual(problems, []);
});

test('a runaway value is refused on length even if it is on one line', () => {
  // The backstop for the case the extent check cannot see - a genuinely
  // single-line value that is far too long to be a glossary seed.
  const huge = ['## aspek.正官', `- actionable_seed: "${'a'.repeat(700)}"`].join('\n');
  const { assignments, problems } = parseRulings(huge);
  assert.equal(assignments.length, 0);
  assert.match(problems[0], /ceiling is 600/);
});

test('an empty value is refused', () => {
  const { assignments, problems } = parseRulings('## aspek.正官\n- actionable_seed: ""');
  assert.equal(assignments.length, 0);
  assert.match(problems[0], /empty value/);
});

test('the pilar block cannot be parsed as an ordinary dotted field', () => {
  // "- year (Pilar Akar): ..." matches the generic field pattern too, and did,
  // producing a field called "year" on a heading that is not a path. The pilar
  // branch is tried first for exactly this reason.
  const { assignments } = parseRulings(GOOD);
  const pilar = assignments.filter((a) => a.block === 'pilar');
  assert.equal(pilar.length, 2);
  for (const a of pilar) {
    assert.equal(a.field, 'domain_id');
    assert.ok(['year', 'month'].includes(a.key));
  }
});

test('every assignment carries its source line, so a refusal is locatable', () => {
  const { assignments } = parseRulings(GOOD);
  assert.deepEqual(assignments.map((a) => a.line), [2, 3, 9, 10]);
});
