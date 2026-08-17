import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import ClosingCta from "@/components/services/ClosingCta";
import TestimonialTabs from "@/components/testimonials/TestimonialTabs";
import { visibleTestimonials } from "@/content/testimonials";
import { SITE } from "@/lib/config";
import { socialCard } from "@/lib/metadata";

const description =
  "What it's like to work with Taylor Aucoin — from the people who hired him, and the engineers who shipped under him. LinkedIn recommendations, in full.";

export const metadata: Metadata = {
  title: "Testimonials",
  description,
  // Nothing links here while no quote is approved (the strip renders null, and
  // its "All testimonials →" link with it). Keep the empty page out of the
  // index until there is something on it. Drops automatically on first approval.
  robots: visibleTestimonials().length === 0 ? { index: false, follow: true } : undefined,
  ...socialCard({
    title: `Testimonials — ${SITE.name}`,
    description,
  }),
};

export default function TestimonialsPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      {/* The field runs the full page height, same as home. */}
      <RootField />

      <div className="mb-6 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
        <span>{SITE.location} · Working with me</span>
        <span
          aria-hidden
          className="h-px max-w-[220px] flex-1"
          style={{
            background:
              "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
          }}
        />
      </div>

      <h1 className="mb-8 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        Testimonials
      </h1>

      <TestimonialTabs />
      <ClosingCta />
      <Footer />
    </main>
  );
}
