# Submit to chart, with the 2,500ms pause gone

**2026-09-03. Measured on `fix/loading-transitions`, phone width (375x812), `npm run dev` on
localhost with no `.env.local`** - the in-memory reading store and the deterministic module-assembly
floor, so the funnel runs end to end for free and no provider is called.

Reyner, ruling the pause out: *"The 2,500ms was never work, so nobody has ever measured the real
submit-to-chart time on its own. State what it is rather than what you expected."*

**IT IS A MEDIAN OF 112ms, RANGE 56-716ms.** The removed constant was 2,500ms, so the pause was
roughly 96% of the wait it sat in.

---

## THE RUNS

Six consecutive submits, same birth date, form reset between each via `Ganti tanggal`. `submitToChart`
is `requestSubmit()` to the paint that carries the chart, detected by MutationObserver on the
reading's own `[data-prose-skeleton]` node.

| run | submit -> chart | season-check | mirror POST | render lag after POST |
|---|---|---|---|---|
| 1 | 59 | 19.1 | 20.0 | 20 |
| 2 | **716** | **505.6** | 193.3 | 17 |
| 3 | 56 | 21.1 | 19.8 | 15 |
| 4 | **510** | **473.3** | 19.7 | 17 |
| 5 | 103 | 46.5 | 40.5 | 16 |
| 6 | 112 | 74.7 | 22.6 | 14 |

median **112** · min 56 · max 716 (all ms)

## THE SEASON-CHECK RACE, WHICH IS WHY IT IS BROKEN OUT

The pause sat in `Promise.all([season-check, delay(2500)])`, so for as long as the route answered in
under 2.5s its latency was invisible. It is now on the critical path and it is the largest term.

**The ~500ms spikes are real network durations and they are NOT the route's work.** Both halves of
that were checked rather than assumed:

- They are real: `performance.getEntriesByType('resource')`, which the network stack records rather
  than a JS continuation a throttled task queue could delay, reports the same figures -
  `[17.5, 20.1, 45.2, 73.2, 472.3, 504.6]`.
- They are not the handler: **twenty calls in rapid succession give median 14.8ms, p90 18.4ms, max
  20.2ms, and ZERO over 200ms.** Warmed `curl` against the same route agrees at 14-32ms.

The spikes appear only when the calls are spaced by a full funnel run, which is `next dev` behaviour
between idle periods, not the season-check computation. **Its actual cost is about 15ms.**

## WHY THE HIDDEN-PANE THROTTLING DID NOT DISTORT THIS

The agent's browser pane runs `document.hidden`, where `setTimeout` is throttled to roughly 1Hz and
rAF never fires (see `2026-09-03-skeleton-to-prose-gap.md`). That would ruin a render-timing
measurement if React's commit were being deferred.

**It is not, and the column that proves it is `render lag after POST`: 14-20ms on every run, with no
spread.** Had the pane been deferring renders, that column would have quantised toward the 1Hz tick
the way `setTimeout(50)` did (902ms). MutationObserver callbacks are not timer-throttled, which is
why the marker is one.

## WHAT THIS NUMBER IS NOT

**It is not a production figure and it must not be quoted as one.** Localhost against an in-memory
store has no network RTT and no Supabase; production adds both. It is also `next dev`, which is
slower in JS than a production build.

What it does establish is the shape: **the 2,500ms was ~96% of the submit-to-chart wait, and what
remains is tens of milliseconds of actual work.**

**One thing it deliberately does not capture: the chart does not SNAP in at 112ms.** The reading root
carries `.k-fade` (`kFadeIn .5s`), so the DOM node lands at ~112ms and then eases to full opacity over
half a second. Anyone reading 112ms as "instantaneous" is reading the DOM timing, not what a reader
sees.

## COMMANDS

```js
// per run, in the page
const appeared = new Promise(r => { const mo = new MutationObserver(() => {
  if (document.querySelector('[data-prose-skeleton]')) { mo.disconnect(); r(performance.now()); } });
  mo.observe(document.body, {childList:true, subtree:true}); });
const t0 = performance.now();
document.querySelector('form').requestSubmit();
Math.round(await appeared - t0);

// the discriminator: is the spike the route, or the dev server?
for (let i = 0; i < 20; i++) { /* time a bare POST /api/season-check */ }
// -> median 14.8, p90 18.4, max 20.2, 0 over 200ms
```

```
$ curl -s -o /dev/null -w "%{time_total}\n" -X POST -H "Content-Type: application/json" \
    -d '{"birthDate":"1989-09-13"}' http://localhost:3000/api/season-check   # warmed, x3
0.031805
0.016711
0.013940
```
