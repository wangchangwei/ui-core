import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import local from './tooling/eslint-rules.js';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'artifacts/**', 'test-results/**', 'playwright-report/**', '.omx/**', '.superpowers/**'],
  },
  {
    linterOptions: { noInlineConfig: true, reportUnusedDisableDirectives: 'error' },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tooling/**/*.js'],
    languageOptions: {
      globals: { process: 'readonly', URL: 'readonly' },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Utility exports commonly live beside components in this starter; Vite
      // refresh remains safe because only component modules are hot-reloaded.
      'react-refresh/only-export-components': 'off',
      // Feature effects start async API work; state updates happen in the
      // promise callback, so this React 19 heuristic is too broad here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    plugins: { local },
    rules: {
      'local/design-tokens': 'error',
      'local/feature-imports': 'error',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'tooling/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
