# Prompt BF, amendment 2: a clear arrival, and Konsepsi off the web reading (Reyner ruled 2026-10-06)
Goes in the working tree as `docs/prompts/BF-amendment-2-arrival-konsepsi.md`. Untracked until you commit it: commit it on #200.

On PR #200, branch `bf-return-to-reading`. If you are a fresh session, read `CLAUDE.md`, `docs/prompts/BF-return-to-reading.md` and `docs/prompts/BF-amendment-1-hints-focus.md` first, and read `.git/HEAD`.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No engine, writer-prompt or Stage 6 change (STAGE6 stays 1.73.0; assert both prompt versions unchanged). **No new strings.** Only the two changes below. Red first for each. Do not merge.

## 1. Arriving from "Tambahkan jam lahir": no resume card
Cowork's walk of the preview at 375x812 (test reading `WqocaFz1FTMYqLPRBrtnl`): after H3, the front door shows the resume card first, with "Buka bacaanku" as the dominant button, and the marked hour field sits at 683-729 px, below the fold on most real phones. The reader asked to add an hour; the screen should offer that one action.
- On the H3 arrival only, do not render the resume card. The remembered reading is NOT cleared: any later visit to `/` shows the card as before.
- Everything else about the arrival stays (date and gender prefilled, hour field marked).
- Assert: card absent on the H3 arrival, present on a plain visit to `/` with a remembered reading. Report the hour field's top position at 375x812 and 375x667.

## 2. Pilar Konsepsi off the web reading
Reyner: the card and caption confuse the reader and nothing in the reading uses them (胎元 is display only and not in the semantic JSON). CLAUDE.md rule 4 ("`胎元` is fine and stays") concerns the engine, which does not change.
- Remove the Pilar Konsepsi card and its caption (added in BF §3b) from the web reading page.
- **The PDF is unchanged:** the Complete Edition chart page still prints 胎元, and the glossary entry stays. If the view model is shared, remove it at the web render only.
- Assert: the web reading has no "Pilar Konsepsi" and no caption text; the Complete Edition chart page still prints it.
- Do NOT edit the mirror writer prompt, although `docs/content/renderer-prompt-v2-mirror.txt:49` says the page shows Pilar Konsepsi. Record that line in `docs/PROGRESS.md` as a watch item for the mirror voice round.
- Record the ruling in PROGRESS: "Reyner 2026-10-06: Pilar Konsepsi off the web reading; stays in the PDF chart page and glossary." If an earlier ruling put 胎元 on the web page (2026-08-07, see `lib/mirror/view.js:27`), note it as superseded there, word for word, as amendment 1 did for the hour hint.

## 3. Build, preview, report and stop
Full suite green, lint clean, local production build. Push, wait for CI and the Vercel deployment of the new head, report the SHA and each check's conclusion. 375 px screenshots: H3 arrival (no card, hour field marked); Bagan with no hour and with an hour, both without Konsepsi; the CE PDF chart page still showing 胎元. Do not merge.
