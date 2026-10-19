import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-6: the shared close, on its test route. C3 needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`, which reads real collect
 * requests (gtag.js passes through; every other Google request is answered
 * 204 here).
 */
test.use({ realGoogle: true });

const PATH = "/test-harness/close";
const CONSENT_KEY = "ta:analytics-consent";
const PRIMARY = "bg-(--color-fill)";

const fixture = (page: Page, name: "call" | "no-resume" | "note") =>
  page.locator(`[data-fixture=${name}] [data-page-close]`);

/** Every link and its text/href in DOM order. */
function links(close: ReturnType<typeof fixture>) {
  return close
    .getByRole("link")
    .evaluateAll((els) =>
      els.map((a) => [
        a.textContent?.trim() ?? "",
        (a as HTMLAnchorElement).getAttribute("href"),
      ]),
    );
}

/** The controls whose resting background is the solid fill. */
function filled(close: ReturnType<typeof fixture>) {
  return close.getByRole("link").evaluateAll((els) => {
    const fill = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-fill")
      .trim();
    const probe = document.createElement("i");
    probe.style.background = fill;
    document.body.append(probe);
    const want = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return els
      .filter((a) => getComputedStyle(a).backgroundColor === want)
      .map((a) => a.textContent?.trim());
  });
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

test.describe("C1 and C2 at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 the call-led close, in order, with one primary and no email", async ({
    page,
  }) => {
    await page.goto(PATH);
    const close = fixture(page, "call");
    await expect(close).toContainText("Fixture closing line");
    await expect(close).toContainText("Available now · fixture availability");
    expect(await links(close)).toEqual([
      ["Book a 30-minute call", "/book"],
      ["Résumé (PDF)", "/taylor-aucoin-resume.pdf"],
      ["Send a note", "/contact"],
    ]);
    await expect(close).toContainText("Not ready to book?");
    expect(await filled(close)).toEqual(["Book a 30-minute call"]);
    expect(await close.innerText()).not.toMatch(/[\w.+-]+@[\w-]+\.\w+/);
    await expect(close.locator("a[href^=mailto]")).toHaveCount(0);
    const rule = await close
      .locator("> div")
      .evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(rule).toBe("1px");
  });

  test("C2 the close without a résumé and the note-led close", async ({
    page,
  }) => {
    await page.goto(PATH);

    const bare = fixture(page, "no-resume");
    expect(await links(bare)).toEqual([
      ["Book a 30-minute call", "/book"],
      ["Send a note", "/contact"],
    ]);
    await expect(bare).toContainText("Not ready to book?");
    await expect(bare.getByRole("link", { name: "Résumé" })).toHaveCount(0);

    const note = fixture(page, "note");
    expect(await links(note)).toEqual([
      ["Send a note [draft]", "/contact"],
      ["Book a 30-minute call", "/book"],
    ]);
    await expect(note).toContainText("Prefer a call?");
    expect(await filled(note)).toEqual(["Send a note [draft]"]);
    await expect(note.getByRole("link", { name: "Résumé" })).toHaveCount(0);
    await expect(note.locator("a[href^=mailto]")).toHaveCount(0);
  });
});

test.describe("C3 events", () => {
  async function granted(context: BrowserContext, value: "granted" | "denied") {
    await context.addInitScript(
      ([k, v]) => localStorage.setItem(k, v),
      [CONSENT_KEY, value],
    );
  }

  async function click(page: Page, context: BrowserContext, name: string) {
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
    await page.goto(PATH);
    await expect.poll(() => hits.some((h) => h.en === "page_view")).toBe(true);
    await fixture(page, name as "call" | "note")
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    await expect.poll(() => wentToBook).toBe(true);
    return hits;
  }

  for (const [form, surface, slug] of [
    ["call", "case-study", "conscious-connections"],
    ["note", "services", undefined],
  ] as const) {
    test(`C3 ${form}-led close sends one book_call_click`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await granted(context, "granted");
      const hits = await click(page, context, form);
      const sent = () => hits.filter((h) => h.en === "book_call_click");
      await expect.poll(() => sent().length, { timeout: 15_000 }).toBe(1);
      const calls = sent();
      expect(calls[0]["ep.surface"]).toBe(surface);
      expect(calls[0]["ep.placement"]).toBe("close");
      expect(calls[0]["ep.slug"]).toBe(slug);
    });
  }

  test("C3 with consent declined, no request reaches any Google host", async ({
    page,
    context,
  }) => {
    const google = await stubGoogle(context);
    await granted(context, "denied");
    await page.route(
      (url) => url.pathname === "/book",
      (route) =>
        route.request().resourceType() === "document"
          ? route.fulfill({ status: 204 })
          : route.continue(),
    );
    await page.goto(PATH);
    await fixture(page, "call")
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    await page.waitForTimeout(500);
    expect(google).toEqual([]);
  });
});

test.describe("C4 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("call and résumé share a row, the fallback sits under, targets are 44px", async ({
    page,
  }) => {
    await page.goto(PATH);
    const close = fixture(page, "call");
    const box = async (name: string) =>
      (await close.getByRole("link", { name }).boundingBox())!;
    const call = await box("Book a 30-minute call");
    const resume = await box("Résumé (PDF)");
    const note = await box("Send a note");
    expect(
      Math.abs(call.y + call.height / 2 - (resume.y + resume.height / 2)),
    ).toBeLessThan(6);
    expect(note.y).toBeGreaterThan(call.y + call.height - 1);
    expect(note.height).toBeGreaterThanOrEqual(44);
    expect(resume.height).toBeGreaterThanOrEqual(44);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expectNoSeriousA11y(page, { include: "[data-page-close]" });
  });
});

test("C4 no close has a serious axe violation at 1440, light and dark", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const scheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(PATH);
    await expectNoSeriousA11y(page, { include: "main" });
  }
});
