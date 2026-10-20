import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-14: the work index. */

// The family office's names come from the parked note, never from the site.
const NOTE = readFileSync(
  "docs/_legacy/pending/cho-ventures-naming/NOTE.md",
  "utf8",
);
const FAMILY_OFFICE_NAMES = ["Cho Ventures", "Tony Cho", "ChoZen"].filter(
  (name) => NOTE.includes(name),
);

const tabsNav = (page: Page) => page.locator("main nav").nth(0);
const chipsNav = (page: Page) => page.locator("main nav").nth(1);
const h2s = (page: Page) => page.locator("main h2").allTextContents();
const h3s = (page: Page) => page.locator("main h3").allTextContents();

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 the default view, each tab's chips", async ({ page }) => {
    await page.goto("/work");
    await expect(page.locator("main")).toHaveAttribute("id", "main");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
    await expect(tabsNav(page).locator("a")).toHaveText([
      "Product engineering",
      "Websites",
      "Branding & UI",
    ]);
    await expect(tabsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Product engineering",
    );
    await expect(chipsNav(page).locator("a")).toHaveText([
      "All",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    expect(await h2s(page)).toEqual([
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
    expect(await h3s(page)).toEqual([
      "Everbook",
      "Roomvy",
      "Calculate by QxMD",
      "Future of Cities",
      "Agora",
      "Conscious Connections",
    ]);
    await expect(
      page.getByRole("link", { name: "Search every capability" }),
    ).toHaveAttribute("href", "/capabilities");

    await page.goto("/work?tab=branding");
    await expect(chipsNav(page).locator("a")).toHaveText([
      "All",
      "Business",
      "Passion projects",
      "Own brand",
    ]);
    // Feedback round 2: Websites keeps the chips, disabled, at md and up.
    await page.goto("/work?tab=websites");
    await expect(page.locator("main nav")).toHaveCount(2);
    await expect(chipsNav(page).locator("a")).toHaveCount(0);
    await expect(chipsNav(page).locator("[aria-disabled=true]")).toHaveText([
      "All",
      "Full-time",
      "Contract",
      "Business",
      "Passion projects",
    ]);
  });

  test("C2 chip by keyboard, reload, hrefs", async ({ page }) => {
    await page.goto("/work");
    const contract = chipsNav(page).getByRole("link", { name: "Contract" });
    await contract.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/work\?type=contract$/);
    await expect(chipsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Contract",
    );
    await expect(contract).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    expect(await h2s(page)).toEqual(["Contract"]);
    const box = await page.locator("main h2").boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
    await page.reload();
    await expect(chipsNav(page).locator("a[aria-current=true]")).toHaveText(
      "Contract",
    );
    await expect(
      tabsNav(page).getByRole("link", { name: "Branding & UI" }),
    ).toHaveAttribute("href", "/work?tab=branding");
    await expect(contract).toHaveAttribute("href", "/work?type=contract");
  });

  test("C3 story links, repeated names", async ({ page }) => {
    await page.goto("/work");
    await page
      .getByRole("link", { name: "Read the decision story" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/work\/everbook$/);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    await page.goto("/work?tab=branding");
    const rows = page.locator("main li").filter({ has: page.locator("h3") });
    const kit = rows.filter({ hasText: "Taylor Aucoin" });
    await expect(
      kit.getByRole("link", { name: "Read the decision story" }),
    ).toHaveCount(0);
    for (const title of ["Agora", "Conscious Connections"]) {
      const row = rows.filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      });
      await expect(row.locator("a").first()).toHaveText(
        "Read the decision story",
      );
    }
    const live = kit.locator("a[target=_blank]");
    await expect(live).toHaveAttribute("rel", "noopener noreferrer");
    const described = await page
      .locator("main section li a")
      .evaluateAll((els) =>
        els.every((a) => (a.getAttribute("aria-describedby") ?? "") !== ""),
      );
    expect(described).toBe(true);
  });

  test("C4 websites tab, gallery opener", async ({ page }) => {
    await page.goto("/work?tab=websites");
    expect(await h3s(page)).toEqual(["Kryshan Randel"]);
    // Kryshan Randel has captured screens since round 2; the own-brand kit is
    // the row with an empty gallery.
    await expect(
      page.getByRole("button", { name: /^All \d+ images$/ }),
    ).toHaveCount(1);
    await page.goto("/work?tab=branding");
    const kit = page
      .locator("main li")
      .filter({ has: page.getByRole("heading", { name: "Taylor Aucoin" }) });
    await expect(kit).toHaveCount(1);
    await expect(kit.locator("button")).toHaveCount(0);

    await page.goto("/work?state=gallery");
    const opener = page.getByRole("button", { name: "All 2 images" });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("img")).toHaveAttribute(
      "alt",
      "Fixture image one",
    );
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("feedback 2026-10-19: the tab line holds without chips; stack links at Paper's size", async ({
    page,
  }) => {
    const line = async () =>
      tabsNav(page).evaluate((nav) => {
        const row = nav.parentElement!.getBoundingClientRect();
        return [row.top, row.height];
      });
    await page.goto("/work");
    await expect(chipsNav(page)).toBeVisible();
    const product = await line();
    const link = await page
      .getByRole("link", { name: "Read the decision story" })
      .first()
      .evaluate((a) => {
        const s = getComputedStyle(a);
        return [s.fontSize, s.fontWeight, s.lineHeight, s.textUnderlineOffset];
      });
    expect(link).toEqual(["15px", "500", "18px", "3px"]);

    await page.goto("/work?tab=websites");
    expect(await line()).toEqual(product);
  });

  test("feedback round 2: tab switches move nothing; Websites' chips are disabled and unfocusable", async ({
    page,
  }) => {
    const box = (nav: ReturnType<typeof tabsNav>) =>
      nav.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return [r.x, r.y + scrollY, r.width, r.height];
      });
    const tabLinks = () =>
      tabsNav(page)
        .locator("a")
        .evaluateAll((els) =>
          els.map((a) => {
            const r = a.getBoundingClientRect();
            return [r.x, r.y + scrollY, r.width, r.height];
          }),
        );

    await page.goto("/work");
    const tabs = await box(tabsNav(page));
    // Branding's chips are fewer, so the row's width differs by tab; its
    // top and height are what hold the tab line.
    const rowLine = async () => {
      const [, y, , h] = await box(chipsNav(page));
      return [y, h];
    };
    const row = await rowLine();
    const links = await tabLinks();

    for (const name of ["Websites", "Branding & UI", "Product engineering"]) {
      await tabsNav(page).getByRole("link", { name }).click();
      await expect(tabsNav(page).locator("a[aria-current=true]")).toHaveText(
        name,
      );
      expect(await box(tabsNav(page)), name).toEqual(tabs);
      expect(await rowLine(), name).toEqual(row);
      expect(await tabLinks(), name).toEqual(links);
    }

    await page.goto("/work?tab=websites");
    const chips = chipsNav(page).locator("[aria-disabled=true]");
    await expect(chips.first()).toBeVisible();
    expect(
      await chips.evaluateAll((els) =>
        els.map((el) => [
          el.tabIndex,
          el.hasAttribute("href"),
          getComputedStyle(el).opacity,
          getComputedStyle(el).cursor,
        ]),
      ),
    ).toEqual(Array(5).fill([-1, false, "0.6", "not-allowed"]));
    await chips.first().click({ force: true });
    await expect(page).toHaveURL(/\/work\?tab=websites$/);
    await expectNoSeriousA11y(page, { include: "main nav" });
  });

  test("C6 no family office name in any tab", async ({ page }) => {
    for (const url of [
      "/work",
      "/work?tab=websites",
      "/work?tab=branding",
      "/work?type=contract",
    ]) {
      const html = await (await page.request.get(url)).text();
      for (const name of FAMILY_OFFICE_NAMES) {
        expect(html, `${name} on ${url}`).not.toContain(name);
      }
    }
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C5 no overflow, targets, meta, reduced motion, axe, skip link", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const url of [
      "/work",
      "/work?tab=websites",
      "/work?tab=branding",
      "/work?type=contract",
    ]) {
      await page.goto(url);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow, url).toBe(false);
      await expectNoSeriousA11y(page, { include: "main" });
    }

    await page.goto("/work");
    const heights = await page
      .locator("main nav a, main section li a")
      .evaluateAll((els) => els.map((a) => a.getBoundingClientRect().height));
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
    await expect(page.locator("main li p").first()).toHaveText(
      "Founding engineer · 2024 – 2025",
    );
    const durations = await page
      .locator("main nav a")
      .evaluateAll((els) =>
        els.map((a) => getComputedStyle(a).transitionDuration),
      );
    for (const d of durations) expect(parseFloat(d)).toBeLessThan(0.001);

    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toContainText("Work");
    expect(
      await page.evaluate(
        () => document.activeElement?.closest("main") !== null,
      ),
    ).toBe(true);
  });
});

/**
 * Feedback round 3: a type chip used to drop each row into the group's 200px
 * label column, so the link stack wrapped a word per line and each divider
 * ran a fifth of the width. Every row keeps All's columns and divider under
 * every chip, on every tab; under All too, the 440 title column had left the
 * link stack 58px wide at 1024 and pushed the page sideways below it.
 */
const storyLinks = (page: Page) =>
  page
    .getByRole("link", { name: "Read the decision story" })
    .evaluateAll((links) =>
      links.map((a) => {
        const range = document.createRange();
        range.selectNodeContents(a);
        return new Set(
          [...range.getClientRects()].map((r) => Math.round(r.top)),
        ).size;
      }),
    );
const scrollsSideways = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

const rowBoxes = (page: Page) =>
  page.locator("main section li").evaluateAll((rows) =>
    Object.fromEntries(
      rows.map((li) => {
        const x = (el: Element | null) => {
          const r = el!.getBoundingClientRect();
          return [Math.round(r.x), Math.round(r.width)];
        };
        return [
          li.querySelector("h3")!.textContent,
          {
            divider: x(li),
            title: x(li.querySelector("h3")),
            meta: x(li.querySelector(":scope > p")),
            links: x(li.querySelector(":scope > div")),
          },
        ];
      }),
    ),
  );

for (const width of [1440, 1024]) {
  test.describe(`feedback round 3 at ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("a type chip keeps All's columns and divider width", async ({
      page,
    }) => {
      for (const tab of ["product", "branding", "websites"]) {
        await page.goto(`/work?tab=${tab}`);
        const all = await rowBoxes(page);
        expect(Object.keys(all).length, tab).toBeGreaterThan(0);
        expect(await scrollsSideways(page), tab).toBe(false);
        for (const lines of await storyLinks(page)) expect(lines, tab).toBe(1);
        const chips = await chipsNav(page)
          .locator("a:not([aria-current])")
          .evaluateAll((els) => els.map((a) => a.getAttribute("href")!));
        for (const href of chips) {
          await page.goto(href);
          const filtered = await rowBoxes(page);
          expect(Object.keys(filtered).length, href).toBeGreaterThan(0);
          for (const [title, boxes] of Object.entries(filtered)) {
            expect(boxes, `${title} on ${href}`).toEqual(all[title]);
          }
        }
      }
    });
  });
}

test.describe("feedback round 3 at 834", () => {
  test.use({ viewport: { width: 834, height: 1112 } });

  test("rows stack inside the group's column, with no sideways scroll", async ({
    page,
  }) => {
    for (const url of ["/work", "/work?type=full-time", "/work?tab=branding"]) {
      await page.goto(url);
      expect(await scrollsSideways(page), url).toBe(false);
      for (const lines of await storyLinks(page)) expect(lines, url).toBe(1);
    }
  });
});

test.describe("feedback round 3 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the story link sits on its own line, unwrapped, under every chip", async ({
    page,
  }) => {
    for (const url of [
      "/work",
      "/work?type=full-time",
      "/work?type=contract",
    ]) {
      await page.goto(url);
      const links = await page
        .locator("main section li")
        .filter({
          has: page.getByRole("link", { name: "Read the decision story" }),
        })
        .evaluateAll((rows) =>
          rows.map((li) => {
            const tagline = li.querySelectorAll(":scope > p")[1]!;
            const a = [...li.querySelectorAll("a")].find(
              (el) => el.textContent === "Read the decision story",
            )!;
            const range = document.createRange();
            range.selectNodeContents(a);
            const lines = new Set(
              [...range.getClientRects()].map((r) => Math.round(r.top)),
            ).size;
            return {
              below:
                a.getBoundingClientRect().top >=
                tagline.getBoundingClientRect().bottom,
              lines,
            };
          }),
        );
      expect(links.length, url).toBeGreaterThan(0);
      for (const link of links)
        expect(link, url).toEqual({ below: true, lines: 1 });
    }
  });
});
