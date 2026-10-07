// ============================================================
// tests/compat-p1-produces-seeds.spec.mjs — Inti Menghidupi's seeds are the ruled ones
// ============================================================
// Run: npm run test:compat-p1-produces-seeds
//
// Prompt BJ §2 (Reyner ruled 2026-10-07): Inti Menghidupi (`p1_produces`) owns care,
// support and safety; Pola Menyalakan owns ideas and initiative. Its meaning_seed and
// daily_seed are replaced. The strings are PARSED from the rulings record with
// scripts/apply-rulings.mjs's own parser - the one that applied them - never retyped here.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { parseRulings } from '../scripts/apply-rulings.mjs';
import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { buildPairSemantic } from '../lib/semantic/pair.js';
import { buildSemanticJson, cacheKey } from '../lib/semantic/index.js';

const MD = readFileSync(new URL('../docs/content/compat-p1-produces-rulings-2026-10-07.md', import.meta.url), 'utf8');
const GLOSSARY = JSON.parse(readFileSync(new URL('../docs/content/glossary.json', import.meta.url), 'utf8'));
const CELL = GLOSSARY.kompatibilitas.p1_produces;

test('the two ruled seeds are in the glossary, byte for byte; name and label unchanged', () => {
  const { assignments, problems } = parseRulings(MD);
  assert.deepEqual(problems, []);
  assert.deepEqual(assignments.map((a) => `${a.block}.${a.field}`),
    ['kompatibilitas.p1_produces.meaning_seed', 'kompatibilitas.p1_produces.daily_seed']);
  for (const a of assignments) assert.equal(CELL[a.field], a.value, `${a.field} is the ruled string`);
  assert.equal(CELL.name_id, 'Inti Menghidupi');
  assert.equal(CELL.label_meaning,
    'Unsur salah satu dari kalian menghidupi unsur yang lain. Satu orang mengayomi, yang lain merasa diayomi, dan arah ini jarang berbalik.');
});

test('compat keys move for a p1_produces pair; the mirror keeps its key', () => {
  // Printed on main @ b8e9ba8 before this change. ENGINE_VERSION is not bumped.
  const a = calculateBaziChart({ birthDate: '1989-09-13', birthTime: null, gender: 'male' });
  const b = calculateBaziChart({ birthDate: '1997-09-14', birthTime: null, gender: 'female' });
  const sj = buildPairSemantic(a, b, { voice: 'v2', status: 'Menikah', nicknames: { a: 'Rey', b: 'Eta' } });
  assert.equal(sj.facts.find((f) => f.id === 'p1_stem_relation').provenance.variant, 'p1_produces', 'precondition');
  assert.notEqual(cacheKey(sj), 'e53e060c414b22403b40b77ff4f5539d8d665dbd92aebdb71e544e7c88b5f6f5', 'Rey/Eta re-renders');
  const m = calculateBaziChart({ birthDate: '1989-09-13', birthTime: '09:00' });
  assert.equal(cacheKey(buildSemanticJson(m, { voice: 'v2' })), '61a2eafdb11654406781f01f47a2799b18e44275a46eaeb23866b1f718df85f2');
});
