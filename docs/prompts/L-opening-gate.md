<!--
STATUS: QUEUED BUILD PROMPT. Written by Cowork 2026-08-19 from Reyner's rulings in
docs/qa/2026-08-19-READ-VERDICT.md. Read that verdict first — it carries the measurements this
prompt's expectations are built on, and the reason the first diagnosis was wrong.
The verdict file lands on main, ALONE, before any commit below (the #28 ruling).
-->

# Prompt L — the archetype in sentence 1, the bracket check, and `The Morning Dew`

**Four commits, in this order, each measured on its own.** Rule 13: never fit two candidate terms in
one measurement. Do not bundle them, and do not reorder them — commit 2's measurement is only
interpretable against commit 1's.

**Baseline, measured 2026-08-19 at zero cost over the 77 stored attempt proses in
`docs/qa/2026-08-18-retry-depth.json`.** Archetype name present in the first 250 characters:

| Chart | Expected | All attempts | Passing only |
|---|---|---|---|
| chart 5 | Matahari | 21/22 (95%) | 9/10 (90%) |
| chart 1 | Matahari | 18/22 (81%) | 7/9 (77%) |
| chart 13 | Bambu | 0/18 (0%) | **0/10** |
| fresh-1996 | Samudra | 2/15 (13%) | **0/10** |
| **TOTAL** | | 41/77 (53%) | **16/39 (41%)** |

Re-run that measurement before you start. If the numbers moved, something changed under it and this
prompt's expectations are stale — stop and say so.

---

## COMMIT 0 — `The Morning Dew`. CONTENT ONLY. Land this first.

**Ruled by Reyner 2026-08-19:**

> *"Add `The` and make it `The Morning Dew`. Leaving 1 out of 10 without an article looks like an
> unedited mistake rather than an intentional choice. `The Morning Dew` retains the exact same definite,
> mythical cadence as The Sun, The Ocean, or The Bonfire."*

One field: `arketipe.癸.name_en`, `Morning Dew` -> `The Morning Dew`. All nine others already carry the
article and are correct — verify that before and after rather than trusting this sentence:

```
$ node -e "const g=require('./docs/content/glossary.json'); for(const[k,v]of Object.entries(g.arketipe)) if(v&&v.name_en) console.log(k, v.name_id, '|', v.name_en)"
```

**Apply it through `scripts/apply-rulings.mjs`, not by hand.** It is one field, which is exactly the case
where a hand edit feels justified and the guard exists anyway — `--expect` asserts count, line extent and
shape, and it is what caught the tranche-1 corruption. Write the one-field rulings file, then:

```
node scripts/apply-rulings.mjs <rulings-file> --expect 1 --dry
node scripts/apply-rulings.mjs <rulings-file> --expect 1
```

**Why this is commit 0 and not folded into commit 1:** it is content and commit 1 is engine, and those do
not ride together. It has no effect on commit 1's measurement — no chart in the QA set is 癸 — so ordering
is about hygiene, not dependency. Say so in the commit message so a later reader does not hunt for a
dependency that is not there.

**The card reads the same field.** `arketipe.name_en` renders on the card as well as in the reading, so
re-run whatever card assertion covers name rendering. This is a one-word change to a string that appears
in two surfaces.

## COMMIT 1 — the engine requires the archetype. ENGINE ONLY.

**The cause is not the prompt.** `core.archetype_name_id` is in the semantic JSON for every chart, but
`core` is context; obligation lives in `required_points`, and the day-master entry is:

```
$ node --conditions=react-server scripts/emit-semantic.mjs 1989-02-04 04:00
  {"fact_id": "day_master_Wood", "importance": 55, "must_cover": ["label_meaning","gift","cost"]}
```

The day-master fact's `label` is the ELEMENT (`Kayu`). The archetype is not in `must_cover`, so the
renderer is never obliged to name it and Stage 6 has nothing to check. Where it survives it survives
because `Api Matahari` is idiomatic and `Kayu Bambu` is not.

**Make the archetype name an engine-required point.** Rule 14: the engine owns the fact and its
obligation; the LLM only chooses words. Do NOT fix this by adding an instruction to
`renderer-prompt.txt` — a prompt nudge is what the measurement above already refutes.

**Reyner's ruled opening pattern — archetype ALONE, English bracketed once:**

```
Kamu adalah Bambu (The Bamboo).
```

The element arrives in the next breath, not in front of the image. This applies to all ten stems, which
means it also rewrites the two openings Reyner ACCEPTED: `Kamu adalah Api Matahari` becomes
`Kamu adalah Matahari (The Sun)`. **Flag that in your report.** Those two readings were praised, the
pattern is being applied to prose that already worked, and Reyner has not read the result.

**This changes what Stage 6 accepts, so `STAGE6_VERSION` bumps in the same commit** — `1.10.0` ->
`1.11.0`, per the repo convention on the constant's own docblock. `persistRendered` stamps it onto every
cached row so "which readings passed under which rules" stays answerable; a stale constant is the one
thing that makes it unanswerable.

**Measurement for commit 1, and pick metrics with samples:** re-run `npm run qa:renders` and report
per-chart archetype presence. Expectation is 4 of 4, and **charts 13 and fresh-1996 are the ones that
prove it** — they were 0 of 10 each. Report the floor rate alongside it: a new required point is a new
way to fail coverage, and if the floor rate climbs off 3% this trade needs Reyner before it ships.

**That artifact is also the input to a re-read, and the gate it feeds is now stricter.** Reyner accepted
the restatement of promotion precondition 3 on 2026-08-19: **it is met when every chart in the reference
QA set renders and would be sold at the live price.** So the `qa:renders` file commit 1 produces goes
back to him, and 3 of 4 does not pass. **Do not report commit 1 as closing precondition 3** — it removes
the known cause of two failures. Only Reyner's read closes it.

**AMENDED after this prompt was first written — Reyner ruled STRICT on 2026-08-19.** The fork was whether
prompt-identical stored prose could stand in for a chart that floored on the live run. It cannot:

> *"A promotion gate that relies on ghostly stored prose to claim a pass is just cope with extra steps.
> If Chart 5 floors on a live run, a paying customer gets nothing regardless of how brilliant yesterday's
> stored attempt looked."* — Reyner

**So commit 1's report must state the `source` value per chart, not only archetype presence.** A chart
that comes back `module_assembly` is a precondition-3 failure whatever its prose reads like — chart 5
floored on the 08-19 run, so it is currently unproven rather than passed, and today's true count is
**1 of 4, not 2**. Archetype presence and `source` are two different columns and both belong in the
table.

## COMMIT 2 — the bracket check. GATE ONLY.

Reyner's ruling, section 3 of the verdict, reconciled with section 7:

> **Bracket-once binds `Aspek`, `Bintang` and `Arketipe`. It does not bind `Pilar` or `Elemen`.**

Amend `CLAUDE.md` rule 23 to say exactly that. Nothing is reversed — the archetype had no entry on
either side of the old list.

**Add the check.** Rule 23 is currently enforced by nothing, which is how chart 1 shipped
`Aspek Pengelola` and `Aspek Pengatur` with **0 of 2** bracketed and passed the gate at attempt 2.

`STAGE6_VERSION` -> `1.12.0`, same commit. **Its own measurement**, separate from commit 1's: how often
does the check fire on the stored corpus, and does the floor rate move again.

**Two measurement traps, both real:**

1. **`elemen` is 13 of 170 bracketed today.** Those 13 are now the exception to sweep, not the
   convention. The check must not fire on them as violations — it must not look at `elemen` at all.
2. **Do not re-measure brackets from `docs/qa/2026-08-19-THE-READ.md`.** Cowork's own explanatory prose
   in that file contains `Aspek Pemikir` and a naive regex counts it as reading content. Measure against
   the raw attempt prose in the probe JSON.

## COMMIT 3 — two harness defects. Independent of both above.

1. **`scripts/qa-renders.mjs`'s header comment disagrees with its own artifact.** It claims two of four
   charts floored on 2026-08-17. `grep -n '| \`source\` |' docs/qa/2026-08-17-renders.md` returns
   `gemini, gemini, module_assembly, gemini`, and the file's own heading says `1 of 4 ARE THE FLOOR`.
   Establish which run the comment describes and make it name that run, or correct it. **Do not change
   the artifact.**
2. **`assembleFallback` emits an empty `### ` heading.** Reproduce in chart 1's floored render in
   `docs/qa/2026-08-17-renders.md`, between `Setengah Gabungan` and `Aspek Pengatur`. A floored reading
   is served to real readers, so this is a live surface, not a probe artifact. Add the assertion
   wherever the fallback's block structure is already tested.

---

## NOT IN THIS PROMPT — do not take these

- **Cross-chart verbatim repetition** (9 sentences in 2+ charts, one in 3 of 4) is ruled unacceptable but
  is CONTENT work: Cowork drafts variants, Reyner rewrites, it lands as a rulings file. Not code.
- **`quietFloor`** stays at 70. The 08-11 re-ask is closed. Do not touch it.
- **No wall check for paragraph collapse.** Ruled acceptable. Depth 2 stays.
- **The n-renders QA harness change.** Ruled 2026-08-19 and QUEUED BEHIND THIS PROMPT, see `NEXT.md`.
  `qa:renders` runs each chart ONCE by design, and a strict 4-of-4 gate on single renders can fail on a
  day when nothing is wrong — chart 5 flipped between floor and `gemini` across three invocations of
  unchanged code on 08-17. The fix is n renders per chart with the floor rate printed beside each
  verdict. **It is deliberately excluded from L. Do not fold it in, and do not "improve" `qa:renders`
  toward it while doing commit 3** — commit 3 touches that file's comment and nothing else.

## Standing constraints for this prompt

- Engine changes and calibration in separate commits.
- The commit message must describe everything staged. Run `git status` and read it before writing the
  subject line.
- `PROGRESS.md` MEASUREMENTS gets a dated row per commit. Numbers never enter `CLAUDE.md` as locked
  constants (rule 8).
- Low on context mid-sequence: stop and report rather than half-landing a change.
- Flag anything in the docs that contradicts what you find. Twenty-plus spec errors have been caught
  that way, all of them Cowork's — including the first diagnosis in the verdict this prompt implements.
