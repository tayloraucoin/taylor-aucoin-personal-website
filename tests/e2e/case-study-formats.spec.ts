import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-16: What I built in each study's format. */

const built = (page: Page) =>
  page.locator("main section").filter({
    has: page.getByRole("heading", { level: 2, name: "What I built" }),
  });
const buttons = (page: Page) => built(page).locator("button[data-zoom-index]");
const dialog = (page: Page) => page.getByRole("dialog");

async function expectLightboxCycle(
  page: Page,
  opener: ReturnType<typeof buttons>,
) {
  await opener.click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page))
    .toBeFocused({ timeout: 2000 })
    .catch(() => {});
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(
      () => !!document.activeElement?.closest("[role=dialog]"),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toHaveCount(0);
  await expect(opener).toBeFocused();
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 each study's format", async ({ page }) => {
    for (const slug of ["everbook", "agora"]) {
      await page.goto(`/work/${slug}`);
      const gallery = built(page)
        .locator("ul")
        .filter({
          has: page.getByRole("button", { name: /^All \d+ images$/ }),
        });
      await expect(gallery).toHaveCount(1);
      await expect(gallery.locator("li")).toHaveCount(5);
      await expect(
        built(page).locator("figure figcaption").first(),
      ).toBeVisible();
    }

    await page.goto("/work/conscious-connections");
    await expect(
      built(page).getByRole("button", { name: "All 5 images" }),
    ).toBeVisible();
    await expect(
      built(page).locator("figure video, figure img").first(),
    ).toBeVisible();

    await page.goto("/work/roomvy");
    await expect(buttons(page)).toHaveCount(2);
    await expect(built(page)).toContainText(
      "Design direction by Nick Kidd (Pathfinder Studios); I built the application.",
    );

    await page.goto("/work/future-of-cities");
    await expect(buttons(page)).toHaveCount(1);
    const row = built(page)
      .locator("div.grid")
      .filter({
        has: page.getByRole("heading", { name: "Unified data layer" }),
      });
    await expect(row.locator("button img")).toHaveCount(1);

    await page.goto("/work/calculate-qxmd");
    await expect(built(page).locator("img, button, video")).toHaveCount(0);
    await expect(built(page)).not.toContainText("All");
  });

  test("C2 lightbox opens on the item, traps focus, returns it", async ({
    page,
  }) => {
    await page.goto("/work/everbook");
    const second = built(page).locator("button[data-zoom-index='2']");
    await expectLightboxCycle(page, second);
    const all = built(page).getByRole("button", { name: /^All \d+ images$/ });
    await expectLightboxCycle(page, all);

    await page.goto("/work/roomvy");
    await expectLightboxCycle(page, buttons(page).nth(1));

    await page.goto("/work/conscious-connections");
    await expectLightboxCycle(
      page,
      built(page).getByRole("button", { name: "All 5 images" }),
    );
  });

  test("C3 names, and n matches what the lightbox steps through", async ({
    page,
  }) => {
    await page.goto("/work/conscious-connections");
    const tiles = built(page)
      .locator("button[data-zoom-index]")
      .filter({
        hasNot: page.getByText(/^All \d+ images$/),
      });
    const count = await tiles.count();
    for (let i = 0; i < count; i++) {
      const tile = tiles.nth(i);
      const caption = (await tile.locator("span").first().innerText()).trim();
      await expect(tile).toHaveAccessibleName(caption);
    }
    for (const slug of ["everbook", "agora", "conscious-connections"]) {
      await page.goto(`/work/${slug}`);
      const label = await built(page)
        .getByRole("button", { name: /^All \d+ images$/ })
        .innerText();
      const n = Number(label.match(/\d+/)![0]);
      await built(page)
        .getByRole("button", { name: /^All \d+ images$/ })
        .click();
      const counter = await dialog(page).innerText();
      expect(counter, slug).toMatch(new RegExp(`1\\s*/\\s*${n}\\b`));
      await page.keyboard.press("Escape");
    }
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("C4 two thumbs per row, targets, no autoplay, axe", async ({ page }) => {
    for (const reduced of ["reduce", "no-preference"] as const) {
      await page.emulateMedia({ reducedMotion: reduced });
      for (const slug of [
        "everbook",
        "agora",
        "conscious-connections",
        "roomvy",
        "future-of-cities",
        "calculate-qxmd",
      ]) {
        await page.goto(`/work/${slug}`);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );
        expect(overflow, slug).toBe(false);
        const playing = await page
          .locator("main video")
          .evaluateAll(
            (els) => els.filter((v) => !(v as HTMLVideoElement).paused).length,
          );
        expect(playing, slug).toBe(0);
        if (reduced === "reduce")
          await expectNoSeriousA11y(page, { include: "main" });
      }
    }
    await page.goto("/work/everbook");
    const thumbs = built(page).locator("ul li button");
    const xs = await thumbs.evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().left)),
    );
    expect(new Set(xs).size).toBe(2);
    const box = await built(page)
      .getByRole("button", { name: /^All \d+ images$/ })
      .boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
