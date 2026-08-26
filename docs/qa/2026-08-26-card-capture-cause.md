<!--
STATUS: MEASUREMENT. Claude Code, 2026-08-26. Protocol step 2 of docs/prompts/O-amend-card.md:
"Run the scale-1 arm. Report before fixing." Nothing is fixed in this file's commit.

IT CORRECTS THREE CLAIMS IN THAT PROMPT, and two of them were load-bearing:
  1. "Claude Code cannot run steps 1, 2, 4 or 6." IT CAN. The blocker was one line.
  2. "The DOWNLOAD target draws correctly." NOT AT THE PRODUCTION DISPLAY SCALE - so the
     stopgap the prompt offers Reyner would ship a broken card, not a cropped one.
  3. "The paid card is very likely fine. Likely, not proven." IT IS PROVEN, by mechanism.
Nothing here is a gate change. STAGE6_VERSION does not move.
-->

# The card capture - the cause, measured

## THE ONE-LINE ANSWER

`html-to-image` resizes the clone to the OUTPUT size before our transform is applied. The card
canvas centres its child. Centring inside a box three times too big, then scaling from the top-left
corner, pushes the whole card outside the frame. What is left is the canvas background: one colour.

**It is not the fonts, not `cacheBust`, not the sandbox, and not the canvas node.** It is the
combination of a size override and a top-left scale, and it breaks BOTH targets - the share target
completely, the download target partially.

---

## 1. CLAUDE CODE CAN RUN THE CAPTURE. THE BLOCKER WAS `requestAnimationFrame`.

The prompt planned around "Claude Code cannot run steps 1, 2, 4 or 6 - its browser cannot complete
any html-to-image capture, including an 80x40 plain div." That observation was real and the
inference from it was wrong.

`html-to-image` resolves its image loader inside a `requestAnimationFrame` callback:

```
$ grep -o "decode().then((function(){requestAnimationFrame" node_modules/html-to-image/dist/html-to-image.js
decode().then((function(){requestAnimationFrame
```

An agent browser's tab is never visible - `document.visibilityState === 'hidden'` - and a hidden tab
never fires rAF. So every capture hangs forever, with no error and no timeout, which reads exactly
like "cannot do it". Measured directly:

```
rAF: DID NOT FIRE in 3s   visibilityState: hidden
```

One line in the probe page removes it:

```js
window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0);
```

It changes WHEN the callback runs and nothing about what is drawn. With it, an 80x40 red div with a
20x10 green child captures in **9ms**. Every measurement below was taken by Claude Code, unattended.

---

## 2. THE MECHANISM, ON AN 80x40 DIV WITH NO KATON CODE IN IT

The instrument was made to fail on purpose before it was believed (CHECK 2). Same node, same page,
one variable - whether the production option shape is applied:

| arm | options | out | distinctColours | nonModalShare |
|---|---|---|---|---|
| 1 | none | 80x40 | **2** | 0.0625 |
| 2 | `width/height` override + `scale(3)` from top-left | 240x120 | **1** | **0** |

Arm 1 sees the child, so the instrument can see ink. Arm 2 is the production shape and the child is
gone. **The defect reproduces on a red rectangle**, with no card, no font, no archetype, no engine.

The cause is in `html-to-image`'s own `applyStyle`, which runs before our `style` object:

```
$ grep -o "e.width&&(n.width=\"\".concat(e.width,\"px\"))" node_modules/html-to-image/dist/html-to-image.js
e.width&&(n.width="".concat(e.width,"px"))
```

So `toPng(node, { width: 1080 })` **relayouts the clone at 1080px** while its children are still
laid out for the rendered size. Then `components/cards/exportCards.js:108-119` applies
`transform: scale(factor)` with `transformOrigin: 'top left'`.

For Card A at `CARD_SCALE = 0.34` (`components/Funnel.jsx:80`):

- canvas rendered 367.19 wide; `factor = 1080 / 367.19 = 2.941`
- clone canvas forced to 1080x1440; child object still 308.38x430.78
- `alignItems: center, justifyContent: center` (`components/cards/Card.js:904`) puts the child at
  **(385.8, 504.6)**
- x 2.941 from the top-left corner puts it at **(1134.7, 1484.1)** - outside a 1080x1440 box
- `overflow: hidden` (`Card.js:905`) clips what is left

The object node escapes the *blanking* because it is `flexDirection: column` from the top-left
(`Card.js:914`) - but not the *relayout*, which is why it is damaged rather than empty.

---

## 3. THE FOUR COMBINATIONS, ON THE REAL CARDS

`scripts/probe-card-capture.mjs` -> `reports/card-capture-probe.html`, served over localhost.
It calls the **real** `captureCard()` from `components/cards/exportCards.js`, copied in verbatim
rather than re-typed, and reads `CARD_SCALE` out of `Funnel.jsx` rather than hardcoding it.

| card | render scale | target | node width | factor | out | distinct | non-modal | ink box | verdict |
|---|---|---|---|---|---|---|---|---|---|
| A | **0.34** | **share** | 367.19 | 2.941 | 1080x1440 | **1** | **0** | **none** | **BLANK - this is production** |
| A | 0.34 | download | 308.38 | 2.941 | 907x1267 | 739 | 0.7335 | full | **DAMAGED** |
| A | 1 | share | 1080 | 1 | 1080x1440 | 1375 | 0.7300 | 87,87 907x1267 | correct |
| A | 1 | download | 907 | 1 | 907x1267 | 1493 | 0.9111 | full | correct |
| B | **0.34** | **share** | 367.19 | 2.941 | 1080x1920 | **1** | **0** | **none** | **BLANK** |
| B | 0.34 | download | 308.38 | 2.941 | 907x1747 | 4308 | 0.8577 | full | **DAMAGED** |
| B | 1 | share | 1080 | 1 | 1080x1920 | 4998 | 0.8821 | 41,61 999x1839 | correct |
| B | **1** | **download** | 907 | 1 | 907x1747 | 5151 | 0.9133 | full | **correct - this is the paid card** |

The scale-1 share row is the check that the measurement is not measuring itself: the ink box is at
**87,87 and exactly 907x1267**, which is the object at the ruled 86.4px feed-safe margin inside the
canvas. The instrument is reading the card, in the right place, at the right size.

**Reyner's harness table is reproduced.** Its four rows are the two blank shares and the two
downloads, and the numbers agree in kind.

---

## 4. THE STOPGAP IN THE PROMPT DOES NOT WORK. THIS IS THE CORRECTION THAT MATTERS TODAY.

The prompt offers Reyner a one-line stopgap: point Card A's button at the `download` target, which
"demonstrably works right now - 17 distinct colours, 509 kb, at 907x1267". The cost was priced as
losing the feed-safe field and cropping badly at 63:88.

**That price is wrong, because the download target is also on the broken path.** Production renders
Card A at 0.34, so switching the button changes which broken capture the reader gets. Against the
same card captured correctly:

| capture | pixels differing from the correct render |
|---|---|
| A share, as production runs it today | **35.9%** (it is blank) |
| **A download, as the stopgap would run it** | **19.8%** |
| B share at 0.34 | 57.6% |
| B download at 0.34 | 18.5% |

19.8% of the image is wrong. The relayout widens the object from 308px to 907px while its children
keep their 0.34-scale metrics, so only the **left third** of every row is inside the frame, centred
text is centred around x=453 where nothing is visible, and anything the column flex pushes to the
bottom lands at y=1267 - far below the 431px that is actually captured. The seal is not in the
picture.

**Recommendation: do not take the stopgap.** It trades a card that is obviously broken for one that
is subtly broken, and a subtly broken card is the one that gets posted. The real fix is small enough
that the stopgap buys nothing - see section 6.

---

## 5. THE PAID CARD IS FINE, AND IT IS NOW PROVEN RATHER THAN LIKELY

The prompt downgraded its own escalation to "very likely fine. Likely, not proven: nothing has run
the `paid: true` branch in production." The mechanism settles it without a purchase.

```
$ grep -n "card-b\"\|downloadCard('download'" components/Funnel.jsx
862:      await downloadCard('download', 'B', { id: 'card-b', ... });
883:            <CardB data={paidCard} scale={1} id="card-b" />
```

`#card-b` is rendered at **scale 1**. So `rendered === s.width`, `factor === 1`, the transform is an
identity, and `applyStyle`'s width override rewrites 907px to 907px. **The paid path never enters the
broken path at all** - it is the baseline row in the table above, the one everything else is measured
against. A real purchase is still worth doing for the rest of the delivery chain; it is no longer
owed for this.

Note the near-miss: `card-b-preview` at line 886 renders at `CARD_SCALE * 0.72` and is never
captured. Had the paid button pointed at the preview id, the paid card would have been broken too.

---

## 6. THE FIX, MEASURED - ZERO DIFFERING PIXELS ON ALL FOUR COMBINATIONS

**Remove the cause, do not compensate for it** (CHECK 3). The card is laid out at true export size
and shrunk for DISPLAY by a CSS transform on a wrapper the capture never sees; `captureCard` then
drops the `getBoundingClientRect` factor and the transform entirely. A CSS transform does not change
an element's layout box, so `clientWidth` stays 1080 and the capture is 1:1 with no scaling anywhere.

Measured against the scale-1 baseline, capturing a card inside the display wrapper:

| card | target | wrapped vs correct |
|---|---|---|
| A | share | **0 of 1,555,200 pixels differ** |
| A | download | **0 of 1,149,169 pixels differ** |
| B | share | **0 of 2,073,600 pixels differ** |
| B | download | **0 of 1,584,529 pixels differ** |

Byte-comparable. The wrapper is invisible to the capture, which is the whole claim.

**It also deletes code rather than adding it.** The factor computation exists to undo a display
scale; if the captured node is never display-scaled, there is nothing to undo. The comment at
`exportCards.js:105-107` that justifies measuring the factor off the node - "a caller that renders at
0.36 and forgets to say so would otherwise export a 327px-wide card" - describes a hazard that only
exists because the node is rendered at a display scale in the first place.

**This is one cause but two files** (`components/Funnel.jsx` renders at scale 1 inside a wrapper;
`components/cards/exportCards.js` drops the factor and the transform). They cannot be split: either
alone leaves the export wrong. That is one change under rule 13, and the un-fix in protocol step 4 is
putting the transform back.

---

## 7. THE REPO'S OWN PIXEL PROBE COULD NOT HAVE CAUGHT THIS - FOR A SECOND REASON

The prompt found one hole in `scripts/probe-card-export.mjs`: its share assertions are a size check
and one corner pixel, both of which pass on a blank field-coloured PNG. True, and worth fixing.

**There is a larger one underneath it. The probe does not call the production capture, and it never
enters the scaling path.**

```
$ grep -n "htmlToImage.toPng\|captureCard\|captureSpec" scripts/probe-card-export.mjs
157:    const dlUrl = await window.htmlToImage.toPng(objNode, {
193:    const shUrl = await window.htmlToImage.toPng(canvasNode, {
```

It hand-copies the two `toPng` calls. `exportCards.js` has since grown the `transform: scale(factor)`
the hand-copy does not have, so the probe measures a capture that has not existed for some time. And
its own line 62 states the second reason: *"Rendered at 1:1 export pixels so the capture needs no
scaling"* - it renders at scale 1 by design, which is the one arm that works.

So the probe is not merely permissive here. **It is testing a different function under conditions
production never uses.** Adding an ink assertion to it, as the prompt asks, closes the smaller hole
and leaves the larger one open. Whatever instrument ships with the fix must import the real
`captureCard` and must run at the production display scale.

`scripts/probe-card-capture.mjs` does both today. Folding the two probes into one belongs to the fix
commit, not to this measurement.

---

## WHAT IS NOT ANSWERED HERE

- **Nothing is fixed.** No product code was touched. `git status` shows one new untracked script.
- **The fix has not been run in production or in `npm run dev`** - it is measured in the probe, on
  the same components, through the same capture function.
- **Whether the display wrapper disturbs the funnel's layout** is a browser check on the real page,
  not a capture question, and it belongs to the fix commit.
- **The 30 wasted woff2 requests from `cacheBust`** stay where the prompt put them: real, small, not
  urgent, and not to be folded into this fix where they would look like the cause.
