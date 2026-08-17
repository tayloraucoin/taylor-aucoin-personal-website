import type { Metadata } from "next";
import Image from "next/image";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import SectionLabel from "@/components/ui/SectionLabel";
import { GradientButton } from "@/components/ui/GradientButton";
import { closingLine, howIThink, story, vancouver } from "@/content/about";
import { availability } from "@/content/services";
import { BOOKING_URL, PHOTO, SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

const description =
  "Systems designer from a bio-med background. Twelve products from zero to one, fourteen BCIT cohorts mentored, based in Vancouver. The person behind the work.";

export const metadata: Metadata = {
  title: "About",
  description,
  ...socialCard({
    title: `About — ${SITE.name}`,
    description,
  }),
};

/**
 * ABT-02 — one screen, plain, dry. Story → how I think (hairline rows, the
 * How-I-Work idiom) → Vancouver/off-hours → the sentence to remember → CTA.
 * The photo stays small on purpose (Taylor's call) — do not scale it up.
 */
export default function AboutPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      <RootField />

      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>{SITE.location} · The person behind the work</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      <div className="mb-8 flex items-center gap-5">
        {PHOTO && (
          <Image
            src={PHOTO}
            alt={SITE.name}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-(--radius) object-cover"
          />
        )}
        <h1 className="font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
          About
        </h1>
      </div>

      <div className="max-w-[62ch] space-y-5">
        {story.map((p, i) => (
          <p
            key={i}
            className="text-base font-light leading-[1.66] text-(--color-body)"
          >
            {p}
          </p>
        ))}
      </div>

      <section className="mt-16">
        <SectionLabel>How I think</SectionLabel>
        <div className="mt-2">
          {howIThink.map((item) => (
            <div
              key={item.lead}
              className="grid grid-cols-1 gap-x-8 gap-y-1.5 border-b border-(--color-faint) py-5 md:grid-cols-[240px_1fr] md:items-baseline"
            >
              <span className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
                {item.lead}
              </span>
              <p className="max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionLabel>Here</SectionLabel>
        <p className="mt-6 max-w-[62ch] text-base font-light leading-[1.66] text-(--color-body)">
          {vancouver}
        </p>
      </section>

      <section className="mt-16 border-t border-(--color-faint) pt-12">
        <p className="mb-4 max-w-[52ch] font-display text-[clamp(20px,2.6vw,28px)] font-medium leading-[1.3] tracking-[-.02em] text-(--color-ink)">
          {closingLine}
        </p>
        <p className="mb-7 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
          <span className="text-(--color-c2)">Available now</span>
          {" — "}
          {availability}
        </p>
        <GradientButton href={BOOKING_URL}>Book a 30-min call →</GradientButton>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
          Not ready to book?{" "}
          <a
            href={`mailto:${SITE.email}`}
            className="text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
          >
            {SITE.email}
          </a>
        </p>
      </section>

      <Footer />
    </main>
  );
}
