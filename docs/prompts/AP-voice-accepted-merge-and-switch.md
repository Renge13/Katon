# Prompt AP: voice accepted; merge, one check extension, then the switch (Cowork, 2026-09-28)
Untracked in the working tree as `docs/prompts/AP-voice-accepted-merge-and-switch.md`. Commit it with the rulings record in §1.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge.

## Reyner, 2026-09-28, verbatim (after reading the seven round-4d PDFs)
```
All seven docs get green light from me.
```
**Keyed referent:** this is the voice acceptance that B30 made conditional. It covers the seven round-4d readings (chart1, chart4, chart6, chart8, chart13, PZ0t, rVe4ca; g4WH4 excluded). The PZ0t portrait's two false facts are excluded from the acceptance: AN (`c4c1b1f`) and `fact.aspek_pillar` (1.56.0) addressed them, and his read was of voice.

## §1. Record the acceptance (docs, on the branch or with #170)
- Update the voice rulings file STATUS: voice v2 is ACCEPTED by Reyner on 2026-09-28. Quote the block above, and point to `docs/qa/2026-09-28-voice-v2-round4d.md`.
- Update the launch sequence line so its "Reyner's acceptance" step reads as done.
- Quote every changed line.

## §2. Merge #170 (`feat/voice-v2` into main) as a MERGE COMMIT
- Reyner approves this merge by pasting AP.
- Use a merge commit, not a squash (`gh pr merge 170 --merge`), and confirm the merged commit's parents.
- Suite on main after the merge. Production stays on v1: `lib/voice.js:19` is unchanged on main until §4.

## §3. Extend `fact.aspek_pillar`: fire when the claim is false for BOTH people (Cowork's technical ruling)
This is inside Reyner's AN ruling (the Aspek-at-pillar check, and nothing broader).
- **The rule:** on a pair, when a sentence has no subject marker and its "Aspek X … di Pilar Y" claim matches **neither** person's engine placement, it is false whoever it is about. Hard-reject it. When the claim is true for one person and false for the other, keep logging it, because there is no way to know which person is meant.
- **Red first:** the an2 r1 PZ0t literal ("Aspek Pengelola yang menonjol di Pilar Kerja dan Pilar Diri"), extracted by script.
- **Controls:**
  - a no-marker claim true for A only (must log, not reject);
  - chart1's true claims.
- **Replay:** every stored draft, both voices. List every finding that moves; any false positive means stop.
- Own STAGE6 bump. One PR to main, which Reyner pre-approves to merge on green CI (stated in his paste).
- Report how many of the 9 unattributed claims it now rejects.

## §4. The switch: #171
Order matters, so do these in sequence:
1. Retarget #171 to main after §2 and §3 have merged. Rebase it or merge main into it; suite green.
2. **Wait for Reyner to confirm** he has set `VOICE=v2` in Vercel **Production**. While line 19 exists, the variable does nothing, so setting it first is safe.
3. Then merge #171. That deploy is the one that switches production to v2.
4. **First production check.** The Compat half of #171's step 2 cannot run on production today: sales are closed, and an unpaid pair never renders. Say so in the PR. So:
   - Reyner creates one new free Mirror on katon.app and pastes its link.
   - You read that reading's API response (a GET of `/api/mirror/<token>` is not behind BotID) and report the voice and prompt version it was served with, and whether it is floor or render.
   - Compat on v2 is first proven by Reyner's Rp 39.000 launch purchase.
5. **Rollback,** if needed: set `VOICE=v1` in Vercel Production and redeploy.

## Report
Commits, merge parents, red-first proof, replay output, the production check result, and what the customer gets. End with the split.
