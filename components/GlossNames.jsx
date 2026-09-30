'use client';

// ============================================================
// The glossary's English names, handed to the client once (Prompt AQ §4)
// ============================================================
// The root layout (a server component) reads `GLOSS_NAMES_EN` from
// lib/render/glossNames.js and provides it here, so every reading surface can set a
// bracketed English gloss in italic without the client importing the 62KB glossary.
// No provider (a test, a surface outside the layout) means no names, and then the
// prose renders exactly as plain text: the italic is styling and its absence loses
// no words.
//
// ── THE NAMESPACE IMPORT AND THE GUARD ARE FOR THE react-server CONDITION ──
// Next always loads a 'use client' module with the client React. Specs that import
// the compat surface run under `--conditions=react-server`, whose React has no
// createContext, and a named import of it fails the whole file at link time
// (measured: tests/compat-surface.spec.mjs, "does not provide an export named
// 'createContext'"). Under that condition this renders plain text, which is also
// what it renders with no provider.
// ============================================================

import * as React from 'react';
import { glossRuns } from '../lib/render/glossItalics.js';

const GlossNamesContext = typeof React.createContext === 'function' ? React.createContext(null) : null;
// Chosen once at module load, so every render calls the same hook.
const useGlossNames = GlossNamesContext ? () => React.useContext(GlossNamesContext) : () => null;

export function GlossNamesProvider({ names, children }) {
  if (!GlossNamesContext) return children;
  const set = new Set(names || []);
  return <GlossNamesContext.Provider value={set}>{children}</GlossNamesContext.Provider>;
}

/**
 * Prose with its bracketed glossary English in <em>. The brackets stay upright.
 * Joining the rendered text gives back `text` exactly.
 */
export function GlossText({ text }) {
  const names = useGlossNames();
  if (!names || names.size === 0) return text;
  return glossRuns(text, names).map((r, i) => (r.gloss ? <em key={i}>{r.text}</em> : r.text));
}
