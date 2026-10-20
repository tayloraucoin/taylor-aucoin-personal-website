import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-21: `/book`'s screening. Needs `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn
 * build:agent` for C8, which reads real collect requests (gtag.js passes
 * through; every other Google request is answered 204 here).
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const ADDRESS = "hello@tayloraucoin.com";

type Answers = {
  building: string;
  budget?: string;
  start?: string;
  role?: string;
  name?: string;
  email: string;
};

const FIT: Answers = {
  building: "A scheduling tool for a six-person clinic.",
  budget: "$15K–$75K",
  start: "In 1–3 months",
  role: "Product engineer",
  email: "robin@example.test",
};
const NOT_A_FIT: Answers = { ...FIT, budget: "No budget yet" };
const WEBSITE: Answers = { ...FIT, role: "A website or brand" };

async function stubGoogle(context: BrowserContext) {
  const google: string[] = [];
  await context.route(
    (url) =>
      isGoogleHost(url.hostname) &&
      !(
        url.hostname === "www.googletagmanager.com" &&
        url.pathname === "/gtag/js"
      ),
    (route) => route.fulfill({ status: 204 }),
  );
  context.on("request", (r) => {
    if (isGoogleHost(new URL(r.url()).hostname)) google.push(r.url());
  });
  return google;
}

function countActions(page: Page) {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && r.headers()["next-action"])
      posts.push(r.url());
  });
  return posts;
}

async function open(page: Page, path = "/book") {
  await page.goto(path);
  await page.waitForFunction(() => {
    const form = document.querySelector("main form");
    return !!form && Object.keys(form).some((k) => k.startsWith("__react"));
  });
}

function main(page: Page) {
  return page.locator("main#main");
}

function group(page: Page, label: RegExp) {
  return main(page).getByRole("radiogroup", { name: label });
}

const GROUPS = {
  budget: /^Budget/,
  start: /^When do you want to start\?/,
  role: /^The role you need/,
} as const;

async function choose(page: Page, field: keyof typeof GROUPS, label: string) {
  await group(page, GROUPS[field]).getByText(label, { exact: true }).click();
}

async function fill(page: Page, a: Answers) {
  await main(page)
    .getByLabel(/^What are you building\?/)
    .fill(a.building);
  if (a.budget) await choose(page, "budget", a.budget);
  if (a.start) await choose(page, "start", a.start);
  if (a.role) await choose(page, "role", a.role);
  if (a.name) await main(page).getByLabel("Name").fill(a.name);
  await main(page).getByLabel("Email").fill(a.email);
}

function continueButton(page: Page) {
  return main(page).getByRole("button", { name: /^(Continue|Sending…)/ });
}

async function waitPastFillTime(page: Page) {
  await page.waitForTimeout(2_100);
}

async function submit(page: Page, a: Answers) {
  await fill(page, a);
  await waitPastFillTime(page);
  await continueButton(page).click();
}

function heading(page: Page) {
  return main(page).getByRole("heading", { level: 1 });
}

async function expectNoCallInHeader(page: Page) {
  const header = page.locator("header").first();
  await expect(
    header.getByRole("link", { name: "Book a 30-minute call" }),
  ).toHaveCount(0);
  await expect(header.locator("[aria-current]")).toHaveCount(0);
}

for (const width of [390, 1440]) {
  test.describe(`C4 at ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("no call button and no current item in the form, fit and not-a-fit views", async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await open(page);
      await expectNoCallInHeader(page);
      await submit(page, FIT);
      await expect(heading(page)).toHaveText(/^Let's book it/);
      await expectNoCallInHeader(page);

      await open(page);
      await submit(page, NOT_A_FIT);
      await expect(heading(page)).toHaveText(/^Let's talk first/);
      await expectNoCallInHeader(page);
    });
  });
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C4 chip groups: named, required, one checked, width kept, 3px bar, keyboard", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    for (const label of Object.values(GROUPS)) {
      const g = group(page, label);
      await expect(g).toHaveCount(1);
      await expect(g).toHaveAttribute("aria-required", "true");
    }

    const budget = group(page, GROUPS.budget);
    const chip = budget.locator("label").filter({ hasText: "$15K–$75K" });
    const before = (await chip.boundingBox())!.width;
    await choose(page, "budget", "Under $15K");
    await choose(page, "budget", "$15K–$75K");
    await expect(budget.getByRole("radio", { checked: true })).toHaveCount(1);
    await expect(
      budget.getByRole("radio", { name: "$15K–$75K" }),
    ).toBeChecked();
    expect((await chip.boundingBox())!.width).toBe(before);
    const bar = await chip.locator("[data-chip-bar]").evaluate((el) => {
      const s = getComputedStyle(el);
      return { display: s.display, height: s.height };
    });
    expect(bar).toEqual({ display: "block", height: "3px" });

    // Tab from the building answer enters the budget group; arrows move and select.
    await main(page)
      .getByLabel(/^What are you building\?/)
      .focus();
    await page.keyboard.press("Tab");
    await expect(
      budget.getByRole("radio", { name: "$15K–$75K" }),
    ).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(
      budget.getByRole("radio", { name: "Over $75K" }),
    ).toBeFocused();
    await expect(
      budget.getByRole("radio", { name: "Over $75K" }),
    ).toBeChecked();
    await expect(budget.getByRole("radio", { checked: true })).toHaveCount(1);

    await expect(main(page).getByLabel("Name")).toHaveAttribute(
      "autocomplete",
      "name",
    );
    const email = main(page).getByLabel("Email");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("autocomplete", "email");
  });

  test("C5 budget unanswered and email malformed: both errors, focus on budget, nothing sent", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    const actions = countActions(page);
    await open(page);
    await fill(page, { ...FIT, budget: undefined, email: "robin@example" });
    await continueButton(page).click();

    const budget = group(page, GROUPS.budget);
    await expect(budget.getByRole("radio").first()).toBeFocused();
    for (const [field, line] of [
      [budget, 'Pick the closest band, or "No budget yet".'],
      [
        main(page).getByLabel("Email"),
        "That doesn't look like an email address — check for a typo.",
      ],
    ] as const) {
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const describedBy = await field.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      await expect(page.locator(`[id="${describedBy}"]`)).toContainText(line);
    }
    await page.waitForTimeout(500);
    expect(actions).toEqual([]);
  });

  test("C6 sending holds the button busy and not disabled; a second press sends nothing", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    const actions = countActions(page);
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/book", async (route) => {
      if (route.request().headers()["next-action"]) await held;
      await route.continue();
    });
    await open(page);
    await submit(page, FIT);

    const button = continueButton(page);
    await expect(button).toHaveText("Sending…");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).not.toHaveAttribute("disabled");
    expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(176);
    await expect(main(page).getByRole("status")).toHaveText("Sending…");

    await button.click();
    release();
    await expect(heading(page)).toHaveText(/^Let's book it/);
    expect(actions).toHaveLength(1);
  });

  test("C6 offline keeps every answer and offers the address; online it reaches an outcome", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    await fill(page, { ...NOT_A_FIT, name: "Robin Example" });
    await waitPastFillTime(page);
    await context.setOffline(true);
    await continueButton(page).click();

    const alert = main(page).getByRole("alert");
    await expect(alert).toContainText(
      "That didn't send — your answers are still here. Try again, or email",
    );
    await expect(alert.getByRole("link", { name: ADDRESS })).toHaveAttribute(
      "href",
      `mailto:${ADDRESS}`,
    );
    await expect(main(page).getByLabel(/^What are you building\?/)).toHaveValue(
      NOT_A_FIT.building,
    );
    await expect(
      group(page, GROUPS.budget).getByRole("radio", { name: "No budget yet" }),
    ).toBeChecked();
    await expect(
      group(page, GROUPS.start).getByRole("radio", { name: "In 1–3 months" }),
    ).toBeChecked();
    await expect(
      group(page, GROUPS.role).getByRole("radio", { name: "Product engineer" }),
    ).toBeChecked();
    await expect(main(page).getByLabel("Name")).toHaveValue("Robin Example");
    await expect(main(page).getByLabel("Email")).toHaveValue(NOT_A_FIT.email);

    await context.setOffline(false);
    await continueButton(page).click();
    await expect(heading(page)).toHaveText(/^Let's talk first/);
  });

  test("C7 fit: focused H1, new title, a POST to the hand-off, a note beside it, URL kept", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    const before = await page.title();
    await submit(page, { ...FIT, name: "Robin Example" });

    await expect(heading(page)).toHaveText(/^Let's book it/);
    await expect(heading(page)).toBeFocused();
    await expect(page).not.toHaveTitle(before);
    await expect(page).toHaveTitle(/^Let's book it/);
    await expect(main(page)).toContainText(
      "Thanks, Robin. That sounds like a good fit.",
    );
    const call = page.getByRole("button", {
      name: "Book a 30-minute call",
    });
    const form = main(page).locator("form").filter({ has: call });
    await expect(form).toHaveAttribute("method", "post");
    await expect(form).toHaveAttribute("action", "/book/handoff");
    await expect(main(page)).toContainText("Rather write first?");
    await expect(
      main(page).getByRole("link", { name: /^Send a note/ }),
    ).toHaveAttribute("href", "/contact");
    expect(new URL(page.url()).pathname).toBe("/book");
    expect(new URL(page.url()).search).toBe("");
  });

  for (const [why, answers] of [
    ["not a fit", NOT_A_FIT],
    ["a website or brand", WEBSITE],
  ] as const) {
    test(`C7 ${why} with Name blank: Let's talk first, focused, no call, no first name`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await open(page);
      await submit(page, answers);
      await expect(heading(page)).toHaveText(/^Let's talk first/);
      await expect(heading(page)).toBeFocused();
      await expect(page).toHaveTitle(/^Let's talk first/);
      await expect(main(page)).toContainText(
        "Thanks. From what you've shared, a short exchange by email",
      );
      await expect(
        page.getByRole("link", { name: "Book a 30-minute call" }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Book a 30-minute call" }),
      ).toHaveCount(0);
      expect(new URL(page.url()).pathname).toBe("/book");
      expect(new URL(page.url()).search).toBe("");
    });
  }
});

test.describe("C8 analytics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const SENTINEL = {
    name: "Zedsentinelname",
    email: "zedsentinel@example.test",
    building: "zedsentinelbuilding for a clinic",
  };

  function collect(context: BrowserContext) {
    const hits: Record<string, string>[] = [];
    const urls: string[] = [];
    const bodies: string[] = [];
    context.on("request", (r) => {
      urls.push(r.url());
      const url = new URL(r.url());
      if (isGoogleHost(url.hostname)) bodies.push(r.postData() ?? "");
      if (!url.pathname.endsWith("/g/collect")) return;
      const base = Object.fromEntries(url.searchParams);
      const lines = (r.postData() ?? "").split("\n").filter(Boolean);
      for (const line of lines.length ? lines : [""])
        hits.push({
          ...base,
          ...Object.fromEntries(new URLSearchParams(line)),
        });
    });
    return { hits, urls, bodies };
  }

  for (const [outcome, answers] of [
    ["fit", FIT],
    ["not_a_fit", NOT_A_FIT],
    ["website", WEBSITE],
  ] as const) {
    test(`with consent, ${outcome} sends one screening_outcome with outcome only, and no sentinel`, async ({
      page,
      context,
    }) => {
      await stubGoogle(context);
      await page.addInitScript(
        ([k]) => localStorage.setItem(k, "granted"),
        [CONSENT_KEY],
      );
      const seen = collect(context);
      await open(page);
      await expect
        .poll(() => seen.hits.some((h) => h.en === "page_view"))
        .toBe(true);
      await submit(page, { ...answers, ...SENTINEL });
      await expect(heading(page)).not.toHaveText(/^Before we book/);

      await expect
        .poll(
          () => seen.hits.filter((h) => h.en === "screening_outcome").length,
          { timeout: 15_000 },
        )
        .toBe(1);
      const [hit] = seen.hits.filter((h) => h.en === "screening_outcome");
      const params = Object.keys(hit).filter(
        (k) => k.startsWith("ep.") || k.startsWith("epn."),
      );
      expect(params).toEqual(["ep.outcome"]);
      expect(hit["ep.outcome"]).toBe(outcome);

      const everything = [...seen.urls, ...seen.bodies].join("\n");
      for (const value of Object.values(SENTINEL)) {
        const token = value.split(" ")[0];
        expect(everything).not.toContain(token);
        expect(everything).not.toContain(encodeURIComponent(token));
      }
      for (const url of seen.urls) {
        const params = new URL(url).searchParams;
        expect(params.has("budget"), url).toBe(false);
        expect(params.has("start"), url).toBe(false);
        for (const key of ["15k-75k", "no-budget", "none", "1-3-months"])
          expect([...params.values()]).not.toContain(key);
      }
    });
  }

  for (const [why, setup] of [
    [
      "consent declined",
      (page: Page) =>
        page.addInitScript(
          ([k]) => localStorage.setItem(k, "denied"),
          [CONSENT_KEY],
        ),
    ],
    [
      "GPC set",
      (page: Page) =>
        page.addInitScript(() =>
          Object.defineProperty(navigator, "globalPrivacyControl", {
            get: () => true,
          }),
        ),
    ],
  ] as const) {
    test(`with ${why}, an outcome reaches no Google host`, async ({
      page,
      context,
    }) => {
      const google = await stubGoogle(context);
      await setup(page);
      await open(page);
      await submit(page, FIT);
      await expect(heading(page)).toHaveText(/^Let's book it/);
      await page.waitForTimeout(1_000);
      expect(google).toEqual([]);
    });
  }
});

test.describe("C9 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function noSideScroll(page: Page) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }

  async function heightOf(
    page: Page,
    role: "button" | "link",
    name: string | RegExp,
  ) {
    return (await main(page).getByRole(role, { name }).first().boundingBox())!
      .height;
  }

  test("targets, no side scroll and axe in form, invalid, error and fit", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    expect(await heightOf(page, "button", /^Continue/)).toBeGreaterThanOrEqual(
      44,
    );
    const chips = main(page).locator("fieldset label");
    for (const box of await chips.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height),
    ))
      expect(box).toBeGreaterThanOrEqual(36);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await continueButton(page).click();
    await expect(
      main(page).getByLabel(/^What are you building\?/),
    ).toBeFocused();
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await fill(page, FIT);
    await waitPastFillTime(page);
    await context.setOffline(true);
    await continueButton(page).click();
    await expect(main(page).getByRole("alert")).toBeVisible();
    expect(await heightOf(page, "link", ADDRESS)).toBeGreaterThanOrEqual(24);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await context.setOffline(false);
    await continueButton(page).click();
    await expect(heading(page)).toHaveText(/^Let's book it/);
    expect(
      await heightOf(page, "button", "Book a 30-minute call"),
    ).toBeGreaterThanOrEqual(44);
    expect(await heightOf(page, "link", /^Send a note/)).toBeGreaterThanOrEqual(
      24,
    );
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });
  });

  test("axe in not-a-fit", async ({ page, context }) => {
    await stubGoogle(context);
    await open(page);
    await submit(page, NOT_A_FIT);
    await expect(heading(page)).toHaveText(/^Let's talk first/);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });
  });

  test("main has id main and the skip link moves focus into it", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    await expect(page.locator("main#main")).toHaveCount(1);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const m = document.getElementById("main");
          return !!m && m.contains(document.activeElement);
        }),
      )
      .toBe(true);
  });
});

test.describe("?state= fixtures", () => {
  for (const [key, check] of [
    ["screening-form", "Four quick questions"],
    ["screening-submit", 'Pick the closest band, or "No budget yet".'],
    ["screening-fit", "Thanks, Robin. That sounds like a good fit."],
  ] as const) {
    test(`${key} renders`, async ({ page, context }) => {
      await stubGoogle(context);
      await page.goto(`/book?state=${key}`);
      await expect(main(page)).toContainText(check);
      await expectNoSeriousA11y(page, { include: "main" });
    });
  }
});
