import type { BrowserContext, Page, Request } from "@playwright/test";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-3: what GA4 receives, read from the real collect requests gtag.js
 * makes, never from dataLayer. Needs `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn
 * build:agent`. gtag.js itself passes through; every other Google request,
 * collect included, is answered 204 here, so no hit reaches Google.
 */
test.use({ realGoogle: true });

const SENTINEL = "sentinel";
const HARNESS = "/test-harness/analytics";
const CONSENT_KEY = "ta:analytics-consent";
/** gtag.js holds a page's later hits for a few seconds and sends them as one batch. */
const BATCHED = 15_000;

/**
 * A page load plus a quiet window long enough for gtag.js to load and send.
 * Not networkidle: the header's prefetches of routes still to be built
 * (/work, /contact, /book) keep the network from ever settling.
 */
async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(2_000);
}

type Hit = Record<string, string>;

function isGtagJs(url: URL) {
  return (
    url.hostname === "www.googletagmanager.com" && url.pathname === "/gtag/js"
  );
}

/** Every Google request, and every hit inside each collect request. */
async function watch(context: BrowserContext) {
  const google: Request[] = [];
  let gtagLoaded = false;

  await context.route(
    (url) => isGoogleHost(url.hostname) && !isGtagJs(url),
    (route) => route.fulfill({ status: 204 }),
  );
  context.on("request", (request) => {
    if (isGoogleHost(new URL(request.url()).hostname)) google.push(request);
  });
  context.on("response", (response) => {
    if (isGtagJs(new URL(response.url())) && response.ok()) gtagLoaded = true;
  });

  const collects = () =>
    google.filter((r) => new URL(r.url()).pathname.endsWith("/g/collect"));

  /** One hit per body line (gtag.js batches), merged over the URL's fields. */
  const hits = (): Hit[] =>
    collects().flatMap((request) => {
      const base = Object.fromEntries(new URL(request.url()).searchParams);
      const body = request.postData();
      const lines = body ? body.split("\n").filter(Boolean) : [""];
      return lines.map((line) => ({
        ...base,
        ...Object.fromEntries(new URLSearchParams(line)),
      }));
    });

  const raw = () =>
    collects()
      .map((r) => `${r.url()}\n${r.postData() ?? ""}`)
      .join("\n");

  return {
    google,
    hits,
    raw,
    gtagLoaded: () => gtagLoaded,
  };
}

async function grantConsent(page: Page) {
  await page.addInitScript(
    ([key]) => localStorage.setItem(key, "granted"),
    [CONSENT_KEY],
  );
}

const pageViews = (hits: Hit[]) => hits.filter((h) => h.en === "page_view");

function hasNoQ(href: string | undefined) {
  return !href || !new URL(href).searchParams.has("q");
}

async function clientNavigate(page: Page, href: string) {
  await page.evaluate((to) => {
    (
      window as unknown as { next: { router: { push(h: string): void } } }
    ).next.router.push(to);
  }, href);
  await page.waitForURL((url) => url.pathname === href.split("?")[0]);
}

test("C3 one page_view, q stripped from dl, tab kept, sentinel in no hit", async ({
  page,
  context,
}) => {
  const w = await watch(context);
  await grantConsent(page);
  await page.goto(`/?q=${SENTINEL}&tab=x`);

  await expect.poll(w.gtagLoaded, { message: "gtag.js loaded" }).toBe(true);
  await expect.poll(() => pageViews(w.hits()).length).toBe(1);
  expect(w.hits()[0].tid).toBe("G-TEST000000");

  await page.waitForTimeout(3_000);
  const views = pageViews(w.hits());
  expect(views).toHaveLength(1);
  expect(new URL(views[0].dl).searchParams.get("tab")).toBe("x");
  expect(hasNoQ(views[0].dl)).toBe(true);
  expect(w.raw()).not.toContain(SENTINEL);
});

test("C4 a client navigation to ?q=sentinel sends one more page_view, no q in dl or dr", async ({
  page,
  context,
  baseURL,
}) => {
  const w = await watch(context);
  await grantConsent(page);
  await page.goto(HARNESS, { referer: `${baseURL}/?q=${SENTINEL}` });
  await expect.poll(() => pageViews(w.hits()).length).toBe(1);

  await clientNavigate(page, `/about?q=${SENTINEL}`);
  await expect
    .poll(() => pageViews(w.hits()).length, { timeout: BATCHED })
    .toBe(2);

  for (const hit of pageViews(w.hits())) {
    expect(hasNoQ(hit.dl)).toBe(true);
    expect(hasNoQ(hit.dr)).toBe(true);
  }
  expect(w.raw()).not.toContain(SENTINEL);
});

test("C4 a full load whose referrer is /?q=sentinel sends dr without q", async ({
  page,
  context,
  baseURL,
}) => {
  const w = await watch(context);
  await grantConsent(page);
  await page.goto("/about", { referer: `${baseURL}/?q=${SENTINEL}` });
  await expect.poll(() => pageViews(w.hits()).length).toBe(1);

  const [view] = pageViews(w.hits());
  expect(view.dr).toBeTruthy();
  expect(hasNoQ(view.dr)).toBe(true);
  expect(w.raw()).not.toContain(SENTINEL);
});

test("C4 track() after replaceState adds ?q=sentinel sends no q in dl or dr", async ({
  page,
  context,
  baseURL,
}) => {
  const w = await watch(context);
  await grantConsent(page);
  await page.goto(HARNESS, { referer: `${baseURL}/?q=${SENTINEL}` });
  await expect.poll(() => pageViews(w.hits()).length).toBe(1);

  await page.evaluate(
    (q) => history.replaceState(history.state, "", `?q=${q}`),
    SENTINEL,
  );
  await page.getByRole("button", { name: "Track" }).click();

  await expect
    .poll(() => w.hits().filter((h) => h.en === "book_call_click").length, {
      timeout: BATCHED,
    })
    .toBe(1);
  const [event] = w.hits().filter((h) => h.en === "book_call_click");
  expect(event["ep.surface"]).toBe("home");
  expect(event["ep.placement"]).toBe("hero");
  expect(hasNoQ(event.dl)).toBe(true);
  expect(hasNoQ(event.dr)).toBe(true);
  expect(w.raw()).not.toContain(SENTINEL);
});

test.describe("C5 no Google request", () => {
  async function twoLoads(page: Page) {
    await page.goto("/");
    await settle(page);
    await page.goto(HARNESS);
    await settle(page);
  }

  test("in the ask state, no choice made", async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      extraHTTPHeaders: { "x-vercel-ip-country": "DE" },
    });
    const page = await context.newPage();
    const w = await watch(context);
    await twoLoads(page);
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible();
    expect(w.google).toHaveLength(0);
    await context.close();
  });

  test("after a decline", async ({ page, context }) => {
    const w = await watch(context);
    await page.addInitScript(
      ([key]) => localStorage.setItem(key, "denied"),
      [CONSENT_KEY],
    );
    await twoLoads(page);
    expect(w.google).toHaveLength(0);
  });

  test("with GPC set", async ({ page, context }) => {
    const w = await watch(context);
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "globalPrivacyControl", {
        get: () => true,
      }),
    );
    await twoLoads(page);
    expect(w.google).toHaveLength(0);
  });

  test("after withdrawing consent on /privacy, then a navigation and a track() call", async ({
    page,
    context,
  }) => {
    const w = await watch(context);
    await page.goto("/privacy");
    await expect.poll(w.gtagLoaded).toBe(true);
    await page.getByRole("button", { name: "Turn off" }).click();
    await page.waitForTimeout(1_000);
    const before = w.google.length;

    await clientNavigate(page, HARNESS);
    await page.getByRole("button", { name: "Track" }).click();
    await page.waitForTimeout(3_000);
    await page.goto(HARNESS);
    await settle(page);

    expect(w.google.slice(before).map((r) => r.url())).toEqual([]);
  });
});

test("C6 intake, legal and admin paths make no Google request", async ({
  page,
  context,
}) => {
  const w = await watch(context);
  await grantConsent(page);
  for (const path of [
    "/websites/intake",
    "/websites/privacy",
    "/admin/login",
  ]) {
    await page.goto(path);
    await settle(page);
  }
  expect(w.google.map((r) => r.url())).toEqual([]);
});
