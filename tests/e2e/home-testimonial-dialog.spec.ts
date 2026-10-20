import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** Feedback round 2: home's testimonial cards open the full quote. */

const card = (page: Page, name: string) =>
  page.getByRole("button", { name: `Read ${name}'s testimonial in full` });
const dialog = (page: Page) => page.getByRole("dialog");
const count = (page: Page) => dialog(page).locator("[aria-live=polite]");
const NAMES = [
  "Dawson Whitfield",
  "Bruno Vitale",
  "Vaughn Richards",
  "Yogesh Verma",
];

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("a click opens the full quote, labelled by the name, focus on Close; Close returns focus to the card", async ({
    page,
  }) => {
    await page.goto("/");
    await card(page, "Bruno Vitale").click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toHaveAttribute("aria-modal", "true");
    await expect(dialog(page)).toHaveAccessibleName("Bruno Vitale");
    await expect(count(page)).toHaveText("2 of 4");
    await expect(dialog(page).locator("blockquote p")).toHaveCount(5);
    await expect(
      dialog(page).getByRole("button", { name: "Close" }),
    ).toBeFocused();
    // Opacity only: no blur, no transform.
    const look = await dialog(page).evaluate((el) => {
      const scrim = el.parentElement!;
      return [
        getComputedStyle(scrim).backdropFilter,
        getComputedStyle(el).transform,
        el.getBoundingClientRect().width,
      ];
    });
    expect(look).toEqual(["none", "none", 720]);
    await expect(page.locator("[data-dialog-phase=open]")).toHaveCSS(
      "opacity",
      "1",
    );

    await dialog(page).getByRole("button", { name: "Close" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(card(page, "Bruno Vitale")).toBeFocused();
  });

  test("Next and Previous cycle and wrap, naming each neighbour; arrow keys do the same", async ({
    page,
  }) => {
    await page.goto("/");
    await card(page, "Yogesh Verma").click();
    const name = dialog(page).locator("h2");
    const footer = dialog(page).locator(":scope > div").last();
    await expect(name).toHaveText("Yogesh Verma");
    await expect(count(page)).toHaveText("4 of 4");
    await expect(footer).toContainText("Vaughn Richards");
    await expect(footer).toContainText("Dawson Whitfield");

    // Next on the last wraps to the first.
    await dialog(page).getByRole("button", { name: "Next" }).click();
    await expect(name).toHaveText("Dawson Whitfield");
    await expect(count(page)).toHaveText("1 of 4");
    // Previous on the first wraps to the last.
    await dialog(page).getByRole("button", { name: "Previous" }).click();
    await expect(name).toHaveText("Yogesh Verma");

    // From the last, ArrowRight walks all four and wraps again.
    for (const expected of [...NAMES, NAMES[0]]) {
      await page.keyboard.press("ArrowRight");
      await expect(name).toHaveText(expected);
    }
    await page.keyboard.press("ArrowLeft");
    await expect(name).toHaveText("Yogesh Verma");
    await expect(count(page)).toHaveText("4 of 4");
  });

  test("by keyboard: Enter opens at once, focus is trapped, Esc closes and returns focus", async ({
    page,
  }) => {
    await page.goto("/");
    await card(page, "Dawson Whitfield").focus();
    await page.keyboard.press("Enter");
    // Opened by keyboard, it appears at once (canon A-15).
    await expect(page.locator("[data-dialog-phase=open]")).toHaveCount(1);
    await expect(
      dialog(page).getByRole("button", { name: "Close" }),
    ).toBeFocused();

    const inside = () =>
      page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      expect(await inside(), `Tab ${i}`).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await inside(), `Shift+Tab ${i}`).toBe(true);
    }

    await page.keyboard.press("ArrowRight");
    await expect(dialog(page).locator("h2")).toHaveText("Bruno Vitale");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
    await expect(card(page, "Dawson Whitfield")).toBeFocused();
  });

  test("a scrim click closes; the body does not scroll while open", async ({
    page,
  }) => {
    await page.goto("/");
    await card(page, "Vaughn Richards").click();
    await expect(dialog(page)).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(
      "hidden",
    );
    await page.mouse.click(40, 450);
    await expect(dialog(page)).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    await expect(card(page, "Vaughn Richards")).toBeFocused();
  });

  test("every drawn state renders by ?state=, axe clean in the dialog", async ({
    page,
  }) => {
    for (const [state, who, of, focused] of [
      ["testimonial-open", "Bruno Vitale", "2 of 4", "Close"],
      ["testimonial-first", "Dawson Whitfield", "1 of 4", "Close"],
      ["testimonial-last", "Yogesh Verma", "4 of 4", "Close"],
      ["testimonial-focus", "Vaughn Richards", "3 of 4", "Next"],
    ]) {
      await page.goto(`/?state=${state}`);
      await expect(dialog(page), state).toHaveAccessibleName(who);
      await expect(count(page), state).toHaveText(of);
      await expect(
        dialog(page).getByRole("button", { name: focused }),
        state,
      ).toBeFocused();
      await expectNoSeriousA11y(page, { include: "[role=dialog]" });
    }
    // The long quote scrolls inside the body; header and footer stay put.
    await page.goto("/?state=testimonial-open");
    const box = await dialog(page).evaluate((el) => {
      const body = el.children[1] as HTMLElement;
      return [
        el.getBoundingClientRect().height,
        body.scrollHeight > body.clientHeight,
      ];
    });
    expect(box).toEqual([720, true]);
  });

  test("reduced motion: open and close are instant", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await card(page, "Bruno Vitale").click();
    await expect(page.locator("[data-dialog-phase=open]")).toHaveCSS(
      "opacity",
      "1",
    );
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("full screen, neighbours' names hidden, 44px cycle buttons, axe clean", async ({
    page,
  }) => {
    await page.goto("/?state=testimonial-open");
    const box = await dialog(page).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height];
    });
    expect(box).toEqual([0, 0, 390, 844]);
    const footer = dialog(page).locator(":scope > div").last();
    await expect(footer.getByText("Dawson Whitfield")).toBeHidden();
    await expect(footer.getByText("Vaughn Richards")).toBeHidden();
    for (const name of ["Previous", "Next"]) {
      expect(
        (await dialog(page).getByRole("button", { name }).boundingBox())!
          .height,
      ).toBe(44);
    }
    await expectNoSeriousA11y(page, { include: "[role=dialog]" });
  });
});
