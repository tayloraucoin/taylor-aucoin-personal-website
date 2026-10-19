import assert from "node:assert/strict";
import { test } from "node:test";
import { currentNavItem, headerCallSurface } from "@/components/site/nav";

test("C1 currentNavItem marks the right item", () => {
  const cases: [string, string | null][] = [
    ["/work", "work"],
    ["/work/any-slug", "work"],
    ["/about", "about"],
    ["/work-with-me", "work-with-me"],
    ["/services", "work-with-me"],
    ["/contact", "contact"],
    ["/", null],
    ["/book", null],
    ["/privacy", null],
    ["/no-such-page", null],
  ];
  for (const [path, item] of cases)
    assert.equal(currentNavItem(path), item, path);
});

test("C2 headerCallSurface names each page's surface", () => {
  const cases: [string, unknown][] = [
    ["/", { surface: "home" }],
    ["/work", { surface: "work-index" }],
    ["/about", { surface: "about" }],
    ["/work-with-me", { surface: "services" }],
    ["/services", { surface: "services" }],
    ["/contact", { surface: "services" }],
    ["/capabilities", { surface: "capabilities" }],
    [
      "/work/conscious-connections",
      { surface: "case-study", slug: "conscious-connections" },
    ],
    ["/privacy", null],
    ["/no-such-page", null],
  ];
  for (const [path, surface] of cases)
    assert.deepEqual(headerCallSurface(path), surface, path);
});
