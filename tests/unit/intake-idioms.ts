import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * The old intake idioms the token rules retire (intake-coded.md; D-SITE-158,
 * C-SITE-intake-coded-2), as a scanner over source text. Shared by the token
 * test, which each intake ticket extends with its own trees.
 */
export type Idiom =
  | "mono-caps"
  | "eyebrow-import"
  | "gradient-ring-import"
  | "font-light"
  | "gold-text";

const STRING_LITERAL = /"[^"\n]*"|'[^'\n]*'|`[^`]*`/g;

export function findIdioms(source: string): Idiom[] {
  const found = new Set<Idiom>();

  for (const literal of source.match(STRING_LITERAL) ?? []) {
    if (/\bfont-mono\b/.test(literal) && /\buppercase\b/.test(literal)) {
      found.add("mono-caps");
    }
  }
  if (/import[^;]*\bEyebrow\b[^;]*from/.test(source)) {
    found.add("eyebrow-import");
  }
  if (/import[^;]*\bGradientRing\b[^;]*from/.test(source)) {
    found.add("gradient-ring-import");
  }
  if (/\bfont-light\b/.test(source)) found.add("font-light");
  if (
    /(^|[\s"'`:])text-\(--color-c[23]\)/m.test(source) ||
    /\bcolor:\s*["'`]?var\(--color-c[23]\)/.test(source)
  ) {
    found.add("gold-text");
  }

  return [...found];
}

/** Every .ts and .tsx file under a tree, `_actions/` folders left out. */
export function intakeSourceFiles(root: string): string[] {
  const out: string[] = [];
  (function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        if (name !== "_actions") walk(path);
      } else if (/\.tsx?$/.test(name)) {
        out.push(path);
      }
    }
  })(root);
  return out;
}

/**
 * The paths an intake restyle never changes (C-SITE-intake-coded-12): money,
 * sessions and saves live there.
 */
export function isProtectedIntakePath(path: string): boolean {
  return (
    path.startsWith("server/") ||
    path.includes("/_actions/") ||
    path.startsWith("lib/intake/") ||
    path.startsWith("lib/extras/")
  );
}
