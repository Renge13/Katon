// ============================================================
// scripts/alias-register.mjs — resolve Next's `@/` alias outside the bundler
// ============================================================
//   node --import ./scripts/alias-register.mjs ...
//
// Route files, pages and some components import through `@/` (jsconfig paths), which
// only the bundler understands. This maps `@/x` to `<repo>/x`, trying the bare path,
// `.js`, `.jsx` and `/index.js`, and gives `next/<name>` its `.js` (next has no exports
// map). Used by scripts/funnel-walk.mjs (Prompt BG §2.6) and by specs that render a
// real page or the header (tests/compat-navigation.spec.mjs). One copy of the rule.
// ============================================================

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const APP_URL = pathToFileURL(path.join(ROOT, 'app')).href + '/';
const LOADER_URL = pathToFileURL(path.join(ROOT, 'scripts', 'jsx-loader.mjs')).href;
// AND `app/**/*.js` THROUGH THE JSX TRANSFORM: an App Router page carries JSX in a `.js`
// file, which scripts/jsx-loader.mjs deliberately leaves alone (its scope is `.jsx`).
// Scoped to `app/`, and only for a process that imports this file.
const HOOK = `
import { statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { transpileJsx } from ${JSON.stringify(LOADER_URL)};
const ROOT = ${JSON.stringify(ROOT)};
const APP_URL = ${JSON.stringify(APP_URL)};
export async function load(url, context, next) {
  if (url.startsWith(APP_URL) && url.endsWith('.js')) return transpileJsx(url);
  return next(url, context);
}
const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const base = ROOT + '/' + specifier.slice(2);
    const hit = [base, base + '.js', base + '.jsx', base + '/index.js'].find(isFile);
    if (hit) return next(pathToFileURL(hit).href, context);
  }
  if (/^next\\/[a-z-]+$/.test(specifier)) return next(specifier + '.js', context);
  return next(specifier, context);
}`;

register(`data:text/javascript,${encodeURIComponent(HOOK)}`, pathToFileURL('./'));
