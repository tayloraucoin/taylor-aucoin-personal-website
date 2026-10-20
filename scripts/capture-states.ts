import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Browser } from "playwright";
import { isGoogleHost } from "../tests/e2e/google-hosts";

/**
 * Shoots every `?state=` key of one route for Assay to score (canon C-P08).
 *
 *   yarn capture --route /work --keys default,empty --out tests/.captures/work
 *   yarn capture --route /no-such-page --keys default --out <dir> --expect 404
 *
 * Per key: 390, 834 and 1440 wide in light and dark (`<key>-<w>.png`,
 * `<key>-<w>-dark.png`), and 390 light with reduced motion
 * (`<key>-390-reduced.png`). Full page, against the agent server on :4310.
 *
 * Every shot is taken before any is written: when a first response's status
 * is not `--expect` (default 200) it exits 1 and writes nothing, so a broken
 * route never leaves captures that look like a state. Google hosts answer with
 * a local 204, as in the e2e fixture.
 */
const WIDTHS = [390, 834, 1440] as const;
const HEIGHT = { 390: 844, 834: 1194, 1440: 900 } as const;
const THEME_KEY = "ta-theme";

type Shot = {
  name: string;
  width: (typeof WIDTHS)[number];
  theme: "light" | "dark";
  reducedMotion: "reduce" | "no-preference";
};

function shotsFor(key: string): Shot[] {
  const shots: Shot[] = [];
  for (const width of WIDTHS) {
    for (const theme of ["light", "dark"] as const) {
      shots.push({
        name: `${key}-${width}${theme === "dark" ? "-dark" : ""}.png`,
        width,
        theme,
        reducedMotion: "no-preference",
      });
    }
  }
  shots.push({
    name: `${key}-390-reduced.png`,
    width: 390,
    theme: "light",
    reducedMotion: "reduce",
  });
  return shots;
}

function urlFor(base: string, route: string, key: string): string {
  const url = new URL(route, base);
  if (key !== "default") url.searchParams.set("state", key);
  return url.toString();
}

async function shoot(
  browser: Browser,
  url: string,
  shot: Shot,
): Promise<{ status: number | null; png: Buffer }> {
  const context = await browser.newContext({
    viewport: { width: shot.width, height: HEIGHT[shot.width] },
    colorScheme: shot.theme,
    reducedMotion: shot.reducedMotion,
  });
  try {
    await context.route(
      (u) => isGoogleHost(u.hostname),
      (route) => route.fulfill({ status: 204 }),
    );
    // The site defaults dark; the theme is set before any script reads it.
    await context.addInitScript(
      ([storageKey, theme]) => window.localStorage.setItem(storageKey, theme),
      [THEME_KEY, shot.theme] as const,
    );
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({
      fullPage: true,
      animations: "disabled",
    });
    return { status: response?.status() ?? null, png };
  } finally {
    await context.close();
  }
}

async function main(): Promise<number> {
  const { values } = parseArgs({
    options: {
      route: { type: "string" },
      keys: { type: "string", default: "default" },
      out: { type: "string" },
      expect: { type: "string", default: "200" },
      base: { type: "string", default: "http://localhost:4310" },
    },
  });
  if (!values.route || !values.out) {
    console.error(
      "usage: yarn capture --route <path> --keys <a,b> --out <dir> [--expect <status>]",
    );
    return 2;
  }
  const expected = Number(values.expect);
  const keys = values.keys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  const files: { name: string; png: Buffer }[] = [];
  const browser = await chromium.launch();
  try {
    for (const key of keys) {
      const url = urlFor(values.base, values.route, key);
      for (const shot of shotsFor(key)) {
        const { status, png } = await shoot(browser, url, shot);
        if (status !== expected) {
          console.error(
            `capture: ${url} answered ${status}, expected ${expected}. Nothing written.`,
          );
          return 1;
        }
        files.push({ name: shot.name, png });
      }
    }
  } finally {
    await browser.close();
  }

  const out = path.resolve(values.out);
  await mkdir(out, { recursive: true });
  for (const file of files)
    await writeFile(path.join(out, file.name), file.png);
  console.log(`capture: ${files.length} shot(s) of ${values.route} in ${out}`);
  return 0;
}

main().then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
