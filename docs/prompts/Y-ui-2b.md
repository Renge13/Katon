# Prompt Y-ui-2b: fixes from Reyner's phone walk of Y-2 (#113, merged 2026-09-09)

Cowork, 2026-09-09 evening. Reyner walked #113 on his phone after merging. Confirmed GOOD: no blank
frame after the CTA, hour picker, skeleton, cross-fade, header navigation. What follows is what was
not. Evidence for items 3 and 4 is his screenshots of the paid report on the #113 preview; the
component facts are quoted from `components/PasanganReport.jsx` and `components/CopyLink.jsx` as
staged from the tree on `feat/site-chrome-ux` (post-merge, identical to main for these files).

One PR. Commit 1 = this prompt + the amended `docs/content/pasangan-copy-rulings.md` (amendments f, g,
h), alone. Then the fixes; each commit carries the assertion that goes red without it.

## 1. Site header: logomark, not wordmark (Reyner ruling)
Replace the `KATON.APP` wordmark top-left of `SiteHeader.jsx` with the circle logomark (the orange dot
+ KATON that the home hero currently shows as its first line). REMOVE that hero logomark line from the
home page; the page content moves up by its height. One logomark on the page, in the header. Rule 20
applies to any text inside it.

## 2. Copy link: copy and toast, never highlight (Reyner ruling)
What he saw: tapping `Salin tautan` highlighted the URL. That is `CopyLink.jsx` `copy()` doing what
its comment says: "SELECT FIRST, ALWAYS" - a range selection BEFORE `navigator.clipboard.writeText`.
On a phone the selection is the visible outcome and it reads as "it blocked the link instead of
copying it". Remove the cause, not add a check:
- No pre-selection. Call `writeText(url)` on tap.
- On success: TOAST `copy_link_done` ("Tautan tersalin" - Reyner confirmed as the toast text), ~2 s,
  positioned as a toast (bottom, over content), not as a button relabel. The button label stays
  `copy_link`.
- The sentence above the URL is now `CHROME_COPY.link_keep` = `Simpan tautan ini untuk membaca
  kembali.` (amendment g) on BOTH surfaces. Move the slot out of PASANGAN_COPY (remove, do not alias),
  update the spec's slot list, and give the mirror's box the sentence it shipped without.
- On rejection ONLY (no `navigator.clipboard`, or the promise rejects): select the URL text as the
  fallback AND show a fallback toast so it never looks like nothing happened. Proposed slot
  `copy_link_fallback`: `Tautan sudah ditandai. Tahan untuk menyalin.` - Cowork draft, swept 0/70,
  ships under the chrome process ruling, Reyner amends in place.
- Tests: the existing `CopyLink` test passed while the artifact did the wrong thing, because it tested
  the fallback branch, not the tap. Add: (a) with a resolving `writeText` stub, NO selection is made
  and the toast text appears; (b) with a rejecting stub, selection IS made and the fallback toast
  appears. Show (a) red on the current code (it selects) before the fix.

## 3. Addendum 2 item 2 is NOT fully rendered - two defects
Reyner's screenshots of a real paid report on the #113 preview show:
- **P1 and P2 carry an eyebrow and NO headline.** "INTI DIRI" then prose; "KURSI PASANGAN" then prose.
  P4 and P5 show both levels. The glossary has names for every P1/P2 cell (`p1_combination` "Pasangan
  Inti", `p2_none` "Kursi Independen", etc.), so `labelFor` returned `name: null` for them. Two
  candidate causes, find which with output: the server's `names` projection does not carry p1/p2
  ids, or the walk hit a payload from before the projection existed and the `facts.pattern/quadrant`
  fallback (which only knows p4/p5) masked it. Either way the render swallowed a missing name
  silently. Fix the cause; then assert on the Y-1 production fixture that EVERY labelled block has
  BOTH levels, and show it red on the current build.
- **`section_close` ("Peta Dinamika") is never rendered.** `SECTION_BY_BEAT` in `PasanganReport.jsx`
  maps p1-p5 only; there is no p7 (or p0) entry, so the closing block gets no eyebrow. The italic
  closing paragraph in the screenshot sits under the P5 block with nothing over it. Add the P7 mapping;
  P7 has no glossary name, so it renders eyebrow-only BY RULING (record that exception in the same
  comment). The "both levels" assertion above takes P7 as its one named exception. Confirm with a grep
  which block the italic paragraph belongs to before asserting.

## 4. section_element -> `Keseimbangan Unsur` (Reyner ruling, amendment f)
Apply the row from `docs/content/pasangan-copy-rulings.md`. Remove the duplicate suppression in
`labelFor` (`name === eyebrow ? null : name`) in the same commit: its cause is gone, and a suppression
with no cause is the next mystery. P3 now renders eyebrow "Keseimbangan Unsur" over headline
"Penyeimbang Unsur" / "Tantangan Serupa" / "Mandiri Elementar".

## 5. P0 opening reads as three people - RULED (amendment h)
Screenshot: "Bacaan ini tentang kamu, Api Unggun, dan Samudra." A list of three. Reyner ruled the
replacement: `Ini adalah bacaan tentang dua individu: <name_id A> dan <name_id B>` (A first, B second,
engine archetype name_ids, verbatim otherwise; swept 0/70). grep for the current sentence's origin
and REPORT it in the PR body, then: if it is an engine template, replace the template; if it is model
prose from `p0_opening`, the opening line becomes an engine-emitted template ahead of the model's
paragraph and the prompt/cell must stop asking the model to name the two archetypes in its first
sentence (otherwise they are named twice). Rule 14 either way: the engine owns that sentence now. If
the second route touches the renderer prompt or the gate, STOP and report before changing it - that
is Prompt Z territory and may need to ship isolated.

## 6. Ledger (docs/PROGRESS.md deferred register), same PR
Add, each with what is unguarded and what closes it:
- **Design pass on the front door and the compat surface** (Reyner: "dedicated design pass after the
  core product is done"). The home compat card "looks weird". Not before Y-3 / DOKU / real-money walk.
- **`?dari` does not prefill compat step 1** (mirror payload carries no birth data by design).
  Closes with a client-side sessionStorage write at funnel submit, read on step 1 mount; no payload
  or server change. Friction on the money path; Cowork advice: before promotion.
(The mirror copy-link sentence is no longer a register item: amendment g gives both surfaces one
sentence. Item 2 applies it.)

## NOT in this PR
Reading voice ("technicality okay to surface, explanation must be very clear on the meaning") is
Prompt Z, Cowork is writing it now. Nothing here touches the prompt, the gate, or STAGE6_VERSION.

## Proof, in the PR body
`npm test` full set; the red-then-green run for items 2, 3 and 4; screenshots or text dumps from the
Vercel preview of a real paid report showing P1, P2, P3 and the closing block with their headings; a
tap on `Salin tautan` on the preview with the toast visible and no selection.
