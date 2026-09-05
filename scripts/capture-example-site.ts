import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium, type Response } from "playwright";

/**
 * Shoots one example site at the gallery's exact aspect, for uploading.
 *
 *   yarn capture:example --url https://myrthemosterman.com
 *   yarn capture:example --url https://x.com --key myrthe
 *
 * ## Why this still exists after PORT-31
 *
 * The sites are database rows now and captures arrive by upload or image URL at
 * `/admin/intake/examples`, so this no longer prints an entry to paste — there
 * is no file to paste it into.
 *
 * What it is still the only source of is **the shape**. The publish gate
 * measures the opening capture against the MacBook Pro 14" frame, and an upload
 * is only ever as good as whatever took the screenshot. This shoots at exactly
 * 1512 × 982 at 2×, three scrolls deep, with motion reduced so the opening
 * frame of an autoplay reel is what gets judged. Then it prints the paths and
 * gets out of the way: you drag them into the editor.
 *
 * **It never decides `embed`.** Headers cannot settle it — `load` fires on a
 * blocked frame in Chromium — so the verdict below is printed as a hint for the
 * terminal and never leaves it. The admin's frame check is where that judgement
 * is made, by looking (D-PORT-17, D-PORT-26).
 *
 * Nothing here is in the app's import graph: it is a devDependency and a
 * script, and `yarn build:agent` never sees either.
 */

/** The MacBook Pro 14" viewport every capture is shot at, at 2× for retina. */
const VIEWPORT = { width: 1512, height: 982 };
const SCALE = 2;

/** Generous, then move on. A site that has not settled in 20s will not. */
const LOAD_TIMEOUT_MS = 20_000;

/** JPEG, because forty 3024px-wide PNGs is tens of megabytes in `public/`. */
const QUALITY = 82;

/** Where shots land. Not in `public/` — nothing here is served. */
const OUT_DIR = "captures";

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      url: { type: "string" },
      key: { type: "string" },
    },
  });

  const url = values.url?.trim();
  if (!url) throw new Error("Missing --url https://…");

  const target = new URL(url.startsWith("http") ? url : `https://${url}`);
  const key = (values.key?.trim() || slugFor(target)).toLowerCase();

  const dir = path.join(process.cwd(), OUT_DIR, key);
  await mkdir(dir, { recursive: true });

  // A collision is refused rather than overwritten: `--key` is how you shoot a
  // second page of the same site, and silently replacing the first one is the
  // kind of help nobody wants.
  const first = path.join(dir, `${key}-1.jpg`);
  if (await exists(first)) {
    throw new Error(
      `${path.relative(process.cwd(), first)} already exists. Pass a different --key, or delete it first.`,
    );
  }

  const browser = await chromium.launch();

  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      // The opening frame of an autoplay reel is what a client should judge,
      // not whatever it happened to be showing when the shutter fell.
      reducedMotion: "reduce",
    });

    const page = await context.newPage();

    /**
     * The document response is captured by listener rather than taken from
     * `goto`'s return value, because the two failure modes are different.
     *
     * `goto` returns the response only when it resolves — and `networkidle`
     * never fires on a page with a carousel, an analytics heartbeat, or a
     * long-poll, which is most marketing sites. Those threw, and the framing
     * verdict came back "unknown" for sites whose headers were sitting right
     * there. Listening for the last main-frame navigation response survives
     * both a timeout and a redirect chain.
     */
    let response: Response | null = null;
    page.on("response", (candidate) => {
      if (
        candidate.request().isNavigationRequest() &&
        candidate.frame() === page.mainFrame()
      ) {
        response = candidate;
      }
    });

    try {
      await page.goto(target.toString(), {
        waitUntil: "networkidle",
        timeout: LOAD_TIMEOUT_MS,
      });
    } catch {
      // A page that never goes idle is still a page. Settle for the DOM and
      // capture what is there rather than failing the whole run.
      console.warn(
        "note  the page never went idle — capturing once the DOM was ready",
      );
      await page
        .waitForLoadState("domcontentloaded", { timeout: LOAD_TIMEOUT_MS })
        .catch(() => undefined);
      await page.waitForTimeout(1500);
    }

    const shots: string[] = [];
    for (const [index, scroll] of [0, 1, 2].entries()) {
      if (scroll > 0) {
        await page.evaluate(
          (n) => window.scrollTo({ top: n * window.innerHeight }),
          scroll,
        );
        await page.waitForTimeout(600);
      }

      const file = path.join(dir, `${key}-${index + 1}.jpg`);
      await page.screenshot({ path: file, type: "jpeg", quality: QUALITY });
      shots.push(path.relative(process.cwd(), file));
    }

    const title = (await page.title()).trim();
    const verdict = framingVerdict(response);

    console.log(`\nok    ${shots.length} captures at ${VIEWPORT.width * SCALE} × ${VIEWPORT.height * SCALE}`);
    for (const shot of shots) console.log(`      ${shot}`);
    console.log(`\nok    ${verdict.line}`);
    console.log(`      page title: ${title || "(none)"}`);
    console.log(
      `\nnext  paste ${target.toString()} into /admin/intake/examples, then upload the first shot as its capture.\n`,
    );

    await context.close();
  } finally {
    await browser.close();
  }
}

/**
 * Whether the site's own headers permit framing — and why that is a hint.
 *
 * `X-Frame-Options` and a `frame-ancestors` directive are the two things a
 * server can send to refuse. Their absence is necessary for the overlay's live
 * frame and **not sufficient**: JavaScript frame-busting exists, a consent wall
 * can swallow the viewport, and a site can simply look wrong at this size.
 *
 * So this is printed as a hint in the terminal and goes no further. The admin's
 * frame check is where `embed` is decided, by opening the site in the real
 * 1512:982 box and watching it load — the only thing that actually settles it
 * (D-PORT-17, D-PORT-26).
 */
function framingVerdict(response: Response | null): {
  embeddable: boolean;
  line: string;
} {
  if (!response) {
    return {
      embeddable: false,
      line: "framing: unknown — no document response was captured",
    };
  }

  const headers = response.headers();
  const xfo = headers["x-frame-options"];
  const csp = headers["content-security-policy"] ?? "";
  const frameAncestors = /frame-ancestors/i.test(csp);

  if (xfo || frameAncestors) {
    return {
      embeddable: false,
      line: `framing: refused by the site (${xfo ? `X-Frame-Options: ${xfo}` : "CSP frame-ancestors"})`,
    };
  }

  return {
    embeddable: false,
    line: "framing: headers allow it — verify in the overlay before flipping `embed`",
  };
}


function slugFor(url: URL): string {
  return url.hostname
    .replace(/^www\./, "")
    .replace(/\.[a-z.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

main().catch((error: unknown) => {
  console.error(
    `\n${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
