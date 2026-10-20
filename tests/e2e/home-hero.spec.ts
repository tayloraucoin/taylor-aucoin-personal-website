import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-9: home's hero and proof bar. Needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` for C2, which reads real
 * collect requests (gtag.js passes through; every other Google request is
 * answered 204 here).
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const CALL = "Book a 30-minute call";
const BAR = [
  ["Since 2016", "building software"],
  ["13 products", "zero to one, and counting"],
  [
    "22 cohorts taught and sponsored",
    "BCIT ISSP · VFC · FLUI · SFU co-op · virtual intern",
  ],
  [
    "Five roles",
    "product engineer · product designer · systems consultant · fractional CTO · 0→1 build",
  ],
];

async function stubGoogle(context: BrowserContext) {
  const google: string[] = [];
  await context.route(
    (url) =>
      isGoogleHost(url.hostname) &&
      !(
        url.hostname === "www.googletagmanager.com" &&
        url.pathname === "/gtag/js"
      ),
    (route) => route.fulfill({ status: 204 }),
  );
  context.on("request", (r) => {
    if (isGoogleHost(new URL(r.url()).hostname)) google.push(r.url());
  });
  return google;
}

function hero(page: Page) {
  return page.locator("main#main > section").first();
}

function bar(page: Page) {
  return page.getByRole("region", { name: "Proof" });
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 the hero in order, one primary, the headshot right", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.goto("/");
    const h = hero(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const order = await h
      .locator("p, h1, a")
      .evaluateAll((els) => els.map((e) => e.textContent?.trim()));
    expect(order).toEqual([
      "Product engineer",
      "Taylor Aucoin",
      "The whole product, thought through.",
      "Product Engineer, building software for over a decade. I shape the problem, ship it, and set it up to be measured, with my judgment over the AI.",
      CALL,
      "See the work",
    ]);

    const call = h.getByRole("link", { name: CALL });
    await expect(call).toHaveAttribute("href", "/book");
    // The one primary-styled control: the only filled link in the hero.
    const filled = await h
      .locator("a")
      .evaluateAll((els) =>
        els
          .filter(
            (a) => getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)",
          )
          .map((a) => a.textContent?.trim()),
      );
    expect(filled).toEqual([CALL]);

    const img = await h.getByRole("img").boundingBox();
    const name = await h.getByRole("heading", { level: 1 }).boundingBox();
    expect(Math.round(img!.width)).toBe(176);
    expect(img!.x).toBeGreaterThan(name!.x + name!.width);

    await expectNoSeriousA11y(page, { include: "main#main > section" });
  });

  test("C1 the skip link moves focus into main#main", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            !!document.activeElement?.closest("main#main") ||
            document.activeElement?.id === "main",
        ),
      )
      .toBe(true);
  });

  test("C3 the bar: four cells in order, side by side, nothing changes after load", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.goto("/");
    const cells = bar(page).getByRole("listitem");
    await expect(cells).toHaveCount(4);
    const first = await cells.evaluateAll((els) =>
      els.map((li) => [...li.querySelectorAll("p")].map((p) => p.textContent)),
    );
    expect(first).toEqual(BAR);

    const boxes = await cells.evaluateAll((els) =>
      els.map((e) => e.getBoundingClientRect().top),
    );
    expect(new Set(boxes.map(Math.round)).size).toBe(1);

    await expect(page.getByText("Signal", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Years shipping")).toHaveCount(0);
    await expect(page.getByText("Cohorts mentored")).toHaveCount(0);

    await page.waitForTimeout(1_500);
    const later = await cells.evaluateAll((els) =>
      els.map((li) => [...li.querySelectorAll("p")].map((p) => p.textContent)),
    );
    expect(later).toEqual(first);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C1 headshot before the h1, buttons span the column; C3 the bar stacks", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.goto("/");
    const h = hero(page);
    const img = await h.getByRole("img").boundingBox();
    const name = await h.getByRole("heading", { level: 1 }).boundingBox();
    expect(img!.y + img!.height).toBeLessThanOrEqual(name!.y);

    const column = await h.boundingBox();
    for (const label of [CALL, "See the work"]) {
      const b = await h.getByRole("link", { name: label }).boundingBox();
      expect(Math.round(b!.width)).toBe(Math.round(column!.width));
    }

    const tops = await bar(page)
      .getByRole("listitem")
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    expect(new Set(tops.map(Math.round)).size).toBe(4);
  });

  test("C5 no horizontal scroll; both hero buttons at least 44px", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    for (const label of [CALL, "See the work"]) {
      const b = await hero(page)
        .getByRole("link", { name: label })
        .boundingBox();
      expect(b!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("C4 with the banner up, the call, Accept and Decline are in view", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: { width: 390, height: 844 },
      extraHTTPHeaders: { "x-vercel-ip-country": "DE" },
    });
    await stubGoogle(context);
    const page = await context.newPage();
    await page.goto("/");
    const inView = async (loc: Locator) => {
      const b = await loc.boundingBox();
      expect(b).not.toBeNull();
      expect(b!.x).toBeGreaterThanOrEqual(0);
      expect(b!.y).toBeGreaterThanOrEqual(0);
      expect(b!.x + b!.width).toBeLessThanOrEqual(390);
      expect(b!.y + b!.height).toBeLessThanOrEqual(844);
    };
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible();
    await inView(hero(page).getByRole("link", { name: CALL }));
    await inView(page.getByRole("button", { name: "Accept" }));
    await inView(page.getByRole("button", { name: "Decline" }));
    await context.close();
  });
});

test.describe("C2 the hero's call", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /**
   * Until /book exists the click is a full load of a 404, which drops gtag's
   * batched hit with the page. The /book document is answered 204 so the
   * page stays and the hit leaves; the request proves the link went to /book.
   */
  async function pressAndCollect(page: Page, context: BrowserContext) {
    const hits: Record<string, string>[] = [];
    context.on("request", (r) => {
      const url = new URL(r.url());
      if (!url.pathname.endsWith("/g/collect")) return;
      const base = Object.fromEntries(url.searchParams);
      const lines = (r.postData() ?? "").split("\n").filter(Boolean);
      for (const line of lines.length ? lines : [""])
        hits.push({
          ...base,
          ...Object.fromEntries(new URLSearchParams(line)),
        });
    });
    let wentToBook = false;
    await page.route(
      (url) => url.pathname === "/book",
      (route) => {
        if (route.request().resourceType() !== "document")
          return route.continue();
        wentToBook = true;
        return route.fulfill({ status: 204 });
      },
    );
    await page.goto("/");
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    await hero(page).getByRole("link", { name: CALL }).click();
    await expect.poll(() => wentToBook).toBe(true);
    return hits;
  }

  test("with consent sends surface home, placement hero, nothing else", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    const hits = await pressAndCollect(page, context);
    await expect
      .poll(() => hits.filter((h) => h.en === "book_call_click").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const [click] = hits.filter((h) => h.en === "book_call_click");
    const params = Object.keys(click).filter(
      (k) => k.startsWith("ep.") || k.startsWith("epn."),
    );
    expect(params.sort()).toEqual(["ep.placement", "ep.surface"]);
    expect(click["ep.surface"]).toBe("home");
    expect(click["ep.placement"]).toBe("hero");
  });

  test("with consent declined nothing reaches Google and it lands on /book", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "denied"),
      [CONSENT_KEY],
    );
    await page.goto("/");
    await hero(page).getByRole("link", { name: CALL }).click();
    await page.waitForURL("**/book");
    await page.waitForTimeout(1_000);
    expect(google).toEqual([]);
  });
});
