import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { engagements } from "@/db/schema";
import { decryptToken } from "@/server/services/engagement";
import {
  TranscriptionUnavailableError,
  pendingTranscriptions,
  transcribeVoiceNote,
} from "@/server/services/voice-transcription";
import { applyTierEnv, currentTier } from "./_env";

applyTierEnv();

/**
 * Writes out the voice notes an engagement has that nobody has transcribed.
 *
 *   yarn transcribe:voice-note --engagement <uuid>
 *
 * **This exists for one client: the one who recorded, sent it, and closed the
 * tab before the transcription came back — and never returned to the form.**
 * The step retries on its own for anybody who revisits it, so this is the
 * floor beneath that, not the mechanism. It is the difference between "we lost
 * the transcript" and "run one command".
 *
 * Prints nothing of what it transcribed. The transcript goes to the file row
 * and reaches Taylor through the intake document, which is where a client's
 * twenty unguarded minutes about their career belong — not in a terminal
 * scrollback, and not in a shell history.
 */
async function main(): Promise<void> {
  const { values } = parseArgs({
    options: { engagement: { type: "string" } },
  });

  const engagementId = values.engagement?.trim();

  if (!engagementId) {
    console.error(
      "Usage: yarn transcribe:voice-note --engagement <engagement-uuid>",
    );
    process.exitCode = 1;
    return;
  }

  const [row] = await getDb()
    .select({
      id: engagements.id,
      resumeTokenCiphertext: engagements.resumeTokenCiphertext,
    })
    .from(engagements)
    .where(eq(engagements.id, engagementId))
    .limit(1);

  if (!row) {
    console.error(`No engagement ${engagementId} on ${currentTier()}.`);
    process.exitCode = 1;
    return;
  }

  // The service resolves the engagement through the same `requireEngagement`
  // seam every request path uses, so this script gets no privileged route to
  // a file — it has to hold the link like anyone else.
  const token = decryptToken(row.resumeTokenCiphertext);

  if (!token) {
    console.error(
      "That engagement has no recoverable link (INTAKE_LINK_KEY missing, or the row predates it).",
    );
    process.exitCode = 1;
    return;
  }

  const pending = await pendingTranscriptions(row.id);

  if (pending.length === 0) {
    console.log("Nothing waiting — every voice note is already written out.");
    return;
  }

  console.log(`${pending.length} voice note(s) to write out on ${currentTier()}.`);

  for (const fileId of pending) {
    try {
      const { model } = await transcribeVoiceNote(token, fileId);
      console.log(`  ${fileId} — done (${model})`);
    } catch (error) {
      const reason =
        error instanceof TranscriptionUnavailableError
          ? error.reason
          : "unexpected";
      console.error(`  ${fileId} — ${reason}`);
    }
  }

  console.log(
    "Re-run `yarn intake:render` to pick the transcripts up in the document.",
  );
}

void main();
