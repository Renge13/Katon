<!--
════════════════════════════════════════════════════════════════════════════════
BANNER ADDED 2026-08-31 ON COMMITTING THIS FILE. Everything below the banner is
the 2026-08-23 prompt AS WRITTEN and is not edited.

WHY IT IS COMMITTED RATHER THAN DELETED. It was untracked for eight days alongside
two prompts that WERE superseded. It is not: it is the only record of a ruled,
approved, UNBUILT piece of acquisition work, and on a phone the share sheet is how
a card gets shared at all.

STATE OF ITS FIVE COMMITS, VERIFIED ON `main` 2026-08-31 rather than taken from
the handover that asked for this banner:

  COMMIT 2a  DONE. Shipped as #74/#76. Both QA artifacts are tracked:
             docs/qa/2026-08-26-card-capture-cause.md, -verification.md
  COMMIT 4   DONE. $ grep -n '"build:pdf"' package.json
             64:    "build:pdf": "node scripts/build-pdf.mjs",
  COMMIT 3   a record with no code; nothing to verify.
  COMMIT 5   NOT BUILT, and this is the live remainder:
             $ grep -rn "navigator.share\|canShare" components/ lib/ app/
             (nothing)

  COMMIT 1   *** NOT DONE, AND THE HANDOVER SAID IT WAS. ***
             The English diagnostic is STILL ON THE FREE READING PAGE. Verified in
             a browser on a running dev server, not by reading source:

               SEBARAN UNSUR
               display distribution only, never a strength score
               Kayu / tumbuh dan menjangkau ...

             $ grep -rn "element_presence_note" lib/ components/
             lib/semantic/index.js:286   the string
             lib/mirror/view.js:91       carried into the serve view
             components/Funnel.jsx:702   RENDERED to the reader

             This is a live rule-20 violation on the acquisition surface: English
             prose to an Indonesian audience. IT IS NOT FIXED HERE. The replacement
             is Indonesian wording, which working-style rule 9 puts with Reyner -
             a choice a reader can SEE - and rule 20 makes him its sole authority.
             Deleting the line is equally visible and equally his.

THE 1080x1440 CANVAS THROUGHOUT THIS FILE IS SUPERSEDED by
`docs/content/card-polish-spec.md` §10 and prompt R: Card A is 1080x1350, has no
canvas and no mat, and IS the export. Commit 5 references the old geometry in
several places, so IT NEEDS A REWRITE AGAINST THE NEW FRAME BEFORE IT IS
BUILDABLE. Do not rewrite it now - it sits BEHIND prompt R, and rewriting it
against a frame R has not finished landing is how it goes stale twice.
════════════════════════════════════════════════════════════════════════════════

STATUS: BUILD PROMPT. Written by Cowork 2026-08-23, after the promotion landed on production
(`#71` = f9c1c83, `#72` = a27053f, deploy from a27053f).

REVISED 2026-08-23 after Reyner tested Card A in real Chrome. Commit 2 is rewritten: the
download COMPLETES and the file is EMPTY, which is a different defect from the one the smoke
test could see. Nothing here is a gate change; `STAGE6_VERSION` does not move.

REVISED AGAIN 2026-08-23: Reyner ruled 2b. The card goes to the native SHARE SHEET, not the
filesystem. That is COMMIT 5 and it is gated on 2a being green.

ALL OF COMMIT 5 IS RULED as of 2026-08-23: copy ships as proposed, the eager capture is
approved, the 1080x1440 canvas stays. Nothing in this file is waiting on Reyner except the
testing he alone can do - an iOS and Android share sheet on his own phone.

ORDER: 2a first - it is the acquisition engine and it is broken on production right now.
Then 4, then 1, then 5. Commit 3 is a record with no code. Commit 5 does not start until a real
Chrome download produces a card with text on it.
-->

# Prompt O - the post-launch defects

## COMMIT 1 - the English diagnostic on the live page (rule 20, user-facing)

Under `SEBARAN UNSUR` production prints, in English, to an Indonesian audience:

```
$ grep -rn "display distribution only" lib/ components/
lib/pdf/document.js:191:    // "display distribution only, never a strength score" and rule 9 forbids
lib/semantic/index.js:286:      element_presence_note: 'display distribution only, never a strength score',
```

It reaches the page at `components/Funnel.jsx:614`, which renders
`chart.element_presence_note` directly.

**DO NOT FIX THIS BY TRANSLATING THE ENGINE STRING.** Cowork checked what that would cost and
it is not small:

```
$ sed -n '9p' lib/render/cache.js
// The KEY is lib/semantic/index.js#cacheKey - sha256 over the canonical semantic
$ sed -n '283,286p' lib/semantic/index.js
      // Kept deliberately (D2a section 5) so a future reader cannot mistake this for a
      // strength score. ...
      element_presence_note: 'display distribution only, never a strength score',
```

The note sits **inside the hashed semantic JSON**, so editing it changes every cache key and
orphans the entire `render_cache` - every existing reader's link re-renders, at cost, and comes
back as different prose. And the string is doing a real job where it is: it is a note to the
RENDERER, kept so the model cannot mistake presence bars for a strength score. That is rule 9
being enforced, not stray text.

**The defect is that a note addressed to the model was wired to the customer.** Fix it at the
display layer, which is where the PDF already fixes it:

```
$ grep -rn "Sebaran tampilan" lib/
lib/pdf/document.js:194:    E(Text, { style: s.small }, 'Sebaran tampilan, bukan skor kekuatan.'),
```

**Do:** render that Indonesian string on the web instead of `chart.element_presence_note`, and
**put it in one place both surfaces import** rather than hardcoding it twice - two hardcodes of
one sentence is how the PDF and the web start disagreeing. The engine note stays exactly as it
is, unchanged, still in the semantic JSON, still steering the renderer. No cache key moves.

The string is Reyner's and already approved for the PDF, so this reuses his register rather than
authoring new copy. Swept CLEAN against 65 blocklist patterns and rule 20 typography on
2026-08-23.

**Then grep the rendered surfaces for any other engine diagnostic that reaches a user.** This
one was found by a human reading a live page, which is not a repeatable instrument. Report what
you find; do not fix anything else in this commit.

---

## COMMIT 2 - CARD A DOWNLOADS AS A BLANK ORANGE RECTANGLE. Highest priority in this file.

**SUPERSEDES the earlier version of this commit, which was written before Reyner tested in real
Chrome and was wrong about the failure mode.** It said the download "did not complete" and named
`cacheBust` a performance issue. Both are corrected below. The earlier text is not kept, because
a wrong diagnosis left in a build prompt is a wrong diagnosis a session will act on.

### What Reyner measured, 2026-08-23, production, real Chrome

The download **completes**. The file that lands is **1080x1440, solid field colour, no card
object, no rounded corners, no text**. The sandboxed-browser hypothesis is dead: a real browser
produced a real file, and the file is empty of content.

### Two separate defects are in that one screenshot. Do not fix them in one commit.

**2a. THE CONTENT IS MISSING FROM THE CAPTURE. This is the break.**

`components/Funnel.jsx:689` -> `downloadCard('share', 'A', ...)` -> `captureCard` ->
`toPng(node, { ..., cacheBust: true })` at `components/cards/exportCards.js:115`.

**`cacheBust` is now the prime suspect rather than a performance note, and here is why the
evidence moved it.** Card A is almost entirely TEXT - kicker, headline, aspek, tags, hook,
badges, footer, and the large hanzi watermark. There is no rim, no photograph, no illustration.
`CARD A CARRIES NEITHER` a rim nor a drop shadow (`Card.js:874`). So a capture in which every
glyph fails to draw and the field survives is **exactly** the artefact a font failure produces,
and `cacheBust: true` appends a changing query string to every font URL inside the clone,
guaranteeing a cache miss on all of them - 61 woff2 requests were measured for one capture.
`await captureCard`'s `document.fonts.ready` resolves against the PAGE's fonts, which are
already loaded; it says nothing about the re-requested copies the clone needs.

**PROVE IT, DO NOT ASSUME IT (check 2).** The instrument must be shown able to fail:
1. Capture with `cacheBust` removed. Does the card appear? Report the file, not a description.
2. Capture with `cacheBust: true` restored. Does it go blank again? A fix that cannot be
   un-fixed has not identified the cause.
3. Only if 1 and 2 both behave: land the removal, alone, and report the request count before
   and after.

If removing `cacheBust` does NOT restore the content, stop and report. The next candidates are
the clone losing the scale transform (`factor = s.width / rendered`, `exportCards.js:110`) and
`html-to-image` serializing before the embedded fonts resolve - but they are candidates, not
findings, and this prompt does not authorise a speculative fix on the free share path.

**Why this outranks everything else here.** Card A is the free shareable and the share loop is
the acquisition engine (`CLAUDE.md` PRODUCT). Every reader who tries to share today gets a blank
orange rectangle with the site's name nowhere on it. A broken paid artifact costs one sale; this
costs the channel, and it is costing it now.

**Card B has never been exercised by anyone.** It takes the `'download'` path
(`Funnel.jsx:862`), which is a different `captureSpec` branch and a different node id
(`${id}${OBJECT_ID_SUFFIX}`). Test it in the same session and report separately. Do not assume
one result covers both.

### 2b. THE FRAME. RULED 2026-08-23 - and the ruling replaced the question.

**What was asked:** Reyner expected the rounded object and got the 86.4px field. The code is
doing exactly what the 2026-08-14 ruling says:

```
//   SHARE     the canvas.  A 1080x1440 (3:4), B 1080x1920 (9:16).  For posting.
//   DOWNLOAD  the object.  A 907x1267,        B 907x1747.          For keeping.
```

Cowork proposed rewording the button. **Reyner ruled something better: the card should go to the
native share sheet, not to the filesystem.** His reasoning, and it is the right one: on a phone
the OS sheet already contains save, copy, WhatsApp and Instagram, so handing the file to the OS
beats handing it to a downloads folder she then has to go find. That is what an acquisition
artifact should do.

**The frame question dissolves rather than being decided.** If the destination is the share
sheet, the file she passes to Instagram should be the feed-safe canvas - which is what `share`
already captures. The 08-14 ruling stands untouched. The button simply stops describing itself
as a save.

This is COMMIT 5. It is not part of 2a and must not travel with it.

---

## COMMIT 5 - the native share sheet. GATED ON COMMIT 2a BEING GREEN.

**Do not start this until 2a is landed and a real Chrome download produces a card with text on
it.** A share sheet that hands the operating system an empty orange PNG is strictly worse than a
download that does: it puts the broken artifact one tap from a friend's screen. The gate is not
process hygiene, it is the whole reason the card matters.

Nothing like this exists today:

```
$ grep -rn "navigator.share\|canShare\|new File(" components/ lib/
(no hits)
```

`ShareCardA` (`components/Funnel.jsx:683`) only ever calls `downloadCard('share', 'A', ...)`.

### The contract, not the implementation

The capture is unchanged - same `captureSpec('share', 'A')`, same canvas, same size. Only the
destination changes:

1. Turn the captured PNG into a `File`.
2. Feature-detect with `navigator.canShare({ files: [...] })`. **Detect on the files, not on
   `navigator.share` alone** - several browsers expose `share` and refuse file payloads, and a
   bare `share` check is a check that cannot fail in the way it needs to.
3. Where it is supported, `navigator.share`. Where it is not - most desktop browsers - fall
   back to **exactly the `downloadCard` path that exists now**, unchanged. Two destinations,
   one capture.
4. A user cancelling the share sheet is NOT an error. `AbortError` must not reach the existing
   `Gambarnya gagal dibuat. Coba lagi.` state.

### THE ONE THING THAT WILL BITE, AND IT NEEDS A REAL PHONE

`navigator.share` requires an active user activation. The capture is not instant - 61 font
requests were measured for one of them - and on iOS Safari an `await` of that length between the
tap and the `share()` call can consume the activation, so the sheet never opens and nothing
tells you why.

**APPROVED BY REYNER 2026-08-23: capture eagerly.** Run the capture when the card mounts, hold
the `File`, and let the tap call `share()` with something already in hand. It costs one
client-side capture per reading view and it removes the whole class of failure.

Two conditions on the eager capture, both cheap and both required:
- **It must not block or delay the reading.** Kick it off after mount, off the critical path, and
  never let a capture failure surface an error to a reader who has not tapped anything.
- **It must be invalidated if the card data changes.** The footer merges the birth date
  client-side (Code measured `13 SEP 1989` appearing after mount), so a capture taken before that
  merge would ship a card with the wrong footer. Capture after the data is final, and assert it -
  a silently stale `File` is worse than a slow one, because nothing looks wrong.

**But this cannot be settled from a repo or a headless browser.** Neither Code nor Cowork can
test an iOS share sheet. Land it behind the fallback so a failure degrades to today's behaviour
rather than to nothing, and **Reyner tests it on his own phone, iOS and Android, before it is
called done.**

### Copy - RULED 2026-08-23 by Reyner: SHIP AS PROPOSED.

Swept CLEAN on 2026-08-23 against 65 blocklist patterns and rule 20 typography, self-test firing
5 findings on a deliberately bad input. Use these bytes exactly; mark each
`REYNER-APPROVED 2026-08-23`.

```
eyebrow   (now "Simpan sebagai kartu")   ->  Bagikan kartumu
lead      (now "Satu kartu ringkas tentang dirimu, untuk disimpan atau dibagikan.")
                                         ->  Satu kartu ringkas tentang dirimu, siap kamu simpan atau kirim ke siapa pun.
button    (now "Simpan Gambar")          ->  Bagikan Kartu
busy      (now "Menyimpan...")           ->  Menyiapkan...
fallback button, where no share sheet exists, unchanged: Simpan Gambar
error, unchanged: Gambarnya gagal dibuat. Coba lagi.
```

### Two things deliberately NOT in this commit

**Card B keeps its download.** `Funnel.jsx:890` is the paid artifact and the 08-14 ruling calls
the object *for keeping*. A keepsake belongs in a file, not in a share sheet, and Card B has
never been exercised by anyone - adding a second untested path to an untested path is how a
paying customer finds both.

**The canvas ratio: RULED KEEP at 1080x1440, and the ruling is right for a different reason
than the one given. Recorded, because the reason is what a later session will reuse.**

Reyner ruled *"keep 1080x1440, it remains the optimal aspect ratio for Instagram feeds and
WhatsApp media previews."* Cowork checked it rather than taking it, 2026-08-23. What the sources
actually say:

- **4:5, 1080x1350, is the universally safe feed size.** That is the one every source and every
  third-party scheduler agrees on.
- **3:4, 1080x1440, is now the PROFILE GRID tile ratio**, which is a recent change and is why
  the number is in circulation. Sources disagree on which surface crops which: one says feed
  posts render at original ratio while the grid preview applies a 4:5 crop, another says the
  grid is 3:4 and non-updated schedulers auto-crop a 1080x1440 feed post.

So 3:4 is not "optimal for feeds" - it is the grid ratio, and a ~90px crop to 4:5 is possible on
at least one surface.

**KEEPING IT IS STILL CORRECT, AND HERE IS THE ARITHMETIC THAT MAKES IT CORRECT.** The card
OBJECT is inset inside the canvas by the 86.4px field. A 1440 -> 1350 crop removes 90px. Centred,
that is 45px top and 45px bottom - entirely inside the field, and the card is untouched. Even a
worst-case bottom-only crop of 90px eats the 86.4px field and clips about 4px of card edge.

**The field is doing the work, not the ratio.** It was ruled in on 2026-08-14 as what makes the
file feed-safe, and this is the measurement that shows it earning that description. **The
operational consequence: the 86.4px field is now a SAFE AREA and must not be reduced** - shrinking
it to make the card bigger would move a real crop onto the headline or the `KATON.APP` footer,
which is the attribution the whole share loop depends on.

**AND SAY THIS OUT LOUD IN THE PR BODY, because it is the honest limit of the whole change:**
there are no server-side conversion counters (`PROGRESS.md`, THE DEFERRED REGISTER), so **there
is no way to measure whether the share sheet increases sharing.** It is being done because the
mechanism is obviously better for a phone user, not because a number will confirm it. That is an
acceptable reason and it should be recorded as the reason rather than dressed up as one.

---

## COMMIT 4 - PUT THE REAL PDF IN REYNER'S HANDS. Spends nothing, buys nothing.

Reyner wants a design pass on the Complete Edition PDF and does not want to purchase yet. He
does not have to: the builder reads the cache and never calls a provider.

```
$ sed -n '5,12p' scripts/build-pdf.mjs
//   npm run build:pdf                       chart 1, the full document
//   npm run build:pdf -- --date 1988-07-10 --time 22:00
//   npm run build:pdf -- --out reports/x.pdf
//
// SPENDS NOTHING BY DEFAULT. The reading comes from `render_cache` if a row exists,
// and from the deterministic FLOOR if one does not - never from a provider.
```

**Do:** build the PDF from the reading Code created on production during the smoke test - the
13 SEP 1989 chart, which now has a `render_cache` row - so the document Reyner reviews is a real
reading and not chart 1. Hand him the file.

**AND SAY IN THE CONSOLE OUTPUT WHETHER IT CAME FROM THE CACHE OR THE FLOOR.** The script already
labels this and the label is the whole point: *"a document built on module assembly is not a
document built on a reading, and the difference is invisible once the PDF is open."* A design
pass conducted on floor prose would be a design pass on the wrong artifact.

Report the page count and the `pageMap` convergence from `lib/pdf/build.js`. Any design pass
that changes page count or flow has to re-converge that fixed point and its `hal. N`
cross-references, so the current numbers are the baseline the design work is specced against.

**Nothing is redesigned in this commit.** It produces one file and one report.

---

## COMMIT 3 - NOTHING TO BUILD. A RECORD, so the next session does not re-ask what Reyner asked

**The money path is PROVEN LIVE and has been since 2026-08-13.** Cowork told Reyner on 2026-08-23
to "swap the Xendit keys to live" as though it were outstanding. He challenged it. The ledger
already answered:

```
$ sed -n '1353,1372p' docs/PROGRESS.md
XENDIT VERIFICATION APPROVED - go-live ritual executed 2026-08-07 (Cowork session), status:
- Business verified, bank account (BCA, PT KATON DIGITAL NUSANTARA) active.
- Live xnd_production_... key + live webhook verification token generated and swapped into
  Vercel Production; redeployed. The live-key-swap item below is DONE.
- Webhook URL saved for Invoices-paid + paid-after-expiry.
- QRIS channel: ACTIVATED 2026-08-11
$ grep -n "first self-purchase" docs/PROGRESS.md
... first self-purchase completed (Reyner's report, 08-13) ... CLOSED 2026-08-13
```

Add one line to `THE INTERIM REGISTER` recording that the money path - invoice created, QR
scanned, webhook verified, `paid` flipped server-side - was proven end to end on 2026-08-13 and
is NOT re-opened by the promotion. **The reason it needs writing down:** a Cowork session read
"confirm the Xendit keys are LIVE" in `docs/prompts/N-merge.md` section 2 and treated a
belt-and-braces re-check as an open task. The register is where that gets settled once.

**AND RECORD WHAT IS GENUINELY NEW, because it is not the same claim.** The 08-13 purchase bought
the LEGACY 19k deep-read unlock. What money now buys is different code:
`lib/deliver/handlers.js` -> Card B at download resolution plus the Complete Edition PDF, on
`sku: artifact`. Code verified on production that the paywall HOLDS - manifest `paid: false`,
`/card` and `/pdf` both 402 - but **nothing has ever exercised the `paid: true` branch in
production.** The webhook half is proven; the delivery half is not.

Do not build a workaround for this. It is one purchase by Reyner and it is his to make or skip.

---

## NOT IN THIS PROMPT

- `PR #73`, the `NEXT.md` pointer. Reyner's to merge.
- Prompt M, tranche 3. Unblocked now that `#71` and `#72` are merged, but it is content work and
  these two are live defects. Order is Reyner's.
- The three operational items in `docs/prompts/N-merge.md` section 2. All three are Reyner's and
  none is a commit.
