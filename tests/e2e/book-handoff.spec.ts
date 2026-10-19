import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-22: the fit view's call, through POST /book/handoff to Cal.com. Cal.com
 * never sees a request from here: see `stubCal`. Needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` for C5's collect reads.
 */
test.use({ realGoogle: true, viewport: { width: 1440, height: 900 } });

const CONSENT_KEY = "ta:analytics-consent";
const CAL_HOST = "cal.com";
const STUB_TITLE = "Cal.com stub";

const SENTINEL = {
  name: "Zedsentinelname Example",
  email: "zedsentinel@example.test",
  building: "zedsentinelbuilding for a clinic",
};

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

/**
 * Keeps Cal.com off the network. Chromium sends the request a redirect leads
 * to straight to the network, past any Playwright route, so the browser must
 * never receive the 303. The hand-off's own POST is fetched here without
 * following it; its real status and Location are recorded for the
 * assertions, and a Cal.com target is answered with a local stub page in its
 * place. Any request to Cal.com itself is aborted and recorded.
 */
async function stubCal(
  context: BrowserContext,
  { holdMs = 0 }: { holdMs?: number } = {},
) {
  const answers: { status: number; location: string }[] = [];
  const blocked: string[] = [];
  await context.route(
    (url) => url.hostname === CAL_HOST || url.hostname.endsWith(`.${CAL_HOST}`),
    (route) => {
      blocked.push(route.request().url());
      return route.abort();
    },
  );
  await context.route(
    (url) => url.pathname === "/book/handoff",
    async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const response = await route.fetch({ maxRedirects: 0 });
      const location = response.headers()["location"] ?? "";
      answers.push({ status: response.status(), location });
      if (holdMs) await new Promise((done) => setTimeout(done, holdMs));
      if (new URL(location, route.request().url()).hostname !== CAL_HOST)
        return route.fulfill({ response });
      return route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `<!doctype html><title>${STUB_TITLE}</title><main>stub</main>`,
      });
    },
  );
  return { answers, blocked };
}

async function open(page: Page) {
  await page.goto("/book");
  await page.waitForFunction(() => {
    const form = document.querySelector("main form");
    return !!form && Object.keys(form).some((k) => k.startsWith("__react"));
  });
}

function main(page: Page) {
  return page.locator("main#main");
}

async function reachFit(page: Page) {
  const m = main(page);
  await m.getByLabel(/^What are you building\?/).fill(SENTINEL.building);
  await m
    .getByRole("radiogroup", { name: /^Budget/ })
    .getByText("Over $75K", { exact: true })
    .click();
  await m
    .getByRole("radiogroup", { name: /^When do you want to start\?/ })
    .getByText("This month", { exact: true })
    .click();
  await m
    .getByRole("radiogroup", { name: /^The role you need/ })
    .getByText("Fractional CTO", { exact: true })
    .click();
  await m.getByLabel("Name").fill(SENTINEL.name);
  await m.getByLabel("Email").fill(SENTINEL.email);
  await page.waitForTimeout(2_100);
  await m.getByRole("button", { name: /^Continue/ }).click();
  await expect(m.getByRole("heading", { level: 1 })).toHaveText(
    /^Let's book it/,
  );
}

function callButton(page: Page) {
  return main(page).getByRole("button", { name: "Book a 30-minute call" });
}

test("C3 GET /book/handoff answers 405 and never redirects", async ({
  request,
}) => {
  const res = await request.get("/book/handoff", { maxRedirects: 0 });
  expect(res.status()).toBe(405);
  expect(res.headers()["location"]).toBeUndefined();
});

test("C4 the call posts once and lands on Cal.com prefilled; no sentinel in a URL here", async ({
  page,
  context,
  baseURL,
}) => {
  await stubGoogle(context);
  const cal = await stubCal(context);
  const origin = new URL(baseURL!).origin;
  const sameOrigin: string[] = [];
  const handoffPosts: string[] = [];
  const pages: string[] = [];
  context.on("request", (r) => {
    const url = new URL(r.url());
    if (url.origin !== origin) return;
    sameOrigin.push(r.url());
    if (r.method() === "POST" && url.pathname === "/book/handoff")
      handoffPosts.push(r.url());
  });
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) pages.push(f.url());
  });

  await open(page);
  await reachFit(page);
  await callButton(page).click();
  await expect(page).toHaveTitle(STUB_TITLE);

  expect(handoffPosts).toHaveLength(1);
  expect(cal.answers).toHaveLength(1);
  expect(cal.answers[0].status).toBe(303);
  expect(cal.blocked).toEqual([]);
  const landed = new URL(cal.answers[0].location);
  expect(landed.host).toBe(CAL_HOST);
  expect(landed.searchParams.get("name")).toBe(SENTINEL.name);
  expect(landed.searchParams.get("email")).toBe(SENTINEL.email);
  expect(landed.searchParams.get("notes")).toBe(SENTINEL.building);
  expect(landed.searchParams.get("metadata[source]")).toBe("site-screening");
  expect(landed.searchParams.get("metadata[role]")).toBe("fractional-cto");
  expect(landed.searchParams.has("budget")).toBe(false);
  expect(landed.searchParams.has("start")).toBe(false);

  for (const url of sameOrigin) {
    for (const token of [
      "Zedsentinelname",
      "zedsentinel",
      "zedsentinelbuilding",
    ])
      expect(url.toLowerCase(), url).not.toContain(token.toLowerCase());
    const params = new URL(url).searchParams;
    expect(params.has("budget"), url).toBe(false);
    expect(params.has("start"), url).toBe(false);
  }
  // The stub page answers the POST where Cal.com would, so it shows at
  // /book/handoff; the real 303 never shows a page there.
  const ours = pages.filter((u) => new URL(u).origin === origin);
  expect(ours.length).toBeGreaterThan(0);
  for (const u of ours) {
    expect(["/book", "/book/handoff"]).toContain(new URL(u).pathname);
    expect(new URL(u).search).toBe("");
  }
});

test("C5 with consent, one book_call_click at screening_fit, and nothing typed reaches Google", async ({
  page,
  context,
}) => {
  await stubGoogle(context);
  // gtag queues an event hit for about five seconds and sends the queue
  // when the page turns hidden. Headless Chromium's form-POST navigation
  // drops the queue instead (probed 2026-10-19), so the stubbed hand-off is
  // held open long enough for the hit to leave, as SITE-4's spec holds /book.
  const cal = await stubCal(context, { holdMs: 8_000 });
  await page.addInitScript(
    ([k]) => localStorage.setItem(k, "granted"),
    [CONSENT_KEY],
  );
  const hits: Record<string, string>[] = [];
  const google: string[] = [];
  context.on("request", (r) => {
    const url = new URL(r.url());
    if (!isGoogleHost(url.hostname)) return;
    google.push(`${r.url()}\n${r.postData() ?? ""}`);
    if (!url.pathname.endsWith("/g/collect")) return;
    const base = Object.fromEntries(url.searchParams);
    const lines = (r.postData() ?? "").split("\n").filter(Boolean);
    for (const line of lines.length ? lines : [""])
      hits.push({ ...base, ...Object.fromEntries(new URLSearchParams(line)) });
  });

  await open(page);
  await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
  await reachFit(page);
  await callButton(page).click();

  await expect
    .poll(() => hits.filter((h) => h.en === "book_call_click").length, {
      timeout: 15_000,
    })
    .toBe(1);
  await expect(page).toHaveTitle(STUB_TITLE, { timeout: 15_000 });
  const [click] = hits.filter((h) => h.en === "book_call_click");
  const params = Object.keys(click).filter(
    (k) => k.startsWith("ep.") || k.startsWith("epn."),
  );
  expect(params.sort()).toEqual(["ep.placement", "ep.surface"]);
  expect(click["ep.surface"]).toBe("services");
  expect(click["ep.placement"]).toBe("screening_fit");

  const calQuery = new URL(cal.answers[0].location).search.slice(1);
  const everything = google.join("\n").toLowerCase();
  for (const token of ["zedsentinel", "site-screening", calQuery.toLowerCase()])
    expect(everything).not.toContain(token);
});

for (const [why, setup] of [
  [
    "consent declined",
    (page: Page) =>
      page.addInitScript(
        ([k]) => localStorage.setItem(k, "denied"),
        [CONSENT_KEY],
      ),
  ],
  [
    "GPC set",
    (page: Page) =>
      page.addInitScript(() =>
        Object.defineProperty(navigator, "globalPrivacyControl", {
          get: () => true,
        }),
      ),
  ],
] as const) {
  test(`C5 with ${why}, the press reaches no Google host`, async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await stubCal(context);
    await setup(page);
    await open(page);
    await reachFit(page);
    await callButton(page).click();
    await expect(page).toHaveTitle(STUB_TITLE);
    await page.waitForTimeout(1_000);
    expect(google).toEqual([]);
  });
}
