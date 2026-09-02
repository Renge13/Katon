// ============================================================
// scripts/jsx-loader.mjs — let `node --test` import a .jsx component
// ============================================================
// Node 24 strips TYPES on its own, which is why tests/solar-terms.spec.ts runs
// with no help. It does not transform JSX, so `components/Funnel.jsx` was simply
// unreachable from a test file and the funnel had no behavioural coverage at all.
// `components/cards/Card.js` is written in React.createElement rather than JSX for
// exactly that reason - tests/card.spec.mjs imports it directly.
//
// NO NEW TRANSFORMER DEPENDENCY. `typescript` is already a devDependency (it backs
// `npm run typecheck`), and `ts.transpileModule` emits JSX. Adding esbuild or swc
// to do the same job would be a second toolchain for one hook.
//
// TRANSPILE ONLY, NEVER TYPE-CHECK. `transpileModule` throws away the program, so
// this cannot fail a test on a type error and cannot disagree with `npm run
// typecheck` about anything. It rewrites `<div/>` and leaves the rest alone.
//
// SCOPE IS `.jsx` AND NOTHING ELSE. Every other extension falls through to the
// default loader untouched, so registering this cannot change how a single
// existing test resolves or executes.
//
// Register it with:  node --import ./scripts/jsx-register.mjs --test <file>
// ============================================================

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

export async function load(url, context, nextLoad) {
  if (!url.endsWith('.jsx')) return nextLoad(url, context);

  const source = await readFile(fileURLToPath(url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      // The automatic runtime, so a component file needs no `import React`.
      // Funnel.jsx and kit.jsx both rely on that, exactly as Next compiles them.
      jsx: ts.JsxEmit.ReactJSX,
      jsxImportSource: 'react',
      esModuleInterop: true,
    },
  });

  return { format: 'module', shortCircuit: true, source: outputText };
}
