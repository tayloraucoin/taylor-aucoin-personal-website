import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/**
 * SITE-29: the coded intake's entry, money and plain question screens, on
 * SITE-28's harness (`/test-harness/intake?state=<key>`, synthetic engagements
 * held in memory) and on the coded routes that need no engagement.
 */
const at = (key: string) => `/test-harness/intake?state=${key}`;
const KEYS = [
  "start",
  "start-resume",
  "invalid",
  "welcome",
  "step",
  "pay",
  "done",
] as const;
const START = "/websites/coded/intake";
const REVIEW = "/websites/coded/intake/tok_synthetic_site28/review";

/** The links and buttons in `main` filled with the kit's solid primary. */
async function solidPrimaries(page: Page) {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.background = "var(--color-fill)";
    document.body.append(probe);
    const fill = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return [...document.querySelectorAll("main a, main button")]
      .filter((el) => getComputedStyle(el).backgroundColor === fill)
      .map((el) => ({
        text: (el.textContent ?? "").trim(),
        width: el.getBoundingClientRect().width,
        main: document.querySelector("main")!.getBoundingClientRect().width,
      }));
  });
}

test.describe("C3 the email error on the start page", () => {
  test("on blur: an alert, aria-invalid, a 2px text-colour border, Start unchanged", async ({
    page,
  }) => {
    await page.goto(START);
    const start = page.getByRole("button", { name: "Start", exact: false });
    const label = await start.textContent();
    const email = page.getByLabel("Email");
    await email.fill("sam@fixture");
    await email.blur();

    const alert = page.locator("main").getByRole("alert");
    await expect(alert).toHaveCount(1);
    await expect(alert).toContainText("doesn't look like an email");
    await expect(email).toHaveAttribute("aria-invalid", "true");
    // The border eases to its colour over the fast duration; read it settled.
    await expect
      .poll(() =>
        email.evaluate((el) => {
          const style = getComputedStyle(el);
          return [style.borderTopWidth, style.borderTopColor === style.color];
        }),
      )
      .toEqual(["2px", true]);
    await expect(start).toHaveText(label!);
  });
});

test.describe("C4 one main, one h1, no Agora", () => {
  const paths = [
    START,
    "/websites/coded/intake/add-ons",
    ...KEYS.filter((k) =>
      ["start-resume", "welcome", "step", "pay", "done"].includes(k),
    ).map(at),
  ];

  for (const path of paths) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("body")).not.toContainText("Agora ·");
    });
  }

  /**
   * The review page needs an engagement. The agent build has no database, so
   * the synthetic token answers 500 there, as on main (SITE-24 C2).
   */
  test(REVIEW, async ({ page, request }) => {
    const response = await request.get(REVIEW);
    await page.goto(REVIEW);
    if (response.status() === 500) {
      await expect(page.locator("main")).toHaveCount(0);
      return;
    }
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("body")).not.toContainText("Agora ·");
  });
});

test.describe("C5 pay, done and welcome", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("pay: one plan radio group, native checkboxes, linked agreement, tabular total, one full-width primary", async ({
    page,
  }) => {
    await page.goto(at("pay"));
    const radios = page.locator('main input[type="radio"]');
    await expect(radios).toHaveCount(2);
    expect(
      new Set(
        await radios.evaluateAll((els) =>
          els.map((el) => el.getAttribute("name")),
        ),
      ),
    ).toEqual(new Set(["plan"]));

    const boxes = page.locator('main input[type="checkbox"]');
    expect(await boxes.count()).toBeGreaterThanOrEqual(3);

    const agreement = boxes.last().locator("xpath=ancestor::label[1]/..");
    await expect(agreement.getByRole("button")).toHaveCount(2);

    await radios.first().check({ force: true });
    await boxes.first().check({ force: true });
    await boxes.last().check({ force: true });

    const total = page.locator("[data-total]");
    await expect(total).toHaveCSS("font-variant-numeric", "tabular-nums");

    const primaries = await solidPrimaries(page);
    expect(primaries).toHaveLength(1);
    expect(primaries[0]!.text).toMatch(/^Pay/);
    expect(primaries[0]!.width).toBeCloseTo(primaries[0]!.main, 0);
  });

  test("done: no solid primary; Review my answers is a link", async ({
    page,
  }) => {
    await page.goto(at("done"));
    expect(await solidPrimaries(page)).toEqual([]);
    await expect(
      page.getByRole("link", { name: "Review my answers" }),
    ).toBeVisible();
  });

  test("welcome lists ten numbered steps", async ({ page }) => {
    await page.goto(at("welcome"));
    const rows = page.locator("main section ol > li");
    await expect(rows).toHaveCount(10);
    for (let i = 0; i < 10; i++) {
      await expect(rows.nth(i).locator("span").first()).toHaveText(
        String(i + 1),
      );
    }
  });

  for (const key of KEYS) {
    test(`${key}: at most one solid primary`, async ({ page }) => {
      await page.goto(at(key));
      expect((await solidPrimaries(page)).length).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("C6 touch, scroll, axe and reduced motion", () => {
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

  test.describe("under reduced motion", () => {
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
  });
});
