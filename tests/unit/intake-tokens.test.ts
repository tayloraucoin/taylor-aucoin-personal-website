import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { findIdioms, intakeSourceFiles } from "./intake-idioms";

/**
 * C-SITE-intake-coded-2: no old idiom left in an intake tree. Each intake
 * ticket adds the trees it restyles (SITE-28 the shared tree).
 */
const TREES: Record<string, readonly string[]> = {
  "SITE-28": ["app/websites/intake"],
};

for (const [ticket, roots] of Object.entries(TREES)) {
  test(`${ticket} C1 no mono caps, Eyebrow, GradientRing, font-light or gold text`, () => {
    const hits = roots
      .flatMap(intakeSourceFiles)
      .flatMap((file) =>
        findIdioms(readFileSync(file, "utf8")).map(
          (idiom) => `${file}: ${idiom}`,
        ),
      );
    assert.deepEqual(hits, []);
  });
}

test("SITE-28 C1 the scanner finds each idiom in a fixture", () => {
  const fixture = [
    `import { Eyebrow } from "./eyebrow";`,
    `import GradientRing from "@/components/ui/GradientRing";`,
    `const a = "font-mono text-[10px] uppercase tracking-[.18em]";`,
    `const b = "font-body font-light";`,
    `const c = "hover:text-(--color-c3) text-(--color-c2)";`,
  ].join("\n");
  assert.deepEqual(findIdioms(fixture).sort(), [
    "eyebrow-import",
    "font-light",
    "gold-text",
    "gradient-ring-import",
    "mono-caps",
  ]);
});

test("SITE-28 C1 the scanner passes the new roles", () => {
  const clean = [
    `import { Eyebrow } from "./not-imported";`.replace("Eyebrow", "Meta"),
    `const a = "text-meta text-(--color-dim)";`,
    `const b = "bg-(--color-mark) decoration-(--color-mark)";`,
    `const c = "font-mono text-meta";`,
  ].join("\n");
  assert.deepEqual(findIdioms(clean), []);
});
