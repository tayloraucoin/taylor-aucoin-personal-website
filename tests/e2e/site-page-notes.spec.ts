import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

/**
 * WEB-22: a brain dump per page on step 8, drawn on the SITE-28 harness from
 * `components/intake/site-pages-fixtures.ts`.
 */
const at = (key: string) => `/test-harness/intake?state=${key}`;

/** A page box's label ends this way; Home's and the extra pages' do not. */
const PAGE_BOX = /: what goes on it$/;
const EXTRA = "What the extra pages are for";
const HOME = "What should be on the home page?";

/** Every page box past Home, by label, in document order. */
async function pageBoxes(page: Page): Promise<string[]> {
  return page
    .locator("main label")
    .evaluateAll((labels) =>
      labels
        .map((label) => label.textContent?.trim() ?? "")
        .filter((text) => text.endsWith(": what goes on it")),
    );
}

test.describe("C4 the boxes stop at the allowance", () => {
  test("pages-over: Home and four more, 7/5, and the extra pages box", async ({
    page,
  }) => {
    await page.goto(at("pages-over"));
    await expect(page.getByLabel(HOME)).toBeVisible();
    expect(await pageBoxes(page)).toEqual([
      "About: what goes on it",
      "The vision: what goes on it",
      "Team: what goes on it",
      "[Fixture: a page for the residency]: what goes on it",
    ]);
    await expect(page.getByText("7/5 pages included")).toBeVisible();
    await expect(page.getByLabel(EXTRA)).toBeVisible();

    // Ticking stays open past the limit.
    const faq = page.getByRole("checkbox", { name: "FAQ" });
    await expect(faq).toBeEnabled();
    // The row's label is what a person clicks; the input itself is sr-only.
    await page.getByText("FAQ", { exact: true }).click();
    await expect(faq).toBeChecked();
    await expect(page.getByText("8/5 pages included")).toBeVisible();
    expect(await pageBoxes(page)).toHaveLength(4);
  });

  test("pages-bought: two bought, every page has a box", async ({ page }) => {
    await page.goto(at("pages-bought"));
    expect(await pageBoxes(page)).toEqual([
      "About: what goes on it",
      "The vision: what goes on it",
      "Team: what goes on it",
      "[Fixture: a page for the residency]: what goes on it",
      "[Fixture: volunteer days]: what goes on it",
      "[Fixture: a reading list]: what goes on it",
    ]);
    await expect(page.getByText(/7\/7 pages/)).toBeVisible();
    await expect(page.getByLabel(EXTRA)).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: "FAQ" })).toBeEnabled();
  });

  test("pages-home-only and pages-some: boxes in checklist order", async ({
    page,
  }) => {
    await page.goto(at("pages-home-only"));
    await expect(page.getByLabel(HOME)).toBeVisible();
    expect(await pageBoxes(page)).toEqual([]);

    await page.goto(at("pages-some"));
    expect(await pageBoxes(page)).toEqual([
      "About: what goes on it",
      "Team: what goes on it",
      "Contact: what goes on it",
    ]);
    await expect(page.getByLabel("Team: what goes on it")).toHaveValue(
      "[Fixture: who is on the team page]",
    );
    await expect(page.getByLabel(PAGE_BOX).first()).toBeVisible();
  });
});

test.describe("C5 a typed page keeps its brain dump", () => {
  test("pages-typed: rename keeps it; removing an earlier row keeps the rest", async ({
    page,
  }) => {
    await page.goto(at("pages-typed"));
    // A place venture reads `offering` as "The model".
    expect(await pageBoxes(page)).toEqual([
      "The model: what goes on it",
      "[Fixture: a page for the residency]: what goes on it",
      "[Fixture: volunteer days]: what goes on it",
    ]);

    await page.getByLabel("Page 1", { exact: true }).fill("Residency");
    await expect(page.getByLabel("Residency: what goes on it")).toHaveValue(
      "[Fixture: what the residency page holds]",
    );

    await page.getByRole("button", { name: "Remove page 1" }).click();
    expect(await pageBoxes(page)).toEqual([
      "The model: what goes on it",
      "[Fixture: volunteer days]: what goes on it",
    ]);
    await expect(
      page.getByLabel("[Fixture: volunteer days]: what goes on it"),
    ).toHaveValue("[Fixture: what the volunteer page holds]");
  });
});
