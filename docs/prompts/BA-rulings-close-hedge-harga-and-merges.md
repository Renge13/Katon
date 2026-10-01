# Prompt BA: Reyner's answers to the #189/#190 report, then merge (Cowork, 2026-10-01)
Untracked in the working tree as `docs/prompts/BA-rulings-close-hedge-harga-and-merges.md`. Commit it with your first change on #190.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

## Reyner, 2026-10-01, verbatim
```
1. chart13 "harus terus berlatih": let it pass as a watch item. It is mildly prescriptive, but not worth another adjustment round.
2. Checks:
* Keep the question-mark check.
* Keep the English-leakage check.
* Drop the "mungkin"-about-her check. I agree that this is effectively a word ban.
3. "Mungkin menarik untuk…":
Remove the exact phrase rule. Keep the underlying quality rule instead:
"End with a useful reflection or concrete suggestion, not a teaser that invites the reader to keep reading."
4. /harga:
Give it its own description without "gratis di atas".
5. Compatibility row:
Replace "Belum bisa dibeli…" with sellable copy.
No verdict, score, or outcome promise.
Proceed with #189 and #190 once these are incorporated. #186 still waits for my PDF walk and final go.
For Prompt BA, keep following the same direction: prefer behavioral/intent instructions over word bans.
```
**Amendment, Reyner, same day, verbatim** (it supersedes his item 3's replacement line):
```
no concrete suggestion then, just summarize all the threads beautifully at the end to a cohesive epilogue. Agree on all 3 proposals on copy.
```
The "3 proposals" are Cowork's: "bisa kamu unduh" in the /harga description; the compat row shaped as name, body and link; and the link text "Baca pola kalian berdua" instead of "Baca kecocokan kalian". All three are in §3.
**This is Reyner's go on #189 and #190.** Merge each once its section below is green and no stop condition fires. #186 is not included.

## §0. Record the standing principle (docs, on #190)
In `docs/content/voice-constraint-rulings-2026-09-26.md`, add under a REYNER-RULED 2026-10-01 heading:
- the AZ ruling ("We don't ban specifics for the writer, just give overall direction");
- the BA line ("prefer behavioral/intent instructions over word bans").

State its consequence for future work: **a voice defect is fixed by a direction line in the prompt, or upstream, never by a new blocklist entry or a word-level gate check.** The three kept categories (pipeline leaks, self-harm, medical/financial advice) and the deterministic fact checks are the only exceptions.

Add to the PROGRESS watch items:
- chart13's "harus terus berlatih";
- chart1's "kini saatnya kamu menyadari bahwa…".

Both are passed as residual (Reyner, item 1). They need no fix now.

## §1. #190: the gate
- **Remove `hedgeAboutReader`** (reported as `style.hedging`) from every surface it reaches, and name each surface.
- **Keep, unchanged:** the question-mark check and the English-leakage check. Name the file and function of each in the report.
- **Red first:**
  - a draft whose only defect is "mungkin kamu …" in a claim about her now passes;
  - a draft with a "?" still fails;
  - a draft with an English leak still fails.
- **Replay** the stored drafts. Report the rejections and floors that disappear, by check id.
- Take your own STAGE6 bump.

## §2. #190: the close rule (shared base, so it reaches both mirror and pair)
1. **Remove the exact-phrase rule.** In the device working tree (HEAD = `feat/pdf-web-design`, not #190), the base reads (`docs/content/renderer-prompt-v2.txt:20-21`):

   > End on a confident observation that leaves her wanting to look further; do not open it with "Mungkin menarik untuk...".

   #190's copy, or the mirror build EDITS, may already have replaced the first half (AV §1). **Quote the close instruction as it reaches the assembled mirror prompt and the assembled pair prompt on #190**, before and after.
2. **Replace every close instruction** that forbids a phrase or asks her to look further with this line, built from Reyner's amendment by Cowork, keyed:

   > "End with a short epilogue that gathers the reading's threads into one cohesive closing reflection: not a recap list, not a teaser that invites her to keep reading, and not a new piece of advice."

   **Keyed referents:**
   - "summarize all the threads" = the facts the reading already told, drawn together. It is not a sentence per fact.
   - "no concrete suggestion" = the close carries no advice. Advice may still appear in the body, under the imperative line.
   - The 400–550 word range is unchanged, so the epilogue fits inside it.

   **Keep** the "settled close" wording only where it does not contradict his line. If two close instructions remain and read as contradictory, quote both and stop.
3. **Keep the imperative line unchanged** ("Advice is a plain, optional suggestion, never an imperative or reminder such as 'ingatlah', 'jangan lupa', or 'kamu harus'"). It is a behavioural rule with examples, ruled 2026-09-30, not a ban list.
4. **Quote any remaining writer-facing word or phrase list.** Remove none of them without a ruling.
5. Record the new mirror and pair prompt versions. The glossary is unchanged in BA, so this stays inside #190's single re-key.

## §3. #189: /harga copy, REYNER-RULED 2026-10-01 (copy bank)
Use the text in the block below exactly. Reyner approved all of it (amendment above).
```
/harga Complete Edition description:
"Satu refleksi lengkap tentang dirimu, disusun dari bagan lahirmu dan bisa kamu unduh sebagai PDF pribadi."

/harga Compatibility row:
name:  "Bacaan Kompatibilitas"
body:  "Lihat bagaimana pola kalian saling bertemu, apa yang terasa alami, dan di mana hubungan ini mungkin membutuhkan lebih banyak pengertian."
link:  "Baca pola kalian berdua" → /kompatibilitas
price: from lib/pricing.js (never a typed "Rp39.000")
```
Rules for this section:
- **The description** replaces only the shared "…gratis di atas…" description on /harga. The result-page offer keeps AZ's description.
  - Key it as its own copy-bank entry.
  - Report whether the three offer lines still come from the shared entries.
- **The compat row** retires the note "Belum bisa dibeli. Harganya kami tampilkan supaya kamu tahu lebih dulu." Also update the 2026-08-03 comment above `compat` in `lib/site/copy.js` ("Revisit when compat becomes sellable"): this is that revisit.
- **The link follows the payment fence exactly as #189's compat block does.** While payments are fenced, the row shows the name, the body and the price, with no link.
- **Keep** the CE row's purchase-path note and its closing guarantee "Melewatinya tidak mengurangi apa pun dari bacaan gratismu." The comment marks that sentence as not optional.
- **Proof:** screenshots of /harga at 375px and at desktop, fenced and forced open locally. No mock-payments variable on any Preview.

## §4. #190: one smoke rerun, then merge
- Run the same 5 charts, in memory. Report per reading:
  - served or floor;
  - words;
  - the final sentence;
  - every imperative or reminder (a read, not a gate).
- Add a column for **the epilogue**: its sentence count, and whether it gathers at least two of the reading's threads. It must not read as a list, and it must not carry advice.
- **Stop only if:**
  - a close teases;
  - a close gives advice or reads as a recap list;
  - an imperative survives (beyond the two passed in §0);
  - a kept category fires. One adjustment at most; after that, report.
- Otherwise:
  - repin what §1–§2 moved, with one reason per repin;
  - run the Card B pixel gate (expected unchanged; if a chart moves, re-baseline in the same PR with before/after images);
  - **merge #190.**
- **After the deploy:** confirm that the next production render carries the new prompt versions and gate version. Quote the row.

## §5. #189: merge after #190
- Rebase #189 on main and resolve the QA-index conflict (keep both entries).
- Add the §3 copy.
- Run the tests, then **merge #189.**

## §6. #186: prepare only
- After #190 merges, rebase #186 on main and repin the chart-1 snapshot with the proof that the reading is unchanged or changed as ruled.
- Re-walk both PDFs: fetch them, rasterise every page, and confirm no page ends on a heading.
- Post the two Preview links for Reyner's walk. **Do not merge #186.**

## Also
- Confirm whether #188 is merged, and quote its SHA.
- After 18 Oct, the Xendit key removal stays as listed. No action now.

## Report
Per section:
- commits;
- red-first proof;
- the §1 replay counts;
- the §2 before/after quotes and the new versions;
- the §4 smoke table with the final sentences;
- the §3 screenshots;
- merge SHAs;
- the #186 links.

End with the split.
