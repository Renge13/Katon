import 'server-only';
// PHASE 2 SEAM.
//
// In Phase 2 this is replaced by the real port of `src/lib/bazi/`: it will run
// calculateBaziChart({ birthDate, birthTime }) and derive, server-side:
//   - dayMaster: the Day Master stem (甲乙丙丁戊己庚辛壬癸) → selects the content file
//   - elementVariant: the resolved missing/dominant element key (e.g. 'missing_wood')
//     → selects which `elementNote` variant applies
//   - (also the chart-specific harmony/clash branches + element composition for
//      the energy bars, which the free content surfaces)
//
// For Phase 1 it returns Reyner's reference chart (丙 / missing_wood) so the
// secure architecture is demonstrable end-to-end before the calculator lands.
// element_variant is resolved HERE (server-side) and persisted on the row, per
// the locked architecture — it is never accepted from the client.

export function computeChartInputs({ birthDate, birthTime = null }) {
  // TODO(Phase 2): real calculation. Until then, the reference chart.
  void birthDate;
  void birthTime;
  return {
    dayMaster: '丙',
    elementVariant: 'missing_wood',
  };
}
