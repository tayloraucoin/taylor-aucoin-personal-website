"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExamplePack } from "@/lib/intake/example-packs";
import { createSiteAction } from "../_actions/examples";
import { PasteUrls } from "./paste-urls";
import {
  emptySiteFields,
  SiteFields,
  type SiteFieldValues,
} from "./site-fields";

/**
 * Adding a site — the ordinary way, and the bulk way.
 *
 * The ordinary way is the default and it is a real form: name, role, link, and
 * every judgement, submitted once. The first cut of this surface had only the
 * bulk path, so the *only* way to add a site was to paste a bare URL and then
 * go and find the row it made. That is a queue, not a CRUD surface.
 *
 * The bulk path is still here because it is genuinely good at the thing it was
 * built for — a hundred and ten links from a research library, landing as
 * drafts to work down — it is just no longer the door.
 *
 * Media is added after the row exists, because media attaches to a row. The
 * form closes by opening the new site, so the next thing on screen is its
 * media panel.
 */
export function AddSite({ pack }: { pack: string }) {
  const router = useRouter();
  const [open, setOpen] = useState<"one" | "many" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const initialPacks = (pack === "all" ? [] : [pack]) as ExamplePack[];
  const [values, setValues] = useState<SiteFieldValues>(
    emptySiteFields(initialPacks),
  );

  const set = <K extends keyof SiteFieldValues>(
    key: K,
    value: SiteFieldValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await createSiteAction(values);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setValues(emptySiteFields(initialPacks));
      setOpen(null);
      // Straight into the new row, where its media panel is.
      router.push(`?site=${result.data}`, { scroll: false });
      router.refresh();
    });
  }

  if (open === null) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen("one")}
          className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          {/* [COPY — draft] */}
          Add a site
        </button>
        <button
          type="button"
          onClick={() => setOpen("many")}
          className="min-h-[44px] px-2 text-sm text-(--color-dim) underline underline-offset-4 hover:text-(--color-ink)"
        >
          {/* [COPY — draft] */}
          Paste a list of URLs
        </button>
      </div>
    );
  }

  if (open === "many") {
    return (
      <div className="flex flex-col gap-3">
        <PasteUrls pack={pack} />
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="w-fit text-sm text-(--color-dim) underline underline-offset-4 hover:text-(--color-ink)"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 rounded-(--radius) border border-(--color-line) bg-(--color-card) p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          {/* [COPY — draft] */}
          Add a site
        </h2>
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="text-sm text-(--color-dim) hover:text-(--color-ink)"
        >
          Cancel
        </button>
      </div>

      <SiteFields values={values} onChange={set} />

      <div className="flex flex-wrap items-center gap-3 border-t border-(--color-faint) pt-4">
        <button
          type="button"
          onClick={submit}
          disabled={pending || !values.url.trim()}
          className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) disabled:text-(--color-dim)"
        >
          {/* [COPY — draft] */}
          {pending ? "Adding…" : "Add site"}
        </button>
        <span className="text-sm text-(--color-dim)">
          {/* [COPY — draft] */}
          It lands as a draft. You&apos;ll add its media next.
        </span>
      </div>

      {message ? (
        <p className="text-sm text-(--color-body)">{message}</p>
      ) : null}
    </section>
  );
}
