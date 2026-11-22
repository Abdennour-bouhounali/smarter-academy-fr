/**
 * ONE lint config for the JavaScript of the repository: apps/web, packages/core and the scripts.
 * What it enforces and how it runs in CI: docs/architecture/CODE_HEALTH.md.
 *
 *   npm run lint          the whole tree
 *   npm run lint:fix      removes unused imports (the only automatic fix)
 */
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

const UNUSED = {
  vars: 'all',
  args: 'after-used',
  // `const { removed, ...rest } = props` — `removed` is taken out on purpose: it IS used.
  ignoreRestSiblings: true,
  caughtErrors: 'none',
  varsIgnorePattern: '^_',
  argsIgnorePattern: '^_',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/vendor/**',
      '.claude/**',
      '**/*.generated.*',
      'apps/api/**',
      'apps/web/public/**',
      'docs/**',
      'shots/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    // Off: the tree carries `eslint-disable` lines for rules this config does not turn on (exhaustive-deps).
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    plugins: { react, 'react-hooks': reactHooks, 'unused-imports': unusedImports },
    rules: {
      // A name used only as a JSX tag (`<Card />`) is used.
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['error', UNUSED],
      'react-hooks/rules-of-hooks': 'error',
      // An empty `catch {}` is how the code says « storage may be closed, go on ».
      'no-empty': ['error', { allowEmptyCatch: true }],
      // `while (true)` with a `break` is a normal loop.
      'no-constant-condition': ['error', { checkLoops: false }],
      // The no-break space is used ON PURPOSE in Arabic counters (« 12 تمرينًا »): only real code is checked.
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipComments: true, skipRegExps: true, skipJSXText: true },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx,mjs}', '**/setupTests.js'],
    languageOptions: { globals: { ...globals.vitest } },
  },
  {
    // Tests and answer oracles write the arithmetic of a statement on purpose (`expect(3 * 5 > 12 && …)`):
    // a constant expression there is the check itself.
    files: ['**/*.test.{js,jsx,mjs}', 'scripts/practice-oracle/**', 'scripts/__fixtures__/**/*.oracle.mjs'],
    rules: { 'no-constant-binary-expression': 'off', 'no-constant-condition': 'off' },
  },
  {
    // A logic test calls pure functions whose name starts with `use` (`useHint`, `useRoot`): they are not hooks.
    files: ['**/*.test.{js,mjs}'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
];
