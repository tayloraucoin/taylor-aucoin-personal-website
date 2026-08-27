"use client";

import { useActionState } from "react";
import {
  syncAction,
  type SyncState,
} from "@/app/admin/(protected)/sync/_actions/sync";

const INITIAL: SyncState = { status: "idle" };

/**
 * Upload, look at what would change, then commit.
 *
 * The preview step exists because the alternative — a button that imports
 * 1588 rows with no warning — gives no chance to notice that the wrong file
 * was picked until after it has been applied.
 *
 * The file input is never remounted, so its selection survives the preview
 * render and the commit button can re-submit the same file.
 */
export function SyncForm() {
  const [state, formAction, pending] = useActionState(syncAction, INITIAL);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-(--color-body)">
          The file from{" "}
          <code className="font-(family-name:--font-mono) text-xs">
            yarn leadgen export --crm
          </code>
        </span>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="min-h-[44px] rounded-(--radius) border border-white/15 bg-black/30 px-3 py-2 text-sm text-(--color-ink) file:mr-3 file:rounded-(--radius) file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:text-(--color-ink)"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          name="intent"
          value="preview"
          disabled={pending}
          className="min-h-[44px] rounded-(--radius) border border-white/20 px-4 text-sm text-(--color-ink) disabled:opacity-60"
        >
          {pending ? "Reading…" : "Preview changes"}
        </button>

        {state.status === "previewed" ? (
          <button
            type="submit"
            name="intent"
            value="commit"
            disabled={pending}
            className="min-h-[44px] rounded-(--radius) bg-(--color-action) px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            Import {state.preview.newCount + state.preview.updatedCount} rows
          </button>
        ) : null}
      </div>

      {state.status === "error" ? (
        // Gold, not red — the site's rule everywhere validation speaks.
        <div role="alert" className="flex flex-col gap-2">
          <p className="text-sm text-(--color-c2)">{state.message}</p>
          {state.rowErrors.length ? (
            <ul className="flex flex-col gap-1">
              {state.rowErrors.map((rowError) => (
                <li
                  key={rowError}
                  className="font-(family-name:--font-mono) text-xs text-(--color-dim)"
                >
                  {rowError}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {state.status === "previewed" || state.status === "committed" ? (
        <SyncSummary state={state} />
      ) : null}
    </form>
  );
}

function SyncSummary({
  state,
}: {
  state: Extract<SyncState, { status: "previewed" | "committed" }>;
}) {
  const { preview } = state;
  const done = state.status === "committed";

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-3 border-t border-white/10 pt-5"
    >
      <p className="text-sm text-(--color-ink)">
        {done ? "Imported from " : "Ready to import from "}
        <span className="font-(family-name:--font-mono) text-xs">
          {preview.fileName}
        </span>
      </p>

      <p className="text-sm text-(--color-body)">
        <strong className="text-(--color-ink)">{preview.newCount}</strong> new ·{" "}
        <strong className="text-(--color-ink)">{preview.updatedCount}</strong>{" "}
        {done ? "refreshed" : "to refresh"} ·{" "}
        <strong className="text-(--color-ink)">{preview.unchangedCount}</strong>{" "}
        unchanged
      </p>

      {preview.samples.length ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-(--color-dim)">
            {done ? "Changed, for example:" : "Would change, for example:"}
          </p>
          <ul className="flex flex-col gap-1">
            {preview.samples.map((sample) => (
              <li
                key={sample.businessName}
                className="text-xs text-(--color-body)"
              >
                {sample.businessName} — {sample.changes.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview.unmappedNiches.length ? (
        <p className="text-xs text-(--color-c2)">
          No call-window profile for: {preview.unmappedNiches.join(", ")}. These
          leads still appear in the queue and are never filtered out — add them
          to lib/crm/call-windows.ts when you get a chance.
        </p>
      ) : null}

      {done ? null : (
        <p className="text-xs text-(--color-dim)">
          Your notes, call history, schedules, emails, and engagement links are
          never touched by an import.
        </p>
      )}
    </div>
  );
}
