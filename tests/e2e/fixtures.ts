import { test as base, expect } from "@playwright/test";
import { isGoogleHost } from "./google-hosts";

/** Set on every stubbed Google response, so a spec can tell it was local. */
export const STUB_HEADER = "x-harness-stub";

/**
 * The `test` every spec imports. With no geo headers the consent regime falls
 * back to unrestricted, so a build with a GA ID loads gtag.js on every page:
 * this answers every Google host with a local 204 so no spec sends a hit.
 *
 * A spec that needs the real gtag.js opts in by name (SITE-3):
 *
 *   test.use({ realGoogle: true });
 */
export const test = base.extend<{ realGoogle: boolean }>({
  realGoogle: [false, { option: true }],
  context: async ({ context, realGoogle }, provide) => {
    if (!realGoogle) {
      await context.route(
        (url) => isGoogleHost(url.hostname),
        (route) =>
          route.fulfill({
            status: 204,
            headers: { [STUB_HEADER]: "google" },
          }),
      );
    }
    await provide(context);
  },
});

export { expect };
