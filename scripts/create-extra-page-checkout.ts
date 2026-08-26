import { parseArgs } from "node:util";
import { formatMoney } from "@/lib/intake/money";
import { createExtraPageCheckout, hasPaidFor } from "@/server/services/deposit";
import {
  decryptToken,
  findEngagementById,
} from "@/server/services/engagement";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { applyTierEnv, currentTier } from "./_env";

applyTierEnv();

/**
 * Mints a Checkout link for extra pages on an existing engagement.
 *
 *   yarn charge:extra-pages --engagement <uuid> --pages 3
 *
 * **This script is the entire mechanism, and that is the point.** Step 8 tells
 * a client "nothing extra is ever charged without a conversation first", and
 * the way that promise is kept is that no route, action, or component anywhere
 * in the app can reach `createExtraPageCheckout` — only this file, which needs
 * environment credentials to run. A client cannot charge themselves, and
 * neither can a bug (M-PORT-4).
 *
 * It prints a URL and sends nothing. Taylor delivers the link himself, in the
 * same conversation where the pages were agreed, because a charge arriving by
 * automated email is exactly the surprise the promise exists to prevent.
 */
async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      engagement: { type: "string" },
      pages: { type: "string" },
    },
  });

  const engagementId = values.engagement?.trim();
  const pages = Number(values.pages);

  if (!engagementId) {
    throw new Error(
      "Missing --engagement <uuid>. Find it in the admin engagements list.",
    );
  }
  if (!Number.isInteger(pages) || pages < 1) {
    throw new Error("Missing or invalid --pages <n>. Whole number, 1 or more.");
  }

  // Fails here, before Stripe is touched, when the id is wrong.
  const engagement = await findEngagementById(engagementId);

  const productKey =
    engagement.track === "showcase" ? "showcase_extra_page" : "extra_page";

  if (await hasPaidFor(engagementId, productKey)) {
    throw new Error(
      [
        "This engagement has already paid for extra pages.",
        "",
        "The record holds one row per product on purpose, and a paid row is",
        "history that is never rewritten — so a second purchase cannot be",
        "recorded here without editing what they were charged last time.",
        "Take this one through Stripe by hand and note it on the engagement.",
      ].join("\n"),
    );
  }

  const [row] = await getDb()
    .select({ ciphertext: engagements.resumeTokenCiphertext })
    .from(engagements)
    .where(eq(engagements.id, engagementId))
    .limit(1);

  const token = decryptToken(row?.ciphertext ?? null);

  if (!token) {
    throw new Error(
      "Cannot recover this engagement's link token, so Checkout would have " +
        "nowhere to return them to. Re-issue their link first.",
    );
  }

  const url = await createExtraPageCheckout(engagement, token, pages);

  console.log(
    [
      "",
      `Tier:       ${currentTier()}`,
      `Client:     ${engagement.contactName} <${engagement.contactEmail}>`,
      `Track:      ${engagement.track}`,
      `Pages:      ${pages}`,
      `Total:      ${formatMoney(pages * 15000, engagement.currency)} + GST`,
      "",
      "Send them this link yourself:",
      "",
      `  ${url}`,
      "",
      "Nothing is charged until they pay it. Their deposit state is untouched.",
      "",
    ].join("\n"),
  );
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
