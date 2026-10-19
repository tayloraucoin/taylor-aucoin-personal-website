import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-19: /work-with-me and the /services redirect. C4 needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`, which reads real collect
 * requests (gtag.js passes through; every other Google request is answered
 * 204 here).
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const CALL = "Book a 30-minute call";
const NOTE = "Send a note [draft]";

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

const main = (page: Page) => page.locator("main#main");

test("C1 /services answers 308 with the query kept; /work-with-me answers 200", async ({
  request,
}) => {
  for (const [from, to] of [
    ["/services", "/work-with-me"],
    ["/services?x=1", "/work-with-me?x=1"],
  ]) {
    const r = await request.get(from, { maxRedirects: 0 });
    expect(r.status()).toBe(308);
    expect(r.headers().location).toBe(to);
  }
  const ok = await request.get("/work-with-me", { maxRedirects: 0 });
  expect(ok.status()).toBe(200);
});

test("C2 the page in order: roles, building, the price line once", async ({
  page,
}) => {
  await page.goto("/work-with-me");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Work with me",
  );
  const h2s = await main(page)
    .getByRole("heading", { level: 2 })
    .allTextContents();
  expect(h2s.map((t) => t.replace(/ \[draft\]/, ""))).toEqual([
    "Roles",
    "Building, for clients",
    "How I work",
    "How to start",
    "FAQ",
  ]);
  const roles = page.locator("section", {
    has: page.getByRole("heading", { name: /^Roles/, level: 2 }),
  });
  await expect(roles.getByRole("heading", { level: 3 })).toHaveText([
    "Product engineer",
    "Product designer",
    "Systems consultant",
    "Fractional CTO",
    "0→1 build",
  ]);
  for (const li of await roles.locator("li").all()) {
    expect((await li.locator("p").allTextContents()).length).toBe(3);
  }
  const building = page.locator("section", {
    has: page.getByRole("heading", { name: /^Building/, level: 2 }),
  });
  const rows = await building
    .getByRole("heading", { level: 3 })
    .allTextContents();
  expect(rows.map((t) => t.replace(/ \[draft\]/, ""))).toEqual([
    "Coded website",
    "Branding",
    "Conventions install",
  ]);
  await expect(building.getByText("$2,000 CAD + GST")).toHaveCount(1);
  await expect(page.getByText("Most engagements land between")).toHaveCount(1);
  const text = (await main(page).innerText()).toLowerCase();
  expect(text).not.toMatch(/marketing/);
});

test("C3 notes go to /contact, calls to /book, no Cal.com, one primary per block", async ({
  page,
}) => {
  await page.goto("/work-with-me");
  const notes = page.getByRole("link", { name: /^Send a note/ });
  expect(await notes.count()).toBe(5);
  for (const n of await notes.all())
    await expect(n).toHaveAttribute("href", "/contact");
  const calls = page.getByRole("link", { name: CALL });
  expect(await calls.count()).toBeGreaterThanOrEqual(3); // header, hero, close
  for (const c of await calls.all())
    await expect(c).toHaveAttribute("href", "/book");
  await expect(
    page.getByRole("link", { name: "Websites", exact: true }),
  ).toHaveAttribute("href", "/websites");
  await expect(
    page.getByRole("link", { name: "Branding & UI" }),
  ).toHaveAttribute("href", "/work?tab=branding");
  const hrefs = await page
    .locator("a")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  expect(hrefs.filter((h) => h.includes("cal.com"))).toEqual([]);

  for (const [scope, label] of [
    [main(page).locator("section").first(), "hero"],
    [page.locator("[data-page-close]"), "close"],
  ] as const) {
    const filled = await scope
      .locator("a")
      .evaluateAll((els) =>
        els
          .filter(
            (a) => getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)",
          )
          .map((a) => a.textContent?.trim()),
      );
    expect(filled, label).toEqual([NOTE]);
  }
});

test.describe("C4 events", () => {
  async function collect(page: Page, context: BrowserContext) {
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
    await page.route(
      (url) => url.pathname === "/book",
      (route) =>
        route.request().resourceType() === "document"
          ? route.fulfill({ status: 204 })
          : route.continue(),
    );
    return hits;
  }

  for (const [placement, pick] of [
    ["hero", (p: Page) => main(p).locator("section").first()],
    ["close", (p: Page) => p.locator("[data-page-close]")],
  ] as const) {
    test(`with consent the ${placement} call sends surface services and placement ${placement}`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await page.addInitScript(
        ([k]) => localStorage.setItem(k, "granted"),
        [CONSENT_KEY],
      );
      const hits = await collect(page, context);
      await page.goto("/work-with-me");
      await expect
        .poll(() => hits.some((h) => h.en === "page_view"))
        .toBe(true);
      await pick(page).getByRole("link", { name: CALL }).click();
      await expect
        .poll(() => hits.filter((h) => h.en === "book_call_click").length, {
          timeout: 15_000,
        })
        .toBe(1);
      const click = hits.find((h) => h.en === "book_call_click")!;
      const params = Object.keys(click).filter(
        (k) => k.startsWith("ep.") || k.startsWith("epn."),
      );
      expect(params.sort()).toEqual(["ep.placement", "ep.surface"]);
      expect(click["ep.surface"]).toBe("services");
      expect(click["ep.placement"]).toBe(placement);
    });
  }

  test("with consent declined no request reaches a Google host", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "denied"),
      [CONSENT_KEY],
    );
    await page.goto("/work-with-me");
    await main(page).getByRole("link", { name: CALL }).click();
    await page.waitForURL("**/book");
    await page.waitForTimeout(1_000);
    expect(google).toEqual([]);
  });
});

test("C5 FAQ open, 390 layout, axe, skip link", async ({ page, browser }) => {
  await page.goto("/work-with-me");
  const faq = page.locator("section", {
    has: page.getByRole("heading", { name: "FAQ", level: 2 }),
  });
  await expect(faq.locator("details, button, [aria-expanded]")).toHaveCount(0);
  for (const dd of await faq.locator("dd").all())
    await expect(dd).toBeVisible();

  for (const colorScheme of ["dark", "light"] as const) {
    for (const width of [1440, 390]) {
      await page.emulateMedia({ colorScheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work-with-me");
      await expectNoSeriousA11y(page, { include: "main" });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work-with-me");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
  const hero = main(page).locator("section").first();
  for (const b of await hero.getByRole("link").all()) {
    const box = (await b.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThan(300);
  }
  for (const a of await main(page).locator("li a").all()) {
    expect((await a.boundingBox())!.height).toBeGreaterThanOrEqual(24);
  }
  await expect(page.locator("main#main")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  expect(
    await page.evaluate(
      () =>
        !!document.activeElement?.closest("main#main") ||
        document.activeElement?.id === "main",
    ),
  ).toBe(true);
  void browser;
});
