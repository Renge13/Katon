<!--
STATUS: THE INDEX. Hand-written, because "what question does this answer" is a judgement no
generator can make. Its COVERAGE is machine-checked: `npm run check:qa` fails if an artifact in
this directory has no row here, or if a row names a file that no longer exists in either
docs/qa/ or docs/qa/superseded/.
Adding an artifact to docs/qa/ without adding its row is a failing build, not a nit.
-->

# docs/qa — the evidence index

**Nothing in this directory is ever edited and nothing is ever deleted.** These files are
evidence: an edited render is not one, and a deleted trace cannot be re-cited. Superseded
artifacts move to `superseded/`, they do not disappear.

## THE NAMING RULE, ruled by Reyner 2026-08-22

> **No two artifacts may differ only by a plural, a suffix letter, or a version digit.**

It cost a real mistake. `2026-08-22-renders-n10-postfix.md` and
`2026-08-22-renders-n10-postfixes.md` differ by one `s`, describe two different traces with two
different floor rates, and **sent Reyner to the wrong file while he was forming a sell/no-sell
verdict.** A citation that resolves to the wrong evidence is worse than a missing one, because
the argument still completes.

**Enforced in `scripts/check-qa-artifacts.mjs`, which runs in `npm test`** - the same reasoning
as the harness refusing to overwrite evidence rather than documenting that it should not. A
naming convention in a doc is a convention nobody reads at the moment they pick a filename.

**Name an artifact for what it MEASURES, never for which attempt it was.** `-postfix` /
`-postfixes` / `-verify2` / `-v2` are all that mistake. The one existing collision is
grandfathered with its reason in that script, because renaming a cited file breaks the
citations the rule exists to protect.

---

## Current

| Artifact | What question it answers | prompt | gate | Superseded by |
|---|---|---|---|---|
| `2026-08-17-renders.md` | The first real end-to-end renders. Does the chain produce servable prose at all? | - | - | - |
| `2026-08-18-rejections.md` + `2026-08-18-rejections.json` | WHICH Stage 6 checks actually fire, and how often, over a large trace. The rejection-cause census. | - | `1.9.0` | - |
| `2026-08-18-retry-depth.md` + `2026-08-18-retry-depth.json` | Does a regeneration buy a lower floor rate, and how much per extra depth? The depth curve, and the trace whose stored prose later served the depth-pair reads. | - | `1.9.0` | - |
| `2026-08-19-renders.md` | The renders Reyner read for THE READ. | - | `1.10.0-floor` | `2026-08-19-THE-READ.md` |
| `2026-08-19-THE-READ.md` | The five readings Reyner judged as the buyer, verbatim, with the banners. | - | - | - |
| `2026-08-19-THE-READ-worksheet.md` | The per-reading worksheet Reyner filled in while reading. **UNTRACKED** - present on disk, not committed. | - | - | - |
| `2026-08-19-READ-VERDICT.md` | Reyner's verdict and five rulings from THE READ. The document every later content tranche traces to. | - | - | - |
| `2026-08-19-retry-erosion.md` + `2026-08-19-retry-erosion.json` | What does a regeneration COST the prose? The findings-erosion measurement, at depth 2. | `2ff1a546fb7e6e53` | `1.9.0` | - |
| `2026-08-21-floor-cause-analysis.md` | Why each floored run floored, cause by cause, rather than as a rate. | - | `1.13.0` | - |
| `2026-08-21-renders.md` | Renders after the 08-21 gate work. | - | - | `2026-08-21-renders-n10.md` |
| `2026-08-21-renders-rule23-inserted.md` | Does the rule-23 bracket check reject real readings, and which ones? | - | - | - |
| `2026-08-21-renders-n10.md` | The first n=10 trace. Is a floor RATE measurable at all, given that n=1 returned 0/4, 2/4 and 1/4 on identical inputs? | `2ff1a546fb7e6e53` | `1.13.0` | `2026-08-22-renders-n10-postfixes.md` |
| `2026-08-22-renders-n10-postfix.md` | An n=10 trace taken mid-session, BEFORE the final post-fix gate. **Not the artifact precondition 3a was measured on** - see the row below, and read the naming rule above. | - | - | `2026-08-22-renders-n10-postfixes.md` |
| `2026-08-22-renders-n10-verify2.md` | A verification n=10 trace; the source of the "`fact.condition_named` survives the whole budget" reading that the erosion ladder later corrected. | - | - | `2026-08-22-renders-n10-postfixes.md` |
| `2026-08-22-renders-n10-budget3.md` | Does `REGENERATION_BUDGET` 3 move the floor rate? It did: pooled 20% -> 10%, against a docblock prediction of "little or not at all". | - | - | - |
| **`2026-08-22-renders-n10-postfixes.md` + `2026-08-22-renders-n10-postfixes.json`** | **THE artifact precondition 3a was measured on: pooled floor 4/40 = 10% at n=10.** The JSON stores all 72 attempts of the 40 runs, which is what makes every zero-cost artifact below possible. | `22316c3349d0ea46` | `1.17.0` | - |
| `2026-08-22-depth-1-vs-3-postfixes.md` | Does a reader who waited for two extra regenerations get a WORSE reading? The depth-pair read Reyner ruled on: *"depth 3 is thinner, not tighter."* Zero cost, from the postfixes JSON. | `22316c3349d0ea46` | `1.17.0` | - |
| `2026-08-22-owed-samples.md` | Two readings the harness stored but never printed: a fresh-1996 run WITHOUT the opening flag (the printed one had it, 2 of 10 do), and a chart-5 run that is a real render rather than the floor. Zero cost. | `22316c3349d0ea46` | `1.17.0` | - |
| `2026-08-21-renders-rule23-enforced.md` | What did rule-23 bracket-once ENFORCEMENT do to the renders, and what did it cost? **This is #53s reopen baseline**, and it existed only on the closed `feat/rule23-enforced` branch until `986c450` - the evidence was left behind the question it settles. **READ THE GATE COLUMN BEFORE COMPARING ANYTHING TO IT:** measured at `1.12.0`, and `main` is five versions on, so a fresh run against these numbers is not like for like. `main` carries the `-inserted` variant, which is a different measurement. | `2ff1a546fb7e6e53` | `1.12.0` | - |
| `2026-08-27-floor-after-heading-ruling.md` | What does a reader actually GET when the provider fails, now that the heading names the fact and the body opens on the meaning (RULED 2026-08-26)? A floored reading served through the real routes and the real page, verbatim. **Served for zero dollars with an INVALID Gemini key** - the method is recorded in the artifact, because the same arrangement is a live production failure mode: the render fence tests that a key is PRESENT, never that it WORKS. | n/a | `1.17.0-floor` | - |
| `2026-08-26-card-b-overflow.md` | Does the paid card's prose fit, on every chart rather than the one that reported it? **It did not: 9 of 13 fixture charts overflowed, worst +121px, and the reported chart ranked 7th of 13 by prose.** Records the reclaim ledger, the proof that Card A is byte-identical, and verification past the fixture with a maximum-prose card per stem. **Records one open number: 7px of slack on 癸 at maximum prose.** | n/a | n/a | - |
| `2026-08-26-card-capture-verification.md` | Does the capture fix work, can it be broken again on demand, and does the page still render at desktop and phone width? The un-fix reproduces `distinct: 1` on both cards; the probe goes 16 findings -> 0 -> 16 -> 0 across the four builds. Carries the two exported cards as committed images, because a PR body cannot render a relative image path. **Records one still-open defect: Card B's content is 85px taller than the card.** | n/a | n/a | - |
| `2026-08-26-card-capture-cause.md` | Why the free share button produced a blank rectangle. Not a render artifact and it carries no prompt or gate version: it measures the CARD CAPTURE, which no gate ever looked at. Establishes the cause (html-to-image relayouts the clone to the output size, and the canvas centres its child), refutes the stopgap in `prompts/O-amend-card.md` (the download target is damaged too, 19.8% of pixels), and proves the paid Card B was never on the broken path. | n/a | n/a | - |

## Superseded

**Kept, not deleted.** Each was verified cited NOWHERE before being moved -
`grep -rl <name> . --exclude-dir=node_modules --exclude-dir=.git` returned zero. A superseded
artifact that is still cited stays where it is and gets a `Superseded by` row instead, because
moving it would break the citation.

| Artifact | What it answered | Superseded by, and why |
|---|---|---|
| `2026-08-21-floor-readings.md` | Floor rate at n=1 per chart, 08-21. | `2026-08-21-renders-n10.md`. n=1 was found unable to answer the question at all: three consecutive runs of the same four charts returned 0/4, 2/4 and 1/4 with the failing checks identical. |
| `2026-08-21-floor-readings-v2.md` | The same measurement, re-run. | Same. The `-v2` is itself the naming mistake the rule above now blocks: it names the attempt, not the measurement. |
| `2026-08-22-depth-1-vs-3-readings.md` | The depth-pair read, built from the **08-18** retry-depth JSON. | `2026-08-22-depth-1-vs-3-postfixes.md`, which asks the same question on the CURRENT gate and prompt. A depth curve does not carry across a gate change - that is the 08-22 lesson recorded in `lib/render/config.js` - so the older-trace version cannot support the ruling. |
