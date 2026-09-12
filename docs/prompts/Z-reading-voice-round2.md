# Prompt Z, round 2: the compat reading voice (PROMPT-ONLY) — preceded by 3c alone

Cowork → Code. 2026-09-11. Supplements `docs/prompts/Z-reading-voice.md`; does not replace it.
Reyner's verdict on PR #116 (round 1): **Round 2, prompt-only, after 3c ships alone.** Round 2 is the LAST round under the two-round cap ruled in Prompt Z §6.

Four checks, cited: (1) commands quoted below verbatim; (2) every instrument here has a falsifier named; (3) every change removes a cause the walk artifact shows — none adds a gate, the two new checks are LOG-ONLY; (4) what it buys the customer: a reading that says who does what to whom, opens with the ruled sentence, and closes by talking to them.

## 0. What Reyner read (his words, the gate)

Substance: **win**. Prose and synthesis: **fail** — "a smart bot stitching three good sentences together rather than an insightful guide speaking directly to me." The "who" defect (`salah satu`): **fatal**. Opening: **broke the ruling**. Closing register: **cold**.

## 1. Evidence, from `docs/qa/2026-09-11-compat-three-pair-walk.md` (read the artifact, not this summary)

E1 — Direction lost. Every direction-carrying block in round 1 transcribed the seeds' ruled neutrality instead of resolving it. 1x2 p1: "unsur salah satu dari kalian memberi energi ke yang lain"; Y-1 p1: "Unsur salah satu dari kalian"; Y-1 p3: "Salah satu membawa elemen yang absen di bagan pasangannya". Baseline named who in all three ("Unsur Matahari milikmu memberi energi ke unsur Tanah miliknya"; "Dia membawa elemen air"). 3 of 3 neutral blocks regressed. Rule 14 coverage: the engine knows the direction (`lib/semantic/pair.js:343-351` keeps `provenance.cycle` as `a_produces_b` / `b_produces_a`; `:309-311` keeps `supplies[].from/to`) and the reader no longer receives it.

E2 — Ruled P0 paraphrased. Y-1 round 1 opens "Bacaan ini menyoroti dinamika antara dua individu dengan arketipe Matahari dan Taman." The ruled template is `Ini adalah bacaan tentang dua individu: {A} dan {B}` (pasangan-copy-rulings h). Prompt Z §3c caveat realised.

E3 — Penutup register. Baseline: "Hubungan ini meminta kamu untuk … Bagi dia, …". Round 1: "Hubungan ini meminta Matahari untuk … Gunung diminta untuk …" (1x2) and "meminta Matahari untuk … Taman diminta" (Y-1). The reader is A. Round 1 talks about her in the third person by label.

E4 — Concatenation. Most round-1 blocks = `label_meaning` + `meaning_seed` + `daily_seed` in sequence with connectives ("Selain itu", "Peran ini konsisten dan jarang tertukar."). Code's own count: first nine words of 10/42 seeds appear verbatim. Y-1 P2 is the one true braid (two facts in two paragraphs, the "sebelum dia sempat cerita" beat) — so the model can do it when the material forces it.

E5 — Floor rate 1/10 → 3/10 across two after-draws; `style.hedging` hits 1 → 10. 2x6 round 1 floored on the walk itself.

## 2. Cause, one per finding — all in the prompt layer except E2

E1: the glossary cells' `_note` says "Direction-neutral: the renderer names who" (glossary.json, p1_produces / p1_controls / p3_supplies). The RENDERER was never told. The seeds and the labels both say "yang satu / salah satu", so the model has three neutral sentences and zero instruction to resolve them; it copies the neutrality faithfully. Cause = missing instruction, not a bad seed. Do not re-rule the seeds; they are neutral by ruling so one cell serves both directions.

E2: the model writes P0. Ruled fix already shaped (3c): engine emits P0, model does not write it.

E3: the current penutup rule reads "Name the ask for one and the ask for the other" — "one / the other" invited third-person labels. Cause = the instruction's own register.

E4: the prompt says "reproducing a field verbatim … is a failure" but shows nothing else to do with three good sentences. renderer-prompt-notes Run 1→3 precedent: the mirror prompt stopped transcribing when it was shown a worked example, not when it was told not to. Cause = prohibition without demonstration.

E5: the §3d voice paragraph ("tunjukkan di mana itu terasa dalam seminggu biasa") plus seeds full of "bisa terasa" pull the model into probability register, which is exactly what the hedging patterns catch; more hits → more Stage 6 rejections → more floors. Cause = no register instruction for the daily beat.

## 3. PR A — 3c alone (as already ruled; restated so it can be quoted)

Engine-emitted P0, injected inside `renderReading` (`lib/render/index.js`, before `validateRendering` at :436) on BOTH the model path and the floor path, text = the ruled template with `core.a.archetype_name_id` and `core.b.archetype_name_id`. Prompt: remove "P0, the opening" from the model's journey — the model's first block is P1; state that the opening is written by Katon and it must not write one. `checkBothNamed` UNTOUCHED (it now checks the engine's sentence, which is the point). `STAGE6_VERSION` bump. Cache key moves (semanticJson unchanged; prompt_version changes) — expected.

Instrument: render the 10 harness pairs + Y-1. Assert 11/11 P0 texts byte-equal the template; falsify by rendering once with the injection commented out and confirming the assertion fails and `pair.both_named` fires. Floor path: force fallback on one pair and confirm P0 present, 200 not 503 (the exact failure round 1 hit).

Stop condition (ruled earlier with 3c): if the model still emits an opening block despite the instruction, drop it — the engine's P0 stands, the model's is discarded, log-only counter `p0_model_wrote_anyway`.

Ships alone. Merge before PR B branches.

## 4. PR B — round 2, prompt-only (branch from main after PR A). Plus two LOG-ONLY checks, which may travel per the gate rule.

### B1. Direction resolution (E1) — MANDATORY in the prompt
Add to WHAT THE JSON GIVES YOU, with the provenance names: `core.a` is the reader — `kamu`, `-mu`. `core.b` is `dia`, `-nya`. For `p1_stem_relation`, `provenance.cycle` is `a_produces_b`, `b_produces_a`, `a_controls_b` or `b_controls_a`: the first letter is who gives energy or gives shape, the second is who receives. For `p3_supply`, each `provenance.supplies[]` entry has `from` and `to` ('a' or 'b'). The cell text says "yang satu / yang lain / salah satu" on purpose — it is written once for both directions. Resolving it is your job: write `kamu` and `dia`, and name the two unsur from `core.a.element` / `core.b.element`. A block on these facts that still says "salah satu" or "yang satu" has not been written yet.

Code decides the wording in the prompt's own register; the SEMANTICS above are fixed. Note for Code, not to fix now: `p3_supplies.label_meaning` says "Dia membawa …" — it presupposes b→a. With `aSupplies` only, the label points the wrong way. Log it as a glossary follow-up; do not edit the cell in this PR (cache keys).

LOG-ONLY check `pair.direction_resolved` (in `lib/validate/pair.js`, never in the hard set): for `p1_stem_relation` when variant is `p1_produces` / `p1_controls`, and for `p3_supply` when `supplies.length > 0`, log when the block text matches `/\b(salah satu|yang satu|yang lain|satu pihak|pihak lain)\b/iu` OR contains neither `kamu`/`-mu` nor `dia`/`-nya`. Never rejects. Falsify: feed the Y-1 round-1 p1 text and confirm it logs; feed the baseline 1x2 p1 text and confirm it does not.

### B2. Penutup register (E3) — RULED by Reyner, verbatim semantics
Replace the penutup instruction's "Name the ask for one and the ask for the other" with: the report is bought by A about A and B. The closing talks to A directly as `kamu` — "Hubungan ini meminta kamu untuk …" — and refers to B as `dia`, or `dia (Taman)` where the name helps, and never as an archetype label in subject position ("Matahari diminta", "Taman diminta") and never as `kamu`. The existing rule DO NOT ADDRESS PERSON B stands and now has its positive form.

LOG-ONLY check `pair.penutup_register`: log when `penutup` lacks `kamu` OR when `core.a.archetype_name_id` appears in `penutup` at all (A is never named in her own closing). Falsify: 1x2 round-1 penutup logs; 1x2 baseline penutup does not.

### B3. One worked synthesis example (E4) — Cowork drafted, REYNER RULES before it enters the prompt
Shape in the prompt: show the three input strings for one cell, then the resolved block, then one line on what happened (term named → meaning for these two → where it shows in a week; seeds used as material, no seed sentence kept whole). The example pair is deliberately one that is NOT in the walk or the harness (A Samudra · B Taman, `a_produces_b`), and the prompt says the words in the example are never to be reused.

RULED by Reyner 2026-09-11 (his amendment of Cowork's draft; re-swept clean against the 70 live patterns, falsifier fired). Reyner's note: "mengerjakannya" -> "mengeksekusinya"; final clause tidied for spoken/mobile reading. The em dash in the last sentence is Reyner's; if he rules keyboard-only punctuation for the reading (as the seeds are), Code replaces it with a full stop before the prompt lands - the example is what the model imitates.

INPUT (p1_stem_relation, variant p1_produces, cycle a_produces_b, a Air, b Kayu)
label_meaning: Unsur salah satu dari kalian memberi energi ke yang lain. Ada dinamika pengayom dan yang diayomi dengan alur yang konsisten.
meaning_seed: Alur energi berjalan searah dan stabil dari satu pihak ke pihak lain. Yang memberi menjadi sumber dorongan, yang menerima mendapat rasa aman; peran ini konsisten dan jarang berbalik.
daily_seed: Keputusan dan inisiatif baru hampir selalu dipicu oleh orang yang sama. Yang lain menyambut, mengeksekusi, dan merasa aman bergerak dalam alur tersebut.

OUTPUT (RULED)
Inti Menghidupi: Unsur Air milikmu memberi energi ke unsur Kayu miliknya dengan alur yang stabil. Kamu menjadi sumber dorongan, sementara dia menerima dan merasa aman bergerak di dalamnya. Dalam seminggu biasa, ini terlihat dari siapa yang membuka pembicaraan soal rencana baru: hampir selalu kamu. Dia menyambut, lalu mengeksekusinya dengan tenang. Peran ini konsisten dan jarang berbalik—keteraturan ini adalah alur alami kalian, bukan kebetulan.

What happened: "salah satu / yang lain" became kamu / dia from `cycle`; the term is named once; the meaning is said for these two people; the daily beat is a scene (who opens the conversation), not a restatement; no sentence from the three inputs survives whole.

LOG-ONLY instrument: extend the nine-word-run count Code used for the 10/42 figure (commit it under `scripts/` if it is not committed) to also count runs from the example text. Target for the three-pair walk: seeds ≤ 3/42 (from 10/42), example 0. Falsify by feeding round-1 output and confirming 10/42 reproduces.

### B4. Anti-hedge register line (E5)
One sentence in the voice paragraph, semantics fixed, wording Code's: the daily beat is written as a description of a pattern that already happens ("ini terlihat dari …", "hampir selalu …"), not as a possibility ("bisa terasa", "mungkin", "cenderung"). The seeds may carry "bisa"; the prose should not inherit it. Do not list the blocklist words in the prompt (the model would learn to dodge the regex, not the register).

Instrument: `style.hedging` hits at n=20 ≤ baseline's (1); floor rate at n=20 ≤ 1/20 over two draws. Falsify: run once with the line removed and confirm the hit count returns toward 10.

### Explicitly NOT in round 2 (parked, with reason)
- Floor assembling from seeds (recommendation item 4 in the 2026-09-11 state doc). The seeds are direction-neutral by ruling and the floor has no resolver; a seed-assembled floor would print "yang satu / yang lain" to a paying customer. Parked until the floor can resolve direction from provenance itself (template logic, a later prompt). Round 2 is prompt-only by verdict.
- Any glossary cell edit (moves every compat cache key; not needed for E1–E5).
- Any new HARD check. Both new checks log only.

## 5. Re-measure and walk v2
- n=20 across the harness pairs, two draws, same instruments as the after-doc, plus the two new log counters and the nine-word-run count. Report with fixed denominators.
- Regenerate `docs/qa/…-compat-three-pair-walk-v2.md`: same three pairs (1x2, 2x6, Y-1), columns round 1 / round 2 (floor and baseline columns may be omitted; they are in v1). If a round-2 draw floors, say so and draw again, reporting both.
- Do not merge #116 or PR B until Reyner walks v2 as the buyer. Under the cap, if v2 fails his read, PR B closes unmerged, PR A stays, the seeds (#116) go to Reyner for a keep/park ruling on their own merit — the seeds are ruled content and the "substance: win" verdict is about them.

## 6. Order of operations
1. B3 example RULED (above). Open only: em dash vs full stop in its last sentence.
2. Code: PR A (3c alone) → Reyner merges.
3. Code: PR B on a branch from the new main; walk v2; report with counts.
4. Reyner walks v2 → merge / park.
