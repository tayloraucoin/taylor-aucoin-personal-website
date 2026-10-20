"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Testimonial } from "@/content/testimonials";
import { Portrait } from "./Portrait";

/** Bespoke avatar — image when the asset exists, initials placeholder until
 *  then. Square at the site radius (3px), not a circle: sharp is the house
 *  geometry. */
function Avatar({ name, src }: { name: string; src?: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-(--radius) object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius) border border-(--color-faint) bg-(--color-card) font-mono text-[10px] tracking-[.08em] text-(--color-dim)"
    >
      {initials}
    </span>
  );
}

/**
 * TST-02 — one testimonial. Leads with the extracted quote; "Read more"
 * expands the full verbatim text in place (no animation — nothing to freeze
 * under prefers-reduced-motion). `detail` adds the /testimonials-page context:
 * relationship line, project tag, worked-on line.
 *
 * Pending entries (approved: false, visible only while the preview flag is
 * on) carry a dim chip so preview state is never ambiguous.
 */
export default function TestimonialCard({
  t,
  detail = false,
}: {
  t: Testimonial;
  detail?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  // The lead quote is a contiguous span of the full text; when expanded we
  // show the full text alone, never both.
  const hasMore = t.full.join(" ").length > t.quote.length + 10;

  return (
    <figure className="flex flex-col rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-6">
      {!t.approved && (
        <span className="mb-3 self-start rounded-(--radius) border border-(--color-faint) px-2 py-1 font-mono text-[8px] uppercase tracking-[.2em] text-(--color-dim)">
          Pending approval
        </span>
      )}

      <blockquote className="text-[15px] font-light leading-[1.6] text-(--color-ink)">
        {expanded ? (
          <div className="space-y-3">
            {t.full.map((p, i) => (
              <p key={i}>
                {i === 0 ? <>“{p}</> : p}
                {i === t.full.length - 1 && "”"}
              </p>
            ))}
          </div>
        ) : (
          <p>“{t.quote}”</p>
        )}
      </blockquote>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-3 self-start font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <figcaption className="mt-4 border-t border-(--color-faint) pt-4">
        <div className="flex items-center gap-3">
          <Avatar name={t.name} src={t.avatar} />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-body)">
              {t.name}
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[.18em] text-(--color-dim)">
              {t.title}
            </div>
          </div>
        </div>
        {detail && (
          <>
            <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[.18em] text-(--color-dim)">
              {t.relationshipLine}
            </div>
            {t.project &&
              (t.project.href ? (
                <Link
                  href={t.project.href}
                  className="mt-2.5 inline-block font-mono text-[9px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
                >
                  {t.project.label} →
                </Link>
              ) : (
                <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[.18em] text-(--color-proof-label)">
                  {t.project.label}
                </div>
              ))}
            {t.workedOn && (
              <div className="mt-2.5 max-w-[44ch] text-[12.5px] font-light leading-[1.6] text-(--color-body)">
                Worked on: {t.workedOn}
              </div>
            )}
          </>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Home's card (D-SITE-56, 62): one contiguous span of the recommendation,
 * the name and title under it, the round photo beside them. With `onOpen`
 * (feedback round 2) the whole card is a button, named for the person, that
 * opens the full testimonial; a small mark-coloured expand mark sits in its
 * corner. `span` defaults to the lead quote.
 */
export function TestimonialQuoteCard({
  t,
  span = t.quote,
  onOpen,
  buttonRef,
}: {
  t: Testimonial;
  span?: string;
  onOpen?: (keyboard: boolean) => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <figure
      className={`relative flex flex-col gap-6 rounded-(--radius) border border-(--color-line-soft) bg-(--color-card) p-6 md:p-8 ${
        onOpen
          ? "transition-colors duration-(--dur-fast) hover:border-(--color-line-strong) hover:bg-(--color-card-hover)"
          : ""
      }`}
    >
      <blockquote className="text-[20px] leading-[1.55] text-(--color-ink) md:max-w-[440px]">
        <p>“{span}”</p>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <Portrait name={t.name} src={t.avatar} />
        <div>
          <span className="block text-(length:--text-small) font-medium text-(--color-ink)">
            {t.name}
          </span>
          <span className="mt-0.5 block text-(length:--text-meta) text-(--color-dim)">
            {t.title}
          </span>
        </div>
      </figcaption>
      {onOpen && (
        <button
          ref={buttonRef}
          type="button"
          aria-label={`Read ${t.name}'s testimonial in full`}
          aria-haspopup="dialog"
          // A keyboard press arrives as a click with detail 0: it opens at
          // once (canon C-P11, A-15).
          onClick={(e) => onOpen(e.detail === 0)}
          className="absolute inset-0 cursor-pointer rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="absolute top-5 right-5 stroke-(--color-mark)"
          >
            <path
              d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"
              strokeWidth="1.25"
              strokeLinecap="square"
            />
          </svg>
        </button>
      )}
    </figure>
  );
}
