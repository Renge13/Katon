# Prompt AI: next Code session handoff (Cowork, 2026-09-27)
This is for a FRESH Claude Code session. The file sits untracked in the working tree as `docs/prompts/AI-next-session-handoff.md`. Commit it with the first docs change.

## 0. Orientation
**Katon** (katon.app) is Reyner's Indonesian BaZi webapp. Repo `Renge13/Katon`, working tree `D:\claude-projects\katon`.
- Products: a free Mirror; the Complete Edition (Rp 19k: PDF, Card B, reference appendix); Compatibility (Rp 39k).
- Sales are closed until DOKU is live.

**Roles:**
- Reyner rules anything a reader can see.
- Cowork writes specs, rules technical choices, and verifies.
- You implement.

**Before acting, cite the four checks:**
1. Quote the command or file.
2. Every instrument must be able to fail (show it red first).
3. Remove the cause rather than add a gate.
4. Say what the customer gets.

Two-round cap. Never write a regex through a shell heredoc; use the file tool.

**Canonical rulings, read these first:**
- `docs/product/product-boundary-rulings-2026-09-26.md` (in PR #153)
- `docs/content/voice-constraint-rulings-2026-09-26.md`
- **MVP render path:** engine → Flash-lite writer → deterministic checks → serve.
  - No semantic judge in production; `judge.js` and `calibrate-j1.mjs` are manual QA tools only.
  - No writer bake-off.
  - Voice v2 is launch-critical.
  - `feat/voice-v2` never merges to main until Reyner accepts the voice.
  - `lib/voice.js:19` (production forces v1) stays untouched.

**State at handoff:**
- **main:** #151 and #152 merged.
- **Open, awaiting Reyner's approval:**
  - #153: docs. The product-boundary rulings, the PROGRESS stale row, and the voice-rulings STATUS.
  - #154: deterministic pair-truth checks, 1.39.0 to 1.41.0, on v1 and v2.
- **`feat/voice-v2`:** AE items 1-3 and 5 are done (`249f225`). Then 1.42.0 (no judge), 1.43.0 (cached v2 rows re-gated with v2 rules), 1.44.0 (v2 pair badges), the #154 branch merged in (1.45.0), and 1.46.0 (element dominance hard on v2).
- **Temporary worktrees to remove:** `../katon-docs-ag0` and `../katon-ag1`.

## 1. Only once Reyner says "merge"
1. Squash-merge #153, then #154.
2. Merge main into `feat/voice-v2`. Merge, don't rebase: the docs cite branch hashes. Resolve only the version bookkeeping, and run the suite.
3. Remove the two worktrees.

## 2. Truth follow-ups (Cowork's technical rulings; each alone, red-first, with a version bump where a gate changes)
- **A serve-time hard fail must not floor a chart forever.**
  - Today `floorIfHardFailing` (mirror) serves the floor but keeps the cached row, so every later visit floors too. Once #154 merges, a cached mirror with a false dominance claim would floor permanently.
  - On a serve-time hard fail, invalidate that cache row, so the next visit re-renders. That re-render is bounded by guard (a), 3 per key per hour.
  - Instrument: a stored row that fails the new gate → the first GET floors and drops the row → the next GET re-renders (with a stub provider).
- **Pair serve path.** Cached pair rows are not re-gated on serve, so the 2026-09-08 g4WH4 paid reading ("Dia membawa elemen air"; B brings Kayu) keeps serving.
  - Apply the same re-gate-and-invalidate to pairs.
  - Report whether that re-renders the g4WH4 row on its next visit.
  - Do not touch the database by hand.

## 3. Docs cleanup (one docs-only PR to main, Reyner approves)
- PROGRESS row ~362: "J1 now GATES" becomes: no semantic judge in production (MVP ruling), pointing to the rulings files.
- Voice rulings:
  - row B9: "J1 protects the boundary" becomes "deterministic checks and Reyner's acceptance read protect it; J1 is a QA tool";
  - line 5: remove "not durable until committed";
  - the principle "the reviewer catches mistakes": add "(deterministic checks; the semantic judge is QA-only for the MVP)".
- Both rulings files cite `reports/architecture-cost-2026-09-26.md`, but `reports/` is gitignored. Commit a copy as `docs/qa/2026-09-26-architecture-cost.md` and repoint the citations.
- `scripts/calibrate-j1.mjs`: fix the stale J4 comment.
- Quote every changed line.

## 4. AE item 4, the representative test (only if Reyner OKs it)
- Run it per `docs/prompts/AE-writer-instructions.md` item 4:
  - Flash-lite writer, on `feat/voice-v2` at its head.
  - Mirrors chart1, chart4, chart6, chart8 and chart13; pairs PZ0t and rVe4ca.
  - Exclude the example charts `eJm6p6PjG8f…` and `g4WH4…`.
- **Output:** PDFs next to the stored v1 PDFs, under `reports/voice-v2/round4/`. Mark every floored reading as FLOOR in the filename and the report.
- **Report, per reading:**
  - gate findings;
  - regenerations;
  - measured cost;
  - a grep for any sentence reused from the examples file.
- No voice score. Reyner judges.

## 5. After that: AH Part 1 (report only, then STOP)
`docs/prompts/AH-free-mirror-protection-and-compat-cta.md`.

## Report format
- Per item: commits, red-first proof, replay or test output, and what the customer gets.
- End with the split: what Reyner does, and what waits.
