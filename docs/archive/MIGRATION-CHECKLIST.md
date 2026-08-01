# Katon — Migration Checklist (clear the whole backlog in one pass)

Goal: project files = single source of truth again, current as of THIS session. Order = most
governing first. Check each off as it lands. "this session" = supersedes any earlier copy.

## TIER 1 — CANON (governs every reading; a stale copy here corrupts the batch)
These must be THIS SESSION's versions. If you migrated last session's, re-overwrite with this session's.

- [ ] `bazi-interpreter-skill-v5.md` — THIS SESSION (baku §8, label string "Yang Menenangkan/Melelahkan",
      §3 modifier-image rule, §9 gold standard = Matahari, §10 paid-keyed-by-state). **Re-overwrite.**
- [ ] `bazi-card-skill-v4.md` — THIS SESSION (Talenta zone CUT, zones renumbered 0-5, modifier-image
      rule, baku rule 5). **Re-overwrite** (last session's copy predates the Talenta cut).
- [ ] `bazi-states-and-compatibility-v4.md` — THIS SESSION (label string updated). Re-overwrite.
- [ ] `MEMORY.md` — THIS SESSION (decision #4 = baku, supersedes casual). Re-overwrite.
- [ ] `MEMORY-v4-addendum.md` — THIS SESSION (label + voice note updated). Re-overwrite.
- [ ] `SPEC-v5-addendum.md` — from LAST SESSION (§11/§12/§13). **VERIFY it contains §11-§13 before
      trusting** — it was "pending migration", may be an older copy on disk. Highest-priority gap.

## TIER 2 — REFERENCE TABLES (the batch-write phase can't run without these)
- [ ] `DRIVER-MATRIX-50.md` — last session. The driver per cell. Worksheet depends on it.
- [ ] `feed-drain-lookup-20-cells.md` — THIS SESSION, NEW. Derived + cross-checked. Per-cell feed/drain.
- [ ] `katon-modifier-set-20-cells.md` — THIS SESSION, NEW. The 20 state-image names (DRAFT — founder-validate).
- [ ] `batch-write-worksheet.md` — THIS SESSION, NEW. The grind protocol + INPUTS template + QA gate.
- [ ] `MVP-SCOPE-impact-effort.md` — last session. The locked 20-core launch plan.

## TIER 3 — CONTENT (the pilot + the proven template)
- [ ] `matahari-balanced-hubungan-FINAL.md` — THIS SESSION (serba konsisten fix, feed/drain line on card,
      leak cut). The gold-standard reading. Re-overwrite if an older copy is present.
- [ ] `katon-reading-matahari-balanced-hubungan.html` — THIS SESSION, NEW. The built funnel mockup
      (Teduh modifier). Layout/copy reference, NOT production.
- [ ] `pedang-balanced-hubungan-PORTED.js` — THIS SESSION, NEW. First port into template shape;
      still needs helper prose pass (tags inside). Keep as work-in-progress, not final.

## TIER 4 — OPERATIONAL (keep, not canon)
- [ ] `SCHEMA-SPIKE-prompt.md` — THIS SESSION (corrected: Balanced-only, uang not rezeki, modifier
      required). The agent already built from it; keep as record.
- [ ] `PRELAUNCH-security-checklist.md` — last session. Has the fail-closed launch item.
- [ ] `SESSION-HANDOFF-2.md` — last session. Superseded by a fresh handoff at this session's end.
- [ ] `katon-card-v5-matahari.html` — last session. Card visual reference. Optional.
- [ ] `katon-governed-matahari-hubungan.html` — last session. Confounded craft exercise; only Governed
      example. Optional, low priority.

## DELETE / DO-NOT-MIGRATE
- [ ] QA-markup scratch (`matahari-balanced-hubungan-QA-markup`) — scratch, references the RETIRED
      casual voice. Do NOT add; delete if present.
- [ ] Old gold-standard reference `katon-balanced-pedang-karier.html` — NOT deleted, but DEMOTED to
      beat-structure-only (voice retired). If kept, label it so no one calibrates voice against it.

## POST-MIGRATION VERIFY (2-min sanity checks)
- [ ] Open SPEC-v5-addendum.md → confirm §11, §12, §13 headings exist.
- [ ] Grep canon for "BIKIN" / "Bikin Tenang" → should appear ONLY in changelog notes, never as a live label.
- [ ] Grep canon for "rezeki" → should be ZERO in card-skill/interpreter (uang only). Legacy
      lib/bazi/* code still has rezeki — that's the separate 4b code-cleanup, not a doc migration.
- [ ] interpreter §9 gold standard → points at matahari-balanced-hubungan, NOT pedang-karier.
- [ ] Confirm the 3 you just added (SPEC/DRIVER-MATRIX/MVP-SCOPE) show in the file list.

## NON-FILE ACTIONS (don't forget — not migrations but pending)
- [ ] Resume the paused Supabase project (resets inactivity clock; avoids deletion drift).
- [ ] Run `0002_state_and_interest.sql` BEFORE any deploy (reading creation fails without `state` column).
- [ ] Port SPEC §7 asymmetric thresholds into the LIVE calculator (state-assignment in app logic,
      calculator skill stays pure math). The spike implemented resolveState; confirm it matches §7.
- [ ] 4b code-cleanup (later): legacy lib/bazi/interpretation/* + report/* still ref old fields + rezeki.
