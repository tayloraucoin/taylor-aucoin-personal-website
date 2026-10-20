import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * SITE-30: the taste gallery, the credits import and its marks, and the voice
 * step, on SITE-28's harness (`/test-harness/intake?state=<key>`, synthetic
 * engagements and an example set held in memory).
 */
const at = (key: string) => `/test-harness/intake?state=${key}`;
const KEYS = [
  "taste",
  "import",
  "import-reading",
  "import-mark",
  "words",
] as const;

const activeInside = (selector: string) =>
  `document.querySelector(${JSON.stringify(selector)})?.contains(document.activeElement) ?? false`;

test.describe("C3 the import result holds focus", () => {
  test("focus is in the modal on open, stays under Tab and Shift+Tab, and its primary goes to step 2", async ({
    page,
  }) => {
    await page.goto(at("import"));
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toHaveCount(1);
    await expect
      .poll(() => page.evaluate(activeInside('[role="dialog"]')))
      .toBe(true);

    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press(key);
        expect(await page.evaluate(activeInside('[role="dialog"]'))).toBe(true);
      }
    }

    const links = dialog.getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute(
      "href",
      "/websites/coded/intake/tok_synthetic_site28/about",
    );
  });
});

test.describe("C4 the taste gallery", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the open group's head is a button with aria-expanded true", async ({
    page,
  }) => {
    await page.goto(at("taste"));
    await expect(page.locator('main button[aria-expanded="true"]')).toHaveCount(
      1,
    );
  });

  test("the gallery traps focus and Escape returns it to its opener", async ({
    page,
  }) => {
    await page.goto(at("taste"));
    const opener = page.getByRole("button", { name: "See more" }).first();
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible();

    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press(key);
        expect(await page.evaluate(activeInside('[role="dialog"]'))).toBe(true);
      }
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});

test.describe("C5 landmarks, touch targets and axe", () => {
  for (const key of KEYS) {
    test(`${key}: one main and one h1`, async ({ page }) => {
      await page.goto(at(key));
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test.describe("at 390", () => {
    test.use({ viewport: { width: 390, height: 844 } });

    for (const key of KEYS) {
      test(`${key}: meta links hit 44px, no horizontal scroll`, async ({
        page,
      }) => {
        await page.goto(at(key));
        const short = await page.evaluate(() =>
          [...document.querySelectorAll("main a, main button")]
            .filter((el) => getComputedStyle(el).fontSize === "13px")
            .filter((el) => el.getBoundingClientRect().height < 44)
            .map((el) => el.textContent),
        );
        expect(short).toEqual([]);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });

  for (const width of [390, 1440]) {
    for (const scheme of ["dark", "light"] as const) {
      test.describe(`axe at ${width} ${scheme}`, () => {
        test.use({ viewport: { width, height: 900 }, colorScheme: scheme });

        for (const key of KEYS) {
          test(key, async ({ page }) => {
            await page.addInitScript(
              ([theme]) => localStorage.setItem("ta-theme", theme),
              [scheme],
            );
            await page.goto(at(key));
            await expectNoSeriousA11y(page);
          });
        }
      });
    }
  }
});

test.describe("C6 reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  for (const key of KEYS) {
    test(`${key}: every element computes transition-duration 0s`, async ({
      page,
    }) => {
      await page.goto(at(key));
      const moving = await page.evaluate(() =>
        [...document.querySelectorAll("main, main *, [role=group] *")]
          .filter((el) =>
            getComputedStyle(el)
              .transitionDuration.split(",")
              .some((d) => parseFloat(d) !== 0),
          )
          .map((el) => el.outerHTML.slice(0, 80)),
      );
      expect(moving).toEqual([]);
    });
  }

  test("import-reading: the working line holds its first line for 3s", async ({
    page,
  }) => {
    await page.goto(at("import-reading"));
    const line = page.locator('[role="dialog"] [aria-live]');
    const first = await line.textContent();
    expect(first).toBeTruthy();
    await page.waitForTimeout(3_000);
    await expect(line).toHaveText(first!);
  });
});
