import assert from "node:assert/strict";
import { test } from "node:test";
import { work, workRows } from "@/content/work";
import {
  chipsForTab,
  entriesForTab,
  formatPeriod,
  groupByType,
  parseTab,
  parseType,
  visibleTabs,
  workHref,
  type WorkData,
} from "@/lib/work/rows";

const titles = (entries: { title: string }[]) => entries.map((e) => e.title);

test("C1 parseTab falls back to product and parseType to all", () => {
  for (const bad of [undefined, "", "nope", ["websites", "branding"]]) {
    assert.equal(parseTab(bad), "product");
  }
  assert.equal(parseTab("websites"), "websites");
  assert.equal(parseTab("branding"), "branding");
  assert.equal(parseTab("product"), "product");

  assert.equal(parseType(undefined, "product"), "all");
  assert.equal(parseType("nope", "product"), "all");
  assert.equal(parseType("featured", "product"), "all");
  assert.equal(parseType(["contract", "passion"], "product"), "all");
  // own-brand is a branding type; the product tab does not carry it.
  assert.equal(parseType("own-brand", "product"), "all");
  assert.equal(parseType("contract", "product"), "contract");
  assert.equal(parseType("own-brand", "branding"), "own-brand");
});

test("C2 chips on the real content", () => {
  assert.deepEqual(chipsForTab(entriesForTab("product")), [
    "all",
    "full-time",
    "contract",
    "business",
    "passion",
  ]);
  assert.deepEqual(chipsForTab(entriesForTab("branding")), [
    "all",
    "business",
    "passion",
    "own-brand",
  ]);
  assert.deepEqual(chipsForTab(entriesForTab("websites")), []);
});

test("C3 groups follow D-SITE-100's order and sort newest first", () => {
  const groups = groupByType(entriesForTab("product"));
  assert.deepEqual(
    groups.map((g) => g.type),
    ["full-time", "contract", "business", "passion"],
  );
  assert.deepEqual(titles(groups[0].entries), [
    "Everbook",
    "Roomvy",
    "Calculate by QxMD",
  ]);
  assert.deepEqual(titles(groups[1].entries), [
    "Multi-Entity Family Office Platform",
  ]);
  assert.deepEqual(titles(groups[2].entries), ["Agora"]);
  assert.deepEqual(titles(groups[3].entries), ["Conscious Connections"]);

  const [a, b, c, d] = work;
  const shuffled: WorkData = {
    studies: [
      { ...a, type: "passion", sortDate: "2020-01", title: "p-old" },
      { ...b, type: "full-time", sortDate: "2021-05", title: "f-old" },
      { ...c, type: "passion", sortDate: "2024-03", title: "p-new" },
      { ...d, type: "full-time", sortDate: "2023-07", title: "f-new" },
    ],
    rows: [],
    isPublished: () => true,
  };
  const out = groupByType(entriesForTab("product", shuffled));
  assert.deepEqual(
    out.map((g) => [g.type, titles(g.entries)]),
    [
      ["full-time", ["f-new", "f-old"]],
      ["passion", ["p-new", "p-old"]],
    ],
  );
});

test("C4 unpublished entries, empty chips and empty tabs drop out", () => {
  const rejectsAgora: WorkData = {
    studies: work,
    rows: workRows,
    isPublished: (slug) => slug !== "agora",
  };
  assert.ok(!titles(entriesForTab("product", rejectsAgora)).includes("Agora"));
  assert.ok(
    !chipsForTab(entriesForTab("product", rejectsAgora)).includes("business"),
  );

  const none: WorkData = { ...rejectsAgora, isPublished: () => false };
  assert.deepEqual(visibleTabs(none), ["websites", "branding"]);
  assert.ok(!visibleTabs(none).includes("product"));

  assert.deepEqual(visibleTabs(), ["product", "websites", "branding"]);
  assert.deepEqual(titles(entriesForTab("websites")), ["Kryshan Randel"]);
});

test("C5 workHref carries the tab and type and drops the defaults", () => {
  assert.equal(workHref("product", "all"), "/work");
  assert.equal(workHref("product", "featured"), "/work");
  assert.equal(workHref("websites", "all"), "/work?tab=websites");
  assert.equal(workHref("product", "full-time"), "/work?type=full-time");
  assert.equal(
    workHref("branding", "business"),
    "/work?tab=branding&type=business",
  );
});

test("C6 formatPeriod spaces an en dash between years", () => {
  assert.equal(formatPeriod("2019 — 2021"), "2019 – 2021");
  assert.equal(formatPeriod("2019-2021"), "2019 – 2021");
  assert.equal(formatPeriod("2026 — present"), "2026 – present");
  assert.equal(formatPeriod("2026 - present"), "2026 – present");
  assert.equal(formatPeriod("2023"), "2023");
});
