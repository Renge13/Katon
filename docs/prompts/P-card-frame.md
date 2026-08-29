<!--
STATUS: BUILD PROMPT. Cowork, 2026-08-26. RULED BY REYNER the same day.

DOES NOT RIDE ON PR #74. That PR is the capture fix and stays one thing. This lands after it
merges, as its own commit, so a card-frame change and a capture fix never share a revert.

Not a gate change. STAGE6_VERSION does not move.
-->

# Prompt P - the downloaded card is the CARD, not a card on a mat

> **SUPERSEDED 2026-08-29 by `docs/content/card-polish-spec.md` §10, `RULED 2026-08-29 — CARD A IS
> 1080x1350, AND THE CARD IS THE EXPORT`. DO NOT IMPLEMENT THIS PROMPT.**
>
> **ITS RULING IS ABSORBED, NOT DROPPED.** Reyner's 2026-08-26 words below - *"The downloaded card
> should look like a card, not a card placed on a mat"* - are carried into §10 in full and further:
> §10 removes the mat from BOTH export paths rather than from the download alone, because Card A
> stops having a canvas at all. The thing P was for is done by the thing that supersedes it.
>
> **WHY IT CANNOT BE RUN AS WRITTEN:** COMMIT 1 points Card A's button at a **907x1267 object**, and
> under §10 that object CEASES TO EXIST. Card A is recomposed at **1080x1350 with no canvas and no
> margin**, and §10 rules the change a **recomposition rather than a resize** - so there is nothing to
> retarget the button at until the design pass produces it, and nothing here may be proportionally
> scaled into the new frame.
>
> **WHAT SURVIVES AND IS WORTH READING:** the "WHY NOT TRANSPARENT" hazard below. A transparent
> margin does not survive re-encoding and usually flattens to BLACK on the recipient's screen while
> the sender sees nothing wrong. §10 reaches the same place by a different route - no margin at all,
> transparent or otherwise - and it raises the **corner radius** as the live design question that
> replaces this one: `RADIUS` 40 exists so an object floats on a canvas, and with the canvas gone a
> 40px radius exports four transparent corners into exactly the compositing hazard this section
> describes. That is flagged for the design pass and **is not ruled**.
>
> **The 2026-08-14 reasoning P said it did not supersede is still not superseded by anything here:**
> the object alone is 63:88 = 0.716 and feeds crop it. §10 answers it by designing natively at 4:5.

## THE RULING, Reyner 2026-08-26

> *"I want it transparent or none at all. The downloaded card should look like a card, not a card
> placed on a mat."*

**Read as: NONE AT ALL.** The 86.4px field is removed from what a reader downloads. Cowork
advises against the transparent variant and the reason is in the next section; Reyner has the
casting vote if he disagrees.

This supersedes nothing in the 2026-08-14 ruling's REASONING - the field was put there because
the object alone is 63:88 = 0.716 and feeds crop it. That problem is real and it does not go
away. It is answered in COMMIT 2 instead of papered over with a mat.

## WHY NOT TRANSPARENT - and this is a hazard, not a preference

A transparent margin does not survive being shared. Messaging apps and feeds flatten alpha when
they re-encode, and the usual result is **black**. A card floating in a black frame is worse than
a card floating in an orange one, and it fails only on the recipient's screen - the sender never
sees it. Keeping the geometry and making the field invisible trades a visible design choice for
an invisible failure.

**"None at all" has none of that**, because there is no margin to flatten.

**One residual, stated so it is not a surprise:** the object has a 40px corner radius, so cropping
to its bounds leaves four transparent corners - this is already the ruled behaviour of the
`download` target and the reason it is PNG and never JPEG (`exportCards.js` header, point 1). On
a platform that flattens alpha those four corners can render dark. It is 40px in each corner
rather than an 86px band on all four sides, and Card B has shipped this way by design.

---

## COMMIT 1 - point Card A's button at the object. ONE LINE.

```
$ sed -n '689p' components/Funnel.jsx
      await downloadCard('share', 'A', { id: 'card-a', filename: ... });
```

Change `'share'` to `'download'`. `captureSpec` already does the rest: node
`#card-a-object`, size 907x1267, `boxShadow: 'none'`, PNG with alpha corners. **No new code.**

**Verify, and report each:**
- The downloaded file is 907x1267, not 1080x1440.
- All four corners are alpha 0.
- The ink assertion in the folded probe still passes for both targets.
- The card on the PAGE is unchanged. This commit changes what is captured, not what is rendered.

**A consequence to state in the PR body rather than discover later:** Card A and Card B now use
the same target. Free and paid produce the same kind of artifact, which is a coherence gain and
worth saying out loud.

---

## COMMIT 2 - the ratio problem the mat was hiding. A DESIGN TASK, NOT A CAPTURE TASK.

**This is the honest cost of commit 1 and it should not be left implicit.** 907x1267 is 0.716.
Feeds accept 4:5 = 0.8 as their tallest, so a 0.716 card is taller than the frame and gets
cropped or letterboxed - and an auto-crop takes the top and bottom of a card whose headline is at
the top and whose seal and `KATON.APP` are at the bottom. That is the 2026-08-14 reasoning and
nothing has refuted it.

**The mat was a workaround for the object's ratio. Removing the mat means fixing the ratio.**

```
$ grep -n "export const CARD_A" components/cards/Card.js
84:export const CARD_A = { canvas: { w: 1080, h: 1440 }, margin: 86.4, card: { w: 907, h: 1267 } };
```

**Cowork's proposal, for Reyner to rule: make Card A's object exactly 1080x1350.** That is 4:5 on
the nose, it is the canonical feed size every source agrees on, and it is **larger in both
dimensions** than today's 907x1267 - so the type gets more room, not less. No mat, no crop, no
compromise.

It is a re-rule of a locked size (2026-08-03) and it re-flows the card, so it is a design pass
and it belongs to Reyner and a design tool, not to a build prompt. **Do not attempt it in this
commit.** Commit 1 ships the ruling; this records what it costs and what closes it.

Until commit 2 lands, the shipped state is: a card that looks like a card, which crops on a feed
post and is fine everywhere else - saved to photos, sent in a chat, opened in a gallery.

---

## NOT IN THIS PROMPT

- **PR #74** merges on its own merits. Do not fold this into it.
- **Card B's 85px vertical overflow** clipping `KATON.APP` - Reyner's ruling, still open, and it
  is the higher priority of the two because it is the paid artifact.
- **The share sheet** (prompt O commit 5). Unaffected: it hands the OS whatever the capture
  produces, and it now produces the object.
