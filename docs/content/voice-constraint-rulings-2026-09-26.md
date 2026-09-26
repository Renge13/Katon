# Voice constraint rulings: Reyner, 2026-09-26

STATUS: RULED by Reyner (chat, 2026-09-26). TIMING AMENDED BY REYNER THE SAME DAY: the voice work runs NOW, IN PARALLEL with the DOKU wait, and it is LAUNCH-CRITICAL. Katon does NOT launch on v1 because the DOKU gate is met. Launch sequence: frame-hit truth fix -> Reyner's 3-5 examples -> simplify constraints (this file) -> model bake-off -> representative test -> Reyner's acceptance -> launch (plus the DOKU production-flip gate). Two-round cap = a DECISION CHECKPOINT, NOT A QUALITY CEILING: if round 2 is not accepted, nothing launches automatically; Reyner chooses to accept, run one more targeted round, or change the approach. Its purpose is to prevent endless iteration, not to force a voice through.
Source audit: Cowork's writing-constraints audit (Claude project `claude/KATON-writing-constraints-audit-2026-09-26.md`), read on the `feat/voice-v2` working tree. Row ids B1-B29 and C1-C7 refer to that audit.
This file is not durable until Code commits it. Commit it docs-only, alone.

## Principles (ruled)
- **Strict input, free interpretation, strict verification.** Hard rules protect the truth. Examples teach the voice. The reviewer catches mistakes. The writer gets to write.
- **Remove voice prescriptions, not guardrails.** The hard truth, safety and document constraints (audit section A) and rule 25 stay unchanged.
- **Loosen both halves at once.** A soft check triggers regeneration with a directive, so it is a generation-time rule. Loosening the prompt without loosening the matching review check puts the constraint straight back.
- **Reyner's five questions are HIS evaluation criteria, never renderer instructions.** Is it specific? Does it create recognition? Could it happen on an ordinary Tuesday? Would someone send this sentence to a spouse or sibling? Does it leave curiosity alive?
- **`fact -> interpretation -> scene -> tension -> open loop` is a mental model, not a paragraph formula.** 80/20 recognition vs suggestion is a target for the whole experience, never something the renderer counts. Some paragraphs are a single sharp observation, some a scene, some a contrast.
- **Order of work (capped experiment, parallel to the DOKU wait):** (1) loosen coverage; (2) shorten the prompt; (3) Reyner writes 3-5 examples, which are worked examples and not templates; (4) test stronger writer models; (5) Reyner judges with his five questions.
- **Voice acceptance is Reyner's alone,** using his five questions. No automated voice score is built for the representative test. The existing factual, safety and document checks stay.
- **Examples are Katon-native,** written by Reyner from real engine facts, one per mode: (1) strong self-recognition, (2) concrete everyday scene, (3) tension or contradiction that does not resolve into advice, (4) compatibility moment that makes the relationship feel real, (5) open-loop ending that makes the reader curious about another person. No fixed structure per example. The Gemini conversation Reyner shared is a behavioral reference only (recognize -> wonder -> ask -> test against another person -> compare -> keep exploring); its prose is not copied and its factual looseness is not acceptable in Katon.

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
| B9 "no added specificity" | LOOSEN | Never claim something actually happened to the person. Illustrative scenes are fine ("Misalnya, ketika...", "Dalam keseharian, ini bisa terasa seperti..."). J1 protects the boundary. |
| B10 "not a stylist / no elegance" | REMOVE | |
| B11 "constrain it, do not decorate it" | REMOVE | Keep "no fake persona" only. |
| B12 one committed image per claim | KEEP no-hedging, DROP one-image limit | |
| B13 hedging bans | KEEP | Narrative certainty. |
| B14 "bukan X, melainkan/tapi Y" ban | LOOSEN + MOVE TO REVIEW | Allowed in moderation; the style check becomes a warning (flag), not a regeneration. |
| B15 rhetorical questions / penutup no question | LOOSEN | No generic coaching or reflection prompts ("Bagian mana dari dirimu yang perlu..."). Questions are not banned as a category; open-loop statements allowed ("Biasanya, orang terdekatmu justru yang paling dulu menyadari pola ini."). |
| B16 hold the tension + tension-collapse bans | KEEP | |
| B17 make meaning felt, not defined | KEEP | Strong keep. |
| B18 rule 21 same-breath (fact.strength_same_breath, strength_bare_label) | KEEP principle, LOOSEN enforcement | Not a hard reject; soft with at most one regeneration, or preferably explained naturally nearby. A voice issue, not a truth failure. |
| B19 pair P0 opening line | REWRITE | Keep the mechanism and fixed order; Reyner rewrites the glossary line "Ini adalah bacaan tentang dua individu: {A} dan {B}". |
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
