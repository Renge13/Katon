# Katon BaZi Engine — Session State (detail file)

*Companion detail file under PROGRESS.md (which stays the top-level session-resume file). This drills into the engine work behind PROGRESS TODO #1. Pull this when resuming the strength-engine build. Written at the natural break where Phase 1 is complete and the next chapter (calculator swap → strength engine) begins.*

---

## THE ONE-PARAGRAPH REFRESHER

We started at TODO #1 ("reconcile the strength calc") and discovered the existing `resolveState` five-state model is **not a real BaZi strength model** — it's a five-way element-distribution classifier. That opened a foundational rebuild. We've now: locked the method spec, built and validated a 12-chart ground-truth table against Joey Yap, produced the full feature blueprint (living doc), and **completed Phase 1 of the engine** (pillars + Ten Gods + canonical profile + no-hour stability). The next work is: **swap the calculator to sxtwl (accuracy-critical), then build the strength engine** — which we discovered is the same computation that produces Joey's element bars and, downstream, the favorable element.

---

## METHODOLOGICAL FOUNDATION (locked, do not relitigate)

- **School: 旺衰法 (strength-balance), consistent with Joey Yap.** Joey's tool is the ground-truth validation reference and what users cross-check against. NOT classical 子平法. This is deliberate and documented. Adopt classical rigor only where it prevents a false/self-contradictory statement; ignore it where it's lineage-preference the consumer never perceives.
- **There is no single "true" BaZi.** Coherence + specificity + groundedness create depth, not orthodoxy.
- **Framing law:** Free mirror = "blueprint, not biography / pattern you carry, not fate." Paid tier = "predictive recognition with agency" (name the energy + default drift + agency pivot; never blunt-binary fatalism, which is falsifiable and a scale/trust risk).
- **Free = the Mirror** (everything about the SELF from one chart; deep, complete, the acquisition engine). **Paid = You vs the External** (compatibility; time-bound decisions; future relation axes). Free is NOT held shallow to save content for paid.

---

## PHASE 1 — COMPLETE (built this session, NOT yet committed)

| Task | Result | Notes |
|---|---|---|
| Pillars | **12/12 ✓** | incl. all edge cases: 早子/晚子 hour, 立春 year-rollover |
| Ten Gods | **12/12 ✓** | full derivation, self-consistent |
| Track A canonical Main Profile | **7/12 — CORRECT** | see below; NOT a bug |
| No-hour stability (DM + Profile) | **12/12 ✓** | |
| Track B presence-tally | **thrown away** | wrong model — see Key Discovery |

**Files added/changed (engine core + tests only, nothing committed):**
- `lib/bazi/calculator.js` — pillars (hand-rolled; TO BE REPLACED by sxtwl, see blocker)
- `lib/bazi/tenGods.js` (new) — Ten Gods derivation
- `lib/bazi/mainProfile.js` (new) — Track A. **Revelation set = Year+Month stems only** (excludes DM stem and hour stem — this enforces hour-independence and fixed chart 9's no-hour flip; keep this)
- `lib/bazi/computeChart.js` (new) — `computeChart(date, time|null)` entry point
- `tests/bazi-validation.fixture.js` — the 12-chart ground truth
- `tests/bazi-engine.report.mjs` — the 7-task report runner

**Why Track A is 7/12 and that's the right answer:** Charts 3, 7, 8 draw their Joey headline from a Ten God that is **physically not in the month branch** (辰 has no 甲; 午 has no Water; 子 has only 壬). No month-rooting rule can emit them. Charts 4, 10 are main-qi-vs-revealed rule tensions. This is the **intended Katon-vs-Joey divergence**: Joey uses a two-source headline tiebreak (structural OR strength-dominant); Katon's canonical profile is **month-branch structural only**. We chose NOT to reproduce Joey's proprietary tiebreak. Chart 9 (the discriminator) passes → 正財, hour-stable. Do NOT chase 12/12 on Track A.

---

## KEY DISCOVERY (changes the whole next phase)

**Joey's 10-profile element bars are a SEASONAL ELEMENT-STRENGTH distribution, not a Ten-God token count.** Proven with two inversions:
- Chart 1: expected top 正財 (Wealth=Metal, born 酉 Metal month, Metal strong) — token-tally wrongly tops 比肩 (Fire tokens many). Strength high, tokens few → inversion.
- Chart 9: expected top 食神 (Output=Fire) — token-tally wrongly tops 正財 (Earth tokens everywhere). Seasonally live, token-sparse → inversion.

No reweighting fixes a token-vs-strength inversion. **Therefore: the strength engine = the element bars = (downstream) the favorable element. ONE computation, THREE outputs.** This collapses the old "Phase 2" — the strength model isn't separate from the bars, it IS the bars. And it hands us a **second validation oracle**: the strength engine must reproduce both (a) the strong/weak verdict and (b) Joey's bar RANK ORDER.

---

## OPEN BLOCKER — CALCULATOR (decision made, needs execution)

**Decision (locked, against the "no compromise on calculator accuracy" rule): swap in sxtwl.**
The Phase 1 pillars run on a **hand-rolled calculator** (sxtwl wasn't in the repo). It passed 12/12 including edge cases — but that proves 12 dates, not the ~full set of solar-term boundaries across all user birth-years. The strength engine's 得令 (seasonal command — the single heaviest factor) depends **entirely** on a correct Month Branch at those boundaries. "Probably correct at boundaries" violates the no-compromise rule.

**Action for next session:**
1. Add sxtwl (confirm the right form for Next.js/Vercel: JS port, WASM build, or server-side bridge — canonical sxtwl is C++/Python).
2. Rebuild pillars on sxtwl.
3. Diff sxtwl vs hand-rolled across a broad solar-term boundary sweep (every 節氣 transition for a sample of years). Agreement validates; disagreement → sxtwl wins, latent bug caught.
4. Only then build the strength engine on top.

---

## NEXT PHASE — THE STRENGTH ENGINE (the real TODO #1)

After the calculator is on sxtwl. Build per the method spec (companion artifact "BaZi Day Master Strength & Ten Gods spec"):
- Four factors: 得令 (month/season command, heaviest ~40%), 得地 (rooting), 得生 (Resource/印 support), 得勢 (Companion/比劫 allies).
- Support side (比劫 + 印) vs drain side (食伤 + 財 + 官殺); normalized support share → strong / balanced / weak.
- `strength_confidence`: flag charts within ±5pts of the threshold as low-confidence (method-dependent).
- **Follow-chart (從格) detection as a strict high-threshold gate** (rootless + one force ≥~90% + no rescue). Rare; must not be a casual third bucket or it false-positives. Detection only this phase; interpretation deferred.
- Outputs: (a) strength verdict, (b) element bars (validate rank-order vs Joey's fixture), (c) downstream favorable element.
- Then wire CR-2 loud-alternative detection + LOUD_MARGIN to read THIS model (not the dead token tally), and calibrate MARGIN by hand against the 12 charts — Reyner's own chart (Director 88 / Friend 85, he confirms he's "both") is the anchor calibration case.

---

## INTERPRETATION-LAYER RULES ALREADY LOCKED (for when reading-gen is built)

- **Pull power = cumulative dopamine meter**, not per-fact score. Facts are PEAK (wave-makers) or BUILD-UP. Hierarchy engine SEQUENCES facts into a narrative arc (setup → rising action → peak + open loop), it doesn't rank by isolated score. Free read must feel COMPLETE, missing exactly one dimension (timing/second chart). Curiosity converts, not anxiety.
- **Renderer principle:** engine emits ranked facts + required content points; the LLM arranges FREELY; Stage-6 validates content coverage, NEVER structural conformance. NO fixed templates / slot-assembly (that produces the word-salad register we're killing). The 3-paragraph example is illustrative, not a spec.
- **CR-1** Profile-vs-favorable tension → "name the tension as identity" ("your gift and your cost are the same current"). TRIGGER ONLY when profile element is unfavorable OR profile Ten God contradicts the strength verdict. Don't force on harmonious charts.
- **CR-2** Loud-alternative Ten God (anti-mistype): if a non-profile god is within LOUD_MARGIN of the profile in the strength tally, name the internal argument. Same scoring as the bars (no second tally).
- **CR-3** Missing Element must be tagged favorable/unfavorable/neutral before copy.
- **CR-4** Career/lifestyle = Favorable Element × Profile, never element alone.
- **CR-5** "Weak" banned as consumer word → lean/adaptive/context-driven.
- **CR-6** Symbolic stars always read through their Palace (life-domain) context.

## CALCULATION-ANCHOR RULES (real bugs, for the star-catalog phase)
- Symbolic stars have exact anchor formulas (Peach Blossom off Year/Day Branch trine; Nobleman off Day/Year Stem; etc.) — not "flags on a pillar."
- Yang Blade (羊刃) ONLY for Yang stems (甲→卯, 丙/戊→午, 庚→酉, 壬→子); Yin stems have none.
- 12 Life Stages computed from Day Master against each branch, not intrinsic to branch.
- Void (空亡) from Day pillar's 10-day cycle, branch-level.

---

## PROFILE DISPLAY NAMES (locked)
比肩 The Self-Reliant · 劫財 The Mover · 食神 The Creator · 傷官 The Dazzler · 正財 The Steward · 偏財 The Trailblazer · 正官 The Keeper · 七殺 The Fighter · 正印 The Learner · 偏印 The Thinker. (Hanzi is internal key; Reyner is final authority on Indonesian rewording.)

---

## THE 12-CHART VALIDATION TABLE (ground truth, also in Claude's memory)
Format: date | time | DM | MonthBranch | MainProfile(hanzi) | MainStructure | top-3 bars
1  1989-09-13 09:00 | 丙 | 酉 | 正財 | Managers | Dir88/Friend85/Pioneer80  [Reyner]
2  1990-03-04 14:00 | 戊 | 寅 | 比肩 | Connectors | Friend87/Warrior83/Diplomat80
3  1992-04-20 08:00 | 丙 | 辰 | 偏印 | Thinkers | Phil98/Artist94/Analyzer80
4  1995-06-01 06:00 | 癸 | 巳 | 正財 | Creators | Dir83/Artist79/Leader64
5  1988-07-10 22:00 | 丙 | 未 | 傷官 | Creators | Perf100/Friend88/Artist82
6  1989-03-03 00:15 | 壬 | 寅 | 偏財 | Managers | Pio100/Artist83/Warrior63  [子-hour]
7  1993-06-12 23:30 | 甲 | 午 | 正印 | Creators | Analyzer85/Perf83/Artist76  [late子; day stays 12Jun 甲子, hour 丙子]
8  1992-01-05 08:00 | 庚 | 子 | 傷官 | Creators | Perf98/Phil64/Friend62
9  1990-08-07 10:00 | 甲 | 未 | 正財 | Creators | Artist98/Perf98/Dir95  [profile≠top bar — discriminator]
10 1985-02-04 12:00 | 甲 | 寅 | 偏財 | Managers | Pio87/Friend83/Artist82  [立春: Year=乙丑=prior sexagenary yr]
11 1991-01-10 04:00 | 庚 | 丑 | 正印 | Thinkers | Analyzer82/Perf80/Phil69
12 1990-06-07 12:00 | 癸 | 午 | 偏財 | Managers | Pio98/Warrior70/Artist52

---

## COMPANION ARTIFACTS
- BaZi Day Master Strength & Ten Gods method spec (the research doc) — the strength-engine build reference.
- Katon Full BaZi Feature Blueprint (living doc) — all tiers/markers, pull-power, free/paid, coherence rules.
- This handoff doc.

## HOW TO RESUME
1. Confirm/execute the sxtwl calculator swap + boundary diff (accuracy blocker — do first).
2. Commit Phase 1.
3. Draft/execute the strength-engine build prompt (validate vs verdict AND Joey bar rank-order).
4. Then: star catalog (with anchor rules) → hierarchy/dramaturgy engine → interpretation/renderer.
