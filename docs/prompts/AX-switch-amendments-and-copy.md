# Prompt AX: amendments to #183, copy rulings, #182 layout, #186 sequence (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AX-switch-amendments-and-copy.md`. Commit it with your first change on #183.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

## Reyner, 2026-09-30, verbatim
```
1. Badge prompt rule: agree. Remove the "every badge by name" requirement and replace it with:
"Mention a badge only where it belongs in the story; the page shows every badge on its own card."
2. "Half Combination" example: agree. Remove the English bracket from "Setengah Gabungan (Half Combination)". This should follow the existing relation-bracket ruling consistently.
3. "ingatlah": agree with the intent, but broaden the rule so it prevents simple substitutions. Add:
"Advice is a plain, optional suggestion, never an imperative or reminder such as 'ingatlah', 'jangan lupa', or 'kamu harus'."
Then rerun the §3 smoke check and report the five final sentences before merging.
4. Add this general writing principle to the prompt:
"Do not restate information already made explicit by the page unless it adds interpretation or context."
This supports the badge change and should help prevent repetitive copy elsewhere.

Copy rulings:
* Shio label: "Shio (tahun lahirmu)".
* Sebaran tags: "PALING BANYAK" / "PALING SEDIKIT" on web + PDF. On ties, tag every tied element.
* Tanda Kekosongan second sentence: "Hasilnya tidak pernah kurang, tetapi rasa memilikinya tidak pernah ikut hadir."
* Dominan Tanah: "Unsur dirimu paling banyak muncul di bagan. Kamu melangkah tanpa perlu izin orang lain, dan tak suka ruang pribadimu diatur-atur."
* Pilar Konsepsi label_meaning: "Dihitung dari perkiraan masa pembuahan, sekitar sepuluh bulan sebelum kelahiranmu. Pilar ini melengkapi bagan dan tidak dibaca sendiri."

I'm happy with the Dominan Tanah wording for now. Don't rewrite it unless the smoke check shows a concrete voice/problem issue.
Badge card at phone width: pillar label on its own line under the badge name.
Follow the existing deployment sequence and SQL gate from the previous instruction. Walk both #186 PDF links before confirming #186 is ready, then rebase it and repin the snapshot after #183.
Also keep the glossary key changes bundled with #183 so the saved readings are rewritten only once.
```

## §1. #183: prompt amendments (mirror prompt; for anything the pair shares, quote what reaches the pair)
1. **Badges.** Replace the round-6 line "Every `bintang` fact appears, by name, …" with Reyner's line 1, verbatim.
2. **The example.** Change "Setengah Gabungan (Half Combination)" to "Setengah Gabungan" in the mirror voice example.
   - Grep every example file for any other relation name followed by a bracket, and remove those too under the same ruling.
   - List each change.
3. **Imperatives.** Add Reyner's line 3, verbatim.
   - **Keyed referent:** "optional" describes how the advice is phrased to her. The writer still ends a cost with what helps (AT §2 item 5 stays).
   - If the two lines read as contradictory in the assembled prompt, quote both and stop. Don't pick one.
4. **No restating the page.** Add Reyner's line 4, verbatim, and follow it with one factual sentence telling the writer what the page already shows: "The page already shows her four pillars and Pilar Konsepsi, her element bars, and every badge with its one-line meaning." No other addition.
5. Record the new mirror prompt version, and the pair's version if it moves.

## §2. #183: glossary rulings, bundled so every saved reading is rewritten once
Apply to `docs/content/glossary.json` in #183, alongside the Fondasi line:
- **Tanda Kekosongan meaning:** replace the second sentence with Reyner's text. Quote the cell before and after.
- **The Dominan cell(s):** Reyner's text. If the condition cell is shared across elements, confirm "Unsur dirimu" reads true for every element, and say so.
- **`pilar.conception.label_meaning`:** Reyner's text.
  - This lifts the 2026-08-07 display-only exemption, as the appendix code anticipates.
  - Update the `_note` to quote this ruling.
  - Report every surface that now shows it.

Then:
- Repin whatever these move, one reason per repin.
- **Recompute §2.6:** confirm it is still one rewrite per reading. The glossary and prompt versions change together in one deploy.

## §3. #183: rerun the smoke check, then report before merging
Same five charts, final configuration, in memory. Report per reading:
- served or floor;
- words;
- relation English;
- questions;
- **every imperative or reminder:** "ingatlah", "jangan lupa", "kamu harus", "harus" addressed to her, "pastikan", "cobalah". Count and quote each; this is a list for a read, not a new gate;
- **any sentence that repeats a badge's `label_meaning`, or the element bars, nearly verbatim.** Quote it;
- **the full final sentence of the penutup.**

If a close teases or an imperative survives, stop and report. Don't iterate past one adjustment (the cap on this fix).

## §4. The SQL gate and the merge order (unchanged)
- Reyner runs the §2.6 SQL and pastes the results.
- **Go on #180 → #181 → #183** unless a paid row is not a KNOWN TEST ROW. If one isn't, stop.
- Then #184 and #185.
- #182: go now, with the layout change in §5.

## §5. #182: badge card at phone width
Put the pillar label on its own line under the badge name, at every width where the two don't fit on one line.
- Screenshots at 375px and desktop for a one-pillar badge and a two-pillar badge.
- Then merge.

## §6. #186 (after #183)
1. Build in #186:
   - the Shio label "Shio (tahun lahirmu)" (already the default);
   - the Sebaran tags "PALING BANYAK" / "PALING SEDIKIT", replacing "PALING KUAT" / "PALING TIPIS" on web and PDF, from the copy bank, marked REYNER-RULED 2026-09-30;
   - on a tie, tag every tied element. Red first: smewTN's Tanah and Logam tie tags both.
2. Rebase on main after #183. Repin the chart-1 snapshot with the reading-unchanged proof.
3. **Walk both Preview PDFs yourself:** fetch them and rasterise every page. Confirm:
   - the ruled copy appears (Shio, tags, Tanda Kekosongan, Dominan, Pilar Konsepsi);
   - no page ends on a heading;
   - the pair page holds both charts.
   Report the page images and the two URLs.
4. **Reyner walks both links and gives the final go.** Don't merge #186 on your own walk.

## Report
Per section:
- commits;
- red-first proof;
- the §3 table with the final sentences and the imperative list;
- merge SHAs;
- the #186 page images and URLs.

End with the split.
