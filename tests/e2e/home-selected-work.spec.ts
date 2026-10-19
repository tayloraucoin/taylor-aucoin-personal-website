import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-11: home's Selected work. */

const section = (page: Page) => page.locator("section#work");
const tab = (page: Page, name: string) =>
  section(page).getByRole("tab", { name });
const chip = (page: Page, name: string) =>
  section(page).getByRole("group", { name: "Type" }).getByRole("button", {
    name,
    exact: true,
  });
const panel = (page: Page) => section(page).getByRole("tabpanel");
const titles = (page: Page) => panel(page).locator("h3").allTextContents();
const story = (page: Page, title: string) =>
  panel(page)
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
const footerHrefs = (page: Page) =>
  panel(page)
    .locator(":scope > p a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 tabs, arrow keys, each tab's Featured stories", async ({ page }) => {
    await page.goto("/");
    await expect(section(page).getByRole("tab")).toHaveText([
      "Product engineering",
      "Websites",
      "Branding & UI",
    ]);
    await expect(tab(page, "Product engineering")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await titles(page)).toEqual([
      "Conscious Connections",
      "Everbook",
      "Multi-Entity Family Office Platform",
    ]);

    await tab(page, "Product engineering").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Websites")).toBeFocused();
    await expect(tab(page, "Websites")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await titles(page)).toEqual(["Kryshan Randel"]);
    await expect(
      section(page).getByRole("group", { name: "Type" }),
    ).toHaveCount(0);

    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Branding & UI")).toBeFocused();
    expect(await titles(page)).toEqual([
      "Taylor Aucoin",
      "Conscious Connections",
      "Agora",
    ]);
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Product engineering")).toBeFocused();
  });

  test("C2 chips per tab; Full-time filters, keeps focus, announces", async ({
    page,
  }) => {
    await page.goto("/");
    const group = section(page).getByRole("group", { name: "Type" });
    await expect(group.getByRole("button")).toHaveText([
      "Featured",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    await expect(chip(page, "Featured")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await chip(page, "Full-time").click();
    await expect(chip(page, "Full-time")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(chip(page, "Full-time")).toBeFocused();
    expect(await titles(page)).toEqual([
      "Everbook",
      "Roomvy",
      "Calculate by QxMD",
    ]);
    await expect(
      story(page, "Calculate by QxMD").locator("img, [data-zoom-index]"),
    ).toHaveCount(0);
    await expect(section(page).locator("[aria-live=polite]")).toHaveText(/3/);

    await tab(page, "Branding & UI").click();
    await expect(group.getByRole("button")).toHaveText([
      "Featured",
      "Business",
      "Passion projects",
      "Own brand",
    ]);
  });

  test("C3 See all work carries the tab and chip", async ({ page }) => {
    await page.goto("/");
    expect(await footerHrefs(page)).toEqual(["/work"]);
    await chip(page, "Full-time").click();
    expect(await footerHrefs(page)).toEqual(["/work?type=full-time"]);
    await tab(page, "Branding & UI").click();
    await chip(page, "Business").click();
    expect(await footerHrefs(page)).toEqual([
      "/work-with-me",
      "/work?tab=branding&type=business",
    ]);
    await tab(page, "Websites").click();
    expect(await footerHrefs(page)).toEqual([
      "/websites",
      "/work?tab=websites",
    ]);
  });

  test("C4 story links and beats", async ({ page }) => {
    await page.goto("/");
    for (const t of await titles(page)) {
      await expect(story(page, t).locator("dt")).toHaveText([
        "Problem",
        "Decided",
        "Happened",
      ]);
    }
    await tab(page, "Branding & UI").click();
    await expect(
      story(page, "Taylor Aucoin").getByRole("link", {
        name: /Read the decision story/,
      }),
    ).toHaveCount(0);
    await tab(page, "Websites").click();
    await expect(
      story(page, "Kryshan Randel").getByRole("link", {
        name: /Read the decision story/,
      }),
    ).toHaveCount(0);

    await tab(page, "Product engineering").click();
    await story(page, "Everbook")
      .getByRole("link", { name: /Read the decision story/ })
      .click();
    await page.waitForURL("**/work/everbook");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("C5 thumbs and All n open the lightbox; Esc returns focus; empty galleries render nothing", async ({
    page,
  }) => {
    await page.goto("/");
    const cc = story(page, "Conscious Connections");
    const thumbs = cc.locator("[data-zoom-index]");
    const second = thumbs.nth(1);
    await second.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Thumbs are images 2 and 3 after the lead: the second thumb is image 3.
    await expect(dialog).toContainText("3 /");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(second).toBeFocused();

    const all = cc.getByRole("button", { name: /^All \d+ images$/ });
    await all.click();
    await expect(dialog).toContainText("1 /");
    await page.keyboard.press("Escape");
    await expect(all).toBeFocused();

    await tab(page, "Websites").click();
    const kr = story(page, "Kryshan Randel");
    await expect(kr.locator("img, [data-zoom-index], button")).toHaveCount(0);
  });

  test("C6 See the work focuses the first story's heading", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page
      .locator("main#main > section")
      .first()
      .getByRole("link", { name: "See the work" })
      .click();
    const heading = panel(page).locator("h3").first();
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
  });

  test("states by ?state=", async ({ page }) => {
    await page.goto("/?state=selected-work-websites");
    await expect(tab(page, "Websites")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.goto("/?state=selected-work-branding");
    await expect(tab(page, "Branding & UI")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.goto("/?state=selected-work-filtered");
    await expect(chip(page, "Full-time")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("C7 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const name of ["Product engineering", "Websites", "Branding & UI"]) {
    test(`${name}: no horizontal scroll, 44px targets, axe clean`, async ({
      page,
    }) => {
      await page.goto("/");
      await tab(page, name).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const small = await section(page)
        .locator("button, a")
        .evaluateAll((els) =>
          els
            .filter((el) => el.getBoundingClientRect().height < 44)
            .map((el) => el.textContent?.trim()),
        );
      expect(small).toEqual([]);
      await expectNoSeriousA11y(page, { include: "section#work" });
    });
  }
});
