# Deleting somebody's data, by hand

**Adopted 2026-09-08.** Until this date the procedure covered `reading` rows only,
and `/privasi` told the reader to send her READING LINK because *"tautan itulah
satu-satunya cara kami menemukan datamu"*. A Compatibility buyer's data is a
`pair` row found by a different link, and a buyer who came straight to
`/kompatibilitas` has no reading link at all. **This document is what makes
`privasi_second_person` true** - the ruled string promising that person B's birth
data *"akan ikut terhapus jika bacaan dihapus"*.

There is no deletion CODE, for any table. Deletion is a request by email, run by
hand in the Supabase SQL editor, within 14 working days (the commitment in
`SITE_COPY.privasi.rightsHowAfter`).

## 1. Identify what to delete

**Ask for the LINK. Accept the EMAIL as a fallback for a compat purchase.**

| what she sends | what it finds |
|---|---|
| `https://katon.app/r/<token>` | one `reading` row, `id = <token>` |
| `https://katon.app/kompatibilitas/<id>` | one `pair` row, `id = <id>` |
| an email address | every `pair` row with `email = <address>`. **Only pairs** - the mirror stores no email |

An email can match MORE THAN ONE pair. Read them back before deleting, and
confirm with her which readings she means if the count surprises either of you:

```sql
select id, sku, paid, created_at
from public.pair
where email = 'her@address';
```

**A birth date is not an identifier here and must not be used as one.** Two people
born the same day would both match, and the person asking has not proved she is
either of them. The link is a bearer token and the email is a contact she
supplied at checkout; both are evidence, a birth date is not.

## 2. Delete a PAIR

Person B's birth data lives on this row and goes with it. B has no row, no token
and no URL anywhere in the system, so there is nothing else of hers to find.

```sql
-- 2a. read it back first, and keep the cache_key: the next step needs it
select id, email, sku, paid, cache_key from public.pair where id = '<pair id>';

-- 2b. analytics rows are keyed by the same id (recordEvent is called with the
--     pair id at checkout), and they are NOT removed by any cascade
delete from public.funnel_event where reading_id = '<pair id>';

-- 2c. the pair itself, including a_birth_* and b_birth_*
delete from public.pair where id = '<pair id>';

-- 2d. the rendered prose, if the pair had one. `cache_key` is from 2a.
delete from public.render_cache where cache_key = '<cache_key from 2a>';
```

**Step 2d has a caveat and it is not optional reading.** `render_cache` is keyed
on `hash(engine_version + semantic JSON)`, so two different customers with the
same two charts share one row. Deleting it evicts THEIR cached copy too. That is
an eviction and not a loss: the key is deterministic, floors are never persisted
(rule 16), and the next request re-renders and re-caches. Do it anyway - the row
holds the prose about her relationship - and know that it costs somebody else one
Gemini render, not their reading.

**The semantic JSON carries no birth date** (asserted in
`tests/pair-semantic.spec.mjs`, "NO BIRTH DATA REACHES THE SEMANTIC JSON"), so
`render_cache` never held one. 2d is about the prose, not about the birth data.

## 3. Delete a READING

```sql
-- 3a. a pair may REFERENCE this reading, and the FK will refuse the delete
select id from public.pair where a_reading_id = '<reading id>';
```

If that returns rows, decide with her which she means:

- **she wants both gone** - delete each pair with section 2 first, then continue;
- **she wants only the mirror gone** - detach the reference, which keeps the
  compat purchase she paid for working:
  ```sql
  update public.pair set a_reading_id = null where a_reading_id = '<reading id>';
  ```

`a_reading_id` is a provenance reference and nothing is gated on it, so nulling
it costs her nothing.

```sql
-- 3b. read back the cache_key
select id, cache_key from public.reading where id = '<reading id>';

-- 3c. analytics and demand rows
delete from public.funnel_event    where reading_id = '<reading id>';
delete from public.product_interest where reading_id = '<reading id>';

-- 3d. the reading
delete from public.reading where id = '<reading id>';

-- 3e. its prose, same caveat as 2d
delete from public.render_cache where cache_key = '<cache_key from 3b>';
```

## 4. What is NOT deleted, and say so if she asks

- **Payment records at Xendit.** Katon stores `invoice_id` and `invoice_url` on
  the row and deletes them with it, but the transaction itself is Xendit's and is
  kept for bookkeeping. `/privasi` already carves this out: *"kecuali bagian yang
  wajib kami simpan untuk pembukuan"*.
- **`rate_limit`.** Keyed by a hashed session or IP, not by a person, and it
  expires on its own. Nothing in it identifies her.
- **Hosting logs.** The provider's, with their own retention. Disclosed in
  `/privasi`'s `collect` list.

## 5. Record it

Reply confirming what was deleted and when. **No log of deletions is kept in the
database** - a table of "who asked us to delete their data" is a table of exactly
the people who wanted it gone.
