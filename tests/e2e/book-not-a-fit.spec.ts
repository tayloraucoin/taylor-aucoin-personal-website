import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-23: the note on `/book`'s not-a-fit and website views. Needs
 * `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` for C7's collect reads.
 * The agent server is on the local tier: the note goes to the recorder.
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const ADDRESS = "hello@tayloraucoin.com";

type Answers = {
  building: string;
  budget: string;
  start: string;
  role: string;
  name?: string;
  email: string;
};

const NOT_A_FIT: Answers = {
  building: "A booking app for my studio's members.",
  budget: "No budget yet",
  start: "Later",
  role: "Not sure yet",
  email: "robin@example.test",
};
const WEBSITE: Answers = {
  ...NOT_A_FIT,
  budget: "Over $75K",
  start: "This month",
  role: "A website or brand",
};

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

function main(page: Page) {
  return page.locator("main#main");
}

function heading(page: Page) {
  return main(page).getByRole("heading", { level: 1 });
}

/** Screens through to the note, past the two-second minimum. */
async function reachNote(page: Page, a: Answers) {
  await page.goto("/book");
  await page.waitForFunction(() => {
    const form = document.querySelector("main form");
    return !!form && Object.keys(form).some((k) => k.startsWith("__react"));
  });
  const m = main(page);
  await m.getByLabel(/^What are you building\?/).fill(a.building);
  for (const [group, label] of [
    [/^Budget/, a.budget],
    [/^When do you want to start\?/, a.start],
    [/^The role you need/, a.role],
  ] as const)
    await m
      .getByRole("radiogroup", { name: group })
      .getByText(label, { exact: true })
      .click();
  if (a.name) await m.getByLabel("Name").fill(a.name);
  await m.getByLabel("Email").fill(a.email);
  await page.waitForTimeout(2_100);
  await m.getByRole("button", { name: /^Continue/ }).click();
  await expect(heading(page)).toHaveText(/^Let's talk first/);
}

function note(page: Page) {
  return main(page).getByLabel(/^Your note/);
}

function sendButton(page: Page) {
  return main(page).getByRole("button", { name: /^(Send a note|Sending…)/ });
}

async function expectNoCallAnywhere(page: Page) {
  await expect(
    page.getByRole("link", { name: "Book a 30-minute call" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Book a 30-minute call" }),
  ).toHaveCount(0);
  await expect(
    page.locator(
      'a[href*="cal.com"], a[href*="/book/handoff"], form[action*="/book/handoff"]',
    ),
  ).toHaveCount(0);
  await expect(page.getByText("Prefer a call?")).toHaveCount(0);
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C3 the note holds the building answer, Name and Email kept, screening hidden, no call", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, { ...NOT_A_FIT, name: "Robin Example" });
    await expect(heading(page)).toBeFocused();
    await expect(page).toHaveTitle(/^Let's talk first/);
    await expect(note(page)).toHaveValue(NOT_A_FIT.building);
    await expect(main(page).getByLabel("Name")).toHaveValue("Robin Example");
    await expect(main(page).getByLabel("Email")).toHaveValue(NOT_A_FIT.email);
    await expect(main(page)).toContainText("Thanks, Robin.");

    const form = main(page).locator("form");
    for (const [name, value] of [
      ["screening_budget", "none"],
      ["screening_start", "later"],
      ["screening_role", "not-sure"],
    ]) {
      const input = form.locator(`input[name="${name}"]`);
      await expect(input).toHaveAttribute("type", "hidden");
      await expect(input).toHaveValue(value);
    }
    for (const text of ["No budget yet", "Later", "Not sure yet"])
      await expect(main(page).getByText(text, { exact: true })).toHaveCount(0);
    await expectNoCallAnywhere(page);
  });

  test("C3 with Name blank the greeting drops the name", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, NOT_A_FIT);
    await expect(main(page)).toContainText("Thanks. From what you've shared");
  });

  test("C4 a website or brand with a fitting budget shows the /websites line before the note", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, WEBSITE);
    const line = main(page).getByText("Need a website or a brand?");
    await expect(line).toBeVisible();
    const link = main(page).getByRole("link", {
      name: /^See how a coded site works/,
    });
    await expect(link).toHaveAttribute("href", "/websites");
    const [lineBox, noteBox] = await Promise.all([
      link.boundingBox(),
      note(page).boundingBox(),
    ]);
    expect(lineBox!.y).toBeLessThan(noteBox!.y);
    await expectNoCallAnywhere(page);
  });

  test("C4 a non-website not-a-fit shows no /websites line", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, NOT_A_FIT);
    await expect(
      main(page).getByText("Need a website or a brand?"),
    ).toHaveCount(0);
  });

  test("C5 an emptied note or a malformed email shows its error, focused, nothing sent", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    const actions = countActions(page);
    await reachNote(page, NOT_A_FIT);
    const before = actions.length;

    await note(page).fill("");
    await sendButton(page).click();
    await expect(note(page)).toBeFocused();
    await expect(note(page)).toHaveAttribute("aria-invalid", "true");
    await expect(main(page)).toContainText(
      "Add a line or two about what you need.",
    );

    await note(page).fill(NOT_A_FIT.building);
    await main(page).getByLabel("Email").fill("robin@example");
    await sendButton(page).click();
    await expect(main(page).getByLabel("Email")).toBeFocused();
    await expect(main(page)).toContainText(
      "That doesn't look like an email address — check for a typo.",
    );
    await page.waitForTimeout(500);
    expect(actions.length).toBe(before);
  });

  test("C5 sending holds the button busy and not disabled at 176 or more", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, NOT_A_FIT);
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/book", async (route) => {
      if (route.request().headers()["next-action"]) await held;
      await route.continue();
    });
    // Sent at once: the fill time counts from the screening form's render.
    await sendButton(page).click();
    const button = sendButton(page);
    await expect(button).toHaveText("Sending…");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).not.toHaveAttribute("disabled");
    expect((await button.boundingBox())!.width).toBeGreaterThanOrEqual(176);
    release();
    await expect(main(page)).toContainText(
      `Sent. I'll reply to ${NOT_A_FIT.email}`,
    );
  });

  test("C5 offline keeps the note, Name and Email and offers the address; online it sends", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, { ...NOT_A_FIT, name: "Robin Example" });
    await note(page).fill(`${NOT_A_FIT.building} Spring launch.`);
    await context.setOffline(true);
    await sendButton(page).click();
    const alert = main(page).getByRole("alert");
    await expect(alert).toContainText("That didn't send");
    await expect(alert.getByRole("link", { name: ADDRESS })).toHaveAttribute(
      "href",
      `mailto:${ADDRESS}`,
    );
    await expect(note(page)).toHaveValue(
      `${NOT_A_FIT.building} Spring launch.`,
    );
    await expect(main(page).getByLabel("Name")).toHaveValue("Robin Example");
    await expect(main(page).getByLabel("Email")).toHaveValue(NOT_A_FIT.email);
    await context.setOffline(false);
    await sendButton(page).click();
    await expect(main(page)).toContainText(
      `Sent. I'll reply to ${NOT_A_FIT.email}`,
    );
  });

  test("C6 sent from not-a-fit stays on /book under Let's talk first, focused, no call", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, WEBSITE);
    const titleBefore = await page.title();
    await sendButton(page).click();
    const sent = main(page).getByText(
      `Sent. I'll reply to ${WEBSITE.email} within one business day.`,
    );
    await expect(sent).toBeVisible();
    await expect(sent).toBeFocused();
    await expect(heading(page)).toHaveText(/^Let's talk first/);
    await expect(page).not.toHaveTitle(titleBefore);
    await expect(main(page).locator("form")).toHaveCount(0);
    await expect(main(page)).not.toContainText("From what you've shared");
    await expect(main(page)).not.toContainText("Need a website or a brand?");
    await expectNoCallAnywhere(page);
    expect(new URL(page.url()).pathname).toBe("/book");
    expect(new URL(page.url()).search).toBe("");
  });
});

test.describe("C7 analytics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const SENTINEL = {
    name: "Zedsentinelname Example",
    email: "zedsentinel@example.test",
    building: "zedsentinelbuilding app",
  };
  const NOTE_TEXT = "zedsentinelnote extra words";

  test("with consent, one contact_note_sent from not_a_fit, and no sentinel or answer anywhere", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
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

    await reachNote(page, { ...NOT_A_FIT, ...SENTINEL });
    await note(page).fill(`${SENTINEL.building} ${NOTE_TEXT}`);
    await sendButton(page).click();
    await expect(main(page)).toContainText("Sent. I'll reply to");

    await expect
      .poll(() => hits.filter((h) => h.en === "contact_note_sent").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const [sent] = hits.filter((h) => h.en === "contact_note_sent");
    const params = Object.keys(sent).filter(
      (k) => k.startsWith("ep.") || k.startsWith("epn."),
    );
    expect(params.sort()).toEqual(["ep.from", "ep.surface"]);
    expect(sent["ep.surface"]).toBe("services");
    expect(sent["ep.from"]).toBe("not_a_fit");

    const everything = [...urls, ...bodies].join("\n").toLowerCase();
    for (const token of [
      "zedsentinelname",
      "zedsentinel@",
      "zedsentinelbuilding",
      "zedsentinelnote",
    ])
      expect(everything).not.toContain(token);
    for (const url of urls) {
      const p = new URL(url).searchParams;
      for (const key of [
        "budget",
        "start",
        "role",
        "screening_budget",
        "screening_start",
        "screening_role",
      ])
        expect(p.has(key), url).toBe(false);
    }
  });

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
    test(`with ${why}, a sent note reaches no Google host`, async ({
      page,
      context,
    }) => {
      const google = await stubGoogle(context);
      await setup(page);
      await reachNote(page, NOT_A_FIT);
      await sendButton(page).click();
      await expect(main(page)).toContainText("Sent. I'll reply to");
      await page.waitForTimeout(1_000);
      expect(google).toEqual([]);
    });
  }
});

test.describe("C8 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function noSideScroll(page: Page) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }

  test("targets, no side scroll and axe in not-a-fit-website, error and sent", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await reachNote(page, WEBSITE);
    expect(
      (await sendButton(page).boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
    const link = main(page).getByRole("link", {
      name: /^See how a coded site works/,
    });
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(24);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await context.setOffline(true);
    await sendButton(page).click();
    await expect(main(page).getByRole("alert")).toBeVisible();
    const address = main(page)
      .getByRole("alert")
      .getByRole("link", { name: ADDRESS });
    expect((await address.boundingBox())!.height).toBeGreaterThanOrEqual(24);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await context.setOffline(false);
    await sendButton(page).click();
    await expect(main(page)).toContainText("Sent. I'll reply to");
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });
  });

  test("axe in not-a-fit", async ({ page, context }) => {
    await stubGoogle(context);
    await reachNote(page, NOT_A_FIT);
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });
  });
});

test.describe("?state= fixtures", () => {
  for (const [key, check] of [
    ["screening-not-a-fit", "Thanks, Robin. From what you've shared"],
    ["screening-not-a-fit-website", "Need a website or a brand?"],
    ["contact-sent-from-not-a-fit", "Sent. I'll reply to robin@example.test"],
  ] as const) {
    test(`${key} renders with no call`, async ({ page, context }) => {
      await stubGoogle(context);
      await page.goto(`/book?state=${key}`);
      await expect(main(page)).toContainText(check);
      await expectNoCallAnywhere(page);
      await expectNoSeriousA11y(page, { include: "main" });
    });
  }
});
