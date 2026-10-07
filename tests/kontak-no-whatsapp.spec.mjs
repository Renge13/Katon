// ============================================================
// tests/kontak-no-whatsapp.spec.mjs — /tentang#kontak shows no WhatsApp number
// ============================================================
// Run: npm run test:kontak-no-whatsapp
//
// Prompt BD1 §5 (Reyner, 2026-10-07): the WhatsApp number comes off /tentang#kontak.
// Email and "Alamat terdaftar" stay, in that order. Asserted on the RENDERED page
// (scripts/alias-register.mjs resolves its `@/` imports), not on the copy object,
// and each absence is paired with a presence so a blank render cannot pass.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import TentangPage from '../app/tentang/page.js';
import { SITE_COPY } from '../lib/site/copy.js';
import { ENTITY } from '../lib/site/entity.js';

const html = renderToStaticMarkup(React.createElement(TentangPage));
const kontak = html.slice(html.indexOf('id="kontak"'));

test('the contact section rendered (precondition for every absence below)', () => {
  assert.ok(html.includes('id="kontak"'), 'the #kontak anchor is in the page');
  assert.ok(kontak.includes(`mailto:${ENTITY.email}`), 'the email link is in the contact section');
  assert.ok(kontak.includes(ENTITY.address), 'the registered address is in the contact section');
});

test('no WhatsApp number, label or wa.me link anywhere on /tentang', () => {
  for (const needle of ['0818805913', '62818805913', 'wa.me']) {
    assert.ok(!html.includes(needle), `/tentang must not contain ${needle}`);
  }
  assert.doesNotMatch(html, /whatsapp/i, '/tentang must not say WhatsApp');
});

test('Email comes before Alamat terdaftar, and nothing else sits in the list', () => {
  const q = SITE_COPY.tentang;
  const dts = [...kontak.matchAll(/<dt[^>]*>([^<]*)<\/dt>/g)].map((m) => m[1]);
  assert.deepEqual(dts, [q.kontakEmailLabel, q.kontakAddressLabel]);
});

test('the lead is the string Reyner ruled 2026-10-07, verbatim', () => {
  const ruled = 'Untuk pertanyaan, permintaan soal datamu, atau kendala pembayaran, kirim email ke kami.';
  assert.equal(SITE_COPY.tentang.kontakLead, ruled);
  assert.ok(kontak.includes(ruled), 'the ruled lead is rendered in the contact section');
});
