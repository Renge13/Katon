<!--
STATUS: MEASUREMENT. Run 2026-08-31 against a local dev server and headless Chromium.
Re-run with: npm run dev, then npm run verify:upcoming
The harness is scripts/verify-upcoming-seen.mjs. Do not edit the transcript below; re-run it.
-->

# `upcoming_seen` observed firing, 2026-08-31

## The question, and why it was still open

Prompt Q commit 4 shipped `upcoming_seen` on an **IntersectionObserver** rather than on mount,
because prompt Q section 3 defines both interest rates as
`interest_registered[product] / upcoming_seen` rather than over completed readers, so that

> A reader who never scrolled to the block never had the chance and must not sit in the denominator.

The commit proved the **held-back** half - a fresh mobile load fired exactly one event, `offer_seen`,
and no `upcoming_seen`. It could not prove the **firing** half. The agent browser pane runs with
`document.visibilityState === "hidden"`, and a hidden tab never delivers an IntersectionObserver
callback, so the check made there said nothing in either direction.

**That left the September demand test resting on a callback nobody had ever seen fire.** The failure
mode is quiet: if the observer never delivers, `upcoming_seen` is 0, both interest rates divide by
zero, and the read-out prints `n/a` against the exact question September exists to answer.

## Method

Zero new dependencies. Node 24 ships a global `WebSocket` and Chrome ships the DevTools Protocol, so
the harness drives a real headless Chromium over CDP rather than adding a ~150MB browser download to
prove one callback. Viewport is emulated at **375x812 mobile**, because on a desktop viewport the
block can be on screen at load and "it did not fire on mount" becomes untestable.

Events are captured as `Network.requestWillBeSent` POST bodies to `/api/mirror/[token]/event`, so
what is recorded is the request the browser actually made, not a value read back out of the page.

Both observations come from **one run against one page**, so they cannot be from different states.

## Result

```
reading rTuKLYSSvtagLkBj0RNBy created via http://localhost:3000/api/mirror
chrome  C:/Program Files/Google/Chrome/Application/chrome.exe

-- 1. the run is capable of proving anything at all --
  PASS  document.visibilityState is "visible"  got "visible"
  PASS  IntersectionObserver exists

-- 2. on mount, at the top of the page --
  block geometry {"top":4551,"h":566,"vh":812,"scrollY":0}
  PASS  upcoming_seen did NOT fire on mount  saw offer_seen
  PASS  offer_seen DID fire on mount (so the transport works)

-- 3. after scrolling the block into view --
  PASS  upcoming_seen was ABSENT before the scroll and present exactly once after  before=0 after=1
  PASS  scrolling away and back does NOT fire it again  count=1

event POSTs in order: offer_seen -> upcoming_seen

ALL CHECKS PASSED - the observer was observed, in both directions.
```

The block sits at `top: 4551` in an `812px` viewport, so at load it is roughly five screens below the
fold. `offer_seen` firing in the same run is what proves the absence of `upcoming_seen` is the
observer holding back rather than the event transport being broken.

## The harness was shown failing first, and it caught a defect in itself

`upcoming_seen` was reverted to fire on mount, and the harness was re-run against that build:

```
  FAIL  upcoming_seen did NOT fire on mount  saw offer_seen, upcoming_seen
```

**On the first version of the harness, that was the ONLY failure.** Check 3 read
*"fired exactly once after scroll"* and counted the total at the end - which is `1` whether the event
fired on mount or on scroll. It passed on the broken build.

That is the *"a test that passes whether the feature exists or not"* shape the 2026-08-26 convention
was written about, and it would have shipped inside a file whose entire purpose is to be the thing
that catches this. Check 3 now snapshots the count **immediately before** the scroll and asserts
`before === 0 && after === 1`. Re-run against the same mount-firing build:

```
  FAIL  upcoming_seen did NOT fire on mount  saw offer_seen, upcoming_seen
  FAIL  upcoming_seen was ABSENT before the scroll and present exactly once after  before=1 after=1
```

Two independent failures. The implementation was then restored (`git diff` on
`components/Funnel.jsx` empty) and all six checks pass.

## What this does and does not establish

**Established:** the observer delivers in a real Chromium at a real phone viewport, once per reader,
and does not re-fire when the block leaves and re-enters view.

**Not established:** anything about production. This ran against a dev server on `localhost`. The
production bundle is minified and the block sits below a rendered reading rather than a floored one,
neither of which touches the observer, but neither has been measured. It is a smaller gap than the
one this closes and it is not zero.

**Not in scope:** whether the eleven Indonesian strings in the block are right. Every one is still a
visible `@@UNRULED: ...@@` placeholder and a production build is refused while they survive.
