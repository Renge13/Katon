# The 4.9s submit wait, split on production

**PR2 STEP 1. LANDS NOTHING. This document is the whole deliverable.**

---

## THE ONE-LINE ANSWER

**The 4.9s is `POST /api/mirror`, and that request is three sequential Supabase round trips
executed in Washington DC for a reader in Southeast Asia.** `season-check` is about 0.3s of it
(10.5% of the warm wait); the mirror POST is about 2.5s of it (88.4%). The Vercel function region is `iad1` and no
`regions` key exists in `vercel.json`, so it is running on the US-East default while the edge
that receives the request is `sin1`.

**THE PROMPT'S PROPOSED STEP 2 WOULD REMOVE ABOUT A TENTH OF THE WAIT.** Folding `season-check`
into the mirror POST is a real saving and it is not the cause. See THE PRICE OF STEP 2 below.

---

---

## AMENDED SAME DAY - THE REGION IS ANSWERED, AND THE BASELINE IS RE-RUN CLEAN

**APPEND-ONLY. No figure recorded below this section has been altered.** The body of this
document stands exactly as it was committed in `880e7a9`; this section records what became known
afterwards. Same practice as `2026-08-26-card-b-overflow.md`, which was amended by `eeef7f2`
to add a corrected surface list without touching its measurements - and the reason the body is
not edited in place is the index's own rule: an edited artifact is not evidence.

### 1. THE SUPABASE REGION IS `ap-southeast-1`. THE BODY BELOW CALLS THIS "THE SINGLE
### HIGHEST-VALUE UNKNOWN" AND THAT SENTENCE IS NOW SUPERSEDED.

Confirmed by Reyner from the Supabase dashboard, 2026-09-05: **Primary Database, Southeast Asia
(Singapore), `ap-southeast-1`, instance size `t4g.nano`.**

**So `iad1` -> `ap-southeast-1` crosses the Pacific on EVERY database call, and the mirror POST
makes three of them in series.** That is the measured 88.4% of the warm wait, and it is now a
distance with a number attached rather than an inference from `x-vercel-id`.

### 2. `sin1` IS `ap-southeast-1`. THE FIX COLLOCATES THEM EXACTLY.

From Vercel's region list (`https://vercel.com/docs/regions`, retrieved 2026-09-05):

| Region Code | Region Name | Reference Location |
|---|---|---|
| iad1 | us-east-1 | Washington, D.C., USA |
| sin1 | **ap-southeast-1** | **Singapore** |

The function's target region and the database's region are **the same AWS region**, not merely
the same continent. `regions: ["sin1"]` therefore turns three trans-Pacific round trips into
three intra-region ones.

### 3. IT IS NOT PLAN-BLOCKED. HOBBY GETS A SINGLE REGION, AND ONE IS ALL THIS NEEDS.

The concern was that per-function region selection might be Pro-only. It is not. From
`https://vercel.com/docs/functions/configuring-functions/region` (retrieved 2026-09-05), the
Limits table:

| Plan | Function regions |
|---|---|
| **Hobby** | **Single region** |
| Pro | 5 regions |
| Enterprise | All regions |

*"Additionally, Pro and Enterprise teams can deploy Vercel Functions to multiple regions."* The
plan gate is on the COUNT, not on the capability, and `regions: ["sin1"]` is one region.

**Two things that follow, and the second is a safety property worth knowing:**
- `functionFailoverRegions` **is** restricted (Enterprise). Not needed here and not proposed.
- *"Deploying to more regions than your plan allows causes the deployment to fail before the
  build step."* So a plan-limit mistake fails loudly at build rather than shipping silently.

**A SEPARATE COMMERCIAL FINDING IS NOT RECORDED HERE ON PURPOSE.** Hobby is restricted to
non-commercial use and Katon takes payments; that is a product and compliance matter for
`docs/PROGRESS.md`, not a latency measurement, and putting it in a QA artifact is how a
commercial decision would come to be cited from the wrong document.

### 4. THE BASELINE WAS RE-RUN ON A HEALTHY DATABASE. IT DID NOT MOVE.

The original runs were taken while the Supabase project was flagged **Unhealthy**, which makes
them suspect on their face. Status is now healthy; the warm runs were repeated with the same
method and the same instrument control (with no submit, the delta reader found 0 new API entries
against a 31-entry buffer).

| warm median | committed body (Unhealthy) | re-run (healthy) | delta |
|---|---|---|---|
| season-check | 295.0 | **269.3** | -25.7 |
| mirror POST | 2,481.5 | **2,507.4** | +25.9 |
| tap -> chart | 2,807.1 | **2,776.5** | -30.6 |

`n=6` warm both times. Every median moves by under 31ms, roughly 1% on the two that matter.

**THIS IS A LOAD-BEARING NEGATIVE RESULT: THE "UNHEALTHY" FLAG WAS NOT THE CAUSE.** Had the
figures collapsed on a healthy database, the whole geography argument would have been an artifact
of a degraded instance and the ranking would have had to be redone. They did not move, so **the
latency is structural** - distance and serialisation - and the fix ranking in THE PRICE OF STEP 2
stands unchanged. The artifact stands as written.

**A SECOND COLD SAMPLE, which the body records as deliberately not taken.** The re-run's first
hit came after a ~50 minute idle and is cold by construction: **5,541.2ms** (season-check 1,529.5
including 12.2 DNS + 98.1 connect, mirror 4,001.9). With the body's 5,022.6 that is cold n=2,
both reproducing the recording's 4.9s. Note the non-zero DNS and connect here, where the body's
cold run had 0/0 - that run followed a page load, so its connection was already open.

**AND A NEW OBSERVATION THE MEDIAN HIDES: the warm mirror POST is BIMODAL.**

```
1,939.5   1,952.9   1,959.3   |   3,055.4   3,096.7   3,183.5
        mean 1,950.6          |          mean 3,111.9
```

Three runs in each cluster, **~1,161ms apart, which is about the cost of one Supabase round
trip** as this document measures it. That is consistent with a connection to Supabase being
reused on some invocations and re-established on others, and it is a second, independent saving
that the region change would partly mask rather than fix. **Stated as an observation with a
hypothesis attached, not as a measurement of a cause** - nothing here isolates it, and STEP 2
should spend one check on it before crediting the region change with the whole delta.

### 5. THE PER-ROUND-TRIP COST IS NOW MEASURED DIRECTLY, AND IT RE-RANKS THE FIX LIST

The body prices a Supabase round trip at **~550-990ms, n=2, explicitly indicative** from a probe
that had to subtract a floor from a two-call handler. **That estimate is superseded by a direct
measurement**, and the instrument is `/api/keepalive` (shipped in `f027481`), which is a better
one for a reason that has nothing to do with luck: **it makes exactly ONE database call and
reports its own server-side duration in `ms`.** Nothing has to be subtracted, and no client-side
timing is involved.

Eight consecutive samples against production, `iad1` function, `ap-southeast-1` database:

```
283   288   289   289   |   522   806   940   1131
   floor cluster, 4/8       tail, 4/8
   median 405.5 · min 283 · max 1131
```

**It is bimodal, and the two modes have a mechanism.**

- **~285ms is ONE round trip on a reused connection.** Singapore to Virginia is roughly a
  230-250ms RTT, so this is one crossing plus query time and nothing else. Note it is also
  almost exactly the warm `season-check` figure (269.3ms), which is one client-to-function
  crossing - the same ocean, measured from the other end.
- **The 522-1131 tail is 2-4 crossings**, which is the shape of a connection being
  re-established (TLS handshake) rather than reused.

**This independently confirms the bimodality recorded in section 4** for the warm mirror POST -
two clusters ~1,161ms apart, about one round trip - and explains it. Same phenomenon, seen once
through a three-call handler and once through a one-call handler.

#### THE CONSEQUENCE, STATED HERE SO A LATER SESSION DOES NOT RE-DERIVE IT

**MOVING TO `sin1` DOES NOT REDUCE THE NUMBER OF ROUND TRIPS. IT MAKES EACH ONE NEARLY FREE.**
Function and database land in the same AWS region, so a crossing measured at 283ms at its floor
and 1,131ms at its tail becomes an intra-region call - on the order of **20ms**. The three
sequential calls in the mirror POST stay three calls; they stop being three ocean crossings.

**That re-ranks the other two items, and it demotes both:**

| after the move | what it saves | why it moved |
|---|---|---|
| ~~2. `Promise.all` the rate-limit dimensions~~ | **~20ms** | It removes one round trip. A round trip now costs ~20ms instead of 285-1,131ms, so the fix keeps its mechanism and loses its magnitude. **Three cheap round trips are approximately one cheap round trip.** |
| ~~3. Fold `season-check` into the POST~~ | **~50-80ms, projected** | It removes a CLIENT-to-function round trip, and the client is a real device on the internet - that hop shortens but does not vanish, unlike a server-to-database hop. |

**So the two swap order, and both become small.** Folding `season-check` becomes the larger of
the two remaining items rather than the smaller, because it is the only one whose saving is not
an intra-region call. Neither is worth doing on latency grounds alone after the move.

**THE ~20ms AND THE ~50-80ms ARE PROJECTIONS, NOT MEASUREMENTS.** They are what an intra-region
call and a shortened client hop should cost; nothing in this section measures either. The
after-the-move figures belong in the region change's own before/after artifact, and if they
disagree with these projections it is these projections that are wrong.

---

## THE REF THIS WAS MEASURED ON, CONFIRMED RATHER THAN QUOTED

```
$ cat .git/HEAD
ref: refs/heads/main

$ git rev-parse HEAD
2dae13ba76b754f10150112ba863450d86d59bd2

$ git rev-parse origin/main
2dae13ba76b754f10150112ba863450d86d59bd2

$ gh api "repos/Renge13/Katon/deployments?per_page=3" --jq '.[] | "\(.sha[0:7]) \(.environment) \(.created_at)"'
2dae13b Production 2026-09-04T04:44:41Z
cf80adb Preview    2026-09-04T04:40:07Z
9c4f892 Preview    2026-09-04T04:29:11Z
```

**`main` IS NOT `f29fc0e`.** `docs/prompts/T-arrival.md` names `f29fc0e` as the ref "at time of
writing" and instructs that it be confirmed before quoting. It has moved four commits since, and
production is serving `2dae13b`.

**The comparison the prompt wanted is nevertheless intact, and this was checked rather than
assumed.** The four commits touch three files and none of them is on the submit path:

```
$ git diff --stat f29fc0e 2dae13b
 docs/COWORK-BRIEF.md | 23 +++++++++++++++++++++++
 docs/PROGRESS.md     |  1 +
 lib/xendit.js        | 34 ++++++++++++++++++++++++++++++++++
 3 files changed, 58 insertions(+)

$ git diff f29fc0e 2dae13b -- lib/xendit.js | grep -c '^+[^+]'
34
$ git diff f29fc0e 2dae13b -- lib/xendit.js | grep '^+[^+]' | grep -vc '^\+ *\(\*\|/\*\|//\)'
0           # zero added lines are non-comment: the whole diff is the freeze docblock

$ grep -rn "xendit" app/api/mirror app/api/season-check components/Funnel.jsx
            # no output
```

Two docs and a comment block. `components/Funnel.jsx`, `app/api/season-check/route.js`,
`app/api/mirror/route.js` and `lib/mirror/handlers.js` are byte-identical across the range, so
these numbers are directly comparable to the 4.9s in the screen recording taken on `f29fc0e`.

---

## WHAT THE STAGE WAS, IN THE SAME SENTENCE AS THE FIGURES

Applying the rule this pass is adding to `COWORK-BRIEF.md` section 4 to this document first.

**Every figure below was measured against `https://katon.app` (production, commit `2dae13b`,
real Vercel functions, real Supabase) from a desktop browser on a fixed connection, viewport
emulated to 375x812.** That is production for the network and the backend, which is the part
localhost could not supply and the reason the 112ms figure did not transfer.

**IT IS NOT A PHONE.** Two things are therefore absent and both would make the real figure
worse, not better: mobile radio latency on the first connection, and a slower device CPU. The
terms these numbers are made of are server-side (TTFB is 98-99% of every duration below), so the
device contributes almost nothing to them - but this document must not be quoted as a
phone measurement. **Reyner's 4.9s from the screen recording IS a phone measurement, and run 1
here reproduces it at 5.02s, which is the strongest evidence that the gap is not device-shaped.**

---

## THE INSTRUMENT, AND ITS DELIBERATE FAILURE

`performance.getEntriesByType('resource')`, not a JS continuation, for the reason
`2026-09-03-submit-to-chart.md` gives: the browser pane runs `document.hidden`, where timers are
throttled to roughly 1Hz. Resource timing is recorded by the network stack and is not throttleable.

**THE CONTROL, RUN BEFORE ANY SUBMIT:**

```js
{ bufferSize: 21, control_before_any_submit: [] }
```

21 resource entries in the buffer, **zero** matched the `/api/` filter. The filter discriminates;
it is not matching everything and reporting it as an API call.

**THE CROSS-CHECK THAT THROTTLING IS NOT DISTORTING THE WALL CLOCK.** On every run, the
MutationObserver-stamped `tap -> chart` agrees with the sum of the two resource durations to
within 12ms:

`mirror ends at` is that request's own `startTime - tap` plus its `duration`, both from the
resource entry - not a sum, so a gap between the two requests cannot hide inside it.

| run | mirror ends at | observed tap -> chart | gap (React commit) |
|---|---|---|---|
| 1 | 1,020.0 + 3,993.3 = 5,013.3 | 5,022.6 | 9.3 |
| 2 | 282.1 + 3,145.1 = 3,427.2 | 3,432.1 | 4.9 |
| 3 | 355.6 + 2,495.3 = 2,850.9 | 2,854.7 | 3.8 |
| 4 | 298.1 + 2,418.0 = 2,716.1 | 2,720.1 | 4.0 |
| 5 | 302.0 + 3,016.6 = 3,318.6 | 3,323.6 | 5.0 |
| 6 | 286.4 + 2,467.6 = 2,754.0 | 2,759.5 | 5.5 |

Had the hidden pane been deferring the continuation between the two fetches, that column would
have quantised toward the 1Hz tick. It is 3.8-9.3ms with no spread. **The two requests ARE the
wait**, and the gap between them - React's own commit - is single-digit milliseconds.

**Driven with `form.requestSubmit()`, the real React submit handler**, because the hidden pane
cannot paint and `computer:left_click` times out against it. Same method as the 2026-09-03 doc.

---

## THE RUNS

Seven runs, same input (1994-06-15 / 04:00 / Perempuan - a date carrying no season turn, verified
with `seasonTurnOnDate`, so `needsHour` is false and the season gate never appears). Form reset
between runs via `Ganti tanggal`. Same input every run means one Gemini render at most; every
subsequent serve is a cache hit, and the POST path is identical on all six because
`createMirrorReading` mints a fresh `nanoid(21)` and inserts a new row every time.

**All durations in ms. `dns` and `connect` were `0` on every request in every run** - the
connection was established at page load and reused, so none of this is connection setup.

| run | cold/warm | gap since previous | season-check TTFB | season-check total | mirror TTFB | mirror total | tap -> chart |
|---|---|---|---|---|---|---|---|
| 1 | **COLD** (first hit of session) | site idle | **1,007.8** | **1,015.3** | **3,984.8** | **3,993.3** | **5,022.6** |
| 2 | warm | 22s | 274.6 | 280.7 | 3,143.5 | 3,145.1 | 3,432.1 |
| 3 | warm | 10s | 349.0 | 354.4 | 2,493.6 | 2,495.3 | 2,854.7 |
| 4 | warm | 7s | 288.7 | 296.8 | 2,416.5 | 2,418.0 | 2,720.1 |
| 5 | warm | 18s | 295.1 | 300.8 | 3,014.6 | 3,016.6 | 3,323.6 |
| 6 | warm | 28s | 278.3 | 285.0 | 2,465.7 | 2,467.6 | 2,759.5 |
| 7 | warm | 3m 22s | 287.5 | 293.1 | 2,061.1 | 2,062.7 | 2,360.8 |

**Run 7 was taken as a cold RE-TEST and is reported as warm, because it was not cold.** The
intent was a ~10 minute idle; the actual gap, computed from the recorded `wallClockAt` stamps
rather than estimated, was **3.4 minutes**, and `season-check` came back at 293.1 - squarely in
the warm band. The lambda was still hot. It is labelled by what the numbers show, not by what
the run was for.

**NOT AVERAGED ACROSS THE TWO POPULATIONS**, per the instruction. Separately:

- **COLD, n=1:** tap -> chart **5,022.6**. season-check 1,015.3 (20.2%), mirror 3,993.3 (79.5%).
- **WARM, n=6:** tap -> chart median **2,807.1**, range 2,360.8-3,432.1.
  season-check median 295.0 (10.5%), mirror median 2,481.5 (88.4%), React commit ~5 (0.2%).

**The cold penalty, by request:** season-check **+720.4** over the warm median, mirror
**+1,511.9** over the warm median. n=1 on the cold side is thin and is stated as thin; what it
is not is ambiguous about direction.

**A SECOND COLD SAMPLE WAS NOT TAKEN, DELIBERATELY.** It needs a ~15 minute idle and one
remaining `mirror_create` (nine of ten were used), and it would refine a magnitude that changes
no decision here: at n=1 cold and n=6 warm the split is already unambiguous and so is the cause.
Recorded rather than left as an omission - it is available to anyone who wants it for the price
of the wait.

**RUN 1 REPRODUCES REYNER'S 4.9s AT 5.02s.** The recording measured 4.9s +/-83ms at 6fps
extraction. A reader arriving at an idle site gets the cold population, which is the one that
matters: it is the first impression, and it is the only one a first-time visitor ever sees.

**A seventh request appears in run 4's buffer at `startRelTap: -3815.8`** -
`POST /api/mirror/<token>/event`, the funnel counter beacon from run 3, landing 1,385.8ms late.
It is not on the submit critical path (its `startTime` precedes the tap) and is excluded from
every figure above. It is noted because a later session reading the raw buffer will see it.

---

## WHAT IS INSIDE THE MIRROR POST

The POST is 87% of the warm wait, so the question moves inside it.

**FROM THE CODE, WITH THE COMMANDS.** `season-check` touches no database at all:

```
$ grep -c "supabase\|admit\|consume" app/api/season-check/route.js
0                    # exit 1, i.e. a real zero-match, not an empty file
```

It is `seasonTurnOnDate()` and a JSON response. **Its ~285ms warm is therefore the floor cost of
one Vercel round trip from this client with zero database work**, which makes it a free
calibration constant for everything else.

`POST /api/mirror` makes **three sequential Supabase round trips**:

```
$ sed -n '108,110p' lib/mirror/handlers.js
export async function createMirrorReading(request) {
  const { refusal, headers } = await admit(request, 'mirror_create');

$ sed -n '47,53p' lib/ratelimit.js
export const RATE_LIMITS = {
  // Creating a reading computes a chart and writes a row. Ten an hour is far
  // more than a person exploring their own and their friends' birthdates.
  mirror_create: {
    session: { limit: 10, windowSeconds: 3600 },
    ip: { limit: 60, windowSeconds: 3600 },
  },
```

`consume()` (`lib/ratelimit.js:189`) loops the dimensions at `:196` and awaits each one **in
series** at `:212`, and each iteration is one `sb.rpc('rate_limit_hit', ...)` (`:153`). Two
dimensions = two sequential RPCs. Then `createReading(...)` (`lib/mirror/handlers.js:158`) is
the third.

### THE ISOLATING PROBE

A `POST /api/mirror` with an invalid `birthDate` returns at `rejected(...)`
(`lib/mirror/handlers.js:127-129`) - **after** `admit()`'s two RPCs, **before**
`calculateBaziChart` and **before** the insert. It writes no row.

**Its control is the response body**: it came back `400 {"error":"birthDate (YYYY-MM-DD) is
required"}`, which is reachable only past `admit()`. A probe refused by the rate limiter would
have been `429`, and one that ran the whole handler would have returned a token. Neither
happened, so the probe stopped where this document claims it stopped.

**A CORRECTION MADE BY RUNNING THE GREP RATHER THAN TRUSTING IT.** This paragraph first claimed
the error string identified a single branch. It does not:

```
$ grep -rn "birthDate (YYYY-MM-DD) is required" lib app
lib/mirror/handlers.js:128:    return rejected('birthDate (YYYY-MM-DD) is required');
app/api/season-check/route.js:28:    return badRequest('birthDate (YYYY-MM-DD) is required');
```

**Two sites, and `season-check` is the other one** - the exact neighbour this probe is trying to
tell itself apart from. The control survives because the discriminator is the URL, not the
string: the resource entry records the request as `/api/mirror`, and within that handler
(`lib/mirror/handlers.js:128`) the string has one site. Left in rather than quietly fixed,
because a check that identifies a branch by a string its sibling route also returns is one
rename away from being the instrument that cannot fail.

| | n | measured (warm) | minus the ~295ms round-trip floor |
|---|---|---|---|
| bare round trip (season-check, zero DB) | 6 | 295.0 median | - |
| admit only, 2 RPCs, no insert | 2 | 1,404.8 and 2,271.1 | ~1,110 and ~1,976 |
| full POST, 2 RPCs + insert | 6 | 2,481.5 median | ~2,186 |

**INDICATIVE, AND LABELLED SO: n=2 on the probe with a 866ms spread.** What it supports is a
single claim with a wide band - **a Supabase round trip from this function costs roughly
550-990ms** - and the full POST is consistent with three of them. What it does not support is a
precise per-call number, and nothing downstream should quote one.

### WHY A DATABASE CALL COSTS MOST OF A SECOND

```js
> (await fetch('/api/season-check', {method:'POST', ...})).headers.get('x-vercel-id')
"sin1::iad1::jdkjb-1788608786129-1cbaa1e3249d"
```

**`sin1::iad1`. The edge PoP is Singapore. The function executes in Washington DC.**

```
$ grep -rn "region" vercel.json next.config.*
            # no output
```

No `regions` key, so the function is on Vercel's `iad1` default. Every request from the target
audience crosses the Pacific to reach the handler, and then the handler's three database calls
cross whatever distance separates `iad1` from the Supabase project - **three times, in series.**

**THE SUPABASE REGION IS NOT MEASURED HERE AND IS NOT ASSERTED.** It is server-only
(`lib/supabase.js:16`, `process.env.SUPABASE_URL`) and is not readable from the client. It is
one lookup in the Supabase dashboard (Project Settings -> General -> Region) and it is the single
highest-value unknown for STEP 2.

---

## THE PRICE OF STEP 2, WHICH IS THE POINT OF STEP 1

The prompt's STEP 2 asks whether `season-check` can fold into the mirror POST. **On these
numbers that removes the 296.8ms median warm request, which is 10.4% of the warm wait and 20% of
the cold one.** Real, worth doing, and not the cause.

**The cause is geography and serialisation, and both are cheaper to fix than the fold.** Ranked
by measured saving, for STEP 2 to price properly:

1. **Move the function region to `sin1`.** One key in `vercel.json`. Removes a Pacific crossing
   from *every* request on the site, and - if Supabase is also in Southeast Asia - from all three
   database round trips at once. This is the term that dominates and it is a config change.

   **IT IS NOT A LOCAL CHANGE AND IT MUST NOT BE MEASURED ON THE SUBMIT LEG ALONE.** The region
   is a property of every function on the site, so it moves the distance from the handler to
   *everything the handler talks to*, in both directions, and one of those is the model:

   ```
   $ grep -rn "generativelanguage\|googleapis" lib --include=*.js
   lib/render/providers/gemini.js:18:const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
   ```

   That endpoint is on the **prose leg**, not this one - `serveMirrorReading`
   (`lib/mirror/handlers.js:229`) runs `admit` (two more rate-limit RPCs), `getReading`, the
   render-cache lookup inside `renderReading`, `persistRendered` on a miss, and the Gemini call
   itself. **The prose leg carries MORE Supabase round trips than the submit leg does, plus a
   provider call**, and it is the 11.2s row in the recording - by far the larger half of the
   ~16.6s total.

   **The two effects can point in opposite directions.** Moving to `sin1` should shorten every
   Supabase trip if the project is in Southeast Asia, and it may *lengthen* the Gemini call,
   because `generativelanguage.googleapis.com` is Google-hosted and this document has measured
   nothing about where it answers from. A region change judged on the submit leg alone could book
   a ~2s win on the submit and pay an unmeasured cost on a leg that is currently 11.2s.

   So: **the region change is measured on BOTH legs or it is not measured.** Baseline the prose
   leg the same way this document baselined the submit leg - production, resource timing, cold
   and warm kept apart - before the key is added, and again after. Note that the render cache
   makes this harder than the submit leg and the measurement has to say which runs were cache
   hits: a cached serve never calls Gemini at all, so a before/after built out of hits would
   show the Supabase improvement and hide the provider regression entirely. **That is the same
   shape as the failure this whole pass is correcting** - a number that is true of the runs it
   was taken on and false of the thing it gets quoted about.
2. **Parallelise `consume()`'s two dimensions.** They are independent counters and the docblock
   at `lib/ratelimit.js:173-174` already establishes that *both* must be charged regardless of
   outcome (*"EVERY dimension is charged even when an earlier one has already refused"*), so
   `Promise.all` preserves the stated semantics exactly. One round trip instead of two.
   **Not free of judgment, and not ruled here:** the two counters become concurrent, and whether
   that matters under the fixed-window scheme is a STEP 2 question, not a STEP 1 assertion.
3. **Fold `season-check` into the POST**, as the prompt proposes. ~290ms.

Items 1 and 2 are CHECK 3 - removing a cause. Item 3 is real but third.

**NOTHING ABOVE IS BUILT, PRICED OR RECOMMENDED AS RULED.** STEP 1 lands nothing, and the
ordering of those three is a STEP 2 question that needs the Supabase region before it can be
answered properly.

**`vercel.json` IS NOT TO BE TOUCHED ON THE STRENGTH OF THIS DOCUMENT.** Ruled 2026-09-05: the
region change waits on the Supabase region and on Reyner ruling the order. It is listed first
here because it is the largest measured term, which is a finding - not a licence to apply it.

---

## LIMITS OF THIS MEASUREMENT

- **Desktop browser on a fixed connection, not a phone.** Stated above with what it omits.
- **n=1 cold.** Direction is unambiguous, magnitude is one sample.
- **n=2 on the isolating probe**, with an 866ms spread. Band, not a number.
- **Supabase region unmeasured**, and it is the load-bearing unknown for the ranking above.
- **One client location.** `sin1::iad1` is what this client saw; a reader in Jakarta reaches a
  different edge but the same `iad1` function.
- **THE PROSE LEG IS NOT MEASURED HERE AT ALL.** This document covers tap -> chart only. The
  chart -> prose leg was 11.2s in the recording, is the larger half of the ~16.6s, and carries
  both more Supabase round trips and the Gemini call. Any region change has to be baselined on
  it too - see item 1 of THE PRICE OF STEP 2.
- `mirror_create` is limited to 10 per session per hour (`lib/ratelimit.js:51`). Six valid runs
  plus two probes is nine, so no run in this document was shaped by a 429. Verified: every run
  returned a token and rendered a chart, and both probes returned 400 rather than 429.

## COMMANDS AND METHOD

Browser pane against `https://katon.app`, viewport 375x812. Per run:

```js
// tap
const tap = performance.now();
document.querySelector('form').requestSubmit();
// chart arrival: MutationObserver on [data-prose-skeleton] — NOT a timer,
// because MutationObserver callbacks are not throttled in a hidden pane.
// per-request split, from the network stack rather than a JS continuation:
performance.getEntriesByType('resource')
  .filter(e => e.name.includes('/api/'))
  .map(e => ({
    url: e.name.replace(location.origin, ''),
    dns: e.domainLookupEnd - e.domainLookupStart,
    connect: e.connectEnd - e.connectStart,
    ttfb: e.responseStart - e.requestStart,
    total: e.duration,
  }));
```
