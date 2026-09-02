<!--
════════════════════════════════════════════════════════════════════════════════
STATUS: BUILD PROMPT. Written 2026-09-02.

THIS IS A REWRITE OF `O-postlaunch.md` COMMIT 5, NOT A NEW DESIGN. Everything in
that section is carried forward verbatim except the geometry, which prompt R made
obsolete. `O-postlaunch.md`'s banner now points here and its COMMIT 5 is superseded.

WHY IT IS A SEPARATE FILE RATHER THAN AN EDIT. O's banner is explicit that COMMIT 5
"sits BEHIND prompt R" and must not be rewritten until R lands. R landed (`#86`,
`bd4655a`), so the instruction is DISCHARGED rather than ignored - and O stays as
the record of what was ruled on 2026-08-23, unedited below its banner, exactly as
that banner promises. Rewriting COMMIT 5 in place would destroy the only copy of
the reasoning that produced the ruling.

EVERYTHING HERE WAS ALREADY RULED ON 2026-08-23. Copy ships as proposed, the eager
capture is approved, Card B is out of scope. Nothing in this file is waiting on
Reyner except the testing he alone can do - an iOS and Android share sheet on his
own phone.

NOTHING HERE IS A GATE CHANGE. `STAGE6_VERSION` DOES NOT MOVE.
════════════════════════════════════════════════════════════════════════════════
-->

# Prompt S - the native share sheet

## WHERE THIS STANDS, VERIFIED 2026-09-02 RATHER THAN CARRIED FROM THE HANDOVER

```
$ cat .git/HEAD
ref: refs/heads/main                                  # e95006c

$ grep -rn "navigator.share\|canShare\|new File(" components/ lib/ app/
(no hits)
```

Nothing like this exists today. `ShareCardA` (`components/Funnel.jsx:820`) only ever calls
`downloadCard('share', 'A', ...)` at `:826`.

**COMMIT 2a IS GREEN, WHICH IS THE GATE THIS WAS WAITING ON.** O's rule was that a share sheet
must not start until a real Chrome download produces a card with text on it - *"a share sheet
that hands the operating system an empty orange PNG is strictly worse than a download that
does"*. That is satisfied: `#74`/`#76` landed and both QA artifacts are tracked at
`docs/qa/2026-08-26-card-capture-cause.md` and `-verification.md`.

---

## THE CONTRACT, NOT THE IMPLEMENTATION

**Carried forward from O COMMIT 5 unchanged. All of it is geometry-independent.**

The capture is unchanged - same `captureSpec('share', 'A')`, same node, same size. Only the
DESTINATION changes:

1. Turn the captured PNG into a `File`.
2. Feature-detect with `navigator.canShare({ files: [...] })`. **Detect on the FILES, never on
   `navigator.share` alone** - several browsers expose `share` and refuse file payloads, and a
   bare `share` check is *a check that cannot fail in the way it needs to*. That phrasing is O's
   own and it is the reason, so it is quoted rather than paraphrased.
3. Where it is supported, `navigator.share`. Where it is not - most desktop browsers - fall back
   to **exactly the `downloadCard` path that exists today, unchanged**. Two destinations, one
   capture.
4. **A user cancelling the share sheet is NOT an error.** `AbortError` must not reach the
   existing `Gambarnya gagal dibuat. Coba lagi.` state. Cancelling is the single most likely
   outcome of opening a share sheet and it must look like nothing happened.

`downloadCard` (`components/cards/exportCards.js:222`) already wraps `captureCard` and builds an
`<a download>`; the share path wants the same `captureCard` result as a `File`, so factor at the
capture, not at the download.

---

## THE ONE THING THAT WILL BITE, AND IT NEEDS A REAL PHONE

**Carried forward unchanged.**

`navigator.share` requires an active user activation. The capture is not instant - 61 font
requests were measured for one of them - and on iOS Safari an `await` of that length between the
tap and the `share()` call can consume the activation, so the sheet never opens and nothing tells
you why.

**APPROVED BY REYNER 2026-08-23: capture eagerly.** Run the capture when the card mounts, hold
the `File`, and let the tap call `share()` with something already in hand. It costs one
client-side capture per reading view and it removes the whole class of failure.

**Two conditions on the eager capture, both cheap and both required:**

- **It must not block or delay the reading.** Kick it off after mount, off the critical path, and
  never let a capture failure surface an error to a reader who has not tapped anything.
- **It must be invalidated if the card data changes.** The footer merges the birth date
  client-side (Code measured `13 SEP 1989` appearing after mount), so a capture taken before that
  merge would ship a card with the wrong footer. **Capture after the data is final, and ASSERT
  it** - a silently stale `File` is worse than a slow one, because nothing looks wrong.

---

## GEOMETRY - REWRITTEN 2026-09-02. THE CONCLUSION SURVIVES, THE MECHANISM IS GONE.

**This is the only section that changes, and the WHY matters more than the number.**

### What the 2026-08-23 ruling actually said

Reyner ruled *"keep 1080x1440"*. Cowork checked it rather than taking it and found the stated
reason was wrong but the decision right, on this arithmetic:

> The card OBJECT is inset inside the canvas by the 86.4px field. A 1440 -> 1350 crop removes
> 90px. Centred, that is 45px top and 45px bottom - entirely inside the field, and the card is
> untouched. **The field is doing the work, not the ratio.**

And it drew one operational consequence from that: **the 86.4px field is a SAFE AREA and must not
be reduced**, because shrinking it would move a real crop onto the headline or the `KATON.APP`
footer.

### Why that mechanism no longer exists

**Prompt R removed the field.** `docs/content/card-polish-spec.md` §10 is the authority and it is
quoted rather than restated:

> **§10. RULED 2026-08-29 - CARD A IS 1080x1350, AND THE CARD IS THE EXPORT**
>
> | | Before (ruled 2026-08-03) | After (ruled 2026-08-29) |
> |---|---|---|
> | Canvas | 1080x1440 (3:4) | **none** |
> | Mat / margin | 86.4px uniform field | **none** |
> | Card object | 907x1267 (63:88, 0.716) | **1080x1350 (4:5, 0.8)** |
> | What is exported | canvas for share, object for download | **the card, one asset, both paths** |
>
> **The card itself is the exported asset. No mat, no workaround, no dependence on cropping
> behaviour.**

In code, `components/cards/Card.js:109`:

```js
export const CARD_A = { card: { w: 1080, h: 1350 } };   // no `canvas` key at all
```

### The conclusion survives for a DIFFERENT reason, and this is the part to carry

**The export is natively 4:5, which §10's own words call the universally safe feed size. No crop
is required, so nothing needs to absorb one.** The 08-23 conclusion - the shared file is
feed-safe - still holds. What is gone is the reason it held.

**SAY THIS EXPLICITLY SO A LATER SESSION DOES NOT REINTRODUCE A FIELD TO GUARD A CROP THAT NO
LONGER OCCURS.** The 08-23 text reads as an argument FOR a mat, and read cold, after R, it is an
argument for adding one back. It is not. The mat was a workaround for a canvas that no longer
exists, and §10 says so directly: *"No mat, no workaround, no dependence on cropping behaviour."*
Anyone reaching for a safe area here should stop and read §10 first.

**`ScaledCard`'s comment in `components/Funnel.jsx` still says `#card-a stays 1080x1440`.** That
is stale, it sits three lines from the code this prompt changes, and it is exactly the sentence
that would talk a later session back into the old frame. **Correct it in this build.**

---

## THE KNOWN LIMIT - STATE IT IN THE PR BODY, DO NOT BUILD A GUARD FOR IT

**With no field, there is no margin absorbing any crop.** That is the honest cost of §10 and it
belongs in the PR rather than in a comment nobody reads:

- A surface that **does** crop - the Instagram PROFILE GRID, which §10's source material puts at
  3:4 - would now eat card content, including the `KATON.APP` footer. **That footer is the
  attribution the entire share loop depends on.** Under the old mat, a crop ate the mat; there is
  nothing to eat now but the card.

**DO NOT INVESTIGATE THIS AND DO NOT BUILD A GUARD.** Reyner's Instagram test today rendered the
card **padded, not cropped**. Until a real surface is observed cropping it, a guard would be a
check built for a failure nobody has seen - and this repo's §4 ledger is mostly that. Name it as
a known limit, ship, and let a real observation reopen it.

---

## COPY - RULED 2026-08-23 BY REYNER: SHIP AS PROPOSED

**Use these exact bytes. Mark each `REYNER-APPROVED 2026-08-23`.**

| slot | now | ships as |
|---|---|---|
| eyebrow (`Funnel.jsx:760`) | `Simpan sebagai kartu` | **`Bagikan kartumu`** |
| lead (`Funnel.jsx:761`) | `Satu kartu ringkas tentang dirimu, untuk disimpan atau dibagikan.` | **`Satu kartu ringkas tentang dirimu, siap kamu simpan atau kirim ke siapa pun.`** |
| button (`Funnel.jsx:852`) | `Simpan Gambar` | **`Bagikan Kartu`** |
| busy (`Funnel.jsx:852`) | `Menyimpan...` | **`Menyiapkan...`** |
| fallback button, where no share sheet exists | `Simpan Gambar` | **unchanged** |
| error | `Gambarnya gagal dibuat. Coba lagi.` | **unchanged** |

**DO NOT RE-SWEEP THIS AS THOUGH IT WERE UNRULED.** It was swept CLEAN on 2026-08-23 against 65
blocklist patterns and rule 20 typography, with the self-test firing 5 findings on a deliberately
bad input. **If a check now rejects one of these strings, the presumption is that THE CHECK IS
WRONG** - read its history in `PROGRESS.md` before touching his words. That is not deference, it
is the measured position: `COWORK-BRIEF.md` §4 records checks that ban a TOKEN where the defect
is a CONSTRUCTION and fire on ordinary Indonesian.

**The button now says what it does.** The fallback keeps `Simpan Gambar` because on that path it
genuinely is a save - one capture, two destinations, two honest labels.

---

## OUT OF SCOPE - CARD B KEEPS ITS DOWNLOAD

**Carried forward unchanged, and the 08-14 reason still holds.** `Funnel.jsx:1296` is the paid
artifact and the ruling calls the object *for keeping*. A keepsake belongs in a file, not in a
share sheet, and Card B has never been exercised by anyone - **adding a second untested path to an
untested path is how a paying customer finds both.**

`captureSpec` already keeps Card B's two genuinely different targets (1080x1920 with its field for
sharing, 907x1747 stopping at the rim for keeping). Do not touch that branch.

---

## TESTS - AND BE HONEST ABOUT WHAT THEY DO NOT COVER

**NEITHER CODE NOR COWORK CAN TEST AN iOS SHARE SHEET.** Say so in the PR rather than implying
coverage. No assertion in this repo will ever exercise `navigator.share` opening on a real phone,
and a PR that lists green tests without that sentence is claiming something it has not earned.

**What CAN be asserted, and therefore MUST be:**

1. **The fallback fires when `canShare` returns false.** This is the entire safety property - a
   desktop reader must still get her card.
2. **`AbortError` does not surface the error state.** Cancel is the most likely outcome and it
   must look like nothing happened.
3. **A stale `File` is rejected rather than shared.** The eager capture's second condition, made
   executable.

**SHOW EACH ONE RED BEFORE THE CHANGE.** CLAUDE.md: *"a test that passes whether the feature
exists or not is worse than no test"*, and here it is worse still - **a test that only exercises
the supported path is worse than none, because the fallback IS the safety property.** A suite
that proves sharing works on the machine where sharing works, and says nothing about the machine
where it does not, is a suite that will be green on the day this breaks for everyone on a laptop.

`tests/contact-submit.spec.mjs` plus `scripts/jsx-register.mjs` already give this repo a jsdom +
JSX harness that mounts a real component and reads the real DOM. Use it; `navigator.canShare` and
`navigator.share` are stubbable on the jsdom window.

---

## HOW IT LANDS

**Behind the fallback, so a failure degrades to today's behaviour rather than to nothing.** Every
path that is not a confirmed file-capable share sheet must end in the `downloadCard` call that
ships today, untouched.

**Then it needs Reyner's phones - iOS and Android - before it is called done.** That is the only
remaining unknown and it is not one a repo can close.

**AND SAY THIS IN THE PR, because it is the honest limit of the whole change:** there are no
server-side conversion counters (`PROGRESS.md`, THE DEFERRED REGISTER), so **there is no way to
measure whether the share sheet increases sharing.** It is being done because the mechanism is
obviously better for a phone user, not because a number will confirm it. That is an acceptable
reason and it should be recorded as the reason rather than dressed up as one.
