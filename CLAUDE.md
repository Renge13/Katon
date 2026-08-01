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
5. **The solar-term fixture is EVIDENCE, not output.** Never regenerate
   `tests/solar-terms.fixture.json` to make a failing test pass.
6. **Trap:** tyme4ts's `getJulianDay().getDay()` is **UTC+8-based**, not UT. Naive JD arithmetic
   introduces an 8-hour error that silently flips month branches. Assert against
   立春 1989 = 1989-02-04 04:27 (+08) before trusting any JD maths.

### Engine
7. **Do not touch `lib/bazi/tenGods.js` or `lib/bazi/mainProfile.js`.**
8. **Track A canonical profile at 7/13 is CORRECT.** It is the intended divergence from Joey's
   proprietary two-source tiebreak; Katon uses month-branch structural profile only. **Do not "fix" it.**
9. `buildElementBars` is **display normalisation only**, never a strength score. The seasonal
   strength distribution is a different computation in a different file. Never conflate them.
10. Joey's element bars are a **seasonal element-strength distribution**, not a Ten-God token count.
    A token tally provably inverts on fixture charts 1 and 9.

### Architecture
11. **The engine owns ALL facts, hierarchy and structure. The LLM chooses only words.** If the LLM
    is ever in a position to decide something true, the design is wrong.
12. **Runtime LLM rendering is ON** (reversal of the old rule) — for the RENDERING layer only.
    Gemini primary, OpenAI secondary, both behind one provider interface.
13. Every reading is **result-cached** on `hash(semantic_JSON + engine_version)`. Deterministic
    after first generation.
14. **Nothing reaches a user without passing Stage-6 post-validation.** LLM output is guilty until
    validated. Module assembly is the always-available floor.
15. **Paywall is server-gated.** `paid` flips only in the verified Xendit webhook, never from any
    client path. Paid content is imported only by the `/full` route.
16. Rate-limit per IP/session. No bulk endpoint. No enumerable reading URLs. The real abuse risk is
    content harvesting, not API cost (the entire mirror space costs ~$115 to cache forever).

### Voice and naming
17. **ONE VOICE EVERYWHERE, including chrome.** Plain, precise, everyday Indonesian. Composed and
    direct. Accessible words, short sentences, no verbosity. Warmth through precision.
    **The casual "old friend" register is DEAD** — killed by `docs/research/coldread-analysis.md`;
    the casual front door was itself causing "is this serious?" doubt.
    No slang (*ngerasa/bikin/kayak/capek*), no chat particles (*tuh/lho/deh*), not bureaucratic-baku.
    Keyboard characters only — no em-dash, no curly quotes.
18. **"lemah"/"kuat" ARE permitted.** The friction ("what do you mean I'm weak?") pulls the reader
    deeper. Condition: the explanation lands in the same breath, and never bare on the sharecard.
19. **Never use Joey Yap's trademarked profile names** (Director, Diplomat, Warrior — his IP).
20. **Naming: Indonesian name first, English term in brackets once, NO Chinese characters in
    user-facing copy.** `Aspek` = internal disposition, `Bintang` = external marker.
    Collective term is **Sepuluh Aspek (Ten Gods)** — never "Dewa", which reads as a Hindu deity to a
    Muslim-majority audience. Full table: `docs/content/glossary-naming.md`.
21. Exactly **10 archetypes**, one per Day Master stem. Pure BaZi — no Weton, no Javanese pasaran.
22. Ethics: no fatalism, no dated prophecy, no medical or financial advice, no ranking of gods or
    strength states as good/bad. Timing is *cuaca*, never *ramalan*.

---

## REPO CONVENTIONS

- **Line endings:** `core.autocrlf=true` + `.gitattributes` (`* text=auto eol=lf`). A CRLF drift
  once produced 47 phantom "modified" files and hid real uncommitted work in `calculator.js`.
  If `git status` shows a wall of changes with symmetric insert/delete counts, that is the cause.
- **PR discipline:** each PR independently reviewable and revertable. Engine work, content work and
  infra work never ride together.
- **Migrations** are applied manually in the Supabase SQL editor (no CLI migration tracking).
  Always run the migration BEFORE deploying code that depends on it.
- `contents/*.md` are the DEPRECATED hand-authored cells. They still feed `scripts/build-content.mjs`
  and the currently-live readings — **do not delete them** until the new pipeline ships.
- Reyner is the **sole authority on Indonesian register**. Propose wording, flag it, never
  auto-decide.

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
