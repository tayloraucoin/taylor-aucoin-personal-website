"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Portrait } from "@/components/testimonials/Portrait";
import { TestimonialQuoteCard } from "@/components/testimonials/TestimonialCard";
import { buttonVariants } from "@/components/ui/Button";
import type { Testimonial } from "@/content/testimonials";

export type HomeCard = { t: Testimonial; span?: string };

/** A drawn dialog state to open on (canon C-P08): whose quote, which focus. */
export type DialogSeed = { index: number; focus?: "next" };

type Phase = "closed" | "entering" | "open" | "closing";

const FOCUSABLE = "button, [tabindex='0']";

/**
 * Home's four cards and the dialog each one opens (feedback round 2): the
 * full quote with a count, Previous and Next that wrap, arrow keys to cycle,
 * Esc or the scrim to close, focus trapped and returned to the card. A 200ms
 * opacity fade in and 160ms out, nothing else; opened by keyboard, or under
 * reduced motion, it appears at once. Cycling swaps in place.
 */
export function TestimonialCards({
  cards,
  seed,
}: {
  cards: HomeCard[];
  seed?: DialogSeed;
}) {
  const n = cards.length;
  const id = useId();
  const [index, setIndex] = useState<number | null>(seed?.index ?? null);
  const [phase, setPhase] = useState<Phase>(seed ? "open" : "closed");
  const [instant, setInstant] = useState(Boolean(seed));
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const seedFocus = useRef(seed?.focus);

  const open = (i: number, keyboard: boolean) => {
    opener.current = cardRefs.current[i];
    setIndex(i);
    setInstant(keyboard);
    setPhase(keyboard ? "open" : "entering");
  };

  const close = useCallback(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setPhase(instant || reduce ? "closed" : "closing");
  }, [instant]);

  const cycle = (step: 1 | -1) =>
    setIndex((i) => (i === null ? i : (i + step + n) % n));

  // Paint the first frame at opacity 0, then fade in.
  useEffect(() => {
    if (phase !== "entering") return;
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setPhase("open")),
    );
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timer = window.setTimeout(() => setPhase("closed"), 160);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const isOpen = phase !== "closed" && index !== null;

  // Focus starts on Close (a drawn state may start on Next); on close it
  // returns to the card that opened the dialog, or the shown person's card.
  useEffect(() => {
    if (!isOpen) return;
    (seedFocus.current === "next" ? nextRef : closeRef).current?.focus();
    seedFocus.current = undefined;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (phase !== "closed" || index === null) return;
    (opener.current ?? cardRefs.current[index])?.focus();
    opener.current = null;
    setIndex(null);
  }, [phase, index]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      cycle(e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key === "Tab") {
      const els = [
        ...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ];
      const first = els[0];
      const last = els.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const person = index === null ? null : cards[index].t;
  const prev = index === null ? null : cards[(index - 1 + n) % n].t;
  const next = index === null ? null : cards[(index + 1) % n].t;

  return (
    <>
      <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2 md:gap-8">
        {cards.map(({ t, span }, i) => (
          <TestimonialQuoteCard
            key={t.slug}
            t={t}
            span={span}
            onOpen={(keyboard) => open(i, keyboard)}
            buttonRef={(el) => {
              cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>
      {isOpen && person && prev && next && (
        <div
          data-dialog-phase={phase}
          onClick={close}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-(--color-carbon-900)/72 transition-opacity ease-(--ease-out) ${
            phase === "open" ? "opacity-100" : "opacity-0"
          } ${
            instant
              ? "duration-0"
              : phase === "closing"
                ? "duration-(--dur-exit)"
                : "duration-(--dur-fast)"
          }`}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            aria-labelledby={`${id}-name`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
            className="flex h-dvh w-full flex-col overflow-clip bg-(--color-card) outline-none md:h-auto md:max-h-[80dvh] md:w-[720px] md:rounded-(--radius) md:border md:border-(--color-line-soft)"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-(--color-line-soft) py-3 pr-3 pl-[22px] md:py-4 md:pr-4 md:pl-8">
              <p
                aria-live="polite"
                className="text-(length:--text-meta) leading-5 text-(--color-dim)"
              >
                {index! + 1} of {n}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className={`${buttonVariants({ variant: "ghost", size: "small" })} gap-2`}
              >
                <svg
                  aria-hidden
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="stroke-(--color-ink)"
                >
                  <path
                    d="M2 2l8 8M10 2l-8 8"
                    strokeWidth="1.25"
                    strokeLinecap="square"
                  />
                </svg>
                Close
              </button>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-labelledby={`${id}-name`}
              className="flex min-h-0 flex-auto flex-col gap-6 overflow-y-auto px-[22px] pt-6 pb-8 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--color-focus) md:gap-8 md:p-8"
            >
              <div className="flex items-center gap-4">
                <Portrait name={person.name} src={person.avatar} />
                <div className="flex flex-col gap-0.5">
                  <h2
                    id={`${id}-name`}
                    className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)"
                  >
                    {person.name}
                  </h2>
                  <p className="text-(length:--text-meta) leading-5 text-(--color-dim)">
                    {person.title}
                  </p>
                </div>
              </div>
              <blockquote className="flex max-w-[600px] flex-col gap-4 text-(length:--text-body) leading-[27px] text-(--color-ink) md:text-[20px] md:leading-[1.55]">
                {person.full.map((p, i) => (
                  <p key={i}>
                    {i === 0 && "“"}
                    {p}
                    {i === person.full.length - 1 && "”"}
                  </p>
                ))}
              </blockquote>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-(--color-line-soft) bg-(--color-card) px-[22px] pt-3 pb-7 md:p-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => cycle(-1)}
                  className={`${buttonVariants({ variant: "ghost" })} gap-2 pr-5! pl-4!`}
                >
                  <span aria-hidden className="text-(--color-mark)">
                    ←
                  </span>
                  Previous
                </button>
                <span className="text-(length:--text-meta) leading-5 text-(--color-dim) max-md:hidden">
                  {prev.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-(length:--text-meta) leading-5 text-(--color-dim) max-md:hidden">
                  {next.name}
                </span>
                <button
                  ref={nextRef}
                  type="button"
                  onClick={() => cycle(1)}
                  className={`${buttonVariants({ variant: "ghost" })} gap-2 pr-4! pl-5!`}
                >
                  Next
                  <span aria-hidden className="text-(--color-mark)">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
