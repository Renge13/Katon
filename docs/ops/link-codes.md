# Link codes (`?k=`)

**Reserved: product codes, never use for a post.** The product itself puts these in links it
hands out (Prompt BP, ruled 2026-10-12). A post carrying one would merge its readings into the
product's own count.

| code | where the product uses it |
|---|---|
| `ajak` | the "Bagikan" invite on the free reading (`CHROME_COPY.invite_text`) |
| `kartu` | **unused since 2026-10-12.** It was the caption sent with a shared card; Reyner's second ruling that day removed the caption (the card is saved, with no text). Still reserved: never reuse it for a post. |

**`wa`, `name`, `contact` are usable codes since fcbb0da.** Until then the analytics door
(`assertNoPii` in `lib/analytics/events.js`) matched a blocked key's name as a VALUE too, so
`?k=wa` (`"k":"wa"`) dropped the whole `reading_created` or `pair_created` event. It now matches
keys only (`"<key>":`). Probed 2026-10-15; fixed with the test "the PII door matches KEYS, not
values".

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
| `ig-bio` | 2026-10-15 | Instagram | bio link (whole profile) | https://www.instagram.com/katon.app/ | Standing link, not a post: `https://katon.app/?k=ig-bio`. Counts every visit through the profile, across all posts. Never put it in a post or caption. |
