import type { NextRequest } from "next/server";
import { loadAdminUser } from "@/server/services/admin-auth";
import {
  send,
  TranscriptionUnavailableError,
} from "@/server/services/voice-transcription";

/**
 * Transcription for the admin preview, with nothing behind it.
 *
 * The client path is `/api/intake/transcribe`, and it is keyed to a token and
 * an uploaded file because everything it does is scoped to an engagement:
 * claim an attempt, read the answers for a prompt, write the transcript to the
 * row. A preview has no engagement, which is why the recorder used to stand
 * down there entirely — and why Taylor could not test the one feature whose
 * output he most needs to hear (2026-09-04: "no need to hide that
 * functionality. I need to test it").
 *
 * So this route does the vendor call and nothing else. Audio in, text back,
 * never stored, never attached to anything, no prompt built from anyone's
 * answers. It is the transcription, without the bookkeeping that needs a
 * client to belong to.
 *
 * **Admin only.** `loadAdminUser` rather than `requireAdmin` because this
 * answers a `fetch` and must return a status, not a redirect to a login page
 * that the caller would then try to parse as JSON.
 */
export const maxDuration = 300;

/** Comfortably past a long voice note, well under the body limit. */
const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const admin = await loadAdminUser();
  if (!admin) {
    return Response.json({ ok: false, reason: "failed" }, { status: 401 });
  }

  let audio: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("audio");
    if (value instanceof File) audio = value;
  } catch {
    return Response.json({ ok: false, reason: "failed" }, { status: 400 });
  }

  if (!audio || audio.size === 0) {
    return Response.json({ ok: false, reason: "failed" }, { status: 400 });
  }

  if (audio.size > MAX_BYTES) {
    return Response.json({ ok: false, reason: "too_large" }, { status: 413 });
  }

  try {
    const bytes = new Uint8Array(await audio.arrayBuffer());
    const { text } = await send(
      bytes,
      { mimeType: audio.type || "audio/webm", originalName: null },
      // No prompt: a prompt is built from a client's own answers, and there is
      // no client here. This is the model unaided, which is also the harsher
      // test of it.
      "",
    );
    return Response.json({ ok: true, transcript: text });
  } catch (error) {
    if (error instanceof TranscriptionUnavailableError) {
      return Response.json({ ok: false, reason: error.reason });
    }

    console.error(
      "[transcribe-preview] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return Response.json({ ok: false, reason: "failed" }, { status: 500 });
  }
}
