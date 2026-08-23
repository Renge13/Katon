// ============================================================
// GET /api/mirror/[token] — serve a mirror reading
// ============================================================
// PROMPT J. token -> reading row -> cache check -> render if missed -> gate ->
// store -> serve. Every one of those steps already exists in
// lib/render/index.js#renderReading; this route CONSUMES that chain and
// reimplements none of it.
//
// A cache hit makes ZERO provider calls. That is the economics of the free
// mirror (rules 16 and 19) and tests/mirror-route.spec.mjs asserts it with a
// provider stub that throws if it is touched.
//
// ── PROMOTED 2026-08-23. THIS ROUTE IS THE PRODUCT. ───────
// The fence (Prompt J task 5) is REMOVED and `lib/mirror/fence.js` is deleted.
// `components/Funnel.jsx` creates and reads mirror readings, so `MIRROR_PREVIEW_TOKEN`
// unset can no longer mean "404 entirely" - that would 404 the site. `.env.example`
// carries the note telling anyone to unset the variable in Vercel, because a stale
// secret left in a deploy is how NEXT_PUBLIC_FREE_FULL_READING became architecture.
//
// WHAT THE FENCE WAS NEVER DOING, stated so its removal is not read as removing
// protection: it was not the paywall (that is `row.paid === true`, flipped only in
// the verified webhook, enforced in lib/deliver/handlers.js) and it was not rule
// 19's harvesting ceiling (that is `consume` in lib/mirror/handlers.js#admit, which
// still runs on every read, hit or miss).
//
// THE FOUR PRECONDITIONS ARE KEPT BELOW RATHER THAN DELETED. They are the record of
// what promotion was allowed to require, they are how a reader tells a deliberate
// act from a drift, and TWO OF THEM ARE STILL OPEN - this commit is written and is
// NOT to be merged until 3b is answered. Read the closing line before assuming the
// promotion in the working tree means every box was ticked.
//
//   1. Xendit verification approved + live keys swapped.
//      MET 2026-08-07. (QRIS ACTIVATED 2026-08-11; first self-purchase reported
//      by Reyner 2026-08-13. Neither is part of THIS condition; both are tracked
//      in PROGRESS.md, THE INTERIM REGISTER.)
//
//   2. RE-RULED 2026-08-13 (Reyner). The 7-beat Bacaan Mendalam is RETIRED and
//      the locked free-full-mirror model is restored, so the old wording —
//      "the fulfillment swap shipped, so the Rp 19.000 upsell is a real thing to
//      buy" — described the swap as a thing that could happen BESIDE promotion.
//      It cannot.
//
//      RETIRING THE GATE AND REPLACING THE UNVALIDATED PROSE ARE THE SAME ACT.
//      The paid beats and the free prose come from ONE source: the ten cells in
//      `contents/*hubungan*.md`, sliced by `scripts/build-content.mjs` into the
//      3 FREE + 7 PAID sections of `lib/content/<archetype>.js`. Promoting this
//      route replaces the FREE half with Stage 3-6 output. The same commit
//      therefore orphans the PAID half, which is the only thing Rp 19.000 buys
//      today. There is no ordering in which one lands without the other.
//
//      And that prose was never signed off: `grep -l "pending founder"
//      contents/*.md` returns 16 of 20 (2026-08-13), three more are stamped
//      SCAFFOLD/pre-validation and one carries no STATUS at all. So the act also
//      removes unvalidated cells from a paying customer's hands.
//
//      SO PRECONDITION 2 IS NOW: the Rp 19.000 has a deliverable that is NOT the
//      free mirror — the card + PDF exist and ship — AND `/harga`, `/syarat` and
//      INVOICE_DESCRIPTION describe that, not the deep read. Otherwise promotion
//      leaves a live SKU selling something the same commit just gave away.
//      **MET IN THIS COMMIT, both clauses.** The full package is PROGRESS.md,
//      THE DEFERRED REGISTER.
//
//      TWO CLAUSES HERE TOO, and both moved on 2026-08-23:
//
//      2a. THE DELIVERABLE EXISTS AND IS WIRED. **MET 2026-08-23.** The Complete
//          Edition PDF renders from `render_cache` with the page-reference fixed
//          point ship-blocking (prompt M steps 1-5), and `lib/deliver/handlers.js`
//          gates both artifacts behind `row.paid === true` as ONE delivery
//          (step 6). `tests/deliver-route.spec.mjs`.
//
//      2b. THE COPY DESCRIBES IT. **MET IN THIS COMMIT.** `/harga`, `/syarat`,
//          `/tentang`, `/privasi` and `INVOICE_DESCRIPTION` now name the card and
//          the PDF. Most of those strings are RESTORES rather than new copy: they
//          were replaced on 2026-08-05 precisely because the paid path delivered
//          a 7-beat read with no card and no PDF in it, and `copy.js` records the
//          replaced text verbatim beside each one. `INVOICE_DESCRIPTION` was
//          assembled rather than restored and Reyner APPROVED it on 2026-08-22
//          (`Katon - Complete Edition`); two others - one clause of /tentang and
//          one of /syarat - are still assembled and flagged in place for him.
//
//          It could not move earlier, and that is the whole sequencing argument:
//          renaming the invoice while the paid path still handed over the deep
//          read would charge for one thing and deliver another.
//
//      AND NOTE WHAT 2a's WIRING IMPLIED, because it is why 2b could not go
//      first and why the funnel flip is in the same commit: both artifacts read
//      the NEW pipeline, so `lib/deliver/handlers.js` refuses a reading with no
//      `cache_key` rather than building a PDF on the floor or a card that names
//      her Bambu beside a reading that names her Akar. A legacy funnel row had no
//      cache_key, so before this commit the delivery could not serve anyone at
//      all. That constraint is checked in code, not described in a doc, and it is
//      what made promotion and fulfilment one act.
//
//   3. TWO CLAUSES, AND THEY HAVE SEPARATE ANSWERS. The 08-19 STRICT form was
//      "every chart RENDERS **and would be SOLD** at the live price". The
//      2026-08-22 threshold ruling replaced the RENDER clause ONLY. The SOLD
//      clause stands, unamended, and it is not met.
//
//      3a. RENDER - RE-RULED 2026-08-22 (Reyner), FINAL FORM. Met when the POOLED
//          FLOOR RATE IS AT OR BELOW 10% AT n=10, not when every chart renders.
//
//          **MET on 2026-08-22 morning, UN-MET the same evening, AND THE
//          COLLISION IS UNRESOLVED.** The 4/40 = 10% measurement
//          (docs/qa/2026-08-22-renders-n10-postfixes.md, gate 1.17.0, prompt
//          22316c3349d0ea46) was taken at `REGENERATION_BUDGET` 3. Reyner
//          reverted the budget to 2 that evening - "depth 3 is thinner, not
//          tighter" - which returns the pooled floor to roughly 20%.
//
//          SO THIS THRESHOLD IS CURRENTLY NOT MET, by a later ruling of his own
//          rather than by a regression. DO NOT resolve it by widening the
//          threshold to 20%: a threshold moved to fit whatever the system
//          currently does is a formality, not a gate, and it is the same decision
//          as the unruled breadth question. PROGRESS.md, RULED 2026-08-22
//          (evening), section 2.
//
//      3b. SOLD - Reyner has read real readings AS THE BUYER and would sell them.
//          **NOT MET. 2 of 4 SELL** on the 08-22 depth-pair read: chart 13 SHIPS,
//          chart 1 SHIPS, fresh-1996 REJECT (provisional - the artifact printed
//          one of the 2-in-10 runs that flag `opening.archetype_missing`, so a
//          passing sample is owed), chart 5 NOT JUDGED (the artifact printed
//          module_assembly, the floor, so that chart has never been judged on a
//          live render). No measurement closes this one and no threshold
//          substitutes for it: 3a is a property of the system, 3b is a judgement
//          about the product, and a rate cannot make it.
//
//      WHY THE SPLIT IS WRITTEN OUT RATHER THAN LEFT IMPLIED. This row read
//      "MET 2026-08-22" with the sell clause mentioned only in a closing
//      paragraph, and "MET" is what a later session reads. The threshold ruling
//      said in its own text that it "does not retire the READ" - so the row was
//      already carrying both facts and only advertising one. Two clauses, two
//      lines, two answers.
//
//      The absolute form went because it is arithmetic, not taste: "every chart
//      renders at n=10" is 40 draws, and at a 10% per-run floor a clean sweep
//      has probability 0.90^40 = 1.5%. It would need the rate six times better
//      than today just to be a coin flip. Worse than hard, it is STOCHASTIC - an
//      absolute criterion over a random variable is a lottery, and the same
//      unchanged system passes it one day and fails it the next. A pooled rate
//      is the only form of this the instrument can answer.
//
//      One earlier statement of this condition is now history rather than a
//      rule. It read "Reyner has QA'd real readings through this preview. NOT
//      MET, and BLOCKED: the Gemini prepayment credits are depleted" - that
//      block ended long before this edit and the sentence outlived it, which is
//      the drift this header's closing note warns about. Note what SURVIVES in
//      it though: "Reyner has QA'd real readings" is clause 3b, and it was never
//      ruled away - only its stale blocker was.
//
//      Reasoning and the arithmetic: PROGRESS.md, RULED 2026-08-22.
//
//   4. fact.relation_positions no longer reads a temporal `hari` as a pillar —
//      the NOT_A_SPAN fix for `kemudian hari` / `suatu hari` / `hari ini`.
//      **MET 2026-08-12**, gate 1.9.0 (`NOT_A_SPAN`, lib/validate/fact.js:133).
//      Kept in the list rather than deleted: it is the record of why a gate fix
//      was a release gate at all. A hard finding drops the reading to the floor
//      and floorRefusalReason answers a hard-rejected floor with a 503 — behind
//      this fence a curiosity, on a public mirror a 503 generator, because
//      Indonesian uses `hari` temporally more than positionally and the renderer
//      writes free prose. History: PROGRESS.md, the 08-12 tranche-2b section.
//
// 3 OF 4 WHOLE. Preconditions 1, 2 and 4 are met - 2 closed in THIS commit, both its
// clauses. PRECONDITION 3 IS NOT MET, and neither clause of it is:
//
//   3a  threshold UN-MET. The 10% measurement was taken at REGENERATION_BUDGET 3 and
//       Reyner reverted the budget to 2 on 2026-08-22 evening, which returns the
//       pooled floor to roughly 20%. Whether the threshold MOVES is his open
//       question and must not be answered by widening it.
//   3b  NOT MET. 2 of 4 sell.
//
// So promotion is blocked on precondition 3 alone - both halves of it.
//
// ***THE ONE THAT IS STILL OPEN IS 3b, AND IT IS WHY THIS COMMIT MUST NOT MERGE.***
// 3b is Reyner's sell/no-sell read of the 08-22 artifact, no measurement closes it,
// and it is the last precondition standing. The code in this file IS promoted - the
// fence is gone, the funnel points here - and that is deliberate: the promotion had
// to be written as one reviewable change because every partial state is incoherent.
// Written is not landed. A session that finds this branch merged without 3b answered
// has found a defect, not a decision.
//
// THE COUNT HAS READ "3 of 4" TWICE, FOR TWO DIFFERENT REASONS, AND ONLY ONE OF THEM
// WAS ARITHMETIC. `b843631` wrote "3 of 4 ... blocked on precondition 2 alone" by
// counting precondition 3 as met when only its RENDER clause was; Reyner ruled that an
// over-count and confirmed 2 of 4 on 2026-08-23. It is 3 of 4 again now because
// precondition 2 ACTUALLY CLOSED - and precondition 3 is fully un-met, both clauses,
// so "blocked on precondition 2 alone" has become "blocked on precondition 3 alone".
// The two 3-of-4s share a number and nothing else. A precondition with two clauses
// cannot be counted met while one is outstanding, and the count is the field a
// promotion decision actually reads.
//
// (This header read "1 of 4" and "4. NOT MET" until 2026-08-13, while
// PROGRESS.md had condition 4 MET since 08-12. A checklist kept in two places
// drifts in exactly this direction, which is the risk the ledger names. If you
// change a row here, change it there in the same commit.)
//
// The handler lives in lib/ so `node --test` can load it — see that file's
// header for why.
// ============================================================

import { serveMirrorReading } from '@/lib/mirror/handlers.js';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { token } = await params; // Next 15: params is async
  return serveMirrorReading(request, token);
}
