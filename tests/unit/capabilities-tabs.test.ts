import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  itemsForTab,
  parseTab,
  searchWithState,
  TAB_KEYS,
} from "@/app/capabilities/_components/tabs";
import { currentNavItem } from "@/components/site/nav";
import {
  capabilities,
  CAPABILITY_TABS,
  type CapabilityTab,
  type Category,
} from "@/content/capabilities";

/** SITE-26: the /capabilities tabs and their first fill (D-SITE-234). */

const FROM_TAG: Record<Category, CapabilityTab> = {
  Design: "product-design",
  Commerce: "engineering",
  Quality: "engineering",
  AI: "ai-data",
  Data: "ai-data",
  Delivery: "leading-delivery",
  Process: "leading-delivery",
};

test("C5 every capability's tabs are its tags mapped, from the five", () => {
  assert.deepEqual(TAB_KEYS, ["all", ...CAPABILITY_TABS]);
  for (const c of capabilities) {
    assert.ok(c.tabs.length > 0, c.slug);
    for (const t of c.tabs) assert.ok(CAPABILITY_TABS.includes(t), c.slug);
    const mapped = new Set(c.tags.map((t) => FROM_TAG[t]));
    assert.deepEqual(new Set(c.tabs), mapped, c.slug);
  }
});

test("C5 the shown chips split 4, 6, 10 and 7 across the tabs", () => {
  const shown = capabilities.filter(
    (c) => c.chip && c.comfort !== undefined && c.proof?.length,
  );
  assert.equal(shown.length, 25);
  const counts = CAPABILITY_TABS.map((t) => itemsForTab(shown, t).length);
  assert.deepEqual(counts, [4, 6, 10, 7]);
  assert.equal(itemsForTab(shown, "all").length, 25);
});

test("C2 parseTab falls back to All for missing, blank or unknown", () => {
  for (const bad of [undefined, "", "nope", "All", ["x", "ai-data"]])
    assert.equal(parseTab(bad), "all");
  for (const t of TAB_KEYS) assert.equal(parseTab(t), t);
  assert.equal(parseTab(["ai-data", "x"]), "ai-data");
});

test("C3 searchWithState writes tab and q, dropping All and a blank q", () => {
  const w = (search: string, tab: Parameters<typeof parseTab>[0], q = "") =>
    searchWithState(search, { tab: parseTab(tab), q });
  assert.equal(w("", "ai-data"), "?tab=ai-data");
  assert.equal(w("?tab=ai-data", "all"), "");
  assert.equal(
    w("?q=pay&tab=engineering", "product-design", "pay"),
    "?q=pay&tab=product-design",
  );
  assert.equal(w("?q=pay&tab=engineering", "all", "pay"), "?q=pay");
  assert.equal(w("?q=pay&state=x", "all", "  "), "?state=x");
});

test("Work is current on /capabilities (D-SITE-140)", () => {
  assert.equal(currentNavItem("/capabilities"), "work");
});

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const TOKENS = new Set([
  "label",
  "meta",
  "code",
  "small",
  "body",
  "lede",
  "h4",
  "h3",
  "h2",
  "headline",
  "stat",
  "display",
]);

// The Display ramp: 48 at 390 to the Display token, as /about's h1 draws it.
const DISPLAY_RAMP = "text-[length:clamp(48px,8vw,var(--text-display))]";

test("C5 no font size outside kit §3's tokens under capabilities", () => {
  const bad: string[] = [];
  for (const file of [
    ...files("app/capabilities"),
    ...files("components/capabilities"),
  ]) {
    const src = readFileSync(file, "utf8").replaceAll(DISPLAY_RAMP, "");
    for (const m of src.matchAll(/text-\[[^\]]*\]/g))
      if (!/^text-\[(--color|color:)/.test(m[0])) bad.push(`${file}: ${m[0]}`);
    for (const m of src.matchAll(/text-\(length:--text-([a-z0-9]+)\)/g))
      if (!TOKENS.has(m[1])) bad.push(`${file}: ${m[0]}`);
    for (const m of src.matchAll(/font-?[sS]ize/g))
      bad.push(`${file}: ${m[0]}`);
  }
  assert.deepEqual(bad, []);
});
