<!--
STATUS: HANDOVER — the big one. Created 2026-08-01.
Stage 3: hierarchy scoring + semantic JSON emit. Three phases, three commits.
The renderer is already PROVEN on a hand-written semantic JSON. This produces that JSON from engine
output. After this, the pipeline runs end to end for the first time.
-->

# D2 — Stage 3: hierarchy scoring and semantic JSON

## WHAT THIS IS AND WHY IT IS THE UNBLOCK

The engine produces facts. The renderer turns a **semantic JSON** into Indonesian prose, and it is
already proven to work — five live runs, and Reyner's reaction to run 5 was "feels illegal to be free."

**But that JSON was written by hand.** Stage 3 is the missing piece that produces it from engine output.
Nothing downstream can exist until it does.

## THE TARGET SHAPE ALREADY EXISTS — this is the single most important thing in this prompt

**`docs/content/provecell-01-USER.json` is the goal state**, hand-authored for fixture chart 1
(1989-09-13 09:00). Read it before writing any code. It is the contract, and it is the only one that
has been validated against a real renderer.

**Your first test is: run Stage 3 on chart 1 and compare against that file.**

Compare on the right things:
- **Fact SET** — do the same findings appear? This should be near-exact.
- **Rough ordering** — is the top 3 the same set? Should be close.
- **Exact importance numbers** — I assigned those by hand as judgment calls. **Do not target them.**
  Getting 94 vs 91 is meaningless. Getting the ordering wrong is not.

Report the diff as a table: fact id, hand-written importance, Stage 3 importance, in-or-out of top 3.

## PHASE 1 — fact inventory. No scoring.

Emit every fact the chart supports, unranked. One commit.

The inventory, all of it already computed by the engine:

| Fact | Source | Notes |
|---|---|---|
| `day_master_<element>` | Day Master stem | always present |
| `strength_<verdict>` | strength engine | always present. carries `confidence` |
| `main_profile` | `mainProfile.js` | Track A, month-branch structural |
| `element_missing_<X>` | element presence == 0 | one per missing element |
| `element_dominant_<X>` | largest element presence | only if it is genuinely dominant, see phase 2 |
| `aspek_convergence_<X>` | same Aspek in 2+ positions | the strongest signal there is |
| `badge_<name>` | Bintang catalogue | one per badge present. **carries its palace** |
| `void_stack` | 2+ notable things on a void branch | see below |
| `spouse_palace` | day branch content | always present |
| `relation_<type>` | combine / trine / half / clash / harm / punishment | one per relation present |
| `profile_vs_favorable` | CR-1 | conditional, see below |

Each fact carries the four-field shape the renderer expects:
`{ id, type, provenance, label, label_bracket, label_meaning, gift, cost, actionable?, palace? }`

**`label_meaning`, `gift`, `cost` and `actionable` come from `docs/content/glossary.json`.** Never
generate them. Rule 14: if the LLM is ever in a position to decide something true, the design is wrong,
and that applies to Stage 3 inventing strings just as much as to the renderer.

### Two composite facts that need real logic

**`void_stack`** — fires when a void branch carries 2 or more notable things (the main profile source,
a badge, a strong Aspek). Chart 1 is the exemplar: 酉 is void AND carries 正財 (the profile source) AND
Bunga Persik AND Bintang Penolong. That convergence is a far bigger finding than any of the three
separately, and it scored 93 by hand. **Do not emit three separate badge facts and drop the stack.**

**`profile_vs_favorable`** (CR-1) — fires **only** when the main profile's element is in
`strength.unfavorable`, or the profile Aspek contradicts the strength verdict. Chart 1 fires it:
profile is 正財 = Metal, verdict is lean, Metal is unfavorable. It scored 95 by hand and it is the
emotional core of that reading. **Do not fire it on harmonious charts** — CR-1 says so explicitly, and
a forced tension is worse than no tension.

### Phase 1 test
Assert the fact SET for all 13 fixture charts. Snapshot it. Then assert chart 1's set matches the ids in
`provecell-01-USER.json`. Any fact in one and not the other is a finding to report, not to paper over.

## PHASE 2 — hierarchy scoring. One commit.

Score each fact 0 to 100 on four axes. **Put every constant in an exported `HIERARCHY_PARAMS`** — same
discipline as `STRENGTH_PARAMS`, for the same reason.

The four axes are defined in `content/renderer-prompt.txt` and `engine/pipeline-spec.md`. Concretely:

**EXTREMITY** — distance from normal.
- an element at exactly 0: maximum
- an element above ~35% of the chart: high
- 15 to 25%: furniture, score it low
- a badge present in a minority of charts: scales with rarity. Measured frequencies are in
  `content/sharecard-spec.md` — Mata Pisau 15%, Tanda Kekosongan 31%, Bintang Penolong 77%.

**CONVERGENCE** — the same theme across multiple pillars. **This is the strongest signal and should
dominate.** An Aspek appearing three times, or a void branch carrying three things, outranks any single
extreme value. Chart 1's officer convergence scored 94 by hand on exactly this basis.

**ACTIONABILITY** — does the fact carry an `actionable` string. Binary bonus.

**TENSION** — a real paradox. `type: 'tension'` facts get the bonus. Harmonious facts do not.

### Two rules that are not negotiable

**Bintang Penolong must never rank top-3.** It is present in 77% of charts, so by construction it is
neither extreme nor usually convergent. If your scoring puts it in the lead on any fixture chart, the
extremity term is wrong. **Assert this across all 13 charts** — it is a cheap, load-bearing test.

**`quiet_chart`** — if no fact scores above a floor, emit `quiet_chart: true`. The renderer then says
less rather than manufacturing drama. Better a thin honest reading than a padded one.

### Phase 2 test
Print the ranked fact list for all 13 charts. Chart 1's top 3 should be recognisable against the
hand-written file. Assert the Penolong rule. Assert that at least one chart in the fixture is not
`quiet_chart` and report whether any are.

## PHASE 3 — the JSON contract and `required_points`. One commit.

Emit the full object per `provecell-01-USER.json`:
`engine_version`, `target_language`, `hour_known`, `quiet_chart`, `boundary_flag`, `core`, `strength`,
`chart`, `facts[]` (ranked), `required_points[]`, `safety_flags[]`.

**`required_points` is a coverage checklist, not an outline.** Derive it from the top-scoring facts plus
the always-present ones (inti diri, penutup). Every required point MUST have a backing fact — a
required point with no fact forces the renderer to author, which is exactly the failure that produced
an entirely invented `inti_diri` in run 1.

**Cache key**: `hash(semantic_JSON + engine_version)`. The JSON must be **canonically serialised** —
stable key order, no floating-point noise — or the cache will miss on identical charts. Assert that
computing the same chart twice yields byte-identical JSON.

## THE GATE — end to end, for the first time

After phase 3: take Stage 3's output for chart 1, paste it into AI Studio with
`content/renderer-prompt.txt`, and compare the reading against run 5. **Report both.**

That is the moment the pipeline exists. If the reading is materially worse than run 5, the difference is
in the JSON and it is diagnosable by diffing against the hand-written file.

## WHAT NOT TO DO

- **Do not build Stage 5 or Stage 6.** Separate prompts. Stage 3 emits JSON and stops.
- **Do not generate any prose.** Every user-facing string comes from the glossary.
- **Do not tune hierarchy params in the same commit as the scoring logic.** Rule 13.
- **Do not touch the strength engine.** It is done. Oracle 3 rho 0.874, Oracle 4 r 0.929.
- **Do not add 命宮.** See D1b and CLAUDE.md rule 4.

## IF SOMETHING IS UNDERSPECIFIED

Stop and ask. This prompt is longer than usual because Stage 3 has more judgment in it than anything
before it, and a wrong fact inventory propagates into every reading silently. Many spec errors have been
caught by pushing back; this is the prompt where that matters most.
