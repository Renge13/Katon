# The region move, measured on both legs

**Before/after for `63d6488`, which added `regions: ["sin1"]` to `vercel.json` and changed
nothing else.** Companion to `2026-09-05-production-submit-split.md`, which is the baseline this
compares against and which carries the method, the instrument controls and the reasoning.

---

## THE HEADLINE

| leg | before | after | factor |
|---|---|---|---|
| **tap -> chart** (warm median, n=6) | **2,776.5ms** | **240.5ms** | **11.5x** |
| **prose, cache HIT** (median) | **3,263ms** (n=5) | **275.5ms** (n=6) | **11.8x** |
| prose, cache MISS (n=2 each side) | 9,300 / 15,352ms | 6,097 / 8,811ms | no regression |

**The function moved and it was verified before anything was measured**, rather than assumed
from the deploy succeeding:

```js
> (await fetch('/api/keepalive')).headers.get('x-vercel-id')
"sin1::sin1::rq8l7-1788613154330-01373ad3ebc2"     // was sin1::iad1
```

`sin1` is `ap-southeast-1`, the database's own AWS region. Both the edge and the function are
now in Singapore.

---

## THE SUBMIT LEG

Same method as the baseline: `form.requestSubmit()`, `performance.getEntriesByType('resource')`
rather than a JS continuation, MutationObserver on `[data-prose-skeleton]` for chart arrival.
Same input (1994-06-15 / 04:00 / Perempuan). `dns` and `connect` were 0 on every request.

| | season-check | mirror POST | tap -> chart |
|---|---|---|---|
| **before**, warm median n=6 | 269.3 | 2,507.4 | 2,776.5 |
| **after**, warm median n=6 | **51.2** | **188.5** | **240.5** |
| factor | 5.3x | 13.3x | 11.5x |

After, run by run (ms): tap -> chart `672.5 · 243.8 · 245.1 · 231.8 · 237.2 · 222.9`. The first
is elevated on `season-check` (399.8 against a 43-58 band for the rest), which is the
connection-re-establishment shape the baseline's section 5 describes, now costing a fraction of
what it did.

**THE COLD POPULATION IS NOT HONESTLY MEASURED HERE, AND THE LABEL IS WITHHELD RATHER THAN
GUESSED.** The first funnel run after the move returned **315.7ms** (season-check 73.0, mirror
238.4). The baseline's cold runs were 5,022.6 and 5,541.2, so this looks like a 16x cold
improvement - but **the deployment had been serving `/api/mirror/[token]` traffic throughout the
prose-leg measurement**, so its lambdas were not cold and calling that figure a cold sample would
be the labelling error this pass has already corrected once (the re-run's "cold re-test" that was
actually 3.4 minutes warm). It is recorded as *first funnel run after the move, warmth unknown*.
A genuine cold sample needs an idle window and has not been taken.

---

## THE PROSE LEG

`GET /api/mirror/[token]`, which is where `renderReading` consults the cache and calls Gemini on
a miss. **Every run below is labelled by `meta.cached` read off the response** - the serve view
exposes `cached`, `source` and `model` (`lib/mirror/view.js:214-218`), so hit and miss are read,
never inferred. **Every run reported `source: "gemini"`, never `module_assembly`**, which matters:
a floor render makes no provider call at all and would have hidden the whole Gemini question.

### Cache HITS - the Supabase half

| | runs (ms) | median |
|---|---|---|
| **before** (n=5) | 2,243 · 2,991 · 3,263 · 4,280 · 4,618 | **3,263** |
| **after** (n=6) | 255.3 · 266.3 · 267.6 · 283.4 · 569.7 · 709.6 | **275.5** |

**11.8x.** A cached serve makes no provider call, so this is a clean read on the database half of
the leg: `admit` (two rate-limit RPCs), `getReading`, and the render-cache read - about four
round trips, all of which were trans-Pacific and are now intra-region.

### Cache MISSES - the Gemini half, and the trap this measurement exists to avoid

| | runs (ms) |
|---|---|
| **before** (n=2) | 9,300 · 15,352 |
| **after** (n=2) | 6,097 · 8,811 |

Fresh charts each time, so every one is a genuine miss (`cached: false` on all four) and each
bought one real Gemini render. Four renders is the total provider spend of this artifact.

**WHAT THIS DOES AND DOES NOT ESTABLISH.** The concern the baseline raised was that moving the
function could *lengthen* the call to `generativelanguage.googleapis.com`, which is Google-hosted,
and that a before/after built out of cache hits would show the Supabase win while hiding exactly
that. So the misses were measured on purpose.

**No regression is detected. That is the claim, and it is weaker than "Gemini got faster".** Two
reasons, both stated rather than buried:

1. **n=2 on each side, and a Gemini render's duration is dominated by token generation**, which
   varies substantially run to run for reasons that have nothing to do with geography. The before
   pair alone spans 9,300 to 15,352 - a 6-second spread on two samples.
2. **A miss total contains both halves.** It is the ~4 Supabase round trips *plus* the
   `persistRendered` write *plus* the provider call. The Supabase part certainly got cheaper, by
   at least the ~3,000ms the hit measurement shows. **So the provider call could have got somewhat
   slower and the total would still have improved.** Nothing here separates them, and separating
   them needs server-side timing this measurement does not have.

**The honest summary: the leg improved, and there is no evidence of a provider regression large
enough to survive the Supabase saving. If a later session needs the provider call in isolation,
it has to be timed inside the handler.**

---

## WHAT THE MOVE DID TO THE FIX RANKING, MEASURED THIS TIME

The baseline's section 5 projected the other two items down and swapped their order. Both
projections are now checkable, and the accuracy is reported rather than the conclusion:

| | projected | measured | held? |
|---|---|---|---|
| one intra-region database round trip | ~20ms | **~46ms** | **order of magnitude, optimistic by ~2x** |
| folding `season-check` | ~50-80ms | **51.2ms** | **held, at the low end** |

The ~46ms is derived: `season-check` does no database work, so its 51.2ms is the
client-to-function round trip. The mirror POST at 188.5ms therefore spends about
`188.5 - 51.2 = 137ms` on three sequential database calls, or ~46ms each.

**The re-ranking stands and both items stay demoted:**

- **`Promise.all` the rate-limit dimensions** (`lib/ratelimit.js:196`, `:212`) removes one round
  trip: **~46ms**. Mechanism intact, magnitude gone.
- **Fold `season-check` into the POST**: **~51ms**, and still the larger of the two, because it
  is a client-to-function hop rather than a server-to-database one.

**AND THE ACCEPTANCE RULE IS NO LONGER TRIGGERED.** Reyner's rule, ruled 2026-09-04: *"If a
path's measured production latency exceeds ~1 second, the UI carries an unmistakably active
waiting state."* The submit path is **240.5ms warm**. The threshold is not met, so the waiting-state
work is not required on latency grounds. **This does not repeal the rule** - it records that the
condition that would have invoked it is currently false, at this measurement, on this commit.

---

## LIMITS

- **Desktop browser on a fixed connection, not a phone.** Same as the baseline; TTFB is
  98-99% of every duration, so the device contributes little, but this is not a phone figure.
- **No honest cold sample after the move.** See the submit leg.
- **n=2 per side on cache misses**, against high inherent variance. The provider call is not
  isolated from the database calls it travels with.
- **One client location.** Both before and after were taken from the same client, which is what
  makes them comparable; neither generalises to a reader on a different network.
- The before figures are the healthy-database re-run from
  `2026-09-05-production-submit-split.md` section 4, not the original Unhealthy-flagged pass.
