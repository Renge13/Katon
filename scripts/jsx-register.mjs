// ============================================================
// scripts/jsx-register.mjs — the --import side of scripts/jsx-loader.mjs
// ============================================================
// Node's module hooks run off-thread and have to be installed before the first
// import of the module they affect, which is what `--import` guarantees and a
// top-of-file call inside the test file could not.
//
//   node --import ./scripts/jsx-register.mjs --test tests/<file>.spec.mjs
//
// It also installs the DOM. A component test needs `document` to exist before
// `react-dom/client` is imported, and the same "before the first import" problem
// applies, so both live here rather than in the spec.
//
// WHY jsdom AND NOT A HAND-ROLLED STUB. React 19's client renderer touches enough
// of the DOM (ranges, selection, event plumbing) that a stub becomes a second,
// worse browser that passes tests a browser would fail. That is the "instrument
// that cannot fail" shape.
// ============================================================

import { register } from 'node:module';
import { JSDOM } from 'jsdom';

register('./jsx-loader.mjs', import.meta.url);

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://katon.app/',
  pretendToBeVisual: true,
});

// The globals React DOM reads at import time and during render. Assigned rather
// than merged wholesale: copying every jsdom global over Node's would shadow
// `fetch`, which the tests need to replace themselves.
globalThis.window = dom.window;
globalThis.document = dom.window.document;
// Node 24 defines `navigator` as a getter-only global, so it is redefined rather
// than assigned. React reads `navigator.userAgent` during hydration paths.
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator, configurable: true, writable: true,
});
globalThis.Node = dom.window.Node;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Event = dom.window.Event;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

// ── ResizeObserver: A JSDOM GAP, NOT A BEHAVIOUR ───────────
// jsdom does not implement it and `ScaledCard` constructs one on mount, so any
// test that renders a card dies with `ReferenceError: ResizeObserver is not
// defined` before reaching its own assertion. That is a RED FOR THE WRONG REASON -
// it looks exactly like the behaviour under test being absent, and it was briefly
// mistaken for one while writing tests/share-sheet.spec.mjs.
//
// IT DELIBERATELY DOES NOTHING BEYOND THE INITIAL CALL. jsdom has no layout, so
// `clientWidth` is 0 and there is no resize to observe; a stub that invented
// callbacks would be inventing layout events a browser never sent. Nothing in this
// repo asserts on the scaled display size, and if something ever does, it needs a
// real browser rather than a better stub.
if (typeof globalThis.ResizeObserver !== 'function') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(cb) { this._cb = cb; }
    observe() { /* no layout in jsdom: nothing to report */ }
    unobserve() {}
    disconnect() {}
  };
  dom.window.ResizeObserver = globalThis.ResizeObserver;
}

// React's `act` environment flag. Without it every act() call warns, and a suite
// that prints warnings is a suite whose real warnings stop being read.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
