// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const commonTypeScriptRules = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
};

export default tseslint.config(
  // ----------------------------------------------------
  // Global ignores
  // ----------------------------------------------------
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.min.js"],
  },

  // ----------------------------------------------------
  // Base JavaScript + TypeScript rules
  // ----------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ----------------------------------------------------
  // Backend: roommate-server
  // ----------------------------------------------------
  {
    files: ["roommate-server/**/*.{ts,js}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      ...commonTypeScriptRules,

      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info", "log"],
        },
      ],
    },
  },

  // ----------------------------------------------------
  // Frontend: roommate-app
  // ----------------------------------------------------
  {
    files: ["roommate-app/**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...commonTypeScriptRules,

      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      "react-hooks/exhaustive-deps": "warn",

      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],

      // React 19 / compiler-related rules
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",

      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    },
  },
);

// eslint.config.js

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const commonTypeScriptRules = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": [
    "warn",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
    },
  ],
};

export default tseslint.config(
  // ----------------------------------------------------
  // Global ignores
  // ----------------------------------------------------
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.min.js"],
  },

  // ----------------------------------------------------
  // Base JavaScript + TypeScript rules
  // ----------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ----------------------------------------------------
  // Backend: roommate-server
  // ----------------------------------------------------
  {
    files: ["roommate-server/**/*.{ts,js}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },

    rules: {
      ...commonTypeScriptRules,

      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info", "log"],
        },
      ],
    },
  },

  // ----------------------------------------------------
  // Frontend: roommate-app
  // ----------------------------------------------------
  {
    files: ["roommate-app/**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...commonTypeScriptRules,

      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      "react-hooks/exhaustive-deps": "warn",

      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],

      // React 19 / compiler-related rules
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",

      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    },
  },
);