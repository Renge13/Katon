#!/usr/bin/env node
// ============================================================
// scripts/demand-readout.mjs — the September funnel, with every denominator named
// ============================================================
//   npm run readout:demand
//   npm run readout:demand -- --since 2026-09-01 --until 2026-09-30
//   node scripts/demand-readout.mjs --fixture tests/demand-readout.fixture.json
//
// Prompt Q commit 5. READ-ONLY. No dashboard, no dependency, no write path.
//
// ── WHY IT ACCEPTS A FIXTURE, WHICH IS A RULED DECISION ──
// In dev-fallback mode the counters live in the NEXT SERVER'S memory, not in this
// script's process, so "walk the funnel locally, then run the read-out" cannot
// work without Supabase. Requiring Supabase for one local check was the
// alternative and it is worse. The fixture door is also the same door the
// adversarial seeded test needs, so it costs one flag and buys both.
//
// WITH `--fixture` NOTHING IS IMPORTED FROM THE APP AT ALL. The analytics module
// carries `server-only`, so a fixture run stays a plain node script needing no
// conditions and no credentials - which is the whole point of having the door.
//
// ── THE ANOMALY BLOCK IS THE POINT, NOT A GARNISH ──
// A read-out that cannot report a broken funnel is not evidence about a working
// one. Every rate below divides by a denominator that a bug can silently corrupt,
// and a corrupted rate LOOKS FINE - that is the failure mode this file exists to
// make impossible. Anomalies print FIRST, before any number, and the process
// exits 1 when there are any, so a scripted caller cannot read the rates and miss
// the warning.
// ============================================================

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? null : argv[i + 1];
};

const FIXTURE = flag('fixture');
const SINCE = flag('since');
const UNTIL = flag('until');

/** `2026-09-30` means the whole of that day, not its first instant. */
const untilBound = UNTIL && /^\d{4}-\d{2}-\d{2}$/.test(UNTIL) ? `${UNTIL}T23:59:59.999Z` : UNTIL;

async function load() {
  if (FIXTURE) {
    const raw = JSON.parse(readFileSync(FIXTURE, 'utf8'));
    const inWindow = (r) => (!SINCE || r.created_at >= SINCE) && (!untilBound || r.created_at <= untilBound);
    return {
      events: (raw.events ?? []).filter(inWindow),
      interest: (raw.interest ?? []).filter(inWindow),
      source: `fixture ${FIXTURE}`,
    };
  }
  // Imported lazily so a fixture run never touches `server-only`.
  const { readEvents, readInterest } = await import('../lib/analytics/events.js');
  const opts = { since: SINCE, until: untilBound };
  return { events: await readEvents(opts), interest: await readInterest(opts), source: 'live' };
}

// ── shaping ──

/** Distinct reading ids carrying an event. THE ONLY WAY A DENOMINATOR IS BUILT. */
const readersWith = (events, name) =>
  new Set(events.filter((e) => e.event === name).map((e) => e.reading_id));

const pct = (n, d) => (d === 0 ? '  n/a' : `${((n / d) * 100).toFixed(1).padStart(5)}%`);
const num = (n) => String(n).padStart(6);

/**
 * Everything that means the DATA is wrong, rather than the product being
 * unpopular. Each one is a NUMBER THAT WOULD OTHERWISE LOOK PLAUSIBLE.
 */
export function anomalies(events, interest) {
  const out = [];

  // 1. The unique index is (reading_id, event). A second ROW for the same pair
  //    means dedup is not happening, and every denominator is inflated. A high
  //    `count` is NOT this - that is a refresh, and it is recorded on purpose.
  const seen = new Map();
  for (const e of events) {
    const k = `${e.reading_id} ${e.event}`;
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  for (const [k, n] of seen) {
    if (n > 1) out.push(`DUPLICATE ROWS: ${n} rows for (${k}). The unique index is not holding, so every rate using this event is inflated.`);
  }

  // 2. A numerator whose reader is absent from its own denominator. Interest is
  //    divided by `upcoming_seen`, so an interest from a reader who never saw the
  //    block makes the rate mean something it cannot mean.
  const sawUpcoming = readersWith(events, 'upcoming_seen');
  for (const r of interest) {
    if (!sawUpcoming.has(r.reading_id)) {
      out.push(`INTEREST WITHOUT upcoming_seen: reading ${r.reading_id} registered "${r.product}" but never recorded seeing the block.`);
    }
  }

  // 3. Money that appeared without the step before it. Either the counter is
  //    broken or a purchase happened off-funnel; both change what the conversion
  //    rate means and neither is visible in the rate itself.
  const started = readersWith(events, 'checkout_started');
  for (const r of readersWith(events, 'purchase_confirmed')) {
    if (!started.has(r)) out.push(`PURCHASE WITHOUT checkout_started: reading ${r} confirmed a purchase with no recorded checkout.`);
  }

  // 4. Any reader who did something later in the funnel than she ever completed.
  const completed = readersWith(events, 'mirror_served');
  for (const name of ['card_downloaded', 'offer_seen', 'upcoming_seen', 'purchase_confirmed']) {
    for (const r of readersWith(events, name)) {
      if (!completed.has(r)) out.push(`${name.toUpperCase()} WITHOUT mirror_served: reading ${r} is missing from the primary denominator.`);
    }
  }

  // 5. An event name the schema does not know. A typo creates a ninth event and
  //    quietly halves whatever it was meant to be.
  const KNOWN = new Set(['reading_created', 'mirror_served', 'card_downloaded', 'offer_seen',
    'checkout_started', 'purchase_confirmed', 'upcoming_seen', 'interest_registered']);
  for (const name of new Set(events.map((e) => e.event))) {
    if (!KNOWN.has(name)) out.push(`UNKNOWN EVENT "${name}": not one of the eight. A typo in a call site creates a ninth event silently.`);
  }

  return out;
}

/** The whole report as data, so a test can assert numbers instead of parsing text. */
export function summarise(events, interest) {
  const completed = readersWith(events, 'mirror_served');
  const upcomingSeen = readersWith(events, 'upcoming_seen');
  const startedCheckout = readersWith(events, 'checkout_started');
  const purchasedArtifact = new Set(events
    .filter((e) => e.event === 'purchase_confirmed' && (e.detail?.sku ?? 'artifact') === 'artifact')
    .map((e) => e.reading_id));
  const byProduct = (p) => new Set(interest.filter((r) => r.product === p).map((r) => r.reading_id));

  return {
    created: readersWith(events, 'reading_created').size,
    completed: completed.size,
    floored: new Set(events
      .filter((e) => e.event === 'mirror_served' && e.detail?.source === 'module_assembly')
      .map((e) => e.reading_id)).size,
    downloaded: readersWith(events, 'card_downloaded').size,
    purchasedArtifact: purchasedArtifact.size,
    startedNotConfirmed: [...startedCheckout].filter((r) => !purchasedArtifact.has(r)).length,
    upcomingSeen: upcomingSeen.size,
    compat: byProduct('compat').size,
    annual: byProduct('annual').size,
    interestSignals: interest.length,
    withContact: interest.filter((r) => r.contact).length,
  };
}

// ── CLI ──
const invoked = process.argv[1] && process.argv[1].endsWith('demand-readout.mjs');
if (invoked) {
  const { events, interest, source } = await load();
  const s = summarise(events, interest);
  const found = anomalies(events, interest);

  if (found.length) {
    console.log('!'.repeat(64));
    console.log(`${found.length} ANOMALY(S). The numbers below are NOT evidence until these are explained.`);
    console.log('!'.repeat(64));
    console.log('');
    for (const a of found) console.log(`  ${a}`);
    console.log('');
  }

  console.log(`window            ${SINCE ?? 'all'} .. ${UNTIL ?? 'now'}   (${source})`);
  console.log('');
  console.log(`readings created                     ${num(s.created)}`);
  console.log(`completed mirror readers             ${num(s.completed)}     <- THE DENOMINATOR`);
  console.log(`  of which floored (module_assembly) ${num(s.floored)}  ${pct(s.floored, s.completed)}`);
  console.log(`share/download rate                        ${pct(s.downloaded, s.completed)}    (card_downloaded / completed)`);
  console.log(`artifact conversion                        ${pct(s.purchasedArtifact, s.completed)}    (purchase_confirmed[artifact] / completed)`);
  console.log(`  checkout started but not confirmed ${num(s.startedNotConfirmed)}`);
  console.log(`upcoming block seen                  ${num(s.upcomingSeen)}     <- THE SECOND DENOMINATOR`);
  console.log(`compat interest                            ${pct(s.compat, s.upcomingSeen)}    (interest[compat] / upcoming_seen)`);
  console.log(`annual interest                            ${pct(s.annual, s.upcomingSeen)}    (interest[annual] / upcoming_seen)`);
  console.log('');
  // REPORTED SEPARATELY AND DELIBERATELY NOT THE INTEREST METRIC. The tap is the
  // signal; this measures willingness to hand over a contact, which is a
  // different question and must never be read as demand.
  console.log(`contact capture                      ${num(s.withContact)}  of ${s.interestSignals} interest signals (NOT the interest metric)`);

  // A caller reading stdout must not be able to miss the warning block.
  process.exitCode = found.length ? 1 : 0;
}
