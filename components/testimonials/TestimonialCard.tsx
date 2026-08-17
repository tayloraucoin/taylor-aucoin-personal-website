"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Testimonial } from "@/content/testimonials";

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
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius) border border-(--color-faint) bg-[rgb(9_12_34/.62)] font-mono text-[10px] tracking-[.08em] text-(--color-dim)"
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
              <p key={i}>{i === 0 ? <>“{p}</> : p}{i === t.full.length - 1 && "”"}</p>
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
                <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[.18em] text-[rgb(232_185_97/.55)]">
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
