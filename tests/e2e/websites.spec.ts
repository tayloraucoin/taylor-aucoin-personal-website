import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-25: the coded websites page at /websites. C6 needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`, which reads real collect
 * requests (gtag.js passes through; every other Google request is answered
 * 204 here).
 */
test.use({ realGoogle: true });

const PATH = "/websites";
const START = "/websites/coded/intake";
const CONSENT_KEY = "ta:analytics-consent";

const H2S = [
  "What you actually own",
  "What it costs",
  "Sites I've built [draft]",
  "Changes after the build",
  "What you get",
  "How it goes",
  "Worth saying up front",
  "Questions",
];

const main = (page: Page) => page.locator("main#main");

test.describe("C1 to C5 at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 one h1, h2s in order, a plain hero, the price", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Websites for creative work");
    expect(await main(page).locator("h2").allInnerTexts()).toEqual(H2S);

    const hero = main(page).locator("section").first();
    const heroLinks = await hero.getByRole("link").all();
    expect(heroLinks).toHaveLength(1);
    await expect(heroLinks[0]).toHaveClass(/bg-\(--color-fill\)/);
    await expect(hero).not.toContainText("Agora Network Technologies");
    await expect(hero.locator("dl")).toHaveCount(0);

    const text = await main(page).innerText();
    expect(text).toContain("$2,000");
    expect(text).toContain("CAD + GST");
  });

  test("C2 three Start your site links to the intake, the call to /book, no Cal.com", async ({
    page,
  }) => {
    await page.goto(PATH);
    const starts = main(page).getByRole("link", {
      name: "Start your site",
      exact: true,
    });
    await expect(starts).toHaveCount(3);
    for (const link of await starts.all())
      await expect(link).toHaveAttribute("href", START);
    await expect(
      main(page).getByRole("link", { name: "Book a call first" }),
    ).toHaveAttribute("href", "/book");
    await expect(page.locator('a[href*="cal.com"]')).toHaveCount(0);
  });

  test("C4 Kryshan Randel's row only, no hidden rows or retired names", async ({
    page,
  }) => {
    await page.goto(PATH);
    const sites = page.locator("#sites");
    await expect(sites.locator("[data-example-row]")).toHaveCount(1);
    await expect(sites.locator("h3")).toHaveText(["Kryshan Randel"]);
    const text = (await main(page).innerText()).toLowerCase();
    for (const word of [
      "holistica",
      "phoenix",
      "care plan",
      "needs decision",
      "durable",
      "clean coast",
      "family office",
      "marketing service",
    ])
      expect(text, word).not.toContain(word);
    expect(existsSync("components/websites/coded/CodedCase.tsx")).toBe(false);
    expect(existsSync("content/websites-coded-case.ts")).toBe(false);
  });

  test("C5 the first FAQ item is open, each toggles by Enter and Space", async ({
    page,
  }) => {
    await page.goto(PATH);
    const items = page.locator("#questions details");
    const count = await items.count();
    expect(count).toBe(9);
    for (let i = 0; i < count; i++)
      expect(
        await items.nth(i).evaluate((d) => (d as HTMLDetailsElement).open),
      ).toBe(i === 0);

    const second = items.nth(1);
    await second.locator("summary").focus();
    await page.keyboard.press("Enter");
    await expect(second).toHaveAttribute("open", "");
    await page.keyboard.press("Space");
    await expect(second).not.toHaveAttribute("open", "");
  });

  test("C5 Tab walks main in DOM order with a 2px outline; the skip link lands in main", async ({
    page,
  }) => {
    await page.goto(PATH);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.getElementById("main")!.contains(document.activeElement),
        ),
      )
      .toBe(true);

    const order = await main(page).evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>("a[href], button, summary")]
        .filter((n) => n.offsetParent !== null)
        .map((n, i) => (n.dataset.tabProbe = String(i))),
    );
    const seen: { probe: string; outline: string }[] = [];
    for (let i = 0; i < order.length + 40 && seen.length < order.length; i++) {
      await page.keyboard.press("Tab");
      const hit = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement | null;
        if (!a?.dataset.tabProbe) return null;
        const s = getComputedStyle(a);
        return {
          probe: a.dataset.tabProbe,
          outline: `${s.outlineStyle} ${s.outlineWidth}`,
        };
      });
      if (hit) seen.push(hit);
    }
    expect(seen.map((s) => s.probe)).toEqual(order);
    for (const s of seen)
      expect(s.outline, `probe ${s.probe}`).toBe("solid 2px");
  });
});

/** No dollar amount in a string literal or JSX text of the page's components. */
test("C1 no price literal in the page or its components", () => {
  const files = [
    "app/websites/page.tsx",
    ...readdirSync("app/websites/_components").map((f) =>
      join("app/websites/_components", f),
    ),
    ...["WebsitesHero", "Pricing", "Process", "Changes", "WebsitesClose"].map(
      (c) => `components/websites/${c}.tsx`,
    ),
  ];
  const offenders = files.filter((file) =>
    /\$\s?\d/.test(
      readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`])\/\/.*$/gm, "$1"),
    ),
  );
  expect(offenders).toEqual([]);
});

test.describe("C6 events", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function consent(context: BrowserContext, value: string) {
    await context.addInitScript(
      ([k, v]) => localStorage.setItem(k, v),
      [CONSENT_KEY, value],
    );
  }

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

  function collect(context: BrowserContext) {
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
    return hits;
  }

  test("Book a call first sends one book_call_click {surface, placement}", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await consent(context, "granted");
    const hits = collect(context);
    await page.goto(PATH);
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    await page.getByRole("link", { name: "Book a call first" }).click();
    await page.waitForURL("**/book");
    const sent = () => hits.filter((h) => h.en === "book_call_click");
    await expect.poll(() => sent().length, { timeout: 15_000 }).toBe(1);
    const params = Object.keys(sent()[0]).filter((k) => k.startsWith("ep."));
    expect(params.sort()).toEqual(["ep.placement", "ep.surface"]);
    expect(sent()[0]["ep.surface"]).toBe("websites");
    expect(sent()[0]["ep.placement"]).toBe("close");
  });

  test("a Start your site click sends no event", async ({ page, context }) => {
    await stubGoogle(context);
    await consent(context, "granted");
    const hits = collect(context);
    await page.goto(PATH);
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    const before = hits.length;
    await main(page)
      .getByRole("link", { name: "Start your site", exact: true })
      .first()
      .click();
    await page.waitForURL(`**${START}`);
    await page.waitForTimeout(1_000);
    expect(
      hits.slice(before).filter((h) => h.en && h.en !== "page_view"),
    ).toEqual([]);
  });

  test("with consent declined no request reaches a Google host", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await consent(context, "denied");
    await page.goto(PATH);
    await page.getByRole("link", { name: "Book a call first" }).click();
    await page.waitForURL("**/book");
    await page.waitForTimeout(500);
    expect(google).toEqual([]);
  });
});

test("C7 the head holds noindex, nofollow and the page's social card", async ({
  page,
}) => {
  await page.goto(PATH);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex, nofollow/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Websites for creative work",
  );
});

test.describe("C7 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("no horizontal scroll, full-width 44px primaries, 24px links", async ({
    page,
  }) => {
    await page.goto(PATH);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const starts = main(page).getByRole("link", {
      name: "Start your site",
      exact: true,
    });
    const width = await main(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return (
        el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)
      );
    });
    for (const link of await starts.all()) {
      const box = (await link.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(Math.round(box.width)).toBe(Math.round(width));
    }
    const small = await main(page).evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>("a[href], button")]
        .filter((n) => n.offsetParent !== null)
        .filter((n) => n.getBoundingClientRect().height < 24)
        .map((n) => n.textContent?.trim()),
    );
    expect(small).toEqual([]);
  });
});

for (const scheme of ["dark", "light"] as const) {
  for (const width of [390, 1440]) {
    test(`C7 axe at ${width} ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(PATH);
      await expectNoSeriousA11y(page, { include: "main" });
    });
  }
}
