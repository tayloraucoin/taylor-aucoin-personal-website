import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-5: one footer and a skip link on every chrome page. */
const CHROME = [
  "/",
  "/about",
  "/capabilities",
  "/services",
  "/privacy",
  "/websites",
  "/websites/coded",
  "/websites/platform",
  "/work/conscious-connections",
  "/no-such-page",
];

const FOOTER_LINKS = [
  ["About", "/about"],
  ["Résumé (PDF)", "/taylor-aucoin-resume-dark.pdf"],
  ["Contact", "/contact"],
  ["GitHub", "https://github.com/tayloraucoin"],
  ["LinkedIn", "https://www.linkedin.com/in/taylor-aucoin/"],
  ["Privacy", "/privacy"],
];

for (const path of CHROME) {
  test(`C1 ${path} has one footer outside one main#main, links in order`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(
      page.locator("main footer, main [role=contentinfo]"),
    ).toHaveCount(0);

    const footer = page.getByRole("contentinfo");
    const nav = footer.getByRole("navigation", { name: "Site" });
    const links = await nav.getByRole("link").evaluateAll((els) =>
      els.map((a) => {
        const href = a.getAttribute("href") ?? "";
        return [a.textContent?.replace(/\s+/g, " ").trim() ?? "", href];
      }),
    );
    expect(links).toEqual(FOOTER_LINKS);
    await expect(nav.getByRole("link", { name: "Résumé (PDF)" })).toHaveCount(
      1,
    );
    await expect(footer.getByText("hello@tayloraucoin.com")).toBeVisible();
    await expect(footer.getByRole("link", { name: "Email" })).toHaveCount(0);
  });

  test(`C2 ${path}: the first Tab reaches a visible skip link that focuses main`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const main = document.getElementById("main");
          return !!main && main.contains(document.activeElement);
        }),
      )
      .toBe(true);
    // The chrome only: page bodies are rebuilt by their own tickets.
    await expectNoSeriousA11y(page, { include: "footer" });
  });
}

for (const path of [
  "/websites/coded/intake",
  "/websites/privacy",
  "/admin/login",
]) {
  test(`C3 ${path} renders no footer and no skip link`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toHaveCount(0);
  });
}
