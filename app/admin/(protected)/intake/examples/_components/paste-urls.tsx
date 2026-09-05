"use client";

import { useState, useTransition } from "react";
import { addDraftsAction } from "../_actions/examples";
import type { PasteResult } from "@/lib/intake/example-packs";

/**
 * A hundred and ten URLs, in one paste.
 *
 * The bulk-creation problem is the one that actually blocks curation; bulk
 * *editing* is not, because tagging is a judgement made one site at a time. So
 * this is the only bulk write on the surface, and what it makes is the queue
 * the rest of the screen is organised around.
 *
 * Every outcome is reported per line. A batch that silently dropped the two
 * lines it could not read would be worse than one that refused the whole paste,
 * because nobody counts rows afterwards.
 */
export function PasteUrls({ pack }: { pack: string }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<PasteResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!value.trim()) return;
    setMessage(null);

    startTransition(async () => {
      const outcome = await addDraftsAction(value);
      if (!outcome.ok) {
        setMessage(outcome.message);
        return;
      }
      setResult(outcome.data);
      setValue("");
    });
  }

  return (
    <section className="flex flex-col gap-3 border-t border-(--color-faint) pt-6">
      <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
        {/* [COPY — draft] */}
        Add sites
      </h2>
      <p className="max-w-[60ch] text-sm text-(--color-body)">
        {/* [COPY — draft] */}
        One URL per line. They land as drafts — nothing reaches a client until
        you publish it.
        {pack !== "all"
          ? " They'll be added to this set."
          : " They won't be in any set until you say so."}
      </p>

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={5}
        spellCheck={false}
        aria-label="URLs to add as drafts"
        className="w-full rounded-(--radius) border border-(--color-line) bg-(--color-well) p-3 font-(family-name:--font-mono) text-xs text-(--color-ink) outline-none focus-visible:border-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !value.trim()}
          className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) disabled:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          {/* [COPY — draft] */}
          {pending ? "Adding…" : "Add as drafts"}
        </button>
        {message ? (
          <span className="text-sm text-(--color-body)">{message}</span>
        ) : null}
      </div>

      {result ? (
        <div className="flex flex-col gap-1 text-sm">
          {result.created.length > 0 ? (
            <p className="text-(--color-body)">
              {result.created.length} added.
            </p>
          ) : null}
          {result.duplicates.map((duplicate) => (
            <p key={duplicate.slug} className="text-(--color-dim)">
              {/* [COPY — draft] */}
              {duplicate.host} is already in the library.
            </p>
          ))}
          {result.failed.map((failure) => (
            <p key={failure.line} className="text-(--color-dim)">
              {/* [COPY — draft] */}
              {failure.line} — {failure.reason}.
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
