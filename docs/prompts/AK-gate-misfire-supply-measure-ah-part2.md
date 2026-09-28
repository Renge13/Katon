# Prompt AK: the invented-term misfire, the Penyeimbang Unsur measurement, and AH Part 2 (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AK-gate-misfire-supply-measure-ah-part2.md`. Commit it with your first change.

Cite the four checks before acting. Two-round cap. No regex through a shell heredoc. Every change ships alone, is shown red first, and gets its own version bump where a gate or render path changes. Quote the command for every claim.

Cowork verified round 4b from the PDFs: one opening per pair, no nested brackets, "Mungkin menarik" in 4 of 7, one question mark (chart8), and rVe4ca served the floor. The two rejected rVe4ca sentences are true: "Hubungan kalian memiliki Tarikan Kuat dan Ritme Seirama" and "menghasilkan interpretasi yang berseberangan".

## §0. Only once Reyner says "merge"
Squash-merge #158, then merge main into `feat/voice-v2` (merge, don't rebase). Run the suite and the replay.

## §1. feat/voice-v2: stop D1 ("invented term") rejecting true text (Cowork's technical ruling)
Cause: D1 matches ordinary words, and a reworded engine term, against glossary names. The ruling has two parts:
1. **A glossary term is matched only as written with its capitals.** A lowercase ordinary word ("interpretasi yang berseberangan") is never a term claim. A capitalised mid-sentence use ("Berseberangan") still is.
2. **A supplied term written with "dan" in place of its comma is that term.** Normalise it to the ruled spelling ("Tarikan Kuat dan Ritme Seirama" becomes "Tarikan Kuat, Ritme Seirama") and log it as `normalised`, the same way the bracket normaliser does. It is not a rejection. Apply this only to terms the engine supplied for this reading.

- **Red first:** the literals come from D1's REJECTION lines in the round-4b and §2 logs, not from served text. Quote those lines.
- **Replay:** the 64 stored drafts plus all round-4 and round-4b drafts, on both voices. List every finding that moves. Anything beyond these two shapes: stop and report.
- **v1, report only:** does v1's gate carry the same D1 matching? Quote it. If it does, count how many stored v1 drafts it rejected on lowercase words. Do not change main here.
- Then re-render **rVe4ca only** (about $0.004) and report whether it serves. Quote its last paragraph.

## §2. Penyeimbang Unsur: measure a proposed meaning (report only, no engine change)
Reyner ruled that nothing changes until the trace is read. It has been read. Before Reyner rules the meaning, measure this candidate: **"X membawa elemen E" only when the supplier holds MORE of E than the receiver does.** It keeps the current walk (receiver's favourable list, scarcest first) and skips any element the supplier holds less of or equal to.
- Use the same amounts `supplyFor` (`lib/compat/complementarity.js`) already reads. Also print the "Sebaran Unsur" percentages the PDF shows. If the two rank any pair's elements differently, list the pair.
- Run it over every pair in `tests/fixtures/pair-frame-hits.fixture.json`, the stored pair readings, PZ0t, rVe4ca and g4WH4. Report per pair:
  - today's pick, in each direction;
  - the candidate's pick, in each direction;
  - whether the fact disappears in either direction.
- Totals: how many pairs change, and how many lose the fact entirely.
- No code change, no glossary change, no check change.

## §3. main: AH Part 2, the budget-protection build (Cowork's technical rulings, plus Reyner's rulings 5-7 as recorded in `docs/product/ah-protection-rulings-2026-09-28.md`)
One PR per item, each red first. Reyner approves the merges.
1. **Paid renders never floored by free traffic.**
   - A render for a PAID reading draws from its own daily counter, a runaway guard of 500 calls a day. That covers a paid pair, and the Mirror render of a token that has a paid Complete Edition.
   - The free cap stays at 1,500 calls (ruling 5).
   - Test: exhaust the free counter, then show a paid render still calls the writer.
2. **Per-IP daily cap on `POST /api/mirror`:** 100 new readings per IP per day, which is about 10% of the free cap at v1's 1.5 calls per reading. It sits alongside the existing 60 per hour.
   - When it's hit, use the EXISTING rate-limit response and copy. Quote it.
   - If no reader-facing copy exists for that response, stop and report: copy is Reyner's.
3. **Vercel BotID Basic on `POST /api/mirror` only** (ruling 6, amendment 2).
   - Never call Deep Analysis, and don't configure it.
   - The client-side part goes on the page that sends that POST. Follow https://vercel.com/docs/botid/get-started, and cite the version you install.
   - A request judged a bot gets the same existing refusal as the rate limit, and no token is minted. Test with `checkBotId` stubbed.
   - Report what BotID does in local dev and on Preview, from its docs.
4. **Cap-reached trace:** the first time each day the free cap is hit, write one `writer_cap_reached` event row. Use the existing events table if there is one; say which. No push alert.
   - Write a DEFERRED REGISTER row: push alerting is parked until first promotion.
5. **The reserve slice is dropped** (AJ §5.1: it doesn't survive IP rotation). Record that in the AH rulings file in the same PR as item 2.

## Not in this prompt
- AH Part 3 (the Compat CTA): waits for Reyner's copy.
- Promotion of v2: waits for §1's rVe4ca result, Cowork's read and Reyner's final go. Do not merge `feat/voice-v2`, and do not touch `lib/voice.js:19`.

## Report format
Per item: commits, red-first proof, test and replay output, and what the customer gets. End with the split: what Reyner does, and what waits.
