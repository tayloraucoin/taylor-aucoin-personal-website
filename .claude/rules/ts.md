---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.mjs"
---

# TypeScript

Only the rules a capable model would not apply by default. Full contract: `docs/engineering/codebase-conventions.md`.

- Named exports; a default export only where Next.js or a config file requires one.
- Kebab-case file names; verb-first function names (`getAllDocs`, `resolveDocLink`); no `helpers`, `misc` or `utils.ts` catch-alls.
- Server Components by default; `"use client"` on line 1 of a leaf, placed by its importers.
- `process.env` is read only in `lib/env.ts` in new code; the readers elsewhere move behind it in layer 3, part 5.
- `tooling/*.ts` runs directly on Node 22 with type stripping: no enums, no parameter properties, no `namespace`; import with explicit `.ts` extensions.
