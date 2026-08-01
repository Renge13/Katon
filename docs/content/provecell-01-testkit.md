<!--
STATUS: TEST KIT — created 2026-07-30. The prove-one-cell experiment (PROGRESS TODO: the gate that
        turns "how long to launch" from a guess into a number).
PURPOSE: test whether the Gemini renderer can turn engine JSON into prose that lands, BEFORE
        authoring content modules against it. Runs in ~1 hour, needs zero infra.
-->

# Prove-One-Cell #01 — Reyner's chart

## HOW TO RUN

1. Open Google AI Studio. Model: **Gemini 2.5 Flash-Lite**. Temperature **0.2**. Response type **JSON**.
2. System instructions = the whole of `KATON-master-prompt.md` (v2) above the `---`.
3. User message = the semantic JSON in §2 below, verbatim.
4. Run it **three times** without changing anything. Judge all three against §3.
5. Then run it once at temperature 0.0 and once at 0.7 to see the spread.

**Why three runs:** one output tells you nothing about consistency. If run 1 lands and runs 2–3 are
mush, the prompt is under-constrained, not working.

---

## 1. THE CHART (computed, not invented)

`1989-09-13 09:00` · tyme4ts + 流派2 provider · naive wall-clock

```
Year  己巳    Month 癸酉    Day  丙子    Hour 癸巳
Day Master: 丙 (Fire)          Month branch: 酉 (Metal)
```

| | Ten God |
|---|---|
| Year stem 己 | 傷官 |
| Month stem 癸 | **正官** |
| Hour stem 癸 | **正官** |
| Year branch 巳 | 丙 比肩 · 庚 偏財 · 戊 食神 |
| Month branch 酉 | 辛 **正財** ← canonical Main Profile source |
| Day branch 子 | 壬 **七殺** ← Spouse Palace |
| Hour branch 巳 | 丙 比肩 · 庚 偏財 · 戊 食神 |

**Element presence** (stems 1.0, hidden stems 60/30/10) — *display distribution, NOT a strength score*:

```
Water 3.00 (37.5%)  ██████████
Fire  2.20 (27.5%)  ███████
Metal 1.60 (20.0%)  █████
Earth 1.20 (15.0%)  ████
Wood  0.00 ( 0.0%)  —          ← MISSING
```

**The four loud facts, and why:**
- **Wood at absolute zero.** Extremity — maximum.
- **正官 twice in the stems, 七殺 in the Spouse Palace.** Convergence — Officer/authority pressure is
  the spine of this chart, not a footnote. This is the strongest signal in the whole reading.
- **Water is the largest presence and Water is what controls Fire.** The dominant element is the
  pressure, not the support.
- **比肩 appears twice** (both 巳 branches) against a 正財 Main Profile — this is the visible root of
  the Director 88 / Friend 85 tension Reyner confirms he lives ("I'm both"). CR-2 loud-alternative.

---

## 2. THE SEMANTIC JSON — paste this as the user message

> Hand-written to simulate Stage 3, which doesn't exist yet. **Scoped to the v1 fact set only** — no
> strength verdict, no seasonal bars, no favorable-element verdict, since the strength engine is
> parked. Testing the renderer against facts the engine won't have would be a fake test.
>
> `gift` / `cost` strings are **Claude scaffolding in a deliberately plain register** — they are
> engine facts, not prose. [REYNER] reword before you trust a marginal result. If they're weak
> Indonesian, a bad output tells you nothing.

```json
{
  "engine_version": "0.1.0-provecell",
  "target_language": "id",
  "hour_known": true,
  "quiet_chart": false,
  "boundary_flag": false,
  "core": {
    "day_master": "丙",
    "element": "Api",
    "archetype_key": "matahari",
    "main_profile": "正財",
    "main_profile_display": "The Steward"
  },
  "chart": {
    "year": "己巳", "month": "癸酉", "day": "丙子", "hour": "癸巳",
    "element_presence": { "Air": 37.5, "Api": 27.5, "Logam": 20.0, "Tanah": 15.0, "Kayu": 0.0 },
    "missing_element": "Kayu"
  },
  "facts": [
    {
      "id": "officer_convergence",
      "importance": 94,
      "type": "convergence",
      "gift": "Kamu otomatis jadi orang yang dipercaya megang aturan dan standar. Orang menaruh tanggung jawab ke kamu tanpa harus diminta.",
      "cost": "Rasa harus-benar itu nggak pernah libur. Kamu capek bukan karena kerjanya berat, tapi karena nggak pernah izin longgar."
    },
    {
      "id": "water_dominant_pressure",
      "importance": 88,
      "type": "extremity",
      "gift": "Kamu terlatih tenang di situasi yang bikin orang lain panik. Tekanan udah jadi cuaca harianmu.",
      "cost": "Apinya kebanyakan ketutup air. Semangatmu ada, tapi sering nggak nyala penuh karena kebanyakan hal harus diurus dulu."
    },
    {
      "id": "wood_missing",
      "importance": 82,
      "type": "extremity",
      "gift": "Kamu nggak butuh alasan besar buat mulai. Kamu jalan dari yang ada di depan mata.",
      "cost": "Nggak ada pemicu alami buat arah baru. Kalau nggak ada yang nyalain, kamu bisa lama banget di tempat yang sama padahal udah nggak cocok."
    },
    {
      "id": "spouse_palace_7k",
      "importance": 79,
      "type": "tension",
      "relational": true,
      "gift": "Kamu nggak tertarik sama hubungan yang gampang. Yang bikin kamu tumbuh justru orang yang berani nantangin kamu.",
      "cost": "Fondasi hubunganmu memang bertekstur. Gesekan di situ normal buat kamu, bukan tanda ada yang salah."
    },
    {
      "id": "steward_vs_selfreliant",
      "importance": 74,
      "type": "tension",
      "gift": "Kamu bisa ngurus dan bertahan sendiri. Dua-duanya beneran kamu, bukan kamu yang nggak konsisten.",
      "cost": "Ada tarik-menarik terus antara pengen dipercaya megang sesuatu dan pengen nggak diatur siapa-siapa."
    }
  ],
  "required_points": [
    "Inti diri: Api, dan gravitasinya",
    "Realitas lingkungan: tekanan aturan/tanggung jawab sebagai tema utama hidup",
    "Kayu nol dan apa artinya untuk memulai hal baru",
    "Fondasi hubungan terdekat bertekstur, dan itu bukan kegagalan",
    "Tarik-menarik antara The Steward dan sisi mandiri sebagai satu identitas, bukan inkonsistensi",
    "Penutup yang membuka, bukan menutup"
  ],
  "safety_flags": ["no_fatalism", "no_medical", "no_financial", "no_god_ranking"]
}
```

---

## 3. PASS / FAIL RUBRIC — decide before you read the output

Score each run. **Do not soften a fail because you like a sentence.**

### Hard gates — any single failure = FAIL, no discussion

- [ ] **No invented facts.** Every claim traceable to the JSON.
- [ ] **No contradiction** of a `gift`/`cost` string.
- [ ] **All 6 `required_points` present.**
- [ ] **No banned construction**: em-dash, "bukan X tapi Y", hedging inside a claim, rhetorical
      question, English leakage, emoji, meta.
- [ ] **No fatalism / prophecy / medical / financial / god-ranking.**
- [ ] **No bare Yin/Yang**, no raw percentages, no visible arithmetic.
- [ ] **Valid JSON**, correct keys.

### The real test — the one that decides whether the architecture works

- [ ] **RECOGNITION.** Reading `officer_convergence` and `steward_vs_selfreliant`, do you feel *seen*,
      or *described*? You confirm you're "both Director and Friend" — did it land that, or state it?
- [ ] **NOT FLAT.** Compare against the drafts in KATON-coldread-analysis.md. Is this materially
      better, or the same register with a different pipeline?
- [ ] **HIERARCHY HELD.** Does the Officer convergence (94) dominate, or did Wood-missing (82) steal
      the lead because zero is fun to write about?
- [ ] **ARRANGEMENT EARNED.** Did it choose an order that suits this chart, or default to the JSON's
      array order? Array order = it's slot-filling, and slot-filling is the register you're killing.
- [ ] **CONSISTENCY.** Are all three runs good, or one good and two mush?
- [ ] **VOICE.** Casual old-friend Indonesian, or baku pretending to be casual? [REYNER decides]

### Reading the result

| Outcome | Meaning | Next |
|---|---|---|
| Hard gates pass, recognition lands, 3/3 consistent | **Architecture works.** | Card content spec, then build Stage 3 for real. Estimates become real. |
| Hard gates pass, prose flat | **Prompt problem, not architecture.** | 2–3 prompt iterations. Cheap. |
| Hard gates pass, 1/3 good | **Under-constrained.** | Tighten prompt, lower temperature, add Stage-6 rules for what leaked. |
| Invents or contradicts facts | **Stage 6 is load-bearing, exactly as specced.** | Not a blocker. Note which guard caught it. |
| Flat across every prompt variation | **The renderer bet is wrong.** | Stop. Re-plan. This is the answer worth having in week 1 instead of week 9. |

**Cheap control worth running:** give Gemini the raw chart from §1 with no master prompt and no
gift/cost strings. If that output is roughly as good as the engineered one, your ~78 modules and
Stage 3 are buying less than assumed — and that finding is worth more than a passing test.
