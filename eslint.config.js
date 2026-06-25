import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist', '**/node_modules', '**/*.min.js'] },
  
  // ----------------------------------------------------
  // Backend Rules (roommate-server)
  // ----------------------------------------------------
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['roommate-server/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // Servers often use console.log, but we can encourage robust logging
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }], 
    },
  },

  // ----------------------------------------------------
  // Frontend Rules (roommate-app)
  // ----------------------------------------------------
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['roommate-app/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      
      // Downgrade strict React 19/Compiler rules to warnings for the existing codebase
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    },
  }
);
