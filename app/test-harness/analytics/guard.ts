import { notFound } from "next/navigation";
import { isProductionDeployment } from "@/lib/env";

/** The harness never ships: 404 on a production deployment (SITE-3 C8). */
export function guardHarness(
  isProduction: () => boolean = isProductionDeployment,
) {
  if (isProduction()) notFound();
}
