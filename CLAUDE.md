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
    **ONE PROVIDER: Gemini. The deterministic floor is the failover.** Module assembly is not a
    degraded mode here, it is the second half of the design (rule 17), and there is no second
    model behind it.

    **Amended 2026-08-22 on Reyner's ruling**, replacing "Gemini primary, OpenAI secondary, both
    behind one provider interface." The secondary was deleted rather than fixed, and the reason is
    that it had never run: arming it required a model id no document in this repo ever named, so
    `openaiConfigured()` returned false for the project's entire life and the chain skipped it on
    every request. A branch that reads like a mitigation and has never once executed is worse than
    no branch, because it gets counted in availability reasoning.

    **THE CONSEQUENCE IS OPERATIONAL AND IT IS NOT SOFTENED.** With no second provider, a Gemini
    outage or an exhausted balance means a **100% floor rate** - every reader served module
    assembly. The floor IS the availability budget now. The 2026-08-12 credit-depletion incident
    has no architectural mitigation any more; the replacement is a balance alert on the Gemini
    account, which **does not exist yet** and sits in the deferred register with an owner and an
    end condition. The transport retry inside Gemini stays: retrying a 503 against the same
    provider is not failover and was kept deliberately.
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
- ~~`contents/*.md` are the DEPRECATED hand-authored cells... do not delete them until the new
  pipeline ships.~~ **DONE 2026-08-23 — the pipeline shipped and they are deleted.** See SUPERSEDED
  for what went with them. The line is struck rather than removed because it is the record of a
  do-not-delete instruction being DISCHARGED rather than ignored.
- Reyner is the **sole authority on Indonesian register**. Propose wording, flag it, never
  auto-decide.
- **A NEW CARD CHECK IS SHOWN FAILING BEFORE IT IS TRUSTED.** Point it at a deliberately broken
  input, watch it go red, then fix the input. This is a convention rather than three bug reports
  because **three card instruments in three days were each written so they could not fail**, and each
  was green while the defect it existed to catch was live: `probe-card-export` asserted one corner
  pixel and a size, both of which a completely blank PNG passes; the same probe ran `skipFonts: true`
  against a production path that loads fonts; and `audit-card-budget` ended with an unconditional
  `process.exitCode = 0` inside a file whose own header calls its cap *"enforced as a TEST"*. The
  shape is always the same and it is never dishonest — the check is written from the requirement it
  is documenting, so it asserts what is easy to assert rather than what would break. **The card is
  where this keeps happening**, because its failures are silent by construction: the object is
  `overflow: hidden`, the captured node is off-screen in a 1px box, and a wrong card looks like a
  card. Nothing on screen ever shows it. So: no card check counts as evidence until it has produced
  a red on purpose, and the run that proves it belongs in the commit message.
- **WHEN A COMMIT CHANGES BEHAVIOUR, AT LEAST ONE ASSERTION MUST FAIL WITHOUT THE CHANGE.** Not
  "the suite is green" — a specific assertion that goes red when the change is removed, and the run
  that shows it belongs in the commit message. **This is a DIFFERENT failure from the entry above and
  both are needed.** That one is about a check with no failing input at all; this one is about a check
  whose failing input is a *different proposition* than the change you made.
  **The worked example is `2026-08-26`:** a commit landed the floor's label suppression and merged its
  COMMENTS AND NOT ITS CODE — a `git checkout --` reverted the implementation while it was
  uncommitted, and the comment edit re-applied cleanly on top. The suite stayed green because the
  assertion had been rewritten *in that same commit* to accept **both** shapes, suppressed and not,
  since both satisfy rule 21. It was a correct test of the RULE and it could not see a reverted
  implementation. **A rule that permits two shapes cannot tell you which one you shipped**, and the
  defect reached production. The replacement — `tests/stage5-render.spec.mjs`, "THE FLOOR DOES NOT SAY
  THE LABEL TWICE" — asserts the BEHAVIOUR, was shown failing on the merged build first, and is the
  shape to copy. **A test that passes whether the feature exists or not is worse than no test**,
  because it supplies confidence that stops anyone looking.
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
- ~~`contents/*.md` are the DEPRECATED hand-authored cells... **do not delete them** until the new
  pipeline ships~~ → **THE PIPELINE SHIPPED AND THEY ARE DELETED** (2026-08-23, the promotion). That
  instruction lived in REPO CONVENTIONS above and was correct for as long as it was: those cells fed
  the live readings. `contents/`, `lib/content/`, `lib/readingView.js`, `lib/chart.js`,
  `scripts/build-content.mjs`, `components/Sharecard.jsx` and every `/api/reading/*` route are gone.
  `grep -rn "lib/content" lib app components` returns only comments recording the history.
- ~~`MIRROR_PREVIEW_TOKEN` and the mirror preview fence~~ → removed with the promotion. The funnel
  front door creates and reads mirror readings, so a fence in front of that route is a fence in front
  of the site. **UNSET IT IN VERCEL**: it is inert, and a stale secret left in a deploy is exactly how
  the flag on the line above became architecture. `lib/mirror/fence.js` is deleted rather than kept as
  a switch nothing flips.

---

## THE TWO LIVE DIVERGENCES, CLOSED 2026-08-23

`docs/PROGRESS.md`'s LIVE STATE block existed because **this file described the TARGET and the code ran
something else**, and nothing recorded the gap. Both divergences it recorded on 2026-08-13 close with
the promotion commit. They are written here, in the file that was wrong, rather than only in the ledger
that caught it:

1. **FREE IS THE FULL MIRROR AGAIN.** The 7-beat deep read sat behind the Rp 19.000 wall from
   2026-08-05, so "paid is an upsell offered AFTER the free reading lands, never a gate" was false for
   eighteen days. **The deep read is now DELETED, not moved.** What makes this durable rather than a
   re-flip waiting to happen: there is no prose the paywall COULD hide any more, because the paid path
   holds none of its own. Rp 19.000 buys an artifact.
2. **NO UNVALIDATED CELL REACHES A PAYING CUSTOMER, because there are no cells.** On 2026-08-13,
   `grep -l "pending founder" contents/*.md` returned 16 of 20, three more were stamped
   SCAFFOLD/pre-validation, one carried no STATUS at all - zero founder-validated cells, and a paying
   customer received them. **This is closed by deletion, which is not the same as being answered:**
   what replaces it is Stage 6 passing on every serve, and a gate pass is a different guarantee from a
   founder read. **Precondition 3b IS that founder read and it is still open.**

A third item was numbered in that block under a heading that said "two divergences" - two live
archetype name sets disagreeing on five of ten. It also closes: the glossary's set is the one that
survives, and `tests/mirror-route.spec.mjs` now asserts that a reading and its card name the same
archetype rather than leaving it to a reader to notice.
