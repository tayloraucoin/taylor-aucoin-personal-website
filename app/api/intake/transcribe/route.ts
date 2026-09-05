import type { NextRequest } from "next/server";
import { z } from "zod";
import { EngagementNotFoundError } from "@/server/services/engagement";
import {
  TranscriptionUnavailableError,
  transcribeVoiceNote,
} from "@/server/services/voice-transcription";

/**
 * Writes one uploaded voice note out.
 *
 * **A route handler rather than a server action, and the reason is
 * `maxDuration`.** It is a route-segment config: a server action inherits the
 * ceiling of the page that invoked it, so putting this behind an action would
 * mean stamping a five-minute timeout on the rendering of all ten steps to
 * cover one call that occasionally takes ninety seconds. A route owns its own.
 * It also matches `/api/intake/upload`, which is a route for a sibling reason —
 * the client needs a plain JSON reply it can act on per file.
 *
 * The token is the only credential, and the file is scoped to the engagement
 * it resolves to inside the service. Errors carry no detail about which of
 * those two things went wrong, and no error anywhere in this path carries
 * audio, a transcript, a prompt, or a filename.
 */
export const maxDuration = 300;

const input = z.object({
  token: z.string().min(1),
  fileId: z.uuid(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, reason: "failed" }, { status: 400 });
  }

  const parsed = input.safeParse(body);
  if (!parsed.success) {
    return Response.json({ ok: false, reason: "failed" }, { status: 400 });
  }

  try {
    const { transcript } = await transcribeVoiceNote(
      parsed.data.token,
      parsed.data.fileId,
    );
    return Response.json({ ok: true, transcript });
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return Response.json({ ok: false, reason: "link" }, { status: 404 });
    }

    // Every one of these is a state the card has a calm sentence for. None of
    // them is an error the client caused, and none is styled as one.
    if (error instanceof TranscriptionUnavailableError) {
      return Response.json({ ok: false, reason: error.reason });
    }

    console.error(
      "[transcribe] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return Response.json({ ok: false, reason: "failed" }, { status: 500 });
  }
}
