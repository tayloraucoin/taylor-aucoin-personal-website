"use client";

import { useIsDocument } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import { DocHint, DocTag } from "../../../intake/_components/document";
import { TextField } from "../../../intake/_components/text-field";

/**
 * Pages the checklist does not name, as rows rather than as a box.
 *
 * This replaced "Something else?", a single text field beside a checklist. The
 * mismatch was the problem: everything the client had already told us about
 * their sitemap was a tick, and then the last part of the same answer had to be
 * prose. A page they typed there did not count toward the running total, did
 * not read as chosen, and could not be removed without editing a sentence
 * (Taylor, 2026-09-04).
 *
 * So a typed page is a page. **Adding a row is selecting it** — there is no
 * separate tick, because a row nobody wanted is a row they remove. That is the
 * same rule the taste step's found sites run on, and it is why the X is the
 * only control here.
 *
 * Rows are addressed by index rather than by a minted key: the value is a plain
 * list of strings, and a page's identity is its position in a short list the
 * client can see all of.
 */

/** [COPY — pending Taylor] */
const COPY = {
  add: "Add a page",
  placeholder: "A page for the workshop",
  remove: "Remove",
  hint: "Anything the list above does not cover.",
};

export function CustomPages({
  pages,
  onChange,
  onBlur,
}: Readonly<{
  pages: readonly string[];
  onChange: (next: string[]) => void;
  onBlur: () => void;
}>) {
  const isDocument = useIsDocument();

  if (isDocument) {
    return (
      <>
        <DocTag>Repeatable · &ldquo;{COPY.add}&rdquo;</DocTag>
        <DocHint>{COPY.hint}</DocHint>
      </>
    );
  }

  return (
    <div>
      {pages.length > 0 ? (
        <ul className="mb-3 flex flex-col gap-2">
          {pages.map((page, index) => (
            <li key={index} className="flex items-center gap-3">
              {/* The same gold dot the checklist's chosen rows carry, because
                  this row is chosen for the same reason and by the same act. */}
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full bg-(--color-c2)"
              />

              <TextField
                id={`f-pagesCustom-${index}`}
                aria-label={`Page ${index + 1}`}
                value={page}
                placeholder={COPY.placeholder}
                onChange={(event) => {
                  const next = [...pages];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                onBlur={onBlur}
              />

              <button
                type="button"
                onClick={() => {
                  onChange(pages.filter((_, i) => i !== index));
                  onBlur();
                }}
                aria-label={`${COPY.remove} page ${index + 1}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-(--radius) text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                <span aria-hidden className="font-mono text-[13px]">
                  ✕
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <GhostButton onClick={() => onChange([...pages, ""])}>
        {COPY.add}
      </GhostButton>
    </div>
  );
}
