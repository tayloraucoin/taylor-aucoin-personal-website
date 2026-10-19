import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect } from "./fixtures";

/**
 * Fails the test when axe finds any serious or critical violation on the page
 * as it is now. Run it on every drawn state; the message names each rule and
 * the first offending node so the failure reads without a trace.
 */
export async function expectNoSeriousA11y(
  page: Page,
  { include }: { include?: string } = {},
): Promise<void> {
  const builder = new AxeBuilder({ page });
  // A chrome ticket scans its own region on a page whose body is still old.
  if (include) builder.include(include);
  const { violations } = await builder.analyze();
  const serious = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes[0]?.target.join(" ") ?? ""}`);

  expect(serious, "serious or critical axe violations").toEqual([]);
}
