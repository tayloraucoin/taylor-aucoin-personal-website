import type { ReactNode } from "react";
import Link from "next/link";
import GradientRing from "@/components/ui/GradientRing";
import { CORE_STACK } from "@/lib/config";

const BCIT_ISSP_URL =
  "https://www.bcit.ca/computing-academic-studies/industry-sponsored-student-projects/";

const inlineLinkClass =
  "text-(--color-c2) underline decoration-(--color-faint) underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-c3) hover:decoration-(--color-c2)";

const cards: Array<{ tag: string; title: string; body: ReactNode }> = [
  {
    tag: "01 / Architecture",
    title: "Systems, end to end",
    body: "Turborepo monorepos, typed contracts from Postgres to the pixel, and infrastructure a team of one can actually operate. State handled deliberately at every layer — component to cache to read replica.",
  },
  {
    tag: "02 / Product",
    title: "Judgment, not tickets",
    body: "I'm a product engineer — I've been the founder and the first engineer. Every build starts as a UX problem and ends as a business outcome; the code exists to serve that order. I know which corners are load-bearing and which ones are decoration.",
  },
  {
    tag: "03 / Leadership",
    title: "Twenty juniors, four teams",
    body: (
      <>
        Fourteen cohorts through{" "}
        <a
          href={BCIT_ISSP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={inlineLinkClass}
        >
          BCIT&apos;s industry-sponsored projects program
        </a>{" "}
        over five years — at peak, four concurrent teams and over twenty junior
        developers shipping checkout systems, tax logic, search, and
        recommendation engines. Juniors ship when the work is scoped right. That
        scoping was mine.
      </>
    ),
  },
  {
    tag: "04 / Process",
    title: "Conventions that compound",
    body: "I learn a codebase's conventions, enforce them in review, and write them down — layered convention files and defined roles that let AI tooling generate at senior quality instead of plausible mediocrity. Fast because it's disciplined, not despite it.",
  },
];

export default function Capabilities() {
  return (
    <section className="mt-16">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <GradientRing key={c.tag} className="px-6 pb-6 pt-[26px]">
            <span className="mb-3.5 block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              {c.tag}
            </span>
            <h2 className="mb-2 font-display text-[18px] font-medium tracking-[-.012em] text-(--color-ink)">
              {c.title}
            </h2>
            <p className="max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {c.body}
            </p>
          </GradientRing>
        ))}
      </div>
      <p className="mt-5 font-mono text-[11px] uppercase leading-[2] tracking-[.18em] text-(--color-body) md:text-[10px] md:text-(--color-dim)">
        <span className="font-medium text-(--color-meta-label)">Core stack:</span>{" "}
        {CORE_STACK.join(" · ")} ·{" "}
        <Link
          href="/stack"
          className="whitespace-nowrap text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          Full stack →
        </Link>
      </p>
    </section>
  );
}
