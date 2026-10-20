import { notFound } from "next/navigation";
import {
  IntakeStateView,
  isIntakeStateKey,
} from "@/components/intake/intake-fixtures";
import { guardHarness } from "../analytics/guard";

/**
 * Test-only: the intake's drawn states on synthetic engagements held in
 * memory, at `/test-harness/intake?state=<key>` (SITE-28; D-SITE-218). The
 * intake routes themselves take no `?state=`. 404 on a production deployment.
 */
export default async function IntakeHarness({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  guardHarness();
  const { state } = await searchParams;
  if (!isIntakeStateKey(state)) notFound();
  return <IntakeStateView stateKey={state} />;
}
