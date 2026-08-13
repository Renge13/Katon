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
 * The three dynamic tags: the chart's own Aspek and Bintang, most important first.
 *
 * NO RANKING HAPPENS HERE. Stage 3 emits `facts` already sorted by importance
 * (`lib/semantic/hierarchy.js`), so this filters to the two tag-bearing fact
 * families and takes the head of the list. Re-sorting would be the card second-
 * guessing the engine, which is rule 14 inverted.
 *
 * Bintang Penolong (77% of charts) gets NO special case here, and that is a
 * decision with a measurement behind it rather than an omission. It scores low on
 * both extremity and convergence by construction, so the engine's own order
 * pushes it down on its own.
 *
 * `npm run measure:card-tags`, 2026-08-13, over the 13-chart fixture:
 *   DISTINCT TAG SETS   13 of 13   — the differentiation job is done
 *   PENOLONG IN TOP 3    2 of 13   — 15%, against a 77% prevalence
 *   FEWER THAN 3 TAGS    1 of 13   — chart 7, the thinnest chart in the fixture
 *
 * So the ranking demotes it without a filter, but not to zero. Adding one would
 * be a content ruling, not a tidy-up, and it is not taken here.
 *
 * NOTE THE THIRD ROW: the ruling says three dynamic tags and one chart in
 * thirteen can only supply two. The card renders what exists rather than padding
 * to three, because the alternative is inventing a tag — rule 14.
 */
export function dynamicTags(facts, limit = 3) {
  return (facts || [])
    .filter((f) => (f.type === 'badge' || f.type === 'convergence') && f.label)
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
      dynamic: dynamicTags(semanticJson.facts),
    },

    // The recognition line, used VERBATIM (sharecard-spec, FIELD SOURCES).
    hook: GLOSSARY.salah_dikira?.[stem]?.line || null,

    badges: allBadges(semanticJson.facts),
    footer: buildFooter({ gender, birthDate }),

    // ── Card B only, the appendix that makes it a document ──
    appendix: {
      // The eight characters, each paired with its Indonesian animal and element
      // so it is readable rather than decorative. This is the cross-checkable
      // legitimacy object, and it is deliberately absent from Card A.
      pillars: ['year', 'month', 'day', 'hour'].map((k) => ({
        key: k,
        palace: semanticJson.chart.palaces?.[k] || null,
        ganzhi: semanticJson.chart[k] || null,
        animal: semanticJson.chart.animals?.[k] || null,
        // Indonesian, through the glossary door — `chart[k].element` is the
        // engine's English ("Fire"), and no user-facing surface prints that.
        element: chart[k]?.element ? elementId(chart[k].element) : null,
        isDayMaster: k === 'day',
      })).filter((p) => p.ganzhi),
      elements: semanticJson.chart.element_presence,
      // 胎元 stays, 命宮 does not: two conventions score 4/5 and 3/5 against
      // Joey and neither is right (D1b). A wrong value in a legitimacy block is
      // worse than a missing one.
      conception: chart.conceptionPalace
        ? {
            label: 'Istana Konsepsi',
            ganzhi: `${chart.conceptionPalace.stem}${chart.conceptionPalace.branch}`,
            animal: chart.conceptionPalace.animal,
          }
        : null,
    },
  };
}
