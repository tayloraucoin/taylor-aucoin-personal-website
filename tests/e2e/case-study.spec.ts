import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-15: the case-study page. */

const SLUGS = [
  "everbook",
  "roomvy",
  "calculate-qxmd",
  "future-of-cities",
  "agora",
  "conscious-connections",
];

const SECTIONS = [
  "At a glance",
  "The brief",
  "What I built",
  "Process",
  "Decisions",
  "What broke",
  "Outcome",
  "Where AI sat",
  "Testimonial",
];

const h2s = (page: Page) => page.locator("main h2").allTextContents();

/** The fill the primary button rests on, so a control can be matched to it. */
async function filledControls(page: Page) {
  return page.locator("main a, main button").evaluateAll((els) => {
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

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 blocks in order, one h1, no skipped level", async ({ page }) => {
    for (const slug of SLUGS) {
      await page.goto(`/work/${slug}`);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(
        page.getByRole("link", { name: "All work" }),
      ).toHaveAttribute("href", "/work");
      const got = (await h2s(page)).filter((h) => SECTIONS.includes(h));
      const expected = SECTIONS.filter((s) => got.includes(s));
      expect(got, slug).toEqual(expected);
      for (const must of [
        "The brief",
        "What I built",
        "Decisions",
        "Outcome",
      ]) {
        expect(got, `${slug} ${must}`).toContain(must);
      }
      const levels = await page
        .locator("main h1, main h2, main h3")
        .evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
      levels.forEach((level, i) => {
        if (i > 0) expect(level - levels[i - 1], slug).toBeLessThanOrEqual(1);
      });
      await expect(page.locator("main ul").first()).toBeVisible();
    }
    await page.goto("/work/conscious-connections");
    expect(await h2s(page)).not.toContain("Testimonial");
    expect(await h2s(page)).toContain("Where AI sat");
  });

  test("C2 Everbook's testimonial, Calculate's bare tail", async ({ page }) => {
    await page.goto("/work/everbook");
    const card = page.locator("main figure").last();
    await expect(card).toContainText("Dawson Whitfield");
    await expect(card).toContainText(
      "He was a pleasure to work with, always reliable, sharp, and dedicated to building great product.",
    );
    await expect(card.locator("a")).toHaveCount(0);
    expect(await h2s(page)).not.toContain("Where AI sat");

    await page.goto("/");
    await expect(page.locator("body")).not.toContainText(
      "He was a pleasure to work with, always reliable",
    );

    await page.goto("/work/calculate-qxmd");
    const heads = await h2s(page);
    for (const gone of ["Where AI sat", "Testimonial"]) {
      expect(heads).not.toContain(gone);
    }
    await expect(page.locator("main figure")).toHaveCount(0);
    await expect(page.locator("main h2:empty, main section:empty")).toHaveCount(
      0,
    );
  });

  test("C3 the one primary, the note link, no email", async ({ page }) => {
    for (const slug of SLUGS) {
      await page.goto(`/work/${slug}`);
      expect(await filledControls(page), slug).toEqual([
        "Book a 30-minute call",
      ]);
      const close = page.locator("[data-page-close]");
      await expect(
        close.getByRole("link", { name: "Book a 30-minute call" }),
      ).toHaveAttribute("href", "/book");
      await expect(
        close.getByRole("link", { name: "Send a note" }),
      ).toHaveAttribute("href", "/contact");
      await expect(close.locator("a[href^=mailto]")).toHaveCount(0);
      expect(await close.innerText()).not.toMatch(/@/);
    }
  });

  test("C4 Escape leaves the page where it is", async ({ page }) => {
    await page.goto("/work/everbook");
    await page.evaluate(() =>
      window.scrollTo({ top: 900, behavior: "instant" }),
    );
    const before = await page.evaluate(() => window.scrollY);
    const url = page.url();
    await page.keyboard.press("Escape");
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("C5 meta description and og:description", async ({ request }) => {
    for (const slug of SLUGS) {
      const html = await (await request.get(`/work/${slug}`)).text();
      const description = html.match(
        /<meta name="description" content="([^"]*)"/,
      )?.[1];
      const og = html.match(
        /<meta property="og:description" content="([^"]*)"/,
      )?.[1];
      expect(description, slug).toBeTruthy();
      expect(og, slug).toBe(description);
      expect(
        description!.replace(/&amp;/g, "&").length,
        slug,
      ).toBeLessThanOrEqual(160);
    }
  });

  test("the fixture states strip their blocks", async ({ page }) => {
    await page.goto("/work/conscious-connections?state=no-ai");
    expect(await h2s(page)).not.toContain("Where AI sat");
    await page.goto("/work/everbook?state=bare");
    const heads = await h2s(page);
    expect(heads).not.toContain("Testimonial");
    await expect(page.locator("main header figure")).toHaveCount(0);
    await page.goto("/work/everbook?state=no-artifacts");
    await expect(page.locator("main header figure")).toHaveCount(0);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C6 no overflow, targets, axe, skip link", async ({ page }) => {
    for (const slug of SLUGS) {
      await page.goto(`/work/${slug}`);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, slug).toBe(false);
      const small = await page
        .locator("main a, main button")
        .evaluateAll((els) =>
          els
            .map((a) => [
              a.textContent?.trim(),
              a.getBoundingClientRect().height,
            ])
            .filter(([, h]) => (h as number) < 44),
        );
      expect(small, slug).toEqual([]);
      await expectNoSeriousA11y(page, { include: "main" });
    }
    await page.goto("/work/everbook");
    await expect(page.locator("main")).toHaveAttribute("id", "main");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    expect(
      await page.evaluate(
        () => document.activeElement?.closest("main") !== null,
      ),
    ).toBe(true);
  });
});
