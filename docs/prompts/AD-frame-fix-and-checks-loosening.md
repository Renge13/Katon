# Prompt AD: frame-hit label fix + checks loosening for voice v2
Written by Cowork, 2026-09-26, for a FRESH Claude Code session. It sits in the working tree at `docs/prompts/AD-frame-fix-and-checks-loosening.md`, untracked. Commit it inside Job A's PR.

## 0. Orientation (read first)
**Project.** Katon (katon.app) is Reyner's Indonesian BaZi webapp. Repo `Renge13/Katon`, working tree `D:\claude-projects\katon`. Products: a mirror reading (19k) and a compatibility/pair reading (39k), each on screen plus a PDF. Pipeline: engine semantic JSON -> Gemini writer -> Stage 6 validator (hard / soft / flag; a soft finding regenerates once with a directive, then serves the floor) -> J1 judge (branch only).

**Roles.**
- Reyner rules anything a reader can see (Indonesian text, labels, product calls).
- Cowork writes specs, rules technical choices, and verifies your reports.
- You implement.
- Cite the four checks before acting:
  1. Quote the command or file.
  2. Every instrument must be able to fail.
  3. Remove the cause rather than add a gate.
  4. Say what the customer gets.
- Two-round cap on any experiment.
- Do not change reader-facing text beyond what this file gives you verbatim.

**Where things stand (2026-09-26).**
- `main` = `38062f2`.
  - Recent: #147 `060c35b` (pair PDF heading keep-with-next; frame rows name their pillar), #148 `e7141ad` (copy/download icons), #146/#149/#150 (voice rulings file).
  - `docs/content/voice-constraint-rulings-2026-09-26.md` is the source for Job B. Read it.
- `feat/voice-v2` = voice v2 work.
  - Rebased onto `e7141ad`; old head archived as `archive/voice-v2-pre-rebase-2026-09-26`.
  - Production forces v1 at `lib/voice.js:19` (`if (process.env.VERCEL_ENV === 'production') return 'v1';`). Leave that line alone.
- **Launch.** Voice v2 is launch-critical (Katon does not launch on v1). Ruled sequence: frame-hit truth fix (Job A) -> Reyner's examples -> simplify constraints (Job B is the checks half; the prompt half waits for the examples) -> model bake-off -> representative test -> Reyner's acceptance -> launch. The DOKU payment gate runs in parallel.
- **Do not touch** payments (DOKU / `ops/doku-walk`), Supabase data, or Vercel env in this job.

## Job A: frame-hit labels (on main, reader-facing truth fix)
**The problem, verified 2026-09-26 by the previous Code session:**
- A palace-frame hit is one person's non-day pillar (year/month/hour) forming a relation with the other person's day branch (seat).
  - Source: `lib/compat/branchRelations.js:145-156` (`scan`); `relationsBetween` :81-103; `PAIR_TABLES` :55-59; 刑 via `branchPunishments`.
- `lib/semantic/pair.js:307` maps frame hits through `P2_BY_RELATION` (:78-83) into the SEAT cells: 六合 `p2_harmony` "Kursi Terikat", 冲 `p2_clash` "Kursi Berbenturan", 害 `p2_harm` "Kursi Bergesekan", 刑 `p2_punishment` "Kursi Bersimpul" (`docs/content/glossary.json` :742/:749/:756/:763). All four meanings describe both seats.
- Where it reaches the reader:
  - PDF facts page shows the label: `lib/pdf/pairDocument.js:178/200/206`.
  - PDF appendix shows label + meaning via `variantKeysFor`: `lib/semantic/pair.js:130`; `lib/pdf/pairAppendix.js:106/133/135`.
  - The renderer payload carries bare keys only.
  - The on-screen report and the floor carry neither.
  - Stage 6 reads variants at `lib/validate/style.js:319`.
- Affected known pairs:
  - `g4WH4_9QbCrCj3Gha934q`
  - `PZ0t_B3YDnzdXc2LWV38D` and `JoWcjAT0Rc3DlLQlj3JiT` (no seat relation, yet the appendix says the seats lock, oppose and rub)
  - `rVe4ca-FOhsprfGUucTxA` (seats 六合, frame 冲)

**Reyner's labels (2026-09-26). Use verbatim:**

| Relation | New key | Label | Meaning |
|---|---|---|---|
| 六合 | `p2_frame_harmony` | Saling Tarik | Salah satu pilar dan kursi pasangan ibarat magnet. Keduanya langsung menempel dan terhubung dengan sendirinya tanpa perlu dipaksa. |
| 冲 | `p2_frame_clash` | Beda Arah | Salah satu pilar berhadapan langsung dengan kursi pasangan. Karena posisinya berseberangan persis, dinamikanya menjadi lebih intens dan mudah memanas. |
| 害 | `p2_frame_harm` | Senggolan Halus | Salah satu pilar menyenggol kursi pasangan secara halus. Tidak sampai bertabrakan, tetapi cukup memicu gesekan dari hal-hal kecil yang dibiarkan menumpuk. |
| 刑 | `p2_frame_punishment` | Siklus Berulang | Salah satu pilar dan kursi pasangan memiliki kecenderungan memutar ulang pola masa lalu. Jika tidak disadari, kebiasaan lama akan terus berulang. |

**Do:**
1. Branch off `main`.
2. Add the four cells to `glossary.json` using the same field names the seat cells use for label and meaning. Give each a `_note` along the lines of "frame hit: one person's non-day pillar vs the other's day branch". Fill no other fields. If code requires more fields (e.g. a daily seed), STOP and report which.
3. In `lib/semantic/pair.js`, frame hits map through a new frame map to these keys. `P2_BY_RELATION` stays for the day-branch pair.
4. In the `p2_palace_frame` cell's `_note`, replace "reuse the p2_* names above for the relation" so it points to the `p2_frame_*` cells and says seat names are never used for frame hits.
5. `lib/validate/style.js:319`: each frame key keeps exactly the style behaviour its seat key triggered before (quote it). Same for `pair.reframe_missing` if it keys on `p2_clash`.
6. Grep `docs/content/compat-renderer-prompt.txt` and `lib/render/*` for the seat keys. If any text tells the writer that frame variants are seat relations, report the lines and fix them minimally (internal text; Cowork's call).

**Instruments (each must be able to fail):**
- A test that fails if any frame-hit variant is a seat cell key, and passes for the day pair. Fixtures: the births behind g4WH4, PZ0t and rVe4ca (read-only `GET https://www.katon.app/api/pair/<id>` or `reports/`). Show it failing on `main` before your change.
- A test that every glossary label is unique. Also report near-duplicates that share a word with another label or pillar name (e.g. "Beda Arah" vs "Pilar Arah", any other "Tarik" label). Report only; Reyner decides.

**Rulings file update (docs, same PR; Reyner, 2026-09-26):** in `docs/content/voice-constraint-rulings-2026-09-26.md`, under "## Principles (ruled)":
- Replace the whole bullet that starts `- **Examples are Katon-native,**` with:
  "- **Examples are Katon-native,** written by Reyner from real engine facts. Five examples, each showing a kind of curiosity, not a writing technique: (1) a direct \"what am I?\" answer, (2) an explanation of why the engine gives that answer, (3) a concrete recognition moment, (4) a comparison between two people, (5) a revelation that naturally creates another question. Any length or shape. The Gemini conversation Reyner shared is a behavioral reference only (answer -> explain why -> interpret -> give another handle -> the next question appears); its prose is not copied and its factual looseness is not acceptable in Katon."
- Add after it:
  "- **Target: the reading behaves like the first turn of a conversation.** Answer the curiosity. Explain the why. Make it recognizable. Leave something worth exploring. This is a direction, not stages: no new mandatory writing stages and no new hard writing rules follow from it. Reyner's acceptance question: does it make someone want to ask the next question? \"Why\" explanations use only the engine's reasons (provenance), never invented chart causes."
  "- **Product (not decided):** launch keeps the reading/PDF surface. Whether Katon becomes a conversational interpreter is not decided; demand is tested separately. The loop the voice optimises for: understand myself -> become curious -> test it against someone I know -> compare -> explore the relationship -> come back with another person or question."
Quote the diff in your report.

**Then:**
- Open a PR and merge after CI, like #147-#150.
- Regenerate the PDFs for the four affected pairs into `reports/frame-fix/`. Report, per pair, the facts-page frame rows and the appendix entries as printed.
- Answer: are pair PDFs rendered on demand or stored? If stored, how do existing ones refresh?

## Job B: loosen the checks side for voice v2 (after Job A merges)
**Branch:** `feat/voice-v2` only. Nothing merges to main.
**Rebase first:** archive the current head as `archive/voice-v2-pre-rebase-2-2026-09-26`, then rebase onto the new `main` (it must carry Job A and #149/#150). Report conflicts and test count.
**Source:** `docs/content/voice-constraint-rulings-2026-09-26.md`. Row ids B*/C*/D* refer to it.
**Principle:** hard rules protect the truth; examples teach the voice; the reviewer catches mistakes; the writer gets to write.
**Scope:** validator, coverage contract, regeneration directives and judges. The writer's prompt and the glossary are OUT of scope.

### Step 0: answer first, then continue (no pause unless marked STOP)
1. Quote the code that identifies the mirror's three spine facts (opening facts, `docs/content/renderer-prompt.txt:26-30`).
2. Pairs: quote how `requiredPoints` (`lib/semantic/index.js`) builds the pair's required set (g4WH4 has 7). Does the pair side define spine facts? STOP and report if it does not; Cowork rules the pair set. The mirror work continues.
3. List every soft check live on the v2 path today, with severity and its regeneration directive text.
4. Are J1-J4 separate model calls or one? Quote the call site(s).

### Hard boundary: v1 must not change
- Every change below applies only when the voice is v2 (`markVoice` / the v2 path). The v1 path keeps producing identical findings.
- **The instrument:** run the v1 validator over every stored v1 render in `reports/` before and after your changes. The findings must be byte-identical. Show the command and the zero-diff result.
- One exception: C1 `coverage.slot_filling` is a dead flag. Remove it for both voices, and name it as the only v1 difference in the diff.

### Changes (v2 path only)

| Row | Today | v2 after this job |
|---|---|---|
| **B2** must_cover | `label_meaning, gift, cost, palace` (v2 already dropped `actionable`), stem overlap ≥ 0.2 or ≥ 2 hits per field, soft | Remove every per-field echo requirement. A required fact is covered when its **Katon term** appears in the prose (its label / label_bracket term, e.g. "Samudra", "Lemah", "Aspek Pengelola"). No stem overlap on glossary strings. Stays soft: missing a spine fact is a product failure. |
| **B3** coverageFloor 65 | Spine facts + every fact with importance ≥ 65 are required | Required = the three spine facts only (mirror). Everything else is optional, and the writer chooses. Do NOT replace 65 with another number. Pairs: per step 0.2. |
| **B6** per-fact cost | `coverage.cost_dropped` per fact, soft | Remove the per-fact check. Add one reading-level **flag** (logged, never a regeneration): "no spine fact's cost is reflected anywhere in the reading". It shows up in review, and it does not steer the writer. |
| **B14** "bukan X, melainkan/tapi Y" | `style.hedge_construction`, soft (mirror) | **flag** |
| **B15** questions | `style.rhetorical_question`, soft (any question) | A plain question → **flag**. Keep **soft** only for coaching / reflection prompts aimed at the reader. Seed patterns: `Bagian mana dari dirimu`, `sudahkah kamu`, `apakah kamu sudah`, `coba tanyakan (pada )?dirimu`, `tanyakan pada dirimu`, `apa yang kamu butuhkan`. Put them in `blocklist.json`, report the final list, and add nothing broader without asking. |
| **B18** rule 21 same-breath | `fact.strength_same_breath`, `fact.strength_bare_label`, HARD | **soft**, and the explanation may sit in the same sentence OR the next one. If the regeneration still fails **only** this check, serve that draft with a flag instead of the floor. A voice issue never serves the floor. |
| **B20** palace per block | `fact.palace_dropped` HARD + `palace` in must_cover | **flag**; `palace` leaves must_cover (covered by B2). |
| **C1** | `coverage.slot_filling` (flag, dead) | Remove (both voices). |
| **C4** J2 invented causality | advisory | Stays advisory. Update the rubric: interpretive causality ("Karena pola ini, ...") is legitimate. Flag only a chart cause the engine did not give (e.g. "because your month pillar is Fire" when it isn't). |
| **C5** J3 certainty | advisory, general over-certainty | Narrow the rubric to rule 25 only: events that will happen, health, money, fate. Narrative certainty about who the person is must pass. Stays advisory. |
| **C6** J4 coverage / missing meaning | advisory | Remove the call. |
| **C7 / D2** uncited required point | checks every required point | Checks only the required set from B3, and only by Katon term presence (same rule as B2). D1, D3, D4 unchanged. |
| **Directives** | `DIRECTIVE_TEMPLATE`, `stricterDirective` | No directive may name a removed or flag-only check, or ask for `actionable`, `label_meaning`, `palace`, gift-before-cost or per-fact cost. Quote every directive string that changes. |

### J1 must learn the scene boundary (B9)
The freer writer will use illustrative scenes ("Misalnya, ketika ...", "Dalam keseharian, ini bisa terasa seperti ...", "biasanya ..."). J1 must pass these and still catch real inventions.
- **Rubric change:** an illustration framed as possible or typical is not an invented fact. Two things are violations: a claim that something actually happened to the reader ("Tahun lalu kamu ..."), and a chart fact the engine did not give.
- **Recalibrate:** keep the existing 15 cases and add at least 10 new ones:
  - 5 illustrative scenes built on true facts. These must PASS.
  - 5 claims of past events or invented chart facts dressed as scenes. These must FAIL.
- Report the confusion matrix. The job is not done until the old 15 still score 15/15 and the new cases have 0 false negatives. If that isn't reachable, STOP and report the failing cases instead of loosening the rubric.

### Unchanged (do not touch)
Everything in audit section A:
- the hard fact checks
- `fact.relation_positions`
- forbidden_content / rule 25 and the pair verdict patterns
- `pair.direction_resolved`, `pair.both_named`, `pair.reframe_missing`
- the naming, bracket and leak checks
- the structure checks
- post-processing
- J1 as the gate

Also untouched:
- B13 hedging
- B16 tension-collapse bans
- B27 register
- B28 `block_too_short`
- C2 opening flags

### Instruments (Check 2: each one can fail)
1. **v1 zero-diff,** as described above.
2. **Unit tests, v2:**
   - A draft that names the three spine facts but echoes none of the glossary strings → no coverage finding.
   - The same draft without the archetype → soft coverage finding.
   - A "bukan X, melainkan Y" sentence → flag, not soft.
   - "Bagian mana dari dirimu ...?" → soft.
   - A plain "?" sentence → flag.
   - A strength label explained in the next sentence → pass.
   - A bare strength label → soft, then served with a flag after the regeneration still fails.
   - Each test must fail on the current branch head before your change. Show that.
3. **Findings replay (no new model calls):** run the v1 and the new v2 validator over the round-3 renders in `reports/voice-v2/round3/` and the v1 renders in `reports/voice-v2/`. Report a table per reading: findings that disappear, findings that remain, and findings that are new. Any hard finding that disappears is a bug unless this spec names it.
4. **J1 recalibration matrix,** as described above.
5. **Test suite green;** `lib/voice.js:19` unchanged.

### Report
- Step 0 answers, quoted.
- The diff summary per file.
- The v1 zero-diff proof.
- The unit test output, including the before-change failures.
- The replay table.
- The J1 matrix.
- The final B15 pattern list.
- Every J2 (invented causality) finding from the replay, in full. The new target asks the writer to explain the why, so Cowork reviews these by hand (J2 stays advisory).
- Any row you could not implement as written, and why. Do not substitute a different rule.
