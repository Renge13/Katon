// ============================================================
// Day Master Strength Engine (旺衰法)
// ============================================================
// The accuracy core. ONE computation with THREE outputs:
//   1. the strong / balanced / weak verdict
//   2. the element-strength distribution (Joey's bars)
//   3. the favorable element (downstream: colours, career, compatibility)
//
// School: 旺衰法 (strength-balance), locked. Joey Yap's tooling is the external
// validation oracle. Do NOT implement 子平法 or blend schools.
//
// WHY THE BARS LIVE HERE AND NOT IN buildElementBars()
// Joey's bars are a SEASONAL ELEMENT-STRENGTH distribution, not a Ten-God token
// count. A token tally provably inverts on fixture charts 1 and 9: chart 1 is
// token-rich in Fire but seasonally dead in it; chart 9 is token-sparse in Fire
// but seasonally live. No reweighting fixes a token-vs-strength inversion.
// `buildElementBars` in lib/readingView.js is element PRESENCE for display only.
// Different function, different name, different file. Never conflate them
// (CLAUDE.md rules 9 and 10).
//
// Every tunable lives in STRENGTH_PARAMS. There are no magic numbers below it,
// and there is no chart-specific branch anywhere in this file — a chart-specific
// branch in scoring code is a bug, not a calibration.
// ============================================================

import { STEM_ELEMENTS, STEM_POLARITY, HIDDEN_STEMS } from './stems.js';
import { tenGod } from './tenGods.js';

export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

/**
 * The slice of a calculateBaziChart result this engine reads. Structural rather
 * than an import of the whole chart type, so the engine states its own
 * dependencies and cannot silently start relying on more of the chart.
 */
export interface ChartPillar { stem: string; branch: string }
export interface StrengthChartInput {
  year: ChartPillar;
  month: ChartPillar;
  day: ChartPillar;
  /** null when the birth time is unknown — six characters are scored, not eight. */
  hour: ChartPillar | null;
}
export type Verdict = 'weak' | 'balanced' | 'strong';
export type Confidence = 'high' | 'low';
export type SeasonStage = 'prosperous' | 'supported' | 'resting' | 'trapped' | 'dead';

// ── Calibration knobs ──────────────────────────────────────
// THE primary tuning surface. Calibrate these against the fixture; never
// special-case a chart.

export const STRENGTH_PARAMS = {
  /**
   * 得令 seasonal multipliers (旺相休囚死), applied to every contributor by its
   * element's relationship to the month branch's ruling element. The heaviest
   * factor in the model.
   */
  season: {
    prosperous: 1.4, // 旺 — element rules the season
    supported: 1.2,  // 相 — element is produced by the season's ruler
    resting: 1.0,    // 休 — element produces the season's ruler
    trapped: 0.8,    // 囚 — element controls the season's ruler
    dead: 0.6,       // 死 — element is controlled by the season's ruler
  } satisfies Record<SeasonStage, number>,

  /** Base weight of one Heavenly Stem. Each branch distributes 1.0 across its hidden stems. */
  stemWeight: 1.0,

  /** supportShare thresholds. */
  verdict: {
    weakBelow: 40,
    strongAbove: 60,
  },

  /** supportShare within this many points of either threshold -> confidence 'low'. */
  confidenceMargin: 5,

  /** 從格: one force must reach this share of the drain side. */
  followDominanceShare: 0.90,

  /**
   * 從格: the month branch "supports" the dominant force when that force's
   * element scores at least this seasonally (i.e. 旺 or 相).
   */
  followSeasonSupportMin: 1.2,

  /**
   * How seasonal element strength is projected onto the ten Ten Gods.
   *
   * 'contributor-polarity' — session 1. Each contributor's mass goes wholly to
   *   the god implied by its OWN stem's polarity. Measured 0/13 exact order;
   *   structurally cannot produce Joey's tied pairs (chart 9 食神 98 / 傷官 98).
   *
   * 'pair-presence' — ruling A. Both gods of an element inherit the element's
   *   base, each modulated by how much its own stem appears in the chart.
   *
   * 'pair-polarity' — ruling A's stated fallback. Both gods inherit the base;
   *   the modulator is polarity match with the Day Master instead of presence.
   *
   * Kept as a switch rather than a replacement so before/after is attributable.
   */
  tenGodProjection: 'pair-presence' as 'contributor-polarity' | 'pair-presence' | 'pair-polarity',

  /**
   * 'pair-presence' blend. 1.0 = fully proportional to stem presence (ruling A
   * as literally written); 0.0 = both gods split the element base evenly.
   * Anything between is a gentler version of the same idea.
   */
  pairPresenceWeight: 1.0,

  /**
   * 'pair-polarity' share given to the god whose stem polarity MATCHES the Day
   * Master. 0.5 is an even split, i.e. pure pairing with no modulation.
   */
  pairPolarityWeight: 0.5,
};

/** The yang stem then the yin stem of each element. */
const STEMS_BY_ELEMENT: Record<Element, [string, string]> = {
  Wood: ['甲', '乙'],
  Fire: ['丙', '丁'],
  Earth: ['戊', '己'],
  Metal: ['庚', '辛'],
  Water: ['壬', '癸'],
};

// ── Five-element relations ─────────────────────────────────

const GENERATES: Record<Element, Element> = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' }; // 生
const CONTROLS: Record<Element, Element> = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };  // 克

export const ELEMENTS: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

/** Element that produces `el` (its Resource). */
const producerOf = (el: Element): Element => ELEMENTS.find((k) => GENERATES[k] === el)!;

/** The element ruling each month branch. 辰未戌丑 are the Earth months. */
const SEASON_RULER: Record<string, Element> = {
  寅: 'Wood', 卯: 'Wood',
  巳: 'Fire', 午: 'Fire',
  申: 'Metal', 酉: 'Metal',
  亥: 'Water', 子: 'Water',
  辰: 'Earth', 未: 'Earth', 戌: 'Earth', 丑: 'Earth',
};

/**
 * 旺相休囚死 stage of `element` in a season ruled by `ruler`.
 *
 * NOTE ON THE SPEC: the build brief calls this "the twelve-stage relationship"
 * but supplies a five-value table, and its five definitions are exactly
 * classical 旺相休囚死. Those definitions are implemented verbatim. They are a
 * DIFFERENT system from the 十二長生 twelve life stages — under 十二長生, 丙 in
 * 酉 is 死 (Death), whereas here Fire in a Metal season is 囚 (trapped, Fire
 * controls Metal). The brief's aside about chart 1 refers to the twelve-stage
 * system; it does not contradict this table. See the report notes.
 */
export function seasonStage(element: Element, ruler: Element): SeasonStage {
  if (element === ruler) return 'prosperous';          // 旺
  if (GENERATES[ruler] === element) return 'supported'; // 相 — produced BY the ruler
  if (GENERATES[element] === ruler) return 'resting';   // 休 — produces the ruler
  if (CONTROLS[element] === ruler) return 'trapped';    // 囚 — controls the ruler
  return 'dead';                                        // 死 — controlled by the ruler
}

/** SEASON_MULTIPLIER[monthBranch][element]. Derived once from STRENGTH_PARAMS. */
export function seasonMultiplier(monthBranch: string, element: Element): number {
  const ruler = SEASON_RULER[monthBranch];
  if (!ruler) throw new Error(`Unknown month branch "${monthBranch}"`);
  return STRENGTH_PARAMS.season[seasonStage(element, ruler)];
}

// ── 祿 (臨官) and 帝旺 branches, for 強根 vs 弱根 ─────────────
// Standard fixed table. The Yang-stem 帝旺 column is corroborated by the Yang
// Blade (羊刃) anchors recorded in docs/engine/engine-session-state.md
// (甲→卯, 丙/戊→午, 庚→酉, 壬→子); Yin stems run the twelve stages in reverse.
// This only sub-classifies a root as 強 or 弱 — the rooted BOOLEAN, which is
// what actually gates follow-chart detection, does not depend on it.
const LU_BRANCH: Record<string, string> = { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
const DI_WANG_BRANCH: Record<string, string> = { 甲: '卯', 乙: '寅', 丙: '午', 丁: '巳', 戊: '午', 己: '巳', 庚: '酉', 辛: '申', 壬: '子', 癸: '亥' };

// ── 三合 / 半合 trine combinations ──────────────────────────
// Groups per docs/engine/bazi-blueprint.md; the element is named by the peak
// (cardinal) member: 子 Water, 午 Fire, 酉 Metal, 卯 Wood.
const TRINES: { members: string[]; peak: string; element: Element }[] = [
  { members: ['申', '子', '辰'], peak: '子', element: 'Water' },
  { members: ['寅', '午', '戌'], peak: '午', element: 'Fire' },
  { members: ['巳', '酉', '丑'], peak: '酉', element: 'Metal' },
  { members: ['亥', '卯', '未'], peak: '卯', element: 'Wood' },
];

// ── Types ──────────────────────────────────────────────────

export interface Contributor {
  /** Where it came from, e.g. 'month.stem' or 'day.branch:辛'. */
  source: string;
  stem: string;
  element: Element;
  /** Raw weight before the seasonal multiplier. */
  raw: number;
  multiplier: number;
  /** raw x multiplier. */
  weighted: number;
  /** Ten God relative to the Day Master. */
  tenGod: string;
}

export interface Rooting {
  rooted: boolean;
  /** 臨官/祿 or 帝旺 branch present for the Day Master. */
  strongRoot: boolean;
  /** Root present only as a non-main hidden stem. */
  weakRoot: boolean;
  branches: string[];
  /** Roots pulled toward another element by a 半合/三合. */
  combinationRisk: { branch: string; into: Element; kind: '半合' | '三合' }[];
}

export interface FollowChart {
  detected: boolean;
  type?: string;
  /** 0..1 — how close the dominant force is to owning the drain side. Emitted even when not detected. */
  confidence?: number;
}

export interface Strength {
  supportShare: number;
  verdict: Verdict;
  confidence: Confidence;
  confidenceReasons: string[];
  followChart: FollowChart;
  /** Seasonal-weighted, normalised so the largest element is 100. */
  elementStrength: Record<Element, number>;
  /**
   * The same distribution projected onto the ten Ten Gods, normalised to 100.
   * NOT in the brief's return signature, but Oracle 2 validates bar RANK ORDER
   * against Joey's Ten God bars, so the projection has to be inspectable.
   */
  tenGodStrength: Record<string, number>;
  favorable: Element[];
  unfavorable: Element[];
  factors: { deLing: number; deDi: number; deSheng: number; deShi: number };
  /** True when the hour is unknown and only six characters were scored. */
  partial: boolean;
  contributors: Contributor[];
}

// ── Step 1 — enumerate weighted contributors ───────────────

function collectContributors(chart: StrengthChartInput, dayMaster: string, monthBranch: string): Contributor[] {
  const out: Contributor[] = [];
  const push = (source: string, stem: string, raw: number) => {
    const element = STEM_ELEMENTS[stem] as Element;
    const multiplier = seasonMultiplier(monthBranch, element);
    out.push({
      source, stem, element, raw, multiplier,
      weighted: raw * multiplier,
      tenGod: tenGod(dayMaster, stem).hanzi,
    });
  };

  const pillars: [string, ChartPillar][] = [['year', chart.year], ['month', chart.month], ['day', chart.day]];
  if (chart.hour) pillars.push(['hour', chart.hour]);

  for (const [pos, pillar] of pillars) {
    // Heavenly Stem — weight 1.0. The Day Master's own stem is included here
    // and lands on the SUPPORT side in Step 4; it is not excluded.
    push(`${pos}.stem`, pillar.stem, STRENGTH_PARAMS.stemWeight);

    // Earthly Branch — 1.0 distributed across hidden stems at their qi share.
    for (const { stem, weight } of HIDDEN_STEMS[pillar.branch] ?? []) {
      push(`${pos}.branch:${pillar.branch}`, stem, weight);
    }
  }
  return out;
}

// ── Step 7 — projecting element strength onto the ten Ten Gods ──

export const ALL_TEN_GODS = ['比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '七殺', '正印', '偏印'];

/**
 * The element a Ten God stands for, relative to a Day Master element.
 *
 * Each element maps to exactly two gods, one yin one yang, which is why ten
 * bars carry only five elements' worth of information. Summing a god pair
 * recovers that element's strength — that is how Joey's published bars can be
 * read as an element distribution.
 *
 * Exported so the fixture helpers and the calibration harness share one
 * definition instead of each keeping a copy.
 */
export function tenGodElement(dmElement: Element, god: string): Element {
  const resource = producerOf(dmElement);
  const officer = ELEMENTS.find((e) => CONTROLS[e] === dmElement)!;
  const table: Record<string, Element> = {
    比肩: dmElement, 劫財: dmElement,
    食神: GENERATES[dmElement], 傷官: GENERATES[dmElement],
    正財: CONTROLS[dmElement], 偏財: CONTROLS[dmElement],
    正官: officer, 七殺: officer,
    正印: resource, 偏印: resource,
  };
  const el = table[god];
  if (!el) throw new Error(`Unknown Ten God "${god}"`);
  return el;
}

/**
 * Distribute seasonal element strength across the ten Ten Gods.
 *
 * Joey publishes TEN bars but there are only FIVE elements, so each element maps
 * to exactly two gods — one yin, one yang. Chart 9's 食神 98 / 傷官 98 is an exact
 * tie between the two Fire gods, which a model that hands an element's whole
 * mass to one god by contributor polarity cannot produce at all. Hence the pair
 * modes.
 *
 * Total mass is conserved in every mode, so the modes are directly comparable.
 */
export function projectToTenGods(
  dayMaster: string,
  elementTotals: Record<Element, number>,
  contributors: Contributor[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of ALL_TEN_GODS) out[g] = 0;

  if (STRENGTH_PARAMS.tenGodProjection === 'contributor-polarity') {
    for (const c of contributors) out[c.tenGod] += c.weighted;
    return out;
  }

  // RAW presence per stem — deliberately NOT seasonally weighted. Ruling A
  // step 3 is "how much its OWN stem actually appears in the chart (stems at
  // 1.0, hidden stems at their qi share)", which is a presence quantity; the
  // seasonal weighting is already carried by the element base being modulated.
  const presence: Record<string, number> = {};
  for (const c of contributors) presence[c.stem] = (presence[c.stem] ?? 0) + c.raw;

  const dmPolarity = STEM_POLARITY[dayMaster];

  for (const element of ELEMENTS) {
    const base = elementTotals[element];
    if (base === 0) continue;
    const [yangStem, yinStem] = STEMS_BY_ELEMENT[element];

    let shareYang: number;
    if (STRENGTH_PARAMS.tenGodProjection === 'pair-presence') {
      const pYang = presence[yangStem] ?? 0;
      const pYin = presence[yinStem] ?? 0;
      const total = pYang + pYin;
      // An element can only have mass if one of its stems appears, so total is
      // normally > 0; the 0.5 guard is for completeness, not an expected path.
      const proportional = total === 0 ? 0.5 : pYang / total;
      const lambda = STRENGTH_PARAMS.pairPresenceWeight;
      shareYang = (1 - lambda) / 2 + lambda * proportional;
    } else {
      const w = STRENGTH_PARAMS.pairPolarityWeight;
      shareYang = STEM_POLARITY[yangStem] === dmPolarity ? w : 1 - w;
    }

    out[tenGod(dayMaster, yangStem).hanzi] += base * shareYang;
    out[tenGod(dayMaster, yinStem).hanzi] += base * (1 - shareYang);
  }
  return out;
}

// ── Step 3 — 得地, rooting (categorical gate, not a score) ──

function computeRooting(chart: StrengthChartInput, dayMaster: string): Rooting {
  const dmElement = STEM_ELEMENTS[dayMaster] as Element;
  const branches: string[] = [chart.year, chart.month, chart.day, chart.hour]
    .filter(Boolean).map((p) => (p as ChartPillar).branch);

  const rootBranches: string[] = [];
  let strongRoot = false;
  let weakRoot = false;

  for (const branch of branches) {
    const hidden = HIDDEN_STEMS[branch] ?? [];
    const idx = hidden.findIndex((h) => STEM_ELEMENTS[h.stem] === dmElement);
    if (idx === -1) continue;
    rootBranches.push(branch);
    if (branch === LU_BRANCH[dayMaster] || branch === DI_WANG_BRANCH[dayMaster]) strongRoot = true;
    else if (idx > 0) weakRoot = true;
    else weakRoot = true; // main-qi root that is neither 祿 nor 帝旺
  }

  // A root sitting in a trine that pulls it toward another element is exactly
  // the marginal case confidence is for (fixture chart 1: two 巳 roots, 巳酉 半合).
  const present = new Set(branches);
  const combinationRisk: Rooting['combinationRisk'] = [];
  for (const trine of TRINES) {
    if (trine.element === dmElement) continue;
    const hits = trine.members.filter((m) => present.has(m));
    const full = hits.length === 3;
    const half = hits.length === 2 && hits.includes(trine.peak);
    if (!full && !half) continue;
    for (const branch of hits) {
      if (rootBranches.includes(branch)) {
        combinationRisk.push({ branch, into: trine.element, kind: full ? '三合' : '半合' });
      }
    }
  }

  return { rooted: rootBranches.length > 0, strongRoot, weakRoot, branches: rootBranches, combinationRisk };
}

// ── Steps 4-8 ──────────────────────────────────────────────

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Compute Day Master strength from a chart produced by calculateBaziChart.
 *
 * @param chart output of lib/bazi/buildChart.js
 */
export function computeStrength(chart: StrengthChartInput): Strength {
  const dayMaster: string = chart.day.stem;
  const dmElement = STEM_ELEMENTS[dayMaster] as Element;
  const monthBranch: string = chart.month.branch;

  const contributors = collectContributors(chart, dayMaster, monthBranch);
  const partial = !chart.hour;

  // Element totals, seasonally weighted.
  const elementTotals: Record<Element, number> = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const c of contributors) elementTotals[c.element] += c.weighted;

  // Element strength is projection-independent; only the Ten God split changes
  // with the mode. That is what makes a mode change attributable.
  const tenGodTotals = projectToTenGods(dayMaster, elementTotals, contributors);

  // Step 4 — support vs drain, relative to the Day Master.
  const resourceEl = producerOf(dmElement);        // 印
  const outputEl = GENERATES[dmElement];           // 食伤
  const wealthEl = CONTROLS[dmElement];            // 財
  const officerEl = ELEMENTS.find((e) => CONTROLS[e] === dmElement)!; // 官殺

  const support = elementTotals[dmElement] + elementTotals[resourceEl];
  const drain = elementTotals[outputEl] + elementTotals[wealthEl] + elementTotals[officerEl];
  const supportShare = support + drain === 0 ? 0 : (support / (support + drain)) * 100;

  // Step 3
  const rooting = computeRooting(chart, dayMaster);

  // Step 5 — verdict
  const { weakBelow, strongAbove } = STRENGTH_PARAMS.verdict;
  const verdict: Verdict = supportShare < weakBelow ? 'weak' : supportShare > strongAbove ? 'strong' : 'balanced';

  const confidenceReasons: string[] = [];
  const m = STRENGTH_PARAMS.confidenceMargin;
  if (Math.abs(supportShare - weakBelow) <= m || Math.abs(supportShare - strongAbove) <= m) {
    confidenceReasons.push(`supportShare ${supportShare.toFixed(1)} is within ${m} of a threshold`);
  }
  if (!rooting.rooted && supportShare >= weakBelow) {
    confidenceReasons.push('Day Master is unrooted but supportShare is not weak');
  }
  for (const r of rooting.combinationRisk) {
    confidenceReasons.push(`root ${r.branch} pulled toward ${r.into} by ${r.kind}`);
  }
  const confidence: Confidence = confidenceReasons.length > 0 ? 'low' : 'high';

  // Step 6 — 從格, strict gate. ALL four conditions.
  const drainForces: { type: string; element: Element; total: number }[] = [
    { type: '從兒 (Output)', element: outputEl, total: elementTotals[outputEl] },
    { type: '從財 (Wealth)', element: wealthEl, total: elementTotals[wealthEl] },
    { type: '從殺 (Officer)', element: officerEl, total: elementTotals[officerEl] },
  ];
  const dominant = drainForces.reduce((a, b) => (b.total > a.total ? b : a));
  const dominanceShare = drain === 0 ? 0 : dominant.total / drain;
  const resourcePresent = elementTotals[resourceEl] > 0;
  const seasonBacksDominant = seasonMultiplier(monthBranch, dominant.element) >= STRENGTH_PARAMS.followSeasonSupportMin;

  const followDetected =
    !rooting.rooted &&
    dominanceShare >= STRENGTH_PARAMS.followDominanceShare &&
    !resourcePresent &&
    seasonBacksDominant;

  const followChart: FollowChart = {
    detected: followDetected,
    ...(followDetected ? { type: dominant.type } : {}),
    confidence: round1(dominanceShare * 100) / 100,
  };

  // Step 7 — projections, each normalised so the largest is 100.
  const normalise = <K extends string>(totals: Record<K, number>): Record<K, number> => {
    const max = Math.max(...Object.values<number>(totals), 0);
    const out = {} as Record<K, number>;
    for (const k of Object.keys(totals) as K[]) {
      out[k] = max === 0 ? 0 : round1((totals[k] / max) * 100);
    }
    return out;
  };
  const elementStrength = normalise(elementTotals);

  // Every Ten God appears, including absent ones at 0 — a missing key would
  // silently rank below a present zero and corrupt the bar comparison.
  const filledTenGods: Record<string, number> = {};
  for (const g of ALL_TEN_GODS) filledTenGods[g] = tenGodTotals[g] ?? 0;
  const tenGodStrength = normalise(filledTenGods);

  // Step 8 — favorable, ordered by scarcity (load-bearing: drives career + compatibility).
  const byScarcity = (a: Element, b: Element) => elementTotals[a] - elementTotals[b];
  let favorable: Element[];
  let unfavorable: Element[];
  if (verdict === 'weak') {
    favorable = [resourceEl, dmElement].sort(byScarcity);
    unfavorable = [officerEl, wealthEl, outputEl];
  } else if (verdict === 'strong') {
    favorable = [outputEl, wealthEl, officerEl].sort(byScarcity);
    unfavorable = [resourceEl, dmElement];
  } else {
    // Balanced: help whichever side is scarcer. Already flagged low-confidence.
    const supportSide = [resourceEl, dmElement];
    const drainSide = [outputEl, wealthEl, officerEl];
    const scarcer = support <= drain ? supportSide : drainSide;
    favorable = [...scarcer].sort(byScarcity);
    unfavorable = scarcer === supportSide ? drainSide : supportSide;
    if (!confidenceReasons.includes('balanced verdict')) confidenceReasons.push('balanced verdict');
  }

  // factors — inspectable by design: calibration depends on seeing which factor
  // drove a wrong verdict.
  const branchDmMass = contributors
    .filter((c) => c.element === dmElement && c.source.includes('.branch'))
    .reduce((s, c) => s + c.weighted, 0);

  return {
    supportShare: round1(supportShare),
    verdict,
    confidence: confidenceReasons.length > 0 ? 'low' : confidence,
    confidenceReasons,
    followChart,
    elementStrength,
    tenGodStrength,
    favorable,
    unfavorable,
    factors: {
      deLing: seasonMultiplier(monthBranch, dmElement),  // 得令 — seasonal command over the DM element
      deDi: round1(branchDmMass),                        // 得地 — rooting mass from branches
      deSheng: round1(elementTotals[resourceEl]),        // 得生 — Resource support
      deShi: round1(elementTotals[dmElement]),           // 得勢 — Companion allies
    },
    partial,
    contributors,
  };
}

/** Rooting detail, exported separately so QA can inspect the gate without re-running scoring. */
export function computeRootingFor(chart: StrengthChartInput): Rooting {
  return computeRooting(chart, chart.day.stem);
}
