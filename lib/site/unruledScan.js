// ============================================================
// THE ONE PLACE A SCANNABLE COPY SOURCE IS NAMED
// ============================================================
// `scripts/check-unruled-copy.mjs` refuses a production build while any copy
// bank still holds a `PENDING()` sentinel. Until 2026-09-08 it decided WHAT TO
// SCAN from a hand-written list, and that list was wrong three times in three
// days:
//
//   2026-09-05..07  COMPAT_COPY arrived with a sentinel; the gate scanned
//                   UPCOMING_COPY only and reported `OK No unruled copy in
//                   1 bank(s)` beside a live placeholder.
//   2026-09-08      GLOSSARY.kompatibilitas arrived with 59 placeholders; the
//                   gate reported `OK ... 2 bank(s)` and `exit 0`.
//   (and before all of them, COWORK-BRIEF row 46: the gate had never executed on
//   Vercel at all, because vercel.json ran `next build` and skipped the npm
//   lifecycle hook it lived in.)
//
// Each fix widened the list, and each left the same defect in place: **a gate
// that enumerates its subjects by name is blind to the next subject**, and the
// blindness is silent and reads as a pass.
//
// ── THE INVERSION ──────────────────────────────────────────
// The subjects now register INTO the gate. `lib/site/copy.js` calls
// `register()` at each bank's definition site, so a new `*_COPY` export is
// scanned because it exists rather than because someone remembered. A spec
// reflects over the module and fails if any `*_COPY` export is missing from
// `COPY_BANKS`, which is the assertion that makes this structural instead of a
// fourth widening.
//
// ── THE GLOSSARY IS STILL NAMED BY HAND, AND THAT IS DELIBERATE ──
// It is engine content, not a copy bank, and it cannot register itself into a
// site module without inverting the dependency the wrong way. Only the
// `kompatibilitas` section is scanned: the rest is Reyner-reviewed content with
// no sentinel in it, and widening the scan to the whole document would make this
// gate's verdict depend on parts of it nobody is holding open. It belongs here
// at all because `lib/render/fallback.js` assembles the deterministic FLOOR out
// of those strings - an unruled cell is literally what a reader receives when
// the provider refuses, which is a stronger reason to gate it than any string in
// `copy.js`.
// ============================================================

import { COPY_BANKS } from './copy.js';
import GLOSSARY from '../../docs/content/glossary.json' with { type: 'json' };

/**
 * Every source the unruled-copy gate scans, keyed by the name it reports.
 *
 * The gate and its spec both enumerate THIS and neither names a bank.
 */
export const UNRULED_SOURCES = {
  ...COPY_BANKS,
  'GLOSSARY.kompatibilitas': GLOSSARY.kompatibilitas,
};
