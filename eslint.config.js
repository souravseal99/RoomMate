import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// ============================================================
// Shared rule sets — reused across every package in the monorepo
// ============================================================

/** Rules that apply to ALL TypeScript/JavaScript code, backend or frontend */
const sharedTypeScriptRules = {
  "@typescript-eslint/no-explicit-any": "warn",
  "no-unused-vars": "off", // must disable base rule in favor of the TS-aware one below
  "@typescript-eslint/no-unused-vars": [
    "warn",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
  ],
};

/** Base no-console config, overridden per-package below if needed */
const defaultNoConsoleRule = ["warn", { allow: ["warn", "error", "info"] }];

// ============================================================
// Config
// ============================================================
export default tseslint.config(
  // ----------------------------------------------------
  // 1. Global ignores — applies repo-wide, before anything else runs
  // ----------------------------------------------------
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/*.min.js",
      "**/.turbo/**",
      "**/*.config.js", // don't lint build tool configs (vite.config.js etc)
      "**/generated/**", // ignore prisma generated files
    ],
  },

  // ----------------------------------------------------
  // 2. Baseline recommended rules — applies to every workspace package
  // ----------------------------------------------------
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ----------------------------------------------------
  // 3. Package: roommate-server (Node.js backend)
  // ----------------------------------------------------
  {
    files: ["roommate-server/**/*.{ts,js}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      ...sharedTypeScriptRules,
      "no-console": ["warn", { allow: ["warn", "error", "info", "log"] }],
    },
  },

  // ----------------------------------------------------
  // 4. Package: roommate-app (React frontend)
  // ----------------------------------------------------
  {
    files: ["roommate-app/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...sharedTypeScriptRules,
      ...reactHooks.configs.recommended.rules,

      "no-console": defaultNoConsoleRule,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",

      // React Compiler / React 19 rules — requires eslint-plugin-react-hooks v6+
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
);