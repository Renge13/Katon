<!--
STATUS: RULED. Reyner's verdict and rulings from THE READ, 2026-08-19. Register and all five
rulings are his. Cowork assembled the read, ran the measurements, and wrote this record.
For Claude Code: THIS FILE lands on main as a new file, alone, before the PR that implements any of
it. Decision state never lives on the branch it rules on (the #28 ruling). The build prompt is
docs/prompts/L-opening-gate.md.

CORRECTED 2026-08-19, after Claude Code measured it: an earlier version of this header said to FOLD
SECTIONS 1-6 INTO PROGRESS.md on main, alone, before any implementing PR. That instruction was wrong
while PR #45 is open. main and #45 differ by 286 insertions in PROGRESS.md, so folding into main's copy
now GUARANTEES a conflict at #45's merge - and a docs conflict in the one file that answers "what
ships" is the worst place to hand-resolve. THE FOLD MOVES AFTER #45 MERGES, as its own small docs
commit. Landing this file itself conflicts with nothing: it is new, and no other branch touches it.
Source read: docs/qa/2026-08-19-THE-READ.md (5 readings, 4 charts).
Provenance: charts 13, 1, fresh-1996 from docs/qa/2026-08-19-renders.md, run 2026-08-19,
~Rp 550 of ~Rp 28,100. Chart 5 floored on that run, so its two readings are stored attempt-1
prose from docs/qa/2026-08-18-retry-depth.json, prompt-identical (2ff1a546fb7e6e53), zero cost.
-->

# THE READ — verdict and rulings, 2026-08-19

**Promotion precondition 3 has been executed. It did not pass clean.** Three of five readings would
be sold at Rp 19.000; two would not, and both failures are the same sentence.

---

## 1. THE VERDICT — would you sell this at Rp 19.000?

| Reading | Chart | Sell? | Reyner's reason |
|---|---|---|---|
| chart 13 | 1989-02-04 04:00 | **NO** | Missing the archetype image in sentence 1 (`Kamu adalah Kayu`) |
| chart 1 | 1989-09-13 09:00 | **YES** | Excellent reframing of "Lemah", strong momentum, punchy advice |
| fresh-1996 | 1996-10-02 19:20 | **NO** | Buries the Day Master behind an Aspek in the opening sentence |
| chart 5, substitute A | 1988-07-10 22:00 | **YES** | Zero padding, sharp flow, clear closing actions per block |
| chart 5, substitute B | 1988-07-10 22:00 | **YES** | Crisp execution, strong actionability across all sections |

**2 of 4 charts fail, and both fail on the first sentence.** Neither failure is a register defect
anywhere else in the reading — the rest of both readings was not objected to.

---

## 2. RULING — THE ARCHETYPE IMAGE IN SENTENCE 1 IS NON-NEGOTIABLE

> *"The archetype image is the main draw of the product, and skipping it ruins the initial impact.
> It establishes identity before taxonomy. `Kamu adalah Kayu (Wood)` reads like a spreadsheet header,
> and fresh-1996 opening on an Aspek completely buries the lead."* — Reyner, 2026-08-19

**The two failures are DIFFERENT defects and it matters, because one is already forbidden and one is not.**

`docs/content/renderer-prompt.txt:22` heads a section **"THE OPENING IS FIXED"** and line 24 reads:
*"facts[] opens with three facts, and those three are the reader herself: her Day Master, her strength
verdict, and her main profile. They come first... This order is the engine's decision, not a
preference, and not yours to change."*

- **fresh-1996 BROKE A STATED RULE.** It opened on `Aspek Pelindung (Direct Resource)`, not the Day
  Master. The prompt forbids this in as many words. Line 34 of the same file says why nothing caught
  it: *"The validator downstream checks content coverage, never structure."*
- **chart 13 BROKE NO RULE.** It opened on the Day Master in the correct position — as the *element*,
  `Kamu adalah Kayu (Wood)`. **Nothing in the prompt has ever required the archetype NAME to appear.**
  So this is a missing instruction, not a compliance failure.

### The cause was measured, and it is NOT a prompt-wording problem

**Cowork's first diagnosis in chat — "the prompt needs a new instruction and the gate needs a new
check" — was wrong, and is corrected here rather than quietly dropped.** Two free measurements over
prose already on disk found the actual cause.

**First: the miss is per-CHART and near-total, not run-to-run variance.** Archetype name present in the
first 250 characters, over the 77 stored attempts in `docs/qa/2026-08-18-retry-depth.json`:

| Chart | Expected name | All attempts | Passing attempts only |
|---|---|---|---|
| chart 5 | Matahari | 21/22 (95%) | **9/10 (90%)** |
| chart 1 | Matahari | 18/22 (81%) | **7/9 (77%)** |
| chart 13 | Bambu | 0/18 (**0%**) | **0/10 (0%)** |
| fresh-1996 | Samudra | 2/15 (13%) | **0/10 (0%)** |
| **TOTAL** | | 41/77 (53%) | **16/39 (41%)** |

**The two charts Reyner rejected are the two that have NEVER named their archetype — 0 of 10 passing
runs each, twenty independent renders.** The two he accepted name it 77-90% of the time. A prompt
instruction cannot explain a split that clean.

**Second: the engine never asks for the name.** The archetype IS in the semantic JSON —
`core.archetype_name_id` is `"Bambu"` for chart 13, `"Samudra"` for fresh-1996 — but `core` is context.
The obligation lives in `required_points`, and there the day-master entry reads:

```
$ node --conditions=react-server scripts/emit-semantic.mjs 1989-02-04 04:00
  "core": { "day_master": "乙", "element": "Kayu", "archetype_key": "bambu",
            "archetype_name_id": "Bambu", ... }
  required_points:
    {"fact_id": "day_master_Wood", "importance": 55, "must_cover": ["label_meaning","gift","cost"]}
```

The day-master **fact's** `label` is the element (`Kayu`), and `must_cover` does not list the archetype
at all. **The renderer is under no obligation to name it, and Stage 6 has nothing to check.** Where the
name survives, it survives because `Api Matahari` is idiomatic Indonesian and composes into the
sentence on its own. `Kayu Bambu` and `Air Samudra` do not compose, so the model drops the name — and
nothing objects.

**Consequence, and it is a cleaner fix than the one first proposed:** this is an ENGINE change, not a
prompt change. The archetype name becomes a required point; Stage 6's existing coverage machinery then
enforces it with no new bespoke check. That is rule 14 behaving correctly — the engine owns the fact and
its obligation, and the LLM only chooses the words. It still changes what Stage 6 accepts, so
`STAGE6_VERSION` bumps in the same commit.

**It cannot be built yet.** Making the name mandatory forces a sentence pattern onto stems where the
idiom does not exist, and that pattern is Reyner's to rule. See section 7.

---

## 3. RULING — RULE 23 SCOPE: `Aspek` AND `Bintang` ONLY

> *"Missing English terms on `Aspek Pengelola` in Chart 1 immediately feels like a dropped translation
> artifact because every other card carries them. `Pilar` and `Elemen` should remain unbracketed to
> avoid visual clutter."* — Reyner, 2026-08-19

**Bracket-once binds `Aspek` and `Bintang`. It does NOT bind `Pilar` or `Elemen`.**
This closes the open question at the top of the 08-19 session state. `CLAUDE.md` rule 23 should be
amended to say so explicitly, because the ambiguity is what produced the question.

**The corpus had already been deciding it, which is why the ruling ratifies rather than reverses:**
`pilar` **0 of 274** bracketed, `elemen` **13 of 170**. The 13 are now the exception to sweep, not the
convention to follow.

**The live instance the ruling was made on** — chart 1, which PASSED the gate at attempt 2:

```
$ python3 -c "... per-reading Aspek bracket tally over docs/qa/2026-08-19-THE-READ.md"
  [chart 13]     Aspek 4/4 bracketed
  [chart 1]      Aspek 0/2 bracketed   <- Aspek Pengelola, Aspek Pengatur
  [fresh-1996]   Aspek 2/2 bracketed
  [chart 5 sub A] Aspek 2/2 bracketed
```

Rule 23 is enforced by no check, which is how 0 of 2 shipped. A check follows this ruling with its own
measurement, in its own commit.

**Measurement caveat, recorded so it is not quoted:** the same tally reported substitute B as 2/2, but
its section of the read file also contains Cowork's own explanatory prose, which the regex counted.
Chart 1's 0/2 is clean. Substitute B's figure is not, and should be re-measured against the raw
attempt prose rather than the assembled read file.

---

## 4. RULING — CROSS-CHART VERBATIM REPETITION IS UNACCEPTABLE

> *"Unacceptable for a Rp 19.000 paid reading. Verbatim sentences across friends' reports shatters
> personalization. High-frequency glossary cells need 2-3 structural variants."* — Reyner, 2026-08-19

**Measured over the five readings, chart 5's two substitutes counted as one chart:**

| | |
|---|---|
| Sentences appearing in **2+ distinct charts** | **9** |
| Worst offender | **3 of 4 charts** |
| Sentences repeated **within a single reading** | **0** |

The 3-of-4 sentence:

> `Orang lain melihat kamu berhasil di bidang ini, tetapi kamu sendiri sering merasa belum pantas menyandangnya.`
> — chart 1 / Karier dan Pengakuan · chart 13 / Tanda Kekosongan · chart 5 / Tanda dan Bantuan

Also in two charts each: `Sebut hasil kerjamu dengan lantang, meskipun rasanya canggung.` ·
`Orang mengingatmu setelah satu pertemuan tanpa kamu perlu berusaha keras.` ·
`Kamu sanggup menopang dirimu sendiri sekaligus tetap terbuka menerima dari luar.` ·
`Titik tengah ini tidak memberi dorongan ekstrem yang memaksa, sehingga arah hidupmu harus kamu tentukan sendiri.`

**This is the architecture behaving exactly as designed, and that is the point.** One fact maps to one
glossary cell, so two readers who share a fact share its sentence. Nothing is broken; the design has a
consequence nobody had priced. **It is a CONTENT task, not a code task** — Cowork drafts 2-3 structural
variants per high-frequency cell, Reyner rewrites, and it lands as a rulings file the same way tranches
1 and 2 did. **Zero within-reading repetition means the previously-shipped defect is not present.**

**Sequencing note, not a ruling:** this is the only one of the four items that cannot be built without
new Reyner-authored prose, so it is the long pole. Ranking the cells by cross-chart frequency before
drafting is cheap and would aim the writing at the sentences that actually collide.

---

## 5. RULING — PARAGRAPH COLLAPSE AT DEPTH 2 IS ACCEPTABLE

> *"The attempt-2 paragraph merges in Chart 1 and fresh-1996 feel tighter and more cohesive, not like
> wall-of-text fatigue."* — Reyner, 2026-08-19

**No wall check. Depth 2 stays.** This closes the open item from
`docs/qa/2026-08-19-retry-erosion.md` — the 60% paragraph-collapse rate at attempt 2 is a
characteristic, not a defect. The read was blind to which blocks had collapsed; the verdict was formed
on the prose and then matched to the banner.

Note that this ruling and section 2 pull in opposite directions on the same mechanism: retrying is now
sanctioned as harmless to paragraph structure, while the archetype image it also erodes becomes
gate-enforced. The gate check in section 2 is what makes both true at once.

---

## 6. RULING — THE `quietFloor` RE-ASK IS CLOSED

> *"Both Chart 5 substitutes prove tranche 2 fixed the padding issue. Padding is fixed; every block now
> ends with a clean action item."* — Reyner, 2026-08-19

**`quietFloor` stays at 70. No re-fit. The 08-11 deferral (`docs/PROGRESS.md:477`) is discharged.**

The 08-11 ruling was: *`quietFloor` stays at 70, re-render chart 5 after tranche 2 lands, and if it
still pads with full cells, re-fit as its own measured change.* Tranche 2 landed 2026-08-12
(#38/#39 for 2a, #40 for 2b). Both chart-5 substitutes read clean. **The 08-11 attribution was
correct: the padding was unwritten cells, never the threshold.**

Corroborating measurement — sentence-to-sentence redundancy inside every block of all five readings,
overlap = shared content words / shorter sentence:

| | |
|---|---|
| Blocks at or above 0.45 overlap | **3**, all mild, max **0.57** |
| Anything resembling *"one trait five ways"* | **none** |

**A discarded instrument, recorded because the discard is the reason this figure is trustworthy.** The
first padding detector keyed off a whitelist of Indonesian imperative verbs and flagged blocks that
plainly do end on an action — `Bereskan kejanggalan atau masalah kecil begitu terlihat...`,
`Endapkan keputusan memutus hubungan selama semalam...`. It was measuring its own vocabulary, not the
prose. Replaced with the redundancy measure above, which is what the 08-11 complaint actually described.

---

## 7. WHAT BLOCKS THE BUILD — one register decision, and it is Reyner's alone

Section 2's fix is one line of engine code. It cannot be written because **nobody knows what the
corrected sentence says.**

The two accepted readings open `Kamu adalah Api Matahari` — element plus archetype, and it works
because that phrase is idiomatic. Force the same pattern onto the two rejected charts and it produces
`Kamu adalah Kayu Bambu` and `Kamu adalah Air Samudra`, neither of which is Indonesian anyone speaks.
**The idiom is why the model dropped the name, so mandating the name without ruling the pattern just
moves the defect into the sentence itself.**

**7a. `Hutan` is not an archetype name in this repo.** It was used as an example alongside
`Api Matahari` in the 08-19 verdict. It appears nowhere:

```
$ grep -rn "Hutan" docs/content/glossary.json lib/content/ docs/content/*.md
  (no output)
```

**Three different names exist for 乙 across the project and none has ever been read in sentence 1:**
`Bambu` (`glossary.json` -> `arketipe`, what the new pipeline and the card use), `AKAR`
(`lib/content/*.js`, the legacy path a real user reads today), and `Hutan` (this verdict, nowhere else).
Chart 13's day master is 乙, so under the surviving glossary set its corrected opening reads
**`Kamu adalah Bambu`**. Nothing here was written on the assumption that `Hutan` is real. That
`Hutan` was the word that came to mind is itself worth weighing: it suggests the image, not the
renderer, is what failed.

**7b. The name set was a sequencing constraint. It is now a content decision.** `PROGRESS.md` LIVE STATE
records two name sets disagreeing on five of ten (乙丁己庚癸: `Bambu / Api Unggun / Taman / Besi Tempa /
Embun` versus `AKAR / PELITA / LADANG / PEDANG / HUJAN`) and rules that the glossary set survives. That
mattered only for wiring the card. **After section 2 it lands in the first sentence of every reading**,
and five of ten readers will meet a name Reyner has never read in that position.

### RULED, 2026-08-19, same session

**1. The opening pattern is the ARCHETYPE ALONE, with the English in brackets.**

> *"Archetype alone, use the english."* — Reyner, 2026-08-19

So chart 13's corrected opening is **`Kamu adalah Bambu (The Bamboo).`** and the element arrives in the
next breath rather than in front of the image. One pattern, all ten stems, no per-stem strings to write.
Note this also changes the two ACCEPTED readings: `Kamu adalah Api Matahari` becomes
`Kamu adalah Matahari (The Sun)`. Both were praised in section 1, so the pattern is being applied to
prose that already worked — worth a look on the next render rather than an assumption.

**2. `Bambu` stands.** The glossary set survives, as `PROGRESS.md` LIVE STATE already ruled. `Hutan` is
not adopted and does not enter the repo. `AKAR` remains legacy-only and dies with the `contents/*.md`
path.

### These two rulings amend rule 23, and the amendment must be exact

Section 3 ruled bracket-once binds **`Aspek` and `Bintang` only**, explicitly not `Pilar` or `Elemen`.
Ruling 1 above puts a bracket on the **archetype**, which is a fourth category and was named in neither
list. The reconciled rule, for the `CLAUDE.md` edit:

> **Bracket-once binds `Aspek`, `Bintang` and `Arketipe`. It does not bind `Pilar` or `Elemen`.**

This is consistent with rule 23's existing core convention (*"Indonesian name first, English term in
brackets once"*) and with the 2026-08-02 EN-display-layer ruling, which already names
`arketipe.name_en` and says the bracket convention applies to reading prose. **Nothing is being
reversed here** — the archetype simply had no entry on either side of the list.

### One defect this ruling exposes, and it needs a one-word ruling

`arketipe.name_en` is not internally consistent, and ruling 1 puts it in the most-read sentence of the
product:

```
$ node -e "const g=require('./docs/content/glossary.json'); for(const[k,v]of Object.entries(g.arketipe)) if(v.name_en) console.log(k, v.name_id, '|', v.name_en)"
甲 Jati       | The Teak
乙 Bambu      | The Bamboo
丙 Matahari   | The Sun
丁 Api Unggun | The Bonfire
戊 Gunung     | The Mountain
己 Taman      | The Garden
庚 Besi Tempa | The Forge
辛 Permata    | The Jewel
壬 Samudra    | The Ocean
癸 Embun      | Morning Dew
```

**Nine carry `The`. `Embun` does not.** Until now `name_en` was only ever rendered on the card, one name
at a time, where the inconsistency was invisible. In sentence 1 it is not: nine readers get
`Kamu adalah X (The Y)` and the tenth gets `Kamu adalah Embun (Morning Dew)`.

**RULED 2026-08-19: add the article. `Morning Dew` -> `The Morning Dew`.**

> *"Leaving 1 out of 10 without an article looks like an unedited mistake rather than an intentional
> choice. Readers comparing charts will spot the orphan instantly. `The Morning Dew` retains the exact
> same definite, mythical cadence as The Sun, The Ocean, or The Bonfire."* — Reyner

The alternative he weighed and rejected was dropping `The` from all ten for minimalism. Recorded because
the rejected option is what makes the ruling a decision rather than a default: uniformity was chosen over
brevity, and a later session proposing to strip the articles should know it was already considered.
`arketipe.name_en` also renders on the card, so this one word lands in two surfaces. It is COMMIT 0 of
`docs/prompts/L-opening-gate.md`.

## 8. WHAT THIS DOES TO THE PROMOTION GATE

**Precondition 3 as written is now known to be the wrong shape.** It reads *"Reyner has QA'd real
readings"* — an activity. He has. The activity passed and the product did not: 2 of 4 charts are
unsellable. A precondition satisfied by doing the checking regardless of what the checking finds cannot
gate anything.

**RESTATEMENT ACCEPTED, 2026-08-19.**

> *"A promotion gate that greenlights code simply because you spent time reading unsellable output is a
> fake safety net. Restating it to require that 100% of the reference QA set passes the Rp 19.000
> commercial threshold gives the gate actual teeth."* — Reyner

**Precondition 3, as it now reads: met when EVERY chart in the reference QA set renders and would be
sold at the live price.**

### The restatement bites harder than it looks, and Reyner should know before it is folded in

Under the old wording the read was the deliverable. Under the new one the RENDER is, and that changes
today's count.

| Chart | Live render 2026-08-19 | Sell verdict | Counts as pass? |
|---|---|---|---|
| chart 1 | `gemini` | YES | **yes** |
| chart 13 | `gemini` | NO | no |
| fresh-1996 | `gemini` | NO | no |
| chart 5 | **`module_assembly`** — floored | YES, on SUBSTITUTE prose | **unclear** |

**Chart 5's YES was earned on stored attempt-1 prose from the 08-18 probe, not on the live render.** The
live render floored. So the strict reading of the accepted restatement puts today at **1 of 4**, not 2 of
4 — a floored chart produced no sellable output at all, whatever a different day's prose reads like.

**This needs one more word from Reyner, and it is a real fork:**

- **Strict:** a chart passes only on a live `qa:renders` render. Chart 5 is unproven and today is 1 of 4.
  The gate has teeth but it also inherits the run-to-run floor variance PROGRESS already records — chart 5
  flipped between floor and `gemini` across three invocations of unchanged code on 08-17. A gate that a
  coin flip can fail will fail on a day nothing is wrong.
- **Lenient:** prose from a prompt-identical stored attempt counts, since register is a property of the
  words. Today is 2 of 4. But then the gate no longer measures what a real reader receives, which is the
  thing the restatement was written to fix.

**RULED 2026-08-19: STRICT, plus the harness fix after prompt L.**

> *"A promotion gate that relies on ghostly stored prose to claim a pass is just cope with extra steps.
> If Chart 5 floors on a live run, a paying customer gets nothing regardless of how brilliant yesterday's
> stored attempt looked. Strict holds the standard on actual generated output, and adding the n-renders
> harness change post-L ensures we measure real statistical stability rather than single-invocation
> luck."* — Reyner

**So: a chart passes precondition 3 only on a live render. Today is 1 of 4.** Chart 5 is unproven, not
passed — its sell verdict stands as evidence about the PROSE and about tranche 2's padding fix (section 6
is unaffected, since that question was always about words), and as no evidence at all about whether a
reader receives anything.

**The instrument follows in its own prompt, after L.** Cowork's objection was that a 4-of-4 gate on
single renders can fail on a day when nothing is wrong — chart 5 flipped between floor and `gemini` across
three invocations of unchanged code on 08-17. Reyner's ruling keeps the standard and accepts the
objection as a harness problem rather than a gate problem: n renders per chart, floor rate printed beside
each verdict. **Not in prompt L, and prompt L must not be read as closing precondition 3.**

| # | Precondition | State after this read |
|---|---|---|
| 1 | Xendit + live keys | MET |
| 2 | Rp 19.000 has a non-mirror deliverable | Card closed; PDF specced, not built |
| 3 | **Every chart renders and would be sold at the live price** (restated 08-19) | **NOT MET.** 1 or 2 of 4 depending on the fork above |
| 4 | `fact.relation_positions` | MET |

**Not blocking, but it surfaced during this read and belongs on the record:** `.env.local` defines
`GEMINI_API_KEY` and no `OPENAI_API_KEY`, while the render path reads both. `CLAUDE.md` rule 15
specifies Gemini primary, OpenAI secondary. Locally the secondary does not exist, so one dead key
floors every chart — which is what happened on 2026-08-12. Whether Vercel's production environment
defines `OPENAI_API_KEY` is not visible from the repo and only Reyner can check it. At promotion, a
provider outage with no failover means every reader gets the floor.
