import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterItems,
  itemsForTab,
  normalizeQuery,
} from "@/app/capabilities/_components/tabs";
import { capabilities } from "@/content/capabilities";

/** SITE-27: what the filter matches (D-SITE-148). */

const shown = capabilities
  .filter((c) => c.chip && c.comfort !== undefined && c.proof?.length)
  .sort((a, b) => b.comfort! - a.comfort!);
const names = (items: { chip?: string }[]) => items.map((i) => i.chip);

test("C1 realtime matches exactly three, reading past chip names", () => {
  assert.deepEqual(names(filterItems(shown, "realtime")), [
    "AI features",
    "Realtime sync",
    "Realtime voice",
  ]);
  assert.deepEqual(
    names(filterItems(shown, "  ReAlTiMe ")),
    names(filterItems(shown, "realtime")),
  );
});

test("C1 a blank query keeps every chip; kubernetes matches none", () => {
  assert.equal(filterItems(shown, "").length, 25);
  assert.equal(filterItems(shown, "   ").length, 25);
  assert.deepEqual(filterItems(shown, "kubernetes"), []);
  assert.equal(normalizeQuery("  Pay "), "pay");
});

test("C2 the filter works within a tab", () => {
  const within = filterItems(itemsForTab(shown, "ai-data"), "realtime");
  assert.deepEqual(names(within), [
    "AI features",
    "Realtime sync",
    "Realtime voice",
  ]);
  assert.deepEqual(
    filterItems(itemsForTab(shown, "product-design"), "realtime"),
    [],
  );
});

test("C1 each field is read: title, tech, approach, offer, keywords", () => {
  const c = shown[0];
  for (const word of [c.title, c.tech, c.approach, c.offer, c.keywords[0]])
    assert.ok(filterItems([c], word).length === 1, word);
});
