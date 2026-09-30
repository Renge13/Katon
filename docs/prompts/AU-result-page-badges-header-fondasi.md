# Prompt AU: badge cards, header line, loader and layout, Fondasi Pasangan, floor reasons (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AU-result-page-badges-header-fondasi.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge.
- **Do this after AS Amendment 1 §A (the DOKU walk) is done.**
- **Not in scope:** the round-6 switch (temperature, prompt, relation-English stripping). That is the next prompt, after Reyner's blind read.

## Reyner, 2026-09-30, verbatim
```
I agree on all of your recommendations
```
**Keyed referent:** Cowork's five recommendations from the same day. Each one is restated below as the ruling it now is.
1. **Profile line:** shown on reopened and shared links too.
2. **Hour format:** `PEREMPUAN | 14 FEB 2001 | 13.00` when an hour was given. With no hour, no third segment.
3. **Loader:**
   - Page order: header, then a status line, then Bagan Kelahiran, then Sebaran Unsur, then the reading.
   - Status line: "Bacaanmu sedang ditulis…", with a smaller line under it: "Biasanya selesai dalam 20 detik."
   - The skeleton takes the height of a typical reading.
4. **Badges:** badge cards rendered from the engine, placed after Sebaran Unsur, under the section title "Tanda Istimewamu". Each card shows the badge name, its English name once, its pillar, and one line of meaning from the glossary.
5. **Fondasi Pasangan:**
   - The palace line becomes "Tempat membaca dinamika hubungan paling dekat. Isinya menunjukkan tekstur relasi yang terasa wajar bagimu."
   - The floor's connective is "Di fondasi ini ada {Aspek}."

## §1. Header profile line on every load, with the hour (UI PR)
- **Serve the fields on the free path.** `lib/mirror/view.js` withholds `birthDate` and `gender` on the free payload as a standing invariant (the note at the `card` field).
  - Change it for the header only: serve `birth_date`, `birth_time` and `gender` from the stored row (`lib/mirror/handlers.js` already stores them).
  - Update the invariant's comment to quote ruling 1.
  - The **sharecard footer stays as it is.** The card is an image shared publicly, and ruling 1 is about the page line. Say so in the PR.
- **Format:** `PEREMPUAN | 14 FEB 2001 | 13.00`.
  - Use the hour exactly as she entered it, in 24-hour form with a dot.
  - With no hour, the line is `PEREMPUAN | 14 FEB 2001`, with no trailing separator.
- **Red first:**
  - a re-access render with no session shows the line;
  - a no-hour reading shows two segments;
  - a with-hour reading shows three.

## §2. Layout and loader (same UI PR)
- **Order:** header → status line → Bagan Kelahiran → Sebaran Unsur → Tanda Istimewamu (§3) → the reading → everything after it, unchanged.
- **Status line:** shown only while the reading is pending, and gone once it arrives. Floor or render, the line leaves the same way.
- **Copy:** both strings go into the audited copy bank (`lib/site/copy.js`) as REYNER-RULED 2026-09-30. If the bank's typography rules reject "…", stop and report. Don't substitute.
- **Skeleton:** the median rendered height of the round-6 readings, from the existing spacing tokens. The page must not jump when the text lands. Screenshot it at 375px.
- Before/after screenshots at 375px and desktop, and a Preview URL for Reyner.

## §3. Badge cards: "Tanda Istimewamu" (UI PR, engine-sourced)
- **Source:**
  - every `bintang` fact in the semantic JSON, including Tanda Kekosongan;
  - fields: the name (`name_id`), the English (`name_en`, italic per AQ §4, shown once on the card), the pillar(s) from the fact's positions using the ruled palace names, and one line, `label_meaning`, from the glossary;
  - no writer text and nothing new authored. If a badge has no `label_meaning`, stop and list it.
- **Always present,** on a render and on a floor alike. No badges means no section: no empty title.
- **The writer is unchanged:** it may still mention badges in the story.
- **Report:**
  - where the Complete Edition and Compatibility PDFs stand (don't change them here);
  - whether a card's pillar could ever disagree with what the reading says, and which check covers that.
- **Red first:**
  - smewTN renders four cards (Tanda Kekosongan, Bintang Perantau, Bintang Cendekia, Bintang Penolong) with the right pillars;
  - a chart with no bintang renders no section.

## §4. Fondasi Pasangan (glossary + floor PR, separate from the UI PR)
- **Glossary:** `pilar.day.branch_label_meaning` becomes ruling 5's first line. List every other file carrying the old sentence, and change only the glossary.
  - **The voice example** (`docs/content/voice-examples-v2.txt:35`) also carries the old clause, and the writer copies examples. Don't edit it here. The round-6 switch changes the prompt anyway and takes this edit with it. Report the line.
- **Floor connective:**
  - Add `RENDER_COPY` `floorPalaceOccupant: "Di fondasi ini ada {Aspek}."` beside `floorIdentity`, marked REYNER-RULED 2026-09-30.
  - The floor folds the palace's occupant into the Fondasi block with it.
- **CHECK 3 first:** your AS §4 fold tripped the invented-term check on 11 of 13 charts. Trace why before shipping. The occupant's Aspek name is either a term the reading supplies or it isn't; find which, and fix the cause.
  - If the fix changes a check, that is its own commit, red first, with its own STAGE6 bump.
- **Proof:**
  - before/after floor text for smewTN and two other charts;
  - the gate passes on all 13 fixture charts, both voices;
  - replay of stored drafts, listing every finding that moves.
- One PR to main. Not pre-approved: report and wait.

## §5. Record why a reading floored (technical, Cowork)
AS §2 could not answer why a production reading floored, because nothing records it.
- Add the floor reason to the `mirror_served` funnel event's `detail`: the gate finding ids of the last rejected draft, or `transport`, `cap`, `guard`, or `no_key`, whichever applies.
- Same for the pair event.
- No reader-visible change.
- **Red first:** a forced gate floor records its finding ids.
- Own PR. Report and wait for Reyner's go.

## Report
Per section:
- commits;
- red-first proof;
- screenshots and the Preview URL (§1-§3);
- replay output (§4).

End with the split.
