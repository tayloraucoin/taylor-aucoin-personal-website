import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "./fixtures";

/**
 * SITE-17: About's upper half, Intro through Education. Needs
 * `yarn build:agent` first.
 */
const SLUG_ROWS = [
  ["Everbook", "everbook"],
  ["Roomvy", "roomvy"],
  ["Calculate by QxMD", "calculate-qxmd"],
  ["Multi-entity family office platform", "family-office-platform"],
  ["Conscious Connections", "conscious-connections"],
  ["Agora", "agora"],
] as const;

test("C1 one h1 after the only eyebrow, then the h2s in order", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.locator("main h1")).toHaveText("About");
  const levels = await page
    .locator("main")
    .locator("h1, h2, h3")
    .evaluateAll((els) => els.map((e) => [e.tagName, e.textContent?.trim()]));
  const h2s = levels.filter(([t]) => t === "H2").map(([, x]) => x);
  expect(h2s.slice(0, 4)).toEqual([
    "How I think",
    "Experience",
    "Teaching",
    "Education",
  ]);
  expect(levels[0]).toEqual(["H1", "About"]);
  const think = page.locator("section", {
    has: page.getByRole("heading", { name: "How I think", level: 2 }),
  });
  await expect(think.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(think.getByText("Mentorship")).toHaveCount(0);
  await expect(page.getByText("The person behind the work")).toHaveCount(1);
});

test("C2 Experience groups, row links and Also built", async ({ page }) => {
  await page.goto("/about");
  const exp = page.locator("section", {
    has: page.getByRole("heading", { name: "Experience", level: 2 }),
  });
  await expect(exp.getByRole("heading", { level: 3 })).toHaveText([
    "Full-time",
    "Contract and fractional",
    "My own products",
    "Programmes",
  ]);
  const read = exp.getByRole("link", { name: /^Read the decision story/ });
  await expect(read).toHaveCount(6);
  for (const [name, slug] of SLUG_ROWS) {
    const link = exp.getByRole("link", {
      name: new RegExp(`^Read the decision story\\s*,?\\s*${name}$`),
    });
    await expect(link).toHaveAttribute("href", `/work/${slug}`);
  }
  const also = exp.locator("li", { hasText: "Also built" });
  await expect(also.getByRole("link")).toHaveCount(0);
  await expect(
    exp.getByRole("link", { name: "Teaching", exact: true }),
  ).toHaveAttribute("href", "#teaching");
  const teaching = page.locator("#teaching");
  await expect(teaching.getByRole("heading", { level: 2 })).toHaveAttribute(
    "tabindex",
    "-1",
  );
});

test("C4 no DJ, music or festival words, no family office client name, no old imports", async ({
  page,
}) => {
  await page.goto("/about");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const w of ["dj", "music", "festival", "cho ventures"]) {
    expect(text, w).not.toMatch(new RegExp(`\\b${w}\\b`));
  }
  const dir = "app/about";
  const files = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(`${d}/${e.name}`) : [`${d}/${e.name}`],
    );
  for (const f of files(dir)) {
    const src = readFileSync(f, "utf8");
    expect(src, f).not.toMatch(/RootField|SectionLabel/);
  }
});

test("C5 at 390: no sideways scroll, dates under roles, links 44px, skip link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/about");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);

  const rows = await page
    .locator("main li")
    .filter({ hasText: /\d{4}|\[year|\[years/ })
    .evaluateAll((lis) =>
      lis.map((li) => {
        const [, role, years] = Array.from(li.children) as HTMLElement[];
        return [
          role.getBoundingClientRect().bottom,
          years.getBoundingClientRect().top,
        ];
      }),
    );
  expect(rows.length).toBeGreaterThan(8);
  for (const [roleBottom, yearsTop] of rows) {
    expect(yearsTop).toBeGreaterThanOrEqual(roleBottom - 1);
  }

  const links = page.locator("main li a, #teaching a");
  const heights = await links.evaluateAll((as) =>
    as.map((a) => a.getBoundingClientRect().height),
  );
  expect(heights.length).toBeGreaterThanOrEqual(7);
  for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);

  await expect(page.locator("main#main")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  const inMain = await page.evaluate(() =>
    Boolean(
      document.activeElement?.closest("main") ??
      document.activeElement?.id === "main",
    ),
  );
  expect(inMain).toBe(true);
});
