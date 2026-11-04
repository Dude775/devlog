import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Shared base flat config. Type-aware rules are enabled; each consumer
 * must run ESLint from its own package directory (tsconfigRootDir).
 */
export function base({ tsconfigRootDir }) {
  return tseslint.config(
    {
      ignores: [
        "**/*.d.ts",
        "dist/**",
        ".next/**",
        ".velite/**",
        "coverage/**",
        "node_modules/**",
        "*.config.*",
      ],
    },
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: { ...globals.node },
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { fixStyle: "inline-type-imports" },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      },
    },
    prettier,
  );
}
