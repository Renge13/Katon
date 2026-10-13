# Birth hour is not shown to readers - ruled 2026-10-13

**Ruling (Reyner, 2026-10-13):** "Let's take caution and hide the hour on reading and card."
Scope confirmed the same day: all three surfaces that printed it.

Reverses Prompt AU ruling 2 (2026-09-30), which added the hour as the profile line's third
segment, and Prompt AW §2 item 5 / round-1 markup R3, which put it on the two PDF covers.

| Surface | Before | After |
|---|---|---|
| Reading page profile line (`components/Funnel.jsx`) | `LAKI-LAKI \| 13 SEP 1989 \| 09.00` | `LAKI-LAKI \| 13 SEP 1989` |
| Mirror serve payload `profile` (`lib/mirror/view.js`) | carried `birth_time` | no `birth_time`; a shared link does not send it |
| Complete Edition PDF cover (`lib/pdf/document.js`) | `LAKI-LAKI \| 13 SEP 1989 \| 09.00` | `LAKI-LAKI \| 13 SEP 1989` |
| Compat PDF cover (`lib/pdf/pairDocument.js`) | `13 Sep 1989, 09.00, Perempuan` per person | `13 Sep 1989, Perempuan` per person |

**Unchanged, on purpose:**
- Card A and Card B never printed the hour (`lib/card/cardData.js#buildFooter` takes no time).
- The hour PILLAR stays on the chart. The eight characters are the chart (rule 23); the hour
  pillar names a two-hour window, not the hour she typed.
- The input steps still echo what she typed (`birthSummary`, `PasanganSteps`), including
  `jam tidak diisi`. That is her checking her own input before submit, not a reader surface.
- The compat web report never printed the hour (`pairLine`, and its payload carries none).
- The hour is still STORED (`reading.birth_time`, `pair.*_birth_time`): the chart needs it.
