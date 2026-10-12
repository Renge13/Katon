# Prompt BP: invite link + card share text + traction ruling (Reyner approved 2026-10-12)
Goes in the working tree as `docs/prompts/BP-invite-and-card-link.md`. Untracked until you commit it: commit it in this PR.

**Self-contained: you may be a fresh Code session.** Read `CLAUDE.md`. Work in your own worktree. Branch `feat/invite-link` off `origin/main` (must contain #214, `16b5157`). Report the open-PR list first. Prompt BO (favicon + hosting ruling) may be open or just merged: if its PR is open, branch after it merges, or expect a `docs/PROGRESS.md` conflict and keep both lines. Leave the main checkout (on `chore/emil-skills-motion`) alone.

Cite the four checks. No regex through a shell heredoc. No model-based judge. Red first. No engine, glossary, writer-prompt, PDF or Stage 6 change. **Do not merge.**

## Why
The free reading ends with "Bagikan kartumu", which shares the card IMAGE only (`components/cards/exportCards.js:339` is called with no `text`, `components/Funnel.jsx` ~1516 and ~1528), so a shared card carries no tappable link and no attribution. There is no way to send a friend a link to their own free reading. Funnel read 2026-10-08: 8 readings; Vercel Analytics 5-12 Oct: 38 visitors. Volume is the constraint; every reader should be able to bring the next one.

## Ruled (Reyner 2026-10-12), strings verbatim
Cowork swept all three 2026-10-12: 0 hits on the 18 live blocklist patterns (gate compile `entry.flags || 'iu'`; controls fired: financial 2, code_leak 1); the only rule-20 flag is the `?` inside the URL, which is not prose.
- Invite button label: `Kirim tautan ke teman`
- Invite share text: `Aku baru membaca pola diriku di Katon. Coba lihat pola dirimu, gratis: https://katon.app/?k=ajak`
- Card share text: `Kartu pola diriku dari Katon. Lihat punyamu di https://katon.app/?k=kartu`
Put all three in the copy bank (`CHROME_COPY`, next to the share-card strings), not inline in JSX. Build the URL from the site's base-URL helper if one exists (`lib/site/baseUrl.js`), so the string's link is always the production origin.

## Build
1. **Invite button** in the "Bagikan kartumu" section, directly under the card's share control. Secondary style (not the clay primary; the page keeps one primary action per section). On tap:
   - if `navigator.share` exists: `navigator.share({ text: <invite text> })`; on success fire the new client event `invite_shared` with `{ via: 'share' }`; on `AbortError` fire nothing.
   - else: copy the invite text to the clipboard and show the EXISTING string `CHROME_COPY.copy_link_done` ("Tautan tersalin") on the button for ~2 s, then fire `invite_shared` with `{ via: 'copy' }`. No new string for this state.
2. **Card share text:** pass `text: <card share text>` to `shareOrSave` at both call sites. The save-to-device fallback is unchanged (a saved image cannot carry text; that is accepted).
3. **Event:** add `invite_shared` to `FUNNEL_EVENTS` (`lib/analytics/events.js`) and to `CLIENT_EVENTS` (`lib/mirror/handlers.js`), keyed by the mirror reading id, with a header note like the compat CTA events. Detail carries only `via`. Never a birth date.
4. **Codes:** `ajak` and `kartu` are product codes, not post codes. Add them to the top of `docs/ops/link-codes.md` as "reserved: product codes, never use for a post". `funnel.sql` query 2 already groups by `k`, so readings from invites and card shares appear without SQL changes; add one line to its header saying so.
5. **Ruling records, own commit:** under the INTERIM REGISTER row "KATON RUNS A COMMERCIAL PRODUCT ON A NON-COMMERCIAL PLAN" in `docs/PROGRESS.md`, after BO's 2026-10-12 line:
   `RULED 2026-10-12 (Reyner): "traction" = the first calendar month with 20 paid purchases (known test rows excluded). When it is reached, move hosting. A paid ad alone does not trigger the move. Destination to be re-decided then (Prompt U is stale).`
   And in PROGRESS, wherever Vercel Web Analytics is recorded (BG §2.4 / funnel instrumentation): `Vercel Web Analytics is ENABLED on the project (Reyner, confirmed 2026-10-12; data from 2026-10-07).`
   Record the three ruled strings where share-card copy rulings live (find the record for the "Bagikan kartumu" eyebrow/lead, approved 2026-08-23); if none, a dated line in PROGRESS.

## Validation and report
Red first, shown failing on `main`:
- the Bagikan section renders a button with the exact label; tapping it calls `navigator.share` with the exact invite text; `invite_shared` fires on resolve and NOT on `AbortError`;
- without `navigator.share`, the clipboard receives the exact text, the button shows "Tautan tersalin", and the event fires with `via: 'copy'`;
- both card-share call sites pass the exact card text to `navigator.share`;
- the server rejects nothing new: `POST` of `invite_shared` to the client-event route is accepted, an unknown event still 400s.
Screenshots at 375px and 1280px of the Bagikan section (local build, in-memory stores, no shared-DB rows). `npm test`, `npm run check:qa`, `check:copy`, CI green. PR link and preview URL. **Do not merge.**
