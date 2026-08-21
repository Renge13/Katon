// ============================================================
// The Complete Edition PDF — the appendix (legend) generator
// ============================================================
// Prompt M build step 1. Pure data: chart + semantic JSON in, the USED SUBSET of
// the glossary out. No PDF, no layout, no fonts, so it is testable on its own -
// and prompt M calls it the piece most likely to be wrong.
//
// ── IT IS HER CHART, NOT THE GLOSSARY ──────────────────────
// The appendix explains the mechanics that appear in THIS chart. Chart 1 yields 22
// entries; the whole glossary is far larger. A legend that lists everything is a
// reference book, and the reader did not buy one.
//
// ── CORRECTION 1 (prompt M): A `label: null` FACT MUST NEVER BE NAMED ──
// Two of chart 1's facts carry `label: null` - `element_missing_Wood` and
// `element_dominant_Water`. A first draft printed their `label_bracket`, so a paid
// Indonesian document said "Missing Wood" and "Dominant Officer". A second draft
// "fixed" it by inventing `Kayu yang Hilang`. BOTH ARE WRONG, and the repo already
// says so in two places:
//
//   lib/render/fallback.js  "A `label: null` fact is a CONDITION (a missing element
//                            is not something you carry) and naming it is the exact
//                            failure the prompt calls out. Preserved, never
//                            substituted."
//   lib/validate/fact.js    `fact.condition_named` - a HARD reject when
//                            `label_bracket` appears for such a fact.
//
// `fact.condition_named` HARD is what floored chart 5 at attempt 2 in Reyner's
// 08-19 read. The first draft did by hand exactly what that gate exists to stop the
// model doing.
//
// So a condition carries its ruled `label_meaning` and `name: null`, and it is
// excluded from `carried` - the "what is in your chart" list - because that list is
// things she CARRIES. A missing element is not one.
//
// ── CORRECTION 2 (prompt M, ruled by Reyner 2026-08-20) ────
// The ship gate asserts that every mechanic contributes a MEANING. It is
// indifferent to whether that mechanic has a NAME. Written the naive way - "every
// mechanic must have a legend entry with a name" - the gate would force correction
// 1's bug, which is why `assertEveryMechanicExplained` tests `meaning` and never
// `name`.
//
// ── NOTHING IS HAND-TYPED THAT EXISTS AS DATA ──────────────
// Pillar names come from `glossary.pilar.<k>.name_id`. Cowork's draft hand-typed
// "Pilar Leluhur"; the glossary says "Pilar Akar". Every name and every meaning in
// the output is a glossary string, so this file authors no Indonesian - CLAUDE.md
// makes Reyner the sole authority on register, and a word invented here would be
// unreviewed user-facing copy shipped under an engine commit.
// ============================================================

import { GLOSSARY } from '../semantic/glossary.js';

/**
 * Which field carries a section's explanation. Most sections say `label_meaning`;
 * `shio` says `trait` and carries no `label_meaning` at all, so reading one field
 * everywhere silently produced three EMPTY Shio entries - caught by correction 2's
 * gate on the very first run, which is exactly what that gate is for.
 */
const MEANING_FIELD = { shio: 'trait' };
const meaningOf = (section, entry) => entry?.[MEANING_FIELD[section] ?? 'label_meaning'] ?? '';

/**
 * Group order, ruled in prompt M. Groups with no entries for a chart are dropped,
 * never rendered empty.
 */
export const GROUP_ORDER = [
  'Aspek',
  'Bintang',
  'Elemen dan Kekuatan',
  'Relasi Cabang',
  'Pilar',
  'Shio',
  'Pilar Konsepsi',
];

// ── 胎元 IS DISPLAY ONLY, AND PROMPT M'S LINE IS NOT SHIPPED ──
// Prompt M supplies a descriptive 胎元 sentence and says to ship it without waiting
// for Reyner. IT IS NOT SHIPPED HERE, because a standing ruling of his says not to,
// and a build prompt written by Cowork does not overrule him. `glossary.json`
// -> `pilar.conception._note`, ruled 2026-08-07:
//
//   "It has NO label_meaning on purpose: nothing downstream interprets it, and
//    inventing one would be unreviewed interpretive copy. Ruled by Reyner
//    2026-08-07, replacing the hand-authored 'Istana Konsepsi' that lived in
//    lib/readingView.js and in no glossary entry."
//
// So the line prompt M hands over is the exact thing that ruling removed once
// already: authored Indonesian living in code and in no glossary entry. Prompt M's
// group name was "Istana Konsepsi" too - the very string the ruling replaced with
// "Pilar Konsepsi", which is what GROUP_ORDER now uses.
//
// 胎元 therefore appears with its glossary NAME and `display_only: true`, carrying no
// meaning and exempt from correction 2's gate. It is a chart-page item that Joey
// also prints, not a mechanic being explained, so a legend of meanings owes it none.
// When Reyner writes a `label_meaning` for `pilar.conception`, this entry starts
// carrying it and the exemption stops applying, with no code change here.

/** `己巳` -> `巳`. The branch is the second character of a pillar string. */
const branchOf = (pillar) => (typeof pillar === 'string' && pillar.length >= 2 ? pillar[1] : null);

/**
 * Which glossary entry a fact came from, derived from the fact's own id and
 * provenance rather than from its label.
 *
 * WHY NOT MATCH ON THE LABEL: a condition fact has no label, and those are exactly
 * the two entries correction 1 is about. The id carries the glossary key for every
 * keyed fact, so the join is structural.
 *
 * @returns {{group: string, section: string, key: string}|null}
 */
function sourceOf(fact) {
  const id = fact.id;
  const kind = fact.provenance?.kind;

  // Aspek. Three kinds resolve here: the convergences, the main profile, and the
  // coherence rule - all three render an `Aspek <name>` label.
  const conv = /^aspek_convergence_(.+)$/.exec(id);
  if (conv) return { group: 'Aspek', section: 'aspek', key: conv[1] };
  if (kind === 'month_branch_rooting' || kind === 'coherence_rule') {
    const key = Object.keys(GLOSSARY.aspek)
      .find((k) => GLOSSARY.aspek[k]?.name_id === fact.label);
    return key ? { group: 'Aspek', section: 'aspek', key } : null;
  }

  // Bintang. Badges are keyed in the id; a void stack is 空亡.
  const badge = /^badge_(.+)$/.exec(id);
  if (badge) return { group: 'Bintang', section: 'bintang', key: badge[1] };
  if (id.startsWith('void_stack')) return { group: 'Bintang', section: 'bintang', key: '空亡' };

  // Elemen dan Kekuatan.
  if (kind === 'day_stem') {
    const key = Object.keys(GLOSSARY.elemen)
      .find((k) => GLOSSARY.elemen[k]?.name_id === fact.label);
    return key ? { group: 'Elemen dan Kekuatan', section: 'elemen', key } : null;
  }
  const strength = /^strength_(weak|balanced|strong)$/.exec(id);
  if (strength) {
    return { group: 'Elemen dan Kekuatan', section: 'kekuatan', key: strength[1] };
  }
  if (kind === 'element_absent') {
    // `provenance.element` is the INDONESIAN name ("Kayu") and `elemen_hilang` is
    // keyed by hanzi. The join goes through glossary.elemen rather than a private
    // table, so it cannot drift from the names Reyner ruled.
    const key = hanziForElementId(fact.provenance?.element);
    return key ? { group: 'Elemen dan Kekuatan', section: 'elemen_hilang', key } : null;
  }
  if (kind === 'element_dominant') {
    const key = fact.provenance?.relation_to_day_master;
    return key ? { group: 'Elemen dan Kekuatan', section: 'elemen_dominan', key } : null;
  }

  // Relasi Cabang. The relation type sits between the two underscores.
  const rel = /^relation_([^_]+)_/.exec(id);
  if (rel) return { group: 'Relasi Cabang', section: 'relasi_cabang', key: rel[1] };

  return null; // palaces and seats are covered by the Pilar group, from the chart
}

/** `Kayu` -> `木`, by asking the glossary rather than by a private table. */
function hanziForElementId(elementId) {
  if (!elementId) return null;
  return Object.keys(GLOSSARY.elemen)
    .find((k) => GLOSSARY.elemen[k]?.name_id === elementId) ?? null;
}

/**
 * Build the appendix for one chart.
 *
 * @param {Object} args
 * @param {Object} args.chart output of calculateBaziChart
 * @param {Object} args.semanticJson Stage 3 output
 * @returns {{
 *   groups: Array<{group: string, entries: Array<{
 *     key: string, section: string, name: string|null, meaning: string,
 *     fact_id: string|null, condition: boolean,
 *   }>}>,
 *   carried: string[],
 *   count: number,
 * }} `carried` is the "what is in your chart" list - NAMES only, conditions
 *   excluded, because that list is things she carries.
 */
export function buildAppendix({ chart, semanticJson }) {
  const byGroup = new Map(GROUP_ORDER.map((g) => [g, []]));
  const seen = new Set();

  const push = (group, entry) => {
    const dedupe = `${entry.section}.${entry.key}`;
    if (seen.has(dedupe)) return;
    seen.add(dedupe);
    byGroup.get(group).push(entry);
  };

  // ── from her facts ──
  for (const fact of semanticJson.facts || []) {
    const src = sourceOf(fact);
    if (!src) continue;
    const entry = GLOSSARY[src.section]?.[src.key];
    if (!entry) continue;

    // CORRECTION 1. A condition carries its meaning and NO name - not the
    // `label_bracket` the first draft printed, and not an invented Indonesian one.
    const condition = fact.label === null;
    push(src.group, {
      key: src.key,
      section: src.section,
      name: condition ? null : (entry.name_id ?? fact.label ?? null),
      meaning: meaningOf(src.section, entry),
      fact_id: fact.id,
      condition,
    });
  }

  // ── from her chart: the four pillars, always present ──
  for (const position of ['year', 'month', 'day', 'hour']) {
    if (position === 'hour' && semanticJson.hour_known !== true) continue;
    const entry = GLOSSARY.pilar?.[position];
    if (!entry) continue;
    push('Pilar', {
      key: position,
      section: 'pilar',
      name: entry.name_id,
      meaning: meaningOf('pilar', entry),
      fact_id: null,
      condition: false,
    });
  }

  // ── Shio, one per distinct branch actually in her chart ──
  for (const position of ['year', 'month', 'day', 'hour']) {
    const branch = branchOf(semanticJson.chart?.[position]);
    const entry = branch ? GLOSSARY.shio?.[branch] : null;
    if (!entry) continue;
    push('Shio', {
      key: branch,
      section: 'shio',
      name: entry.name_id,
      meaning: meaningOf('shio', entry),
      fact_id: null,
      condition: false,
    });
  }

  // ── Pilar Konsepsi. 胎元 is on the CHART and not in the semantic JSON, which is
  // why this generator takes both - the same arrangement buildCardData uses. See the
  // note above GROUP_ORDER for why it ships display-only and carries no meaning.
  if (chart?.conceptionPalace) {
    const entry = GLOSSARY.pilar?.conception;
    if (entry) {
      push('Pilar Konsepsi', {
        key: 'conception',
        section: 'pilar',
        name: entry.name_id,
        meaning: meaningOf('pilar', entry),
        fact_id: null,
        condition: false,
        display_only: true,
      });
    }
  }

  const groups = GROUP_ORDER
    .map((group) => ({ group, entries: byGroup.get(group) }))
    .filter((g) => g.entries.length > 0);

  return {
    groups,
    // NAMES ONLY, AND NO CONDITIONS. See correction 1.
    carried: groups.flatMap((g) => g.entries.filter((e) => !e.condition).map((e) => e.name)),
    count: groups.reduce((n, g) => n + g.entries.length, 0),
  };
}

/**
 * CORRECTION 2's gate. Refuses to ship when a mechanic in her chart contributes no
 * MEANING. Deliberately indifferent to whether it has a NAME: demanding a name for
 * every mechanic is what forces correction 1's bug.
 *
 * @param {Object} appendix output of buildAppendix
 * @throws {Error} naming every unexplained entry at once
 */
export function assertEveryMechanicExplained(appendix) {
  const unexplained = appendix.groups
    .flatMap((g) => g.entries.map((e) => ({ ...e, group: g.group })))
    // A `display_only` entry is not a mechanic being explained - 胎元 is printed so a
    // cross-checking reader does not find it missing, and Reyner ruled on 2026-08-07
    // that it carries no meaning ON PURPOSE. Exempting it here is what keeps this
    // gate from forcing someone to invent one, which is the same shape of mistake
    // correction 2 exists to prevent for names.
    .filter((e) => !e.display_only)
    .filter((e) => !e.meaning || e.meaning.trim() === '');
  if (unexplained.length) {
    throw new Error('appendix: no label_meaning for '
      + unexplained.map((e) => `${e.group}/${e.section}.${e.key}`).join(', '));
  }
}
