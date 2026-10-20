import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-28: the shared intake pieces on synthetic engagements held in memory,
 * at the harness (`app/test-harness/intake`, D-SITE-218). Its 404 in
 * production is proven by `tests/unit/intake-harness.test.ts`, which calls the
 * page with `VERCEL_ENV=production`.
 */
const HARNESS = "/test-harness/intake";
const at = (key: string) => `${HARNESS}?state=${key}`;
const KEYS = [
  "save",
  "resume",
  "confirming",
  "unavailable",
  "unavailable-invalid",
] as const;
const SYNTHETIC = "/websites/coded/intake/tok_synthetic_site28";
const CONSENT_KEY = "ta:analytics-consent";

/** The save line's sentences, from `save-indicator.tsx`. */
const SAVE_LINES = {
  saving: "Saving…",
  saved: "Saved",
  offline: "Saved on this phone — will sync",
  error: "Having trouble saving — your answers are safe on this phone",
} as const;

async function sendSaveState(page: Page, state: string) {
  await page.evaluate((detail) => {
    window.dispatchEvent(
      new CustomEvent("intake-fixture:save-state", { detail }),
    );
  }, state);
}

test.describe("C3 the save line", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("each state shows its line once in one polite region; error offers Try again", async ({
    page,
  }) => {
    await page.goto(at("save"));
    const region = page.locator("[data-save-line]");
    await expect(region).toHaveCount(1);
    await expect(region).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("footer [aria-live]")).toHaveCount(1);

    // Every distinct text the region holds, in order, from the first state on.
    await region.evaluate((el) => {
      const seen: string[] = [];
      (window as unknown as { seen: string[] }).seen = seen;
      new MutationObserver(() => {
        const text = el.textContent ?? "";
        if (seen.at(-1) !== text) seen.push(text);
      }).observe(el, { childList: true, subtree: true, characterData: true });
    });

    for (const state of ["saving", "saved", "offline", "error"] as const) {
      await sendSaveState(page, state);
      await expect(region).toContainText(SAVE_LINES[state]);
    }
    await expect(
      region.getByRole("button", { name: "Try again" }),
    ).toBeVisible();

    const seen = await page.evaluate(
      () => (window as unknown as { seen: string[] }).seen,
    );
    expect(seen).toEqual([
      SAVE_LINES.saving,
      SAVE_LINES.saved,
      SAVE_LINES.offline,
      `${SAVE_LINES.error} Try again`,
    ]);
  });

  test("on step 4 of 10 the progress fill is 30% of its track", async ({
    page,
  }) => {
    await page.goto(at("save"));
    await expect(page.getByText("Step 4 of 10")).toBeVisible();
    const ratio = await page.evaluate(() => {
      const track = document.querySelector("[data-progress-track]")!;
      const fill = document.querySelector("[data-progress-fill]")!;
      return (
        fill.getBoundingClientRect().width / track.getBoundingClientRect().width
      );
    });
    expect(ratio).toBeCloseTo(0.3, 2);
  });
});

test.describe("C4 resume rows, the theme group and touch targets at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("resume at step 4: one current row, three visited rows with a hidden word", async ({
    page,
  }) => {
    await page.goto(at("resume"));
    const rows = page.locator("main ol > li");
    await expect(rows).toHaveCount(10);
    await expect(page.locator('main [aria-current="step"]')).toHaveCount(1);
    await expect(rows.nth(3).locator('[aria-current="step"]')).toHaveCount(1);
    const hidden = page.locator("main ol .sr-only");
    await expect(hidden).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(rows.nth(i).locator(".sr-only")).toHaveCount(1);
    }
  });

  for (const key of KEYS) {
    test(`${key}: the theme group is Theme with Light, Dark, System at 48px; meta links hit 44px`, async ({
      page,
    }) => {
      await page.goto(at(key));
      const group = page.getByRole("group", { name: "Theme" });
      await expect(group).toBeVisible();
      for (const name of ["Light", "Dark", "System"]) {
        const box = await group.getByRole("button", { name }).boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(48);
        expect(box!.height).toBeGreaterThanOrEqual(48);
      }
      const short = await page.evaluate(() =>
        [...document.querySelectorAll("main a, main button")]
          .filter((el) => getComputedStyle(el).fontSize === "13px")
          .filter((el) => el.getBoundingClientRect().height < 44)
          .map((el) => el.textContent),
      );
      expect(short).toEqual([]);
    });
  }
});

test.describe("C5 one main and one h1", () => {
  for (const key of KEYS) {
    test(`harness ${key}`, async ({ page }) => {
      await page.goto(at(key));
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test("GET /websites/intake", async ({ page }) => {
    await page.goto("/websites/intake");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  /**
   * A synthetic token renders the invalid-link screen when a database
   * answers. The agent build has none, so the route answers 500 there as on
   * main (SITE-24 C2), and the same screen is proven at the harness's
   * `unavailable-invalid` key above.
   */
  test("the synthetic token", async ({ page, request }) => {
    const response = await request.get(SYNTHETIC);
    await page.goto(SYNTHETIC);
    if (response.status() === 500) {
      await expect(page.locator("main")).toHaveCount(0);
      return;
    }
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  });
});

test.describe("C6 no chrome, no Google, and reduced motion", () => {
  for (const path of ["/websites/intake", SYNTHETIC, ...KEYS.map(at)]) {
    test(`${path} renders no banner, footer or consent and calls no Google host`, async ({
      page,
      context,
    }) => {
      const google: string[] = [];
      context.on("request", (r) => {
        if (isGoogleHost(new URL(r.url()).hostname)) google.push(r.url());
      });
      await page.addInitScript(
        ([key]) => localStorage.setItem(key, "granted"),
        [CONSENT_KEY],
      );
      await page.goto(path);
      await page.waitForLoadState("load");
      await page.waitForTimeout(1_500);
      await expect(page.getByRole("banner")).toHaveCount(0);
      await expect(page.getByRole("contentinfo")).toHaveCount(0);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(google).toEqual([]);
    });
  }

  test.describe("under reduced motion", () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
    });

    for (const key of [...KEYS, "working"]) {
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

    test("the working line holds its first line for 3s", async ({ page }) => {
      await page.goto(at("working"));
      const line = page.locator("main [aria-live]");
      await expect(line).toHaveText("[Fixture: first line]");
      await page.waitForTimeout(3_000);
      await expect(line).toHaveText("[Fixture: first line]");
    });
  });
});

test.describe("C7 axe on every harness key", () => {
  for (const width of [390, 1440]) {
    for (const scheme of ["dark", "light"] as const) {
      test.describe(`${width} ${scheme}`, () => {
        test.use({
          viewport: { width, height: 900 },
          colorScheme: scheme,
        });

        for (const key of KEYS) {
          test(key, async ({ page }) => {
            await page.addInitScript(
              ([theme]) => localStorage.setItem("theme", theme),
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
