import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expectNoSeriousA11y } from "./axe";
import { expect, test } from "./fixtures";

/** SITE-12: home's lower half and the whole-page pass. */

const how = (page: Page) =>
  page.locator("section[aria-labelledby=how-heading]");
const testimonials = (page: Page) =>
  page.locator("section[aria-labelledby=testimonials-heading]");
const wwm = (page: Page) =>
  page.locator("section[aria-labelledby=wwm-heading]");

/**
 * The family office's names, read from the parked naming note so they are
 * never written anywhere else (C-SITE-home-21).
 */
function forbiddenNames(): string[] {
  const note = readFileSync(
    "docs/_legacy/pending/cho-ventures-naming/NOTE.md",
    "utf8",
  );
  const bold = [...note.matchAll(/\*\*([^*]+)\*\*/g)]
    .map((m) => m[1].trim())
    .filter(
      (name) =>
        !name.includes(":") &&
        name.split(" ").length <= 4 &&
        name !== "Future of Cities",
    );
  expect(bold.length).toBeGreaterThan(0);
  return [...new Set([...bold, "Durable", "Viewpoint"])];
}

const STATES = [
  "default",
  "capabilities-open",
  "capabilities-all",
  "pillar-open",
  "selected-work-websites",
  "selected-work-branding",
  "selected-work-filtered",
  "notes-sending",
  "notes-done",
  "notes-error",
  "notes-invalid",
  "notes-already",
];

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("C1 five steps in one row, three lists, no disclosure", async ({
    page,
  }) => {
    await page.goto("/");
    const steps = how(page).locator("ol > li");
    await expect(steps).toHaveCount(5);
    expect(
      await steps.evaluateAll((els) =>
        els.map((el) => el.lastElementChild?.textContent),
      ),
    ).toEqual(["Scope", "Build", "Ship", "Measure", "Iterate"]);
    const tops = await steps.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().top)),
    );
    expect(new Set(tops).size).toBe(1);
    await expect(how(page).locator("h3")).toHaveText([
      "What I give it",
      "What I let AI do",
      "What I check",
    ]);
    await expect(
      how(page).locator("button, details, [aria-expanded]"),
    ).toHaveCount(0);
  });

  test("C2 four cards in order, two columns, no avatar; no quote twice", async ({
    page,
  }) => {
    await page.goto("/");
    const cards = testimonials(page).locator("figure");
    await expect(cards.locator("figcaption > span:first-child")).toHaveText([
      "Dawson Whitfield",
      "Bruno",
      "Vaughn Richards",
      "Yogesh Verma",
    ]);
    await expect(testimonials(page).locator("img, [aria-hidden]")).toHaveCount(
      0,
    );
    const lefts = await cards.evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().left)),
    );
    expect(new Set(lefts).size).toBe(2);
    await expect(
      testimonials(page).getByRole("link", {
        name: "Read them in full [draft]",
      }),
    ).toHaveAttribute("href", "/about#testimonials");

    const quotes = await page
      .locator("main blockquote")
      .evaluateAll((els) => els.map((el) => el.textContent ?? ""));
    const sentences = quotes
      .flatMap((q) => q.replace(/[“”]/g, "").split(/(?<=[.!?])\s+/))
      .map((s) => s.trim())
      .filter(Boolean);
    expect(sentences.length).toBe(new Set(sentences).size);
  });

  test("C3 five role rows to /work-with-me; the websites line to /websites", async ({
    page,
  }) => {
    await page.goto("/");
    const rows = wwm(page).locator("ul > li > a");
    await expect(rows).toHaveCount(5);
    expect(
      await rows.evaluateAll((els) =>
        els.map((a) => [
          a.children[0]?.textContent,
          a.getAttribute("href"),
          a.children.length,
        ]),
      ),
    ).toEqual(
      [
        "Product engineer",
        "Product designer",
        "Systems consultant",
        "Fractional CTO",
        "0→1 build",
      ].map((role) => [role, "/work-with-me", 3]),
    );
    await expect(
      wwm(page).getByRole("link", { name: "Work with me", exact: true }),
    ).toHaveAttribute("href", "/work-with-me");
    await expect(
      wwm(page).getByRole("link", { name: "Websites" }),
    ).toHaveAttribute("href", "/websites");
  });

  test("C4 D-SITE-50's order in main, footer after; no old sections or field", async ({
    page,
  }) => {
    await page.goto("/");
    const order = await page
      .locator("main#main > section")
      .evaluateAll((els) =>
        els.map(
          (el) =>
            el.getAttribute("aria-label") ??
            document.getElementById(el.getAttribute("aria-labelledby") ?? "")
              ?.textContent ??
            "",
        ),
      );
    expect(order).toEqual([
      "Taylor Aucoin",
      "Proof",
      "Pillars",
      "Problems I take on",
      "Selected work",
      "How I work",
      "Testimonials",
      "Work with me",
      "Notes",
    ]);
    expect(
      await page.evaluate(() => {
        const main = document.querySelector("main#main")!;
        const footer = document.querySelector("footer")!;
        return !!(
          main.compareDocumentPosition(footer) &
          Node.DOCUMENT_POSITION_FOLLOWING
        );
      }),
    ).toBe(true);
    await expect(page.getByText("Signal", { exact: true })).toHaveCount(0);
    await expect(page.locator("main canvas")).toHaveCount(0);
    await expect(page.getByText("Years shipping")).toHaveCount(0);
  });

  test("C5 no forbidden name in any home state", async ({ page }) => {
    const names = forbiddenNames();
    for (const state of STATES) {
      const res = await page.goto(
        state === "default" ? "/" : `/?state=${state}`,
      );
      const html = await res!.text();
      const text = await page.locator("body").innerText();
      for (const name of names) {
        expect(html, `${state}: ${name}`).not.toContain(name);
        expect(text, `${state}: ${name}`).not.toContain(name);
      }
      expect(text, state).not.toMatch(/marketing (as a skill|capabilit)/i);
    }
  });

  test("C6 the keyboard walks the sections in order with a 2px ring", async ({
    page,
  }) => {
    await page.goto("/");
    const ORDER = [
      "skip",
      "header",
      "Taylor Aucoin",
      "Pillars",
      "Problems I take on",
      "Selected work",
      // "Read them in full": a control the contract's list leaves out.
      "Testimonials",
      "Work with me",
      "Notes",
      "footer",
    ];
    const seen: string[] = [];
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const outline = getComputedStyle(el).outlineWidth;
        if (el.closest("footer")) return ["footer", outline];
        if (el.closest("header")) return ["header", outline];
        if (!el.closest("main")) return ["skip", outline];
        const section = el.closest("main > section");
        const label =
          section?.getAttribute("aria-label") ??
          document.getElementById(
            section?.getAttribute("aria-labelledby") ?? "",
          )?.textContent ??
          "";
        return [label, outline];
      });
      if (!where) break;
      const [label, outline] = where;
      expect(outline, `${label} focus ring`).toBe("2px");
      if (seen.at(-1) !== label) seen.push(label);
      if (label === "footer") break;
    }
    expect(seen).toEqual(ORDER);
  });
});

test.describe("C6 at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("no horizontal scroll, 44px controls in the new sections, axe clean", async ({
    page,
  }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    for (const s of [how(page), testimonials(page), wwm(page)]) {
      const small = await s
        .locator("a, button")
        .evaluateAll((els) =>
          els
            .filter((el) => el.getBoundingClientRect().height < 44)
            .map((el) => el.textContent?.trim()),
        );
      expect(small).toEqual([]);
    }
    const tops = await how(page)
      .locator("ol > li")
      .evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().top)),
      );
    expect(new Set(tops).size).toBe(5);
    await expectNoSeriousA11y(page);
  });
});
