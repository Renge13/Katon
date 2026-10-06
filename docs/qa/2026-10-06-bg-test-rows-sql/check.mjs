// @electric-sql/pglite is NOT a repo dependency (installed in a scratch dir, 2026-10-06).
// Runs docs/ops/funnel.sql against a seeded funnel_event in PGlite, and checks the counts.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

import path from 'node:path';
const REPO = path.resolve(import.meta.dirname, '../../..');
const sql = readFileSync(`${REPO}/docs/ops/funnel.sql`, 'utf8');
const schema = readFileSync(`${REPO}/supabase/migrations/0009_demand_test.sql`, 'utf8');
const table = schema.slice(schema.indexOf('create table if not exists public.funnel_event'), schema.indexOf('create table if not exists public.product_interest'));

const db = new PGlite();
await db.exec(table);

const IN = '2026-10-10 10:00+07';
const OUT = '2026-09-15 10:00+07';
const rows = [
  // r1, hour given: every step
  ['r1', 'reading_created', { has_hour: true }, IN], ['r1', 'mirror_served', { source: 'gemini' }, IN],
  ['r1', 'offer_seen', null, IN], ['r1', 'checkout_started', { sku: 'artifact' }, IN], ['r1', 'purchase_confirmed', { sku: 'artifact' }, IN],
  // r2, no hour: to the offer
  ['r2', 'reading_created', { has_hour: false }, IN], ['r2', 'mirror_served', null, IN], ['r2', 'offer_seen', null, IN],
  // r3, hour given: created only
  ['r3', 'reading_created', { has_hour: true }, IN],
  // a listed test row, every step: excluded
  ['eJm6p6PjG8f_0eridE39x', 'reading_created', { has_hour: true }, IN], ['eJm6p6PjG8f_0eridE39x', 'purchase_confirmed', null, IN],
  // the three 2026-10-06 test rows, each with steps: all excluded
  ['Zn-4VU2Ni2lLdcTO25aS2', 'reading_created', { has_hour: true }, IN], ['Zn-4VU2Ni2lLdcTO25aS2', 'purchase_confirmed', null, IN],
  ['zDK_PNEbwMDFHYhT_MI2k', 'reading_created', { has_hour: true }, IN], ['zDK_PNEbwMDFHYhT_MI2k', 'checkout_started', null, IN],
  ['WqocaFz1FTMYqLPRBrtnl', 'reading_created', { has_hour: false }, IN], ['WqocaFz1FTMYqLPRBrtnl', 'mirror_served', null, IN],
  // created BEFORE the range, bought inside it: not this cohort
  ['r4', 'reading_created', { has_hour: false }, OUT], ['r4', 'purchase_confirmed', null, IN],
  // a pair: no reading_created, never in the cohort
  ['p1', 'checkout_started', null, IN], ['p1', 'purchase_confirmed', null, IN],
];
for (const [id, ev, detail, at] of rows) {
  await db.query('insert into public.funnel_event (reading_id, event, detail, created_at) values ($1, $2, $3, $4)', [id, ev, detail, at]);
}

const broken = process.argv.includes('--drop-exclusion');
const res = await db.query(broken ? sql.replace("    and e.reading_id not in (select id from test_rows)\n", '') : sql);
if (broken) console.log('(test-row exclusion removed)');
const got = res.rows.map((r) => [r.split, r.reading_created, r.reading_viewed, r.offer_seen, r.checkout_started, r.purchase_confirmed].join(' '));
console.log(got.join('\n'));
const want = ['all 3 2 2 1 1', 'hour given 2 1 1 1 1', 'no hour 1 1 1 0 0'];
const ok = JSON.stringify(got) === JSON.stringify(want);
console.log(ok ? 'MATCHES the expected counts' : `MISMATCH, expected:\n${want.join('\n')}`);
process.exitCode = ok ? 0 : 1;
