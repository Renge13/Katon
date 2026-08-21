// ============================================================
// Engine output -> the fields a card renders
// ============================================================
// PURE. No React, no DOM, no I/O — so `node --test` can assert the ruled shape
// without rendering anything, and so the same data feeds Card A and Card B.
//
// THE ENGINE OWNS EVERY FACT HERE (rule 14). This module SELECTS and FORMATS; it
// decides nothing true. Every string it emits is either a locked glossary value
// or something the engine already computed and ranked.
//
// ── THE RULED SHAPE (2026-08-01 sharecard-spec, 2026-08-03 sizes ruling) ──
//   headline   TWO AXES: the Day Master archetype, then the Aspek beneath it.
//   Card A     head is `name_en` ONLY. No Indonesian archetype name, no ID
//              eyebrow. The Aspek stays Indonesian on BOTH cards.
//   tags       3 fixed per archetype + 3 dynamic from the chart's Aspek/badges.
//   footer     gender + birthdate + katon.app. Null gender renders date + source.
// ============================================================

// Through lib/semantic/glossary.js, not a second raw import: that module is the
// one door onto the content table, and a second reader is how two maps drift
// (its own header records exactly that happening with `lib/readingView.js`).
import { GLOSSARY, elementId } from '../semantic/glossary.js';

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// APPROVED 2026-08-03 (Reyner, register review done). Only these two forms, and
// only these spellings — the card footer is user-facing chrome and rule 20 applies.
const GENDER_LABEL = { female: 'PEREMPUAN', male: 'LAKI-LAKI' };

/** `1989-09-13` -> `13 Sep 1989`. Returns '' for a missing date, never a guess. */
export function formatCardDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const [y, m, d] = iso.split('-');
  const mi = parseInt(m, 10) - 1;
  if (!(mi >= 0 && mi < 12)) return iso;
  return `${parseInt(d, 10)} ${ID_MONTHS[mi]} ${y}`;
}

/**
 * The footer, which is the one place gender reaches a user.
 *
 * NULL GENDER IS A FIRST-CLASS CASE, not a degraded one: it renders date +
 * source and nothing else, with no placeholder and no gap where a word would be.
 * That is the 08-03 ruling and it is also the live state — the funnel does not
 * collect gender today (see the note in this file's spec section below).
 */
export function buildFooter({ gender, birthDate }) {
  const label = GENDER_LABEL[gender] || null;
  const date = formatCardDate(birthDate);
  const left = [label, date].filter(Boolean).join(' | ');
  return { gender: label, date, left, right: 'katon.app' };
}

/**
 * The three dynamic tags, most important first.
 *
 * NO RANKING HAPPENS HERE. Stage 3 emits `facts` already sorted by importance
 * (`lib/semantic/hierarchy.js`), so this filters and takes the head of the list.
 * Re-sorting would be the card second-guessing the engine, rule 14 inverted.
 *
 * ── NOTHING IN THE BADGE ROW MAY ALSO BE A TAG (fixed 2026-08-13) ──
 * The first version drew from Aspek AND Bintang while the badge row drew from
 * Bintang too, so a chart's Bintang printed twice on one card — once dimmed in
 * the tag row, once with its palace below. One fact, two places, and the tag row
 * exists to differentiate rather than to repeat.
 *
 * The exclusion is computed from the ACTUAL badge list, not by dropping the
 * `badge` fact type. The two are equivalent today because the badge row renders
 * every badge; they stop being equivalent the moment that row is capped, and the
 * version that survives a cap is the one that reads what is really on the card.
 *
 * `npm run measure:card-tags`, RE-RUN after the fix, 2026-08-13, 13-chart fixture:
 *   DISTINCT TAG SETS   13 of 13   — HELD. This is the number that mattered
 *   PENOLONG IN TOP 3    0 of 13   — was 2 of 13
 *   FEWER THAN 3 TAGS    2 of 13   — was 1 of 13. Charts 7 and 12
 *
 * Row 1 is the one the fix had to survive and it did: with Bintang excluded, the
 * Aspek alone still give every fixture chart a different triple, so the tag row
 * still does its differentiating job.
 *
 * Row 2 is now zero BY CONSTRUCTION rather than by ranking, so it has stopped
 * being evidence about the hierarchy and is kept only as a regression guard.
 *
 * ROW 3 IS THE COST, AND IT WAS PREDICTED WRONG BEFORE IT WAS RUN. This comment
 * first said "1 of 13, unchanged" — written from the pre-fix figure rather than
 * from a measurement. Chart 12 fell below three because two of its three tags had
 * been Bintang. So the dedupe buys a clean tag row and spends one more chart's
 * third slot. The card renders what exists rather than padding, because the
 * alternative is inventing a tag (rule 14) — but if this climbs as the fixture
 * grows, the ruled "3 dynamic" is the thing under pressure, not the dedupe.
 *
 * @param {object[]} facts   Stage 3 facts, importance-ordered
 * @param {object[]} [badges] what the badge row will render; excluded from tags
 */
export function dynamicTags(facts, badges = [], limit = 3) {
  const taken = new Set((badges || []).map((b) => b.label));
  return (facts || [])
    .filter((f) => (f.type === 'badge' || f.type === 'convergence') && f.label)
    .filter((f) => !taken.has(f.label))
    .slice(0, limit)
    .map((f) => f.label);
}

/** Every badge on the chart, with the glossary line that explains it (Card B). */
export function allBadges(facts) {
  return (facts || [])
    .filter((f) => f.type === 'badge' && f.label)
    .map((f) => {
      const key = f.id.startsWith('badge_') ? f.id.slice('badge_'.length) : null;
      const entry = key ? GLOSSARY.bintang?.[key] : null;
      return { label: f.label, meaning: entry?.label_meaning || null, palace: f.palace || null };
    });
}

/**
 * Everything both cards render, from one chart.
 *
 * @param {object} args
 * @param {object} args.chart        `calculateBaziChart` output
 * @param {object} args.semanticJson `buildSemanticJson(chart)` output
 * @param {string} [args.birthDate]  ISO date, for the footer only
 * @param {'male'|'female'|null} [args.gender]
 */
export function buildCardData({ chart, semanticJson, birthDate = null, gender = null }) {
  const core = semanticJson.core;
  const stem = core.day_master;
  // Built FIRST, because the tag row is defined as "not already in the badge row".
  const badges = allBadges(semanticJson.facts);

  return {
    stem,
    // Card A prints `nameEn` alone. `nameId` is carried for Card B and for the
    // reading, never rendered in Card A's head — the 08-03 ruling closed that.
    nameEn: core.archetype_name_en,
    nameId: core.archetype_name_id,
    element: core.element,
    // Axis two. `main_profile_display` is the glossary's locked Aspek name, e.g.
    // "Aspek Pengelola". The 08-01 and 08-03 mocks show a "Sang Pengelola" form,
    // which is an older draft and is NOT the locked naming (glossary-naming.md).
    aspek: core.main_profile_display,
    aspekBracket: core.main_profile_bracket,

    tags: {
      fixed: GLOSSARY.tag_arketipe?.[stem] || [],
      dynamic: dynamicTags(semanticJson.facts, badges),
    },

    // The recognition line, used VERBATIM (sharecard-spec, FIELD SOURCES).
    hook: GLOSSARY.salah_dikira?.[stem]?.line || null,

    badges,
    footer: buildFooter({ gender, birthDate }),

    // ── Card B only, the appendix that makes it a document ──
    appendix: {
      // THE FOUR PILLAR CHARACTERS STAY (ruled 2026-08-13). They are the
      // cross-checkable legitimacy object — the thing that lets a reader run her
      // birthdate through any other calculator and get the same eight characters
      // — and rule 23 keeps hanzi you can POINT AT while removing hanzi you must
      // READ. Each is therefore paired: element and polarity beneath the pair,
      // the branch's animal beneath that, so nothing is bare.
      pillars: ['year', 'month', 'day', 'hour'].map((k) => ({
        key: k,
        palace: semanticJson.chart.palaces?.[k] || null,
        ganzhi: semanticJson.chart[k] || null,
        stem: chart[k]?.stem || null,
        branch: chart[k]?.branch || null,
        animal: semanticJson.chart.animals?.[k] || null,
        // Indonesian, through the glossary door — `chart[k].element` is the
        // engine's English ("Fire"), and no user-facing surface prints that.
        element: chart[k]?.element ? elementId(chart[k].element) : null,
        polarity: chart[k]?.polarity || null,
        isDayMaster: k === 'day',
      })).filter((p) => p.ganzhi),
      elements: semanticJson.chart.element_presence,
      // 胎元 IS NOT HERE, ruled 2026-08-13: the ENGINE keeps computing it
      // (`chart.conceptionPalace`, 5/5 against Joey, still on the reading's own
      // chart block) and the CARD drops it. It earned its place on a chart sheet
      // a user cross-checks against Joey's, not on an object whose one job is to
      // travel. 命宮 was already absent and stays absent for a different reason —
      // no convention reproduces Joey better than 4/5 (D1b).
    },
  };
}
