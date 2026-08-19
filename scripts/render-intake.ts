import { parseArgs } from "node:util";
import { sendIntakeDocument } from "@/server/services/emails";
import { findEngagementById } from "@/server/services/engagement";
import { renderIntakeMarkdown } from "@/server/services/output";
import { linkUploads } from "@/server/services/submission";

const LINK_TTL_SECONDS = 14 * 24 * 60 * 60;

/**
 * Regenerates an intake document on demand.
 *
 * Two reasons this exists: signed file links expire after a fortnight, and a
 * document is worth reading before a client has finished — a half-answered
 * intake the day before a call is more useful than none.
 *
 *   yarn intake:render <engagement-id>
 *   yarn intake:render <engagement-id> --send
 */
async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { send: { type: "boolean" } },
  });

  const engagementId = positionals[0];

  if (!engagementId) {
    console.error("\nUsage: yarn intake:render <engagement-id> [--send]\n");
    process.exit(1);
  }

  const engagement = await findEngagementById(engagementId);
  const files = await linkUploads(engagement.id, LINK_TTL_SECONDS);

  const markdown = renderIntakeMarkdown({
    engagement,
    files,
    generatedAt: new Date(),
  });

  console.log(markdown);

  if (values.send) {
    // `output` is not a send-once kind, so re-sending is expected and allowed.
    const sent = await sendIntakeDocument(engagement, markdown);
    console.error(sent ? "\nSent.\n" : "\nSend failed — see the log above.\n");
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
