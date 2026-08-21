# The PDF's fonts

## `noto-serif-tc-han.ttf`

**Generated. Do not edit.** Regenerate with `npm run build:han-ttf`.

Noto Serif TC, subsetted to the 65 hanzi the product can draw. The glyph set is read
from `lib/card/hanFont.js` (`HAN_GLYPHS`), which `npm run build:han-subset` derives
from `docs/content/glossary.json` plus the ten stems, the twelve branches and both
characters of 胎元 - so the card's woff2 and this TTF cover the same characters by
construction rather than by two lists agreeing.

**Why a second format at all:** `@react-pdf/renderer` takes TTF and cannot read woff2.

**Why one file:** the card's woff2 is two `@font-face` rules and a browser picks
between them by `unicode-range`. react-pdf has no such concept, so a split subset
would render tofu for whatever landed in the second file. The build throws rather than
writing a split or short subset, and `npm run test:pdf-han-font` re-checks the
committed file offline.

**LICENSE: SIL Open Font License 1.1** - https://openfontlicense.org
Redistribution of a subset is permitted. Noto Serif TC is a Google Fonts release.
