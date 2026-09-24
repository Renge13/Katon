# Prompt AA — THE FRONT DOOR (Cowork, 2026-09-21). STATUS: RELEASED 2026-09-24. Copy cells in §4 RULED (Cowork, by Reyner's explicit delegation in chat 2026-09-24: "I let you decide on AA copy cells"). Reyner may overrule any cell on the preview.

**Code: commit this file yourself, alone, as the first commit** - Cowork's tree writes are not durable
(COWORK-BRIEF §4). NAMING: this was drafted as "Prompt E"; Code found `docs/prompts/F-payments-pricing.md:4`
reserving E for the compat pair-layer engine, so it is AA (first past Z). Cowork's "E was never used; it is
free" was wrong - a name asserted from a directory listing, not from the reservation line. Recorded in §7.

Cite the katon skill's four checks before starting. Facts below were read from `main`
(`.git/HEAD` = `ref: refs/heads/main`) on 2026-09-21; re-grep every line number before editing.

## 0. What this buys a customer (CHECK 4)
A first-time visitor, on a phone or a laptop, sees one thing to do. Today `/` shows a headline, a sub-line,
TWO cards ("Bacaan Diri" / "Kompatibilitas"), then the form, then the button - the reader is asked to choose
before she has seen the form that is the product. Reyner's direction (2026-09-21): "simple and clean like
the Google homepage; put all details on other pages." Nothing else about the funnel changes.

## 1. Scope - ONE PR, small
`components/Funnel.jsx#Home` (lines 438-547 on main), `lib/site/copy.js` SITE_COPY slots 649-652,
`tests/compat-surface.spec.mjs:152`, and the LIVE STATE row in `docs/PROGRESS.md` (rule: updated in the SAME
commit as any funnel change). Nothing in `app/api`, `lib/mirror`, the season gate, the reading, or compat.

## 2. The page, top to bottom (structure is Cowork's; every visible STRING is Reyner's)
1. Header - unchanged (`SiteHeader.jsx`; wordmark + two product links already there).
2. `h1` - unchanged ruled copy: `Ada pola di balik setiap keputusanmu.`
3. Sub-line `p` - unchanged ruled copy unless Reyner supplies a new one in §4.
4. **The two-card grid (Funnel.jsx 468-496) is DELETED.** The code comment block above it ("THE TWO
   FRONT-DOOR PATHS, 2026-09-08") is replaced by a shorter one citing this prompt and the 2026-09-07 ruling
   it preserves: compat stays a plain link out, never a stage of the form; mirror stays above compat.
5. The form card (`BirthFields`) - unchanged, but its `marginTop` closes the gap the grid left (judge on the
   preview; it is a technicality).
6. `Button` `Lihat Refleksiku` + the lock line `Privat. Hanya bisa diakses via tautanmu.` - unchanged.
7. **NEW: one text link under the lock line**, `<a href={COMPAT_ROUTE}>` with `Icon.arrow`, same
   `muted-warm` 12.5-13px register as the lock line, centred, `marginTop` ~18. Text = new slot
   `SITE_COPY.home_compat_link`. It is the ONLY mention of compat on the page besides the header.
8. Keep the two "DO NOT ADD" comments (weekly cadence / 30-second claim) exactly where they are.

## 3. Copy bank
- ADD `home_compat_link`. Until Reyner rules it, ship it as `PENDING('home_compat_link')` so
  `check-unruled-copy` refuses a PRODUCTION build (preview passes deliberately - the line has to be seen to
  be ruled). Proposal for Reyner, flagged, not decided: `Baca kecocokan berdua` with the arrow as the icon,
  not a character (check `lib/validate/blocklist.json` for the glyph rule before assuming).
- DELETE `home_mirror_label`, `home_mirror_sub`, `home_compat_label`, `home_compat_sub` (no other consumer:
  `grep -rn "home_compat\|home_mirror"` on main returns only Funnel.jsx and the one test).
- The word "Gratis" leaves the page with `home_mirror_sub`. Reyner decides whether it returns in the
  sub-line or the button (`Lihat Refleksiku` is ruled 2026-08-23; do not change it without his word).

## 4. Reyner supplies (paste-ready cell for him)
| slot | current | Reyner's ruling |
|---|---|---|
| sub-line `p` | Pahami dinamika diri, potensi, dan arah langkah berikutnya lewat bacaan yang objektif. | **keep unchanged** |
| `home_compat_link` | - | **`Baca dinamika dua orang`** (the arrow is `Icon.arrow`, not a character) |
| "Gratis" placement | was in the deleted mirror card | **in a new slot `home_lock_line`** = **`Gratis dan privat. Hanya bisa diakses via tautanmu.`**, HOME ONLY; `PasanganSteps.jsx` keeps its own lock line unchanged |
| 1280px header (§6) | `maxWidth: 460` | **keep 460** |

**RULED 2026-09-24 by Cowork on Reyner's explicit delegation** ("I let you decide on AA copy cells").
**RECORDED BY CODE, not by Cowork's write:** Cowork reported this table ruled on 2026-09-24, but its edit
never reached the tree (the committed file, `f8f8450`, carried only the new status line; see COWORK-BRIEF
§4). Code authored the four cells from Reyner's message of 2026-09-24, verbatim.

## 5. Tests (red first, CHECK 2)
- `tests/compat-surface.spec.mjs:152` loop: replace the four slots with `home_compat_link`; the test must
  FAIL on main before the copy change and pass after.
- New assertion in the existing home test file (find it: `grep -rln "Lihat Refleksiku" tests/`): the
  rendered Home has exactly ONE `<button type="submit">` and exactly ONE anchor to `COMPAT_ROUTE`, and no
  element carries the text of the deleted slots. Prove it fires by running it against main first.
- `npm test` (runs forge). `VERCEL_ENV=production npm run build` must REFUSE while `home_compat_link` is
  a sentinel and pass once ruled; quote both outputs in the PR.

## 6. Desktop
NOT adaptive work. A centred narrow column is the Google-homepage shape. One check only: on a 1280 preview
shot, does the 460px header read as intended or as a phone column? If the latter, the header/footer
`maxWidth: 460` (SiteHeader.jsx:54, SiteFooter.jsx:29) may widen to ~720 with the content column staying
460 - a one-line CSS choice, visible, so show Reyner both shots and let him pick. Do not touch any other
route's width.

## 7. Ledger
LIVE STATE front-door row updated in the same commit. A DEFERRED row: "front-door adaptive layout beyond
header width - parked at the launch cut 2026-09-21; what is unguarded: nothing for a customer, a wider
canvas is a taste choice." COWORK-BRIEF §4: Cowork named a free prompt letter from a directory listing
without grepping for a reservation (E, reserved at F-payments-pricing.md:4); and wrote the launch cut only
into the Claude project (third instance of the project-only failure). Two rounds maximum; anything left
goes to the register.
