import 'server-only';
// SERVER ONLY. Recomputes the chart from a stored row and assembles CLIENT-SAFE
// payloads. CRITICAL: the returned objects NEVER include birth_date/birth_time or
// any other raw input — only server-derived, client-appropriate content.

import { calculateBaziChart } from '@/lib/bazi';
import { resolveState } from '@/lib/chart';
import { getFreeContent, getTeaser, getPaidDomain, getArchetype } from '@/lib/content';

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ELEMENT_ID = { Wood: 'Kayu', Fire: 'Api', Earth: 'Bumi', Metal: 'Logam', Water: 'Air' };
const DOMAINS = ['hubungan', 'karier', 'uang'];
const DOMAIN_LABEL = { hubungan: 'Hubungan', karier: 'Karier', uang: 'Uang' };

function chartFromRow(row) {
  return calculateBaziChart({ birthDate: row.birth_date, birthTime: row.birth_time || null });
}

/** Client-safe free bits derived from an in-memory chart. State is recomputed
 *  deterministically from the chart (same birthdate → same state). */
export function freeViewFromChart(chart, domain) {
  const stem = chart.day.stem;
  const state = resolveState(chart);
  const freeContent = getFreeContent(stem, state, domain);
  const teaser = domain ? getTeaser(stem, state, domain) : null;
  return { freeContent, teaser, chart: freeChartView(chart, stem) };
}

/** The chart shown in the FREE reading: neutral, DESCRIPTIVE data only (pillars +
 *  element-bar RATIOS). No raw counts, no birth data, no interpretive/prescriptive
 *  copy — all of that stays paid. See CLAUDE.md (free chart boundary). */
export function freeChartView(chart, stem = chart.day.stem) {
  const archetype = getArchetype(stem);
  return {
    archetypeName: archetype?.archetypeName,
    dayMasterChinese: archetype?.dayMasterChinese,
    dayMasterElement: chart.day.element,
    dayMasterPolarity: chart.day.polarity,
    pillars: buildPillars(chart),
    elementBars: buildElementBars(chart),
  };
}

/** GET /[id] payload — always safe (free + bridge + teaser + neutral chart). No birth data. */
export function buildFreeView(row) {
  const chart = chartFromRow(row);
  const { freeContent, teaser, chart: chartView } = freeViewFromChart(chart, row.domain);
  return { token: row.id, domain: row.domain, paid: row.paid === true, freeContent, teaser, chart: chartView };
}

/** Four Pillars for the post-pay legitimacy reveal. hour omitted if no birth_time. */
export function buildPillars(chart) {
  const p = (label, pillar, isDayMaster = false) => pillar
    ? {
        label, stem: pillar.stem, branch: pillar.branch,
        element: pillar.element, elementId: ELEMENT_ID[pillar.element],
        polarity: pillar.polarity,
        ...(isDayMaster ? { isDayMaster: true } : {}),
      }
    : null;
  return {
    tahun: p('Tahun', chart.year),
    bulan: p('Bulan', chart.month),
    hari: p('Hari', chart.day, true),    // Day Master pillar
    jam: chart.hasHourPillar ? p('Jam', chart.hour) : null,
    hasHour: chart.hasHourPillar,
  };
}

/** Element balance bars. RATIOS ONLY: `pct` is normalized to the max element so
 *  the fill width conveys dominant/thinnest. The raw weighted `value` is
 *  deliberately NOT included so the counts never leave the server. */
export function buildElementBars(chart) {
  const b = chart.elementBalance || {};
  const max = Math.max(1, ...ELEMENTS.map((e) => b[e] || 0));
  return ELEMENTS.map((e) => ({
    element: e,
    label: ELEMENT_ID[e],
    pct: Math.round(((b[e] || 0) / max) * 100),
  }));
}

/**
 * GET /[id]/full payload when paid===true. Paid domain content + the full chart
 * legitimacy reveal + the other two domains as "segera" demand-capture rows.
 * Caller MUST have verified row.paid === true before calling this.
 */
export function buildFullView(row) {
  const chart = chartFromRow(row);
  const stem = chart.day.stem;
  const state = resolveState(chart);
  const paidContent = getPaidDomain(stem, state, row.domain);
  const archetype = getArchetype(stem);

  // The non-purchased domains are "segera" (coming soon) rows: tapping captures a
  // WhatsApp number + which domain was wanted. CAPTURE ONLY — no paid copy here.
  const segeraDomains = DOMAINS.filter((d) => d !== row.domain).map((d) => ({
    domain: d,
    label: DOMAIN_LABEL[d],
    segera: true,
  }));

  return {
    token: row.id,
    paid: true,
    domain: row.domain,
    paidContent,
    chart: {
      archetypeName: archetype?.archetypeName,
      dayMasterChinese: archetype?.dayMasterChinese,
      dayMasterElement: archetype?.dayMasterElement,
      pillars: buildPillars(chart),
      elementBars: buildElementBars(chart),
    },
    segeraDomains,
  };
}
