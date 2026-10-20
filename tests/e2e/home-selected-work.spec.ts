import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-11: home's Selected work. */

const section = (page: Page) => page.locator("section#work");
const tab = (page: Page, name: string) =>
  section(page).getByRole("tab", { name });
const chip = (page: Page, name: string) =>
  section(page).getByRole("group", { name: "Type" }).getByRole("button", {
    name,
    exact: true,
  });
const panel = (page: Page) => section(page).getByRole("tabpanel");
const titles = (page: Page) => panel(page).locator("h3").allTextContents();
const story = (page: Page, title: string) =>
  panel(page)
    .locator("article")
    .filter({
      has: page.getByRole("heading", { name: title, exact: true }),
    });
const footerHrefs = (page: Page) =>
  panel(page)
    .locator(":scope > p a")
    .evaluateAll((els) => els.map((a) => a.getAttribute("href")));

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 tabs, arrow keys, each tab's Featured stories", async ({ page }) => {
    await page.goto("/");
    await expect(section(page).getByRole("tab")).toHaveText([
      "Product engineering",
      "Websites",
      "Branding & UI",
    ]);
    await expect(tab(page, "Product engineering")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await titles(page)).toEqual([
      "Conscious Connections",
      "Everbook",
      "Future of Cities",
    ]);

    await tab(page, "Product engineering").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Websites")).toBeFocused();
    await expect(tab(page, "Websites")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await titles(page)).toEqual(["Kryshan Randel"]);
    // Feedback round 2: at md and up Websites keeps the chip row, disabled.
    await expect(
      section(page)
        .getByRole("group", { name: "Type" })
        .locator("[aria-disabled=true]"),
    ).toHaveCount(5);

    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Branding & UI")).toBeFocused();
    expect(await titles(page)).toEqual([
      "Taylor Aucoin",
      "Conscious Connections",
      "Agora",
    ]);
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Product engineering")).toBeFocused();
  });

  test("C2 chips per tab; Full-time filters, keeps focus, announces", async ({
    page,
  }) => {
    await page.goto("/");
    const group = section(page).getByRole("group", { name: "Type" });
    await expect(group.getByRole("button")).toHaveText([
      "Featured",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    await expect(chip(page, "Featured")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await chip(page, "Full-time").click();
    await expect(chip(page, "Full-time")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(chip(page, "Full-time")).toBeFocused();
    expect(await titles(page)).toEqual([
      "Everbook",
      "Roomvy",
      "Calculate by QxMD",
    ]);
    await expect(
      story(page, "Calculate by QxMD").locator("img, [data-zoom-index]"),
    ).toHaveCount(0);
    await expect(section(page).locator("[aria-live=polite]")).toHaveText(/3/);

    await tab(page, "Branding & UI").click();
    await expect(group.getByRole("button")).toHaveText([
      "Featured",
      "Business",
      "Passion projects",
      "Own brand",
    ]);
  });

  test("C3 See all work carries the tab and chip", async ({ page }) => {
    await page.goto("/");
    expect(await footerHrefs(page)).toEqual(["/work"]);
    await chip(page, "Full-time").click();
    expect(await footerHrefs(page)).toEqual(["/work?type=full-time"]);
    await tab(page, "Branding & UI").click();
    await chip(page, "Business").click();
    expect(await footerHrefs(page)).toEqual([
      "/work-with-me",
      "/work?tab=branding&type=business",
    ]);
    await tab(page, "Websites").click();
    expect(await footerHrefs(page)).toEqual([
      "/websites",
      "/work?tab=websites",
    ]);
  });

  test("C4 story links and beats", async ({ page }) => {
    await page.goto("/");
    for (const t of await titles(page)) {
      await expect(story(page, t).locator("dt")).toHaveText([
        "Problem",
        "Decided",
        "Happened",
      ]);
    }
    await tab(page, "Branding & UI").click();
    await expect(
      story(page, "Taylor Aucoin").getByRole("link", {
        name: /Read the decision story/,
      }),
    ).toHaveCount(0);
    await tab(page, "Websites").click();
    await expect(
      story(page, "Kryshan Randel").getByRole("link", {
        name: /Read the decision story/,
      }),
    ).toHaveCount(0);

    await tab(page, "Product engineering").click();
    await story(page, "Everbook")
      .getByRole("link", { name: /Read the decision story/ })
      .click();
    await page.waitForURL("**/work/everbook");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("C5 thumbs and All n open the lightbox; Esc returns focus; empty galleries render nothing", async ({
    page,
  }) => {
    await page.goto("/");
    const cc = story(page, "Conscious Connections");
    const thumbs = cc.locator("[data-zoom-index]");
    const second = thumbs.nth(1);
    await second.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Thumbs are images 2 and 3 after the lead: the second thumb is image 3.
    await expect(dialog).toContainText("3 /");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(second).toBeFocused();

    const all = cc.getByRole("button", { name: /^All \d+ images$/ });
    await all.click();
    await expect(dialog).toContainText("1 /");
    await page.keyboard.press("Escape");
    await expect(all).toBeFocused();

    await tab(page, "Websites").click();
    const kr = story(page, "Kryshan Randel");
    await expect(kr.locator("img, [data-zoom-index], button")).toHaveCount(0);
  });

  test("feedback round 2: a branding image opens only its row's boards, with no console error", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await tab(page, "Branding & UI").click();
    const cc = story(page, "Conscious Connections");
    const thumb = cc.locator("[data-zoom-index]").first();
    await thumb.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // The row holds its own six frames; the section holds more.
    await expect(dialog).toContainText("2 / 6");
    await expect(dialog).toHaveAttribute(
      "aria-label",
      /^The lockup, Conscious/,
    );
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toContainText("3 / 6");
    await expect(dialog).toHaveAttribute(
      "aria-label",
      /^Six grounds side by side/,
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(thumb).toBeFocused();
    expect(errors).toEqual([]);
  });

  test("C6 See the work focuses the first story's heading", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page
      .locator("main#main > section")
      .first()
      .getByRole("link", { name: "See the work" })
      .click();
    const heading = panel(page).locator("h3").first();
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
  });

  test("feedback round 2: tab switches move nothing; Websites' chips are disabled and unfocusable", async ({
    page,
  }) => {
    const box = (selector: string) =>
      section(page)
        .locator(selector)
        .evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return [r.x, r.y + scrollY, r.width, r.height];
          }),
        );
    const group = section(page).getByRole("group", { name: "Type" });
    // The tab row, each tab, and the chip row's top and height (its width
    // follows each tab's chips) hold the tab line.
    // The panel's top is the tab line's bottom.
    const line = async () => ({
      tablist: await box("[role=tablist]"),
      tabs: await box("[role=tab]"),
      row: await group.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return [r.y + scrollY, r.height];
      }),
      panelTop: (await box("[role=tabpanel]"))[0][1],
    });

    await page.goto("/");
    const product = await line();
    for (const name of [
      "Websites",
      "Branding & UI",
      "Product engineering",
      "Websites",
    ]) {
      await tab(page, name).click();
      await expect(tab(page, name)).toHaveAttribute("aria-selected", "true");
      expect(await line(), name).toEqual(product);
    }

    const chips = group.locator("[aria-disabled=true]");
    await expect(chips).toHaveText([
      "Featured",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    expect(
      await chips.evaluateAll((els) =>
        els.map((el) => [
          el.tabIndex,
          getComputedStyle(el).opacity,
          getComputedStyle(el).cursor,
        ]),
      ),
    ).toEqual(Array(5).fill([-1, "0.6", "not-allowed"]));
    await chips.nth(1).click({ force: true });
    expect(await titles(page)).toEqual(["Kryshan Randel"]);
    await expect(chips.nth(0)).toHaveAttribute("aria-pressed", "true");
    await expectNoSeriousA11y(page, { include: "section#work" });
  });

  test("states by ?state=", async ({ page }) => {
    await page.goto("/?state=selected-work-websites");
    await expect(tab(page, "Websites")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.goto("/?state=selected-work-branding");
    await expect(tab(page, "Branding & UI")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.goto("/?state=selected-work-filtered");
    await expect(chip(page, "Full-time")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("C7 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const name of ["Product engineering", "Websites", "Branding & UI"]) {
    test(`${name}: no horizontal scroll, 44px targets, axe clean`, async ({
      page,
    }) => {
      await page.goto("/");
      await tab(page, name).click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const small = await section(page)
        .locator("button, a")
        .evaluateAll((els) =>
          els
            // Websites' disabled chip row is hidden below md.
            .filter(
              (el) =>
                el.getClientRects().length > 0 &&
                el.getBoundingClientRect().height < 44,
            )
            .map((el) => el.textContent?.trim()),
        );
      expect(small).toEqual([]);
      if (name === "Websites") {
        await expect(
          section(page).getByRole("group", { name: "Type" }),
        ).toBeHidden();
      }
      await expectNoSeriousA11y(page, { include: "section#work" });
    });
  }
});
