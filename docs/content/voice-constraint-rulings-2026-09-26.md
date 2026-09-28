# Voice constraint rulings: Reyner, 2026-09-26

STATUS: RULED by Reyner (chat, 2026-09-26). TIMING AMENDED BY REYNER THE SAME DAY: the voice work runs NOW, IN PARALLEL with the DOKU wait, and it is LAUNCH-CRITICAL. Katon does NOT launch on v1 because the DOKU gate is met. Launch sequence: frame-hit truth fix -> Reyner's examples -> simplify constraints -> deterministic validation updates -> representative test -> Reyner's acceptance -> launch (the DOKU production gate is independent; no model bake-off, no semantic-judge checkpoint; Reyner 2026-09-26, MVP). Judges J1-J4 (rows C3-C6) are development/QA tools for sampled calibration only, never in the production render path (Reyner 2026-09-26, MVP). Two-round cap = a DECISION CHECKPOINT, NOT A QUALITY CEILING: if round 2 is not accepted, nothing launches automatically; Reyner chooses to accept, run one more targeted round, or change the approach. Its purpose is to prevent endless iteration, not to force a voice through. ROUND 4 (Reyner, 2026-09-28, B30): voice acceptance is CONDITIONAL on AJ §2 (one pair opening), AJ §3 (no nested brackets) and B31 (the example phrase removed from the open-ended close); the Penyeimbang Unsur question is open under AJ §4 and is not part of it.
Source audit: Cowork's writing-constraints audit (Claude project `claude/KATON-writing-constraints-audit-2026-09-26.md`), read on the `feat/voice-v2` working tree. Row ids B1-B29 and C1-C7 refer to that audit.

## Principles (ruled)
- **Strict input, free interpretation, strict verification.** Hard rules protect the truth. Examples teach the voice. The reviewer catches mistakes (deterministic checks; the semantic judge is QA-only for the MVP). The writer gets to write.
- **Remove voice prescriptions, not guardrails.** The hard truth, safety and document constraints (audit section A) and rule 25 stay unchanged.
- **Loosen both halves at once.** A soft check triggers regeneration with a directive, so it is a generation-time rule. Loosening the prompt without loosening the matching review check puts the constraint straight back.
- **Reyner's five questions are HIS evaluation criteria, never renderer instructions.** Is it specific? Does it create recognition? Could it happen on an ordinary Tuesday? Would someone send this sentence to a spouse or sibling? Does it leave curiosity alive?
- **`fact -> interpretation -> scene -> tension -> open loop` is a mental model, not a paragraph formula.** 80/20 recognition vs suggestion is a target for the whole experience, never something the renderer counts. Some paragraphs are a single sharp observation, some a scene, some a contrast.
- **Order of work (capped experiment, parallel to the DOKU wait):** (1) loosen coverage; (2) shorten the prompt; (3) Reyner writes 3-5 examples, which are worked examples and not templates; (4) Flash-lite writer; no production judge; a stronger writer or a production judge only on post-launch evidence that it affects customers or revenue (Reyner 2026-09-26, MVP); (5) Reyner judges with his five questions.
- **Voice acceptance is Reyner's alone,** using his five questions. No automated voice score is built for the representative test. The existing factual, safety and document checks stay.
- **Examples are Katon-native,** written by Reyner from real engine facts. Five examples, each showing a kind of curiosity, not a writing technique: (1) a direct "what am I?" answer, (2) an explanation of why the engine gives that answer, (3) a concrete recognition moment, (4) a comparison between two people, (5) a revelation that naturally creates another question. Any length or shape. The Gemini conversation Reyner shared is a behavioral reference only (answer -> explain why -> interpret -> give another handle -> the next question appears); its prose is not copied and its factual looseness is not acceptable in Katon.
- **Target: the reading behaves like the first turn of a conversation.** Answer the curiosity. Explain the why. Make it recognizable. Leave something worth exploring. This is a direction, not stages: no new mandatory writing stages and no new hard writing rules follow from it. Reyner's acceptance question: does it make someone want to ask the next question? "Why" explanations use only the engine's reasons (provenance), never invented chart causes.
- **Product (not decided):** launch keeps the reading/PDF surface. Whether Katon becomes a conversational interpreter is not decided; demand is tested separately. The loop the voice optimises for: understand myself -> become curious -> test it against someone I know -> compare -> explore the relationship -> come back with another person or question.

## Generation constraints (B)
| Row | Ruling | Note |
|---|---|---|
| B1 actionable + 37 actionable_seeds | LOOSEN | Optional material, never mandatory. Some facts should simply be interesting or revealing. |
| B2 must_cover | LOOSEN | Remove `actionable` AND `label_meaning` from mandatory coverage. The fact must stay accurate; the prose need not echo glossary vocabulary. |
| B3 coverageFloor 65 | LOOSEN | Required = the three spine facts; the writer chooses the strongest supporting facts. Do NOT replace 65 with another rigid number unless one is proven necessary. |
| B4 three beats | LOOSEN | Provenance can matter and meaning should land; no fixed skeleton. |
| B5 cash out every term | LOOSEN | Keep "no term stands undecoded"; drop "recognisable or actionable". |
| B6 gift before cost / cost mandatory per fact | LOOSEN + MOVE TO REVIEW | No per-fact gift/cost choreography. The reading as a whole must have tension and not be a pile of compliments (B16 protects this). |
| B7 VARY THE MOVE | REMOVE | Examples teach variation. |
| B8 "never add a sentence that carries no new fact" | REMOVE the restrictive part | Replace with: don't add empty prose; not every useful sentence adds a chart fact (an image, tension, contrast or scene is value). |
| B9 "no added specificity" | LOOSEN | Never claim something actually happened to the person. Illustrative scenes are fine ("Misalnya, ketika...", "Dalam keseharian, ini bisa terasa seperti..."). Deterministic checks and Reyner's acceptance read protect it; J1 is a QA tool. |
| B10 "not a stylist / no elegance" | REMOVE | |
| B11 "constrain it, do not decorate it" | REMOVE | Keep "no fake persona" only. |
| B12 one committed image per claim | KEEP no-hedging, DROP one-image limit | |
| B13 hedging bans | KEEP | Narrative certainty. |
| B14 "bukan X, melainkan/tapi Y" ban | LOOSEN + MOVE TO REVIEW | Allowed in moderation; the style check becomes a warning (flag), not a regeneration. |
| B15 rhetorical questions / penutup no question | LOOSEN | No generic coaching or reflection prompts ("Bagian mana dari dirimu yang perlu..."). Questions are not banned as a category; open-loop statements allowed ("Biasanya, orang terdekatmu justru yang paling dulu menyadari pola ini."). |
| B16 hold the tension + tension-collapse bans | KEEP | |
| B17 make meaning felt, not defined | KEEP | Strong keep. |
| B18 rule 21 same-breath (fact.strength_same_breath, strength_bare_label) | KEEP principle, LOOSEN enforcement | Not a hard reject; soft with at most one regeneration, or preferably explained naturally nearby. A voice issue, not a truth failure. |
| B19 pair P0 opening line | RULED 2026-09-28 | Mechanism and fixed order kept. Reyner's line is `kompatibilitas.p0_opening` in `docs/content/compat-glossary-rulings-2.md` (AMENDED 2026-09-28). |
| B20 palace named in every fact block (fact.palace_dropped HARD) | LOOSEN | Name the palace when it adds meaning; not mandatory per block. |
| B21 importance ranking | KEEP, with caveat | Hierarchy controls what matters; it does not make the prose mechanically ordered. |
| B22 confident penutup, no summary | KEEP principle | Examples teach execution; no formula. |
| B23 compat three fields in order | LOOSEN | Seeds are material, not a mandatory sequence. |
| B24 compat daily moments as patterns that already happen | KEEP | Source of the "hampir selalu kamu" line. |
| B25 compat journey + P7 schema | LOOSEN P7 | Keep the P1-P5 journey order; the ending emerges from the reading. |
| B26 compat penutup "Hubungan ini meminta kamu untuk..." (ruling of 2026-09-11) | REMOVE / REPLACE | Supersedes the 09-11 ruling. No structurally required homework; prefer recognition or curiosity left open; an occasional suggestion is allowed, never required. |
| B27 register bans (rule 20) | KEEP | |
| B28 structure.block_too_short | KEEP (soft) | Must not force padding. |
| B29 salah_dikira lines | KEEP as optional material | |
| B30 round-4 voice acceptance (added 2026-09-28) | ACCEPT, CONDITIONAL | Reyner, verbatim: "2. Accept, pending the listed fixes". The listed fixes are AJ §2 (one pair opening), AJ §3 (no nested brackets) and B31. It does NOT accept the Penyeimbang Unsur question, which stays open under AJ §4. |
| B31 the open-ended close (added 2026-09-28) | KEEP the move, REMOVE the example phrase | Reyner, verbatim: "3. Keep open-ended close, remove the example phrase". A thought may still end on an open observation; the v2 writer prompt loses its "for instance at the people closest to her" clause (AJ amendment 1 §6). |
| B32 reuse of Reyner's examples (added 2026-09-28) | ALLOW when facts match | Reyner, verbatim: "4. Accept example sentence reuse when facts match". A sentence from `docs/content/voice-examples-v2.txt` may appear verbatim in a reading whose facts match. `scripts/check-example-reuse.mjs` stays a QA instrument only, never a gate. |
| B33 "Mungkin menarik" (added 2026-09-28) | REMOVE the recurring hedge; KEEP the open-ended ending | Reyner, verbatim: "1. "Mungkin menarik": change to remove it. Keep the open-ended ending, but don't add another heavy writing rule beyond avoiding this recurring hedge." In the prompt only (AK amendment 1 §1b): no new gate, no blocklist entry, no ban; `style.hedging` stays log-only on v2. |
| B34 rhetorical question in the close (added 2026-09-28) | DO NOT TARGET; prefer a confident observation | Reyner, verbatim: "2. Rhetorical question: don't use it as a target pattern. Prefer confident observations for the close. Genuine questions can appear naturally, but the prompt should not encourage them." The prompt stops inviting questions and does not ban them; `style.rhetorical_question` stays log-only on v2. |
| B35 "Mungkin menarik", mechanically (added 2026-09-28) | REMOVE deterministically; supersedes B33's "In the prompt only" | Reyner, verbatim: "1. Yes. Remove "Mungkin menarik" mechanically as proposed." The proposal is Prompt AL §2, after two prompt rounds (B31, B33) left the phrase in place. On v2 only: when a block's FINAL sentence begins "Mungkin menarik untuk" or "Menarik untuk" (sentence-initial, either case) and the block keeps at least one sentence, that sentence is dropped. No word is added or rewritten. The gate re-runs on the result; if a hard check then fails, the original sentence stays and `close.hedge_kept` is logged, otherwise `close.hedge_dropped`. The phrase mid-block is left alone and logged. Still no blocklist entry and no ban; `style.hedging` stays log-only on v2. |

## Review-only (C)
| Row | Ruling | Note |
|---|---|---|
| C1 coverage.slot_filling | REMOVE | Dead check. |
| C2 opening flags | KEEP for now | |
| C3 J1 invented fact | KEEP | More valuable as the writer gets freer. |
| C4 J2 invented causality | KEEP, advisory only | Must distinguish invented chart causality from narrative interpretation ("Karena pola ini..." is legitimate). |
| C5 J3 certainty | REMOVE / NARROW | Only prohibited predictive certainty (events that will happen, health, money, fate), i.e. rule 25. |
| C6 J4 coverage judge | REMOVE | A writing teacher. |
| C7 D1-D4 | KEEP D1, D3, D4; LOOSEN D2 | D2 reintroduces coverage from the review side; loosen with B2/B3. |

## Unchanged
Audit section A (engine truth, terminology, rule 25 and pair verdict bans, direction resolution, clash reframe, arithmetic/code/meta leaks, document structure, deterministic post-processing, J1) and rule 25.
