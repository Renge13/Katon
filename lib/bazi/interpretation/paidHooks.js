// ============================================================
// Paid hook — the closing line on the free card
// ============================================================
// This is the most strategically important fragment. Per the
// bazi-interpreter skill:
//   "The paid hook opens a loop, never closes one."
//   BAD:  "Tahun ini adalah tahun yang baik untuk karier kamu."
//   GOOD: "Ada satu pergeseran yang sedang terjadi di chart
//          kamu sekarang — yang memengaruhi cara rezekimu
//          mengalir. Apakah kamu ingin tahu kapan waktunya?"
//
// 2–3 sentences. Ends in a question. Does NOT promise a specific
// prediction — opens an unanswered question. Female-coded
// audience, real life-stakes (career / relationship / finance /
// timing).
//
// AVAILABLE PLACEHOLDERS (replaced at compose time):
//   {dayMasterName}      e.g. "Matahari"
//   {dominantElement}    e.g. "Wood" — you'd map to Indonesian
//                        upstream if you want it interpolated as
//                        "Kayu" etc.; keeping it raw lets the
//                        copy decide whether to mention element
//                        by name at all.
//
// MVP SCOPE: 1 templated hook. Expand to per-(DayBranch ×
// DominantElement) later if you want more variation.
// ============================================================

export const PAID_HOOK_TEMPLATE = ''
