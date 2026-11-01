import js from '@eslint/js';
import globals from 'globals';

export default [
  // Ignore build artefacts and dependencies
  { ignores: ['node_modules/', 'dist/'] },
  // Apply linting to all source files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    // Use the base ESLint recommended rules
    ...js.configs.recommended,
    // Disable rules that cause false positives in this codebase
    rules: {
      'no-unused-vars': 'off', // many imports are used only in JSX
      'no-undef': 'off', // browser globals are assumed
    },
  },
];
