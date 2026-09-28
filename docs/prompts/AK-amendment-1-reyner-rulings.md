# Prompt AK, amendment 1: Reyner's rulings of 2026-09-28 (Cowork)
Untracked in the working tree as `docs/prompts/AK-amendment-1-reyner-rulings.md`. Commit it with the rulings record.

## Reyner, 2026-09-28, verbatim
```
1. "Mungkin menarik": change to remove it. Keep the open-ended ending, but don't add another heavy writing rule beyond avoiding this recurring hedge.
2. Rhetorical question: don't use it as a target pattern. Prefer confident observations for the close. Genuine questions can appear naturally, but the prompt should not encourage them.
3. Penyeimbang Unsur: proceed with AK §2 measurement only. No engine change until we see how many compatibility pairs actually change.
4. Separate paid AI budget: approve.
5. Complete Edition fallback: must be fixed before launch. If the saved Mirror is fallback text, the paid flow must generate a full reading before rendering the paid PDF.
6. Per-IP 100/day + BotID on `/api/mirror`: approve as the abuse-protection layer.
```
Also recorded: DOKU production QRIS was resubmitted 2026-09-28 with MCC 5817 and Nama Pendek Brand "Katon App". The PT's KBLI is 63900.

## Where they are recorded (one docs PR to main, alone, every line quoted)
- Rulings 1 and 2 go into `docs/content/voice-constraint-rulings-2026-09-26.md` as new dated rows, using the next free numbers.
- Rulings 3-6 go into `docs/product/ah-protection-rulings-2026-09-28.md`.
- The DOKU line goes wherever the repo tracks the DOKU launch gate (`docs/ops/doku-walk.md`, gate a).
- Reyner pre-approves merging this docs PR on green CI (stated in his paste).

## Changes to AK
**§1b (new), `feat/voice-v2`: rulings 1 and 2, in the prompt only. No new gate, no blocklist entry, no ban.**
- Grep both v2 prompts, and anything they include, for text that invites a question or an open musing in the close. Quote every hit.
- Replace the close guidance with a single instruction, keeping the open-ended ending: *end on a confident observation that leaves her wanting to look further; don't open it with "Mungkin menarik untuk…".* Remove anything that encourages a question. Questions are neither banned nor asked for.
- Red first: a test that the built v2 prompts contain the new instruction and none of the removed wording. It must fail on today's prompts.
- The existing `style.hedging` and `style.rhetorical_question` stay log-only on v2. Do not promote them.

**§1c (replaces AK §1's "re-render rVe4ca only"): round 4c, after §1 and §1b are both committed.**
- All seven subjects, output to `reports/voice-v2/round4c/`, FLOOR in any floored filename, about $0.025.
- Report per reading:
  - served or floor;
  - every "Mungkin menarik";
  - every served question mark;
  - the opening count (pairs);
  - nested brackets;
  - gate findings, regenerations and cost.
- Quote the last paragraph of each reading.

**§3.1 (paid budget):** approved by ruling 4, as written in AK.

**§3.6 (new, main, before launch): the Complete Edition never prints from a fallback Mirror (ruling 5).**
- When a CE is paid (at settle or reconcile) AND whenever the CE PDF is requested: if the saved Mirror reading is missing or is floor, render a full Mirror reading from the paid budget (§3.1) before the PDF is built. The PDF never prints floor prose.
- Also warm it at settle, so the PDF is usually ready by the time she asks for it.
- If the render fails (provider error, or the draft still fails the gate after the existing regeneration), she gets the existing "not ready yet" answer, not a floor PDF. Quote that existing copy. If there is no reader-facing copy for that state, stop and report: copy is Reyner's.
- Red first: a paid CE whose saved Mirror is floor, with a stub writer. On main, the old code yields no PDF, or a floor. The new code renders and prints the full reading. Add one more case: the provider fails, and she gets the existing answer.
- Customer gets: a paid Complete Edition is always a real reading.

**§3.2 and §3.3 (per-IP 100/day, BotID on `POST /api/mirror`):** approved by ruling 6, as written in AK.

**§2 (Penyeimbang Unsur):** unchanged, measurement only (ruling 3).
