"use client";

import { useState } from "react";
import { htmlToMarkdown, type MarkdownMeta } from "./to-markdown";

/**
 * Downloads the document on screen as a Markdown file.
 *
 * **It reads the rendered document rather than rebuilding it.** The button
 * takes the container's own HTML and converts it, so the file cannot disagree
 * with what is on the page, and the page cannot disagree with what a client
 * reads — the fidelity chain that D-ADM-6 protects stays unbroken end to end.
 * A generator that walked the step registry instead would be the second home
 * for question copy this whole surface exists to avoid.
 *
 * Renders only in document mode: there is nothing to export from a screen of
 * form controls, and a button that produced an empty file would be worse than
 * no button.
 *
 * The conversion itself lives in `to-markdown.ts` as a pure function of an HTML
 * string, which is what makes it testable against a real render rather than
 * trusted (see that file's header).
 */
export function DownloadMarkdown({
  containerId,
  filename,
  meta,
}: Readonly<{
  /** The element whose rendered document becomes the file. */
  containerId: string;
  filename: string;
  meta: MarkdownMeta;
}>) {
  const [state, setState] = useState<"idle" | "done" | "empty">("idle");

  function download() {
    const container = document.getElementById(containerId);

    // Defensive rather than expected: the container is rendered by the same
    // page. If it is ever absent, say so instead of saving an empty file.
    if (!container) {
      setState("empty");
      return;
    }

    const markdown = htmlToMarkdown(container.innerHTML, meta);
    const url = URL.createObjectURL(
      new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoking immediately can cancel the save in some browsers; a tick is
    // enough and the object is small.
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setState("done");
    setTimeout(() => setState("idle"), 4000);
  }

  return (
    <div>
      <p className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        Export
      </p>
      <div className="mt-1.5 flex items-center gap-3">
        <button
          type="button"
          onClick={download}
          className="flex min-h-9 items-center rounded-(--radius) border border-(--color-faint) px-3 text-sm text-(--color-body) transition-colors hover:border-[rgb(232_185_97/.42)] hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          Download Markdown
        </button>

        {/* Dim, never gold: saving a file is not an achievement and a failure
            here is not the reader's mistake. */}
        <span
          aria-live="polite"
          className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
        >
          {state === "done"
            ? `Saved ${filename}`
            : state === "empty"
              ? "Nothing to export — reload the page"
              : ""}
        </span>
      </div>
    </div>
  );
}
