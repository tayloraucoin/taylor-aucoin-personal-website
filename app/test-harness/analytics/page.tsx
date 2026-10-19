import Link from "next/link";
import { guardHarness } from "./guard";
import { TrackButton } from "./track-button";

/**
 * Test-only: drives track() before any surface calls it (SITE-3 C4, C5). Its
 * path is a literal in this page and its spec, the one exception to
 * lib/routes.ts. It answers 404 on a production deployment.
 */
export default function AnalyticsHarness() {
  guardHarness();
  return (
    <main>
      <h1>Analytics harness</h1>
      <TrackButton />
      <Link href="/about">Another path</Link>
    </main>
  );
}
