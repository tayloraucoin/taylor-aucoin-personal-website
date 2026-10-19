import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * SITE-27: the /capabilities filter. Every Google host is answered locally;
 * C6 reads every gtag() call from `dataLayer`, so nothing leaves the machine.
 */

const LABEL = "Filter by problem or tool";
const CLEAR = "Clear the filter";
const NO_MATCH = "Nothing by that name.";
const CONSENT_KEY = "ta:analytics-consent";

const field = (page: Page) => page.getByRole("searchbox", { name: LABEL });
const xButton = (page: Page) =>
  page.locator("main input[type=search] ~ button");
const chips = (page: Page) =>
  page.locator("main [role=tabpanel] > ul > li > button");
const panel = (page: Page) => page.locator("main [role=tabpanel]");
const selectedTab = (page: Page) =>
  page.locator("[role=tab][aria-selected=true]");
const tab = (page: Page, name: string) => page.getByRole("tab", { name });

async function names(page: Page) {
  return (await chips(page).allTextContents()).map((t) => t.trim());
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 typing filters at once by replaceState; ?q= loads the same; blank is default", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    const history = await page.evaluate(() => window.history.length);
    await field(page).pressSequentially("realtime");
    expect(await names(page)).toEqual([
      "AI features",
      "Realtime sync",
      "Realtime voice",
    ]);
    await expect(panel(page)).toHaveAttribute("data-fade", "idle");
    expect(
      await panel(page).evaluate(
        (el) => el.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
    await expect(page).toHaveURL(/\/capabilities\?q=realtime$/);
    expect(await page.evaluate(() => window.history.length)).toBe(history);

    await page.goto("/capabilities?q=realtime");
    await expect(field(page)).toHaveValue("realtime");
    await expect(chips(page)).toHaveCount(3);

    await page.goto("/capabilities?q=");
    await expect(field(page)).toHaveValue("");
    await expect(chips(page)).toHaveCount(25);
    await expect(selectedTab(page)).toHaveText("All");
  });

  test("C2 a tab change keeps the query; typing keeps the tab; a dropped card closes in place", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    await field(page).fill("realtime");
    await tab(page, "Product & design").click();
    await expect(field(page)).toHaveValue("realtime");
    await expect(page).toHaveURL(/q=realtime/);
    await expect(page).toHaveURL(/tab=product-design/);
    await expect(chips(page)).toHaveCount(0);
    await tab(page, "AI & data").click();
    await expect(chips(page)).toHaveCount(3);
    await field(page).fill("realtimex");
    await expect(selectedTab(page)).toHaveText("AI & data");
    await expect(chips(page)).toHaveCount(0);

    // A query that drops the open card leaves focus in the field.
    await page.goto("/capabilities");
    await chips(page)
      .filter({ hasText: /^Realtime sync$/ })
      .click();
    await expect(page.locator("main [aria-expanded=true]")).toHaveCount(1);
    await field(page).click();
    await page.keyboard.type("payments");
    await expect(page.locator("main [aria-expanded=true]")).toHaveCount(0);
    await expect(field(page)).toBeFocused();

    // A tab that drops it leaves focus on the tab.
    await page.goto("/capabilities");
    await chips(page)
      .filter({ hasText: /^Realtime sync$/ })
      .click();
    await selectedTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("main [aria-expanded=true]")).toHaveCount(0);
    await expect(tab(page, "Product & design")).toBeFocused();
  });

  test("C3 no match, then Clear the filter and × each restore and focus the field", async ({
    page,
  }) => {
    await page.goto("/capabilities?tab=engineering");
    for (const how of ["link", "x"] as const) {
      await field(page).fill("kubernetes");
      await expect(panel(page).getByText(NO_MATCH)).toBeVisible();
      await expect(
        panel(page).getByRole("link", { name: "Send a note" }),
      ).toHaveAttribute("href", "/contact");
      if (how === "link")
        await panel(page).getByRole("button", { name: CLEAR }).click();
      else {
        await expect(xButton(page)).toHaveAccessibleName(CLEAR);
        await xButton(page).click();
      }
      await expect(field(page)).toHaveValue("");
      await expect(field(page)).toBeFocused();
      await expect(chips(page)).toHaveCount(6);
      await expect(page).toHaveURL(/\/capabilities\?tab=engineering$/);
    }
  });

  test("C4 one polite status, spoken once after typing rests and once per tab change", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    const status = page.getByRole("status");
    await expect(status).toHaveCount(1);
    await expect(status).toHaveAttribute("aria-live", "polite");
    await page.evaluate(() => {
      const w = window as unknown as { __changes: string[] };
      w.__changes = [];
      const el = document.querySelector("main [role=status]")!;
      new MutationObserver(() =>
        w.__changes.push(el.textContent ?? ""),
      ).observe(el, { childList: true, characterData: true, subtree: true });
    });
    const changes = () =>
      page.evaluate(
        () => (window as unknown as { __changes: string[] }).__changes,
      );

    await field(page).pressSequentially("realtime", { delay: 60 });
    await page.waitForTimeout(900);
    expect(await changes()).toHaveLength(1);
    expect((await changes())[0]).toMatch(/\b3\b/);

    await tab(page, "Engineering").click();
    await page.waitForTimeout(300);
    expect(await changes()).toHaveLength(2);
    expect((await changes())[1]).toBe(NO_MATCH);
    await tab(page, "AI & data").click();
    await page.waitForTimeout(300);
    expect(await changes()).toHaveLength(3);
    expect((await changes())[2]).toMatch(/\b3\b/);

    await field(page).fill("kubernetes");
    await expect(status).toHaveText(NO_MATCH);
  });

  test("C5 under reduced motion every transition here is 0s, after a pointer tab change too", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/capabilities?state=card-open");
    await tab(page, "AI & data").click();
    const slow = await page
      .locator(
        "main [role=tabpanel], main [role=tabpanel] *, main [role=tab], main input",
      )
      .evaluateAll((els) =>
        els
          .map((el) => getComputedStyle(el))
          .flatMap((s) => [
            ...s.transitionDuration.split(","),
            ...s.animationDuration.split(","),
          ])
          .map((d) => d.trim())
          .filter((d) => d !== "0s"),
      );
    expect(slow).toEqual([]);
  });

  test("C5 a pointer tab change holds scroll; a keyboard one animates nothing", async ({
    page,
  }) => {
    await page.goto("/capabilities");
    await page.evaluate(() => window.scrollTo({ top: 200 }));
    await tab(page, "Engineering").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBe(200);
    await expect(panel(page)).toHaveAttribute("data-fade", "idle");

    await selectedTab(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(panel(page)).toHaveAttribute("data-fade", "idle");
    expect(
      await panel(page).evaluate(
        (el) => el.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
  });

  test("C6 neither the query nor q= reaches any gtag call", async ({
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
    await field(page).fill("sentinel");
    await tab(page, "Engineering").click();
    await page.waitForTimeout(700);
    await page
      .locator("[data-page-close]")
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    const calls = await page.evaluate(() =>
      JSON.stringify(
        (
          (window as unknown as { dataLayer?: ArrayLike<unknown>[] })
            .dataLayer ?? []
        ).map((entry) => Array.from(entry)),
      ),
    );
    expect(calls).toContain("book_call_click");
    expect(calls).not.toContain("sentinel");
    expect(calls).not.toMatch(/[?&]q=/);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C7 the ×, Clear the filter and Send a note are 44px targets; no sideways scroll", async ({
    page,
  }) => {
    const big = async (loc: ReturnType<Page["locator"]>) => {
      const box = (await loc.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    };
    const noScroll = async () =>
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(0);

    await page.goto("/capabilities?state=filtered");
    await expect(chips(page)).toHaveCount(3);
    await big(xButton(page));
    await noScroll();

    await page.goto("/capabilities?state=filter-empty");
    await expect(panel(page).getByText(NO_MATCH)).toBeVisible();
    await big(panel(page).getByRole("button", { name: CLEAR }));
    await big(panel(page).getByRole("link", { name: "Send a note" }));
    await noScroll();
  });
});

for (const width of [390, 1440])
  for (const scheme of ["light", "dark"] as const)
    test(`C7 axe at ${width} ${scheme}: filtered, filter-empty`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: scheme });
      for (const state of ["filtered", "filter-empty"]) {
        await page.goto(`/capabilities?state=${state}`);
        await expectNoSeriousA11y(page, { include: "main" });
      }
    });
