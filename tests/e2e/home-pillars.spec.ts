import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-10: home's pillars and Problems I take on. */

const PILLARS = [
  "Systems, end to end",
  "Judgment, not tickets",
  "Conventions that compound",
  "Fast and precise",
];
const FIRST_EIGHT = [
  "0→1 builds",
  "AI features",
  "Data and state architecture",
  "Specification",
  "Interface design",
  "Search and discovery",
  "Payments and tax",
  "AI engineering process",
];

const pillars = (page: Page) =>
  page.getByRole("region", { name: "Pillars" }).getByRole("button");
const problems = (page: Page) =>
  page.getByRole("region", { name: "Problems I take on" });
const chips = (page: Page) => problems(page).locator("ul > li > button");

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 four pillar rows open in place; Esc closes, focus stays", async ({
    page,
  }) => {
    await page.goto("/");
    const rows = pillars(page);
    await expect(rows).toHaveCount(4);
    const names = await rows.evaluateAll((els) =>
      els.map((b) => b.querySelector("span")?.textContent),
    );
    expect(names).toEqual(PILLARS);
    await expect(rows.nth(1)).toContainText(
      "A feature starts as a UX problem and has to end as a business outcome.",
    );
    for (let i = 0; i < 4; i++) {
      await expect(rows.nth(i)).toHaveAttribute("aria-expanded", "false");
      await expect(rows.nth(i)).toHaveAttribute("aria-controls", /.+/);
    }

    const second = rows.nth(1);
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(second).toBeFocused();
    const panel = page.locator(
      `#${await second.getAttribute("aria-controls")}`,
    );
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("I've been the founder");

    await page.keyboard.press("Escape");
    await expect(second).toHaveAttribute("aria-expanded", "false");
    await expect(second).toBeFocused();
    await expect(panel).toBeHidden();
  });

  test("C2 eight chips in comfort order, no rating in the HTML; Show all 25", async ({
    page,
  }) => {
    const res = await page.goto("/");
    const html = (await res!.text()) + (await page.content());
    expect(html).not.toMatch(/comfort/i);
    expect(html).not.toMatch(/data-rating|rating=/i);

    await expect(chips(page)).toHaveCount(8);
    expect(await chips(page).allTextContents()).toEqual(FIRST_EIGHT);
    const link = problems(page).getByRole("link", {
      name: "Search every capability",
    });
    await expect(link).toHaveAttribute("href", "/capabilities");

    const toggle = problems(page).getByRole("button", { name: "Show all 25" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(chips(page)).toHaveCount(25);
    const fewer = problems(page).getByRole("button", { name: "Show fewer" });
    await expect(fewer).toHaveAttribute("aria-expanded", "true");
    await expect(link).toBeVisible();
  });

  test("C3 a chip opens its card; a second closes the first; Esc returns focus", async ({
    page,
  }) => {
    await page.goto("/");
    const search = chips(page).filter({ hasText: "Search and discovery" });
    await search.click();
    await expect(search).toHaveAttribute("aria-expanded", "true");
    const card = page.locator(`#${await search.getAttribute("aria-controls")}`);
    await expect(card).toContainText("Elasticsearch");
    await expect(card).toContainText(/Done at Agora\./);
    await expect(card.getByRole("link", { name: "Agora" })).toHaveAttribute(
      "href",
      "/work/agora",
    );
    expect(
      await card
        .locator("p")
        .nth(0)
        .evaluate((el) => getComputedStyle(el).fontFamily),
    ).toMatch(/fragment/i);

    const ai = chips(page).filter({ hasText: "AI features" });
    await ai.click();
    await expect(ai).toHaveAttribute("aria-expanded", "true");
    await expect(search).toHaveAttribute("aria-expanded", "false");
    await expect(
      problems(page)
        .locator("button[aria-expanded=true]")
        .filter({
          hasNot: page.getByText("Show fewer"),
        }),
    ).toHaveCount(1);

    await ai.focus();
    await page.keyboard.press("Escape");
    await expect(ai).toHaveAttribute("aria-expanded", "false");
    await expect(ai).toBeFocused();
  });

  test("states: pillar-open, capabilities-open, capabilities-all", async ({
    page,
  }) => {
    await page.goto("/?state=pillar-open");
    await expect(pillars(page).nth(1)).toHaveAttribute("aria-expanded", "true");
    await page.goto("/?state=capabilities-open");
    await expect(
      chips(page).filter({ hasText: "Search and discovery" }),
    ).toHaveAttribute("aria-expanded", "true");
    await page.goto("/?state=capabilities-all");
    await expect(chips(page)).toHaveCount(25);
  });

  test("feedback 2026-10-19: rows carry Paper's padding, a closed row as tall as its text", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("section[aria-label=Pillars]");
    const panel = await section
      .locator("ul")
      .evaluate((ul) => getComputedStyle(ul.parentElement!).padding);
    expect(panel).toBe("8px 32px");
    const rows = await section.locator("li").evaluateAll((lis) =>
      lis.map((li) => {
        const s = getComputedStyle(li);
        const button = li.querySelector("button")!;
        const line = button.children[1] as HTMLElement;
        return {
          padding: [s.paddingTop, s.paddingBottom],
          // The button is as tall as the longer of its title and line.
          extra: Math.round(
            button.getBoundingClientRect().height -
              line.getBoundingClientRect().height,
          ),
        };
      }),
    );
    for (const row of rows) {
      expect(row.padding).toEqual(["24px", "24px"]);
      expect(row.extra).toBe(0);
    }
  });
});

test.describe("C4 reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("every transition collapses and the ring stops", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?state=capabilities-open");
    // globals.css collapses every transition to 0.01ms under reduced motion.
    const slow = await page
      .locator(
        "section[aria-label=Pillars] *, section[aria-labelledby=problems] *",
      )
      .evaluateAll((els) =>
        els
          .map((el) => [el.tagName, getComputedStyle(el).transitionDuration])
          .filter(([, d]) =>
            d
              .split(",")
              .some(
                (x) =>
                  parseFloat(x) * (x.trim().endsWith("ms") ? 1 : 1000) > 0.02,
              ),
          ),
      );
    expect(slow).toEqual([]);

    const ring = page.locator("section[aria-label=Pillars] [data-interactive]");
    const a = await ring.evaluate((el) => el.style.getPropertyValue("--angle"));
    await page.waitForTimeout(500);
    const b = await ring.evaluate((el) => el.style.getPropertyValue("--angle"));
    expect(b).toBe(a);
    const anim = await ring.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(anim).toBe("none");
  });
});

test.describe("C5 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("no horizontal scroll, 44px targets, axe clean with a pillar and a chip open", async ({
    page,
  }) => {
    await page.goto("/?state=capabilities-all");
    await pillars(page).nth(1).click();
    await chips(page).filter({ hasText: "Booking and inventory" }).click();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const small = await page
      .locator(
        "section[aria-label=Pillars] button, section[aria-labelledby=problems] button, section[aria-labelledby=problems] a",
      )
      .evaluateAll((els) =>
        els
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .filter((el) => el.closest("[hidden]") === null)
          .filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.textContent?.trim()),
      );
    // Proof names inside an open card are inline text links, not controls.
    expect(
      small.filter(
        (t) => !["Roomvy", "the Future of Cities platform"].includes(t ?? ""),
      ),
    ).toEqual([]);

    await expectNoSeriousA11y(page, {
      include: "section[aria-label=Pillars]",
    });
    await expectNoSeriousA11y(page, {
      include: "section[aria-labelledby=problems]",
    });
  });
});
