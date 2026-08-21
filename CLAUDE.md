# CLAUDE.md — Katon

**Claude Code reads this automatically. If anything here conflicts with an older note, a comment in
the code, or a prior session, THIS FILE WINS.**

Last rewritten 2026-08-01. The previous version described a pre-pivot architecture and was actively
misleading — it stated "NO AI/LLM AT RUNTIME", a Rp 49.000 paid domain-reading tier, and a casual
"old friend" voice. **All three are reversed.** See SUPERSEDED at the bottom.

Deep detail lives in `docs/`. Start with `docs/PROGRESS.md`.

---

## PRODUCT

Katon (katon.app). Indonesian BaZi (Four Pillars) self-discovery webapp. Birthdate in, a reading and
a shareable card out. Target: Indonesian women, mid-20s to 40s.

- **FREE** = the full mirror (everything about the self from one chart). Ungated. This is the
  acquisition engine and the willingness-to-pay engine, **not** a revenue line.
- **PAID, impulse (~19k)** = hi-res card + packaged PDF. An upsell offered AFTER the free reading
  lands. **Never a gate.**
- **PAID, core** = COMPATIBILITY (you + one other person). The money engine. Price band to be
  TESTED at 25–45k, not assumed at 80–99k.
- Later: annual reading, parent→child, luck-pillar map. See `docs/product/paid-product-map.md`.

## STACK

Next.js 15 (App Router, JS) · React 19 · Supabase (Postgres) · Xendit QRIS · Vercel.
Repo `Renge13/Katon`, trunk `main`. Domain katon.app.

---

## LOCKED — do not re-litigate

### Calculation
1. **`tyme4ts` is the calculator.** Pure TS, MIT, zero deps. **sxtwl is retired as a runtime
   dependency** — no npm package exists and none is needed; it is the same 寿星天文历 engine.
   sxtwl and astronomy-engine are CI-only oracles.
2. **`LunarSect2EightCharProvider` (流派2 / late-子 convention) is mandatory.** Set once at module
   scope. The default provider rolls the day at 23:00 and fails validation chart 7.
3. **Naive local wall-clock. NEVER convert timezones. NEVER apply True Solar Time.** Joey Yap's
   plotter has no city or timezone field, so it applies neither, and matching the oracle is the
   requirement. An unused `tz` field is persisted only to keep the convention cheap to revisit.
   Confirmed empirically: 1989-02-04 04:00 → 戊辰 乙丑 乙未 戊寅.
4. **Never improvise BaZi rules.** LLM training data on BaZi is frequently wrong, especially near
   solar-term boundaries. If a rule is not written down in `docs/`, ask. Do not recall it.
   **This applies to tables handed to you in a prompt as well** — verify against a second source and
   stop if sources disagree. Many spec errors have been caught that way, all of them from Cowork.
   The running ledger with the failure patterns is `docs/COWORK-BRIEF.md` section 4; a count does not
   belong in a locked rule (rule 8).

   **The `bazi-calculator` skill is NOT a valid source.** Its 藏干 table still reads `子: 壬(100%)`,
   which is the exact error `cb43bc7` corrected and is very likely where that error came from. It has
   no 刑 table and does not cover 命宮. The authority is `docs/` plus the repo's own locked tests
   (`tests/hidden-stems.spec.mjs`, `tests/punishment.spec.mjs`, `tests/solar-terms.spec.ts`).

   **`命宮` (Life Palace) is DELIBERATELY NOT IMPLEMENTED.** Two candidate conventions score 4/5 and
   3/5 against Joey's own printed values; neither is right. It compounds three convention choices
   (year stem, month, hour) so it fails on exactly the charts that are already boundary cases. See
   `docs/prompts/D1b-remove-life-palace.md`. `胎元` is fine and stays (5/5, triple-verified).
5. **The solar-term fixture is EVIDENCE, not output.** Never regenerate
   `tests/solar-terms.fixture.json` to make a failing test pass.
6. **Trap:** tyme4ts's `getJulianDay().getDay()` is **UTC+8-based**, not UT. Naive JD arithmetic
   introduces an 8-hour error that silently flips month branches. Assert against
   立春 1989 = 1989-02-04 04:27 (+08) before trusting any JD maths.

### Engine
7. **Do not touch `lib/bazi/tenGods.js` or `lib/bazi/mainProfile.js`.**
8. **Track A divergence from Joey is INTENDED. Do not chase 13/13.** Katon's canonical profile uses
   month-branch structural rooting only; Joey uses a proprietary two-source tiebreak we deliberately
   did not reproduce. Some charts will never match and that is correct.

   **The principle is locked. The number is not.** Measured 7/13 until 2026-08-01, then **8/13** after
   the 子 hidden-stem correction — chart 8 started matching Joey once its input was right. Track A
   itself was never touched. Record the current figure as a dated observation in
   `docs/PROGRESS.md`, never as a locked constant here: a number in a locked rule goes stale the
   moment an upstream input is fixed, and then it either protects a bug or blocks a real improvement.
   A **drop** below the last recorded figure is a regression and must be investigated. A **rise** after
   an input correction is expected.
9. `buildElementBars` is **display normalisation only**, never a strength score. The seasonal
   strength distribution is a different computation in a different file. Never conflate them.
10. Joey's element bars are a **seasonal element-strength distribution**, not a Ten-God token count.
    A token tally provably inverts on fixture charts 1 and 9.
11. **土旺於四季 — Earth does not rule a season of its own** (adopted 2026-08-01, `earthMonthRuler`).
    The four Earth branches sit at the tail of the other four seasons: 辰 Wood, 未 Fire, 戌 Metal,
    丑 Water. Evidence: all nine non-Earth-month charts bit-identical, four of five Earth-month charts
    improve, nothing regresses, chart 9 rho 0.20 to 0.90. Classically grounded and empirically
    supported. Magnitude is fitted on five charts — re-check if the fixture grows.
12. **The bars are per-stem presence x seasonal, NOT an element base shared across a god pair.**
    The zero-presence law is 130/130: a god scores exactly 0 if and only if its stem is absent from
    the chart. Chart 1 is decisive — same element, 比肩 丙 at 85 and 劫財 丁 at 0. Pair-projection
    modes are REFUTED; they remain selectable only so the refutation stays reproducible.
13. **Never fit two candidate model terms in one measurement.** A steepened 旺 and a concave presence
    transform are confounded; whichever is fitted first absorbs the other's explanatory work and the
    real cause is never learned. One change, one measurement, always.

### Architecture
14. **The engine owns ALL facts, hierarchy and structure. The LLM chooses only words.** If the LLM
    is ever in a position to decide something true, the design is wrong.
15. **Runtime LLM rendering is ON** (reversal of the old rule) — for the RENDERING layer only.
    Gemini primary, OpenAI secondary, both behind one provider interface.
16. Every reading is **result-cached** on `hash(semantic_JSON + engine_version)` - deterministic
    after the first generation THAT PASSES STAGE 6. **Module-assembly floor results serve but are
    never persisted; the next request retries the render.** (Amended 2026-08-07, ratified by Reyner.
    Storing the floor let a single provider outage cost those charts their real reading permanently:
    the next request is a cache hit and the chain never runs again, and the key only moves when
    ENGINE_VERSION does. Enforced in `persistRendered`, which is the single door, so a later route
    cannot reintroduce it by not knowing.)
17. **Nothing reaches a user without passing Stage-6 post-validation.** LLM output is guilty until
    validated. Module assembly is the always-available floor.
18. **Paywall is server-gated.** `paid` flips only in the verified Xendit webhook, never from any
    client path. Paid content is imported only by the `/full` route.
19. Rate-limit per IP/session. No bulk endpoint. No enumerable reading URLs. The real abuse risk is
    content harvesting, not API cost (the entire mirror space costs ~$115 to cache forever).

### Voice and naming
20. **ONE VOICE EVERYWHERE, including chrome.** Plain, precise, everyday Indonesian. Composed and
    direct. Accessible words, short sentences, no verbosity. Warmth through precision.
    **The casual "old friend" register is DEAD** — killed by `docs/research/coldread-analysis.md`;
    the casual front door was itself causing "is this serious?" doubt.
    No slang (*ngerasa/bikin/kayak/capek*), no chat particles (*tuh/lho/deh*), not bureaucratic-baku.
    **Keyboard characters only — no em-dash, no curly quotes. This applies to USER-FACING STRINGS
    ONLY.** Code comments and JSX comments are not user-facing; leave them alone. The audit surface is
    rendered text, payment descriptions, headings, buttons, and error copy.
    (Correction 2026-08-02: the two "known violations" previously listed here were both FALSE - the
    Sharecard em-dashes are all in comments and the old invoice description used a colon. The one
    real violation, curly quotes at `components/Funnel.jsx:731`, was FIXED same day in `75f1901`; a
    grep for curly quotes across `components/` now returns nothing. COWORK-BRIEF error 13. Audit by
    grep, never from memory; a violation note in this file must carry its grep and close with its
    fixing commit.)
21. **"lemah"/"kuat" ARE permitted.** The friction ("what do you mean I'm weak?") pulls the reader
    deeper. Condition: the explanation lands in the same breath, and never bare on the sharecard.
22. **Never use Joey Yap's trademarked profile names** (Director, Diplomat, Warrior — his IP).
23. **Naming: Indonesian name first, English term in brackets once.** `Aspek` = internal disposition,
    `Bintang` = external marker. Collective term is **Sepuluh Aspek (Ten Gods)** — never "Dewa", which
    reads as a Hindu deity to a Muslim-majority audience. Full table: `docs/content/glossary-naming.md`.

    **SCOPE, ruled 2026-08-19 and ENFORCED since 2026-08-21: bracket-once binds `Aspek`, `Bintang`
    and `Arketipe`. It does NOT bind `Pilar` or `Elemen`.** The ambiguity is what produced the
    question, so the answer is written here rather than inferred. Reyner: *"Missing English terms on
    `Aspek Pengelola` in Chart 1 immediately feels like a dropped translation artifact because every
    other card carries them. `Pilar` and `Elemen` should remain unbracketed to avoid visual clutter."*
    The corpus had already been deciding it that way — `pilar` 0 of 274 bracketed, `elemen` 13 of 170 —
    so the ruling ratifies rather than reverses, and those 13 are the exception to sweep.

    Enforced by `lib/validate/brackets.js`, soft, at `STAGE6_VERSION` 1.12.0. It reads its scope from
    the glossary rather than a list, because the first version's `provenance.kind` allowlist missed
    `coherence_rule` (`Aspek Pengelola`, one of the two terms in the ruling's own live instance) and
    `void_stack` (`Tanda Kekosongan`, a 空亡 bintang whose name starts with neither word). **It does not
    look at `elemen` at all** — not to pass it, not to exempt it.

    **The defect it actually catches is the FUSED opening**, which is why enforcement was ruled on
    sentences rather than on the principle: `Kamu adalah Api Matahari yang Lemah` versus
    `Kamu adalah Matahari (The Sun) yang Lemah`. **Reyner ruled the second, 2026-08-21.** Element then
    image is the same shape he rejected on chart 13 as identity behind taxonomy, and it survived
    commit 1 because that commit required the NAME and not the pattern.

    **EN display layer (ruled 2026-08-02):** archetype names and fixed tags carry an English pair
    (`glossary.json` → `arketipe.name_en`, later `tags_en`). Scope is names + tags + card strings
    ONLY — the reading body stays Indonesian. The brackets convention above applies to READING PROSE.
    The sharecard NEVER shows brackets: it renders `name_id` or `name_en` per display variant, one at
    a time. `name_en` must be the same object as `name_id` (shared watercolour). Which variant ships
    is a card-visual-system decision and an A/B candidate on share rate — not locked here.

    **Chinese characters — the line is data vs words (ruling 2026-08-01):**
    - **KEEP** in the chart display. The eight characters in the pillar cells ARE the chart. They are
      the legitimacy object and the thing that lets a user cross-check Katon against any other
      calculator. Pair each with its Indonesian animal/element so it is readable, never bare.
    - **REMOVE** everywhere they function as words the reader must decode: prose, headings, badge
      names, button labels. `八字` as a heading is decoration with a comprehension tax — write
      "Bagan Kelahiran" or similar.
    - Rule of thumb: hanzi you can *point at* is fine. Hanzi you must *read* is not.
24. Exactly **10 archetypes**, one per Day Master stem. Pure BaZi — no Weton, no Javanese pasaran.
25. Ethics: no fatalism, no dated prophecy, no medical or financial advice, no ranking of gods or
    strength states as good/bad. Timing is *cuaca*, never *ramalan*.

---

## REPO CONVENTIONS

- **Line endings:** `core.autocrlf=true` + `.gitattributes` (`* text=auto eol=lf`). A CRLF drift
  once produced 47 phantom "modified" files and hid real uncommitted work in `calculator.js`.
  If `git status` shows a wall of changes with symmetric insert/delete counts, that is the cause.
- **PR discipline:** each PR independently reviewable and revertable. Engine work, content work and
  infra work never ride together.
- **GATE CHANGES SHIP ISOLATED** (adopted 2026-08-21). A commit that changes what Stage 6 ACCEPTS
  carries nothing else, so a floor-rate move always has exactly one candidate cause. This is rule 13
  applied to shipping rather than to fitting: two accept-changing edits in one commit confound each
  other's floor rate permanently, because the floor is measured per commit and the commit cannot be
  split afterwards. A check that FIRES AND LOGS BUT REJECTS NOTHING is not a gate change under this
  rule and may travel — it cannot move the floor, which is the whole point of landing one that way
  first. Corollary: `STAGE6_VERSION` bumps once per such commit, never twice, and never zero times.
- **The commit message must describe everything staged.** `git add -A` routinely sweeps in more than
  the message names — this has happened twice, once carrying a locked-file renumbering under a
  "docs chore" subject. Either stage selectively, or widen the message. Run `git status` and read it
  before writing the subject line, not after.
- **Migrations** are applied manually in the Supabase SQL editor (no CLI migration tracking).
  Always run the migration BEFORE deploying code that depends on it.
- `contents/*.md` are the DEPRECATED hand-authored cells. They still feed `scripts/build-content.mjs`
  and the currently-live readings — **do not delete them** until the new pipeline ships.
- Reyner is the **sole authority on Indonesian register**. Propose wording, flag it, never
  auto-decide.
- **A code-fact written into any doc carries the command that produced it, and its date.** A claim
  about the code without its grep is a memory, not a fact. Error 13 (COWORK-BRIEF §4) entered this
  locked file exactly that way and every session inherited it as truth. Re-run the command before
  propagating the claim into a prompt; a check older than the code it describes proves nothing.
- **A change to what Stage 6 ACCEPTS OR REJECTS bumps `STAGE6_VERSION` in the same commit.** New
  check, deleted check, threshold move, blocklist pattern added or removed. No edit is too small:
  deleting `style.adverbial` and moving `mungkin` out of `blocklist.json` on 2026-08-17 left **two
  materially different gates both stamping `1.9.0`**, and `persistRendered` writes that field onto
  every cached row precisely so "which readings passed under the old rules" stays answerable. A
  stale constant is the one thing that makes it unanswerable. Fixed at `1.10.0`; the rule now also
  sits on the constant's own docblock and in `blocklist.json#_rule`, because the person editing a
  regex does not open `lib/validate/index.js`.

---

## WHERE THINGS LIVE

```
docs/PROGRESS.md              the ledger. read first. its SUPERSEDED section wins conflicts.
docs/prompts/                 Claude Code handover prompts (A, A2, B, C)
docs/engine/                  calculator decision, strength-engine spec, pipeline spec
docs/content/                 renderer prompt (source of truth), glossary naming
docs/product/                 launch decisions, paid product map
docs/research/                cold-read analysis, mechanism inventory
docs/archive/                 superseded, kept for history only
```

---

## SUPERSEDED — ignore these wherever they appear

- ~~"NO AI / LLM API AT RUNTIME"~~ → reversed for the RENDERING layer. Facts stay deterministic.
- ~~"Paid tier Rp 49.000 unlocks domain-specific prescription readings"~~ → paid is COMPATIBILITY.
  No domain input gate; the pillars ARE the domains positionally.
- ~~The 7-field / 5-beat paid content schema, `lib/content/bing.js` as the reference~~ → superseded
  by engine semantic JSON + the ~64-entry glossary.
- ~~"Voice: old friend who knows you well"~~ → dead. One composed voice everywhere.
- ~~"sxtwl is the designated calculation library"~~ → retired as a runtime dep.
- ~~"Hand-author the reading cells"~~ → engine JSON → LLM render → validate → cache.
- ~~"Author all ~78 modules before launch"~~ → superseded by the glossary.
- ~~CR-5, "weak is banned as a consumer word"~~ → lifted. See rule 18.
- ~~The `NEXT_PUBLIC_FREE_FULL_READING` test flag as the mechanism for a free mirror~~ → the mirror
  is ungated BY DESIGN. Remove the flag; do not let a test flag become the architecture.
