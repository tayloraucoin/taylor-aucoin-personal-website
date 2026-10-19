import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * SITE-25 C3: `/websites`' example row on synthetic rows at the harness route
 * (`app/test-harness/example-row`). Its 404 in production is proven by the
 * harness guard's unit test (SITE-3 C8), which this page calls.
 */
const PATH = "/test-harness/example-row";

const row = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`[data-example-row="${id}"]`);

test.use({ viewport: { width: 1440, height: 900 } });

for (const trigger of ["desktop", "phone", "all"] as const) {
  test(`C3 the ${trigger} trigger opens the gallery, Escape closes, focus returns`, async ({
    page,
  }) => {
    await page.goto(PATH);
    const full = row(page, "full");
    const button =
      trigger === "all"
        ? full.getByRole("button", { name: "All 3 images", exact: true })
        : full
            .getByRole("button", { name: "All 3 images, Fixture Studio" })
            .nth(trigger === "desktop" ? 0 : 1);
    await button.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveAttribute(
      "alt",
      trigger === "phone" ? "Fixture phone shot" : "Fixture desktop shot",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  });
}

test("C3 a row with no live link or testimonial shows neither, and no gap", async ({
  page,
}) => {
  await page.goto(PATH);
  const full = row(page, "full");
  await expect(full.getByRole("link", { name: "fixture.invalid" })).toHaveCount(
    1,
  );
  await expect(full.locator("blockquote")).toHaveText("Fixture quote.");

  const bare = row(page, "bare");
  await expect(bare.getByRole("link")).toHaveCount(0);
  await expect(bare.locator("figure, blockquote")).toHaveCount(0);
  // The text column ends on the link line, which holds only All n images,
  // and nothing in it is an empty placeholder.
  const column = await bare.evaluate((el) => {
    const line = el.querySelector("button[data-rail-index]")!.closest("p")!;
    const col = line.parentElement!;
    return {
      endsOnLine: col.lastElementChild === line,
      lineItems: line.children.length,
      empty: [...col.querySelectorAll("*")].filter(
        (n) => !n.textContent?.trim() && n.children.length === 0,
      ).length,
    };
  });
  expect(column).toEqual({ endsOnLine: true, lineItems: 1, empty: 0 });
});

test("C3 a row with an empty gallery shows no shot button and no All n images", async ({
  page,
}) => {
  await page.goto(PATH);
  const empty = row(page, "empty");
  await expect(empty.getByRole("button")).toHaveCount(0);
  await expect(empty).not.toContainText("images");
  await expect(empty.locator("img").first()).toBeVisible();
});

test("C3 the harness has no serious axe violation", async ({ page }) => {
  await page.goto(PATH);
  await expectNoSeriousA11y(page, { include: "main" });
});
