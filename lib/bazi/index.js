// ============================================================
// BaZi Library — Main Export
// ============================================================
// Usage:
//   import { calculateBaziChart } from '@/lib/bazi';
//
//   const chart = calculateBaziChart({
//     birthDate: '1990-03-15',   // YYYY-MM-DD
//     birthTime: '14:30',        // HH:MM local wall clock — omit if unknown
//   });
//
// Solar-term math is NOT part of this surface. It lives entirely inside
// pillars.ts (tyme4ts / 寿星天文历). The old local SOLAR_TERMS_CST table,
// getBaziMonth, and their generator script are DELETED — a second, unvalidated
// source of truth for month boundaries is the exact bug class the tyme4ts swap
// removed. Do not reintroduce them.
// ============================================================

export { calculateBaziChart } from './buildChart.js';
export { computePillars } from './pillars.ts';
export { STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
         getHarmonyBranches, getClashBranches } from './stems.js';
export { getInterpretation } from './interpretation/index.js';
export { getSelarasPemicuStems, ELEMENT_STEMS } from './elementCycle.js';
export { ELEMENT_CONFIG } from './elementConfig.js';
export { getReport } from './report/composer.js';
