import 'server-only';
// SERVER ONLY — this module re-exports paid content (`paidDomains`) and must
// never be imported by a Client Component. The client receives free content and
// teasers as JSON from route handlers; it never imports this module. The
// `server-only` guard makes a client import fail at build time, which is what
// keeps paid copy out of the browser bundle (locked decision #5).

import { bing } from './bing.js';

// Registry keyed by Day Master stem. Adding an archetype = add its file + a line.
const REGISTRY = {
  '丙': bing,
  // 甲 乙 丁 戊 己 庚 辛 壬 癸 — dropped in as their content files land.
};

export function getArchetype(stem) {
  return REGISTRY[stem] || null;
}

export function hasArchetype(stem) {
  return Boolean(REGISTRY[stem]);
}

/**
 * Client-SAFE free content for a reading. The route handler sends this as JSON.
 * Contains NO paid copy.
 *
 * @param opts.harmonyBranches / opts.clashBranches — chart-computed branches
 *   (per the user's actual day branch). When provided they override the content
 *   file's static reference branches, so the card shows the reader's real
 *   taggable people. On re-entry (GET /[id], no chart) the static ones stand in.
 */
export function getFreeContent(stem, elementVariant, domain, opts = {}) {
  const a = getArchetype(stem);
  if (!a) return null;
  const { harmonyBranches, clashBranches } = opts;
  const card = {
    ...a.card,
    ...(harmonyBranches ? { compatibleBranches: harmonyBranches } : {}),
    ...(clashBranches ? { clashBranches } : {}),
  };
  return {
    dayMasterChinese: a.dayMasterChinese,
    dayMasterElement: a.dayMasterElement,
    archetypeName: a.archetypeName,
    card,
    freeRead: a.freeRead,
    elementNote:
      a.elementNote?.[elementVariant] ?? a.elementNote?.balanced ?? null,
    // The matched bridge question (fires for the domain she picked). All three
    // are free, but the funnel shows only the matched one.
    bridgeQuestion: domain ? a.bridgeQuestions?.[domain] ?? null : null,
  };
}

/**
 * The teaser: first 1-2 sentences of the REAL domain reading, cut mid-sentence
 * on the `yangSebenernyaKejadian` (reframe) beat. Client-SAFE — it deliberately
 * stops before the payload. (Exact cut is tunable in Phase 3.)
 */
export function getTeaser(stem, domain) {
  const a = getArchetype(stem);
  if (!a) return null;
  const d = a.paidDomains?.[domain];
  if (!d) return null;
  const lead = firstSentences(d.polanya, 2);
  const reframeStart = midCut(firstSentences(d.yangSebenernyaKejadian, 1));
  return {
    title: d.title,
    subtitle: d.subtitle,
    text: [lead, reframeStart].filter(Boolean).join(' '),
  };
}

/**
 * Full paid domain content. SERVER-ONLY and GATED: the route handler calls this
 * ONLY after confirming row.paid === true. Returns the 5-beat structure plus the
 * shared closing line.
 */
export function getPaidDomain(stem, domain) {
  const a = getArchetype(stem);
  if (!a) return null;
  const d = a.paidDomains?.[domain];
  if (!d) return null;
  return { ...d, closing: a.paidClosing };
}

// ---- helpers ----

function splitSentences(text) {
  if (!text) return [];
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.?!])\s+/)
    .filter(Boolean);
}

function firstSentences(text, n) {
  return splitSentences(text).slice(0, n).join(' ');
}

/** Cut a sentence mid-way (~55% of words) and trail with an ellipsis. */
function midCut(sentence) {
  if (!sentence) return '';
  const words = sentence.replace(/[.?!]+$/, '').split(' ');
  const keep = Math.max(4, Math.ceil(words.length * 0.55));
  if (keep >= words.length) return sentence;
  return words.slice(0, keep).join(' ') + '…';
}
