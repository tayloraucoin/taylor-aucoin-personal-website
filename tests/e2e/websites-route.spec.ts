import { expect, test } from "./fixtures";

/** SITE-24: /websites serves the coded page; the intake stays put (D-SITE-111, 160, 215). */

for (const [from, to] of [
  ["/websites/coded", "/websites"],
  ["/websites/coded?x=1", "/websites?x=1"],
]) {
  test(`C1 ${from} answers 308 to ${to}`, async ({ request }) => {
    const response = await request.get(from, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(to);
  });
}

const CHOOSER_TEXT = [
  "Two ways I build websites",
  "A site on a managed platform",
  "See this build",
  "Not sure which one you need?",
  "What do you do?",
  "Still stuck?",
];

test("C1 /websites answers 200 with the coded page, noindex, and no chooser", async ({
  page,
}) => {
  const response = await page.goto("/websites");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Websites for creative work");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const text = await page.locator("main").innerText();
  for (const line of CHOOSER_TEXT) expect(text).not.toContain(line);
});

/**
 * Main's answers, read from a build of `main` (f6328c2) before this change:
 * the start page, and a synthetic token that matches no engagement, which
 * answers 500 with no h1 when no database is reachable (the agent build).
 */
const INTAKE: { path: string; status: number; h1: string | null }[] = [
  {
    path: "/websites/coded/intake",
    status: 200,
    h1: "Let's get your site started.",
  },
  {
    path: "/websites/coded/intake/tok_synthetic_site24",
    status: 500,
    h1: null,
  },
];

for (const { path, status, h1 } of INTAKE) {
  test(`C2 ${path} answers as on main, with no redirect`, async ({
    page,
    request,
  }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(status);
    expect(response.headers().location).toBeUndefined();
    await page.goto(path);
    if (h1 === null) await expect(page.locator("h1")).toHaveCount(0);
    else await expect(page.locator("h1").first()).toHaveText(h1);
  });
}

for (const path of [
  "/",
  "/work",
  "/about",
  "/work-with-me",
  "/websites",
  "/capabilities",
]) {
  test(`C6 ${path} has no link to /websites/platform`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('a[href^="/websites/platform"]')).toHaveCount(0);
  });
}
