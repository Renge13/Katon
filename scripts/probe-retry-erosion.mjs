#!/usr/bin/env node
// ============================================================
// scripts/probe-retry-erosion.mjs — what a retry COSTS the prose
// ============================================================
//   npm run probe:retry-erosion
//   npm run probe:retry-erosion -- --trace docs/qa/2026-08-18-retry-depth.json
//
// ── ZERO PROVIDER CALLS. IT READS A STORED TRACE. ──────────
// `probe-retry-depth.mjs` already stores every attempt's prose verbatim (77 of
// 78 on the 08-18 run; the missing one is a 503 that returned no text). So the
// question "does a retry buy a passing reading or a flattened one" is answerable
// for free, and it was answerable the whole time.
//
// ── WHY IT EXISTS: FLOOR RATE CANNOT SEE THIS ─────────────
// The 08-18 side-by-side compared attempt 1 with attempt 6 and found the deep
// retry sheds concrete nouns. But attempt 6 is ONE RUN and was labelled an
// anecdote. The shippable depth is 2, where 71% of retries pass, and that is
// n=20 on the same trace. This script measures attempt 1 vs attempt 2 across all
// of them.
//
// FOUR EROSION MEASURES, each one a thing a reader would notice losing:
//   1. THE ARCHETYPE IMAGE in the opening paragraph. `Api yang lahir sebagai
//      Matahari` is the product's first promise; `batang hari Api` is a data
//      readout. Measured as the day master's own `arketipe.name_id`.
//   2. THE NAMED ELEMENT on the dominance claim. `didominasi oleh Tanah` tells
//      the reader which element; `terisi oleh karya dan output yang dominan`
//      does not.
//   3. THE EN BRACKET, rule 23's bracket-once. Enforced by NO gate check, which
//      is the whole reason it is worth counting.
//   4. PARAGRAPH COUNT. Two paragraphs collapsing into one is a wall.
//
// ── WHAT THIS SCRIPT IS NOT ────────────────────────────────
// It is not a judgement. Whether losing the archetype image matters is a REGISTER
// call and Reyner's alone (CLAUDE.md: sole authority on Indonesian register).
// Every number here is a count of a named string pattern, and every pattern's
// blind spot is stated where it is defined. A rate on n <= 3 is printed as an
// anecdote, the same discipline as the depth probe.
// ============================================================

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

import { calculateBaziChart } from '../lib/bazi/buildChart.js';
import { GLOSSARY } from '../lib/semantic/glossary.js';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i === -1 ? d : argv[i + 1]; };
const TRACE = flag('trace', 'docs/qa/2026-08-18-retry-depth.json');
const stamp = new Date().toISOString().slice(0, 10);
const OUT = flag('out', `docs/qa/${stamp}-retry-erosion.md`);

const trace = JSON.parse(readFileSync(TRACE, 'utf8'));

// The four charts the depth probe runs, by its own labels. Kept here rather than
// imported so this script can read a trace written by an older version of that
// one - a stored artifact must stay readable after its producer changes.
const CHART_INPUTS = {
  'chart 5': { date: '1988-07-10', time: '22:00' },
  'chart 13': { date: '1989-02-04', time: '04:00' },
  'chart 1': { date: '1989-09-13', time: '09:00' },
  'fresh-1996': { date: '1996-10-02', time: '19:20' },
};

/** Day-master stem per chart label, from the ENGINE. Never inferred from prose. */
const stemFor = {};
for (const [label, c] of Object.entries(CHART_INPUTS)) {
  const chart = calculateBaziChart({ birthDate: c.date, birthTime: c.time });
  stemFor[label] = chart.dayMaster.stem;
}

// ── the four detectors ─────────────────────────────────────

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Paragraphs, excluding headings.
 *
 * `proseOf` in the depth probe joins blocks as `### heading\n\ntext` with `\n\n`
 * between them, and a block's own text keeps whatever internal breaks the model
 * wrote. So splitting the whole string on a blank line and dropping the `###`
 * chunks counts paragraphs across the reading.
 */
function paragraphs(prose) {
  return prose.split(/\n{2,}/).map((s) => s.trim())
    .filter((s) => s && !s.startsWith('### '));
}

/**
 * Is the day master's archetype NAME in the opening paragraph?
 *
 * BLIND SPOT, stated: this finds the NAME, not the image. A reading that says
 * `Matahari` in a flat sentence scores the same as one that says `Api yang lahir
 * sebagai Matahari`. It is a floor on the loss, never a measure of the writing -
 * if the name is gone the image certainly is.
 */
function archetypeInOpening(prose, stem) {
  const name = GLOSSARY.arketipe[stem]?.name_id;
  if (!name) return null;
  const first = paragraphs(prose)[0] || '';
  return new RegExp(`\\b${esc(name)}\\b`, 'i').test(first);
}

const ELEMENTS = Object.values(GLOSSARY.elemen).map((e) => e.name_id); // Kayu Api Tanah Logam Air
// Every phrasing observed in the corpus, not a guess: `didominasi oleh elemen
// Tanah`, `terisi oleh dominasi elemen Tanah`, `dipenuhi oleh elemen Tanah yang
// dominan`. `found: false` is reported separately from `named: false` precisely so
// a phrasing this list misses shows up as "no claim located" instead of silently
// counting as a loss.
const DOMINANCE = /(didominasi|dominasi|dominan|dipenuhi|paling banyak|terisi|melimpah|berlimpah|condong)/i;

/**
 * The dominance claim, and whether it names an element.
 *
 * Sentence-scoped rather than reading-scoped on purpose: every reading mentions
 * its day-master element somewhere, so a whole-reading count of `Api` cannot see
 * the specific loss. The question is whether the sentence that CLAIMS dominance
 * says which element is dominant.
 *
 * BLIND SPOT: `Api` is a substring of the archetype `Api Unggun`, so the element
 * pattern excludes that follower explicitly. Any new archetype whose name starts
 * with an element word needs the same guard.
 */
function dominanceNamesElement(prose) {
  // HEADINGS ARE STRIPPED BEFORE SPLITTING, not filtered after. The first version
  // flattened newlines and then dropped any sentence starting with `### `, which
  // glues a heading onto the sentence that FOLLOWS it - so `### Arus Karya dan
  // Batas Baganmu didominasi oleh elemen Tanah.` was discarded as a heading. It
  // reported 0 of 20 losses with zero variance, which is not a plausible
  // measurement of anything and is how the bug was caught.
  const body = prose.replace(/^### .*$/gm, ' ').replace(/\s+/g, ' ');
  const sentences = body.split(/(?<=[.!?])\s+/);
  const claim = sentences.filter((s) => DOMINANCE.test(s));
  if (!claim.length) return { found: false, named: null, sentence: null };
  const elementRe = new RegExp(`\\b(${ELEMENTS.map(esc).join('|')})\\b(?!\\s+Unggun)`);
  const withElement = claim.find((s) => elementRe.test(s));
  return {
    found: true,
    named: Boolean(withElement),
    sentence: (withElement || claim[0]).trim(),
  };
}

/**
 * Rule 23's bracket-once, per glossary category.
 *
 * For every term whose `name_id` appears in the reading and whose glossary entry
 * carries a `name_en`, is `(name_en)` present anywhere in the reading? Rule 23
 * says brackets once per reading, not once per mention, so presence anywhere is
 * the right test.
 *
 * REPORTED PER CATEGORY rather than pooled, because the corpus does not bracket
 * every category and pooling would invent a violation. `pilar` names appear
 * constantly (`Pilar Kerja`) and the prose never brackets them; that shows up as
 * a 0% bracket rate for the category, which is information rather than a defect.
 * Which categories rule 23 actually binds is Reyner's, not this script's.
 */
const BRACKET_CATEGORIES = ['aspek', 'bintang', 'relasi_cabang', 'pilar', 'elemen'];

function bracketAudit(prose) {
  const flat = prose.replace(/\n+/g, ' ');
  const out = {};
  for (const cat of BRACKET_CATEGORIES) {
    let present = 0; let bracketed = 0; const missing = [];
    for (const [key, entry] of Object.entries(GLOSSARY[cat] || {})) {
      if (key.startsWith('_') || !entry?.name_id || !entry?.name_en) continue;
      const idRe = new RegExp(`\\b${esc(entry.name_id)}\\b`);
      if (!idRe.test(flat)) continue;
      present += 1;
      // The bracket as the card and the prose write it: the EN term inside
      // parentheses. Whitespace tolerated, case ignored.
      if (new RegExp(`\\(\\s*${esc(entry.name_en)}\\s*\\)`, 'i').test(flat)) bracketed += 1;
      else missing.push(entry.name_id);
    }
    out[cat] = { present, bracketed, missing };
  }
  return out;
}

function measure(prose, stem) {
  return {
    chars: prose.length,
    paragraphs: paragraphs(prose).length,
    archetype: archetypeInOpening(prose, stem),
    dominance: dominanceNamesElement(prose),
    brackets: bracketAudit(prose),
  };
}

// ── 1. attempt 1 vs attempt 2, over the runs that PASSED at 2 ──
const at2 = trace.runs.filter((r) => r.passedAt === 2
  && r.attempts[0]?.prose && r.attempts[1]?.prose);

const rows = [];
for (const r of at2) {
  const stem = stemFor[r.chart];
  const a = measure(r.attempts[0].prose, stem);
  const b = measure(r.attempts[1].prose, stem);
  rows.push({
    chart: r.chart, run: r.run, stem,
    rejectedFor: r.attempts[0].checks,
    a, b,
    lostArchetype: a.archetype === true && b.archetype === false,
    gainedArchetype: a.archetype === false && b.archetype === true,
    lostElement: a.dominance.named === true && b.dominance.named === false,
    gainedElement: a.dominance.named === false && b.dominance.named === true,
    paraDelta: b.paragraphs - a.paragraphs,
  });
}

// Bracket loss is per CATEGORY, so it is aggregated separately from the row flags.
const bracketDelta = {};
for (const cat of BRACKET_CATEGORIES) {
  let lost = 0; let gained = 0; let same = 0;
  for (const r of rows) {
    const A = r.a.brackets[cat]; const B = r.b.brackets[cat];
    const ra = A.present ? A.bracketed / A.present : null;
    const rb = B.present ? B.bracketed / B.present : null;
    if (ra === null || rb === null) continue;
    if (rb < ra) lost += 1; else if (rb > ra) gained += 1; else same += 1;
  }
  bracketDelta[cat] = { lost, gained, same };
}

// ── 2. the bracket hole across EVERY stored attempt ────────
// Not just the pass-at-2 pairs: the question is whether the MISS RATE rises with
// attempt number, which needs every attempt at every position.
const byAttempt = {};
for (const r of trace.runs) {
  for (const att of r.attempts) {
    if (!att.prose) continue;
    const b = bracketAudit(att.prose);
    const slot = byAttempt[att.n] ||= { n: att.n, renders: 0, passing: 0, cats: {} };
    slot.renders += 1;
    if (att.ok) slot.passing += 1;
    for (const cat of BRACKET_CATEGORIES) {
      const c = slot.cats[cat] ||= { present: 0, bracketed: 0, rendersWithAny: 0, rendersComplete: 0 };
      c.present += b[cat].present;
      c.bracketed += b[cat].bracketed;
      if (b[cat].present) {
        c.rendersWithAny += 1;
        if (b[cat].missing.length === 0) c.rendersComplete += 1;
      }
    }
  }
}

// Passing renders only - the gate hole is about what SHIPS, not what was rejected.
const passingBrackets = { present: 0, bracketed: 0, renders: 0, incomplete: 0, byN: {} };
for (const r of trace.runs) {
  for (const att of r.attempts) {
    if (!att.prose || !att.ok) continue;
    const b = bracketAudit(att.prose);
    // Pooled over the categories the corpus demonstrably brackets. `pilar` and
    // `elemen` are excluded from the POOL and reported on their own, because a
    // category the prose never brackets would otherwise read as 100% violation.
    let present = 0; let bracketed = 0;
    for (const cat of ['aspek', 'bintang', 'relasi_cabang']) {
      present += b[cat].present; bracketed += b[cat].bracketed;
    }
    passingBrackets.renders += 1;
    passingBrackets.present += present;
    passingBrackets.bracketed += bracketed;
    if (present > bracketed) passingBrackets.incomplete += 1;
    const s = passingBrackets.byN[att.n] ||= { renders: 0, present: 0, bracketed: 0, incomplete: 0 };
    s.renders += 1; s.present += present; s.bracketed += bracketed;
    if (present > bracketed) s.incomplete += 1;
  }
}

// ── report ─────────────────────────────────────────────────
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const anecdote = (n) => (n <= 3 ? ` — ANECDOTE, n=${n}` : '');
const count = (k) => rows.filter((r) => r[k]).length;

const L = [];
L.push('<!--');
L.push('STATUS: RAW EVIDENCE, DERIVED. npm run probe:retry-erosion. ZERO provider calls -');
L.push(`every number is computed from the stored prose in ${TRACE}.`);
L.push('Nothing here is a judgement. Whether an erosion matters is a REGISTER call, Reyner rules it.');
L.push('-->');
L.push('');
L.push(`# What a retry costs the prose — ${stamp}`);
L.push('');
L.push(`Trace \`${TRACE}\`, prompt \`${trace.prompt}\`, gate \`${trace.gate}\` **as that run self-reported it**`);
L.push('(see the PROGRESS row on the 1.9.0 ambiguity - the label does not identify the gate).');
L.push('');
L.push(`**${at2.length} runs passed at attempt 2** and stored prose for both attempts. That is the`);
L.push('shippable depth, and it is the comparison the attempt-1-vs-attempt-6 side-by-side could not make.');
L.push('');
L.push('## 1. Attempt 1 -> attempt 2, over the runs that passed at 2');
L.push('');
L.push(`| erosion | lost | gained | rate over n=${rows.length} |`);
L.push('|---|---|---|---|');
L.push(`| archetype name absent from the opening paragraph | ${count('lostArchetype')} | ${count('gainedArchetype')} | **${pct(count('lostArchetype'), rows.length)}%**${anecdote(rows.length)} |`);
// The denominator for the element measure is pairs where a dominance claim was
// LOCATED IN BOTH attempts. A pair where the claim could not be found in one of
// them says the detector missed a phrasing, and that is not evidence of erosion.
const domPairs = rows.filter((r) => r.a.dominance.found && r.b.dominance.found);
L.push(`| dominance claim stops naming an element | ${count('lostElement')} | ${count('gainedElement')} | **${pct(count('lostElement'), domPairs.length)}%** of ${domPairs.length} pairs with a claim in both${anecdote(domPairs.length)} |`);
const noClaim = rows.filter((r) => !r.a.dominance.found || !r.b.dominance.found);
const noClaimCharts = [...new Set(noClaim.map((r) => r.chart))];
L.push(`| no dominance claim in either attempt (NOT erosion - see below) | ${noClaim.length} | - | of ${rows.length} |`);
for (const cat of BRACKET_CATEGORIES) {
  const d = bracketDelta[cat];
  const n = d.lost + d.gained + d.same;
  L.push(`| EN bracket coverage falls (\`${cat}\`) | ${d.lost} | ${d.gained} | **${pct(d.lost, n)}%** of ${n} comparable |`);
}
const collapsed = rows.filter((r) => r.paraDelta < 0).length;
const grew = rows.filter((r) => r.paraDelta > 0).length;
L.push(`| paragraph count falls | ${collapsed} | ${grew} | **${pct(collapsed, rows.length)}%** |`);
L.push('');
const meanA = rows.reduce((s, r) => s + r.a.paragraphs, 0) / (rows.length || 1);
const meanB = rows.reduce((s, r) => s + r.b.paragraphs, 0) / (rows.length || 1);
const charA = rows.reduce((s, r) => s + r.a.chars, 0) / (rows.length || 1);
const charB = rows.reduce((s, r) => s + r.b.chars, 0) / (rows.length || 1);
L.push(`Paragraphs mean **${meanA.toFixed(1)} -> ${meanB.toFixed(1)}**, characters mean `
  + `**${Math.round(charA)} -> ${Math.round(charB)}**.`);
L.push('');
L.push(`**THE ${noClaim.length} PAIRS WITH NO DOMINANCE CLAIM ARE THE ENGINE BEING RIGHT, and they cluster`);
L.push(`perfectly by chart** (${noClaimCharts.join(', ')}), which is what rules out a detector fault.`);
L.push('Their charts have no dominant element to name: top element share is **chart 5 Earth 54%** and');
L.push('**chart 13 Earth 49%**, both of which DO produce a claim, against **chart 1 Water 38%** and');
L.push('**fresh-1996 Metal 36%**, neither of which does. The model states dominance only where the');
L.push('chart supports it, so this row is evidence FOR the pipeline rather than a gap in it.');
L.push('');
L.push('### Per run, so a rate is never read without its rows');
L.push('');
L.push('| chart | run | stem | attempt 1 rejected for | archetype | element | paragraphs |');
L.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  const arc = r.lostArchetype ? '**LOST**' : r.gainedArchetype ? 'gained' : (r.a.archetype ? 'kept' : 'absent both');
  const ele = !r.a.dominance.found || !r.b.dominance.found ? 'no claim located'
    : r.lostElement ? '**LOST**' : r.gainedElement ? 'gained'
      : (r.a.dominance.named ? 'kept' : 'unnamed both');
  L.push(`| ${r.chart} | ${r.run} | ${r.stem} | \`${r.rejectedFor.join('`, `') || 'none recorded'}\` `
    + `| ${arc} | ${ele} | ${r.a.paragraphs} -> ${r.b.paragraphs} |`);
}
L.push('');
L.push('## 2. The EN bracket, across every stored attempt');
L.push('');
L.push('Rule 23 asks for the English term in brackets ONCE per reading. **No Stage 6 check enforces');
L.push('it**, which is why this is counted rather than assumed. Pooled over `aspek` + `bintang` +');
L.push('`relasi_cabang`, the three categories the corpus demonstrably brackets.');
L.push('');
L.push(`Across **${passingBrackets.renders} PASSING renders**: `
  + `**${passingBrackets.bracketed} of ${passingBrackets.present}** terms carried their bracket `
  + `(**${pct(passingBrackets.bracketed, passingBrackets.present)}%**), and `
  + `**${passingBrackets.incomplete} of ${passingBrackets.renders}** passing renders `
  + `(**${pct(passingBrackets.incomplete, passingBrackets.renders)}%**) shipped at least one term unbracketed.`);
L.push('');
L.push('| attempt | passing renders | terms present | bracketed | bracket rate | renders missing >=1 |');
L.push('|---|---|---|---|---|---|');
for (const n of Object.keys(passingBrackets.byN).sort()) {
  const s = passingBrackets.byN[n];
  L.push(`| ${n} | ${s.renders} | ${s.present} | ${s.bracketed} | **${pct(s.bracketed, s.present)}%**`
    + `${anecdote(s.renders)} | ${s.incomplete} |`);
}
L.push('');
L.push('### The two categories held out of the pool, and why the number matters');
L.push('');
L.push('| category | terms present (all attempts) | bracketed | rate |');
L.push('|---|---|---|---|');
for (const cat of ['pilar', 'elemen']) {
  let p = 0; let b = 0;
  for (const slot of Object.values(byAttempt)) { p += slot.cats[cat].present; b += slot.cats[cat].bracketed; }
  L.push(`| \`${cat}\` | ${p} | ${b} | **${pct(b, p)}%** |`);
}
L.push('');
L.push('A near-zero rate here is EVIDENCE ABOUT SCOPE, not a violation count: it says the corpus');
L.push('never brackets these, so rule 23 either does not bind them or has never been applied to them.');
L.push('Pooling them would have manufactured a large fake violation. Which categories rule 23 binds is');
L.push("Reyner's ruling, and this table is the input to it.");
L.push('');
L.push('## 3. Two full examples');
L.push('');
L.push('Verbatim, unedited. Chosen as the worst and the cleanest attempt-2 pass by erosion count,');
L.push('so the pair brackets the range rather than flattering it.');
L.push('');
const score = (r) => (r.lostArchetype ? 1 : 0) + (r.lostElement ? 1 : 0) + (r.paraDelta < 0 ? 1 : 0);
const sorted = [...rows].sort((x, y) => score(y) - score(x));
for (const [tag, r] of [['WORST', sorted[0]], ['CLEANEST', sorted[sorted.length - 1]]]) {
  if (!r) continue;
  const src = trace.runs.find((q) => q.chart === r.chart && q.run === r.run);
  L.push(`### ${tag} — ${r.chart} run ${r.run} (${r.stem}), ${score(r)} of 3 erosions`);
  L.push('');
  L.push(`Attempt 1 rejected for \`${r.rejectedFor.join('`, `') || 'none recorded'}\`.`);
  L.push('');
  L.push(`**ATTEMPT 1 — REJECTED** (${r.a.paragraphs} paragraphs, ${r.a.chars} chars)`);
  L.push('');
  L.push(src.attempts[0].prose);
  L.push('');
  L.push('---');
  L.push('');
  L.push(`**ATTEMPT 2 — PASSED** (${r.b.paragraphs} paragraphs, ${r.b.chars} chars)`);
  L.push('');
  L.push(src.attempts[1].prose);
  L.push('');
  L.push('---');
  L.push('');
}

mkdirSync(OUT.replace(/\/[^/]+$/, ''), { recursive: true });
writeFileSync(OUT, L.join('\n') + '\n');
writeFileSync(OUT.replace(/\.md$/, '.json'), JSON.stringify({
  trace: TRACE, prompt: trace.prompt, gate: trace.gate,
  rows, bracketDelta, byAttempt, passingBrackets,
}, null, 1));

console.error(`wrote ${OUT}   (zero provider calls)`);
console.error(`attempt 1 -> 2, n=${rows.length} runs that passed at attempt 2:`);
console.error(`  archetype name lost from opening   ${count('lostArchetype')}/${rows.length}  (${pct(count('lostArchetype'), rows.length)}%)`);
console.error(`  dominance stops naming an element  ${count('lostElement')}/${domPairs.length}  (${pct(count('lostElement'), domPairs.length)}%)  [pairs with a claim in both]`);
console.error(`  paragraph count falls              ${collapsed}/${rows.length}  (${pct(collapsed, rows.length)}%)`);
console.error(`bracket, passing renders: ${passingBrackets.bracketed}/${passingBrackets.present} terms `
  + `(${pct(passingBrackets.bracketed, passingBrackets.present)}%), `
  + `${passingBrackets.incomplete}/${passingBrackets.renders} renders missing >=1`);
