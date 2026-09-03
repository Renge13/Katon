# The skeleton-to-prose gap — cause confirmed, magnitude corrected

**2026-09-03. Measured on `fix/loading-transitions` at `0f26a11`, against the real funnel on
localhost, phone width (375x812).** Reyner's prompt required this before the fix was built: *"CONFIRM
THE CAUSE FIRST. Measure the gap with reduced motion forced. If the blank period disappears, the
diagnosis holds. IF IT DOES NOT, STOP AND REPORT."*

**THE DIAGNOSIS HOLDS. THE STATED MAGNITUDE DOES NOT.** The fix is unchanged by that — the ruled
property is an overlap, and an overlap is required whether the gap is 900ms or 100ms — but the
number is corrected here rather than carried forward, because a wrong number in a fix's rationale is
how a later session re-derives the wrong problem.

---

## THE INSTRUMENT, AND WHY IT IS NOT FRAME SAMPLING

**The obvious instrument was tried first and it is broken in this environment.** The Browser pane
was hidden, and in a hidden pane:

```
requestAnimationFrame  never fires at all  (a promise awaiting one hangs; the tool timed out at 45s)
setTimeout(50)         took 902ms          (throttled to roughly 1Hz)
document.hidden        true
```

So a sampler written as "read the opacity every 16ms" would have collected **about one sample per
second** and reported whatever it happened to catch. It would not have errored. It would have
produced a plausible number for a gap it never observed. This is the trap `docs/COWORK-BRIEF.md` §4
records as a browser measurement taken against the wrong build, one layer over: here the control
would have fired correctly and the reading would still have been fabricated.

**A second instrument error was made and caught.** The first pass read
`getComputedStyle(p).opacity` on the `<p>` elements and reported `1` for every paragraph — no defect
at all. `.k-rise` is on the `Reveal` **wrapper**, not the paragraph. Measuring the wrong node reads
exactly like measuring no defect.

**What was used instead: the Web Animations API on the real elements.** `element.getAnimations()`
returns the actual animation the browser created from the actual stylesheet; setting `currentTime`
seeks it and `getComputedStyle` then resolves at that point. No elapsed frames are required, so the
throttling is irrelevant.

The instrument was falsified before its output was trusted: if seeking did nothing, every reading
would be identical. `instrumentMoved: true` — the values span 0 to 1.

---

## WHAT THE PROSE WRAPPER ACTUALLY DOES

Twenty prose wrappers, `animationName: kRise`, `duration: 0.8s`, `fillMode: both`, from
`opacity: 0; translateY(14px)` (`app/globals.css`).

At the moment of measurement: `opacityNow: "0"`, `progress: 0`, `playState: "running"` — the
animation timeline is frozen while the document is hidden, which is itself why wall-clock sampling
here is worthless and seeking is not.

**The measured curve, by seeking the real animation on the real element:**

| t (ms) | opacity | translateY |
|---|---|---|
| 0 | **0** | 14px |
| 50 | 0.264 | 10.3px |
| 100 | 0.482 | 7.25px |
| 150 | 0.647 | 4.94px |
| 200 | 0.765 | 3.29px |
| 300 | 0.901 | 1.39px |
| 400 | 0.961 | 0.54px |
| 600 | 0.997 | 0.04px |
| 800 | 1 | 0 |

**The counterfactual**, `app/globals.css`'s reduced-motion declaration
(`.k-rise, .k-bar, .k-fade, ... { animation: none; }`) applied to that same element:

```
reducedMotionOpacity: 1
```

**Opacity 1 immediately. The blank disappears. The diagnosis holds:** `.k-rise`'s `fill: both`
holds the prose at opacity 0 before and at the start of its run, and that is what makes the region
blank at the swap.

---

## THE CORRECTION: IT IS NOT "CLOSE TO A SECOND"

The prompt describes *"close to a second where the region is BLANK"*. The 0.8s in that sentence is
the animation's **duration**, not its blank period. `--ease-quiet` is heavily front-loaded, and the
measured curve above is already at 26% by 50ms and 77% by 200ms.

**What is actually true:**

- there is **one genuinely blank paint** — opacity exactly 0, with the skeleton already gone
- the prose is under half opacity for roughly the first **100ms**
- it is comfortably readable by roughly **200ms**

**The blank paint is real, and it is the defect.** The skeleton and the prose swap in a *single*
React commit — observed by MutationObserver, which is not timer-throttled:

```
t=197726  skel: 4   proseRisers: 0     <- chart-early; the skeleton holds the space
t=198231  skel: 0   proseRisers: 20    <- ONE mutation batch: skeleton gone, prose at opacity 0
```

So there is a frame with nothing in that space at all, and it follows a period in which the skeleton
had been holding it with something visible. That is worse than a plain swap, which is exactly the
prompt's reasoning, and it is why the ruled fix is an overlap rather than a shorter animation.

## THE STAGGER, MEASURED

`delay={j * 0.04}` is the paragraph index **within a block**, not across the reading. The measured
`animationDelay` values alternate `0s, 0.04s, 0s, 0.04s` across the twenty wrappers, so the largest
stagger in play is **40ms**, not a quarter-second. It is a minor contributor next to the 800ms
duration, and it is shortened anyway under the prompt's constraint.

---

## COMMANDS

Run in the page via the Browser pane's `javascript_tool`, against `npm run dev` on `localhost:3000`
with no `.env.local` — the in-memory reading store and the deterministic module-assembly floor, so
the funnel runs end to end for free and no provider is called.

```js
// the curve
const el = [...document.querySelectorAll('.k-rise')].filter(d => d.textContent.length > 120)[0];
const a = el.getAnimations()[0];
for (const t of [0,50,100,150,200,300,400,600,800]) {
  a.currentTime = t; console.log(t, getComputedStyle(el).opacity);
}
// the counterfactual
el.style.animation = 'none'; getComputedStyle(el).opacity;   // -> "1"
```
