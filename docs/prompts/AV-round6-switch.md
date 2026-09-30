# Prompt AV: the round-6 switch, closing-line fix, badge-pillar check, pair floor reasons (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AV-round6-switch.md`. Commit it with your first change.

Cite the four checks. No regex through a shell heredoc. No model-based judge. The voice depth rounds are closed at two (round 5 and round 6): there is no round 7. §3 is a smoke check, not a judged round.

## Reyner's blind read of round 6 (2026-09-30), unblinded by Cowork against `KEY.json`
| Chart | His pick | Arm | Why (his words, condensed) |
|---|---|---|---|
| smewTN (Gunung) | r6-07 | **B** | "obeyed the bracket rule perfectly … folds the clashes beautifully … ends on a grounded, empowering note". r6-05 (A) failed with "(trine)", "(clash)". |
| chart1 (Matahari) | r6-06 | **B** | dropped relation brackets, better ending. r6-03 (A) had "(Half Combination)" and teased "ruang yang belum terjamah". |
| chart7 (Jati) | r6-08 | **B** | "connects the Aspek Pelindung to the relationship foundation … much more naturally". |
| chart4 (Embun) | neither | A and B | relation English ("(clash)", "(self-punishment)"), and both end on a tease ("menarik untuk diselami/ditelisik lebih dalam"). |
| chart13 (Bambu) | neither | A and B | teasing endings ("banyak hal yang menanti", "eksplorasi yang menarik"). "We want a definitive story, not a trailer for a sequel." |

- **B won all three charts that had a winner. A won none.**
- **The two failures were the same in both arms:** relation English the writer typed itself, and a teasing close. By Cowork's count, 6 of 10 closes tease.
- **Reyner, verbatim, on badges:**
  ```
  The UI Badge Cards: Strong Yes. Stop relying on the LLM to randomly name-drop the badges. ... The story can mention the effects of the badges naturally, while the UI does the heavy lifting of displaying the actual names and one-line meanings.
  ```

## §1. The teasing close: remove the cause (CHECK 3, Cowork's technical ruling)
**The cause is our prompt.** `docs/content/renderer-prompt-v2.txt` line 20 says: *"End on a confident observation that leaves her wanting to look further"*. The writer does exactly that. The round-6 prompt kept the line.
- **Replace it** with: "End on a settled, confident observation about who she is. The reading is complete: never hint at more to explore, deeper layers, or what is still waiting."
  - Keep the "do not open it with 'Mungkin menarik untuk...'" clause.
  - Keep §2 item 5 of AT (no pointing at facts left out).
- **Check the pair prompt** (`compat-renderer-prompt-v2.txt`) for any instruction with the same effect. Quote what you find. Change it only if it asks for a tease.
- **No new gate.** 1.55.0's hedge drop stays as it is. If §3 still shows teasing closes, report them. Don't add a pattern list.

## §2. The switch to production (one PR, Reyner approves it by pasting AV)
In the voice-v2 mirror path only:
1. **The ROUND-6 prompt** from `exp/voice-round6` (AT §2), plus §1's closing line.
2. **Temperature 0.9** for the v2 mirror writer. The v1 path and the pair writer are unchanged; the pair was not tested in round 6. Report the pair's current settings.
3. **Relations carry no English:**
   - the upstream `label_bracket` removal for relation facts in the writer payload (AT §2 item 7);
   - the gate's unsanctioned-relation rule;
   - **and a mechanical strip:** a parenthetical that directly follows a relation's Indonesian name (Benturan, Gesekan, Simpul, Ikatan and the rest, taken from the glossary) is removed whatever it contains, logged `brackets.relation_stripped`. It is position-based, not a word list, because the writer invents its own English ("trine", "self-punishment").
   - Red first: the r6-01, r6-05 and r6-10 texts.
   - Own STAGE6 bump.
4. **The folding fix** (`fact.relation_positions` read sentence by sentence) goes to main as its own commit, red first. A partial pillar list still rejects.
5. **Fondasi Pasangan:** #178's glossary line ships here. Also drop the same clause from `docs/content/voice-examples-v2.txt:35` ("…yang terasa wajar bagimu, meskipun orang lain bisa menganggapnya berat" becomes "…yang terasa wajar bagimu"). This is the same Reyner ruling (AU ruling 5). No other example edit.
6. **The cache re-keys every reading.** Before merging, report:
   - how many cached mirror and pair rows will re-render on their next open;
   - the estimated cost at the round-6 per-reading cost;
   - how many of those rows are paid.
   A paid reader gets new prose on the next open. Say whether any paid row belongs to anyone but Reyner (KNOWN TEST ROWS).
7. **Prompt version:** record the new mirror prompt version in the report.

## §3. Smoke check before merge (not a judged round)
Render chart1, chart4, chart7, chart13 and smewTN once each on the final §2 configuration: in memory, no cache writes. Report per reading:
- served or floor, and the floor reason;
- words;
- relation English after the strip (target 0);
- badges named in the prose (for information only: the cards carry them now);
- questions to her (target 0);
- **the full final sentence of the penutup.**

If any close still teases, stop and report. Allow one adjustment to §1's line and one re-render at most; that is the cap on this fix. No PDFs for Reyner unless he asks.

## §4. `fact.bintang_pillar` (Cowork's technical ruling; deterministic, a chart fact like `fact.aspek_pillar`)
Since #177 a correct badge card can sit beside a sentence that places the badge on the wrong pillar.
- **The rule:** "Bintang X … di Pilar Y" (and "Tanda Kekosongan … di Pilar Y") is HARD when the engine does not place X at Y. Reuse `checkAspekPillars`'s subject handling:
  - on a mirror, the reader;
  - on a pair, "-mu" is A and "-nya"/"dia" is B;
  - no marker and false for both people: hard;
  - no marker and true for one person only: logged.
- **Red first:** a planted wrong pillar for smewTN's Bintang Perantau, extracted by script.
- **Controls:** every true badge-pillar sentence in the round-5 and round-6 records passes.
- **Replay:** every stored draft, both voices. List every finding that moves. A false positive means stop.
- Own STAGE6 bump, own PR. Report and wait.

## §5. A served event for pairs, with the floor reason (technical)
- Add `pair_served`, matching `mirror_served` from #179: render or floor, and the floor reason.
- Record it in the funnel event list and in any readout that enumerates events.
- No reader-visible change. Red first. Own PR. Report and wait.

## §6. Xendit leaves on 18 October 2026
Xendit (Tegar, 2026-09-30): no fees from 1 October until the account deletion date of 18 October 2026. Report, and change nothing yet:
- every production path that still reads a Xendit key or route;
- whether any existing paid row depends on Xendit to keep delivering. The stored `paid` flag should mean no; confirm it.

Say what should be removed after the 18th.

## §7. Status line: pending Reyner
AU's status line waits for Reyner's typography ruling. If his paste of AV includes it, build it in #177 exactly as ruled. Otherwise leave it.

## Report
Per section:
- commits;
- red-first proof;
- replay output;
- the §2.6 numbers;
- the §3 table with the final sentences.

End with the split.
