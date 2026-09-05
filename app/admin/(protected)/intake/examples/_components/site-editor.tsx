"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExampleSiteDraft } from "@/lib/intake/example-packs";
import {
  nextDraftAction,
  saveSiteAction,
  setStatusAction,
} from "../_actions/examples";
import { FrameCheck } from "./frame-check";
import { MediaPanel } from "./media-panel";
import { SiteFields, type SiteFieldValues } from "./site-fields";

/**
 * One site, all of it, in the drawer over the list.
 *
 * No tabs and no wizard: the judgements are made together, from one look at one
 * screenshot, so media sits above the fields and everything is on one scroll.
 *
 * **Explicit save, not autosave.** Publishing is a deliberate act evaluated
 * against a settled row, and an eleven-field form autosaving per keystroke
 * makes "is this live?" unanswerable. The cost is a save someone can forget, so
 * the button carries unsaved state, ⌘S saves, and leaving with unsaved changes
 * warns.
 *
 * **`Save and next draft`** is the throughput affordance for a
 * hundred-and-ten-site job: after tagging a site the next act is always the
 * next draft.
 */
export function SiteEditor({ site }: { site: ExampleSiteDraft }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [values, setValues] = useState<SiteFieldValues>({
    name: site.name,
    role: site.role,
    url: site.url,
    group: site.group,
    ground: site.ground,
    motion: site.motion,
    density: site.density,
    build: site.build,
    styles: site.styles,
    embed: site.embed,
    checkedOn: site.checkedOn,
    packs: site.packs,
  });

  const [dirty, setDirty] = useState(false);
  const set = <K extends keyof SiteFieldValues>(
    key: K,
    value: SiteFieldValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  };

  const save = (then?: () => void) =>
    startTransition(async () => {
      const result = await saveSiteAction({ slug: site.slug, ...values });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setDirty(false);
      router.refresh();
      then?.();
    });

  // At forty sites in a sitting, reaching for the mouse to commit work is the
  // friction worth removing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        if (dirty) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Tagging work is the expensive thing here. Losing it to a stray navigation
  // is the worst moment this screen has.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const canPublish = site.blockers.length === 0 && !dirty;

  const move = (status: "draft" | "published" | "archived") =>
    startTransition(async () => {
      const result = await setStatusAction(site.slug, status);
      setMessage(result.ok ? null : result.message);
      if (result.ok) router.refresh();
    });

  return (
    <div className="flex flex-col gap-8">
      <MediaPanel slug={site.slug} captures={site.captures} compact />

      {/* A note, never a blocker — a GIF of a hover state is not 1512 × 982. */}
      {site.notes.length > 0 ? (
        <p className="max-w-[60ch] text-sm text-(--color-dim)">
          {site.notes.join(" ")}
        </p>
      ) : null}

      <FrameCheck
        url={values.url}
        name={values.name}
        embed={values.embed}
        onEmbedChange={(next) => set("embed", next)}
      />

      <SiteFields
        values={values}
        onChange={set}
        slug={site.slug}
        slugLocked={site.slugLocked}
      />

      <footer className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-(--color-faint) bg-(--color-ground-a) px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => save()}
            disabled={pending || !dirty}
            className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) disabled:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
          >
            {pending ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={() =>
              save(async () => {
                const next = await nextDraftAction(site.slug);
                if (next.ok && next.data) {
                  router.push(`?site=${next.data}`, { scroll: false });
                }
              })
            }
            className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-4 text-sm text-(--color-body) hover:bg-(--color-card-hover)"
          >
            {/* [COPY — draft] */}
            Save and next draft
          </button>

          <span className="ml-auto flex items-center gap-3">
            {site.status === "published" ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => move("draft")}
                className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-4 text-sm text-(--color-body) hover:bg-(--color-card-hover)"
              >
                Unpublish
              </button>
            ) : (
              /*
                `aria-disabled`, not `disabled`: a disabled button is skipped by
                the tab order, so a screen reader would never reach the control
                or the line naming what is missing.
              */
              <button
                type="button"
                aria-disabled={!canPublish}
                aria-describedby={canPublish ? undefined : "publish-blockers"}
                onClick={() => {
                  if (!canPublish) {
                    setMessage(
                      dirty
                        ? "Save your changes first."
                        : "There are still a few things missing — see below.",
                    );
                    return;
                  }
                  move("published");
                }}
                className={`min-h-[44px] rounded-(--radius) border px-4 text-sm hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
                  canPublish
                    ? "border-(--color-line-strong) text-(--color-ink)"
                    : "border-(--color-line-soft) text-(--color-dim)"
                }`}
              >
                Publish
              </button>
            )}
          </span>
        </div>

        {site.status !== "published" && site.blockers.length > 0 ? (
          <p
            id="publish-blockers"
            className="max-w-[70ch] text-sm text-(--color-dim)"
          >
            {/* [COPY — draft] */}
            Not yet — {site.blockers.join(", and ")}.
          </p>
        ) : null}

        {message ? (
          <p className="max-w-[70ch] text-sm text-(--color-body)">{message}</p>
        ) : null}
      </footer>
    </div>
  );
}
