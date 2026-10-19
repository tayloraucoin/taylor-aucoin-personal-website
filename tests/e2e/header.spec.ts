import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-4: the header. Needs `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`
 * for C5, which reads real collect requests (gtag.js passes through; every
 * other Google request is answered 204 here).
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const NAV = [
  ["Work", "/work"],
  ["About", "/about"],
  ["Work with me", "/work-with-me"],
  ["Contact", "/contact"],
] as const;

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

function header(page: Page) {
  return page.locator("body > header, header").first();
}

test.describe("C3 at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const [path, current] of [
    ["/", null],
    ["/about", "About"],
    ["/services", "Work with me"],
    ["/work/conscious-connections", "Work"],
  ] as const) {
    test(`${path} holds the wordmark, the nav, one call link and the toggle`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await page.goto(path);
      const h = header(page);

      const links = await h
        .getByRole("link")
        .evaluateAll((els) =>
          els.map((a) => [
            a.textContent?.trim() || a.getAttribute("aria-label") || "",
            new URL((a as HTMLAnchorElement).href).pathname,
          ]),
        );
      // Wordmark (its svg carries the name), then the nav, then the call link.
      expect(links[0][1]).toBe("/");
      expect(links.slice(1)).toEqual([
        ...NAV.map(([label, href]) => [label, href]),
        ["Book a 30-minute call", "/book"],
      ]);
      await expect(h.getByRole("button", { name: "Theme" })).toBeVisible();
      await expect(h.getByText("Résumé")).toHaveCount(0);

      const nav = h.getByRole("navigation", { name: "Main" });
      const marked = nav.locator("[aria-current=page]");
      if (current === null) {
        await expect(marked).toHaveCount(0);
      } else {
        await expect(marked).toHaveCount(1);
        await expect(marked).toHaveText(current);
        const decoration = await marked.evaluate((el) => {
          const s = getComputedStyle(el);
          return [s.textDecorationLine, s.textDecorationThickness];
        });
        expect(decoration).toEqual(["underline", "2px"]);
      }

      // The header only: case-study bodies are rebuilt by their own ticket.
      await expectNoSeriousA11y(page, { include: "header" });
    });
  }
});

test.describe("C4 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of ["/", "/about"]) {
    test(`${path}: no call button, the nav on its own row`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await page.goto(path);
      const h = header(page);
      await expect(
        h.getByRole("link", { name: "Book a 30-minute call" }),
      ).toBeHidden();
      const toggle = await h
        .getByRole("button", { name: "Theme" })
        .boundingBox();
      const nav = await h
        .getByRole("navigation", { name: "Main" })
        .boundingBox();
      expect(nav!.y).toBeGreaterThanOrEqual(toggle!.y + toggle!.height);
    });
  }
});

test.describe("C4 the call button stays off /websites, chrome off intake, legal, admin", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const path of ["/websites", "/websites/coded", "/websites/platform"]) {
    test(`${path} has Contact and no call button`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await page.goto(path);
      const h = header(page);
      await expect(h.getByRole("link", { name: "Contact" })).toBeVisible();
      await expect(
        h.getByRole("link", { name: "Book a 30-minute call" }),
      ).toHaveCount(0);
    });
  }

  for (const path of [
    "/websites/coded/intake",
    "/websites/privacy",
    "/admin/login",
  ]) {
    test(`${path} renders no site header`, async ({ page, context }) => {
      await stubGoogle(context);
      await page.goto(path);
      await expect(page.getByRole("navigation", { name: "Main" })).toHaveCount(
        0,
      );
    });
  }
});

test.describe("C5 the header call button", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  /**
   * Until /book exists (SITE-21) the click is a full load of a 404, which
   * drops gtag's batched hit with the page. The /book document is answered
   * 204 so the page stays and the hit leaves; the request proves the link
   * went to /book. Once /book renders, assert page.waitForURL instead.
   */
  async function pressAndCollect(
    page: Page,
    context: BrowserContext,
    path: string,
  ) {
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
    await page.goto(path);
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    await header(page)
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    await expect.poll(() => wentToBook).toBe(true);
    return hits;
  }

  test("on /about sends surface about, placement header, nothing else", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    const hits = await pressAndCollect(page, context, "/about");
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
    expect(click["ep.surface"]).toBe("about");
    expect(click["ep.placement"]).toBe("header");
  });

  test("on a case study adds its slug", async ({ page, context }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    const hits = await pressAndCollect(
      page,
      context,
      "/work/conscious-connections",
    );
    await expect
      .poll(() => hits.filter((h) => h.en === "book_call_click").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const [click] = hits.filter((h) => h.en === "book_call_click");
    expect(click["ep.surface"]).toBe("case-study");
    expect(click["ep.slug"]).toBe("conscious-connections");
  });

  test("with consent declined sends nothing to Google and still goes to /book", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "denied"),
      [CONSENT_KEY],
    );
    await page.goto("/about");
    await header(page)
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    await page.waitForURL("**/book");
    await page.waitForTimeout(1_000);
    expect(google).toEqual([]);
  });
});

test("C6 dark with nothing stored whatever the system prefers; light after the toggle", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, colorScheme: "light" });
  await stubGoogle(context);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);

  const theme = header(page).getByRole("button", { name: "Theme" });
  await expect(theme).toHaveAccessibleDescription(
    "Dark is on; switches to light",
  );
  await theme.click();
  await expect(theme).toHaveAccessibleDescription(
    "Light is on; switches to dark",
  );
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await header(page).getByRole("button", { name: "Theme" }).click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await context.close();
});

test("feedback 2026-10-19: the theme control is Paper's one 36px button, not a three-way group", async ({
  page,
  context,
}) => {
  await stubGoogle(context);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const h = header(page);
  await expect(h.getByRole("group", { name: "Theme" })).toHaveCount(0);
  const theme = h.getByRole("button", { name: "Theme" });
  const box = await theme.boundingBox();
  expect([box!.width, box!.height]).toEqual([36, 36]);
  await expect(theme.locator("svg")).toHaveCount(1);
  await expectNoSeriousA11y(page, { include: "header" });
});
