import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { base } from "./base.js";

export function next({ tsconfigRootDir }) {
  return [
    ...base({ tsconfigRootDir }),
    {
      languageOptions: { globals: { ...globals.browser } },
      plugins: { "@next/next": nextPlugin, "react-hooks": reactHooks },
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs["core-web-vitals"].rules,
        ...reactHooks.configs.recommended.rules,
      },
    },
  ];
}
