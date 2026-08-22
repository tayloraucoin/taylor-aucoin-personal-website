"use server";

import { requireAdmin } from "@/server/services/admin-auth";
import {
  commitSync,
  parseCrmCsv,
  previewSync,
  type SyncPreview,
} from "@/server/services/leads";

/**
 * Preview and commit, in one action keyed on the submit button's `intent`.
 *
 * The file is re-submitted for the commit rather than parked on the server
 * between steps. Parsing 1588 rows twice costs nothing, and the alternatives
 * are worse: server-side state that can go stale, or a half-megabyte of
 * validated rows round-tripping through the browser.
 *
 * The commit recomputes its own counts, so the log records what actually
 * happened rather than what the preview predicted — which also means swapping
 * the file between the two steps is reported honestly instead of silently.
 */
export type SyncState =
  | { status: "idle" }
  | { status: "error"; message: string; rowErrors: string[] }
  | { status: "previewed"; preview: SyncPreview }
  | { status: "committed"; preview: SyncPreview };

export async function syncAction(
  _previous: SyncState,
  formData: FormData,
): Promise<SyncState> {
  // Never trust the layout: a POST aimed at this action renders nothing.
  await requireAdmin();

  const file = formData.get("file");
  const intent = String(formData.get("intent") ?? "preview");

  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Choose a crm_leads.csv file first.",
      rowErrors: [],
    };
  }

  const parsed = parseCrmCsv(await file.text());

  if (!parsed.ok) {
    return {
      status: "error",
      message: parsed.message,
      rowErrors: parsed.rowErrors,
    };
  }

  if (intent === "commit") {
    return {
      status: "committed",
      preview: await commitSync(parsed.rows, file.name),
    };
  }

  return {
    status: "previewed",
    preview: await previewSync(parsed.rows, file.name),
  };
}
