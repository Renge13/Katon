# Voice round 6 (Prompt AT), BLINDED: the last depth round

**Date:** 2026-09-30. **Branch:** `exp/voice-round6`, which is main `7b18613` plus #174 (AS §3), #175 (AS Amendment 1 §B) and the round-6 commits. **Writer:** `gemini-3.1-flash-lite`, 0 thinking tokens (its default). **Gate:** the branch's own, which stamps `1.59.0` but is not #175's `1.59.0`; every record names the branch commit. No model judge. In memory; nothing was written to `render_cache`. **Spend:** $0.0299 for 10 readings.

```
node scripts/build-round6-prompt.mjs                                   # the ROUND-6 prompt, derived
node --conditions=react-server scripts/qa-voice-round6.mjs             # renders (spends)
node scripts/qa-voice-round6.mjs --pdfs                                # blinded PDFs + KEY.json
node --conditions=react-server scripts/report-voice-round6.mjs        # this table, off the records
```

**Keyed by blinded id, and no arm is named here.** The PDFs are `reports/voice-v2/round6/r6-01.pdf` to `r6-10.pdf`, and the key is `KEY.json` in the same folder. Latency, tokens and cost can unblind the arms, so they sit last, under their own heading. The per-arm roll-up is `reports/voice-v2/round6-data/REPORT-arms.md`.

## Setup
- **Arms:**

  | Arm | Model | Temperature | Prompt |
  |---|---|---|---|
  | A | `gemini-3.1-flash-lite` | 0.2 | ROUND-6 |
  | B | `gemini-3.1-flash-lite` | 0.9 | ROUND-6 |

- **Charts:** chart1, chart13, and smewTN (2001-02-14 13:00 female, byte-identical to production in round 5). The two AT §3 picks:
  - **chart4** has the MOST relation facts: 3 (Simpul, Setengah Gabungan, Benturan). It ties with chart8 (Simpul, Setengah Gabungan, Gesekan); the lower id was taken.
  - **chart7** has the FEWEST facts: 8. It ties with chart12; the lower id was taken.
- **The ROUND-6 prompt:** `docs/content/renderer-prompt-v2-round6.txt`, built from today's v2 prompt by exact, counted replacements (546 to 735 words). It replaces the v2 mirror prompt on the wire. The examples and any regeneration directive are what production sends.
- **Prerequisites (AT §1):** AS §3 and Amendment 1 §B are NOT merged (#174, #175 wait for Reyner), so both are merged into this branch.

## §2 every changed line, before and after
| AT §2 item | Before | After |
|---|---|---|
| 1 no mechanism | "Interpret freely means: explain why a fact matters to her and, where it helps, why the engine says it, using only the reasons in `provenance`. Connect facts that belong together." | "Interpret freely means: explain why a fact matters to her. Never explain how the chart works: how elements feed, control or combine, how a star is derived, or why the engine concluded something. She reads for what it means in her life. Connect facts that belong together." |
| 5 what helps | "Advice is optional, never required." | "When you write about a cost, end that part with what helps." |
| 5 left-out facts (added) | "... do not open it with "Mungkin menarik untuk..."." | the same, then "Never point to facts the reading leaves out or 'has not explored yet'." |
| 5 no questions | "- no coaching or reflection questions aimed at her ("Bagian mana dari dirimu ...")." | "- no questions addressed to her at all, rhetorical or reflective, anywhere in the reading." |
| 2 depth, 3 badges, 4 relations, 6 length | "After those, choose the facts that make the strongest reading. `required_points` shows what the engine ranks highest; beyond the first three it is guidance, not a checklist." | AT §2 items 2, 3, 4 and 6 verbatim, in that order, as four paragraphs |
| 7 brackets | "A named term is written as its Indonesian name with `label_bracket` in brackets once, at first mention (`Bunga Persik (Peach Blossom)`);" | "An Arketipe, Aspek or Bintang name is written as its Indonesian name with `label_bracket` in brackets once, at first mention (`Bunga Persik (Peach Blossom)`); a relationship between pillars gets no bracket;" |

**Left as written, because AT says "exactly these changes":** the opening still asks the writer to "explain the why", and the JSON paragraph still says `provenance` is "why the engine concluded it". Both still pull toward mechanism. The word-list count below found none in the served text anyway.

### Item 7 upstream, and the checks folding runs into
Four commits on the branch, each shown red first:
1. **The v2 writer payload carries no `label_bracket` on a relation fact** (`lib/render/payload.js`). Before: `relation_刑_trine_寅巳申 still hands the writer "Punishment"`.
2. **On v2, a relation's English is an unsanctioned bracket** (`lib/validate/style.js`, read from glossary `relasi_cabang`). This is logged and never rejects.
3. **Checks versus folding.** Hand-built folded readings (smew with 4 relations, chart4 with 3), every word true to the engine, went through the v2 gate:

   | Check | On v2 | Fires on a correct folded reading? |
   |---|---|---|
   | `fact.relation_positions` | **rejects** | **yes, on every relation in the block**: "relation_冲_寅申 spans [month, day] but the text names [day], dropping [month]" |
   | `coverage.field_dropped`, `coverage.cost_dropped` | logs | yes |
   | `coverage.missing_point` | logs | yes ("required point spouse_palace (importance 70) is in no block") |
   | `fact.palace_dropped` | logs | not on these drafts |

   `relation_positions` charged the whole block to each relation, so a pillar given for one relation counted against the others. "Hari-harimu" (her days) also read as the day pillar.
4. **The loosening:** in a block citing more than one relation, each relation is judged only on the sentences that name it. **A partial span in such a sentence still rejects** (control: "Benturan terasa paling keras di Pilar Kerja." gives HARD, dropping [day]). Replay over all 166 stored drafts: 0 findings move.

The coverage checks log on v2 and reject nothing, so none was changed.

**Other places relation English appears (none changed this round):**
- **The floor:** none. Checked on smew: its blocks carry no relation English, because headings are the Indonesian label.
- **The PDFs:** none in the mirror appendix text (checked on smew).
- **AQ §4's italics:** yes. `GLOSS_NAMES_EN` includes `relasi_cabang`, so relation English the writer types gets italicised, which makes it more visible, not less.
- **The pair prompt:** it carries no bracket instruction for relations. The pair writer payload's cross-pair facts carry English only on `p4_temperament`.

## §4 per reading
| id | chart | words | served | regens | hard / logged | bintang named | relation facts | brackets on relations / total | questions to her |
|---|---|---|---|---|---|---|---|---|---|
| r6-01 | chart4 | 366 | served | 0 | 0 / 9 | 0/3 | 3 (0 own block) | 3 / 6 | 0 |
| r6-02 | chart13 | 401 | served | 0 | 0 / 4 | 0/1 | 1 (1 own block) | 0 / 4 | 0 |
| r6-03 | chart1 | 532 | served | 0 | 0 / 4 | 2/3 | 1 (1 own block) | 1 / 7 | 0 |
| r6-04 | chart13 | 415 | served | 0 | 0 / 2 | 0/1 | 1 (1 own block) | 0 / 2 | 0 |
| r6-05 | smewTN | 429 | served | 0 | 0 / 10 | 2/4 | 4 (0 own block) | 3 / 8 | 0 |
| r6-06 | chart1 | 447 | served | 0 | 0 / 10 | 2/3 | 1 (1 own block) | 0 / 5 | 0 |
| r6-07 | smewTN | 460 | served | 0 | 0 / 8 | 1/4 | 4 (0 own block) | 0 / 4 | 0 |
| r6-08 | chart7 | 413 | served | 0 | 0 / 6 | 1/1 | 1 (1 own block) | 0 / 5 | 0 |
| r6-09 | chart7 | 400 | served | 0 | 0 / 4 | 1/1 | 1 (1 own block) | 0 / 4 | 0 |
| r6-10 | chart4 | 366 | served | 1 | 0 / 7 | 0/3 | 3 (1 own block) | 3 / 5 | 0 |

**What this shows (keyed by id, with no arm named):**
- **10/10 served, 0 floors.** One regeneration, r6-10: `forbidden.medical` fired on the metaphor "menjadi obat bagi kebuntuan" (a remedy for a deadlock). That is a token check misfiring on a figure of speech.
- **Length hit the band.** Every reading is 366-532 words: 8 of 10 inside 400-550, and the two chart4 readings are under it, at 366.
- **No question to her** in any reading.
- **Mechanism:** 0 word-list hits across all ten. The list is shown working: it hits 17 sentences in round 5's served text.
- **Relations fold.** On the multi-relation charts (chart4, smew), 3 of 4 readings folded every relation. r6-10 kept one (Setengah Gabungan) in its own block.
- **Relation brackets are NOT zero: 10 across four readings.** They are "(self-punishment)", "(clash)", "(half-combination)", "(trine)", "(combination)", "(punishment)", "(Half Combination)". The payload no longer supplies them, so the writer is supplying English it knows. The gate logs them as `style.unsanctioned_bracket` and removes nothing. The deterministic fix would be for the normaliser to drop a relation-English bracket, as it already drops an unsanctioned square one. That is a gate change and is not made here.
- **Bintang named: 9 of 24 in total.** chart4's three badges (Bintang Perantau, Bintang Cendekia, Bintang Penolong) are named in neither reading. Item 3's "Every `bintang` fact appears, by name" is not being followed.
- **"What helps":** every block's last sentence is listed in `reports/voice-v2/round6-data/REPORT-blind.md` for a read. It is not scored.

## Truth sweep (round 5's, unchanged)
- `scripts/count-portrait-claims.mjs` on all ten records, drafts and served text: **10 Aspek-at-pillar claims, all true; 0 month and 0 season claims; 0 false.**
- **Gate fact checks on served text:** r6-09 logs `fact.palace_dropped`, which is an omission, not an unbacked claim.
- **Rejected drafts:** r6-10's single rejection, `forbidden.medical`, described above.
- **No claim the engine cannot back** was found in any draft.

## ARM-REVEALING COLUMNS. Read the PDFs first.
| id | ms | tokens in / out / thinking | cost |
|---|---|---|---|
| r6-01 | 3501 | 6627 / 661 / 0 | $0.0026 |
| r6-02 | 3793 | 5597 / 764 / 0 | $0.0025 |
| r6-03 | 4413 | 6714 / 1001 / 0 | $0.0032 |
| r6-04 | 4061 | 5597 / 774 / 0 | $0.0026 |
| r6-05 | 3936 | 7089 / 772 / 0 | $0.0029 |
| r6-06 | 4568 | 6714 / 759 / 0 | $0.0028 |
| r6-07 | 4104 | 7089 / 792 / 0 | $0.0030 |
| r6-08 | 3854 | 4925 / 712 / 0 | $0.0023 |
| r6-09 | 3675 | 4925 / 810 / 0 | $0.0024 |
| r6-10 | 8248 | 13321 / 1483 / 0 | $0.0056 |
