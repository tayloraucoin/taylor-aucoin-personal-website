import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-14: the work index. */

// The family office's names come from the parked note, never from the site.
const NOTE = readFileSync(
  "docs/_legacy/pending/cho-ventures-naming/NOTE.md",
  "utf8",
);
const FAMILY_OFFICE_NAMES = [
  "Cho Ventures",
  "Tony Cho",
  "ChoZen",
  "Future of Cities",
].filter((name) => NOTE.includes(name));

const tabsNav = (page: Page) => page.locator("main nav").nth(0);
const chipsNav = (page: Page) => page.locator("main nav").nth(1);
const h2s = (page: Page) => page.locator("main h2").allTextContents();
const h3s = (page: Page) => page.locator("main h3").allTextContents();

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 the default view, each tab's chips", async ({ page }) => {
    await page.goto("/work");
    await expect(page.locator("main")).toHaveAttribute("id", "main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
    await expect(tabsNav(page).locator("a")).toHaveText([
      "Product engineering",
      "Websites",
      "Branding & UI",
    ]);
    await expect(tabsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Product engineering",
    );
    await expect(chipsNav(page).locator("a")).toHaveText([
      "All",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    expect(await h2s(page)).toEqual([
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    expect(await h3s(page)).toEqual([
      "Everbook",
      "Roomvy",
      "Calculate by QxMD",
      "Multi-entity family office platform",
      "Agora",
      "Conscious Connections",
    ]);
    await expect(
      page.getByRole("link", { name: "Search every capability [draft]" }),
    ).toHaveAttribute("href", "/capabilities");

    await page.goto("/work?tab=branding");
    await expect(chipsNav(page).locator("a")).toHaveText([
      "All",
      "Business",
      "Passion projects",
      "Own brand",
    ]);
    await page.goto("/work?tab=websites");
    await expect(page.locator("main nav")).toHaveCount(1);
  });

  test("C2 chip by keyboard, reload, hrefs", async ({ page }) => {
    await page.goto("/work");
    const contract = chipsNav(page).getByRole("link", { name: "Contract" });
    await contract.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\?type=contract$/);
    await expect(chipsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Contract",
    );
    await expect(contract).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await h2s(page)).toEqual(["Contract"]);
    const box = await page.locator("main h2").boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
    await page.reload();
    await expect(chipsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Contract",
    );
    await expect(
      tabsNav(page).getByRole("link", { name: "Branding & UI" }),
    ).toHaveAttribute("href", "/work?tab=branding");
    await expect(contract).toHaveAttribute("href", "/work?type=contract");
  });

  test("C3 story links, repeated names", async ({ page }) => {
    await page.goto("/work");
    await page
      .getByRole("link", { name: "Read the decision story" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/work\/everbook$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto("/work?tab=branding");
    const rows = page.locator("main li").filter({ has: page.locator("h3") });
    const kit = rows.filter({ hasText: "Taylor Aucoin" });
    await expect(
      kit.getByRole("link", { name: "Read the decision story" }),
    ).toHaveCount(0);
    for (const title of ["Agora", "Conscious Connections"]) {
      const row = rows.filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      });
      await expect(row.locator("a").first()).toHaveText(
        "Read the decision story",
      );
    }
    const live = kit.locator("a[target=_blank]");
    await expect(live).toHaveAttribute("rel", "noopener noreferrer");
    const described = await page
      .locator("main section li a")
      .evaluateAll((els) =>
        els.every((a) => (a.getAttribute("aria-describedby") ?? "") !== ""),
      );
    expect(described).toBe(true);
  });

  test("C4 websites tab, gallery opener", async ({ page }) => {
    await page.goto("/work?tab=websites");
    expect(await h3s(page)).toEqual(["Kryshan Randel"]);
    await expect(page.locator("main li button")).toHaveCount(0);

    await page.goto("/work?state=gallery");
    const opener = page.getByRole("button", { name: "All 2 images" });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img")).toHaveAttribute(
      "alt",
      "Fixture image one",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("C6 no family office name in any tab", async ({ page }) => {
    for (const url of [
      "/work",
      "/work?tab=websites",
      "/work?tab=branding",
      "/work?type=contract",
    ]) {
      const html = await (await page.request.get(url)).text();
      for (const name of FAMILY_OFFICE_NAMES) {
        expect(html, `${name} on ${url}`).not.toContain(name);
      }
    }
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C5 no overflow, targets, meta, reduced motion, axe, skip link", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const url of [
      "/work",
      "/work?tab=websites",
      "/work?tab=branding",
      "/work?type=contract",
    ]) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, url).toBe(false);
      await expectNoSeriousA11y(page, { include: "main" });
    }

    await page.goto("/work");
    const heights = await page
      .locator("main nav a, main section li a")
      .evaluateAll((els) => els.map((a) => a.getBoundingClientRect().height));
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
    await expect(page.locator("main li p").first()).toHaveText(
      "Founding engineer · 2024 – 2025",
    );
    const durations = await page
      .locator("main nav a")
      .evaluateAll((els) =>
        els.map((a) => getComputedStyle(a).transitionDuration),
      );
    for (const d of durations) expect(parseFloat(d)).toBeLessThan(0.001);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toContainText("Work");
    expect(
      await page.evaluate(
        () => document.activeElement?.closest("main") !== null,
      ),
    ).toBe(true);
  });
});
