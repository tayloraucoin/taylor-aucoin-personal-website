import { existsSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * SITE-26: /capabilities, its tabs and the close. Every Google host is
 * answered locally; C6's event is read from `dataLayer`, which the consent
 * gate's gtag stub fills, so nothing leaves the machine.
 */

const CALL = "Book a 30-minute call";
const CONSENT_KEY = "ta:analytics-consent";

const ALL = [
  "0→1 builds",
  "AI features",
  "Data and state architecture",
  "Specification",
  "Interface design",
  "Search and discovery",
  "Payments and tax",
  "AI engineering process",
  "Correctness",
  "Rendering performance",
  "System consolidation",
  "Booking and inventory",
  "Realtime sync",
  "Testing",
  "Component kits",
  "Scoping and roadmaps",
  "AI with a duty of care",
  "Realtime voice",
  "Senior velocity",
  "Loose briefs, finished product",
  "Metadata enrichment",
  "Animation and interaction",
  "Leading junior teams",
  "Branding",
  "Data pipelines",
];

const AI_DATA = [
  "AI features",
  "Data and state architecture",
  "Search and discovery",
  "AI engineering process",
  "System consolidation",
  "Realtime sync",
  "AI with a duty of care",
  "Realtime voice",
  "Metadata enrichment",
  "Data pipelines",
];

const TABS = [
  "All",
  "Product & design",
  "Engineering",
  "AI & data",
  "Leading delivery",
];

const tablist = (page: Page) => page.getByRole("tablist");
const selectedTab = (page: Page) =>
  tablist(page).locator("[role=tab][aria-selected=true]");
const chips = (page: Page) =>
  page.locator("main [role=tabpanel] > ul > li > button");
const chip = (page: Page, name: string) =>
  page.locator("main [role=tabpanel] > ul > li > button", {
    hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
  });
const card = (page: Page) => page.locator("main [role=tabpanel] li:has(h2)");

async function chipNames(page: Page) {
  return (await chips(page).allTextContents()).map((t) => t.trim());
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 the default view", async ({ page }) => {
    await page.goto("/capabilities");
    await expect(page.locator("main")).toHaveAttribute("id", "main");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Problems I take on");
    await expect(page.locator("main h1 + p")).toBeVisible();
    await expect(tablist(page).getByRole("tab")).toHaveText(TABS);
    await expect(selectedTab(page)).toHaveText("All");
    expect(await chipNames(page)).toEqual(ALL);
    await expect(
      chips(page).and(page.locator("[aria-expanded=true]")),
    ).toHaveCount(0);
    for (const slug of ["ab-testing", "read-replicas", "react-native-monorepo"])
      await expect(page.locator(`[aria-controls$="-${slug}"]`)).toHaveCount(0);
    await expect(page.locator("header [aria-current=page]")).toHaveText("Work");
  });

  test("C2 ?tab=ai-data, and unknown or blank tabs fall back to All", async ({
    page,
  }) => {
    await page.goto("/capabilities?tab=ai-data");
    await expect(selectedTab(page)).toHaveText("AI & data");
    expect(await chipNames(page)).toEqual(AI_DATA);

    for (const url of ["/capabilities?tab=nope", "/capabilities?tab="]) {
      await page.goto(url);
      await expect(selectedTab(page)).toHaveText("All");
      expect(await chipNames(page)).toEqual(ALL);
    }
  });

  test("C3 one tab stop; arrows, Home and End move and select by replaceState", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    await expect(tablist(page).locator("[tabindex='0']")).toHaveCount(1);
    await page.evaluate(() => {
      (window as unknown as { __stay: number }).__stay = 1;
    });
    const history = await page.evaluate(() => window.history.length);

    await selectedTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Product & design" }),
    ).toBeFocused();
    await expect(selectedTab(page)).toHaveText("Product & design");
    await expect(chips(page)).toHaveCount(4);
    await expect(page).toHaveURL(/\?tab=product-design$/);

    await page.keyboard.press("End");
    await expect(selectedTab(page)).toHaveText("Leading delivery");
    await expect(
      page.getByRole("tab", { name: "Leading delivery" }),
    ).toBeFocused();
    await expect(chips(page)).toHaveCount(7);
    await expect(page).toHaveURL(/\?tab=leading-delivery$/);

    await page.keyboard.press("ArrowRight");
    await expect(selectedTab(page)).toHaveText("All");
    await expect(page).toHaveURL(/\/capabilities$/);

    await page.keyboard.press("ArrowLeft");
    await expect(selectedTab(page)).toHaveText("Leading delivery");
    await page.keyboard.press("Home");
    await expect(selectedTab(page)).toHaveText("All");
    await expect(page).toHaveURL(/\/capabilities$/);
    await expect(chips(page)).toHaveCount(25);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(selectedTab(page)).toHaveText("AI & data");
    await expect(page).toHaveURL(/\?tab=ai-data$/);

    expect(await page.evaluate(() => window.history.length)).toBe(history);
    expect(
      await page.evaluate(
        () => (window as unknown as { __stay?: number }).__stay,
      ),
    ).toBe(1);

    // Tab leaves the strip for the first chip.
    await page.keyboard.press("Tab");
    await expect(chips(page).first()).toBeFocused();
  });

  test("C3 a tab change that drops an open card's chip closes it, focus on the tab", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    await chip(page, "Search and discovery").click();
    await expect(chip(page, "Search and discovery")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await selectedTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Product & design" }),
    ).toBeFocused();
    await expect(page.locator("main [aria-expanded=true]")).toHaveCount(0);
    await page.keyboard.press("Home");
    await expect(chip(page, "Search and discovery")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("C4 every shown chip has a proof, each pointing where D-SITE-141 says", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    const hrefs = new Map<string, string>();
    for (const name of ALL) {
      await chip(page, name).click();
      const proofs = card(page).locator("p").last().locator("a");
      expect(await proofs.count(), name).toBeGreaterThan(0);
      for (const a of await proofs.all())
        hrefs.set(
          (await a.innerText()).trim(),
          (await a.getAttribute("href")) ?? "",
        );
    }
    for (const [label, href] of hrefs) {
      if (label.startsWith("BCIT ISSP")) continue;
      expect(href, label).toMatch(/^\/work(\/[a-z0-9-]+|\?tab=[a-z]+)$/);
    }
    expect(hrefs.get("This site")).toBe("/work?tab=branding");
    expect(hrefs.get("consciousconnections.app")).toBe(
      "/work/conscious-connections",
    );
    expect(hrefs.get("the Future of Cities platform")).toBe(
      "/work/family-office-platform",
    );

    await chip(page, "Leading junior teams").click();
    const bcit = card(page).getByRole("link", { name: /BCIT ISSP/ });
    await expect(bcit).toHaveAttribute("href", /^https:\/\/www\.bcit\.ca\//);
    await expect(bcit).toHaveAttribute("target", "_blank");
    await expect(bcit).toHaveAccessibleName(/another site/);

    await chip(page, "Interface design").click();
    const names = card(page).locator("p").last().locator("a");
    await expect(names).toHaveText([
      "Everbook",
      "Conscious Connections",
      "the Future of Cities platform",
      "Agora",
    ]);
    const styles = await names.evaluateAll((els) =>
      els.map((el) => {
        const s = getComputedStyle(el);
        const span = el.parentElement!;
        return {
          weight: s.fontWeight,
          underline: s.textDecorationLine.includes("underline"),
          nowrap: getComputedStyle(span).whiteSpace === "nowrap",
          span: span.textContent,
        };
      }),
    );
    for (const s of styles) {
      expect(s.weight).toBe("500");
      expect(s.underline).toBe(true);
      expect(s.nowrap).toBe(true);
    }
    for (const s of styles.slice(0, -1)) expect(s.span).toMatch(/,$/);
  });

  test("C6 the close: the call, Send a note, no résumé, no email", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    const close = page.locator("[data-page-close]");
    await expect(close.getByRole("link", { name: CALL })).toHaveAttribute(
      "href",
      "/book",
    );
    await expect(
      close.getByRole("link", { name: "Send a note" }),
    ).toHaveAttribute("href", "/contact");
    const scope = page.locator("main, [data-page-close]");
    await expect(scope.getByRole("link", { name: /résumé|PDF/i })).toHaveCount(
      0,
    );
    await expect(scope.locator("a[href^='mailto:']")).toHaveCount(0);
    for (const text of await scope.allInnerTexts())
      expect(text).not.toMatch(/@/);
    expect(existsSync("components/capabilities/CapabilityGrid.tsx")).toBe(
      false,
    );
  });

  test("C6 with consent the close's call sends surface capabilities, placement close only", async ({
    page,
  }) => {
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    await page.route(
      (url) => url.pathname === "/book",
      (route) =>
        route.request().resourceType() === "document"
          ? route.fulfill({ status: 204 })
          : route.continue(),
    );
    await page.goto("/capabilities");
    await expect
      .poll(() =>
        page.evaluate(
          () => typeof (window as unknown as { gtag?: unknown }).gtag,
        ),
      )
      .toBe("function");
    await page
      .locator("[data-page-close]")
      .getByRole("link", { name: CALL })
      .click();
    const events = await page.evaluate(() =>
      (
        (window as unknown as { dataLayer: ArrayLike<unknown>[] }).dataLayer ??
        []
      )
        .map((entry) => Array.from(entry))
        .filter((a) => a[0] === "event" && a[1] === "book_call_click")
        .map((a) => a[2]),
    );
    expect(events).toEqual([{ surface: "capabilities", placement: "close" }]);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C2 the selected tab lies inside the strip's visible width", async ({
    page,
  }) => {
    for (const tab of ["ai-data", "leading-delivery"]) {
      await page.goto(`/capabilities?tab=${tab}`);
      const fits = await selectedTab(page).evaluate((el) => {
        const strip = el.closest("[role=tablist]")!.parentElement!;
        const s = strip.getBoundingClientRect();
        const t = el.getBoundingClientRect();
        return t.left >= s.left - 0.5 && t.right <= s.right + 0.5;
      });
      expect(fits, tab).toBe(true);
    }
  });

  test("C7 no sideways scroll with a card open", async ({ page }) => {
    await page.goto("/capabilities?state=card-open-four-proofs");
    await expect(chip(page, "Interface design")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test("C7 the skip link moves focus into main", async ({ page }) => {
  await page.goto("/capabilities");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect
    .poll(() =>
      page.evaluate(() => !!document.activeElement?.closest("main#main")),
    )
    .toBe(true);
});

for (const width of [390, 1440])
  for (const scheme of ["light", "dark"] as const)
    test(`C7 axe at ${width} ${scheme}: default, tab, card-open`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      for (const q of ["", "?state=tab", "?state=card-open"]) {
        await page.goto(`/capabilities${q}`);
        await expectNoSeriousA11y(page, { include: "main" });
      }
    });
