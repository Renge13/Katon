// ============================================================
// tests/helpers/setField.mjs — drive a React-controlled form field
// ============================================================
// Extracted 2026-09-09, because it existed twice - identically - in
// `funnel-submit-guard.spec.mjs` and `stagger-cadence.spec.mjs`, and turning the
// hour input into a `<select>` broke BOTH in the same way at the same moment.
// Two copies of a helper is two places to fix a helper bug, and the second one
// is always found by a failing suite rather than by a search.
//
// ── WHY THE NATIVE SETTER, NOT `el.value = x` ──────────────
// React stores the last value it saw on the DOM node and skips an event whose
// value it believes it already has. Assigning `el.value` updates the node
// without going through the tracker, so the event that follows is discarded and
// the field silently does not change. Calling the prototype's own setter is what
// keeps the tracker in step.
//
// ── BOTH `input` AND `change`, DELIBERATELY ────────────────
// React's `onChange` maps to the DOM `input` event for text-like inputs and to
// `change` for `<select>`. A helper that fired only `input` worked for every
// field this repo had until the hour picker became a select, and then set
// nothing at all - with no error, because assigning to a select that ignores you
// is not an error. Firing both is right for either control and the extra one is
// a no-op listener.
// ============================================================

import assert from 'node:assert/strict';

/**
 * @param {Element} host   the mounted container to query within
 * @param {Function} act   React's `act`, passed in so this file imports no React
 * @param {Window} win     the window whose `Event` constructor to use (jsdom's)
 */
export function makeSetField(host, act, win) {
  return (sel, value) => act(() => {
    const el = host.querySelector(sel);
    // A selector that matches nothing used to throw `Cannot convert undefined or
    // null to object` from deep inside `Object.getPrototypeOf`, which names
    // neither the selector nor the field. That is a real cost: it is exactly the
    // error a renamed control produces, and it tells you nothing about which one.
    assert.ok(el, `setField: no element matches ${sel}`);
    const proto = Object.getPrototypeOf(el);
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    el.dispatchEvent(new win.Event('input', { bubbles: true }));
    el.dispatchEvent(new win.Event('change', { bubbles: true }));
  });
}
