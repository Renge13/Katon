# Compat and voice rulings, 2026-10-02 (Reyner)

STATUS: **REYNER-RULED 2026-10-02**, on Cowork's inventory `claude/KATON-rules-inventory-compat-2026-10-02.md` (Claude project; IDs below refer to it). Recorded by Cowork. Lands on `main` alone, before any PR that applies it. Where a ruling had an ambiguous referent, the **keyed** line below is Cowork's tightening; the verbatim ruling is quoted first and wins if the two disagree.

## The principles (verbatim, Reyner, 2026-10-02)

> "Be fearless in interpretation. Be disciplined about the underlying facts."

> "If the product wants to interpret something important, make the engine capable of establishing the fact properly. Don't weaken the reading just because today's engine can't express it."

> "Stop writing from the facts outward. Start writing from the human experience inward, and use the facts to make that experience specific."

**Consequence for future work:** when a desired interpretation has no engine fact, the answer is engine work (a written rule in `docs/`, a second source per CLAUDE.md rule 4, then code), never a weaker reading and never a writer allowed to assert it unbacked.

## Rulings by ID

| ID | Reyner (verbatim, abridged to the ID) | Keyed (what Code applies) |
|---|---|---|
| C1 | "Split the financial rule to ban literal advice but explicitly allow wealth identity." | Financial **advice** and **prediction** stay banned, with the three `forbidden_content.financial` patterns unchanged. A wealth **identity** ("kalian pasangan pembuat kekayaan", "kalian membangun sesuatu yang nyata bersama") is allowed **only where an engine fact supports it**. Until C2 ships no pair has such a fact, so the prompt does not invite it yet. |
| C2, E10 | "Build the cross-chart synergies" | BUILD: cross-chart wealth and three-branch (三合/半合/三刑) facts. A written rule with a second source lands in `docs/` before any code (rule 4). |
| E11 | "Build ... cross-link facts." | BUILD: the engine emits joins of existing facts (e.g. one person's Day Master element is the root of the other's main profile; the element one supplies sits in the supplier's own spouse seat). Until then, a cross-chart link stated as a chart fact is not allowed. |
| A1 | "Kill the dead code in A1." | Delete `verdictHits` / `v2.d4_verdict` and the stale "hard" comment. **No overall verdict stays a product rule, prompt-only.** Verdict = a judgement of whether the pair works, should stay together, or how well they fit overall ("cocok"/"tidak cocok" as a conclusion, a score). Identity statements are not verdicts. |
| A4 | "Drop the 50% word-overlap check in A4" | Remove `pair.reframe_missing`. "A clash is a map, never a judgement" stays as direction. |
| D1 | "Narrow D1 and D2 to allow dramatic metaphors like "obat" while keeping the clinical bans." | Medical: remove the single words `obat` and `terapi`; keep `resep dokter`, `ke dokter`, `pengobatan`, `penyakit`, `diagnosa`, `diagnosis`, `gejala`, `depresi`, `gangguan (mental\|kecemasan)`, `kesehatan mentalmu`. |
| D2 | (same) | Self-harm: remove `menyerah saja` and `tidak ada gunanya`; keep `bunuh diri\|menyakiti diri\|melukai diri`. |
| A6, B1 | "Allow aspirational claims ... bold, declarative claims, not a hesitant cliffhanger." | Keep: no dates, no fixed outcomes ("pasti akan menikah", "ditakdirkan"), no verdict. Welcome: bold declaratives about who they are and how they move together; aspiration as possibility ("bisa menjadi", "punya bahan untuk"). The "not acting as an oracle" line is replaced (exact line in Prompt BC). |
| B4 | "The PDF should be a complete emotional payoff" | The compat prompt drops "first turn of a conversation ... leave something worth exploring". The reading is a complete story with an emotional payoff. (Product-boundary ruling 10, keeping a future chat product possible, is not affected.) |
| E2 | "Allow ... human-chain causation." | No invented **chart** causation. **Human chains are allowed**: why one person's behaviour, given their facts, lands the way it does on the other. Synthesis across facts is allowed; a cross-chart link stated as a chart fact needs E11. |
| F1, F2, F4 | "Introduce optional nicknames and romantic status (PDKT/Pacaran/Menikah)." | Compat form: an optional nickname for each person, sanitised (letters and spaces, short) because it enters the writer prompt. Status: PDKT / Pacaran / Menikah (**required or optional: OPEN, see below**). Address: the buyer is "kamu", the partner is named (falls back to "dia"). Privacy policy updated for names, including the partner's. E4's truth checks are extended to names **before** names ship. |
| I1 | "Swap the mechanical structure for your emotional arc" | The compat structure line becomes the question arc: attraction → what each brings → why it feels different → where they understand each other → where they misunderstand → what keeps triggering them → the trap that starts from love → what it could become. |
| I2 | "rewrite the report-style sample" | The compat example becomes Reyner's rewrite of `claude/KATON-compat-target-sample-draft1-2026-10-02.md`. |
| I3 | "let the writer handle the opening" | The writer opens; the engine's fixed `p0_opening` is no longer prepended to v2 pairs. |
| I4 | "un-hide the chapter headings" | The web compat report shows the writer's chapter headings (`modelHeadings`), as the PDF already does. |
| I5 | "bump the length to 800–1,000 words" | Compat target: 800–1,000 words. |
| I6 | "raise the temperature to 0.7–0.9" | Cowork picks the value inside 0.7–0.9 from the representative round. |
| E13 | "Patch the clash direction bug" | Frame-hit text becomes direction-aware; the reverse-direction wording is Reyner-approved in Prompt BB. |
| F3 | "update DOKU/privacy policy" | Privacy policy and terms name DOKU (and names, once F2 ships); Reyner rules the wording. |
| K2 | "build the compat-only payment toggle" | A compat-only sales switch, so the Complete Edition can sell while compat is reworked. |
| G1 | "Accept English titles" + scope: "Everywhere." | The archetype is shown by its English name on every reader surface: reading prose, result page, CE PDF cover and pages, compat PDF, cards. No Indonesian archetype name in brackets or beside it. The glossary keeps `name_id` internally. The rest of the reading stays Indonesian. |
| G3 | "ban romanised jargon purely via prompt direction" | A direction line, no check. |
| E5 | "extend the Day Master truth checks to both individuals" | `fact.day_master` (or a pair equivalent) checks both people's Day Master element in a pair reading. |
| E7 | (with G1) | `pair.both_named` accepts the English names. |
| H1 (rule 20) | "Amend for the whole product ... universally "warm, bold, and emotionally vivid; plain words, never purple; no slang" across all products." | CLAUDE.md rule 20 is amended (text in Prompt BB §0). **Applied to compat in BC; to the mirror prompt in a later, separate round** (Cowork sequencing, one moving target at a time; Reyner may overrule). |
| D3, G4 | "PROMPT ONLY ... Don't hard-reject them." | The question-mark and English-leakage checks stay logged, never rejecting. **Whether the prompt still discourages questions: OPEN, see below.** |
| G6 | "MAKE HARD." | `style.meta` and `style.code_leak` reject on v2, after a replay prices them. |
| E12 | "Adjust the thresholds until the labels actually segment couples into distinct, meaningful buckets." | Recalibrate P4/P5 so no label covers most couples. Target spread: OPEN, see below. |

## Unchanged (not ruled on, so they stay as they are today)
A2 never rank the two people · A3 no stay-or-leave advice · A5 no percentage or score (hard) · A7 timing descoped · B2 conviction about patterns, no claimed past events · B3 closing-hedge drop · D4 psychological claims open · D6 the epilogue line · E1 engine owns facts · E3 invented glossary terms (hard) · E4 pair truth checks (hard; extended to names under F2) · E6 required citations · E8 rule 4 · E9 single-chart star is not a pair fact · G2 no hanzi in prose (hard) · G5 relation English stripped · G7 typography · G8 trademarks, "Sepuluh Aspek", no Weton · G9 names as the facts give them · H2, H3 voice lines · I7–I9 · J1–J5 · K1, K3–K5.

## Open (Cowork's default applies unless Reyner says otherwise)
1. **D3 questions in the prompt.** Default: rhetorical questions allowed in the body; no coaching, quiz or reflection questions aimed at the reader; none in the epilogue.
2. **Status field.** Default: required, one tap, three options.
3. **E12 target spread.** Default: no P5 quadrant and no P4 pattern above 40% of random pairs; Reyner reads the label meaning of any pair that changes label.
4. **D5 advice line for compat.** Default: compat gets the mirror's line (advice in the body as a plain, optional possibility, never "ingatlah" / "jangan lupa" / "kamu harus").
5. **H5 rarity and hype.** Default: rarity claims only where a base rate supports them (q1 is 66% of pairs, so "langka" is false for it today).

## Prompt BC decisions (Reyner, 2026-10-02)
Verbatim, from `docs/prompts/BC-compat-voice-rework.md` §0.2.

- **Address mode:** "Write about both people by name, in the third person, and about the pair as 'kalian'. Each person's name is their nickname (`core.a.nickname`, `core.b.nickname`); when a nickname is empty, use that person's English archetype title as their name."
- **Status:** "Status is REQUIRED. One tap, three options (PDKT / Pacaran / Menikah)."
- **Sample:** "I approve v2 in its entirety, including all the [FIX] corrections ... and the [+COWORK] structural additions."
- **Length:** "Keep the 800-1,000 word target as drafted in Prompt BC."
- **Adjustment round:** "Temperature 0.7. Keep `pair.both_named`; the prompt asks for both titles in the first chapter. Six to eight chapters, each two or three paragraphs. Harmony frame hits get their own text; clash, harm and punishment keep the pressure text."
- **Voice principle, product-wide:** "We can be premium by our design, but warm and use everyday voice for tone and manner." Plain, everyday Indonesian with no slang and no chat particles; never casual chat register (the "old friend" register stays dead, CLAUDE.md rule 20). Compat gets it in this round; the mirror gets it in the mirror round.

Recorded verbatim from `docs/prompts/BC-amendment-1-adjustment-round.md` §0.

### Amendment 2 (Reyner, 2026-10-04)
Recorded from `docs/prompts/BC-amendment-2-names-close-privacy.md` §0; Reyner's words in quotes.

- **Length:** "Accept the approved gold sample as the practical target. I care about the reading feeling substantial and worth Rp39,000, not hitting a word-count target. Do not add padding just to reach 800 words."
- **Harmony first:** "Start with what draws the two people together, then introduce the strain where both apply." (Already implemented in `433a98a`; this records the ruling.)
- **Privacy:** "Katon tidak meminta nama lengkap, tidak memakai akun, dan tidak memasang cookie pelacak atau alat analitik pihak ketiga."
- **Names:** "when facts say "kamu" or "dia", those are references to the two people, and the reading should address them by the names supplied to the writer." Fixed upstream in the prompt, not by a gate.
- **The close:** the penutup "sets no conditions and gives no advice".
- **Watch items, no gates or checks:** "Keep the wrong-direction sentence and the "Sari, dengan elemen Api yang dominan" issue as watch items for now. Do not add gates or extra checks for either." Both are rows in `docs/PROGRESS.md`'s WATCH list.
- **Pending, not in this round:** the compat glossary lines that hand the writer "dinamika" and "menopang". Reyner rules the rewrites first.

### Amendment 2c (Reyner, 2026-10-04)
Verbatim, from `docs/prompts/BC-amendment-2c-paragraphs.md` §0.

- "Give each chapter 2 or 3 paragraph entries rather than one text field."
- "The first paragraph explains the chart/fact in the reading's voice."
- "The second paragraph is specifically a concrete, ordinary-life scene showing how that pattern can appear between the two people."
- "A third paragraph is allowed only when it genuinely adds something; do not pad."
- "Preserve the final rendered output format by joining the paragraphs downstream. Nothing else in the product should change."
- "Add the one prompt line for `membawa elemen`: use that wording only when describing what one partner brings to the other; describe a person's own element in another way."
- "Keep the existing check. Do not create a new gate."
- "Do not treat 800-1,000 words as a target. The objective is restoring the missing scene paragraph and the resulting reading depth."

### Amendment 2d (Reyner, 2026-10-06)
Verbatim, from `docs/prompts/BC-amendment-2d-native-phrasing.md`. A direction line in the pair prompt's Voice paragraph; no check and no blocklist entry (per `voice-constraint-rulings-2026-09-26.md` "REYNER-RULED 2026-10-01").

- The line: "Do not use literal translations of English pop-psychology, therapy jargon, or Western relationship concepts (e.g., avoid unnatural translated phrases like kebersamaan yang disengaja, memegang ruang, or melakukan pekerjaan emosional). Express these ideas using natural, native Indonesian phrasing that people actually say in real life (e.g., menyempatkan waktu berdua, hadir sepenuhnya, menjaga komunikasi)."
- **Amended the same day (Reyner, 2026-10-06):** "hadir sepenuhnya" is dropped from the line's examples, because it is itself a translation of "be fully present". The line in the prompt now ends "(e.g., menyempatkan waktu berdua, menjaga komunikasi)." The line above is the prompt as first written. A render on that first wording (pair prompt `v2-9920f01ea60d7ffd`, not committed as evidence) wrote "Tanpa inisiatif untuk hadir sepenuhnya, ..." once in eight readings.
- Why: in the 2c round, "Mengubah rutinitas kecil menjadi momen kebersamaan yang disengaja adalah cara paling nyata..." (nonames render 1) "reads like a direct, clunky translation of the English pop-psychology phrase 'intentional moments of togetherness.'"
