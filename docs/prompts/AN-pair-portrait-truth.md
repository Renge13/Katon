# Prompt AN: two false single-chart claims in a pair reading (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AN-pair-portrait-truth.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. Each check ships alone, is shown red first, and gets its own STAGE6 bump. Red-first literals are extracted by script from the served JSON, never retyped.

## What Cowork found reading round 4d (PZ0t, block "Dirimu sebagai Matahari", served, gate clean)
A is 13 Sep 1989 09.00, pillars 己巳 癸酉 丙子 癸巳 (PZ0t's own PDF chart page), so the month branch is 酉 Ayam, a Metal season. The served text says:
1. **"Kapasitas energimu tergolong Lemah karena kamu lahir di bulan Kuda, yang musimnya berelemen Api …"** False twice: the month is Ayam, not Kuda, and the season is Metal, not Fire. Kuda (午) is **B's** year branch (庚午), so the writer mixed the two charts.
2. **"… Aspek Pengelola-mu yang menonjol di Pilar Kerja dan Pilar Diri …"** A's mirror (chart1, the same birth) places Pengelola at Pilar Kerja only. Pilar Diri carries Pengatur. So "Pilar Diri" looks false. Confirm this against the engine's ten-god placement for A. Do not reason about it from the prose.

Both passed every deterministic check on both voices. "Engine accuracy is non-negotiable" (product-boundary rulings, item 5).

## §1. Report first (no change)
1. Which existing check validates (a) a claimed birth-month or season, and (b) "Aspek X di Pilar Y" against the engine? Quote each, and say which voices and which kinds (mirror or pair) it runs on.
2. What single-chart facts does the v2 PAIR payload hand the writer for A and for B (strength and its provenance, ten-god placement, month branch)? Quote the payload keys. Is anything given without saying whose it is?
3. Count, across all stored pair drafts (all rounds, both voices), the sentences that claim a birth month ("lahir di bulan <Shio>") or an Aspek at a named pillar, and how many are false against the engine for the person they're about. That count prices §2 before it is built (Check 3).

## §2. Cowork's technical ruling: two deterministic hard checks, on both voices, mirror and pair
Build each only if §1 shows it isn't already covered. If §1 shows the cause can be removed instead (for example, the pair payload hands the writer an unlabelled month or placement), report that and stop before building. Removing the cause beats a gate.
1. **Birth-month claim.**
   - "lahir di bulan <Shio>" must name the subject's month branch.
   - "musim(nya) berelemen <E>", or the same claim in other words, must name that month's season element.
   - Subject: "kamu" is A, and the reader on a mirror; "dia" or "pasanganmu" is B. If the subject can't be determined, the check doesn't fire. Log it instead.
2. **Aspek at a named pillar.** "Aspek <X> … di Pilar <Y>" (and lists such as "di Pilar Kerja dan Pilar Diri") must match the engine's placement for that subject. Same subject rule.

- **Red first:** the two PZ0t round-4d sentences above, extracted by script.
- **Controls:** chart1 round 4d, which carries true claims of both kinds ("Aspek Pengelola … di pilar kerja", "Setengah Gabungan antara Pilar Akar, Pilar Kerja, dan Pilar Arah"), must pass.
- **Replay:** every stored draft, both voices. List every finding that moves. Any false positive: stop and report (two-round cap).
- **Then:** re-render the two pairs only (PZ0t, rVe4ca; about $0.008) and quote each block that describes a single chart.

## §3. Stop and report
Do not merge `feat/voice-v2` or touch `lib/voice.js:19`.
