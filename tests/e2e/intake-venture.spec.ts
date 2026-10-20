import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * VEN-1: the venture sub-type on the start form and on About, drawn on the
 * SITE-28 harness from `components/intake/venture-fixtures.ts`.
 */
const at = (key: string) => `/test-harness/intake?state=${key}`;
const KIND_KEYS = [
  "kind-other",
  "venture-chosen",
  "place-chosen",
  "subtype-changed",
] as const;
const SUBTYPES = ["place", "company", "fund", "cause", "launch", "other"];
const SUBTYPE_LEGEND = "What kind of venture is it?";

/** The `name` of every radio group in `main`, in document order. */
async function radioGroups(page: Page): Promise<string[]> {
  return page
    .locator("main fieldset")
    .evaluateAll((sets) =>
      sets
        .map((set) =>
          set.querySelector("input[type=radio]")?.getAttribute("name"),
        )
        .filter((name): name is string => Boolean(name)),
    );
}

test.describe("C1 the sub-type group on the start form", () => {
  test("kind-other: no sub-type group", async ({ page }) => {
    await page.goto(at("kind-other"));
    await expect(page.getByRole("group", { name: SUBTYPE_LEGEND })).toHaveCount(
      0,
    );
    await expect(page.locator("input[name=ventureTypeChoice]")).toHaveCount(0);
  });

  test("venture-chosen: directly after the kind group, six options in order, none checked", async ({
    page,
  }) => {
    await page.goto(at("venture-chosen"));
    const groups = await radioGroups(page);
    const kindAt = groups.indexOf("siteKindChoice");
    expect(kindAt).toBeGreaterThanOrEqual(0);
    expect(groups[kindAt + 1]).toBe("ventureTypeChoice");

    const radios = page.locator("input[name=ventureTypeChoice]");
    await expect(radios).toHaveCount(SUBTYPES.length);
    expect(
      await radios.evaluateAll((els) =>
        els.map((el) => (el as HTMLInputElement).value),
      ),
    ).toEqual(SUBTYPES);
    expect(
      await radios.evaluateAll(
        (els) => els.filter((el) => (el as HTMLInputElement).checked).length,
      ),
    ).toBe(0);
  });

  test("place-chosen: place is checked", async ({ page }) => {
    await page.goto(at("place-chosen"));
    await expect(
      page.locator("input[name=ventureTypeChoice][value=place]"),
    ).toBeChecked();
    await expect(
      page.locator("input[name=ventureTypeChoice]:checked"),
    ).toHaveCount(1);
  });
});

test.describe("C10 the sub-type changed on About", () => {
  test("subtype-changed: the picker open, company checked, the reassurance line under it", async ({
    page,
  }) => {
    await page.goto(at("subtype-changed"));
    const picker = page.locator("main").locator("input[name=ventureType]");
    await expect(picker).toHaveCount(SUBTYPES.length);
    await expect(
      page.locator("input[name=ventureType][value=company]"),
    ).toBeChecked();
    await expect(
      page.locator("input[name=siteKind][value=venture]"),
    ).toBeChecked();

    // Below the sub-type group, in reading order: the line that says the
    // answers are kept.
    const order = await page.locator("main").evaluate((main) => {
      const group = main
        .querySelector("input[name=ventureType]")!
        .closest("fieldset")!;
      const lines = [...main.querySelectorAll("p")];
      const line = lines.find((p) =>
        /changes the questions/i.test(p.textContent ?? ""),
      );
      return line
        ? group.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING
        : -1;
    });
    expect(order).toBeGreaterThan(0);
  });

  for (const key of KIND_KEYS) {
    test(`axe: no serious or critical violation on ${key}`, async ({
      page,
    }) => {
      await page.goto(at(key));
      await expectNoSeriousA11y(page);
    });
  }
});
