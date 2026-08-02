<!--
STATUS: HANDOVER ADDENDUM to D2-stage3.md. Created 2026-08-01.
Answers the three blockers Claude Code raised before writing Stage 3, plus two contract corrections
Claude Code did not ask for but needs.
D2 stands. This file OVERRIDES D2 wherever they conflict.
-->

# D2a — the anchor tables, and three corrections to D2

You stopped rather than build a Phase 1 that fails its own gate. That was right, and D2's Phase 1 table
was wrong: it said the whole inventory was "already computed by the engine" when five badge anchors did
not exist. That is spec error 9 and it is mine.

Here are the answers. Everything below is verified against Joey's plotter, not recalled.

---

## 1. THE FOUR ANCHOR TABLES — verified, use them

**All four key off the DAY pillar.** That was the real unknown, since the classical literature splits on
year-versus-day for three of these four, and it is now settled empirically with no dissent.

### How they were verified

Twelve charts driven through Joey's plotter, reading his printed `Personal Chart Details`. **60 of 60
values match. Zero failures.** The charts were chosen so that **every row of every table is exercised at
least once** — there are no unverified cells:

| Table | Keyed off | Coverage | Result |
|---|---|---|---|
| 天乙貴人 Nobleman | day STEM | **10/10 stems** | 12/12 |
| 文昌 Intelligence | day STEM | **10/10 stems** | 12/12 |
| 桃花 Peach Blossom | day BRANCH, trine group | **4/4 groups** | 12/12 |
| 驛馬 Sky Horse | day BRANCH, trine group | **4/4 groups** | 12/12 |
| 孤辰 Solitary | day BRANCH, season group | **4/4 groups** | 12/12 |

The year-pillar alternative was tested at the same time and scores **0/12** on Peach Blossom and Sky
Horse and **1/12** on Solitary. The discrimination is not marginal.

Charts used: fixture 1, 2, 5, 6, 7, 8, 12, 13, plus four off-fixture charts plotted purely to close
table rows the fixture cannot reach (`1989-03-01 00:15` 庚申, `1990-01-02 10:00` 丁卯,
`1990-01-04 10:00` 己巳, `1990-01-16 10:00` 辛巳). No fixture chart has a day branch in 巳酉丑 or a 辛
day master, which is why the off-fixture charts were necessary.

**Chart 7 is the load-bearing one.** It is born 23:30, so under 流派2 its day pillar is 甲子 rather than
癸亥. Joey's stars match the **流派2 day pillar**. The anchors therefore need no separate day-boundary
convention: feed them the same day pillar `buildChart` already produces.

### The tables

```js
// 天乙貴人 — Nobleman. Key: day stem. Value: TWO branches.
const NOBLEMAN = {
  甲: ['丑','未'], 戊: ['丑','未'], 庚: ['丑','未'],
  乙: ['子','申'], 己: ['子','申'],
  丙: ['亥','酉'], 丁: ['亥','酉'],
  壬: ['卯','巳'], 癸: ['卯','巳'],
  辛: ['寅','午'],
};

// 文昌 — Intelligence. Key: day stem. Value: ONE branch.
const INTELLIGENCE = {
  甲:'巳', 乙:'午', 丙:'申', 丁:'酉', 戊:'申',
  己:'酉', 庚:'亥', 辛:'子', 壬:'寅', 癸:'卯',
};

// 桃花 — Peach Blossom. Key: the trine group containing the DAY BRANCH.
const PEACH_BLOSSOM = {
  '申子辰':'酉', '巳酉丑':'午', '寅午戌':'卯', '亥卯未':'子',
};

// 驛馬 — Sky Horse. Key: the trine group containing the DAY BRANCH.
const SKY_HORSE = {
  '申子辰':'寅', '巳酉丑':'亥', '寅午戌':'申', '亥卯未':'巳',
};

// 孤辰 — Solitary. Key: the SEASON group containing the DAY BRANCH.
// NOTE this is a DIFFERENT grouping from the trines above. Do not reuse PEACH_BLOSSOM's keys.
const SOLITARY = {
  '亥子丑':'寅', '寅卯辰':'巳', '巳午未':'申', '申酉戌':'亥',
};
```

**A badge fires when its anchor branch appears among the four branches of the chart**, and it carries
the palace of every position it lands in. Nobleman has two anchor branches, so it can fire twice; the
sharecard spec already measures one chart in thirteen with 2 Penolong, so that path is real and must not
be collapsed to a boolean.

### Write it as a locked test, not just code

Add `tests/badge-anchors.spec.mjs` with the 12 charts above as a fixture and all 60 expected values
asserted. Same discipline as `tests/punishment.spec.mjs`, same reason: **the table is evidence, not
output.** If a future change makes it fail, the table is right and the change is wrong.

The 12 verified charts, day pillar and Joey's printed values:

| id | date, time | day pillar | 貴人 | 文昌 | 桃花 | 驛馬 | 孤辰 |
|---|---|---|---|---|---|---|---|
| C1 | 1989-09-13 09:00 | 丙子 | 亥 酉 | 申 | 酉 | 寅 | 寅 |
| C2 | 1990-03-04 14:00 | 戊辰 | 未 丑 | 申 | 酉 | 寅 | 巳 |
| C5 | 1988-07-10 22:00 | 丙寅 | 酉 亥 | 申 | 卯 | 申 | 巳 |
| C6 | 1989-03-03 00:15 | 壬戌 | 巳 卯 | 寅 | 卯 | 申 | 亥 |
| C7 | 1993-06-12 23:30 | 甲子 | 未 丑 | 巳 | 酉 | 寅 | 寅 |
| C8 | 1992-01-05 08:00 | 庚辰 | 未 丑 | 亥 | 酉 | 寅 | 巳 |
| C12 | 1990-06-07 12:00 | 癸卯 | 巳 卯 | 卯 | 子 | 巳 | 巳 |
| C13 | 1989-02-04 04:00 | 乙未 | 申 子 | 午 | 子 | 巳 | 申 |
| B1 | 1989-03-01 00:15 | 庚申 | 未 丑 | 亥 | 酉 | 寅 | 亥 |
| X1 | 1990-01-02 10:00 | 丁卯 | 酉 亥 | 酉 | 子 | 巳 | 巳 |
| X2 | 1990-01-04 10:00 | 己巳 | 申 子 | 酉 | 午 | 亥 | 申 |
| X3 | 1990-01-16 10:00 | 辛巳 | 寅 午 | 子 | 午 | 亥 | 申 |

---

## 2. 華蓋 IS DESCOPED. Remove it.

**Joey's plotter does not print 華蓋 at all.** It prints exactly five natal stars: 貴人, 文昌, 桃花,
驛馬, 孤辰. I added 華蓋 to the badge set myself and there is no oracle for it, so under rule 4 it cannot
be implemented.

Actions:
- Do not emit `badge_hua_gai` in Phase 1.
- In `glossary.json`, mark the 華蓋 / Bintang Cendekia entry `"detectable": false` with a one-line reason,
  so nobody later assumes it is live. Do not delete it.
- The measured badge frequencies in `content/sharecard-spec.md` (avg 2.5, range 1 to 4) were computed
  with a 華蓋 candidate table in the mix. **Re-measure them from the verified anchors** and report the
  new distribution. Phase 2's extremity term reads those frequencies, so a stale number silently
  mis-scores every badge. Put the new figures in `PROGRESS.md` as a dated observation.

The other three previously-detectable badges are unaffected: 桃花 now has a verified anchor, 羊刃 and
空亡 were already computed.

---

## 3. THE 刑 GLOSSARY ENTRY — LANDED 2026-08-02, do not re-add

**Status: the entry below is REVIEWED and ALREADY IN `glossary.json`** under `relasi_cabang.刑`,
with two changes against this draft: Reyner approved "Simpul" (Belitan considered, not taken), and
`label_meaning` was rewritten to remove the banned negation-contrast construction. The JSON in
`glossary.json` is the live version; the block below is kept only as the drafting record. If the two
disagree, `glossary.json` wins.

The table is already locked in `tests/punishment.spec.mjs` and `lib/bazi/stems.js`, so only the strings
were missing. The engine emits three sub-types (`self`, `trine`, `pair`) and they read differently
enough that one blended string would be vague, so this is a base entry plus a per-type clause.

**Add to `glossary.json` under `relasi_cabang`:**

```json
"刑": {
  "name_id": "Simpul",
  "name_en": "Punishment",
  "label_meaning": "Dua atau lebih bagian baganmu saling mengikat dengan cara yang menyulitkan. Bukan benturan dari luar, tapi pola yang kamu bawa sendiri dan cenderung kamu ulang.",
  "gift_seed": "Kamu memahami situasi rumit yang tidak punya jawaban sederhana. Orang lain menyerah lebih awal di kondisi seperti ini.",
  "cost_seed": "Kesulitan di area ini sering berawal dari keputusanmu sendiri. Menyalahkan keadaan tidak akan menyelesaikannya.",
  "types": {
    "self": {
      "label_meaning": "Bagian yang sama muncul dua kali dan bergesekan dengan dirinya sendiri. Kamu cenderung berlebihan justru di wilayah yang paling kamu kuasai.",
      "cost_seed": "Kekuatanmu di area ini bisa berbalik menekan dirimu sendiri kalau tidak kamu batasi."
    },
    "trine": {
      "label_meaning": "Tiga bagian baganmu terikat dalam satu simpul. Persoalan di sini jarang melibatkan satu pihak saja.",
      "cost_seed": "Menyelesaikan satu sisi biasanya menggeser masalahnya ke sisi lain. Ketiganya perlu dibereskan bersamaan."
    },
    "pair": {
      "label_meaning": "Dua bagian baganmu saling menahan. Yang satu tidak bisa maju tanpa membuat yang lain tertinggal.",
      "cost_seed": "Kamu terbiasa memilih antara dua hal yang sebenarnya sama-sama kamu butuhkan."
    }
  },
  "note_for_reyner": "[REYNER] REGISTER REVIEW NEEDED. Drafted by Claude, not approved. 'Simpul' is the proposed Indonesian name and it is the part most likely to be wrong. Golden rule 3 applies as it does to 冲: this is entanglement and self-authored complication, NEVER punishment or damage. 'Hukuman' was deliberately not used."
}
```

~~**Do not ship the Indonesian to a user before Reyner approves it.**~~ Approved 2026-08-02, landed
in `glossary.json`. See the status banner at the top of this section.
Wire the structure, keep the strings, flag them in your report. If Phase 3 needs to run before he
reviews, that is fine: the fact fires and the strings are placeholders, which is exactly what
`note_for_reyner` is for elsewhere in the file.

`name_id` for the three types is deliberately absent. One badge name, three explanations.

---

## 4. CORRECTION — `strength.verdict` is `weak | balanced | strong`. `lean` does not exist.

You were right to ask, and the answer is worse than a naming mismatch.

`provecell-01-USER.json` says `"verdict": "lean"`, `"provisional": true`. **Both are wrong.** I wrote
them by hand before Prompt C existed, and I implied chart 1 was a borderline case. The engine says:

```
verdict: weak    confidence: low    supportShare: 16.5
confidenceReasons: ["root 巳 pulled toward Metal by 半合"]
favorable: [Wood, Fire]    unfavorable: [Water, Metal, Earth]
```

16.5% against a 40% threshold is not a lean. It is decisively weak. The `confidence: low` is real but it
comes from the 半合 root pull, not from sitting near a threshold. My hand-written file described the wrong
kind of uncertainty.

**The ruling:**
- **The engine's three-value verdict is the contract.** Emit `verdict`, `confidence`, and
  `confidenceReasons` verbatim from `computeStrength`.
- **Delete `lean` and `provisional`.** Do not add a fourth verdict value, and do not touch the strength
  engine to create one. Softening is the renderer's job and `confidence: 'low'` plus
  `confidenceReasons` is how it learns to soften. That keeps rule 14 intact.
- **Fix `provecell-01-USER.json`** in the Phase 3 commit so the target file stops disagreeing with the
  engine. `favorable` needs no change; my hand-derived Kayu/Api matches the engine exactly, which is
  mild evidence the strength engine is sane.
- When you report the chart-1 diff, note this separately from the fact-set diff. It is a target-file
  correction, not a Stage 3 defect.

---

## 5. CONFIRMED — `element_presence`, and one thing you did not ask about

**`element_presence` is percent-of-total and it is correct as you reproduced it** (`Air 37.5 · Api 27.5
· Logam 20 · Tanah 15 · Kayu 0`). It stays deliberately separate from `buildElementBars`, which is
max-normalised for display. Rule 9. Keep the `element_presence_note` string in the output; it is there
so a future reader cannot mistake it for a strength score.

**The thing you did not ask about, and should have to guard against:** the strength engine emits element
names in **English** (`Wood`, `Fire`), and every user-facing surface uses **Indonesian** (`Kayu`, `Api`).
The provecell file's `strength.favorable` is Indonesian; `computeStrength` returns English. Stage 3 owns
that translation and it must go through `glossary.elemen`, not a local map. A second hardcoded element
map is how the two drift apart.

Assert it: for all 13 fixture charts, every element name in the emitted JSON is one of the five
Indonesian names, and no English element name appears anywhere in the output.

---

## WHAT THIS CHANGES IN D2

- Phase 1 emits **8 badge types**, not 9: 桃花, 羊刃, 空亡, 天乙貴人, 文昌, 驛馬, 孤辰, plus 華蓋
  descoped to a non-detectable glossary entry. Re-count against the glossary and report the number.
- **Chart 1's `void_month_stack` can now be computed honestly.** 酉 carries the 正財 profile source,
  Bunga Persik and Bintang Penolong, so the stack is three notable things as the target file intends,
  and D2's "convergence should dominate" test is runnable as written.
- The Bintang Penolong never-top-3 assertion stands, but **run it against the re-measured frequency**,
  not the 77% figure. 77% was measured with a candidate anchor table; the verified table may move it. If
  the new frequency is materially different, say so before Phase 2 tunes anything.
- Everything else in D2 is unchanged. Three phases, three commits, and rule 13 still holds: the anchor
  tables land in Phase 1, and no hierarchy constant is fitted in the same commit as the scoring logic.

## IF SOMETHING IS STILL UNDERSPECIFIED

Same instruction, and the count is now eleven. Stop and ask.
