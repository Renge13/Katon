#!/usr/bin/env node
// ============================================================
// scripts/check-copy.js — em-dash guard for Indonesian copy
// ============================================================
// The em-dash (—, U+2014) is the user-flagged #1 AI tell in
// Indonesian copy. This script imports every copy bank and walks
// all string values, failing the build if any em-dash is found.
//
// Only checks STRING VALUES inside the exported objects — not
// file source — so English code comments using em-dashes don't
// trigger false positives.
//
// Usage: npm run check:copy
// ============================================================

// Paths are repo-root-relative `lib/`. They read `src/lib/` until 2026-08-02:
// `src/` was the Vite reference app, deleted in f99deaa, and this script was
// never repointed, so `npm run check:copy` had been failing ERR_MODULE_NOT_FOUND
// on a clean tree ever since. The modules themselves all moved to `lib/`.
import { DAY_MASTERS }                            from '../lib/bazi/interpretation/dayMasters.js'
import { DAY_BRANCHES }                           from '../lib/bazi/interpretation/dayBranches.js'
import { DOMINANT_ELEMENT, MISSING_ELEMENT }      from '../lib/bazi/interpretation/elementImpact.js'
import { PAID_HOOK_TEMPLATE }                     from '../lib/bazi/interpretation/paidHooks.js'
import { PILLAR_STEM_MEANINGS }                   from '../lib/bazi/interpretation/pillarMeanings.js'

// Report passage banks (Phase 4)
import REPORT_PEMBUKAAN              from '../lib/bazi/report/passages/pembukaan.js'
import REPORT_CARA_KAMU_HADIR        from '../lib/bazi/report/passages/caraKamuHadir.js'
import REPORT_POLA_DI_PEKERJAAN      from '../lib/bazi/report/passages/polaDiPekerjaan.js'
import REPORT_POLA_DI_HUBUNGAN       from '../lib/bazi/report/passages/polaDiHubungan.js'
import REPORT_POLA_DI_TUBUH          from '../lib/bazi/report/passages/polaDiTubuh.js'
import REPORT_HUBUNGAN_DENGAN_REZEKI from '../lib/bazi/report/passages/hubunganDenganRezeki.js'
import REPORT_PENUTUP                from '../lib/bazi/report/passages/penutup.js'
import { PROMPTS as REPORT_PROMPTS } from '../lib/bazi/report/prompts.js'

// Stage 5 chrome (rule 20: one voice everywhere, INCLUDING chrome).
import { RENDER_COPY } from '../lib/render/copy.js'

// Site chrome + static pages (footer, /harga, /tentang, /privasi, /syarat,
// /pengembalian). Added 2026-08-03 with the Xendit merchant-compliance pages:
// legal prose is the longest body of user-facing copy in the repo and is exactly
// where a pasted em-dash or a smart quote survives review. Grepping the diff
// catches it once; walking the bank catches it forever.
import { SITE_COPY } from '../lib/site/copy.js'
import { ENTITY } from '../lib/site/entity.js'

// Rule 20 bans typographic characters in user-facing strings, keyboard keys only.
// The em-dash is the #1 AI tell and was the original reason for this script, but
// it was never the whole rule: the ONE real rule-20 violation ever found in this
// repo was CURLY QUOTES at components/Funnel.jsx:731 (fixed in 75f1901), which
// this checker would have missed. Widened 2026-08-02 to the full set.
const BANNED = [
  ['em-dash',       '—'],
  ['en-dash',       '–'],
  ['curly quote',   '‘'],
  ['curly quote',   '’'],
  ['curly quote',   '“'],
  ['curly quote',   '”'],
  ['ellipsis char', '…'],
]
const issues = []

function walk(node, path) {
  if (typeof node === 'string') {
    for (const [name, char] of BANNED) {
      if (node.includes(char)) issues.push({ path, value: node, name, char })
    }
    return
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`))
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      walk(v, `${path}.${k}`)
    }
  }
}

walk(DAY_MASTERS,           'DAY_MASTERS')
walk(DAY_BRANCHES,          'DAY_BRANCHES')
walk(DOMINANT_ELEMENT,      'DOMINANT_ELEMENT')
walk(MISSING_ELEMENT,       'MISSING_ELEMENT')
walk(PAID_HOOK_TEMPLATE,    'PAID_HOOK_TEMPLATE')
walk(PILLAR_STEM_MEANINGS,  'PILLAR_STEM_MEANINGS')

// Report passages + prompts (Phase 4 onward)
walk(REPORT_PEMBUKAAN,              'REPORT.pembukaan')
walk(REPORT_CARA_KAMU_HADIR,        'REPORT.caraKamuHadir')
walk(REPORT_POLA_DI_PEKERJAAN,      'REPORT.polaDiPekerjaan')
walk(REPORT_POLA_DI_HUBUNGAN,       'REPORT.polaDiHubungan')
walk(REPORT_POLA_DI_TUBUH,          'REPORT.polaDiTubuh')
walk(REPORT_HUBUNGAN_DENGAN_REZEKI, 'REPORT.hubunganDenganRezeki')
walk(REPORT_PENUTUP,                'REPORT.penutup')
walk(REPORT_PROMPTS,                'REPORT.PROMPTS')

// Stage 5 chrome. The loading string is user-facing and rule 20 covers chrome.
walk(RENDER_COPY,                   'RENDER_COPY')

// Site chrome + the five static pages. ENTITY is walked too: the registered name
// and address are rendered to the user, so a typographic character pasted from
// the NIB PDF would ship.
walk(SITE_COPY,                     'SITE_COPY')
walk(ENTITY,                        'ENTITY')

if (issues.length > 0) {
  console.error(`✗ Found banned typography in ${issues.length} copy string(s):\n`)
  for (const issue of issues) {
    console.error(`  ${issue.path} — ${issue.name} (${issue.char})`)
    console.error(`    "${issue.value}"\n`)
  }
  console.error(`Rule 20: keyboard characters only. Use a hyphen, comma, period or straight quote.`)
  process.exit(1)
}

console.log(`✓ No banned typography in copy banks. Checked: DAY_MASTERS, DAY_BRANCHES, DOMINANT_ELEMENT, MISSING_ELEMENT, PAID_HOOK_TEMPLATE, PILLAR_STEM_MEANINGS, 7 REPORT passage banks, REPORT.PROMPTS, RENDER_COPY, SITE_COPY, ENTITY.`)
