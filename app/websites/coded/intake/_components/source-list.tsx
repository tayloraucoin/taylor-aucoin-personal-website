"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useIsPreview } from "@/components/intake/preview-mode";
import { TextArea } from "../../../intake/_components/text-field";
import { readSourceFile } from "../_actions/read-source";
import { saveTranscriptEdit } from "../_actions/save-transcript";

/** One file or fetched page, as the step page hands it down. */
export type SourceRow = {
  id: string;
  originalName: string | null;
  transcript: string | null;
  transcriptStatus: string | null;
};

type Copy = {
  title: string;
  reading: string;
  read: string;
  unreadable: string;
  tooLarge: string;
  failed: string;
  retry: string;
  fetched: string;
  fetchFailed: string;
  omitted: string;
};

/**
 * What we have, and what we made of each of it (PORT-21).
 *
 * **Every line here is information, not an error.** A Keynote we cannot open
 * is not the client's mistake and not a fault in their file; it is a thing
 * Taylor reads instead, which is exactly what happened to every attachment
 * before this feature existed. So nothing is styled as a failure and nothing
 * asks them to fix anything.
 *
 * **A reading is shown and editable, and that is a safety property rather than
 * a courtesy.** The ingestion run verifies each quote against the text it
 * holds, and for a file we read that text is a model's own output — so a
 * sentence invented at the reading stage would be verified against itself
 * later. The client is the only person who has both the original and the
 * reading, so they are the only one who can catch it. Letting them correct it
 * before the run is the strongest of the mitigations available.
 *
 * Rendered separately from `FileDrop` rather than inside it: the drop is a
 * shared primitive used identically on both tracks, and this is one step's
 * view of what its own uploads became.
 */
export function SourceList({
  token,
  copy,
  documents,
  links,
  /** Named in the run's record as left out for size. */
  omitted = [],
  /** After a run, the list is a record rather than something to act on. */
  frozen = false,
}: {
  token: string;
  copy: Copy;
  documents: readonly SourceRow[];
  links: readonly SourceRow[];
  omitted?: readonly string[];
  frozen?: boolean;
}) {
  const rows = [...documents, ...links];
  if (rows.length === 0) return null;

  const isLink = (row: SourceRow) => links.some((link) => link.id === row.id);

  return (
    <section className="mb-8">
      <h3 className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
        {copy.title}
      </h3>

      <ul className="mt-4 space-y-4">
        {rows.map((row) => (
          <Source
            key={row.id}
            token={token}
            copy={copy}
            row={row}
            link={isLink(row)}
            omitted={omitted.includes(row.originalName ?? "")}
            frozen={frozen}
          />
        ))}
      </ul>
    </section>
  );
}

function Source({
  token,
  copy,
  row,
  link,
  omitted,
  frozen,
}: {
  token: string;
  copy: Copy;
  row: SourceRow;
  link: boolean;
  omitted: boolean;
  frozen: boolean;
}) {
  const preview = useIsPreview();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(row.transcript ?? "");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");

  const status = row.transcriptStatus;

  const line = (() => {
    if (omitted) return copy.omitted;
    switch (status) {
      case "pending":
        return copy.reading;
      case "done":
        return link ? copy.fetched : copy.read;
      case "unsupported":
        return copy.unreadable;
      case "too_large":
        return copy.tooLarge;
      case "failed":
        return link ? copy.fetchFailed : copy.failed;
      default:
        return copy.reading;
    }
  })();

  const retryable = status === "failed" && !link && !frozen && !preview;

  return (
    <li className="border-t border-(--color-faint) pt-4">
      <p className="font-body text-[15px] font-light leading-[1.4] text-(--color-ink)">
        {row.originalName ?? "A file you sent"}
      </p>

      <p
        aria-live="polite"
        className="mt-1 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-proof-label)"
      >
        {pending ? copy.reading : line}
      </p>

      <div className="mt-2 flex flex-wrap gap-4">
        {status === "done" && row.transcript ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {/* [COPY — pending Taylor] */}
            {open ? "Hide what we read" : "See what we read"}
          </button>
        ) : null}

        {retryable ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await readSourceFile(token, row.id);
                router.refresh();
              })
            }
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {copy.retry}
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-3">
          {/* [COPY — pending Taylor] — the sentence that makes the reading
              honest. It is a machine's reading of their file, they hold the
              original, and they are the only person who can tell. */}
          <p className="mb-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            This is what we made of it — a machine&apos;s reading, not your
            words. Fix anything it got wrong and we&apos;ll use your version.
          </p>

          <TextArea
            id={`f-source-${row.id}`}
            rows={10}
            value={text}
            readOnly={frozen || preview}
            onChange={(event) => {
              setText(event.target.value);
              setSaved("idle");
            }}
            onBlur={() => {
              if (frozen || preview || text === (row.transcript ?? "")) return;
              setSaved("saving");
              startTransition(async () => {
                await saveTranscriptEdit(token, row.id, text);
                setSaved("saved");
                router.refresh();
              });
            }}
          />

          {saved !== "idle" ? (
            <p
              aria-live="polite"
              className="mt-1.5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
            >
              {saved === "saving" ? "Saving…" : "Saved"}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
