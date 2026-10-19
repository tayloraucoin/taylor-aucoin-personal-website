import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";
import { isGoogleHost } from "./google-hosts";

/**
 * SITE-13: home's notes signup. The done paths (C5, C6's retry, C8) write
 * to `note_signups`, so the server's database needs the migration applied.
 * Addresses are `@example.test`.
 */

const block = (page: Page) =>
  page.locator("section[aria-labelledby=notes-heading]");
const field = (page: Page) => block(page).getByLabel("Email");
const button = (page: Page) => block(page).locator("button[type=submit]");
const live = (page: Page) => block(page).locator("p[aria-live=polite]");

const unique = () =>
  `reader-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.test`;

/** Every request this page makes, to check no address leaks. */
function watch(page: Page) {
  const urls: { url: string; body: string }[] = [];
  page.on("request", (r) =>
    urls.push({ url: r.url(), body: r.postData() ?? "" }),
  );
  return urls;
}

async function fillAndWait(page: Page, address: string) {
  await field(page).fill(address);
  // The bot rule drops a submit under two seconds after render.
  await page.waitForTimeout(2_200);
}

function expectNoLeak(
  requests: { url: string; body: string }[],
  address: string,
) {
  for (const r of requests) {
    expect(decodeURIComponent(r.url)).not.toContain(address);
    if (isGoogleHost(new URL(r.url).hostname))
      expect(decodeURIComponent(r.body)).not.toContain(address);
  }
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C5 sending holds the address and height, then done takes focus", async ({
    page,
  }) => {
    const requests = watch(page);
    await page.goto("/");
    const address = unique();
    await fillAndWait(page, address);
    const before = (await block(page).boundingBox())!.height;

    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    await page.route(
      (url) => url.pathname === "/",
      async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await held;
        await route.continue();
      },
    );
    await button(page).click();
    await expect(button(page)).toHaveText("Sending");
    await expect(button(page)).toHaveAttribute("aria-busy", "true");
    await expect(button(page)).not.toHaveAttribute("disabled", /.*/);
    await expect(field(page)).toHaveValue(address);
    expect((await block(page).boundingBox())!.height).toBe(before);
    release();

    const done = block(page).getByText(
      `Signed up. Notes will go to ${address}.`,
    );
    await expect(done).toBeFocused();
    await expect(live(page)).toHaveText(
      `Signed up. Notes will go to ${address}.`,
    );
    await expect(field(page)).toHaveCount(0);
    expectNoLeak(requests, address);
  });

  test("C6 offline is the error view with the address kept; back online it signs up", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    const address = unique();
    await fillAndWait(page, address);
    await context.setOffline(true);
    await button(page).click();
    const error =
      "It didn't send. Check your connection and try again; your address is still here.";
    await expect(button(page)).toHaveText("Try again");
    await expect(field(page)).toHaveValue(address);
    const describedBy = await field(page).getAttribute("aria-describedby");
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(error);
    await expect(live(page)).toHaveText(error);
    await expectNoSeriousA11y(page, {
      include: "section[aria-labelledby=notes-heading]",
    });

    await context.setOffline(false);
    await button(page).click();
    await expect(
      block(page).getByText(`Signed up. Notes will go to ${address}.`),
    ).toBeFocused();
  });

  test("C7 an address with no ending is invalid and nothing leaves the page", async ({
    page,
  }) => {
    await page.goto("/");
    await fillAndWait(page, "name@company");
    const posts: string[] = [];
    page.on("request", (r) => {
      if (r.method() === "POST") posts.push(r.url());
    });
    await button(page).click();
    await expect(field(page)).toHaveAttribute("aria-invalid", "true");
    const describedBy = await field(page).getAttribute("aria-describedby");
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveText(
      "That address needs an ending, like .com or .ca. Nothing was sent.",
    );
    await page.waitForTimeout(500);
    expect(posts).toEqual([]);
    await expectNoSeriousA11y(page, {
      include: "section[aria-labelledby=notes-heading]",
    });
  });

  test("C8 a listed address answers exactly as a new one", async ({ page }) => {
    const address = unique();
    const bodies: string[] = [];
    page.on("response", async (r) => {
      if (r.request().method() === "POST") bodies.push(await r.text());
    });

    await page.goto("/");
    await fillAndWait(page, address);
    await button(page).click();
    const doneText = `Signed up. Notes will go to ${address}.`;
    await expect(block(page).getByText(doneText)).toBeFocused();
    const first = bodies.at(-1)!;

    await page.goto("/");
    await fillAndWait(page, address.toUpperCase());
    await button(page).click();
    await expect(block(page).getByText(doneText)).toBeFocused();
    await expect(live(page)).toHaveText(doneText);
    await expect.poll(() => bodies.length).toBe(2);
    expect(bodies[1]).toBe(first);
  });

  test("C9 idle and done are axe-clean", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousA11y(page, {
      include: "section[aria-labelledby=notes-heading]",
    });
    await page.goto("/?state=notes-done");
    await expectNoSeriousA11y(page, {
      include: "section[aria-labelledby=notes-heading]",
    });
  });
});

test.describe("C9 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("field and button are at least 44px", async ({ page }) => {
    await page.goto("/");
    for (const el of [field(page), button(page)]) {
      expect((await el.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test("states by ?state=", async ({ page }) => {
  await page.goto("/?state=notes-sending");
  await expect(button(page)).toHaveText("Sending");
  await page.goto("/?state=notes-error");
  await expect(button(page)).toHaveText("Try again");
  await page.goto("/?state=notes-invalid");
  await expect(field(page)).toHaveAttribute("aria-invalid", "true");
  await page.goto("/?state=notes-done");
  const done = await block(page).innerHTML();
  await page.goto("/?state=notes-already");
  expect(await block(page).innerHTML()).toBe(done);
});
