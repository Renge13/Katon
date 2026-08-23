import 'server-only';
// ============================================================
// Mirror row -> chart -> semantic JSON
// ============================================================
// The one place the mirror route turns a stored `reading` row back into the
// Stage 3 input. Both the serve path and the feedback path start here, so the
// chart a reading is served from and the chart its feedback is attributed to
// cannot drift apart.
//
// ── WHY THIS DUPLICATED lib/readingView.js#chartFromRow ────
// It no longer does, because that file is GONE - retired with the `contents/*.md`
// path at the 2026-08-23 promotion. The note is kept because it records why the
// duplication was correct while both existed: importing the legacy view layer here
// would have pulled `lib/content`, the deprecated hand-authored cells, into the
// mirror route's bundle - precisely the code path prompt J existed to replace. So
// the replay rules below were duplicated rather than the import, and when the other
// copy was deleted this one needed no change. That is the argument for duplicating a
// rule across a boundary you intend to delete, and it is worth keeping.
// ============================================================

import { calculateBaziChart } from '../bazi/buildChart.js';
import { buildSemanticJson, cacheKey } from '../semantic/index.js';

/**
 * Recompute the chart from a stored row.
 *
 * `term_side` MUST be replayed: on a 節 day with no birth time the user resolved
 * which side of the solar term they were born on, and dropping the answer would
 * hand a revisit a different month pillar than the one they answered for.
 * `gender` is replayed for completeness — it touches luck-pillar direction only
 * and cannot change the natal chart.
 */
export function chartFromRow(row) {
  return calculateBaziChart({
    birthDate: row.birth_date,
    birthTime: row.birth_time || null,
    termSide: row.term_side || null,
    gender: row.gender || null,
  });
}

/**
 * Chart + semantic JSON + the CURRENT cache key for a stored row.
 *
 * The key is recomputed rather than read off the row on purpose: ENGINE_VERSION
 * is hashed into it, so after a bump the stored key names last engine's text and
 * this one names the text that should be served now. The row's column is then
 * refreshed to match (lib/readingStore.js#setReadingCacheKey).
 */
export function semanticFromRow(row) {
  const chart = chartFromRow(row);
  const semanticJson = buildSemanticJson(chart);
  return { chart, semanticJson, key: cacheKey(semanticJson) };
}
