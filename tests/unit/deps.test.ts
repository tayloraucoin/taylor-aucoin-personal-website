import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const pkg = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as { devDependencies: Record<string, string> };

const EXACT = /^\d+\.\d+\.\d+$/;

test("C3 @playwright/test and @axe-core/playwright are exact-pinned dev dependencies", () => {
  for (const name of ["@playwright/test", "@axe-core/playwright"]) {
    const range = pkg.devDependencies[name];
    assert.ok(range, `${name} is missing from devDependencies`);
    assert.match(range, EXACT, `${name} is pinned as "${range}", not exactly`);
  }
});

test("C3 @playwright/test equals the playwright pin, so one browser serves both", () => {
  assert.match(pkg.devDependencies.playwright, EXACT);
  assert.equal(
    pkg.devDependencies["@playwright/test"],
    pkg.devDependencies.playwright,
  );
});
