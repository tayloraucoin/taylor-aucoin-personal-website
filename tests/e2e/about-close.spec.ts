import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-18: About's lower half, Tools through the close. C4's event needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`, which reads real collect
 * requests (gtag.js passes through; every other Google request is answered
 * 204 here).
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const CALL = "Book a 30-minute call";

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

test("C1 the h2s in order, Tools core only in five groups, résumé links name (PDF)", async ({
  page,
}) => {
  await page.goto("/about");
  const h2s = await page.locator("main h2").allTextContents();
  expect(h2s).toEqual([
    "How I think",
    "Experience",
    "Teaching & Sponsoring Programs",
    "Education",
    "Tools",
    "Testimonials",
    "Off the clock",
  ]);
  const tools = page.locator("#tools");
  await expect(tools.locator("dt")).toHaveCount(5);
  await expect(tools.getByText("Tailwind CSS")).toBeVisible();
  await expect(tools.getByText("Cypress")).toHaveCount(0);
  const resume = page
    .locator("main, [data-page-close]")
    .getByRole("link", { name: /\(PDF\)/ });
  // Tools and the close, each a dark-mode résumé and its print version.
  const hrefs = await resume.evaluateAll((els) =>
    els.map((a) => a.getAttribute("href")),
  );
  expect(hrefs).toEqual([
    "/taylor-aucoin-resume-dark.pdf",
    "/taylor-aucoin-resume.pdf",
    "/taylor-aucoin-resume-dark.pdf",
    "/taylor-aucoin-resume.pdf",
  ]);
});

test("C2 four testimonials in full under two subheads, no tabs", async ({
  page,
}) => {
  await page.goto("/about");
  const sec = page.locator("#testimonials");
  await expect(sec.getByRole("heading", { level: 3 })).toHaveText([
    "People I worked for",
    "Engineers I led",
  ]);
  await expect(sec.locator("figure")).toHaveCount(4);
  await expect(sec.locator("figure blockquote")).toHaveCount(4);
  await expect(sec.locator("figure figcaption")).toHaveCount(4);
  await expect(page.getByRole("tablist")).toHaveCount(0);
  const text = await sec.innerText();
  for (const n of [
    "Dawson Whitfield",
    "Bruno",
    "Vaughn Richards",
    "Yogesh Verma",
  ])
    expect(text).toContain(n);
  expect(text).not.toContain("Micheal Ozdoba");
  expect(text).not.toContain("Pending approval");
  expect(text).toContain("I highly recommend Taylor to any organization");
});

test("C3 pending-testimonial shows one synthetic card under Engineers I led", async ({
  page,
}) => {
  await page.goto("/about?state=pending-testimonial");
  const sec = page.locator("#testimonials");
  await expect(sec.getByText("Pending approval")).toHaveCount(1);
  await expect(sec.locator("figure")).toHaveCount(5);
  const led = sec
    .locator("div", {
      has: page.getByRole("heading", { name: "Engineers I led" }),
    })
    .last();
  await expect(led.locator("figure").last()).toContainText("Alex Example");
  await expect(led.locator("figure").last()).toContainText("[Synthetic]");
  expect(await sec.innerText()).not.toContain("Micheal Ozdoba");
});

test("C4 one primary, no Cal.com, Send a note to /contact, no email", async ({
  page,
}) => {
  await page.goto("/about");
  const filled = await page
    .locator("main a, main button, [data-page-close] a")
    .evaluateAll((els) =>
      els
        .filter(
          (a) => getComputedStyle(a).backgroundColor !== "rgba(0, 0, 0, 0)",
        )
        .map((a) => a.textContent?.trim()),
    );
  expect(filled).toEqual([CALL]);
  const close = page.locator("[data-page-close]");
  await expect(close.getByRole("link", { name: CALL })).toHaveAttribute(
    "href",
    "/book",
  );
  await expect(close.getByText("Not ready to book?")).toBeVisible();
  await expect(
    close.getByRole("link", { name: "Send a note" }),
  ).toHaveAttribute("href", "/contact");
  expect(await close.innerText()).not.toMatch(/@/);
  const hrefs = await page
    .locator("a")
    .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  expect(hrefs.filter((h) => h.includes("cal.com"))).toEqual([]);
  await expectNoSeriousA11y(page, { include: "main" });
});

test.describe("C4 event", () => {
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

  test("with consent the close's call sends surface about, placement close, nothing else", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    const hits = await collect(page, context);
    await page.goto("/about");
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    await page
      .locator("[data-page-close]")
      .getByRole("link", { name: CALL })
      .click();
    await expect
      .poll(() => hits.filter((h) => h.en === "book_call_click").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const click = hits.find((h) => h.en === "book_call_click")!;
    expect(
      Object.keys(click)
        .filter((k) => k.startsWith("ep.") || k.startsWith("epn."))
        .sort(),
    ).toEqual(["ep.placement", "ep.surface"]);
    expect(click["ep.surface"]).toBe("about");
    expect(click["ep.placement"]).toBe("close");
  });

  test("with consent declined nothing reaches Google", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "denied"),
      [CONSENT_KEY],
    );
    await page.goto("/about");
    await page
      .locator("[data-page-close]")
      .getByRole("link", { name: CALL })
      .click();
    await page.waitForURL("**/book");
    await page.waitForTimeout(1_000);
    expect(google).toEqual([]);
  });
});

test("C5 landing at #tools and #testimonials puts the h2 below the header and focuses it", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ["tools", "testimonials"]) {
      await page.goto(`/about#${id}`);
      const h2 = page.locator(`#${id} h2`);
      await expect(h2).toBeFocused();
      const headerBottom = await page
        .locator("header")
        .first()
        .evaluate((h) => h.getBoundingClientRect().bottom);
      await expect
        .poll(async () => (await h2.boundingBox())!.y)
        .toBeGreaterThanOrEqual(headerBottom);
    }
  }
});
