import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { problems } from "@/content/services";

/**
 * SVC-05. Six problem statements in the client's voice, each mapped to an
 * offer. Flat spec-bg cards (the Specialties idiom) — static content, so no
 * ring, no hover, and it never gates the field's cursor-glow.
 */
export default function ProblemGrid() {
  return (
    <section className="mt-16">
      <SectionLabel>Sounds like you?</SectionLabel>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((p) => (
          <div
            key={p.quote}
            className="flex flex-col rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5"
          >
            <p className="max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-(--color-ink)">
              “{p.quote}”
            </p>
            <p className="mt-3.5 pt-0 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              → {p.offer}
            </p>
          </div>
        ))}
      </div>
      {/* Same idiom as the home page's "Full stack →" line. */}
      <p className="mt-5 font-mono text-[11px] uppercase leading-[2] tracking-[.18em] text-(--color-body) md:text-[10px] md:text-(--color-dim)">
        Problems I comfortably take on, with the approach and where each was done ·{" "}
        <Link
          href="/capabilities"
          className="whitespace-nowrap text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          Capabilities →
        </Link>
      </p>
    </section>
  );
}
