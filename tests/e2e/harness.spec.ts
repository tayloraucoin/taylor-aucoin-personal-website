import { expectNoSeriousA11y } from "./axe";
import { expect, STUB_HEADER, test } from "./fixtures";

test("C2 / loads from the agent server on :4310 with no serious axe violation", async ({
  page,
  baseURL,
}) => {
  expect(baseURL).toBe("http://localhost:4310");
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expectNoSeriousA11y(page);
});

test("C2 the axe helper fails a page seeded with a serious violation", async ({
  page,
}) => {
  await page.setContent(
    `<!DOCTYPE html><html lang="en"><head><title>Seeded</title></head><body><main>
      <h1>Seeded</h1>
      <p style="color:#777777;background:#888888">Low-contrast text</p>
    </main></body></html>`,
  );
  await expect(expectNoSeriousA11y(page)).rejects.toThrow(/color-contrast/);
});

test("C2 the axe helper passes a clean page", async ({ page }) => {
  await page.setContent(
    `<!DOCTYPE html><html lang="en"><head><title>Clean</title></head><body><main>
      <h1>Clean</h1>
      <p style="color:#111111;background:#ffffff">Readable text</p>
    </main></body></html>`,
  );
  await expectNoSeriousA11y(page);
});

test("C2 the shared fixture answers Google hosts locally", async ({ page }) => {
  await page.goto("/");
  // A probe path, never a collect hit: if routing failed, nothing is counted.
  const answered = page.waitForResponse((r) =>
    r.url().includes("harness-probe"),
  );
  await page.evaluate(() =>
    fetch("https://www.google-analytics.com/harness-probe", {
      mode: "no-cors",
    }),
  );
  const response = await answered;
  expect(response.status()).toBe(204);
  expect(response.headers()[STUB_HEADER]).toBe("google");
});
