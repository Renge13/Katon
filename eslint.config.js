import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

// Flat config for the Katon Next.js app. Server route handlers + lib use Node
// globals (process, Buffer); client components use browser globals. JSX enabled.
export default defineConfig([
  globalIgnores(['.next', 'dist', 'node_modules', 'out', '.claude', 'Katon Design System']),
  {
    files: ['**/*.{js,jsx,mjs}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  // The TypeScript surface — currently lib/bazi/pillars.ts and its spec, the
  // most accuracy-critical code in the repo. Syntactic rules only (no
  // type-aware linting): `npm run typecheck` already runs tsc in strict mode
  // over exactly these files, so a second type-aware pass would duplicate it.
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
]);
