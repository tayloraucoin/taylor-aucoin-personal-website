import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // `.next-agent` and `.next-build` are the dist dirs the `dev:agent` and
    // `build:agent` scripts write to (repo CLAUDE.md — an agent must never
    // share Taylor's running `.next`). They were added without reaching this
    // list, so `yarn lint` reported ~16,500 problems from generated bundles the
    // moment either script had been run once, and none from source.
    ignores: [
      ".next/**",
      ".next-agent/**",
      ".next-build/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
