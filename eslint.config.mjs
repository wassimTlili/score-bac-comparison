import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Production-ready rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react-hooks/exhaustive-deps": "warn",
      // Allow empty dependency arrays for initialization effects
      "react-hooks/exhaustive-deps": [
        "warn",
        {
          additionalHooks: "(useIsomorphicLayoutEffect|usePrevious)"
        }
      ],
      // Disable specific rules that are too strict for our use case
      "@next/next/no-img-element": "off",
      "react/display-name": "off"
    }
  }
];

export default eslintConfig;
