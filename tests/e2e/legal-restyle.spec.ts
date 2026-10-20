import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import {
  diffLegal,
  LEGAL_PATHS,
  readLegalGolden,
  readLegalText,
} from "./legal-golden";

/**
 * SITE-31: the three legal pages restyled by tokens only. Their words, titles
 * and descriptions are pinned by `tests/golden/legal-text.json`, taken from
 * the branch before SITE-31's first commit.
 */
const golden = readLegalGolden();
const SERVICE_PATHS = ["/websites/privacy", "/websites/terms"] as const;

test.describe("C1 the words are main's", () => {
  for (const path of LEGAL_PATHS) {
    test(`${path} matches the golden text, title and description`, async ({
      page,
    }) => {
      await page.goto(path);
      expect(diffLegal(golden[path]!, await readLegalText(page))).toBeNull();
    });
  }

  test("one changed word in a copy of the golden file fails the comparison", async ({
    page,
  }) => {
    await page.goto("/websites/terms");
    const now = await readLegalText(page);
    const original = golden["/websites/terms"]!;
    const words = original.text.split(" ");
    const at = Math.floor(words.length / 2);
    words[at] = `${words[at]}x`;
    const altered = { ...original, text: words.join(" ") };
    expect(diffLegal(altered, now)).not.toBeNull();
  });
});

test.describe("C4 landmarks and chrome", () => {
  for (const path of LEGAL_PATHS) {
    test(`${path} has one main and one h1`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  for (const path of SERVICE_PATHS) {
    test(`${path} renders no header, skip link or site footer`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.getByRole("banner")).toHaveCount(0);
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toHaveCount(0);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
    });
  }

  test("/privacy renders the site header and one footer outside its main", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator("main footer")).toHaveCount(0);
  });
});

test.describe("C5 axe and width", () => {
  for (const width of [390, 1440]) {
    for (const scheme of ["dark", "light"] as const) {
      test.describe(`${width} ${scheme}`, () => {
        test.use({ viewport: { width, height: 900 }, colorScheme: scheme });

        for (const path of LEGAL_PATHS) {
          test(path, async ({ page }) => {
            await page.addInitScript(
              ([theme]) => localStorage.setItem("ta-theme", theme),
              [scheme],
            );
            await page.goto(path);
            await expectNoSeriousA11y(page);
            if (width === 390) {
              const overflow = await page.evaluate(
                () =>
                  document.documentElement.scrollWidth -
                  document.documentElement.clientWidth,
              );
              expect(overflow).toBeLessThanOrEqual(0);
            }
          });
        }
      });
    }
  }
});
