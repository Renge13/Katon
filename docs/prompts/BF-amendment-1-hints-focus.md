# Prompt BF, amendment 1: one hour hint, one next action, a visible target field (Reyner ruled 2026-10-06)
Goes in the working tree as `docs/prompts/BF-amendment-1-hints-focus.md`. Untracked until you commit it: commit it on #200.

On PR #200, branch `bf-return-to-reading`. If you are a fresh session, read `CLAUDE.md` and `docs/prompts/BF-return-to-reading.md` first, and read `.git/HEAD`.

Cite the four checks. No regex through a shell heredoc. No model-based judge. No engine, writer-prompt or Stage 6 change (STAGE6 stays 1.73.0; assert both prompt versions unchanged). **No new strings.** Only the three changes below; no other UX or copy change. Red first for each. Do not merge.

## 1. One hint under the hour field
Remove the old line "Tanpa jam tetap akurat, pakai jam jauh lebih presisi." (`components/BirthFields.jsx:140`). H1 "Tidak tahu? Lewati saja." becomes the only hint under the hour field, in the old line's place and style. `BirthFields` also renders on the compat form (`components/PasanganSteps.jsx:195`), where the old line shows today: H1 replaces it there too, so no form carries the accuracy claim. Assert: the old string appears nowhere in the rendered front door or the compat form, and H1 appears exactly once per hour field. Grep the repo for the old string and report every hit.

## 2. End of the reading: one next action
The end-of-reading block is R4 "Baca tanggal lain" only. Remove its compat link, whatever `COMPAT_SALES` says. Change the existing both-states test so it asserts the link is absent with compat open AND closed. Everything else about compat on the page (the existing compat card) is unchanged.

## 3. After "Tambahkan jam lahir", the hour field is visibly the target
In `docs/qa/2026-10-06-bf-site/h3-arrival-hour-focused-375.png` the hour field shows no focus, yet `app/globals.css:185-194` already gives `select:focus` a gold border and a 3 px `--emas-dim` ring.
a. **Diagnose first**, one paragraph with the code lines: after the H3 arrival, is `document.activeElement` the hour select (`#mirror-time`)? If not, why (timing, element not yet mounted, headless window focus)?
b. **Fix:** after the H3 arrival, the hour select shows that existing focus treatment, and it must not depend on the browser honouring a programmatic `focus()` (iOS Safari does not reliably). Keep the `focus()` call; also mark the field as the target (a data attribute) and add that selector to the existing focus rule, so it gets the same border and ring. No new colour, size, animation, scroll or copy. The mark is removed once the reader picks an hour. Without an H3 arrival, the form is unchanged.
c. Red first: the mark is present after the H3 arrival, absent on a normal front door, and gone after an hour is chosen; the target selector shares the `select:focus` rule (read the CSS source, not the computed style).

## 4. Build and preview
Full suite green, lint clean. Run a local production build. Push, then wait for the Vercel deployment of the new head commit and the CI checks to finish. Report the head SHA, each check's conclusion and the preview URL. The preview sits behind Vercel Authentication, so a 401 without a login is expected; report the deployment state, never a page load you could not make.

## 5. Report and stop
Commits, red-first runs, the §3a cause, the hits from the §1 grep, 375 px screenshots (front door with only H1; compat form with only H1; end of reading with compat open and with compat closed; H3 arrival with the hour field marked), the checks and the preview URL. Do not merge.
