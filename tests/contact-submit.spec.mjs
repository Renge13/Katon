// ============================================================
// tests/contact-submit.spec.mjs — the confirmation is tied to a successful submit
// ============================================================
// `UPCOMING_COPY.contactSent` is "Emailmu sudah masuk." It ASSERTS THAT A THING
// ARRIVED. Ruled 2026-09-01 (docs/content/upcoming-copy-rulings.md, AMENDED
// 2026-09-01, ruling 1), and the ruling binds the code rather than only the words:
// a string that claims the server received something may not render when it did
// not.
//
// ── THE DEFECT THIS FILE EXISTS FOR ────────────────────────
// `setSent(true)` sat OUTSIDE the `if (contact.trim())` guard, and `fireEvent`
// swallows every failure by design. So the confirmation appeared on an empty box,
// on a failed POST, and on a 410-gone reading. Nothing on screen ever showed it:
// a confirmation that is wrong looks exactly like a confirmation that is right.
//
// ── WHY IT DRIVES THE REAL COMPONENT ───────────────────────
// CLAUDE.md: "A test that passes whether the feature exists or not is worse than no
// test." Extracting the decision into a helper and asserting on the helper would do
// exactly that - revert `Upcoming` to confirming unconditionally and a helper test
// stays green, which is the shape of the 2026-08-26 failure recorded there. So this
// mounts `Upcoming`, clicks the real buttons, and reads the rendered DOM.
//
// ── SHOWN RED BEFORE IT WAS TRUSTED ────────────────────────
// Run against the ungated `submitContact`, with the copy split already applied:
//
//     node --import ./scripts/jsx-register.mjs --test tests/contact-submit.spec.mjs
//     ✖ AN EMPTY BOX CONFIRMS NOTHING - and sends nothing
//     ✖ A REJECTED POST CONFIRMS NOTHING - and keeps her text
//     ✖ A NON-OK STATUS CONFIRMS NOTHING
//     ✖ AN { ok: false } BODY CONFIRMS NOTHING - status alone is not enough
//     ✖ the contact is trimmed, and whitespace alone counts as empty
//     ℹ tests 8   pass 3   fail 5
//
// THE THREE THAT PASSED ARE THE POINT. They are the tap receipt, the happy path,
// and the fire-and-forget contract - every assertion a well-meaning happy-path file
// would have contained. That file would have been GREEN on the live defect.
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

import { Upcoming } from '../components/Funnel.jsx';
import { UPCOMING_COPY } from '../lib/site/copy.js';

const READING = { token: 'tok_test', chart: null };

/** Mount Upcoming into a fresh detached-but-attached container. */
function mount() {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => root.render(React.createElement(Upcoming, { reading: READING })));
  return {
    host,
    text: () => host.textContent,
    /** The first button whose visible label is exactly `label`. */
    button: (label) => [...host.querySelectorAll('button')].find((b) => b.textContent.trim() === label),
    input: () => host.querySelector('input[type="text"]'),
    click: (el) => act(() => { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); }),
    type: (el, value) => act(() => {
      // React 19 tracks the value on the node; bypass the tracker so the synthetic
      // change event is not swallowed as a no-op.
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, value);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
    }),
    unmount: () => { act(() => root.unmount()); host.remove(); },
  };
}

/** Replace global fetch for one test, recording every call. */
function stubFetch(impl) {
  const calls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : null });
    return impl(url, init);
  };
  return { calls, restore: () => { globalThis.fetch = prev; } };
}

const ok = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ ok: true }) });

/** Tap a product and get to the state where the contact box is visible. */
async function tapCompat(ui) {
  ui.click(ui.button(UPCOMING_COPY.interestCta));
  await act(async () => {});
  return ui;
}

// ── THE TAP RECEIPT, which is the other half of the split ───

test('the tap shows interestNoted and NOT contactSent', async () => {
  const f = stubFetch(ok);
  const ui = mount();
  try {
    await tapCompat(ui);
    assert.ok(ui.text().includes(UPCOMING_COPY.interestNoted), 'tap receipt must be shown');
    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent),
      'the tap is not a submit: "Emailmu sudah masuk." must not appear yet');
  } finally { ui.unmount(); f.restore(); }
});

// ── THE FOUR FAILING INPUTS. Each one is a way the confirmation used to lie. ──

test('AN EMPTY BOX CONFIRMS NOTHING - and sends nothing', async () => {
  const f = stubFetch(ok);
  const ui = mount();
  try {
    await tapCompat(ui);
    const before = f.calls.length; // the tap's own interest_registered
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});

    assert.equal(f.calls.length, before, 'an empty box must not POST at all');
    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent),
      '"Emailmu sudah masuk." must NOT be shown after submitting an empty box');
    assert.ok(ui.input(), 'the input stays visible so she can still type one');
  } finally { ui.unmount(); f.restore(); }
});

test('A REJECTED POST CONFIRMS NOTHING - and keeps her text', async () => {
  // The network throwing is the case `fireEvent`'s `.catch(() => {})` swallows.
  const f = stubFetch((url, init) => (JSON.parse(init.body).contact
    ? Promise.reject(new Error('offline'))
    : ok()));
  const ui = mount();
  try {
    await tapCompat(ui);
    ui.type(ui.input(), 'reyner@example.com');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});

    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent),
      '"Emailmu sudah masuk." must NOT be shown when the POST rejected');
    assert.equal(ui.input()?.value, 'reyner@example.com',
      'the input stays visible WITH ITS VALUE so a retry costs no retyping');
  } finally { ui.unmount(); f.restore(); }
});

test('A NON-OK STATUS CONFIRMS NOTHING', async () => {
  // A 410 on a gone reading, or the route's 400 on a bad product. `fetch` resolves
  // for both, so `res.ok` is the only thing that separates them from success.
  const f = stubFetch((url, init) => (JSON.parse(init.body).contact
    ? Promise.resolve({ ok: false, status: 410, json: () => Promise.resolve({ error: 'gone' }) })
    : ok()));
  const ui = mount();
  try {
    await tapCompat(ui);
    ui.type(ui.input(), 'reyner@example.com');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});

    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent),
      '"Emailmu sudah masuk." must NOT be shown on a 410');
  } finally { ui.unmount(); f.restore(); }
});

test('AN { ok: false } BODY CONFIRMS NOTHING - status alone is not enough', async () => {
  // 200 with a body that does not say ok. Checking only `res.ok` would pass this,
  // which is why the ruling names BOTH.
  const f = stubFetch((url, init) => (JSON.parse(init.body).contact
    ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ error: 'nope' }) })
    : ok()));
  const ui = mount();
  try {
    await tapCompat(ui);
    ui.type(ui.input(), 'reyner@example.com');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});

    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent),
      '"Emailmu sudah masuk." must NOT be shown when the body does not say ok');
  } finally { ui.unmount(); f.restore(); }
});

// ── AND THE HAPPY PATH, so the gate cannot be satisfied by never confirming ──

test('a successful submit DOES confirm, and sends the contact', async () => {
  const f = stubFetch(ok);
  const ui = mount();
  try {
    await tapCompat(ui);
    ui.type(ui.input(), 'reyner@example.com');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});

    assert.ok(ui.text().includes(UPCOMING_COPY.contactSent),
      '"Emailmu sudah masuk." must be shown once the server said ok');
    assert.ok(!ui.text().includes(UPCOMING_COPY.interestNoted),
      'the tap receipt is replaced, not stacked - two receipts would read as two events');

    const submit = f.calls.at(-1);
    assert.equal(submit.url, `/api/mirror/${READING.token}/event`);
    assert.equal(submit.body.event, 'interest_registered');
    assert.equal(submit.body.product, 'compat');
    assert.equal(submit.body.contact, 'reyner@example.com');
  } finally { ui.unmount(); f.restore(); }
});

test('the contact is trimmed, and whitespace alone counts as empty', async () => {
  const f = stubFetch(ok);
  const ui = mount();
  try {
    await tapCompat(ui);
    const before = f.calls.length;
    ui.type(ui.input(), '   ');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});
    assert.equal(f.calls.length, before, 'whitespace is an empty box');
    assert.ok(!ui.text().includes(UPCOMING_COPY.contactSent));

    ui.type(ui.input(), '  reyner@example.com  ');
    ui.click(ui.button(UPCOMING_COPY.contactSubmit));
    await act(async () => {});
    assert.equal(f.calls.at(-1).body.contact, 'reyner@example.com', 'trimmed on the way out');
  } finally { ui.unmount(); f.restore(); }
});

// ── THE CONTRACT THE OTHER SEVEN EVENTS RELY ON, pinned here ──

test('the TAP is still fire-and-forget - a throwing fetch does not break it', async () => {
  // fireEvent must keep swallowing failures: "a counter never breaks the page", and
  // the tap is the metric, recorded before any contact exists. Only the contact
  // submit is awaited. If this fails, the awaited path leaked into fireEvent.
  const f = stubFetch(() => { throw new Error('boom'); });
  const ui = mount();
  try {
    await tapCompat(ui);
    assert.ok(ui.text().includes(UPCOMING_COPY.interestNoted),
      'the tap receipt still renders even though its counter threw');
  } finally { ui.unmount(); f.restore(); }
});
