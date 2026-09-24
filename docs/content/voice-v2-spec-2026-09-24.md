# Voice v2 spec: a free writer and a strict factual reviewer (Cowork, 2026-09-24)

**NOT DURABLE UNTIL CODE COMMITS IT** as `docs/content/voice-v2-spec-2026-09-24.md`, alone.
**STATUS: APPROVED FOR ROUND 2 by Reyner, 2026-09-24, with four changes applied (JSON boundary wording, D2
loosened, J1/J2 invention vs interpretation, auditable judge output) plus one compat line. §8 marked.**
**Supersedes §3, §4 and §6 of `voice-v2-worksheet-2026-09-24.md`** (the H-table, the voice target and the
round-2 plan). The worksheet's §1-§2 (principle, measurements) and §5 (samples S1-S4) stand.
Ruled direction, Reyner 2026-09-24: **Katon's engine owns truth. Gemini owns expression.**
**Do not invent facts. Interpret the supplied facts freely.** v2 is smaller than v1, not larger.

---

## 1. Architecture

```
engine (facts, meanings, relations)  ->  WRITER (Gemini, short prompt, free)  ->  REVIEWER (strict)  ->  serve / regenerate / floor
```

- **The writer does not prove every sentence.** It gets the facts, one rule, the must-nots and the output
  format. No style rulebook, no image limits, no sentence rules, no word targets.
- **The reviewer catches what matters**: invented chart facts, invented relationships or causality,
  unsupported psychological certainty, fatalism or prediction, compat verdicts or scores,
  medical/financial claims, missing critical meaning.
- **A rule comes back only on evidence.** If round-2 output shows a real failure (slang, meta talk, a tic),
  that one rule is re-added, with the output that justified it. Nothing is carried over "just in case".
- **THE GATE IS INTENTIONALLY LOOSE (Reyner, 2026-09-24).** Verbatim: "The gate is intentionally loose. A guardrail is added only after a real failure appears in rendered output: real failure → fixture → narrow guardrail → re-test. Never: imagined failure → new rule. The main MVP risk is a sterile reading, not a permissive one."
  This governs the reviewer too: no word list is added to D1-D4, and the judge's J3 stays the question
  "is this more certain than the supplied facts and meanings support?", never a lexicon. Words like
  "selalu" or "tidak pernah" may illustrate J3 in the judge prompt; they are not a check.

---

## 2. The writer prompt, mirror (draft, complete; replaces all 293 lines of `renderer-prompt.txt`)

> You write a Katon reading in Indonesian, for one person, from a BaZi chart that Katon's engine has
> already calculated.
>
> **Treat the supplied JSON as the complete source of chart facts available to you:** every chart fact,
> star, pillar and relationship, and what each one means for her (`label_meaning`, `gift`, `cost`, and the
> relation fields in `provenance`). **Do not invent facts. Interpret the supplied facts freely.**
>
> Interpret freely means: explain why a fact matters to her. Connect the facts that belong together and say
> what it means that they sit together. Show the pull between a gift and its cost, and how a strength can
> become a burden. Use imagery when it makes a supplied meaning clearer. Give advice only where it follows
> naturally from what you just showed her. Write the way a perceptive person writes to someone they have
> studied closely: concrete moments she will recognise, varied rhythm, lines she will remember.
>
> Do not invent means:
> - no chart fact, star, pillar, position or relationship that is not in the JSON;
> - no claim that one fact causes another unless the JSON states that relation;
> - no claim about her more certain than her facts support; a tendency is written as a tendency;
> - no prediction, destiny or inevitability; timing is weather, never fortune-telling;
> - no medical, financial or legal advice; never rank an element, an Aspek or a strength state as better
>   or worse.
>
> Must be in it: begin with her, meaning her Day Master, her strength and her main profile (the first three
> facts). Every required point's meaning appears, including its cost.
>
> Form: address her as `kamu`. A named term is written as its Indonesian name with `label_bracket` in
> brackets once, at first mention (`Bunga Persik (Peach Blossom)`); a fact whose `label` is null has no
> name, so describe it instead. Use palace names as given, and `provenance.positions_id` verbatim when you
> list positions. Keyboard characters only, no Chinese characters, no percentages or scores. Return only JSON:
> `{"blocks":[{"fact_ids":[...],"heading":"...","text":"..."}],"penutup":"..."}`. `fact_ids` lists the facts
> each block draws on. Headings are short and plain. Paragraph breaks are two newlines.

Everything in "Form" exists because the app, the PDF or the reviewer reads it. That is the test for
anything added later: **if no code reads it and no reader is harmed without it, it does not go in.**

## 3. The writer prompt, compat (draft; replaces `compat-renderer-prompt.txt`)

> Same opening, same rule, same must-nots, for two people. `core.a` / facts marked A are **the reader
> (`kamu`)**; B is `dia`, described and never addressed. Who gives and who receives is in `provenance`
> (`cycle`, `from`/`to`, `b_hits_a`, `a_hits_b`); write it as kamu and dia, never "salah satu".
>
> Help her understand both people before the relationship: first who she is in this relationship, then who
> he is, then what happens between them, told as patterns she will recognise in an ordinary week. Do not
> compress distinct relationship dynamics merely to keep the reading short.
>
> Additional must-nots: no score and no overall verdict (never "cocok" or "tidak cocok" as a conclusion);
> never rank the two people; no advice to stay or leave; a clash is a map, never a judgement. The penutup
> speaks to her about what this relationship asks of each of them, and does not sum the pair up.
>
> Form: as the mirror, plus the pattern and quadrant names exactly as the facts give them.

---

## 4. The reviewer

Two layers. **Deterministic first** (cheap, cannot hallucinate), then **one judge call** for the things
only reading can catch.

### 4a. Deterministic checks (code; most already exist)

| # | Catches | How | Result |
|---|---|---|---|
| D1 | invented chart fact | every glossary term name (badges, Aspek, relations, palaces, conditions from `glossary.json`) that appears in the prose must belong to a SUPPLIED fact | hard |
| D2 | missing critical fact | every required point is represented by a block `fact_id`. The fact's label or name does NOT have to appear in the prose; whether its meaning was covered is J4's call | soft (regenerate) |
| D3 | form | Chinese characters, typographic characters, percentages/scores, malformed JSON, `kamu`/`dia` direction and addressing B (existing `pair.js`) | hard |
| D4 | ethics lexicon | the existing `verdict`, fatalism, medical, financial, **ranking and self_harm** entries of `blocklist.json` | hard |

**CORRECTED 2026-09-24 (Reyner, on Code's flag).** This row first read "the existing `verdict`, fatalism,
medical and financial entries of `blocklist.json` ONLY". That list silently dropped two of
`forbidden_content`'s five categories: `ranking` (CLAUDE.md rule 25, no ranking of gods or strength states
as good or bad) and `self_harm`. Code built it literally, logging both instead of gating, and flagged it.
Both are hard under D4. They are not new rules, they are existing ones the table omitted.

**Removed from the gate** (kept as logged metrics where useful): every `style.*` category (slang, particles,
hedging, `bukan X melainkan Y`, `secara`, essay connectives, tension_collapse tokens) and stem-overlap
coverage. If round 2 shows one of them is needed, it returns on that evidence.

### 4b. The judge (second model call, structured output)

Input: the facts JSON and the rendered prose.

**Invention vs interpretation (the judge's governing question).** The writer is EXPECTED to write sentences
that do not exist in the JSON. That is the product. A sentence is never flagged because it is not verbatim
in the JSON. For every candidate sentence the judge asks:

> *Can this statement be reasonably grounded in one or more supplied facts or their supplied meanings,
> without introducing a new external chart fact, relationship, causal mechanism, or certainty?*

Yes = interpretation, pass. No = a finding. Worked example, expected to PASS: "Orang melihat ketenanganmu.
Mereka jarang melihat berapa banyak yang kamu tahan untuk tetap terlihat tenang." (grounded in
`element_dominant_Water` gift/cost and `aspek_convergence_正官` cost; no new chart fact).

| # | Class | Question the judge answers | Result |
|---|---|---|---|
| J1 | unsupported invention | Does this sentence introduce a chart fact, star, pillar, position or relationship that no supplied fact or supplied meaning can ground? (Interpreting what a supplied fact means for her is NOT invention.) | hard |
| J2 | invented causality | Does it assert that one thing causes or explains another where no supplied relation field (`cycle`, `relation`, `relation_to_day_master`, `relation_to_season`, `from`/`to`, hits) and no supplied meaning supports that link? An interpretive connection already supported by those fields or meanings passes. Co-location always passes. | hard |
| J3 | unsupported certainty | Is it more certain about her psychology or behaviour than the supplied meaning supports? | soft: one regeneration with the quotes fed back |
| J4 | meaning coverage | For each required point: is its meaning present, including the cost? Quote where. | missing cost = hard; missing other = soft |

**The judge must show its grounding (auditable).** Every J1-J4 finding carries:
- `sentence`: the quoted sentence;
- `class`: J1 / J2 / J3 / J4;
- `grounding_considered`: the fact ids it checked as possible grounding;
- `supported`: briefly, which part of the sentence those facts do support;
- `unsupported`: briefly, the specific claim that remains unsupported (for J4: the meaning that is missing).

A finding without `grounding_considered` and `unsupported` is malformed and is ignored, not acted on.
Findings are stored with the render so any rejection can be read and argued with later.

**The judge is an instrument, so it is shown failing before it is trusted (CHECK 2).** Before any v2 render
is served, the judge runs on:
- **a seeded bad set:** S1-S4 with one deliberate violation each (an invented star, an invented cause, a
  certainty upgrade, a dropped cost). It must catch all four classes;
- **the clean set:** S1-S4 as written. False positives are counted and each one is read.
Only then does it gate real renders. The judge runs once per unique chart (readings are cached), so its
cost is per chart, not per page view.

**Floor stays.** A render that fails after its regeneration is served as the floor, exactly as today.

---

## 5. Engine changes (small; no new BaZi)

- **E1.** Drop `actionable` from `must_cover` (`lib/semantic/index.js:214`). Actionables stay in the JSON
  as material the writer MAY use.
- **E2.** The pair payload carries both people's mirror facts, by reusing `buildSemanticJson` for A and B.
  Without this, act 1 and act 2 are impossible.
- **E3.** Coverage moves from stem overlap to D2 + J4.

---

## 6. The boundary Reyner named, and where it actually lives

Reyner's two test lines:
- "Orang menaruh tanggung jawab padamu sejak muda." This is the **engine's own `gift` string** for
  `aspek_convergence_正官`, verbatim (`glossary.json`).
- "Situasi yang menakutkan bagi orang lain adalah arena harianmu." This is the **engine's own `gift` string**
  for `element_dominant_Water`, verbatim.

So they are not renderer overreach, and **the reviewer cannot catch them**, because they are supplied facts
by definition. "Sejak muda" is a biographical claim and "arena harianmu" a strong one, written into the
glossary. **Unsupported certainty therefore has two homes:**
1. **the writer's inferences** (J3 catches these). The real test lines from S1-S4 are Cowork's own:
   "berapa banyak yang kamu tahan untuk tetap terlihat tenang" (S3), "Caramu bekerja adalah salah satu hal
   yang menarik dia mendekat" (S4), "Api yang terus memberi tanpa diisi akan cepat habis" (S4);
2. **the glossary itself**, which needs its own certainty pass: the same J3 question asked of every
   `gift`/`cost`/`label_meaning` string. That is content work for Reyner. **Proposed: park it until after
   round 2**, as a DEFERRED REGISTER row, so v2 is judged on the writer alone first.

---

## 7. Round 2

1. Code builds E1-E3, the two short prompts and the reviewer behind a `VOICE=v2` switch, preview only.
   Every accept-changing edit is its own commit with its own `STAGE6_VERSION` bump.
2. Judge calibration (§4b) first; quote the catch table and the false positives.
3. Render 5 fixture charts + 2 pairs under v1 and v2. Report per reading: words, hard fails, regenerations,
   floor or not, judge findings with quotes.
4. Reyner reads v1 against v2 as PDFs and answers one question: **would a person pay to read this?**
5. Ship v2, or park it. Two rounds, then decide.

## 8. Reyner rules

| # | Question | Cowork | R |
|---|---|---|---|
| V1 | Writer prompts §2-§3 as the whole prompt (edit any line) | yes | **approved** with JSON-boundary wording and compat line changed |
| V2 | Reviewer §4: deterministic D1-D4 + judge J1-J4; style bans and stem overlap out of the gate | yes | **approved** with D2 loosened, J1/J2 invention vs interpretation, auditable findings |
| V3 | Engine E1-E3 | yes | **approved** |
| V4 | Glossary certainty pass parked until after round 2 (§6) | yes | not contested (stands) |
| V5 | Launch if DOKU clears before round 2 ends: on v1, v2 after | yes | not contested (stands) |

**Reyner, 2026-09-24:** do not expand the theory. Build the smallest implementation that tests
*free Gemini writer + supplied semantic universe + strict factual reviewer*. Not to be added: new style bans,
metaphor quotas, sentence-length rules, word-count targets, new coverage heuristics, new BaZi facts, another
writing framework, additional reviewer layers.
