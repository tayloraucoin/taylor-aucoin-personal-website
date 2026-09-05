"use client";

import { useState, useTransition } from "react";
import type { ExamplePack } from "@/lib/intake/example-packs";
import { setPackShownAction } from "../_actions/examples";

/**
 * The only control that can put a gallery in front of a client (D-PORT-21).
 *
 * Separate from per-site publish on purpose. "At least one published site
 * counts as curated" means publishing the first site puts a **one-site
 * gallery** in front of somebody, on a step whose own curation guidance asks
 * for twelve to twenty-four spread across the groups. Two judgements, two
 * moments, neither able to trigger the other by accident.
 *
 * The consequence is stated beside the switch in the client's own terms, both
 * ways round, because "what happens if I flick this" should never require
 * flicking it.
 */
export function PackSwitch({
  pack,
  shown,
  publishedCount,
  label,
  absentLine,
}: {
  pack: ExamplePack;
  shown: boolean;
  publishedCount: number;
  label: string;
  absentLine: string;
}) {
  const [on, setOn] = useState(shown);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    setMessage(null);

    startTransition(async () => {
      const result = await setPackShownAction(pack, next);
      if (!result.ok) {
        setOn(!next);
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={toggle}
        role="switch"
        aria-checked={on}
        aria-busy={pending}
        className="flex min-h-[44px] w-fit items-center gap-3 rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-ink) hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        <span
          aria-hidden
          className={`h-4 w-8 rounded-full border transition-colors ${
            on
              ? "border-(--color-c2) bg-(--color-c2)"
              : "border-(--color-line-strong) bg-(--color-well)"
          }`}
        >
          <span
            className={`block h-3 w-3 translate-y-px rounded-full transition-transform ${
              on
                ? "translate-x-4 bg-(--color-ground-a)"
                : "translate-x-px bg-(--color-dim)"
            }`}
          />
        </span>
        {/* [COPY — draft] */}
        Show this gallery to clients
      </button>

      <p className="max-w-[60ch] text-sm text-(--color-dim)">
        {/* [COPY — draft] — both consequences, in the client's own words. */}
        {on && publishedCount > 0
          ? `Clients who get the ${label} set see these ${publishedCount} sites.`
          : on
            ? `Nothing is published yet, so clients still read: “${absentLine}”`
            : `Clients read: “${absentLine}”`}
      </p>

      {message ? (
        <p className="text-sm text-(--color-body)">{message}</p>
      ) : null}
    </div>
  );
}
