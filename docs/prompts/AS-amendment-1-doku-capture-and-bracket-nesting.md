# Prompt AS, Amendment 1: DOKU notification capture, and our own nested brackets (Cowork, 2026-09-30)
Untracked in the working tree as `docs/prompts/AS-amendment-1-doku-capture-and-bracket-nesting.md`. Commit it with your first change.

Cite the four checks. Two-round cap. No regex through a shell heredoc. No model-based judge.

## §A. DOKU sandbox: capture one real notification (flip gate)
DOKU support (Kezia, 2026-09-29): *"the QRIS Sandbox Notify URL has been successfully configured. You may now proceed with testing the QRIS transaction and notification flow."*

This is what the PROGRESS row "THE NOTIFICATION BODY SHAPE IS UNVERIFIED AGAINST REAL DOKU BYTES" waits for.
1. Run `npm run probe:doku` against sandbox and report the result.
2. On `ops/doku-walk`, walk one sandbox QRIS purchase (Rp 19.000 Mirror) end to end. If a step needs Reyner (the simulator payment, or reading DOKU's Notification Center), stop and ask him. Don't improvise around it.
3. Report:
   - whether the notification reached our notify URL (with log lines);
   - whether `DOKU_CAPTURE` captured it;
   - whether `paid` flipped through the notification rather than through reconcile.
4. If it was captured:
   - commit it as `tests/fixtures/doku-notification.sandbox.json`;
   - re-point the §4 signature tests at it;
   - report whether `order.invoice_number`, `order.amount` and `transaction.status` sit where `lib/doku/notify.js` reads them. If a field moved, stop and report; don't patch around it.
   - Close the row, quoting the evidence.
5. The test row goes on the KNOWN TEST ROWS list.

**Production QRIS:** DOKU's PTEN team now asks for QRIS Name **"Katon"** with MCC 5817. Reyner resubmits that himself. Nothing in code changes.

## §B. The gate's bracket normaliser creates nested brackets (Cowork's technical ruling)
In round 5, r5-05 was SERVED with "(Aspek Penantang (Seven Killings))", "(Tanda Kekosongan (Void))" and "(Aspek Perajin (Eating God))". Reyner rejected the reading for it.

**The cause is ours.** The writer put an Indonesian name inside parentheses with its English in square brackets. `brackets.square_normalised` then turned "[Seven Killings]" into "(Seven Killings)" *inside the open parenthesis* (see the r5-05 record, `findings_logged`). 1.51.0 guards archetype insertion against nesting. This path has no such guard.

- **The rule:** post-processing may never produce a bracket inside a bracket. When a square bracket being normalised sits inside an open parenthesis, remove it with its content; don't convert it. Apply the same guard to every other place the gate inserts or converts a bracket. List each place and say whether it was already guarded.
- **Red first:** r5-05's served text, extracted by script, reproduces the three nested brackets today and none after.
- **Controls:** a bare "Aspek Penantang [Seven Killings]" still becomes "Aspek Penantang (Seven Killings)", and 1.51.0's archetype cases are unchanged.
- **Replay:** every stored draft, both voices, plus the round-5 records. List every served text that changes.
- **Also report:** can any served v2 text still contain a nested bracket after this? Grep every stored served row. If one can, the next step is to make nesting HARD on v2, but not in this amendment.
- Own STAGE6 bump, shipped isolated from AS §3. One PR to main. Not pre-approved: report and wait.

## Report
Per section: commits, red-first proof, replay output, and the §A evidence. End with the split.
