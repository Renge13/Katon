import 'server-only';
// SERVER ONLY. Recomputes the chart from a stored row and assembles CLIENT-SAFE
// payloads. CRITICAL: the returned objects NEVER include birth_date/birth_time or
// any other raw input — only server-derived, client-appropriate content.

import { calculateBaziChart } from '@/lib/bazi';
import { resolveElementVariant } from '@/lib/chart';
import { getFreeContent, getTeaser, getPaidDomain, getArchetype } from '@/lib/content';

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
const ELEMENT_ID = { Wood: 'Kayu', Fire: 'Api', Earth: 'Bumi', Metal: 'Logam', Water: 'Air' };
const DOMAINS = ['hubungan', 'karier', 'rezeki'];

function chartFromRow(row) {
  return calculateBaziChart({ birthDate: row.birth_date, birthTime: row.birth_time || null });
}

/** Client-safe free bits derived from an in-memory chart. */
export function freeViewFromChart(chart, domain) {
  const stem = chart.day.stem;
  const variant = resolveElementVariant(chart);
  const freeContent = getFreeContent(stem, variant, domain, {
    harmonyBranches: chart.harmonyBranches,
    clashBranches: chart.clashBranches,
  });
  const teaser = domain ? getTeaser(stem, domain) : null;
  return { freeContent, teaser };
}

/** GET /[id] payload — always safe (free + bridge + teaser). No birth data. */
export function buildFreeView(row) {
  const chart = chartFromRow(row);
  const { freeContent, teaser } = freeViewFromChart(chart, row.domain);
  return { token: row.id, domain: row.domain, paid: row.paid === true, freeContent, teaser };
}

/** Four Pillars for the post-pay legitimacy reveal. hour omitted if no birth_time. */
export function buildPillars(chart) {
  const p = (label, pillar) => pillar
    ? { label, stem: pillar.stem, branch: pillar.branch, element: pillar.element, elementId: ELEMENT_ID[pillar.element] }
    : null;
  return {
    tahun: p('Tahun', chart.year),
    bulan: p('Bulan', chart.month),
    hari: p('Hari', chart.day),          // Day Master pillar
    jam: chart.hasHourPillar ? p('Jam', chart.hour) : null,
    hasHour: chart.hasHourPillar,
  };
}

/** Element balance bars for the reveal. */
export function buildElementBars(chart) {
  const b = chart.elementBalance || {};
  const max = Math.max(1, ...ELEMENTS.map((e) => b[e] || 0));
  return ELEMENTS.map((e) => ({
    element: e,
    label: ELEMENT_ID[e],
    value: b[e] || 0,
    pct: Math.round(((b[e] || 0) / max) * 100),
  }));
}

/**
 * GET /[id]/full payload when paid===true. Paid domain content + the full chart
 * legitimacy reveal + the other two domains as locked-but-visible upsell.
 * Caller MUST have verified row.paid === true before calling this.
 */
export function buildFullView(row) {
  const chart = chartFromRow(row);
  const stem = chart.day.stem;
  const paidContent = getPaidDomain(stem, row.domain);
  const archetype = getArchetype(stem);

  const otherDomains = DOMAINS.filter((d) => d !== row.domain).map((d) => {
    const dd = archetype?.paidDomains?.[d];
    return dd ? { domain: d, title: dd.title, subtitle: dd.subtitle, locked: true } : null;
  }).filter(Boolean);

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
    otherDomains,
  };
}
