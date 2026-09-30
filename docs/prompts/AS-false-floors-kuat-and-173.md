# Prompt AS: false floors, the "kuat" misfire, and merging #173 (Cowork, 2026-09-29)
Untracked in the working tree as `docs/prompts/AS-false-floors-kuat-and-173.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge. Each item gets its own commit, shown red first where it is behaviour.

## Reyner, 2026-09-29 (after walking the #173 Preview)
```
All checks on no. 1 has been corrected.
```
He also read the reading on that Preview and found it rigid, found no badges, and found the Fondasi Pasangan block badly wrong. **Cowork checked: that reading is the FLOOR.** Every sentence in it is verbatim `docs/content/glossary.json` (`label_meaning`, `gift_seed`, `cost_seed`, `actionable_seed`), in `lib/render/fallback.js` block order. It also took noticeably long to appear, which fits drafts being rejected before the fallback.

## §1. Merge #173
Reyner approves the merge by pasting AS. Suite green on main after it. No other UI change in this prompt: his further UI feedback (moving the chart up, the loader, the birth hour) waits for his rulings.

## §2. Why did that Preview reading floor, and how often does production floor?
Diagnosis only, no fix in this section.
- **The Preview reading:** report its token, the voice and prompt version the Preview ran, every writer call (latency, finish reason), and every rejected draft's findings. If the Preview has no `VOICE=v2` or no writer key, say so. Say whether it shares production's database and render cache.
- **Production since #171 (`9a2163c`):** count Mirror readings served as render vs floor. For each floor, give the reason (gate finding ids, transport, or cap) from the existing records. For every gate floor, quote the sentence that fired.
- **Hypothesis to confirm or refute, not assume:** `fact.strength_contradiction` firing on ordinary "kuat" (§3). That chart's verdict is balanced, and in round 5 the same chart had a draft rejected for "tarikan kuat dari Aspek Penantang".

## §3. `fact.strength_contradiction`: fire on the verdict, not on the word (Cowork's technical ruling)
**The cause (CHECK 3).** In `lib/validate/fact.js` `checkStrength`, the citing-block pass flags any wrong verdict word anywhere in a block that cites the strength fact. That assumed a strength block talks only about strength. v2 merges facts into one block (for example `day_master_Earth` + `strength_balanced` + `main_profile`), so every "kuat" in that block now counts as a verdict. Round 5 had six firings, and all six were misfires: "kehadiran kuat", "tarikan kuat", "berakar kuat", "mengalir kuat", and "posisimu tidak ekstrem kuat maupun lemah", which states balanced *correctly*. They caused both round-5 floors. Longer prose uses "kuat" more, so any depth change makes this worse.

**The rule.** A wrong verdict word counts only when it is predicated of HER or her chart:
- its subject is a reader word (`kamu`, `baganmu`, `dirimu`), her Day Master element, or her archetype name;
- it is not an adverb or adjective on another noun or verb ("kehadiran kuat", "berakar kuat", "Aspek ... yang kuat", which the 2026-08-21 same-breath fix already treats as an adjective);
- it is not negated or paired as both poles ("tidak ... kuat maupun lemah", "bukan kuat, bukan lemah").

Build the subject list from the engine and glossary (her Day Master element name and archetype `name_id`), never a hand list. Keep the whole-text reader-subject pass as it is.

- **Red first:** the six round-5 sentences, extracted by script from `reports/voice-v2/round5-data/*.json`, each rejected today and passing after.
- **Controls, which must still reject:** "Kamu kuat" on a weak chart; "Baganmu lemah" on a strong chart; "Tanah di dalam dirimu kuat" on a balanced Earth chart. If a control cannot be caught by a construction rule, stop and report it rather than widening the rule.
- **Replay:** every stored draft, both voices, and the round-5 records. List every finding that moves. A real contradiction that now passes means stop.
- Own STAGE6 bump, shipped isolated. One PR to main. It is not pre-approved, so report and wait.
- **Report:** how many of §2's production floors this change would have served.

## §4. Trace the floor's Fondasi Pasangan (diagnosis only)
On that chart (2001-02-14 13:00 female, 戊申 day), the floor printed two blocks:
- **FONDASI PASANGAN:** "Pilar Diri." plus only the palace's `label_meaning`. That is a definition, with nothing about what sits there.
- **ASPEK PERAJIN** (食神, the main qi of 申, the occupant of that same palace), a separate block that names no pillar.

Trace upstream (Stage 3 facts, `required_points`, `blockFor`) why the palace and its occupant are two blocks, and why the occupant loses its pillar. Propose the narrowest fix that stays within the floor's contract (ordering and punctuation only, no new words), and show before/after text for this chart. **Don't ship it:** the result is reader-visible, so Reyner sees it first.

## Report
Per section: commits, red-first proof, replay output, the §2 floor table, and the §4 before/after. End with the split.
