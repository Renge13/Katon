# Prompt AT: voice round 6, the last depth round (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AT-voice-round6.md`. Commit it with your first change.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No production change: this is a measured experiment, and Reyner judges it blind. **This is the second and last round on depth (two-round cap).** If neither arm is acceptable, stop and report. Do not run a round 7.

## Round 5, unblinded (Reyner's blind read, 2026-09-30)
- **Chart1:** best r5-01 (B). Also yes: r5-03 (A). Rejected: r5-09 (D), r5-11 (C).
- **smewTN:** least bad r5-02 (A). Rejected: r5-05 (B, nested brackets), r5-08 (C), r5-12 (D).
- **Chart13:** best r5-04 (A). Maybe: r5-06 (B, a coaching question in the penutup).
- **Every C and D reading was rejected:** "mechanism lecture", "too long", brackets throughout. His "just right" readings ran 377-440 words, and every reading over 630 was "too long".

**Cowork's read:** DEPTH's "why the engine says it (from `provenance`)" made the stronger models teach the element maths. The 700-1000 target was wrong.

## Reyner's rulings, 2026-09-30, verbatim
```
* Model: 100% yes on Flash-Lite. It won the blind test, sounds vastly more human, and the Rp 50 margin is a massive business advantage. Close the comparison.
* Setting: Test both A and B. Now that the bracket bug and preachy endings are neutralized, we need to see how the pure tones of A (calmer) and B (livelier) perform on an even playing field with the new constraints.
* Prompt: Approved across the board. Dropping "why the engine says it" is the silver bullet. Users are paying for the revelation, not the algebra behind it. Capping the length at 400–550 words forces the model to be ruthless with its editing, and killing the rhetorical questions stops it from sounding like a cheap life coach.
* Crowded Charts: Fold the clashes. If a chart has multiple pillar clashes, the user just experiences it as a highly chaotic period, not as three distinct mechanical events. Name the badges to give them the specific "hook" they paid for, but weave the friction into a single, cohesive narrative of how it actually feels in their daily life.
* English Brackets: Restrict them heavily. Keep them only for the Archetype, Aspek, and Bintang on the very first mention. Drop them entirely for relations like Benturan and Gesekan.
```
**Keyed referents:**
- "Close the comparison" re-closes the 2026-09-26 no-bake-off ruling, which AR reopened for one round. The writer stays `gemini-3.1-flash-lite`.
- "The bracket bug and preachy endings are neutralized" refers to AS Amendment 1 §B and to this prompt's §2 item 5.

## §1. Prerequisites on the experiment branch
Round 6 runs with these fixes in place. Use them merged if they are; otherwise apply them on the branch, and say which:
- AS §3 (`fact.strength_contradiction`: the verdict, not the word);
- AS Amendment 1 §B (the normaliser never nests brackets).

Reuse round 5's harness (`scripts/qa-voice-depth-r5.mjs`), in memory, with no cache writes and a 120s timeout.

## §2. The ROUND-6 prompt: today's v2 prompt with exactly these changes
Quote every changed line, before and after, in the report.
1. **No mechanism.**
   - In "Interpret freely means", delete "and, where it helps, why the engine says it, using only the reasons in `provenance`".
   - Add: "Never explain how the chart works: how elements feed, control or combine, how a star is derived, or why the engine concluded something. She reads for what it means in her life."
   - `provenance` stays in the JSON for the gate. The writer is no longer asked to use it.
2. **Depth first, as a story.** Replace "After those, choose the facts that make the strongest reading. `required_points` shows what the engine ranks highest; beyond the first three it is guidance, not a checklist." with: "Then choose the facts that matter most for her, three or four in all including the first three, and give each room. Tell each as a short story: how it shows up in her days, with one concrete scene; what it costs her; and, when there is a cost, what helps, from its `actionable`, in your own words. `required_points` shows what the engine ranks highest."
3. **Badges are named.** Add: "Every `bintang` fact appears, by name, in one or two sentences of what it means for her."
4. **Relations are folded.** Add: "When the chart has more than one relationship between pillars (Benturan, Gesekan, Simpul, Ikatan and the like), do not explain them one by one. Weave them into one story of how that friction or pull feels in her daily life. Name each at most once, in passing. If you give a relationship's pillars, give all of them exactly as `provenance.positions_id` lists them; you may also leave the pillars out."
5. **What helps, and no questions.**
   - Replace "Advice is optional, never required." with "When you write about a cost, end that part with what helps."
   - Replace the coaching-question line with: "no questions addressed to her at all, rhetorical or reflective, anywhere in the reading."
   - Add: "Never point to facts the reading leaves out or 'has not explored yet'."
6. **Length.** Add: "A full reading is roughly 400-550 words. Be ruthless: cut a fact before you thin every fact."
7. **Brackets (Reyner's ruling).** In "Form", the English bracket goes only on an Arketipe, Aspek or Bintang name, once, at first mention. Relations get none.
   - **Fix it upstream, not only in the prompt (CHECK 3):** the writer payload carries no `label_bracket` for relation facts, so there is no English to copy.
   - The gate's sanctioned-bracket rule matches: a relation's English is unsanctioned.
   - Report every other place relation English appears: the floor, the PDFs, AQ §4's italics, the pair prompt. Change none of them in this round.
8. **Everything else is unchanged:** every "Do not invent" line, the JSON shape, and the examples.

**Checks versus folding.** Report every check that would fire on a correctly folded reading: `coverage.missing_point`, `coverage.field_dropped`, `fact.relation_positions`, `fact.palace_dropped`, and any others. For each, say whether it rejects or logs, and quote the finding.
- Loosening a check to allow folding is within this ruling. Loosening is not the same as widening.
- Make that change on the experiment branch only, one commit per check, each shown red first.
- A check that guards a FALSE statement (a wrong pillar, a wrong position) is not loosened.

## §3. Arms and charts
| Arm | Model | Temperature | Prompt |
|---|---|---|---|
| A | `gemini-3.1-flash-lite` | 0.2 | ROUND-6 |
| B | `gemini-3.1-flash-lite` | 0.9 | ROUND-6 |

- **Five charts:**
  - chart1, chart13, and smewTN (2001-02-14 13:00 female);
  - the fixture chart with the MOST relation facts;
  - the fixture chart with the FEWEST facts overall.
  - Name the last two and give their fact counts.
- **Ten readings, blinded** as `reports/voice-v2/round6/r6-01.pdf` … `r6-10.pdf`, in random order. The key is `KEY.json` in the same folder. Keep the QA doc's arm-revealing columns (cost, ms, tokens) out of anything Reyner opens first, as round 5 did.
- **A floor is still a result.** Give the floor reason and the sentence that fired.

## §4. Measure per reading (keyed by blinded id)
Record:
- words;
- served or floor;
- regenerations;
- hard and logged findings;
- bintang named (x / total);
- relation facts, and how many got a block or explanation of their own;
- English brackets on relations (target 0) and in total;
- questions addressed to her (target 0);
- blocks with a cost that end on what helps (listed for a read, not a heuristic score);
- sentences that explain the mechanism (listed);
- latency;
- tokens;
- cost.

Also run the round-5 truth sweep (`scripts/count-portrait-claims.mjs` and the fact checks) on drafts and served text, and list every claim the engine can't back.

## §5. Stop and report
Nothing changes in production. Reyner reads the ten PDFs blind. Cowork then writes the switch: temperature, prompt version, and which §2 check changes go to main, each as its own PR.

End with the split.
