// ============================================================
// tests/page-analytics.spec.mjs — page views never carry a reading token
// ============================================================
// Run: npm run test:page-analytics
//
// Prompt BG §2.4 (2026-10-06): Vercel Web Analytics page views. `/r/<token>` and
// `/kompatibilitas/<id>` are bearer links (rule 19), so the id never leaves the browser
// in an analytics event. Each "redacted" case is paired with a page that keeps its path,
// so a function that blanked every URL could not pass.
// ============================================================

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

import { analyticsUrl } from '../lib/site/analyticsUrl.js';

const src = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ORIGIN = 'https://www.katon.app';

test('BG §2.4: a reading or pair URL is reported without its id or query', () => {
  const cases = [
    ['/r/WqocaFz1FTMYqLPRBrtnl', '/r/[token]', 'WqocaFz1FTMYqLPRBrtnl'],
    ['/r/WqocaFz1FTMYqLPRBrtnl?bayar=selesai', '/r/[token]', 'WqocaFz1FTMYqLPRBrtnl'],
    ['/kompatibilitas/PZ0tAbCdEf?bayar=selesai#mulai', '/kompatibilitas/[id]', 'PZ0tAbCdEf'],
  ];
  for (const [path, want, id] of cases) {
    const out = analyticsUrl(`${ORIGIN}${path}`);
    assert.equal(out, `${ORIGIN}${want}`, path);
    assert.ok(!out.includes(id), `${path}: the id must not leave the browser`);
  }
});

test('BG §2.4: every other page keeps its path (the control), and loses only its query', () => {
  assert.equal(analyticsUrl(`${ORIGIN}/`), `${ORIGIN}/`);
  assert.equal(analyticsUrl(`${ORIGIN}/?jam=tambah`), `${ORIGIN}/`);
  assert.equal(analyticsUrl(`${ORIGIN}/harga`), `${ORIGIN}/harga`);
  assert.equal(analyticsUrl(`${ORIGIN}/kompatibilitas`), `${ORIGIN}/kompatibilitas`, 'the compat form itself is not a pair');
  assert.equal(analyticsUrl(`${ORIGIN}/privasi`), `${ORIGIN}/privasi`);
});

test('BG §2.4: the layout mounts PageAnalytics, and it sends every event through analyticsUrl', () => {
  const layout = src('app/layout.js');
  assert.match(layout, /import PageAnalytics from '@\/components\/PageAnalytics\.jsx'/u);
  assert.match(layout, /<PageAnalytics \/>/u);
  const comp = src('components/PageAnalytics.jsx');
  assert.match(comp, /from '@vercel\/analytics\/next'/u);
  assert.match(comp, /<Analytics beforeSend=\{beforeSend\} \/>/u, 'the component passes the redaction to Analytics');
  assert.match(comp, /url: analyticsUrl\(event\.url\)/u);
});
