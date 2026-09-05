"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { setStatusBulkAction } from "../_actions/examples";
import { tagsFor } from "@/content/intake-examples/taxonomy";
import type { ExampleSiteDraft } from "@/lib/intake/example-packs";
import { packLabel } from "./pack-words";
import { RowMenu } from "./row-menu";

/**
 * The sites, as rows you can act on.
 *
 * A table rather than a stack of sectioned links, because at a hundred and ten
 * rows the questions are "which ones still need tagging", "what have I got in
 * warm", and "publish these six" — and none of them can be answered by
 * scrolling. Search and the status filter are the whole of it; nothing here
 * sorts, because creation order is the order and reordering is deferred.
 *
 * Status is a column again rather than a section heading. Sectioning was the
 * right call when the only thing you could do was read; with a filter and a
 * per-row menu, one flat list you can narrow beats three you have to scroll
 * past.
 */
export function SiteTable({ sites }: { sites: ExampleSiteDraft[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published" | "archived">(
    "all",
  );

  const counts = useMemo(
    () => ({
      all: sites.filter((site) => site.status !== "archived").length,
      draft: sites.filter((site) => site.status === "draft").length,
      published: sites.filter((site) => site.status === "published").length,
      archived: sites.filter((site) => site.status === "archived").length,
    }),
    [sites],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sites
      // Archived is out of the way unless asked for: it is the one status you
      // are not working on.
      .filter((site) =>
        status === "all" ? site.status !== "archived" : site.status === status,
      )
      .filter((site) =>
        needle
          ? [site.name, site.host, site.role, site.slug, site.group ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(needle)
          : true,
      );
  }, [sites, query, status]);

  const filters = [
    ["all", "Everything"],
    ["draft", "Drafts"],
    ["published", "Published"],
    ["archived", "Archived"],
  ] as const;

  /**
   * Select mode, off by default.
   *
   * Off by default because the ordinary use of this table is reading it, and a
   * checkbox in front of every row taxes that to make one occasional job
   * cheaper. Turning it on is one press and it says what it is.
   */
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [report, setReport] = useState<{
    changed: number;
    refused: { slug: string; why: string }[];
  } | null>(null);

  /**
   * "All" means every row you can currently see, not every row that exists.
   *
   * Filter to drafts, search "cinemat", press Select all, publish: that is the
   * whole point, and a control that quietly reached past the filter into rows
   * off screen would be the opposite of one.
   */
  const visible = rows.map((site) => site.slug);
  const allVisiblePicked =
    visible.length > 0 && visible.every((slug) => picked.has(slug));

  /** Picked, but filtered out of view — the count line names these. */
  const hiddenPicked = [...picked].filter(
    (slug) => !visible.includes(slug),
  ).length;

  const toggle = (slug: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const leaveSelectMode = () => {
    setSelecting(false);
    setPicked(new Set());
  };

  const apply = (status: "published" | "draft" | "archived") => {
    const slugs = [...picked];
    if (slugs.length === 0) return;

    setReport(null);
    startTransition(async () => {
      const outcome = await setStatusBulkAction(slugs, status);
      if (!outcome.ok) {
        setReport({ changed: 0, refused: [{ slug: "", why: outcome.message }] });
        return;
      }
      setReport(outcome.data);
      // Anything that went through has left the selection's reason for
      // existing; anything refused stays ticked so it can be fixed and retried.
      setPicked(new Set(outcome.data.refused.map((r) => r.slug)));
      router.refresh();
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, host, role, group"
          aria-label="Search sites"
          className="min-h-[44px] min-w-[16rem] flex-1 rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={status === key}
              onClick={() => setStatus(key)}
              className={`min-h-[44px] rounded-(--radius) border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
                status === key
                  ? "border-(--color-line-strong) bg-(--color-tint) text-(--color-ink)"
                  : "border-(--color-line) text-(--color-body) hover:bg-(--color-card-hover)"
              }`}
            >
              {label}
              <span className="ml-2 font-(family-name:--font-mono) text-xs text-(--color-dim)">
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* [COPY — draft] — every string in this block. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={selecting}
          onClick={() => (selecting ? leaveSelectMode() : setSelecting(true))}
          className={`min-h-[44px] rounded-(--radius) border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
            selecting
              ? "border-(--color-line-strong) bg-(--color-tint) text-(--color-ink)"
              : "border-(--color-line) text-(--color-body) hover:bg-(--color-card-hover)"
          }`}
        >
          {selecting ? "Done selecting" : "Select"}
        </button>

        {selecting ? (
          <>
            <button
              type="button"
              onClick={() =>
                setPicked((current) => {
                  const next = new Set(current);
                  if (allVisiblePicked) for (const slug of visible) next.delete(slug);
                  else for (const slug of visible) next.add(slug);
                  return next;
                })
              }
              className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-body) hover:bg-(--color-card-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
            >
              {allVisiblePicked
                ? `Unselect these ${visible.length}`
                : `Select these ${visible.length}`}
            </button>

            {/* A selection survives a filter change, so it can hold rows that
                are no longer on screen — and the next press would act on them.
                Saying how many are hidden is the difference between that being
                a feature and being a surprise. */}
            <span aria-live="polite" className="text-sm text-(--color-dim)">
              {picked.size === 0
                ? "Nothing selected"
                : `${picked.size} selected`}
              {hiddenPicked > 0
                ? ` · ${hiddenPicked} not shown by this filter`
                : ""}
            </span>

            <span className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                disabled={picked.size === 0 || pending}
                onClick={() => apply("published")}
                className="min-h-[44px] rounded-(--radius) border border-(--color-ghost-line) px-3 text-sm text-(--color-c2) hover:border-(--color-ghost-line-hover) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                {pending ? "Working…" : `Publish ${picked.size || ""}`.trim()}
              </button>
              <button
                type="button"
                disabled={picked.size === 0 || pending}
                onClick={() => apply("draft")}
                className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-body) hover:bg-(--color-card-hover) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Back to draft
              </button>
              <button
                type="button"
                disabled={picked.size === 0 || pending}
                onClick={() => apply("archived")}
                className="min-h-[44px] rounded-(--radius) border border-(--color-line) px-3 text-sm text-(--color-body) hover:bg-(--color-card-hover) disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Archive
              </button>
            </span>
          </>
        ) : null}
      </div>

      {/* Partial success is the expected outcome, so the report carries both
          halves: what went through, and what did not and why. */}
      {report ? (
        <div
          aria-live="polite"
          className="rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 py-3 text-sm"
        >
          <p className="text-(--color-ink)">
            {report.changed > 0
              ? `${report.changed} updated.`
              : "Nothing was updated."}
            {report.refused.length > 0
              ? ` ${report.refused.length} left as ${report.refused.length === 1 ? "it was" : "they were"}:`
              : ""}
          </p>
          {report.refused.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {report.refused.map((row) => (
                <li key={row.slug || row.why} className="text-(--color-body)">
                  <span className="text-(--color-dim)">{row.slug}</span>{" "}
                  {row.why}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-(--color-dim)">
          {/* [COPY — draft] */}
          {sites.length === 0
            ? "No sites yet."
            : "Nothing matches that."}
        </p>
      ) : (
        <ul className="flex flex-col border-t border-(--color-faint)">
          {rows.map((site) => (
            <li
              key={site.id}
              className="flex items-center gap-4 border-b border-(--color-faint) border-l-2 border-l-transparent px-3 py-3 hover:border-l-(--color-c2) hover:bg-(--color-tint)/60"
            >
              {selecting ? (
                <label className="flex min-h-[44px] shrink-0 cursor-pointer items-center pl-1 pr-1">
                  <input
                    type="checkbox"
                    checked={picked.has(site.slug)}
                    onChange={() => toggle(site.slug)}
                    className="h-4 w-4 accent-(--color-c2)"
                  />
                  <span className="sr-only">
                    Select {site.name || site.slug}
                  </span>
                </label>
              ) : null}

              <button
                type="button"
                onClick={() => router.push(`?site=${site.slug}`, { scroll: false })}
                className="flex flex-1 items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                <Thumb site={site} />

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-sm text-(--color-ink)">
                      {site.name || site.slug}
                    </span>
                    <span className="text-xs text-(--color-dim)">
                      {site.host}
                    </span>
                  </span>

                  {site.role ? (
                    <span className="truncate text-xs text-(--color-body)">
                      {site.role}
                    </span>
                  ) : null}

                  {tagLine(site) ? (
                    <span className="font-(family-name:--font-mono) text-[9px] tracking-[.24em] text-(--color-dim) uppercase">
                      {tagLine(site)}
                    </span>
                  ) : (
                    <span className="text-xs text-(--color-dim)">
                      {/* [COPY — draft] */}
                      Not tagged yet
                    </span>
                  )}
                </span>

                <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="flex gap-1">
                    {site.packs.map((pack) => (
                      <span
                        key={pack}
                        className="rounded-(--radius) border border-(--color-line) px-1.5 py-0.5 text-xs text-(--color-dim)"
                      >
                        {packLabel(pack)}
                      </span>
                    ))}
                  </span>
                  <span
                    className={`text-xs ${
                      site.status === "published"
                        ? "text-(--color-c2)"
                        : "text-(--color-dim)"
                    }`}
                  >
                    {site.status}
                  </span>
                </span>
              </button>

              <RowMenu site={site} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Thumb({ site }: { site: ExampleSiteDraft }) {
  const hero = site.captures[0];

  if (!hero || hero.isVideo) {
    return (
      <span className="flex h-[62px] w-[96px] shrink-0 items-center justify-center rounded-(--radius) border border-(--color-line) bg-(--color-well) text-center font-(family-name:--font-mono) text-[9px] tracking-[.24em] text-(--color-dim) uppercase">
        {hero ? "Video" : "No media"}
      </span>
    );
  }

  return (
    <Image
      src={hero.src}
      alt=""
      width={96}
      height={62}
      unoptimized={hero.mimeType === "image/gif"}
      className="h-[62px] w-[96px] shrink-0 rounded-(--radius) border border-(--color-line) bg-(--color-well) object-cover"
    />
  );
}

/** A half-tagged draft has no tags; "undefined · undefined" is worse than none. */
function tagLine(site: ExampleSiteDraft): string | null {
  if (!site.group || !site.ground || !site.motion || !site.density) return null;

  return tagsFor({
    key: site.slug,
    name: site.name,
    url: site.url,
    role: site.role,
    group: site.group as never,
    axes: {
      ground: site.ground as never,
      motion: site.motion as never,
      density: site.density as never,
    },
    styles: site.styles as never,
    build: site.build as never,
    embed: site.embed,
    checkedOn: site.checkedOn,
    captures: [],
  })
    .filter(Boolean)
    .join(" · ");
}
