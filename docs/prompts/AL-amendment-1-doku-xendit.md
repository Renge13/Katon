# Prompt AL, amendment 1: DOKU and Xendit replies of 2026-09-28 (Cowork)
Untracked in the working tree as `docs/prompts/AL-amendment-1-doku-xendit.md`. Do this AFTER AL is reported. Commit it with the docs change below.

## What the vendors said (2026-09-28, from Reyner's inbox)
**DOKU (Kezia, ticket 1149053, 14:18 WIB):**
1. **QRIS rejection.** To coordinate with PTEN on the MCC and name correlation, DOKU asks for a business photo "as proof of your business activity" and a social media account or link.
2. **Why notifications never arrived:** "if you are using the DOKU Checkout API, the integration is currently using the non-SNAP format. Meanwhile, the BCA Virtual Account configuration page on your merchant account is using the SNAP version." For BCA VA non-SNAP, the notify URL is set at **Settings → Virtual Account → BCA VA Configuration → select the configuration with NON-SNAP status**.
3. **For QRIS, DOKU will set the notify URL from their side.** They ask for the QRIS notify URL and the sandbox Client ID.

**Xendit (Lily, ticket 2730746, 13:50 WIB):** the deletion request is acknowledged and "expect the account deletion to be completed by October 18, 2026."

## Work (report only, except the docs record)
1. **Record** the above in `docs/ops/doku-walk.md`: DOKU's explanation for the zero notifications in the 09-21 VA walks (the Checkout is non-SNAP, the VA config is SNAP), and that DOKU configures the QRIS notify URL itself. Update the PROGRESS Xendit row with the 18 October date. One docs PR, every line quoted. Reyner pre-approves it on green CI.
2. **The sandbox URL we give DOKU.** The last known value is `https://katon-git-feat-doku-checkout-renge13s-projects.vercel.app/api/doku/notify`. That alias serves the last deploy of `feat/doku-checkout`.
   - Confirm it serves main's current notify and settle code.
   - If it doesn't, give a Preview URL that does, with sandbox env vars on Preview scope, and state the exact URL.
   - Show that an unsigned POST gets 401 and a correctly signed one settles (a hand-signed test, as on 09-21).
3. **Production host.** Does `https://katon.app/api/doku/notify` answer a POST directly, or redirect to `www`? A redirect can drop a server-to-server POST. State the URL that answers 2xx or 401 with no redirect, for when DOKU asks for production.
4. **Report only:** does anything in our Checkout request pick the SNAP or non-SNAP notification format? Quote DOKU's docs if they say how a Checkout QRIS notification is shaped. Our verifier expects the Checkout (non-SNAP) signature headers.
