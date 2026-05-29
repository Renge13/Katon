// ============================================================
// BaZi Library — Main Export
// ============================================================
// Usage:
//   import { calculateBaziChart } from '@/lib/bazi';
//
//   const chart = calculateBaziChart({
//     birthDate: '1990-03-15',   // YYYY-MM-DD
//     birthTime: '14:30',        // HH:MM in WIB — omit if unknown
//   });
// ============================================================

export { calculateBaziChart, runValidation } from './calculator.js';
export { STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
         getHarmonyBranches, getClashBranches } from './stems.js';
export { getBaziMonth, SOLAR_TERMS_CST, MONTH_BRANCHES } from './solarTerms.js';
export { getInterpretation } from './interpretation/index.js';
export { getSelarasPemicuStems, ELEMENT_STEMS } from './elementCycle.js';
export { ELEMENT_CONFIG } from './elementConfig.js';
export { getReport } from './report/composer.js';
