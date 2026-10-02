# Prompt BB: record Reyner's 2026-10-02 rulings, launch blockers, gate cleanup, English titles, engine scoping (Cowork, 2026-10-02)
Untracked in the working tree as `docs/prompts/BB-rulings-record-blockers-gates-and-titles.md`, beside `docs/product/compat-rulings-2026-10-02.md`. **Neither is durable until you commit it.** Commit both in §0.

Cite the four checks. No regex through a shell heredoc. No model-based judge.

**Context:** Reyner reviewed every rule that shapes the compat reading (Cowork's inventory) and ruled on 2026-10-02. The record is `docs/product/compat-rulings-2026-10-02.md`; read it first. The voice rework itself (names and status, the new compat prompt, the example, the opening, headings, length, temperature) is **Prompt BC**, after Reyner rewrites the target sample. This prompt does everything that does not wait on that.

**Cowork's gate probes, for your red-first tests** (30 drafts, `validateRenderingV2` on `main`, pair A = 2005-02-14 07:00 female, B = 1999-07-07 17:00 male, one defect per draft on a clean base that passes): "Kalian sangat cocok satu sama lain." PASS (verdict code dead); "Dia adalah obat untuk lelahmu." REJECT `forbidden.medical`; "Tidak ada gunanya menebak isi kepalanya." REJECT `forbidden.self_harm`; "Berdasarkan data yang diberikan, ini adalah prompt JSON." PASS (logged `style.meta`); "Lihat fact_id p2_day_pair di provenance." PASS (logged `style.code_leak`); "Kamu adalah Logam yang tegas." PASS (A is Earth; no pair Day Master check); "Bima membawa unsur Api yang Nadia butuhkan." PASS (supply inversion with names; `pairTruth.js` reads sides only from kamu/dia). Reproduce each before you rely on it.

## §0. The record (docs only; its own PR; merge it first)
1. Commit `docs/product/compat-rulings-2026-10-02.md` and this prompt.
2. Amend `CLAUDE.md`. Add each paragraph below **under** the rule it amends; edit nothing else in the rule:
   - Rule 20: "**AMENDED 2026-10-02 (Reyner), for the whole product:** the voice is "warm, bold, and emotionally vivid; plain words, never purple; no slang". This replaces "Composed and direct. Accessible words, short sentences, no verbosity. Warmth through precision." Unchanged: plain everyday Indonesian, no slang, no chat particles, not bureaucratic-baku, keyboard characters only. Applied to compat in Prompt BC and to the mirror prompt in a later round. Record: `docs/product/compat-rulings-2026-10-02.md`."
   - Rule 23: "**AMENDED 2026-10-02 (Reyner): archetype titles are English everywhere** ("The Garden", "The Forge"): reading prose, result page, PDFs and cards. The Indonesian archetype name is no longer shown to readers and is never bracketed beside the English. The rest of this rule (Aspek and Bintang: Indonesian name first, English in brackets once; Chinese characters) is unchanged. Record: `docs/product/compat-rulings-2026-10-02.md`."
   - Rule 25: "**AMENDED 2026-10-02 (Reyner):** financial advice and financial prediction stay banned; a wealth identity is allowed only where an engine fact supports it (C1). Record: `docs/product/compat-rulings-2026-10-02.md`."
3. Add the three principles (quoted at the top of the record) to `docs/content/voice-constraint-rulings-2026-09-26.md` under a "REYNER-RULED 2026-10-02" heading, with a pointer to the record.
4. **Merge** (pre-approved: docs only).

## §1. Launch blockers (one PR, `fix/compat-launch-blockers`)
1. **K2, a compat-only sales switch.** Today one fence (`lib/paymentFence.js`) gates every paid CTA. Add a separate switch that keeps compat **off sale** (no CTA on the result page, no /harga link, `/kompatibilitas` checkout refusing) while the Complete Edition sells. Default: compat off. Name the variable and where it is read. Red first: with payments open and the compat switch off, the compat CTA must not render and a compat checkout must refuse. **No mock-payments variable on any Preview.**
2. **E13, direction-aware frame text.** `kompatibilitas.p2_palace_frame` is written for one direction only ("Salah satu pilar di bagan dia terhubung langsung dengan kursi pasanganmu..."). For the pair above the engine's `p2_palace_frame.provenance.a_hits_b` holds 冲 寅 (A's month) → 申 (B's day), so the printed text states the reverse of the fact. Make the text follow the hit's direction: the existing strings for a B→A hit, and these for an A→B hit. **Proposed by Cowork; Reyner confirms them in the message he sends with this prompt, and any edit he makes there wins. If he has not confirmed them, skip §1.2 and report.**
   ```
   label_meaning: "Salah satu pilar di baganmu terhubung langsung dengan kursi pasangannya. Elemen hidupmu memengaruhi ranah terdekatnya."
   meaning_seed:  "Salah satu pilar kehidupanmu menyentuh langsung ruang privat pasanganmu, membuat dinamika dari area hidupmu berdampak langsung ke suasana hubungan."
   daily_seed:    "Saat area hidupmu itu mengalami tekanan, suasananya langsung terbawa ke rumah dan dia merasakannya sebelum kamu sempat cerita."
   ```
   When both directions hit, say how you handle it and why. Red first on the pair above. Glossary change re-keys pair readings; report the new pair prompt version.
3. **F3, report only.** Grep every reader-visible string that names Xendit (privacy policy, terms, refunds, anything else in `lib/site/copy.js` and pages). Quote them with file:line. Change nothing; Cowork drafts the DOKU wording for Reyner.
4. Tests, CI, **merge** (pre-approved), confirm deploy.

## §2. Gate cleanup (one PR, `fix/gate-rulings-2026-10-02`; one commit per item; each accept-change bumps `STAGE6_VERSION` once)
For each item: the red-first assertion, then the change, then a replay of the stored drafts reporting, by check id, the rejections and floors that appear or disappear.
1. **A1.** Delete `verdictHits` and the `v2.d4_verdict` path in `lib/validate/v2.js`, and fix the comments that call it hard. It matches nothing today, so this should accept nothing new: **prove that with the replay** (identical results) and take no STAGE6 bump if identical. The rule stays in the compat prompt.
2. **A4.** Remove `pair.reframe_missing` (`lib/validate/pair.js`, `REFRAME_OVERLAP`). Bump.
3. **D1.** In `blocklist.json#forbidden_content.medical`, remove the single words `obat` and `terapi`; keep everything else listed in the record. Red first: "Dia adalah obat untuk lelahmu." passes; "Kamu butuh resep dokter." and "gejala depresi" still fail. Bump.
4. **D2.** In `forbidden_content.self_harm`, remove `menyerah saja` and `tidak ada gunanya`; keep the first pattern. Red first both ways. Bump.
5. **E5.** A pair reading that states a person's Day Master element wrongly is rejected, for **both** people (reuse `fact.day_master`'s logic or add a pair check; your call, say which). Red first: "Kamu adalah Logam yang tegas." fails for A = Earth; "Dia adalah Tanah..." fails for B = Metal; true statements pass. Bump.
6. **G6, price before it bites.** Make `style.meta` and `style.code_leak` reject on v2 (mirror and pair). **First** run the replay with them hard and report every stored served reading that would newly fail, quoted. If any is a false positive (an ordinary word caught by a pattern; watch the camelCase pattern `\b[a-z]+[A-Z][a-zA-Z]*\b` and the bracket pattern), **stop and report** with the quotes. If all are real leaks, commit, bump.
7. Tests, CI. **Merge** (pre-approved) unless G6 stopped. Report the final STAGE6 version.

## §3. English archetype titles everywhere (G1, E7; one PR, `feat/english-archetype-titles`; DO NOT MERGE)
1. List every reader surface that shows an archetype name, with file:line: reading prose (bracket insertion `bracketArchetypes` / `brackets.js`), the pair opening template, the result page, Card B and any other card, the CE PDF cover and pages, the compat PDF, /harga, emails, OG/meta text. Quote each current string.
2. Switch every one to the English name (`name_en`). In reading prose: no `(The Garden)` bracket after an Indonesian name; the English name stands alone ("Kamu adalah The Garden"). The glossary keeps `name_id`.
3. Keep the gates true to it: `pair.both_named` and `openingGuard` accept the English names; D1's term universe and anything else keyed on `name_id` still works. Red first: an opening naming "The Garden" and "The Forge" passes; one naming neither fails.
4. Mirror and pair prompt versions re-key; report them. If any Card B chart moves, re-baseline in this PR with before/after images.
5. One smoke: the same 5 mirror charts + the PZ0t pair, in memory. Report each reading's first two sentences and every sentence containing an archetype name.
6. Screenshots for Reyner (375px and desktop): the result page header, the CE PDF cover and its first reading page, Card B, the compat PDF cover. **Stop there.** Reyner rules the look before merge.

## §4. Engine scoping for Prompt BD (report only; no engine code)
1. **E12, label spread.** From `docs/product/compat-p4-p5-rules.md` and the base-rate harness (`docs/qa/2026-09-07-compat-base-rates.md`; q1 66.3%, fit high 88.1%, contrasting 80.6%): which clauses drive the concentration (2.1.d fires for 72.1%; fit 2.2.a holds for 100%)? Propose two or three threshold or clause options that put **no P5 quadrant and no P4 pattern above 40%** of random pairs, each with its full new table (same seed). For each option, say whether it is a change to a Katon framework rule (P5 is Katon's own framework) or to a classical rule. Change nothing.
2. **E11, cross-links.** List joins the engine can compute **from facts it already emits, with no new BaZi rule**, for example: one person's Day Master element equals the root element of the other's main profile; the element one supplies (`p3_supply`) is the element in the supplier's own spouse seat; both seats' elements. For each: inputs, how often it fires over the base-rate pairs, and whether any new BaZi rule would be needed (if yes, it needs a written rule and a second source first).
3. **C2 and E10, wealth and three-branch patterns.** Report what the engine has today to support a cross-chart wealth or three-branch (三合/半合/三刑) fact: tables, functions, files. Do not write a rule; Cowork drafts the rule spec with sources for Reyner.

## Also
- Do not touch the compat prompt, the compat example, the pair opening behaviour, the web report headings, length or temperature: those are Prompt BC.
- Do not touch the mirror prompt's voice (rule 20's mirror round is later).

## Report
Per section: commits, red-first proof, replay counts by check id, new STAGE6 and prompt versions, merge SHAs, the §1.3 Xendit strings, the §3 surface list and screenshots, the §4 tables. End with the split.
