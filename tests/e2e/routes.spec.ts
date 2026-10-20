import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

const REDIRECTS: [string, string][] = [
  ["/services", "/work-with-me"],
  ["/stack", "/about#tools"],
  ["/testimonials", "/about#testimonials"],
  ["/stack?x=1", "/about?x=1#tools"],
  ["/testimonials?x=1", "/about?x=1#testimonials"],
  // SITE-24: the coded page moved to /websites (D-SITE-111, 215).
  ["/websites/coded", "/websites"],
];

for (const [from, to] of REDIRECTS) {
  test(`C1 ${from} answers 308 to ${to}`, async ({ request }) => {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(to);
  });
}

for (const path of ["/websites", "/websites/coded/intake"]) {
  test(`C2 ${path} answers 200 with no Location`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers().location).toBeUndefined();
  });
}

for (const path of ["/no-such-page", "/work/no-such-slug"]) {
  test(`C3 ${path} answers 404 with the not-found block`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('main a[href="/work"]')).toHaveCount(1);
    await expectNoSeriousA11y(page);
  });
}

test("C5 a story link from home opens the case study as a full page at the top", async ({
  page,
}) => {
  await page.goto("/");
  const link = page.locator('main a[href^="/work/"]').first();
  const href = await link.getAttribute("href");
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await page.waitForLoadState("load");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator("dialog")).toHaveCount(0);
  await expect(
    page.locator('[role="dialog"]:not([aria-modal="false"])'),
  ).toHaveCount(0);
});
