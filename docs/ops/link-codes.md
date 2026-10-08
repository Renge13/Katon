# Link codes (`?k=`)

The ledger of tracked links. Reyner fills it by hand, one row per code, when the post goes up.
Prompt BM, 2026-10-08. What the code does in the product: `lib/site/linkSource.js`. Where it is
read: `docs/ops/funnel.sql` (query 2) and `docs/ops/compat-funnel.sql`.

## The code rules

- Add `?k=<code>` to any katon.app URL: `https://katon.app/?k=th-arch1`,
  `https://katon.app/kompatibilitas?k=ig1`.
- **Valid code:** lowercase letters, digits and hyphens; starts with a letter or digit; 1 to 24
  characters (`^[a-z0-9][a-z0-9-]{0,23}$`).
- **No date in a code.** A `NNNN-NN-NN` run anywhere (`th-2026-10-08`) is refused. The analytics
  door treats a date as birth data and would drop the whole event, so the code is stored as empty
  instead. Put the date in the `date posted` column, not in the code.
- **Anything invalid is stored as no code** (`(none)` in the SQL), never as a wrong one. `TH`,
  `th arch`, `th_1` and a 25-character code all count as no code.
- **First touch per browser tab.** The first page a reader opens in a tab decides the source. A
  second tracked link opened later in the same tab does not replace it.
- The code is **removed from the address bar** right after it is read, so a reader who copies the
  URL into WhatsApp shares a clean link. That visit is credited by its referrer instead.
- A visit with no code is credited to `ref:<referrer host>` (e.g. `ref:l.threads.com`), or
  `(none)` when the browser sent no referrer.
- One code per post, so each post can be read on its own. Never reuse a code for a different post.

## The ledger

| code | date posted | channel | angle | post URL | notes |
|---|---|---|---|---|---|
