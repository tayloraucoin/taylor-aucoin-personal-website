"use server";

import { z } from "zod";
import { readIngestionRecord } from "@/lib/intake/ingestion-record";
import { kindOf } from "@/lib/intake/tracks";
import { requireEngagement } from "@/server/services/engagement";
import { readLinks } from "@/server/services/document-reading";
import {
  IngestionUnavailableError,
  runIngestion,
} from "@/server/services/ingestion";
import { commitIngestion } from "@/server/services/ingestion-store";
import { readStepAnswers } from "@/server/services/submission";

/**
 * What the surface gets back. A result, never a thrown error.
 *
 * The same reasoning every other action on this track follows: the client has
 * to distinguish "nothing pasted" from "wait a minute" from "this already ran"
 * to say the right sentence, and an exception crossing the server-action
 * boundary arrives as an opaque digest with none of that intact.
 *
 * **`filled` is a count, never the values.** They are in the client's own
 * steps by the time this returns, marked and quoted where they sit; handing
 * them back here would invite a caller to render a wall of machine sentences,
 * which is the shape PORT-10 established this track avoids.
 */
export type IngestResult =
  | {
      ok: true;
      status: "ran" | "partial" | "refused";
      filled: number;
      /** Named so the surface can say which parts did not land. */
      failed: string[];
    }
  | {
      ok: false;
      reason:
        | "empty"
        | "too_large"
        | "rate_limited"
        | "failed"
        | "link"
        | "already_ran";
    };

const input = z.object({ token: z.string().min(1) });

/**
 * Reads everything the client has given us and fills in what it honestly can.
 *
 * Thin, and it takes nothing but the token: **the source is read server-side
 * from the engagement's own answers**, never sent up from the browser. The
 * paste is already an autosaved answer by the time this can be pressed, so
 * accepting it back from a request would let a fabricated call put words into
 * the run and get them written into a client's form as their own — the same
 * reasoning that makes the pay screen name a plan rather than an amount
 * (M-PORT-12) and `predictComeAcross` read answers rather than receive them.
 *
 * **The one-shot rule is checked twice, on purpose.** Here, before a run is
 * claimed, so a second press costs nothing; and again inside the store's
 * transaction, which is the one that is actually true under concurrency. The
 * check here is an optimisation; the check there is the guarantee.
 */
export async function runIngestionForToken(
  token: unknown,
): Promise<IngestResult> {
  const parsed = input.safeParse({ token });
  if (!parsed.success) return { ok: false, reason: "failed" };

  let engagement;
  try {
    engagement = await requireEngagement(parsed.data.token);
  } catch {
    return { ok: false, reason: "link" };
  }

  // Belongs to the coded track or it does not happen. The durable
  // questionnaire has no ingestion step and nothing to read.
  if (engagement.track !== "showcase") return { ok: false, reason: "failed" };

  if (readIngestionRecord(engagement.answers)) {
    return { ok: false, reason: "already_ran" };
  }

  const stored = readStepAnswers(
    engagement.track,
    engagement.answers,
    "ingest",
  );
  const source = typeof stored.dump === "string" ? stored.dump : "";
  const links = typeof stored.links === "string" ? stored.links : "";

  try {
    // The pages first, because they become sources the run then reads
    // (PORT-21). Fetched here rather than when the client typed them: a fetch
    // is a real action taken on someone's behalf and it belongs to the press
    // they confirmed, not to a pause mid-typing.
    //
    // A failure never stops the run. Every page is stored as its own row with
    // its own outcome, so a dead link costs one line in the summary and the
    // paste and the files are read regardless.
    if (links.trim()) {
      try {
        await readLinks(engagement.id, links);
      } catch (error) {
        console.error(
          "[ingest] link reading failed",
          error instanceof Error ? error.message : "unknown error",
        );
      }
    }

    const outcome = await runIngestion(
      engagement.id,
      kindOf(engagement.answers),
      source,
    );

    const committed = await commitIngestion(
      engagement.id,
      engagement.track,
      outcome,
    );

    // Lost the race to another press: the other one's values are in the form
    // and this one's are discarded. Reported as already-run rather than as a
    // success, so the surface never claims to have written what it did not.
    if (committed.status === "already_ran") {
      return { ok: false, reason: "already_ran" };
    }

    return {
      ok: true,
      status: committed.record.status,
      filled: committed.record.fields.length,
      failed: committed.record.failed,
    };
  } catch (error) {
    if (error instanceof IngestionUnavailableError) {
      return { ok: false, reason: error.reason };
    }

    // The message, never the payload. What went wrong is worth recording;
    // what the client pasted about themselves is not.
    console.error(
      "[ingest] unexpected failure",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, reason: "failed" };
  }
}
