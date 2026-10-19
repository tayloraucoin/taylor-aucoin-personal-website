import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

test("C4 only app/layout.tsx imports a footer, and it is SiteFooter", () => {
  const importers = [...sources("app"), ...sources("components")].filter(
    (file) =>
      /import[^;]*from\s+["'][^"']*Footer["']/.test(readFileSync(file, "utf8")),
  );
  assert.deepEqual(importers, ["app/layout.tsx"]);
  assert.match(
    readFileSync("app/layout.tsx", "utf8"),
    /from "@\/components\/site\/SiteFooter"/,
  );
});

test("C4 components/sections/Footer.tsx does not exist", () => {
  assert.equal(existsSync("components/sections/Footer.tsx"), false);
});
