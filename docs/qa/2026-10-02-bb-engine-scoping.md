<!--
STATUS: REPORT (Prompt BB §4), no engine code. Written by a Claude Code subagent 2026-10-02, committed
unchanged except these path lines. Reyner ruled E12 option E the same day (done in Prompt BD).
-->

# Prompt BB §4: engine scoping report (E12, E11, C2/E10)

2026-10-02. REPORT ONLY. Nothing in the repo was edited, created or deleted, and no git state was changed.
Working tree at measurement time: `feat/english-archetype-titles` @ `a423a2f`; `origin/main` @ `ee8efbc`.
`git diff --stat origin/main -- scripts/compat-base-rates.mjs lib/compat lib/bazi docs/product/compat-p4-p5-rules.md` returned no files. Only `lib/semantic/pair.js` differs (`p2FrameKey`), and nothing here reads it.

Scratch script: `2026-10-02-bb-engine-scoping/bb-s4.mjs` (committed beside this file; run from a scratch folder, it imports the repo by absolute file URL). It copies the harness PRNG and draw order exactly. Raw outputs: `2026-10-02-bb-engine-scoping/run1.txt`, `run2.txt`, `run3.txt`.

**Guards in the script:**
- V0 quadrant counts and P4 pattern counts must equal the harness's own run (below).
- Every option partition must sum to 5000.
- Option A must keep matching and related unchanged.
- Option E's two generating buckets must sum to option A's.

**Shown red on purpose:** `BREAKQ=1 node bb-s4.mjs` gave `Error: GUARD: P5.q1=1074 expected 1075`.

---

## 1. E12, label spread

### 1.1 Harness, unchanged, on today's code

```
node scripts/compat-base-rates.mjs --charts 2000 --pairs 5000 --seed 20260907
node scripts/compat-base-rates.mjs --charts 2000 --pairs 5000 --seed 20260907 --variants
node scripts/compat-base-rates.mjs --selftest      -> 6/6 known quadrants reproduced
```

| P5 | count | rate |
|---|---|---|
| q1 | 1074 | 21.5% |
| q2 | 1284 | 25.7% |
| q3 | 1047 | 20.9% |
| q4 | 1595 | 31.9% |
| pull high | 2358 | 47.2% |
| fit high | 2121 | 42.4% |

| clause | rate |
|---|---|
| 2.1.a fired | 8.1% |
| 2.1.b fired | 8.7% |
| 2.1.c fired | 9.6% |
| 2.1.d fired | 30.2% (alone: 22.4%) |
| 2.2.b held | 99.2% |
| 2.2.c held | 42.7% (failed: 57.3%) |

| P4 | count | rate |
|---|---|---|
| matching | 526 | 10.5% |
| related | 445 | 8.9% |
| **contrasting** | **4029** | **80.6%** |

P3 is unchanged by this work: both give 71.9%, partner only 13.1%, reader only 13.3%, neither 1.8%.

### 1.2 What drives the concentration now. The prompt's two claims are stale.

- **"2.1.d fires for 72.1%" is no longer true.** 72.1% was the PRE-V6 2.1.d, which scanned all eight palace pairings. The scratch script recomputes that old predicate: `old.2.1.d.anyPalace 3607 72.1%`. The shipped 2.1.d is month-branch only, at `lib/compat/pullFit.js:69-70` and `:107-110`. It fires on **30.2%**.
- **"Fit clause 2.2.a holds for 100%" is also stale.** 2.2.a was DELETED by the V6 amendment (`docs/product/compat-p4-p5-rules.md`, §2.2; `lib/compat/pullFit.js:27`, `:91`: "`aSupplies` and `bSupplies` are deliberately NOT read"). Its standalone predicate is also no longer 100%. It now holds on **98.2%** (harness `--variants`: `2.2.a ruled (either direction) 4911 98.2%`), because the supplier-must-hold-more ruling (`lib/compat/complementarity.js:65-71`, `:76`) made a supply occasionally null. The pre-V6 rule's fit is therefore 86.5% today, not the recorded 88.1%.
- **P5 already meets the target.** No quadrant is above 40%; the largest is q4 at 31.9%. On a second seed (`SEED=20261002`) the largest is q4 at 34.8%. **P5 needs no change for E12.**
- **The only violation is P4 contrasting, at 80.6%, and it is structural rather than a threshold.**
  - Per-chart family marginals (`run1.txt`): officer 19.8%, wealth 19.6%, resource 21.5%, output 19.4%, companion 19.7%.
  - With five near-uniform families, a random pair shares a family about 20% of the time. The expected rate from the marginals is 20.0%; measured same_family is 19.4%.
  - So `different_group` takes about 80% by construction (`lib/compat/temperament.js:139-141`). P4 has no threshold to move, so E12 for P4 means re-partitioning.

### 1.3 Options

P5 is V0, the shipped rule, in every option. Its full table is the one in §1.1, so it is not repeated per option. Clause rates are unchanged in every option, because no P5 clause is touched.

**Finding first: no symmetric two-way split of contrasting can meet the cap.** Splitting the four non-shared families 2+2 puts about 40% in each half by arithmetic, so the result sits on the line. Measured, same seed:

| near-miss (FAILS) | buckets | max |
|---|---|---|
| A: contrasting split by family cycle (generating vs control step) | matching 10.5 / related 8.9 / gen 39.5 / ctrl **41.1** | 41.1% |
| B: same as A, matching and related merged | same 19.4 / gen 39.5 / ctrl **41.1** | 41.1% |
| C: absolute root element of each main profile, symmetric cycle | same 20.9 / gen 38.8 / ctrl **40.3** | 40.3% |
| D: contrasting split by polarity agreement | 10.5 / 8.9 / same-pol 39.6 / diff-pol **40.9** | 40.9% |

On seed 20261002 the same four options max at 39.9%, 39.9%, 40.0% and 40.0%. They pass or fail depending on the sample, so none of them is a real option.

**Passing options split contrasting by direction.** Pair facts already have a directional precedent: P1 emits `a_produces_b | b_produces_a | a_controls_b | b_controls_a` (`lib/compat/stemRelation.js:59-65`). A is the reader (`lib/semantic/pair.js:142-144`, where `p3_reader_gives` means A alone gives).

The family step is d = (kB - kA) mod 5, with k as the position on the generating cycle from the Day Master (companion 0, output 1, wealth 2, officer 3, resource 4). The positions come from `tenGodRelation` (`lib/compat/temperament.js:69-75`, `:89-91`), over `elementRelation`'s GENERATES/CONTROLS (`lib/semantic/facts.js:667-683`).

| d | meaning |
|---|---|
| 1 | A's family generates B's |
| 2 | A's family controls B's |
| 3 | B's family controls A's |
| 4 | B's family generates A's |

**Option E: six patterns. Matching and related kept as ruled; contrasting split four ways by directed step.**

| P4 | count | rate |
|---|---|---|
| matching | 526 | 10.5% |
| related | 445 | 8.9% |
| a_generates_b | 977 | 19.5% |
| a_controls_b | 1001 | 20.0% |
| b_controls_a | 1054 | 21.1% |
| b_generates_a | 997 | 19.9% |

- Max is 21.1% (seed 20261002: 20.5%). P5 is as in §1.1.
- 4029 pairs (80.6%) change label; matching and related pairs keep theirs.
- **This changes a Katon framework rule:** `compat-p4-p5-rules.md` §1.1 grows from three patterns to six, and it needs four new `p4_*` strings from Reyner.
- **It adds no classical table.** The family cycle comes from the same GENERATES/CONTROLS that `tenGodRelation` already uses.
- **Caveat (rule 4):** if content ever states "Output feeds Wealth" as a classical 十神 生克 claim, that sentence needs a written source in `docs/`. The derivation needs no source; the claim does.
- **Rule 25:** the "controls" buckets must not read as bad.

**Option F: five patterns. same_family (matching and related merged) plus the four directed steps.**

| P4 | count | rate |
|---|---|---|
| same_family | 971 | 19.4% |
| a_generates_b | 977 | 19.5% |
| a_controls_b | 1001 | 20.0% |
| b_controls_a | 1054 | 21.1% |
| b_generates_a | 997 | 19.9% |

- Max is 21.1% (seed 20261002: 20.5%). P5 is as in §1.1.
- Every pair changes label id.
- **This is a larger Katon framework change:** it deletes the ruled matching/related distinction. Matching (10.5%) and related (8.9%) are each smaller than any other bucket, so the merge evens the spread, but the "same God" badge is lost.
- No classical rule changes. The same rule 4 and rule 25 caveats as Option E apply.

**Option G: five patterns on a different basis. The absolute element of each main profile's root stem, directed.** The element is `mainProfile().element`, set from `tenGod(dm, rootStem).element` (`lib/bazi/mainProfile.js:57-58`, `:71`; `lib/bazi/tenGods.js:60`). The bucket comes from `elementRelation(A.root, B.root)`.

| P4 | count | rate |
|---|---|---|
| same_element | 1044 | 20.9% |
| a_generates_b | 944 | 18.9% |
| a_controls_b | 991 | 19.8% |
| b_controls_a | 1024 | 20.5% |
| b_generates_a | 997 | 19.9% |

- Max is 20.9% (seed 20261002: 20.5%). P5 is as in §1.1.
- **This changes the Katon framework rule's basis,** from family relative to each person's own Day Master to absolute element, so §1.1 and §1.3 would be rewritten.
- No new classical table: the five-element cycle at `facts.js:667-668` is reused.
- Root elements are slightly uneven (Wood 23.7%, Fire 15.7%; `run1.txt`).
- It overlaps P1's cycle in kind, a second element-on-cycle fact, which may make the two read alike in prose.

**Recommendation for the ruling: Option E.** It keeps every ruled pattern, splits only the 80.6% bucket, has the most even spread among options that keep matching and related, and reuses P1's directional vocabulary.

---

## 2. E11, cross-links from facts already emitted

**Branch element source, checked first:**
- `lib/bazi/stems.js:24` `BRANCH_ELEMENTS` exists. It has no provenance comment, no test, and no consumer: `grep -rn BRANCH_ELEMENTS lib tests scripts docs` returns only `stems.js:24` and the re-export at `lib/bazi/index.js:21`.
- `docs/content/glossary.json` `shio.<branch>.element` carries the same twelve values.
- **This report uses the main qi (本气) element** instead: `STEM_ELEMENTS[HIDDEN_STEMS[branch][0].stem]`. That is what the engine already emits as `spouse_palace.provenance.element` (`lib/semantic/facts.js:473-486`). It comes off the verified hidden-stem table (`stems.js:30-55`, corrected 2026-08-01, locked by `tests/hidden-stems.spec.mjs`).
- The script asserts the main-qi element and `BRANCH_ELEMENTS` agree on all 12 branches ("none (12/12 agree)"). They are still different concepts, and only the main-qi one has a source in this repo.
- **Do not use** the season ruler (`lib/bazi/strength.ts:236-246`, 土旺於四季, where 辰 is scored as Wood). It is a third, different notion.

**Where the inputs reach the pair payload today:**
- Day Master element: `compatStemRelation().a/.b.element` (`stemRelation.js:104`), and `core.element` (`pair.js:222`).
- Main-profile root element: the mirror fact `main_profile.provenance.element` (`facts.js:293`), or `profile_vs_favorable.provenance.element` (`facts.js:627`) when CR-1 supersedes it. Both reach v2 pairs through `mirror.a/b.facts` (`pair.js:284-291`).
- Supply: `comp.aSupplies/bSupplies.element` (`complementarity.js:79`).
- Favourable list: `strength.favorable` (`index.js:361`).
- Absent elements: the `element_missing_*` fact (`facts.js:305`).
- Dominant element: `element_dominant_*` (`facts.js:331`, gate 35%).

Fire rates are over the same 5000 pairs, seed 20260907 (`run2.txt`):

| join | inputs | fires | new BaZi rule? |
|---|---|---|---|
| (a) A's DM element = B's main-profile root element, or the reverse | `stemRelation .a.element`; `main_profile.provenance.element` | either 35.8%, both 3.4% (one direction 19.6%) | **N**, element equality |
| (a') DM **stem** = other's `rootStem` | `chart.day.stem`; `main_profile.provenance.root_stem` (`facts.js:290`) | either 18.2% | **N** |
| (b) element supplied = supplier's own spouse-seat element (main qi) | `aSupplies.element`; supplier `spouse_palace.provenance.element` | either 36.8% (A 20.2%, B 20.5%) | **N** |
| (b'') supplied element appears anywhere in the supplier's day-branch hidden stems | `aSupplies.element`; `HIDDEN_STEMS[day.branch]` | either 69.0% | **N**, but weak (fires on most pairs) |
| (c) the two spouse-seat elements on the cycle (a partition) | both `spouse_palace.provenance.element`; `elementRelation` | same 22.8 / generating 39.2 / controlling 38.0 | **N** |
| (c2) one DM element = the other's spouse-seat element | DM element; other's `spouse_palace.provenance.element` | either 35.3% | **N** |
| (d) one DM element = the other's rank-0 favourable element | DM element; `strength.favorable[0]` | either 36.7% (anywhere in list: 71.4%; in the unfavourable list: 78.2%) | **N** |
| (e) element supplied = supplier's own DM element | `aSupplies.element`; DM element | either 42.5% | **N** |
| (f) one DM element is absent from the other chart | DM element; `element_missing_*` (presence 0) | either 8.5% | **N** |
| (g) one chart's dominant element = the other's DM element | `element_dominant_*`; DM element | either 22.1% | **N** |
| (i) identical day branches | `chart.day.branch` x2 | 9.0% | **N** |

Every join is an equality or an `elementRelation` lookup over values the engine already emits. **None needs a new BaZi table.** What remains is the interpretation, and ruling A (`branchRelations.js:8-17`) puts that in the content layer.

**Two guards for the writer prompt:**
- (a) is **not** the spouse-star clause. `compat-p4-p5-rules.md` §3 (line 132ff) keeps 正官/七殺 and 正財/偏財 unsourced. Content must not call (a) or (c2) a spouse star.
- (c) duplicates in kind the existing branch relations on the day pair. Present it as element, not as 六合/冲.

---

## 3. C2 and E10, inventory (grep for 三合 半合 三刑 sanhe banhe trine punishment wealth 財 over lib/ tests/ docs/)

`sanhe` and `banhe`: zero hits.

### Three-branch patterns

**What exists, all single-chart:**
- `lib/bazi/stems.js:88` `SELF_PUNISHMENT`, `:91` `PUNISHMENT_TRINES` (寅巳申, 丑戌未), `:97` `PUNISHMENT_PAIRS` (子卯), `:105` `branchPunishments()`.
  - Scope ruling D1 is at `:73-76`: full 三刑 only, partial trines excluded.
  - It was verified against four outside sources (`:78-83`).
  - Tests: `tests/punishment.spec.mjs:32`, `:47-55`.
- `lib/bazi/buildChart.js:166-171` `chart.punishments`, single-chart.
- `lib/bazi/relations.js:44` `TRINE_SETS`, with members, peak and element. `:75-110` `branchRelations()` emits 三合 and 半合 (半合 only with the peak, `:96-98`).
- `lib/bazi/strength.ts:287` private `TRINES`; `:495-507` `combinationRisk`, used for confidence only.
  - Agreement test: `tests/stage3-facts.spec.mjs:234-247` (TRINE_SETS = glossary `relasi_cabang.三合.sets` = strength.ts).
- Reading facts: `lib/semantic/facts.js:508-515` `relation_<type>_<branches>`, `:563` `relation_刑_*`. Weights are in `lib/semantic/hierarchy.js:81`, `:116`.
- Content: `docs/content/glossary.json` `relasi_cabang.{三合,半合,刑}`.

**Cross-chart: nothing, by specification.**
- `lib/compat/branchRelations.js:31-38` says trines need three branches, every compat fact is pairwise, and `branchPunishments` is never handed more than two.
- `tests/compat-branch-relations.spec.mjs:29-35` asserts that 三刑 cannot arise there.
- `docs/NEXT.md:703-709` records cross-chart 三刑 as owed: "a FACT SHAPE that names two pillars on one side", with Cowork to spec and Reyner to rule.

**Provenance gap:**
- `strength.ts:284-286` cites `docs/engine/bazi-blueprint.md` for the trine groups. That document mentions them only as Peach Blossom anchors (`:222`).
- No `docs/` file records two sources for the 三合 element or the 半合-needs-peak rule.
- The punishment table's verification lives in a code comment (`stems.js:78-83`), not in `docs/`.

**Sizing only, not a rule.** Union of both charts' branches, completed in neither chart alone (`run3.txt`):

| measure | rate |
|---|---|
| a 三刑 trine completed only by the union | 15.5% |
| a full 三合 completed only by the union | 28.5% |
| either chart has its own full 三刑 | 4.8% |
| either chart has its own full 三合 | 10.4% |

**Missing:** a written cross-chart rule with a second source (rule 4). It has to decide:
- whether 三合 and 三刑 apply across two charts at all;
- whether a cross-chart 半合 needs the peak;
- whether 2+1 splits count, and which pillars name the fact.

### Wealth

**What exists, all single-chart or element-level:**
- 財 is the element the Day Master controls: `lib/bazi/tenGods.js:52` (偏財/正財) and `lib/semantic/facts.js:683` (`is_controlled`, "財 Wealth").
- Family `wealth`: `lib/compat/temperament.js:60`, `:72`.
- Main profile and `aspek_convergence_正財/偏財` facts (fixture rows at `tests/stage3-facts.spec.mjs:41`, `:43`).
- **Already a cross-chart fact, though not named "wealth":** P1 `cycle: a_controls_b` means B's Day Master element is A's 財 element (`lib/compat/stemRelation.js:26`, `:59-65`). It fires a_controls_b 19.9% and b_controls_a 20.4% (`run3.txt`).
- `forbidden_content.financial` (C1) sits at `lib/validate/blocklist.json:25-36`.

**Legacy, not a source:**
- `lib/bazi/report/sections/hubunganDenganRezeki.js` is hand-authored and pre-pivot.
- `getReport` has no consumer: `grep -rn getReport app components lib scripts` returns only `lib/bazi/index.js:26` and its own definition.

**Missing:**
- Any written definition of a cross-chart wealth fact (for example 財 supplied across charts, or 食傷生財 across two people).
- The spouse-star use of 財, which is explicitly unsourced (`compat-p4-p5-rules.md:132-136`).
- C1 allows a wealth identity "only where an engine fact supports it", and today none is labelled as such. Labelling P1's `a_controls_b` as a wealth fact would itself be an interpretive rule, so it needs the written rule plus a second source before any code.
