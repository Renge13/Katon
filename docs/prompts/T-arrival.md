<!--
════════════════════════════════════════════════════════════════════════════════
BANNER ADDED 2026-09-05 ON COMMITTING THIS FILE. Everything below this banner is
the 2026-09-04 prompt AS WRITTEN and is not edited - including its own original
STATUS line, which still says "BUILD PROMPT" and is itself now one of the stale
points. That line is part of the record, not a mistake to correct.

STATUS: DISCHARGED. NON-LIVE. DO NOT BUILD FROM THIS FILE.

WHY IT IS COMMITTED RATHER THAN DELETED. It was untracked for the whole session
that executed it, and it is the only record of what was asked and what was
believed at the time. Both PRs it specifies are done: PR1 shipped as #94
(8ef5e4c) and PR2's step 1 produced two QA artifacts. Deleting it would leave six
commits citing a prompt nobody can read.

AND WHY THE STALE PARTS ARE LEFT STANDING. Ruled by Reyner 2026-09-05: do not
rewrite the original reasoning. The stale parts ARE the record of what was
believed when it was written, and THIS SESSION'S WHOLE LESSON is what happens
when a document is quoted without the conditions that made it true - the 112ms
localhost median carried into a register row as "~100ms after the tap" when
production was 4.9s, 44x off (docs/COWORK-BRIEF.md section 4). A banner that
edited the body would destroy the evidence of the thing it exists to warn about.

FOUR STALE POINTS, EACH VERIFIED ON `main` 2026-09-05 RATHER THAN TAKEN FROM THE
HANDOVER THAT ASKED FOR THIS BANNER:

  1. IT NAMES `f29fc0e` AS THE REF (lines 25, 32). `main` had already moved and
     production was serving `2dae13b`. The prompt's own instruction to confirm the
     ref rather than quote it is what caught this, so the file is right about the
     method and wrong about the value.

       $ git diff --stat f29fc0e 2dae13b
       docs/COWORK-BRIEF.md | 23 +, docs/PROGRESS.md | 1 +, lib/xendit.js | 34 +
       # comment-only in lib/, so the submit path was byte-identical and the
       # baseline stayed comparable to the screen recording

  2. IT RANKS THE `vercel.json` REGION CHANGE AS UNBUILT ITEM 1. Shipped.

       $ git log --oneline -1 63d6488
       63d6488 Run the functions in the same region as the database
       $ grep -n '"regions"' vercel.json
       5:  "regions": ["sin1"],

     Measured 11.5x on the submit leg, 2,776.5ms -> 240.5ms warm median, with the
     prose leg measured too - docs/qa/2026-09-05-region-move-both-legs.md.

  3. ITS PR2 STEPS 2-4 ARE RETIRED BY MEASUREMENT, not outstanding. `Promise.all`
     on the rate-limit dimensions now saves ~46ms and folding `season-check` ~51ms
     against a 240.5ms path, and they have swapped order. The row that says so and
     names what would REOPEN them is docs/PROGRESS.md:218, in THE DEFERRED
     REGISTER. Read that row before treating anything in section PR 2 as work.

  4. ITS "~1s WAITING STATE" SECTION DESCRIBES A CONDITION THAT IS NOW FALSE at
     240.5ms warm. THE RULE ITSELF IS NOT REPEALED. It now lives in the code, at
     components/Funnel.jsx:512, beside the `disabled={busy}` submit button at :539
     - which is where it should always have been, and was not:

       $ grep -rcE "dead-looking|unmistakably active" components/
       # zero hits until fe96956

     So this file was, until that commit, the only full statement of a live
     ruling. That is the specific reason the banner had to wait for it.

WHAT IS NOT STALE, and is the most reusable thing here: the ORDER section, and its
argument that a baseline must be taken on the commit the evidence came from. That
reasoning is general and it held.
════════════════════════════════════════════════════════════════════════════════
-->

<!--
════════════════════════════════════════════════════════════════════════════════
STATUS: BUILD PROMPT. Written by Cowork 2026-09-04.

TWO PRs, SEQUENCED, AND THE ORDER IS THE RULING. PR1 is ruled and buildable now.
PR2 IS A MEASUREMENT BEFORE IT IS A FIX - no latency work lands until the
production split exists as a number.

They do not ride together. PR1 is a visible motion change Reyner ruled; PR2 is a
latency investigation. Landing them in one commit would make the arrival's
before/after unattributable, which is rule 13 applied to shipping.

NOTHING HERE IS A GATE CHANGE. `STAGE6_VERSION` DOES NOT MOVE.
════════════════════════════════════════════════════════════════════════════════
-->

# Prompt T - the arrival: stagger, and the submit wait

## THE ORDER. RULED 2026-09-04, AFTER CODE READ THIS FILE AND ASKED TO START PR1.

**PR2's STEP 1 RUNS FIRST, ON `main`, BEFORE PR1 MERGES.** It lands nothing, so it
blocks nothing - but the ordering is the point:

```
0.  PR2 STEP 1 - the baseline measurement, taken on `main` (f29fc0e at time of
    writing; confirm with `cat .git/HEAD` and the actual ref before quoting it)
1.  PR1 - the stagger
2.  Reyner looks on production
3.  PR2 STEPS 2-4 - fold the round trip, re-measure, UX only if latency remains
```

**WHY THE BASELINE GOES FIRST, and it is not fussiness.** `f29fc0e` is the commit
Reyner's screen recording was taken against. A baseline measured there is directly
comparable to the 4.9s in the evidence table below. If PR1 merges first, the baseline
sits on a different commit from the recording that motivated it, and the later
before/after comparison has to reason about which build each number came from.

**The repo has already paid for this exact mistake.** `docs/PROGRESS.md`'s row
**FINDING MESSAGES IN THE DIRECTIVE ARE UNSTAMPED** ends with the operational
consequence: *"across a commit that changes message text, `prompt_version` is not a
valid discriminator and the COMMIT is the only version. A floor-rate comparison
spanning one must cite the commit."* Same shape, different measurement. Take the
baseline where the evidence was taken.

**AND PR1 CLOSES "PERCEPTIBLE", NOT "RIGHT".** Reyner judged the stagger on a build
where the chart arrives as **the resolution of a 4.9-second wait**. If PR2 succeeds
the chart will arrive about a second after the tap - a different position again, and
this register row's own lesson is that the same sequence reads differently there.

His diagnosis is position-independent: 140ms is below the threshold at which a
stagger reads as a sequence, whatever precedes it. So PR1 is sound and ships. But
when the parked chart-arrival row is amended, **close only its "is the stagger
visible" half. Leave "is this the right cadence" open until after PR2 re-measures.**
A row closed on a judgment made in a position that no longer exists is the failure
the row was written to prevent, repeated one step later.

---

## THE EVIDENCE THIS PROMPT RESTS ON, AND HOW IT WAS TAKEN

Reyner walked the funnel on **production**, on his phone, and screen-recorded it
(`Katon prod check flow.mp4`, 59s, 384x848). Cowork extracted frames with ffmpeg and
read the transitions off them.

| | measured | method |
|---|---|---|
| tap -> navigation | **4.9s** (20.6s -> 25.5s) | 6fps extraction, +/-83ms |
| chart fade-in | ~0.5s, running correctly | 6fps: frame 255 blank, 256 faint, 258 visible, 260 full |
| chart -> prose | **11.2s** (25.5s -> 36.7s) | 4fps extraction, +/-125ms |
| prose cross-fade | ~0.3-0.5s, working as designed | 4fps: 365 skeleton, 367 faint prose, 370 full |
| **tap -> complete reading** | **~16.6s** | |

**THE FIRST ROW FALSIFIES A REGISTER ROW AND THAT IS THE MAIN FINDING.**
`docs/PROGRESS.md`'s parked row **THE CHART'S ARRIVAL ANIMATION IS UNJUDGED IN ITS
NEW POSITION** states the chart *"animates in ~100ms after the tap"*, citing
`docs/qa/2026-09-03-submit-to-chart.md`'s median of 112ms. On production it is
**4.9 seconds - 44x** - and the reader spends all of it looking at a disabled button.

**THE QA DOC IS NOT AT FAULT AND MUST NOT BE EDITED AS IF IT WERE.** Its own text
says, in bold: *"It is not a production figure and it must not be quoted as one.
Localhost against an in-memory store has no network RTT and no Supabase; production
adds both."* It was measured on `npm run dev` with no `.env.local`. The failure is
downstream - the caveat did not survive the citation into the register row.

---

# PR 1 - THE STAGGER

## WHAT REYNER RULED, 2026-09-04, VERBATIM

> **Stagger: lengthen it.** The current 0 / 60 / 100 / 140ms sequence is technically
> working but visually reads as one fade. That means it fails the intended effect,
> even though it isn't a bug. I'd target roughly 350-450ms total stagger across the
> persona block. Something like `0 / 120 / 240 / 360ms`. Keep the individual reveal
> itself relatively quick. The point is not to make the page feel slow; it is to make
> the hierarchy perceptible as a sequence.

**HIS NUMBERS ARE THE RULING. Build 0 / 0.12 / 0.24 / 0.36.**

## WHAT IS CURRENTLY THERE, VERIFIED RATHER THAN CARRIED

```
$ cat .git/HEAD
ref: refs/heads/main

$ grep -n "Reveal delay" components/Funnel.jsx     # persona block
814:      <Reveal><Eyebrow>Refleksimu</Eyebrow></Reveal>
815:      <Reveal delay={0.06}>   ... arch.name_id
816:      <Reveal delay={0.1}>    ... arch.name_en
817:      <Reveal delay={0.14}>   ...

$ sed -n '183,184p' app/globals.css
.k-rise { animation: kRise .8s var(--ease-quiet) both; }
@keyframes kRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

$ sed -n '204,206p' app/globals.css
@media (prefers-reduced-motion: reduce) {
  .k-gleam { animation: none; opacity: 0; }
  .k-rise, .k-bar, .k-fade, .k-seal, .k-seal-check, .k-spin { animation: none; }
```

`prefers-reduced-motion` is already handled. Lengthening the stagger does not open
that hole and no new guard is needed.

## THE ARITHMETIC THAT DECIDES WHETHER THE RULING WORKS

**`.k-rise` runs 800ms.** A stagger is perceptible as a sequence in proportion to
`delay increment / reveal duration`:

| | increment | duration | ratio | block ends |
|---|---|---|---|---|
| today | 60ms | 800ms | 0.075 | 940ms |
| ruling as written | 120ms | 800ms | 0.15 | **1160ms** |
| **proposed** | 120ms | **450ms** | **0.27** | **810ms** |

At 0.075 each element spends 92% of its animation running alongside the previous
one, which is exactly the "reads as one fade" Reyner described. His 120ms increment
roughly doubles that to 0.15 and will improve it - but it also **lengthens** the
block to 1.16s, which pushes against his own second constraint (*"the point is not
to make the page feel slow"*), and 85% overlap may still blur.

**Shortening the reveal serves both halves of the ruling at once**: the sequence
becomes legible AND the block finishes sooner than it does today. This is what he
meant by *"keep the individual reveal itself relatively quick"* - `.k-rise` at 800ms
is not quick, and it is the term that was never examined.

**BUILD IT WITH `.k-rise` AT 450ms UNLESS REYNER SAYS OTHERWISE.** The 0/120/240/360
is his and is not negotiable; the 450ms is Cowork's technicality under rule 9 (the
reader sees the RESULT, which he ruled; the mechanism that produces it is ours).

## SCOPE - AND `.k-rise` IS GLOBAL, WHICH IS THE TRAP

`.k-rise` is used on the Home screen (`:418-516`), the season screen (`:546-645`) and
the reading. Changing the class changes all three. **Do not change it globally.**

Introduce a duration custom property on `.k-rise` (e.g. `animation-duration:
var(--k-rise-dur, .8s)`) and override `--k-rise-dur: .45s` on the reading root only
(the `.k-fade` wrapper at `components/Funnel.jsx:809`). Home and the season screen
keep today's behaviour and are out of this PR entirely.

**THE ADJACENT-RHYTHM PROBLEM, and it is the one thing that could make this look
worse rather than better.** Directly below the persona block, the Bagan Kelahiran
section runs `<Reveal>` at `0 / 0.06 / 0.12` (`:903`, `:904`, `:919`). If the persona
moves to 120ms increments and Bagan stays at 60ms, the page carries two different
stagger rhythms within one scroll. **Apply the same 120ms increment to the Bagan
block - `0 / 0.12 / 0.24`** - so the reading arrives on one cadence. Nothing below
Sebaran Unsur is in scope.

## THE ASSERTION THAT MUST GO RED WITHOUT THE CHANGE

Per CLAUDE.md: *"WHEN A COMMIT CHANGES BEHAVIOUR, AT LEAST ONE ASSERTION MUST FAIL
WITHOUT THE CHANGE."* And per the neighbouring rule, a test that passes whether the
feature exists or not is worse than no test.

Assert the **computed** values, not the source text: read the persona block's four
Reveal nodes out of the rendered DOM and assert their `animation-delay` is
`0 / 120 / 240 / 360ms` and their `animation-duration` is `450ms`, and that the Home
screen's Reveals still compute to `800ms`. That last clause is what catches an
accidental global edit, and it is the assertion most likely to be omitted.

**Show it red on `main` first, and put the failing run in the commit message.**

---

# PR 2 - THE SUBMIT WAIT. MEASURE FIRST.

## WHAT REYNER RULED, 2026-09-04, VERBATIM

> **Do not design around the 4.9s yet.** Remove avoidable latency before adding UX to
> explain latency. Code should measure `season-check` vs `mirror`, then price
> collapsing the two requests. If that materially brings the transition down, the
> current `Menyiapkan...` treatment may be sufficient.
>
> But establish this acceptance rule now: **The user must never experience a button
> that looks dead for several seconds.** If the optimized production path still takes
> >~1 second, the UI needs an unmistakably active waiting state.
>
> I would not add a progress bar, fake progress, countdown, or elaborate loading
> narrative. Katon doesn't need to dramatize a technical operation. A clear active
> state with subtle motion and appropriate copy is enough.
>
> So Code's order is: **measure -> remove unnecessary round trip -> re-measure ->
> only then add/adjust waiting UX if latency remains.**

## STEP 1 - MEASURE, AND ONLY MEASURE

`components/Funnel.jsx` issues **two sequential awaits** before the phase changes:

```
:329   const turn = await fetch('/api/season-check', ...)      // inside onSubmit
:238   const created = await fetch('/api/mirror', { POST })    // inside createReading
:262   setReading({...}); setPhase('result')                   // the chart goes up here
```

Between the tap and `:262` there is nothing on screen but a disabled button. **That
is the 4.9s.**

Measure the split **on production**, on a real device, because that is the only place
the cause exists - localhost has neither the network RTT nor Supabase, which is the
precise reason the 112ms figure did not transfer. Use
`performance.getEntriesByType('resource')` rather than JS continuations, for the
reason `2026-09-03-submit-to-chart.md` gives.

Report per request: DNS/connect, TTFB, total. **At least 5 runs, and note which were
cold** - a cold Vercel function and a warm one are different populations and averaging
them hides the thing worth knowing.

**LAND NOTHING IN THIS STEP.** The deliverable is a QA artifact under `docs/qa/`
with the numbers and the commands, and a one-line answer to: *what is the 4.9s
actually made of?*

## STEP 2 - REMOVE THE CAUSE BEFORE DECORATING THE SYMPTOM

Then, and only then, price this: **can `season-check` fold into `POST /api/mirror`?**

If season-check exists only to decide whether to ask the solar-term-boundary question,
its answer could ride on the mirror POST's response and the whole round trip
disappears. That is removing a cause, not masking one - CHECK 3 of the session ritual,
and Reyner's own words: *"Remove avoidable latency before adding UX to explain
latency."*

Bring the price back before building it. If it cannot fold, say why in one paragraph.

## STEP 3 - RE-MEASURE. STEP 4 - UX ONLY IF LATENCY REMAINS.

If the optimised path is still >~1s, the waiting state is Reyner's to rule and it
comes back to him with the re-measured number attached, not before.

**FORBIDDEN, by his ruling, and recorded here so a later session does not reach for
them:** progress bar, fake or simulated progress, countdown, multi-line loading
narrative, rotating reassurance copy. *"Katon doesn't need to dramatize a technical
operation."*

## THE ACCEPTANCE RULE - LAND THIS IN THE REPO

This is durable and a future session can break it by not knowing it, so it goes in
the repo rather than only in a session doc:

> **NO DEAD-LOOKING BUTTON. Ruled by Reyner 2026-09-04.** A control the reader has
> tapped must never look inert for several seconds. If a path's measured production
> latency exceeds ~1 second, the UI carries an unmistakably active waiting state -
> a clear active state with subtle motion and appropriate copy. Never a progress
> bar, fake progress, a countdown, or a loading narrative.

Put it where the person who would violate it is already reading - the `Button`
`disabled={busy}` site at `components/Funnel.jsx:512` and its `Menyiapkan...` string,
and in `docs/PROGRESS.md`. Same reasoning CLAUDE.md gives for the `STAGE6_VERSION`
rule sitting on its own constant's docblock.

---

# ALSO IN THIS PASS - THREE RECORD CORRECTIONS

Docs only. May travel with PR1 if the commit message names them; must not be
silent (*"the commit message must describe everything staged"*).

1. **Amend the parked chart-arrival row** in `docs/PROGRESS.md`. Its `~100ms after
   the tap` premise is falsified. Record the production figures above with their
   method, and note the row's QUESTION has changed: it is no longer "does the chart's
   arrival read well as the first thing that happens" but "the reader watches a dead
   button for 4.9s first."
2. **Close the row's stagger half.** Reyner has now judged it on production and ruled
   (PR1). The row's remaining open half is the submit latency, which is PR2.
3. **Add a `docs/COWORK-BRIEF.md` section 4 entry**, same day, per the ratify-and-fold
   rule:
   > **A QA doc's own caveat did not survive its citation.**
   > `2026-09-03-submit-to-chart.md` said in bold that its 112ms median *"is not a
   > production figure and it must not be quoted as one"*, and named localhost, the
   > in-memory store and `next dev` as the reasons. The figure was nonetheless carried
   > into a `PROGRESS.md` register row as the operative number and asserted as
   > `~100ms after the tap`. Production measured 4.9s - 44x. **The instrument was
   > honest and the citation was not.** A measurement's scope caveat has to travel
   > with the number into every document that repeats it, or the number arrives
   > stripped of the thing that made it true. When quoting a measurement taken
   > locally, the quoting document states the stage it was taken on, in the same
   > sentence as the figure.
