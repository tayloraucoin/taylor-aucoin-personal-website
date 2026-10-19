import type { BrowserContext, Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-20: `/contact`. Needs `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`
 * for C9, which reads real collect requests (gtag.js passes through; every
 * other Google request is answered 204 here). The agent server runs on the
 * local tier, so the note goes to the in-memory recorder and nothing is sent.
 */
test.use({ realGoogle: true });

const CONSENT_KEY = "ta:analytics-consent";
const ADDRESS = "hello@tayloraucoin.com";
const SENT_TITLE = "Sent — Contact — Taylor Aucoin";

const NOTE = {
  message: "Could you look at our booking flow next month?",
  email: "visitor@example.test",
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

/** Server-action POSTs: the only way a note leaves the page. */
function countActions(page: Page) {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" && r.headers()["next-action"])
      posts.push(r.url());
  });
  return posts;
}

/** Waits for React to own the form, so a press runs its handler. */
async function open(page: Page, path = "/contact") {
  await page.goto(path);
  await page.waitForFunction(() => {
    const form = document.querySelector("main form");
    return !!form && Object.keys(form).some((k) => k.startsWith("__react"));
  });
}

function main(page: Page) {
  return page.locator("main#main");
}

function sendButton(page: Page) {
  return main(page).getByRole("button", { name: /^(Send a note|Sending…)/ });
}

async function fill(
  page: Page,
  note: { message: string; email: string; name?: string },
) {
  await main(page).getByLabel("Message").fill(note.message);
  if (note.name) await main(page).getByLabel("Name").fill(note.name);
  await main(page).getByLabel("Email").fill(note.email);
}

/** Past the two-second minimum fill time, as a person would be. */
async function waitPastFillTime(page: Page) {
  await page.waitForTimeout(2_100);
}

function header(page: Page) {
  return page.locator("header").first();
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C4 shows the H1, intro, labelled fields, the button and the address beside it", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    const m = main(page);
    await expect(m.getByRole("heading", { level: 1 })).toHaveText("Contact");
    await expect(m).toContainText(
      "Tell me what you're working on, or just ask. I reply within one business day.",
    );
    await expect(m.getByLabel("Message")).toBeVisible();
    await expect(m.getByLabel("Name")).toHaveAttribute("autocomplete", "name");
    const email = m.getByLabel("Email");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("autocomplete", "email");
    await expect(sendButton(page)).toBeVisible();
    const orEmail = m.getByRole("link", { name: `Or email ${ADDRESS}` });
    await expect(orEmail).toHaveAttribute("href", `mailto:${ADDRESS}`);
    await expect(
      header(page).getByRole("link", { name: "Book a 30-minute call" }),
    ).toBeVisible();
  });

  test("C5 an empty message and a malformed email show both errors, focus Message, send nothing", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    const actions = countActions(page);
    await open(page);
    await main(page).getByLabel("Email").fill("sam@example");
    await sendButton(page).click();

    const message = main(page).getByLabel("Message");
    const email = main(page).getByLabel("Email");
    await expect(message).toBeFocused();
    for (const [field, line] of [
      [message, "Add a line or two about what you need."],
      [email, "That doesn't look like an email address — check for a typo."],
    ] as const) {
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const describedBy = await field.getAttribute("aria-describedby");
      expect(describedBy).toBeTruthy();
      await expect(page.locator(`[id="${describedBy}"]`)).toContainText(line);
    }
    await expect(
      main(page).getByRole("link", { name: `Or email ${ADDRESS}` }),
    ).toBeVisible();
    await page.waitForTimeout(500);
    expect(actions).toEqual([]);
  });

  test("C6 sending holds the button busy, not disabled, at 176 or more; a second press sends nothing", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    const actions = countActions(page);
    let release: () => void = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route("**/contact", async (route) => {
      if (route.request().headers()["next-action"]) await held;
      await route.continue();
    });

    await open(page);
    await fill(page, NOTE);
    await waitPastFillTime(page);
    const button = sendButton(page);
    await button.click();

    await expect(button).toHaveText("Sending…");
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).not.toHaveAttribute("disabled");
    await expect(button).toBeFocused();
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(176);
    await expect(main(page).getByRole("status")).toHaveText("Sending…");
    await expect(
      main(page).getByRole("link", { name: `Or email ${ADDRESS}` }),
    ).toBeVisible();

    await button.click();
    release();
    await expect(main(page)).toContainText(`Sent. I'll reply to ${NOTE.email}`);
    expect(actions).toHaveLength(1);
  });

  test("C7 with Name blank, sent replaces the intro and form, focused, title changed, call offered", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    const before = await page.title();
    await fill(page, NOTE);
    await waitPastFillTime(page);
    await sendButton(page).click();

    const sent = main(page).getByText(
      `Sent. I'll reply to ${NOTE.email} within one business day.`,
    );
    await expect(sent).toBeVisible();
    await expect(sent).toBeFocused();
    await expect(page).toHaveTitle(SENT_TITLE);
    expect(SENT_TITLE).not.toBe(before);
    await expect(main(page).locator("form")).toHaveCount(0);
    await expect(main(page)).not.toContainText(
      "Tell me what you're working on",
    );
    await expect(main(page)).toContainText("Prefer a call?");
    await expect(
      main(page).getByRole("link", { name: "Book a 30-minute call" }),
    ).toHaveAttribute("href", "/book");
    await expect(
      header(page).getByRole("link", { name: "Book a 30-minute call" }),
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/contact");
    expect(new URL(page.url()).search).toBe("");
  });

  test("C8 offline shows the alert with every answer kept and the address; online it sends", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    await fill(page, { ...NOTE, name: "Sam" });
    await waitPastFillTime(page);

    await context.setOffline(true);
    await sendButton(page).click();
    const alert = main(page).getByRole("alert");
    await expect(alert).toContainText(
      "That didn't send — your note is still here. Try again, or email",
    );
    await expect(alert.getByRole("link", { name: ADDRESS })).toHaveAttribute(
      "href",
      `mailto:${ADDRESS}`,
    );
    await expect(main(page).getByLabel("Message")).toHaveValue(NOTE.message);
    await expect(main(page).getByLabel("Name")).toHaveValue("Sam");
    await expect(main(page).getByLabel("Email")).toHaveValue(NOTE.email);
    await expect(sendButton(page)).toHaveText(/^Send a note/);

    await context.setOffline(false);
    await sendButton(page).click();
    await expect(main(page)).toContainText(`Sent. I'll reply to ${NOTE.email}`);
  });
});

test.describe("C9 analytics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const SENTINEL = {
    name: "Zedsentinelname",
    email: "zedsentinel@example.test",
    message: "zedsentinelmessage about a booking flow",
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

  test("with consent, one contact_note_sent and one book_call_click, and no sentinel anywhere", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await page.addInitScript(
      ([k]) => localStorage.setItem(k, "granted"),
      [CONSENT_KEY],
    );
    const seen = collect(context);
    // Until /book exists the click would load a 404 and drop the batched hit.
    await page.route(
      (url) => url.pathname === "/book",
      (route) =>
        route.request().resourceType() === "document"
          ? route.fulfill({ status: 204 })
          : route.continue(),
    );
    await open(page);
    await expect
      .poll(() => seen.hits.some((h) => h.en === "page_view"))
      .toBe(true);

    await fill(page, SENTINEL);
    await waitPastFillTime(page);
    await sendButton(page).click();
    await expect(main(page)).toContainText("Prefer a call?");

    await expect
      .poll(
        () => seen.hits.filter((h) => h.en === "contact_note_sent").length,
        { timeout: 15_000 },
      )
      .toBe(1);
    const [sent] = seen.hits.filter((h) => h.en === "contact_note_sent");
    const params = Object.keys(sent).filter(
      (k) => k.startsWith("ep.") || k.startsWith("epn."),
    );
    expect(params.sort()).toEqual(["ep.from", "ep.surface"]);
    expect(sent["ep.surface"]).toBe("services");
    expect(sent["ep.from"]).toBe("contact");

    await main(page)
      .getByRole("link", { name: "Book a 30-minute call" })
      .click();
    await expect
      .poll(() => seen.hits.filter((h) => h.en === "book_call_click").length, {
        timeout: 15_000,
      })
      .toBe(1);
    const [click] = seen.hits.filter((h) => h.en === "book_call_click");
    expect(click["ep.surface"]).toBe("services");
    expect(click["ep.placement"]).toBe("contact_sent");

    const everything = [...seen.urls, ...seen.bodies].join("\n");
    for (const value of Object.values(SENTINEL)) {
      const token = value.split(" ")[0];
      expect(everything).not.toContain(token);
      expect(everything).not.toContain(encodeURIComponent(token));
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
      await open(page);
      await fill(page, NOTE);
      await waitPastFillTime(page);
      await sendButton(page).click();
      await expect(main(page)).toContainText("Prefer a call?");
      await page.waitForTimeout(1_000);
      expect(google).toEqual([]);
    });
  }
});

test.describe("C10 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  async function noSideScroll(page: Page) {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }

  async function atLeast(
    page: Page,
    name: string | RegExp,
    min: number,
    role: "button" | "link",
  ) {
    const box = await main(page)
      .getByRole(role, { name })
      .first()
      .boundingBox();
    expect(box!.height, String(name)).toBeGreaterThanOrEqual(min);
  }

  test("targets, no side scroll and axe in default, invalid, error and sent", async ({
    page,
    context,
  }) => {
    await stubGoogle(context);
    await open(page);
    await atLeast(page, /^Send a note/, 44, "button");
    await atLeast(page, `Or email ${ADDRESS}`, 24, "link");
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await sendButton(page).click();
    await expect(main(page).getByLabel("Message")).toBeFocused();
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await fill(page, NOTE);
    await waitPastFillTime(page);
    await context.setOffline(true);
    await sendButton(page).click();
    await expect(main(page).getByRole("alert")).toBeVisible();
    await atLeast(page, ADDRESS, 24, "link");
    await noSideScroll(page);
    await expectNoSeriousA11y(page, { include: "main" });

    await context.setOffline(false);
    await sendButton(page).click();
    await expect(main(page)).toContainText("Prefer a call?");
    await atLeast(page, "Book a 30-minute call", 24, "link");
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
    ["contact-default", "Tell me what you're working on"],
    ["contact-submit", "Add a line or two about what you need."],
    ["contact-sent", "Sent. I'll reply to sam@example.test"],
  ] as const) {
    test(`${key} renders`, async ({ page, context }) => {
      await stubGoogle(context);
      await page.goto(`/contact?state=${key}`);
      await expect(main(page)).toContainText(check);
      await expectNoSeriousA11y(page, { include: "main" });
    });
  }
});
